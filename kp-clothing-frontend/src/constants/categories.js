// src/constants/categories.js
// Single source of truth for categories across Storefront and Admin

export const STORE_CATEGORIES = [
  {
    id: 'c-chettinad',
    n: 'Chettinad Cotton',
    slug: 'chettinad-cotton',
    k: 'mar',
    d: 'Checks with gold zari borders',
    on: true,
  },
  {
    id: 'c-mangalagiri',
    n: 'Mangalagiri',
    slug: 'mangalagiri',
    k: 'blk',
    d: 'Rich colour bands on black',
    on: true,
  },
  {
    id: 'c-kalamkari',
    n: 'Kalamkari',
    slug: 'kalamkari',
    k: 'kal',
    d: 'Hand-painted style motifs',
    on: true,
  },
  {
    id: 'c-mulmul',
    n: 'Mulmul Cotton',
    slug: 'mulmul-cotton',
    k: 'crm',
    d: 'Light, soft and breezy',
    on: true,
  },
  {
    id: 'c-new-collection',
    n: 'New Collection',
    slug: 'new-collection',
    k: 'nwc',
    d: 'Upcoming exclusive designs crafting on the loom',
    on: true,
  },
];

export function normalizeCategoryItem(c) {
  if (!c) return null;
  const name = c.name || c.n || '';
  const slug = c.slug || slugifyText(name);
  return {
    id: c.id || `c-${slug}`,
    n: name,
    name,
    slug,
    k: c.swatchKey || c.k || 'mar',
    swatchKey: c.swatchKey || c.k || 'mar',
    d: c.description || c.d || '',
    description: c.description || c.d || '',
    on: c.on !== false,
  };
}

export const CATEGORY_NAMES = STORE_CATEGORIES.map((c) => c.n);

export function slugifyText(text = '') {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeCategoryName(catName = '') {
  const clean = String(catName || '').trim().toLowerCase();
  if (clean.includes('chettinad') || clean.includes('chettiand')) return 'Chettinad Cotton';
  if (clean.includes('mangalagiri')) return 'Mangalagiri';
  if (clean.includes('kalamkari')) return 'Kalamkari';
  if (clean.includes('mulmul')) return 'Mulmul Cotton';
  if (clean.includes('new') || clean.includes('upcoming') || clean.includes('loom')) return 'New Collection';
  return catName || 'Chettinad Cotton';
}

export function getCategoryIdForName(catName = '') {
  const norm = normalizeCategoryName(catName);
  const found = STORE_CATEGORIES.find((c) => c.n === norm);
  return found ? found.id : 'c-chettinad';
}

export function matchesCategory(product, category) {
  if (!product || !category) return false;
  if (category.id === 'all' || category.slug === 'all' || category.slug === 'all-sarees') {
    return true;
  }

  const pCat = String(product.category || '').trim().toLowerCase();
  const pCid = String(product.cid || '').trim().toLowerCase();
  const cId = String(category.id || '').trim().toLowerCase();
  const cSlug = String(category.slug || slugifyText(category.n)).trim().toLowerCase();
  const cName = String(category.n || '').trim().toLowerCase();
  const normPCat = normalizeCategoryName(product.category).toLowerCase();

  return (
    pCid === cId ||
    pCat === cName ||
    normPCat === cName ||
    slugifyText(pCat) === cSlug ||
    pCat.includes(cSlug) ||
    cSlug.includes(slugifyText(pCat))
  );
}
