// src/utils/slugs.js
// Utility helpers for clean, SEO-friendly URLs and category matching
import { normalizeCategoryName, STORE_CATEGORIES } from '../constants/categories.js';

export function slugify(text = '') {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCategorySlug(category) {
  if (!category) return '';
  if (category.slug) return category.slug;
  if (category.id) {
    const raw = category.id.replace(/^c-/, '');
    if (category.n) {
      return slugify(category.n);
    }
    return raw;
  }
  return slugify(category.n || 'sarees');
}

export function getProductSlug(product) {
  if (!product) return '';
  if (product.slug) return product.slug;
  if (product.name) {
    return slugify(product.name);
  }
  return slugify(product.code || `saree-${product.id}`);
}

export function findCategoryBySlug(categories = STORE_CATEGORIES, slug = '') {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();

  if (clean === 'all' || clean === 'all-sarees') {
    return {
      id: 'all',
      n: 'All Sarees',
      slug: 'all',
      d: 'Explore our complete collection of authentic pure handloom cotton sarees',
      on: true,
    };
  }

  // 1. Direct match on id, slug, or normalized name
  const found = categories.find((c) => {
    const cSlug = getCategorySlug(c).toLowerCase();
    const cName = (c.n || '').toLowerCase();
    const cId = (c.id || '').toLowerCase();
    const cRawId = cId.replace(/^c-/, '');

    return (
      cSlug === clean ||
      cName === clean ||
      cId === clean ||
      cRawId === clean ||
      slugify(c.n) === clean
    );
  });
  if (found) return found;

  // 2. Fuzzy substring match (e.g. "mangalagiri-sarees" -> "Mangalagiri")
  const normName = normalizeCategoryName(clean);
  const byNorm = categories.find((c) => c.n.toLowerCase() === normName.toLowerCase());
  if (byNorm) return byNorm;

  return (
    categories.find((c) => {
      const cSlug = getCategorySlug(c).toLowerCase();
      const cName = (c.n || '').toLowerCase();
      return clean.includes(cSlug) || cSlug.includes(clean) || clean.includes(cName) || cName.includes(clean);
    }) || null
  );
}

export function findProductBySlug(products = [], slug = '') {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();
  return (
    products.find((p) => {
      const pSlug = getProductSlug(p).toLowerCase();
      const pCode = (p.code || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pId = String(p.id).toLowerCase();

      return (
        pSlug === clean ||
        pCode === clean ||
        slugify(pName) === clean ||
        pId === clean ||
        (clean.startsWith('saree-') && pId === clean.replace('saree-', ''))
      );
    }) || null
  );
}
