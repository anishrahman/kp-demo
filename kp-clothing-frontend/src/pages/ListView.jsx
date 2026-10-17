import React from 'react';
import ProductCard from '../components/ProductCard.jsx';
import CustomerPhotosStrip from '../components/CustomerPhotosStrip.jsx';
import { DEMO_NEW_COLLECTION, INITIAL_CATEGORIES } from '../services/initialData.js';

const LOCK_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ width: 30, height: 30, color: '#fff' }}
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function ListView({
  mode = 'category', // 'category' | 'new' | 'search'
  category,
  categories = INITIAL_CATEGORIES,
  products = [],
  searchQuery = '',
  onNavigateHome,
  onSelectProduct,
  onNotifyMe,
}) {
  const isNewCollection = mode === 'new';
  const isSearch = mode === 'search';

  let pageTitle = '';
  let crumbLabel = '';

  if (isNewCollection) {
    pageTitle = 'New Collection';
    crumbLabel = 'New Collection';
  } else if (isSearch) {
    pageTitle = `Results for "${searchQuery}"`;
    crumbLabel = 'Search';
  } else {
    pageTitle = `${category?.n || 'Saree'} Sarees`;
    crumbLabel = category?.n || 'Category';
  }

  const categoryProducts = isNewCollection
    ? []
    : isSearch
    ? products.filter((p) =>
        [p.name, p.category, p.description].some((v) =>
          (v || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      )
    : products.filter((p) => p.cid === category?.id);

  return (
    <div className="view on" id="v-list">
      <div className="w">
        {/* Breadcrumb */}
        <p className="crumb">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome?.();
            }}
          >
            Home
          </a>{' '}
          / <span>{crumbLabel}</span>
        </p>

        {/* Header Title */}
        <div className="sh" style={{ margin: '14px 0 18px' }}>
          <h2>{pageTitle}</h2>
        </div>

        {/* New Collection Intro notice */}
        {isNewCollection && (
          <p className="li">
            Fresh designs are on the way. The photos stay hidden until launch day.
            Tap Notify me and we will message you on WhatsApp.
          </p>
        )}

        {/* Products Grid or New Collection Locked Grid */}
        <div className="grid">
          {isNewCollection ? (
            DEMO_NEW_COLLECTION.map((item, idx) => (
              <div key={idx} className="t nwc">
                <div className="sw">
                  <div className={`bi i-${item.k}`} />
                  <div className="lk">
                    {LOCK_ICON}
                    <span>Revealed at launch</span>
                  </div>
                  <span className="badge">Coming soon</span>
                </div>
                <b>New design {idx + 1}</b>
                <span>Launching soon</span>
                <br />
                <button
                  className="btn o sm"
                  type="button"
                  onClick={onNotifyMe}
                >
                  Notify me
                </button>
              </div>
            ))
          ) : categoryProducts.length > 0 ? (
            categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))
          ) : (
            <p style={{ color: 'var(--mut)', gridColumn: '1 / -1', padding: '24px 0' }}>
              No sarees found. Try another name.
            </p>
          )}
        </div>

        {/* Customers in our sarees Photo Strip */}
        {!isNewCollection && (
          <CustomerPhotosStrip
            categories={categories}
            offset={0}
            title="Customers in our sarees"
            subtitle="Sample photos. Replace with real customer photos."
          />
        )}
      </div>
    </div>
  );
}
