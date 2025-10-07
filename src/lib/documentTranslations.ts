import crypto from "node:crypto";

import { getPool, withPgClient } from "./db";
import { getServerEnv } from "./runtimeEnv";

type DocumentLike = {
  _id?: string;
  title?: string | null;
  description?: string | null;
  [key: string]: unknown;
};

type LocalizeDocumentsOptions = {
  targetLanguage: string;
  sourceLanguage?: string;
  fields?: string[];
};

type TranslationRecord = {
  translated_text: string;
  source_hash: string;
};

const DEFAULT_FIELDS = ["title", "description"];
type FieldDirective = {
  name: string;
  isArray: boolean;
};

function parseFieldDirective(field: string): FieldDirective {
  const isArray = field.endsWith("[]");
  const name = isArray ? field.slice(0, -2) : field;
  return { name, isArray };
}
const TRANSLATE_ENDPOINT =
  getServerEnv("YANDEX_TRANSLATE_API_URL") ??
  "https://translate.api.cloud.yandex.net/translate/v2/translate";

const YANDEX_API_KEY = getServerEnv("YANDEX_TRANSLATE_API_KEY");
const YANDEX_FOLDER_ID = getServerEnv("YANDEX_FOLDER_ID");

let ensureTablePromise: Promise<void> | null = null;

async function ensureDocumentTranslationsTable() {
  if (!getPool()) {
    return;
  }

  if (!ensureTablePromise) {
    ensureTablePromise = withPgClient(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_translations (
          document_id TEXT NOT NULL,
          field TEXT NOT NULL,
          language TEXT NOT NULL,
          source_language TEXT,
          source_text TEXT NOT NULL,
          source_hash TEXT NOT NULL,
          translated_text TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (document_id, field, language)
        );
      `);
    })
      .catch((error) => {
        console.error("Failed to ensure document_translations table", error);
        ensureTablePromise = null;
        throw error;
      });
  }

  await ensureTablePromise;
}

function computeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function fetchCachedTranslation(
  documentId: string,
  field: string,
  language: string,
): Promise<TranslationRecord | null> {
  if (!getPool()) {
    return null;
  }

  try {
    await ensureDocumentTranslationsTable();
  } catch (error) {
    console.error("Unable to ensure translation table before read", error);
    return null;
  }

  try {
    const result = await withPgClient((client) =>
      client.query<TranslationRecord>(
        `SELECT translated_text, source_hash
         FROM document_translations
         WHERE document_id = $1 AND field = $2 AND language = $3
         LIMIT 1`,
        [documentId, field, language],
      ),
    );

    return result.rows[0] ?? null;
  } catch (error) {
    console.error("Failed to read cached translation", error);
    return null;
  }
}

async function upsertTranslation(
  documentId: string,
  field: string,
  language: string,
  sourceLanguage: string | undefined,
  sourceText: string,
  sourceHash: string,
  translatedText: string,
) {
  if (!getPool()) {
    return;
  }

  try {
    await ensureDocumentTranslationsTable();
  } catch (error) {
    console.error("Unable to ensure translation table before write", error);
    return;
  }

  try {
    await withPgClient((client) =>
      client.query(
        `INSERT INTO document_translations (
          document_id,
          field,
          language,
          source_language,
          source_text,
          source_hash,
          translated_text,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (document_id, field, language)
        DO UPDATE SET
          source_language = EXCLUDED.source_language,
          source_text = EXCLUDED.source_text,
          source_hash = EXCLUDED.source_hash,
          translated_text = EXCLUDED.translated_text,
          updated_at = NOW()
        `,
        [
          documentId,
          field,
          language,
          sourceLanguage ?? null,
          sourceText,
          sourceHash,
          translatedText,
        ],
      ),
    );
  } catch (error) {
    console.error("Failed to upsert translation", error);
  }
}


async function requestTranslation(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<string | null> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return null;
  }

  const response = await fetch(TRANSLATE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${YANDEX_API_KEY}`,
    },
    body: JSON.stringify({
      folderId: YANDEX_FOLDER_ID,
      texts: [text],
      targetLanguageCode: targetLanguage,
      ...(sourceLanguage ? { sourceLanguageCode: sourceLanguage } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Yandex Translate API error", response.status, await response.text());
    return null;
  }

  const payload = (await response.json()) as {
    translations?: Array<{ text?: string }>;
  };

  return payload.translations?.[0]?.text ?? null;
}

async function translateField(
  documentId: string,
  field: string,
  value: string,
  options: { targetLanguage: string; sourceLanguage?: string },
): Promise<string> {
  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  const sourceHash = computeHash(value);
  const cached = await fetchCachedTranslation(
    documentId,
    field,
    options.targetLanguage,
  );

  if (cached && cached.source_hash === sourceHash) {
    console.info(
      `[localizeDocuments] Using cached translation for ${documentId}:${field}:${options.targetLanguage}`,
    );
    return cached.translated_text;
  }

  const translated = await requestTranslation(
    trimmed,
    options.targetLanguage,
    options.sourceLanguage,
  );

  if (!translated) {
    console.warn(
      `[localizeDocuments] Translation API returned no data for ${documentId}:${field}:${options.targetLanguage}`,
    );
    return value;
  }

  console.info(
    `[localizeDocuments] Translated ${documentId}:${field}:${options.targetLanguage}`,
  );

  await upsertTranslation(
    documentId,
    field,
    options.targetLanguage,
    options.sourceLanguage,
    value,
    sourceHash,
    translated,
  );

  return translated;
}

export async function localizeDocuments<T extends DocumentLike>(
  documents: T[],
  { targetLanguage, sourceLanguage, fields = DEFAULT_FIELDS }: LocalizeDocumentsOptions,
): Promise<T[]> {
  if (!Array.isArray(documents) || documents.length === 0) {
    return documents;
  }

  if (!targetLanguage || targetLanguage === sourceLanguage) {
    return documents;
  }

  const pool = getPool();
  const canPersist = Boolean(pool && YANDEX_API_KEY && YANDEX_FOLDER_ID);

  if (!canPersist) {
    console.warn(
      `[localizeDocuments] Skipping translation for ${targetLanguage}. ` +
        `pool=${Boolean(pool)} apiKey=${Boolean(YANDEX_API_KEY)} folder=${Boolean(YANDEX_FOLDER_ID)}`,
    );
    return documents;
  }

  const directives = fields.map(parseFieldDirective);

  return Promise.all(
    documents.map(async (doc) => {
      const documentId =
        typeof doc._id === "string" && doc._id.length > 0
          ? doc._id
          : typeof doc.fileUrl === "string" && doc.fileUrl.length > 0
          ? doc.fileUrl
          : crypto.createHash("sha1").update(JSON.stringify(doc)).digest("hex");

      const localizedDoc: T = { ...doc };

      if (!canPersist) {
        return localizedDoc;
      }

      for (const directive of directives) {
        const value = (localizedDoc as any)[directive.name];

        if (directive.isArray) {
          if (Array.isArray(value) && value.length > 0) {
            const translatedItems = await Promise.all(
              value.map(async (item, index) => {
                if (typeof item === "string" && item.length > 0) {
                  return translateField(documentId, `${directive.name}[${index}]`, item, {
                    targetLanguage,
                    sourceLanguage,
                  });
                }
                return item;
              }),
            );
            (localizedDoc as any)[directive.name] = translatedItems;
          }
        } else if (typeof value === "string" && value.length > 0) {
          (localizedDoc as any)[directive.name] = await translateField(documentId, directive.name, value, {
            targetLanguage,
            sourceLanguage,
          });
        }
      }

      return localizedDoc;
    }),
  );
}
