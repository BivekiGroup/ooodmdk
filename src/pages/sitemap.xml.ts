import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";

const SITE_URL = "https://ooodmdk.ru";

export const GET: APIRoute = async () => {
  // Получаем все продукты из Sanity
  const products = await sanityClient.fetch(`
    *[_type == "product"]{
      "slug": slug.current,
      title,
      _updatedAt,
      "categorySlug": category->slug.current,
      "categoryTitle": category->title
    }
  `);

  // Получаем все категории
  const categories = await sanityClient.fetch(`
    *[_type == "category"]{
      "slug": slug.current,
      title,
      _updatedAt
    }
  `);

  // Формируем XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Главная страница -->
      <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>

      <!-- Статические страницы -->
      <url>
        <loc>${SITE_URL}/cities</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      
      <url>
        <loc>${SITE_URL}/faq</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      
      <url>
        <loc>${SITE_URL}/requisites</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.6</priority>
      </url>

      <!-- Категории продуктов -->
      ${categories
        .map(
          (category: any) => `
        <url>
          <loc>${SITE_URL}/#${category.slug}</loc>
          <lastmod>${new Date(category._updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
        </url>
      `,
        )
        .join("")}

      <!-- Страницы продуктов -->
      ${products
        .map((product: any) => {
          // Определение приоритета: серебряные аноды имеют наивысший приоритет
          const isHighPriority =
            product.title.toLowerCase().includes("анод") &&
            product.title.toLowerCase().includes("серебр");
          const priority = isHighPriority ? "0.9" : "0.8";

          return `
        <url>
          <loc>${SITE_URL}/${product.slug}</loc>
          <lastmod>${new Date(product._updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${priority}</priority>
        </url>
      `;
        })
        .join("")}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
