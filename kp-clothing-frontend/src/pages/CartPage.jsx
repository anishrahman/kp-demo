import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import SEO from '../components/SEO.jsx';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, deliveryFee, totalAmount, totalCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="w" style={{ padding: '32px 22px 64px' }}>
      <SEO
        title="Shopping Cart"
        description="Review your selected handloom cotton sarees in your KP Clothing shopping bag before checkout."
        canonicalUrl="/cart"
        noindex={true}
      />

      {/* Breadcrumb */}
      <p className="crumb" style={{ marginBottom: 16 }}>
        <Link to="/">Home</Link> / <span>Shopping Bag</span>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--ink)' }}>
            Shopping Bag ({totalCount})
          </h1>
          <p style={{ color: 'var(--mut)', margin: '4px 0 0', fontSize: 14 }}>
            100% Authentic Handloom Cotton • Quality Inspected
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: 'none',
              border: 'none',
              color: '#9b2c2c',
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear bag
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'var(--ivory)',
            borderRadius: 8,
            border: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              backgroundColor: 'var(--alt)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 20px',
            }}
          >
            <ShoppingBag size={38} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>Your bag is currently empty</h2>
          <p style={{ color: 'var(--mut)', maxWidth: '40ch', margin: '0 auto 24px', fontSize: 15 }}>
            Discover our curated weaves from Chettinad, Mangalagiri, Kalamkari and Mulmul cotton.
          </p>
          <Link to="/#cats" className="btn">
            Explore Sarees Collection
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Items */}
          <div style={{ display: 'grid', gap: 16 }}>
            {items.map(({ product, quantity }) => {
              const swatchKey = product.swatchKey || 'crm';
              const mainImage = product.images?.[0] || product.image;
              const rawPrice = Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
              const productSlug = product.slug || `${(product.name || 'saree').toLowerCase().replace(/\s+/g, '-')}-${product.code || product.id}`;

              return (
                <div
                  key={product.id || product.code}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: 18,
                    padding: 18,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    alignItems: 'center',
                  }}
                >
                  {/* Thumbnail with link */}
                  <Link to={`/saree/${productSlug}`} style={{ display: 'block' }}>
                    <div
                      className={`sw i-${swatchKey}`}
                      style={{
                        aspectRatio: '3/4',
                        borderRadius: 6,
                        backgroundImage: mainImage ? `url(${mainImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'top',
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div>
                    <Link
                      to={`/saree/${productSlug}`}
                      style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--serif)', display: 'block' }}
                    >
                      {product.name}
                    </Link>
                    <span style={{ fontSize: 16, color: 'var(--btn)', fontWeight: 700, display: 'block', marginTop: 4 }}>
                      ₹{rawPrice.toLocaleString('en-IN')}
                    </span>
                    {product.code && (
                      <span style={{ fontSize: 11, color: 'var(--mut)', textTransform: 'uppercase' }}>
                        Product Code: {product.code}
                      </span>
                    )}

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1.5px solid var(--line)',
                          borderRadius: 6,
                          backgroundColor: 'var(--ivory)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id || product.code, quantity - 1)}
                          disabled={quantity <= 1}
                          style={{
                            padding: '5px 12px',
                            background: 'none',
                            border: 'none',
                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                            opacity: quantity <= 1 ? 0.4 : 1,
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ padding: '0 12px', fontSize: 14, fontWeight: 700 }}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id || product.code, quantity + 1)}
                          disabled={quantity >= 10}
                          style={{
                            padding: '5px 12px',
                            background: 'none',
                            border: 'none',
                            cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                            opacity: quantity >= 10 ? 0.4 : 1,
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span style={{ fontSize: 13, color: 'var(--mut)' }}>
                        Item total: <strong>₹{(rawPrice * quantity).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(product.id || product.code)}
                    style={{
                      background: 'none',
                      border: '1px solid #fed7d7',
                      color: '#9b2c2c',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: '#fff5f5',
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <Link to="/#cats" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--btn)', fontWeight: 700, fontSize: 14 }}>
                <ArrowLeft size={16} />
                <span>Add more sarees</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Price Details Sidebar */}
          <div
            style={{
              backgroundColor: 'var(--ivory)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--line)',
              position: 'sticky',
              top: 96,
            }}
          >
            <h2 style={{ fontSize: 20, marginBottom: 18, color: 'var(--ink)' }}>Price Details</h2>

            <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--mut)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Price ({totalCount} items)</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charges</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#257042' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  borderTop: '1px dashed var(--line)',
                  paddingTop: 14,
                  marginTop: 6,
                }}
              >
                <span>Total Payable</span>
                <span style={{ color: 'var(--btn)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {deliveryFee === 0 && (
              <p style={{ color: '#257042', fontSize: 12, fontWeight: 600, marginTop: 12 }}>
                ✓ You saved ₹100 on delivery charges!
              </p>
            )}

            <button
              className="btn"
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                marginTop: 20,
                backgroundColor: 'var(--gold)',
                borderColor: 'var(--gold)',
                color: '#fff',
                padding: '14px',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: 20, display: 'grid', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--mut)' }}>
                <ShieldCheck size={16} color="var(--gold)" />
                <span>100% Secure Checkout & Buyer Protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--mut)' }}>
                <Truck size={16} color="var(--gold)" />
                <span>Dispatched within 24-48 hours via Express Courier</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
