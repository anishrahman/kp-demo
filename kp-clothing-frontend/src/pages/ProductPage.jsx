import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerPhotosStrip from '../components/CustomerPhotosStrip.jsx';
import SEO from '../components/SEO.jsx';
import { useCart } from '../context/CartContext.jsx';
import { findProductBySlug, getCategorySlug } from '../utils/slugs.js';
import { getWhatsAppNumber, formatProductWhatsAppMessage, openWhatsApp } from '../services/whatsapp.js';
import { resolveMediaUrl } from '../services/api.js';

const PERSPECTIVES = [
  { key: 'FRONT', label: 'Front' },
  { key: 'BACK', label: 'Back' },
  { key: 'SIDE', label: 'Side' },
  { key: 'FABRIC', label: 'Fabric' },
  { key: 'VIDEO', label: 'Video' },
];

export default function ProductPage({
  products = [],
  categories = [],
  settings = {},
}) {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activePersp, setActivePersp] = useState(0);

  const product = findProductBySlug(products, productSlug);
  const brandName = settings.brandName || 'KP Clothing';

  if (!product) {
    return (
      <div className="view on" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div className="w">
          <h2>Saree Not Found</h2>
          <p style={{ color: 'var(--mut)', margin: '14px 0 24px' }}>
            The saree you are looking for is no longer available or the link has changed.
          </p>
          <Link to="/" className="btn">
            Browse Saree Collection
          </Link>
        </div>
      </div>
    );
  }

  const category =
    categories.find((c) => c.id === product.cid || c.n === product.category) ||
    categories[0];
  const catSlug = getCategorySlug(category);
  const categoryName = category?.n || product.category || 'Handloom Cotton';
  const swatchKey = product.swatchKey || category?.k || 'crm';

  // Perspectives images / video fallback
  const mediaList = product.media || [];

  const frontUrl = resolveMediaUrl(
    mediaList.find((m) => m.view === 'FRONT' && m.type === 'IMAGE')?.url ||
    product.images?.[0] ||
    product.image ||
    `/images/${swatchKey}.jpg`
  );

  const backUrl = resolveMediaUrl(
    mediaList.find((m) => m.view === 'BACK' && m.type === 'IMAGE')?.url ||
    product.images?.[1] ||
    frontUrl
  );

  const sideUrl = resolveMediaUrl(
    mediaList.find((m) => m.view === 'SIDE' && m.type === 'IMAGE')?.url ||
    product.images?.[2] ||
    frontUrl
  );

  const fabricUrl = resolveMediaUrl(
    mediaList.find((m) => m.view === 'FABRIC' && m.type === 'IMAGE')?.url ||
    product.images?.[3] ||
    frontUrl
  );

  const videoUrl = resolveMediaUrl(
    mediaList.find((m) => m.type === 'VIDEO')?.url ||
    product.videoUrl ||
    ''
  );

  const perspectiveMedia = [
    { type: 'IMAGE', url: frontUrl, label: 'Front' },
    { type: 'IMAGE', url: backUrl, label: 'Back' },
    { type: 'IMAGE', url: sideUrl, label: 'Side' },
    { type: 'IMAGE', url: fabricUrl, label: 'Fabric' },
    { type: 'VIDEO', url: videoUrl, label: 'Video' },
  ];

  const currentMedia = perspectiveMedia[activePersp] || perspectiveMedia[0];

  const isOutOfStock =
    product.status === 'OUT_OF_STOCK' ||
    product.stock === false ||
    (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0 && !product.isUpcoming);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWhatsAppInquiry = () => {
    const wp = getWhatsAppNumber(settings);
    const msg = formatProductWhatsAppMessage(product, false);
    openWhatsApp(wp, msg);
  };

  const seoTitle = `${product.name} - Pure ${categoryName} Saree | ${brandName}`;
  const seoDescription =
    product.description ||
    `Buy ${product.name} online at ${brandName}. Pure ${categoryName} handloom saree with zari border for Rs. ${product.price}. Express delivery & Cash on Delivery available.`;
  const canonicalUrl = `/saree/${productSlug}`;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: categoryName, url: `/sarees/${catSlug}` },
    { name: product.name, url: canonicalUrl },
  ];

  // Helper for YouTube embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtube.com/watch')) {
        const v = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
    } catch {}
    return '';
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        product={product}
        breadcrumbs={breadcrumbs}
      />

      <div className="view on" id="v-prod">
        <div className="w">
          {/* Breadcrumb Navigation */}
          <nav className="crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {' / '}
            <Link to={`/sarees/${catSlug}`}>{categoryName}</Link>
            {' / '}
            <span aria-current="page">{product.name}</span>
          </nav>

          {/* 2-Column Product Layout */}
          <div className="pd">
            {/* Left: 5-Perspective Gallery */}
            <div className="gal">
              <div className="th" role="tablist" aria-label="Saree perspectives">
                {PERSPECTIVES.map((item, idx) => {
                  const mediaItem = perspectiveMedia[idx];
                  const hasMedia = Boolean(mediaItem?.url);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={activePersp === idx}
                      onClick={() => setActivePersp(idx)}
                      className={`v${idx} ${activePersp === idx ? 'on' : ''}`}
                      aria-label={`View ${item.label} perspective`}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#2b1a13',
                        border: activePersp === idx ? '2px solid var(--gold)' : '1px solid rgba(184, 146, 58, 0.3)',
                      }}
                    >
                      {item.key === 'VIDEO' ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1a100a',
                            color: 'var(--gold)',
                          }}
                        >
                          <span style={{ fontSize: 16 }}>▶</span>
                        </div>
                      ) : (
                        hasMedia && (
                          <img
                            src={mediaItem.url}
                            alt={item.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Viewport Box */}
              <div
                className="main"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#1a0e07',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 460,
                }}
              >
                {activePersp === 4 ? (
                  // Video Perspective
                  videoUrl ? (
                    getYouTubeEmbedUrl(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl)}
                        title={`${product.name} video drape`}
                        style={{ width: '100%', height: '100%', minHeight: 460, border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        autoPlay
                        playsInline
                        src={videoUrl}
                        style={{ width: '100%', height: '100%', maxHeight: 560, objectFit: 'contain' }}
                      />
                    )
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--mut)' }}>
                      <p style={{ fontSize: 32, marginBottom: 12 }}>🎥</p>
                      <p style={{ fontSize: 16, color: '#fbf3e4', fontWeight: 600 }}>Video coming soon</p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>
                        A 360° drape video for this handloom saree will be added shortly.
                      </p>
                    </div>
                  )
                ) : (
                  // Image Perspectives (Front, Back, Side, Fabric)
                  <img
                    src={currentMedia.url}
                    alt={`${product.name} - ${currentMedia.label} view`}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: 560,
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right: Product Details & Purchase Actions */}
            <div className="info">
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                {categoryName} Handloom
              </span>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: '4px 0 8px' }}>
                {product.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '8px 0 16px' }}>
                <span className="price" style={{ fontSize: 26, fontWeight: 700, color: 'var(--txt)' }}>
                  &#8377;{Number(String(product.price).replace(/[^0-9.]/g, '') || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: 13, color: '#3a7a44', fontWeight: 600 }}>
                  Express Delivery Only
                </span>
              </div>

              {product.description && (
                <p style={{ color: 'var(--mut)', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: 16 }}>
                  {product.description}
                </p>
              )}

              {/* Authenticity Guarantee Box */}
              {product.authenticityNote && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(184, 146, 58, 0.1)',
                    borderRadius: 6,
                    border: '1px solid rgba(184, 146, 58, 0.25)',
                    marginBottom: 18,
                    fontSize: 13,
                    color: 'var(--txt)',
                  }}
                >
                  <b>Authentic Weave Guarantee:</b> {product.authenticityNote}
                </div>
              )}

              {/* Highlights Dynamic List */}
              {Array.isArray(product.highlights) && product.highlights.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, marginTop: 14 }}>Highlights</h3>
                  <ul>
                    {product.highlights.map((hl, idx) => (
                      <li key={idx}>{hl}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Detail Specifications Definition List */}
              {(product.sareeLength ||
                product.blousePiece ||
                product.fabric ||
                product.fabricWeight ||
                product.weaveDetails ||
                product.careInstructions ||
                product.availabilityText ||
                !isOutOfStock !== undefined) && (
                <dl>
                  {product.sareeLength && (
                    <>
                      <dt>Saree Length</dt>
                      <dd>{product.sareeLength}</dd>
                    </>
                  )}
                  {product.blousePiece && (
                    <>
                      <dt>Blouse Piece</dt>
                      <dd>{product.blousePiece}</dd>
                    </>
                  )}
                  {product.fabric && (
                    <>
                      <dt>Fabric / Material</dt>
                      <dd>{product.fabric}</dd>
                    </>
                  )}
                  {product.fabricWeight && (
                    <>
                      <dt>Fabric Weight</dt>
                      <dd>{product.fabricWeight}</dd>
                    </>
                  )}
                  {product.weaveDetails && (
                    <>
                      <dt>Weave / Pallu</dt>
                      <dd>{product.weaveDetails}</dd>
                    </>
                  )}
                  {product.careInstructions && (
                    <>
                      <dt>Care Instructions</dt>
                      <dd>{product.careInstructions}</dd>
                    </>
                  )}
                  <dt>Availability</dt>
                  <dd style={{ color: !isOutOfStock ? '#3a7a44' : '#a14234', fontWeight: 600 }}>
                    {product.availabilityText || (!isOutOfStock ? 'In Stock (Ready to dispatch)' : 'Sold Out / Out of Stock')}
                  </dd>
                </dl>
              )}

              {/* Action Buttons */}
              <div className="acts">
                <button
                  className="btn o"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to bag'}
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Sold Out' : 'Buy now'}
                </button>
              </div>

              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#25D366',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Ask question about this saree on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Customers in our sarees Photo Strip */}
          <CustomerPhotosStrip
            categories={categories}
            offset={1}
            title="Customers in our sarees"
            subtitle="Real drapes, true colours, authentic handloom weaves."
          />
        </div>
      </div>
    </>
  );
}
