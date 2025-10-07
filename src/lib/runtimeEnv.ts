const PROCESS_ENV = typeof process !== "undefined" ? process.env : undefined;
const IMPORT_META_ENV = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;

export function getServerEnv(key: keyof ImportMetaEnv | string): string | undefined {
  const normalizedKey = key as string;

  if (PROCESS_ENV && typeof PROCESS_ENV[normalizedKey] === "string") {
    const value = PROCESS_ENV[normalizedKey];
    if (value && value.length > 0) {
      return value;
    }
  }

  if (IMPORT_META_ENV && typeof IMPORT_META_ENV[normalizedKey] === "string") {
    const value = IMPORT_META_ENV[normalizedKey];
    if (value && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function getBooleanEnv(key: keyof ImportMetaEnv | string): boolean {
  const value = getServerEnv(key);
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
