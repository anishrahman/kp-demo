// scripts/prerender.js
// Generates static pre-rendered HTML files for public routes in dist/ for 100% Google SEO indexing.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://kpclothing.com';

const BRAND_NAME = 'KP Clothing';
const BRAND_TAGLINE = 'Comfort Meets Elegance - Pure Handloom Sarees';
const DEFAULT_DESC = 'Authentic handloom cotton sarees handcrafted with pure cotton yarns and real zari borders. Chettinad, Mangalagiri, Kalamkari & Mulmul collections with Express Delivery.';

const CATEGORIES = [
  { slug: 'chettinad-cotton', name: 'Chettinad Cotton', desc: 'Checks with gold zari borders handwoven on traditional looms.' },
  { slug: 'mangalagiri', name: 'Mangalagiri', desc: 'Rich colour bands on deep black handloom body with shimmering Nizam borders.' },
  { slug: 'kalamkari', name: 'Kalamkari', desc: 'Hand-painted style heritage tree-of-life and floral motifs.' },
  { slug: 'mulmul-cotton', name: 'Mulmul Cotton', desc: 'Featherlight, soft and breezy drapes for everyday comfort.' },
];

const PRODUCTS = [
  { slug: 'chettinad-cotton-classic', name: 'Chettinad Cotton Classic', category: 'Chettinad Cotton', price: 1399, catSlug: 'chettinad-cotton', img: '/images/mar.jpg' },
  { slug: 'chettinad-cotton-festive', name: 'Chettinad Cotton Festive', category: 'Chettinad Cotton', price: 1799, catSlug: 'chettinad-cotton', img: '/images/mar.jpg' },
  { slug: 'chettinad-cotton-everyday', name: 'Chettinad Cotton Everyday', category: 'Chettinad Cotton', price: 2199, catSlug: 'chettinad-cotton', img: '/images/mar.jpg' },
  { slug: 'mangalagiri-classic', name: 'Mangalagiri Classic', category: 'Mangalagiri', price: 1549, catSlug: 'mangalagiri', img: '/images/blk.jpg' },
  { slug: 'mangalagiri-festive', name: 'Mangalagiri Festive', category: 'Mangalagiri', price: 1949, catSlug: 'mangalagiri', img: '/images/blk.jpg' },
  { slug: 'mangalagiri-everyday', name: 'Mangalagiri Everyday', category: 'Mangalagiri', price: 2349, catSlug: 'mangalagiri', img: '/images/blk.jpg' },
  { slug: 'kalamkari-classic', name: 'Kalamkari Classic', category: 'Kalamkari', price: 1699, catSlug: 'kalamkari', img: '/images/kal.jpg' },
  { slug: 'kalamkari-festive', name: 'Kalamkari Festive', category: 'Kalamkari', price: 2099, catSlug: 'kalamkari', img: '/images/kal.jpg' },
  { slug: 'kalamkari-everyday', name: 'Kalamkari Everyday', category: 'Kalamkari', price: 2499, catSlug: 'kalamkari', img: '/images/kal.jpg' },
  { slug: 'mulmul-cotton-classic', name: 'Mulmul Cotton Classic', category: 'Mulmul Cotton', price: 1449, catSlug: 'mulmul-cotton', img: '/images/crm.jpg' },
  { slug: 'mulmul-cotton-festive', name: 'Mulmul Cotton Festive', category: 'Mulmul Cotton', price: 1849, catSlug: 'mulmul-cotton', img: '/images/crm.jpg' },
  { slug: 'mulmul-cotton-everyday', name: 'Mulmul Cotton Everyday', category: 'Mulmul Cotton', price: 2249, catSlug: 'mulmul-cotton', img: '/images/crm.jpg' },
];

function generateHtml(template, { title, description, canonicalPath, jsonLd, ogType = 'website', ogImage = '/images/crm.jpg', bodyContent = '' }) {
  let html = template;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Meta tags and JSON-LD block
  const seoHead = `
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:image" content="${fullOgImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${fullOgImage}">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  `;

  html = html.replace('</head>', `${seoHead}\n</head>`);

  if (bodyContent) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);
  }

  return html;
}

export function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('prerender error: dist/index.html not found. Run vite build first.');
    return;
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  // 1. Homepage
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BRAND_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/assets/kp_logo.png`,
      sameAs: ['https://www.instagram.com/kp_clothingz'],
      description: BRAND_TAGLINE,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND_NAME,
      url: BASE_URL,
    }
  ];

  const homeHtml = generateHtml(template, {
    title: `${BRAND_NAME} | Pure Handloom Cotton Sarees Online Store`,
    description: DEFAULT_DESC,
    canonicalPath: '/',
    jsonLd: homeJsonLd,
    bodyContent: `<header><h1>${BRAND_NAME} - ${BRAND_TAGLINE}</h1><p>${DEFAULT_DESC}</p></header>`,
  });
  fs.writeFileSync(templatePath, homeHtml, 'utf8');
  console.log('Pre-rendered: /');

  // 2. Categories
  for (const cat of CATEGORIES) {
    const routeDir = path.join(DIST_DIR, 'sarees', cat.slug);
    fs.mkdirSync(routeDir, { recursive: true });

    const catJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: `${cat.name} Sarees`, item: `${BASE_URL}/sarees/${cat.slug}` },
      ],
    };

    const catHtml = generateHtml(template, {
      title: `${cat.name} Sarees | Pure Handloom Collection - ${BRAND_NAME}`,
      description: `Shop authentic ${cat.name} sarees at ${BRAND_NAME}. ${cat.desc} Free shipping across India.`,
      canonicalPath: `/sarees/${cat.slug}`,
      jsonLd: catJsonLd,
      bodyContent: `<main><h1>${cat.name} Sarees</h1><p>${cat.desc}</p></main>`,
    });

    fs.writeFileSync(path.join(routeDir, 'index.html'), catHtml, 'utf8');
    console.log(`Pre-rendered: /sarees/${cat.slug}`);
  }

  // 3. Products
  for (const prod of PRODUCTS) {
    const routeDir = path.join(DIST_DIR, 'saree', prod.slug);
    fs.mkdirSync(routeDir, { recursive: true });

    const prodJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.name,
      description: `Handcrafted pure ${prod.category} saree with zari border from ${BRAND_NAME}.`,
      image: [`${BASE_URL}${prod.img}`],
      brand: { '@type': 'Brand', name: BRAND_NAME },
      offers: {
        '@type': 'Offer',
        price: prod.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${BASE_URL}/saree/${prod.slug}`,
      },
    };

    const prodHtml = generateHtml(template, {
      title: `${prod.name} - Pure ${prod.category} Saree | ${BRAND_NAME}`,
      description: `Buy ${prod.name} online at ${BRAND_NAME}. Handcrafted pure ${prod.category} saree for ₹${prod.price}. Express delivery & Cash on Delivery.`,
      canonicalPath: `/saree/${prod.slug}`,
      jsonLd: prodJsonLd,
      ogType: 'product',
      ogImage: prod.img,
      bodyContent: `<article><h1>${prod.name}</h1><p>Price: Rs. ${prod.price}</p><p>Category: ${prod.category}</p></article>`,
    });

    fs.writeFileSync(path.join(routeDir, 'index.html'), prodHtml, 'utf8');
    console.log(`Pre-rendered: /saree/${prod.slug}`);
  }

  // 4. New Collection
  const newColDir = path.join(DIST_DIR, 'new-collection');
  fs.mkdirSync(newColDir, { recursive: true });
  const newColHtml = generateHtml(template, {
    title: `Upcoming New Collection | Handloom Sarees - ${BRAND_NAME}`,
    description: `Preview upcoming handloom saree weaves from ${BRAND_NAME}. Lock notifications for launch day access.`,
    canonicalPath: '/new-collection',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Upcoming Handloom Saree Collection',
      description: 'Exclusive artisanal weaves currently crafting on handlooms.',
    },
    bodyContent: `<section><h1>Upcoming Handloom Saree Collection</h1><p>Revealed on launch day.</p></section>`,
  });
  fs.writeFileSync(path.join(newColDir, 'index.html'), newColHtml, 'utf8');
  console.log('Pre-rendered: /new-collection');

  console.log('Static pre-rendering completed successfully for all public routes.');
}

prerender();
