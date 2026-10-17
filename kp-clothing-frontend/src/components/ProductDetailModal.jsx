import React, { useState } from 'react';
import { X, MessageSquare, ShoppingBag } from 'lucide-react';
import { getWhatsAppNumber, formatProductWhatsAppMessage, openWhatsApp } from '../services/whatsapp.js';

/**
 * ProductDetailModal – detailed popup for viewing saree specifications and ordering.
 */
export default function ProductDetailModal({
  product,
  settings = {},
  onClose,
  onOrderProduct,
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!product) return null;

  const isUpcoming = Boolean(product.isUpcoming || product.status === 'UPCOMING');
  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const currentImg = images[activeIdx] || images[0] || null;

  const handleWhatsApp = () => {
    const phone = getWhatsAppNumber(settings);
    const msg = formatProductWhatsAppMessage(product, isUpcoming);
    openWhatsApp(phone, msg);
  };

  return (
    <div
      className="ov"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rvm"
        style={{
          maxWidth: 880,
          background: 'var(--bg)',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header bar */}
        <div
          style={{
            background: 'var(--btn)',
            color: '#fff',
            padding: '14px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 22, color: '#fff', fontFamily: 'var(--serif)' }}>
              {product.name}
            </h2>
            {product.code && (
              <span
                style={{
                  background: 'var(--gold)',
                  color: '#fff',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 99,
                  fontWeight: 700,
                }}
              >
                {product.code}
              </span>
            )}
          </div>
          <button
            className="gx"
            style={{ color: '#fff' }}
            onClick={onClose}
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.1fr) 1.2fr', gap: 28 }}>
            {/* Gallery Column */}
            <div>
              <div
                style={{
                  aspectRatio: '3/4',
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'var(--alt)',
                  backgroundImage: currentImg ? `url(${currentImg})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'top',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!currentImg && (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--mut)' }}>
                    <b style={{ fontSize: 16, color: 'var(--ink)', display: 'block' }}>
                      {product.category || 'Handloom Cotton'}
                    </b>
                    <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, display: 'block' }}>
                      Photo Coming Soon
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: 58,
                        height: 72,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: activeIdx === i ? '2px solid var(--gold)' : '1px solid var(--line)',
                        padding: 0,
                        background: `url(${img}) center/cover`,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="info" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span className="price" style={{ fontSize: 28, color: 'var(--btn)', fontWeight: 700 }}>
                  ₹{product.price}
                </span>
                {isUpcoming ? (
                  <span style={{ color: '#7a2e2e', fontWeight: 700, fontSize: 13 }}>
                    Upcoming Saree (Pre-Order)
                  </span>
                ) : (
                  <span style={{ color: '#257042', fontWeight: 700, fontSize: 13 }}>
                    In Stock • Ready to Dispatch
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--mut)', margin: '8px 0 16px', fontSize: 15, lineHeight: 1.6 }}>
                {product.description ||
                  'Pure handloom cotton saree with authentic zari borders. Soft on the skin, featherlight to drape, and woven for enduring elegance.'}
              </p>

              <h3 style={{ fontSize: 18, marginTop: 12, marginBottom: 6 }}>Top Highlights</h3>
              <ul style={{ paddingLeft: 18, color: 'var(--mut)', margin: 0, fontSize: 14 }}>
                <li>100% Breathable Handloom Cotton</li>
                <li>Artisanal Border & Rich Pallu</li>
                <li>Running Blouse Piece Included (where indicated)</li>
                <li>Comfortable for all-day festive or daily wear</li>
              </ul>

              <dl
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '6px 12px',
                  margin: '18px 0',
                  borderTop: '1px solid var(--line)',
                  paddingTop: 14,
                  fontSize: 14,
                }}
              >
                <dt style={{ color: 'var(--mut)' }}>Material</dt>
                <dd style={{ margin: 0 }}>Pure Handloom Cotton</dd>
                <dt style={{ color: 'var(--mut)' }}>Care</dt>
                <dd style={{ margin: 0 }}>Gentle hand wash, dry in shade</dd>
                <dt style={{ color: 'var(--mut)' }}>Delivery</dt>
                <dd style={{ margin: 0 }}>All India delivery (express dispatch)</dd>
              </dl>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', paddingTop: 16 }}>
                <button
                  className="btn"
                  style={{ flex: 1, backgroundColor: '#128C7E', borderColor: '#128C7E' }}
                  onClick={handleWhatsApp}
                >
                  <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Order on WhatsApp
                </button>

                <button
                  className="btn o"
                  style={{ flex: 1 }}
                  onClick={() => onOrderProduct?.(product)}
                >
                  <ShoppingBag size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Direct Order Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
