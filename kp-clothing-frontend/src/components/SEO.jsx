import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://kpclothing.com';
const DEFAULT_TITLE = 'KP Clothing | Handloom Cotton Sarees - Comfort Meets Elegance';
const DEFAULT_DESC = 'Handcrafted pure handloom cotton sarees with authentic gold zari borders. Chettinad, Mangalagiri, Kalamkari & Mulmul cotton sarees. Fast delivery across India.';
const DEFAULT_IMAGE = `${SITE_URL}/images/kp_logo.jpg`;

export default function SEO({
  title,
  description = DEFAULT_DESC,
  canonicalUrl,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  schema = null,
  breadcrumbs = null,
}) {
  const fullTitle = title ? `${title} | KP Clothing` : DEFAULT_TITLE;
  const fullCanonical = canonicalUrl
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`)
    : SITE_URL;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  // Build JSON-LD structured data array
  const structuredData = [];

  if (schema) {
    if (Array.isArray(schema)) {
      structuredData.push(...schema);
    } else {
      structuredData.push(schema);
    }
  }

  if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url.startsWith('http') ? b.url : `${SITE_URL}${b.url}`,
      })),
    });
  }

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="KP Clothing" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD Structured Data */}
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
