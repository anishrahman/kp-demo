import React, { useState } from 'react';
import CustomerPhotosStrip from '../components/CustomerPhotosStrip.jsx';

const PERSPECTIVES = ['Front', 'Back', 'Side', 'Fabric', 'Video'];

export default function ProductView({
  product,
  category,
  categories = [],
  onNavigateHome,
  onNavigateCategory,
  onAddToCart,
  onBuyNow,
}) {
  const [activePersp, setActivePersp] = useState(0);

  if (!product) return null;

  const swatchKey = product.swatchKey || category?.k || 'crm';
  const categoryName = category?.n || product.category || 'Handloom Cotton';
  const categoryId = category?.id || 'c-chettinad';

  const viewClass = activePersp > 3 ? 'v0' : `v${activePersp}`;

  return (
    <div className="view on" id="v-prod">
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
          /{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigateCategory?.(categoryId);
            }}
          >
            {categoryName}
          </a>{' '}
          / <span>{product.name}</span>
        </p>

        {/* 2-Column Product Layout */}
        <div className="pd">
          {/* Left: Gallery with 5 Perspective Switcher */}
          <div className="gal">
            <div className="th">
              {PERSPECTIVES.map((label, idx) => {
                const btnViewClass = idx > 3 ? 'v0' : `v${idx}`;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActivePersp(idx)}
                    className={`${btnViewClass} i-${swatchKey} ${activePersp === idx ? 'on' : ''}`}
                    aria-label={`View ${label}`}
                  >
                    <div className="inner" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Viewport Box */}
            <div className={`main ${viewClass} i-${swatchKey}`}>
              <div className="inner" />
              {activePersp === 4 && (
                <span className="vid">&#9654; Product video</span>
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="info">
            <h1>{product.name}</h1>
            <p className="price" style={{ fontSize: 22, margin: '6px 0' }}>
              &#8377;{product.price}
            </p>

            <h3 style={{ fontSize: 18, marginTop: 14 }}>Top highlights</h3>
            <ul>
              <li>Soft, breathable handloom cotton</li>
              <li>Real zari border</li>
              <li>Blouse piece included</li>
            </ul>

            <dl>
              <dt>Material</dt>
              <dd>Pure cotton</dd>
              <dt>Occasion</dt>
              <dd>Daily wear, office, festive</dd>
              <dt>Care</dt>
              <dd>Gentle hand wash, dry in shade</dd>
            </dl>

            <div className="acts">
              <button
                className="btn o"
                type="button"
                onClick={() => onAddToCart?.(product)}
              >
                Add to cart
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => onBuyNow?.(product)}
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* About the item description */}
        <h2>About the item</h2>
        <p style={{ color: 'var(--mut)', maxWidth: '70ch', margin: '12px 0 32px' }}>
          {product.description ||
            'Handpicked handloom cotton saree with authentic gold zari border. Breathable, featherlight to drape, and woven for all-day comfort.'}
        </p>

        {/* Customer reviews and photos */}
        <CustomerPhotosStrip
          categories={categories}
          offset={2}
          title="Customer reviews and photos"
          subtitle=""
        />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="pbar">
        <button
          className="btn o"
          type="button"
          onClick={() => onAddToCart?.(product)}
        >
          Add to cart
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => onBuyNow?.(product)}
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
