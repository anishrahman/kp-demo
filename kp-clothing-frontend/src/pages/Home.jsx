import React from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Strip from '../components/Strip.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import AboutSection from '../components/AboutSection.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SEO from '../components/SEO.jsx';
import { STORE_CATEGORIES } from '../constants/categories.js';

export default function Home({
  categories = STORE_CATEGORIES,
  products = [],
  settings = {},
  searchQuery = '',
  onClearSearch,
  onSelectCategory,
  onSelectProduct,
  onOpenReviews,
}) {
  const [searchParams] = useSearchParams();
  const q = (searchQuery || searchParams.get('q') || '').trim();
  const cleanQ = q.toLowerCase();

  const visibleCategories = categories.filter((c) => c.on !== false && c.id !== 'c-new-collection');

  // Search results
  const searchResults = q
    ? products.filter((p) => {
        if (p.status === 'HIDDEN' || p.status === 'DRAFT') return false;
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(cleanQ) || cat.includes(cleanQ) || code.includes(cleanQ) || desc.includes(cleanQ);
      })
    : [];

  // Bestsellers list from live products
  const availableProducts = products.filter((p) => !p.isUpcoming && p.status !== 'HIDDEN' && p.status !== 'DRAFT');
  const bestsellers = availableProducts.filter((p) => p.best || p.featured);
  const displayBestsellers = bestsellers.length > 0 ? bestsellers : availableProducts.slice(0, 8);

  const handleExplore = () => {
    const el = document.getElementById('cats');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const brandName = settings.brandName || 'KP Clothing';
  const brandTagline = settings.brandTagline || 'Comfort Meets Elegance';

  return (
    <>
      <SEO
        title={`${brandName} | Pure Handloom Cotton Sarees Online Store`}
        description={`${brandTagline}. Shop authentic Chettinad, Mangalagiri, Kalamkari & Mulmul handloom sarees. Free delivery across India.`}
        canonical="/"
      />

      <div className="view on" id="v-home">
        {/* If Search is Active -> Show Search Results Grid */}
        {q ? (
          <section className="sec alt" id="search-results" style={{ paddingTop: 30, minHeight: '60vh' }}>
            <div className="w">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: 0, color: 'var(--txt)' }}>
                    Results for "{q}"
                  </h1>
                  <span style={{ color: 'var(--mut)', fontSize: 13, marginTop: 4, display: 'block' }}>
                    {searchResults.length} {searchResults.length === 1 ? 'saree' : 'sarees'} found
                  </span>
                </div>
                {onClearSearch && (
                  <button className="btn o sm" onClick={onClearSearch}>
                    Clear Search
                  </button>
                )}
              </div>

              <div className="grid">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <ProductCard
                      key={product.id || product.code}
                      product={product}
                      onSelectProduct={onSelectProduct}
                    />
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', padding: '50px 0', textAlign: 'center' }}>
                    <p style={{ color: 'var(--mut)', fontSize: 16 }}>
                      No sarees match "{q}". Try searching for Chettinad, Mangalagiri, Kalamkari or another saree name.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* Normal Storefront Home Sections */
          <>
            {/* Hero Carousel with Animated Breeze Saree Canvas */}
            <HeroCarousel settings={settings} onExplore={handleExplore} />

            {/* Trust & Features Strip */}
            <Strip slideCount={3} currentIdx={0} />

            {/* Shop by Saree Type Grid */}
            <CategoryGrid
              categories={visibleCategories}
              onSelectCategory={onSelectCategory}
            />

            {/* About KP Clothing Section */}
            <AboutSection settings={settings} />

            {/* Bestsellers Section */}
            <section className="sec alt" id="bestsellers">
              <div className="w">
                <div className="sh">
                  <h2>Bestsellers</h2>
                </div>

                <div className="grid" id="bs">
                  {displayBestsellers.map((product) => (
                    <ProductCard
                      key={product.id || product.code}
                      product={product}
                      onSelectProduct={onSelectProduct}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Customer Reviews Callout Banner */}
            <section className="sec" id="rev">
              <div className="w">
                <div className="rev">
                  <h2>Hear it from our customers</h2>
                  <p>Real women, real sarees, real comfort.</p>
                  <button className="btn" type="button" onClick={onOpenReviews}>
                    Watch our customer reviews
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
