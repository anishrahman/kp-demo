import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import CustomerPhotosStrip from '../components/CustomerPhotosStrip.jsx';
import SEO from '../components/SEO.jsx';
import { findCategoryBySlug, getProductSlug } from '../utils/slugs.js';
import { matchesCategory, STORE_CATEGORIES } from '../constants/categories.js';

export default function CategoryPage({
  categories = STORE_CATEGORIES,
  products = [],
  settings = {},
  categorySlug: propCategorySlug,
}) {
  const params = useParams();
  const categorySlug = propCategorySlug || params.categorySlug;
  const navigate = useNavigate();

  const isAllSarees = categorySlug === 'all' || categorySlug === 'all-sarees';

  const category = isAllSarees
    ? {
        id: 'all',
        n: 'All Sarees',
        slug: 'all',
        d: 'Explore our complete collection of authentic pure handloom cotton sarees',
      }
    : findCategoryBySlug(categories, categorySlug) || {
        id: categorySlug,
        n: categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Handloom',
        slug: categorySlug,
        d: 'Handcrafted pure cotton handloom sarees',
      };

  const brandName = settings.brandName || 'KP Clothing';

  const categoryProducts = products.filter((p) => {
    // Hide explicitly hidden or draft sarees
    if (p.status === 'HIDDEN' || p.status === 'DRAFT') return false;
    // Hide upcoming sarees from regular categories (they belong in New Collection)
    if (p.isUpcoming || p.status === 'UPCOMING') return false;

    if (isAllSarees) return true;
    return matchesCategory(p, category);
  });

  const title = isAllSarees
    ? `All Sarees | Pure Handloom Cotton Collection - ${brandName}`
    : `${category.n} Sarees | Pure Handloom Collection - ${brandName}`;

  const description = isAllSarees
    ? `Browse all authentic handloom cotton sarees online at ${brandName}. Pure Chettinad, Mangalagiri, Kalamkari & Mulmul weaves. Express delivery only.`
    : `Shop authentic ${category.n} handloom cotton sarees online at ${brandName}. ${category.d || 'Lightweight, breathable pure cotton with zari borders'}. Express delivery across India.`;

  const canonicalUrl = isAllSarees ? '/sarees/all' : `/sarees/${categorySlug}`;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: `${category?.n || 'Sarees'}`, url: canonicalUrl },
  ];

  const handleSelectProduct = (product) => {
    const slug = getProductSlug(product);
    navigate(`/saree/${slug}`);
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonicalUrl}
        breadcrumbs={breadcrumbs}
      />

      <div className="view on" id="v-category">
        <div className="w">
          {/* Breadcrumb Navigation */}
          <nav className="crumb" aria-label="Breadcrumb" style={{ margin: '16px 0 12px' }}>
            <Link to="/">Home</Link>
            {' / '}
            <span aria-current="page">{category?.n || 'Collection'}</span>
          </nav>

          {/* Category Header */}
          <div className="sh" style={{ margin: '14px 0 18px' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 600, color: 'var(--txt)' }}>
              {category?.n.endsWith('Sarees') ? category.n : `${category?.n} Sarees`}
            </h1>
            {category?.d && (
              <p style={{ color: 'var(--mut)', marginTop: 6, fontSize: '0.98rem', maxWidth: '65ch' }}>
                {category.d}. Handwoven by traditional artisans with pure cotton yarns and exquisite zari finishes.
              </p>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid">
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <ProductCard
                  key={product.id || product.code}
                  product={product}
                  onSelectProduct={handleSelectProduct}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--mut)', fontSize: 16 }}>
                  No sarees currently available in this category.
                </p>
                <Link
                  to="/sarees/all"
                  className="btn o sm"
                  style={{ display: 'inline-block', marginTop: 14 }}
                >
                  Explore All Sarees
                </Link>
              </div>
            )}
          </div>

          {/* Customers in our sarees Photo Strip */}
          <CustomerPhotosStrip
            categories={categories}
            offset={0}
            title="Customers in our sarees"
            subtitle="Real drapes, true colours, authentic handloom weaves."
          />
        </div>
      </div>
    </>
  );
}
