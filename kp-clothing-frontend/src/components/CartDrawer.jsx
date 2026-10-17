import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, deliveryFee, totalAmount, totalCount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <div
      className="ov"
      style={{ zIndex: 130, justifyContent: 'flex-end', padding: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          height: '100vh',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
          animation: 'rvin 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            backgroundColor: 'var(--btn)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="var(--gold)" />
            <h3 style={{ color: '#fff', fontSize: 20, margin: 0, fontFamily: 'var(--serif)' }}>
              Your Bag ({totalCount})
            </h3>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 4,
              borderRadius: '50%',
            }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Progress Notice */}
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: subtotal >= 999 ? '#eaf7ec' : 'var(--alt)',
            color: subtotal >= 999 ? '#1e7e34' : 'var(--mut)',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            borderBottom: '1px solid var(--line)',
          }}
        >
          Express Delivery Only
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mut)' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: 'var(--alt)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <ShoppingBag size={32} color="var(--gold)" />
              </div>
              <h4 style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>Your cart is empty</h4>
              <p style={{ fontSize: 13, marginBottom: 20 }}>
                Explore our handloom cotton collection and add your favorite sarees.
              </p>
              <button
                className="btn sm"
                onClick={() => {
                  closeCart();
                  navigate('/#cats');
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {items.map(({ product, quantity }) => {
                const swatchKey = product.swatchKey || 'crm';
                const mainImage = product.images?.[0] || product.image;
                const rawPrice = Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;

                return (
                  <div
                    key={product.id || product.code}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr auto',
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: 'var(--ivory)',
                      border: '1px solid var(--line)',
                      alignItems: 'center',
                    }}
                  >
                    {/* Saree thumbnail */}
                    <div
                      className={`sw i-${swatchKey}`}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 6,
                        backgroundImage: mainImage ? `url(${mainImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'top',
                      }}
                    />

                    {/* Details */}
                    <div>
                      <b style={{ display: 'block', fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}>
                        {product.name}
                      </b>
                      <span style={{ fontSize: 13, color: 'var(--btn)', fontWeight: 700, display: 'block', marginTop: 2 }}>
                        ₹{rawPrice.toLocaleString('en-IN')}
                      </span>
                      {product.code && (
                        <span style={{ fontSize: 10, color: 'var(--mut)', textTransform: 'uppercase' }}>
                          SKU: {product.code}
                        </span>
                      )}

                      {/* Quantity Selector */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--line)',
                          borderRadius: 4,
                          marginTop: 6,
                          backgroundColor: '#fff',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id || product.code, quantity - 1)}
                          disabled={quantity <= 1}
                          style={{
                            padding: '3px 8px',
                            background: 'none',
                            border: 'none',
                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                            opacity: quantity <= 1 ? 0.4 : 1,
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: 12, fontWeight: 700 }}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id || product.code, quantity + 1)}
                          disabled={quantity >= 10}
                          style={{
                            padding: '3px 8px',
                            background: 'none',
                            border: 'none',
                            cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                            opacity: quantity >= 10 ? 0.4 : 1,
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id || product.code)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9b2c2c',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 4,
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--line)',
              backgroundColor: 'var(--ivory)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--mut)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: 'var(--mut)' }}>
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#257042' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)',
                paddingTop: 8,
                borderTop: '1px dashed var(--line)',
                marginBottom: 16,
              }}
            >
              <span>Total Amount</span>
              <span style={{ color: 'var(--btn)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 10 }}>
              <button
                className="btn o"
                onClick={handleViewCart}
                style={{ padding: '11px 16px', fontSize: 13 }}
              >
                View Full Cart
              </button>
              <button
                className="btn"
                onClick={handleCheckout}
                style={{
                  padding: '11px 18px',
                  fontSize: 13,
                  backgroundColor: 'var(--gold)',
                  borderColor: 'var(--gold)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>Checkout</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
