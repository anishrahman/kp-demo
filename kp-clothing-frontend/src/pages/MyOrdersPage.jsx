import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Phone, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import * as api from '../services/api.js';
import { getWhatsAppNumber, openWhatsApp } from '../services/whatsapp.js';

export default function MyOrdersPage({ customer, settings = {} }) {
  const [phone, setPhone] = useState(customer?.phone || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const brandName = settings.brandName || 'KP Clothing';

  const fetchOrdersForPhone = async (searchPhone) => {
    const cleanPhone = (searchPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setHasSearched(true);

    try {
      // 1. Try server API /api/orders/mine?phone=...
      const serverOrders = await api.getCustomerOrders(cleanPhone);
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        setOrders(serverOrders);
        setLoading(false);
        return;
      }
    } catch {
      // API fallback
    }

    // 2. Fallback to local storage recent orders
    try {
      const localOrders = JSON.parse(localStorage.getItem('kp_recent_orders') || '[]');
      const filtered = localOrders.filter((o) => {
        const oPhone = String(o.phone || o.customerPhone || '').replace(/\D/g, '');
        return oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone);
      });
      setOrders(filtered);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (customer?.phone) {
      setPhone(customer.phone);
      fetchOrdersForPhone(customer.phone);
    }
  }, [customer?.phone]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrdersForPhone(phone);
  };

  const handleWhatsAppHelp = (order) => {
    const wp = getWhatsAppNumber(settings);
    const code = order.orderCode || `#${order.id || 'ORDER'}`;
    const text = encodeURIComponent(
      `Hello ${brandName}, I need an update on my order ${code} placed under phone ${phone}.`
    );
    openWhatsApp(wp, text);
  };

  const getStatusBadge = (status = 'PLACED') => {
    const st = String(status).toUpperCase();
    let bg = '#756353';
    let text = 'Order Placed';

    if (st === 'DELIVERED') {
      bg = '#2a6a3b';
      text = 'Delivered';
    } else if (st === 'SHIPPED') {
      bg = '#2c5a8a';
      text = 'Shipped / In Transit';
    } else if (st === 'PROCESSING' || st === 'CONFIRMED') {
      bg = '#8a682c';
      text = 'Processing';
    } else if (st === 'CANCELLED') {
      bg = '#8a2c2c';
      text = 'Cancelled';
    }

    return (
      <span
        style={{
          background: bg,
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <>
      <SEO
        title={`My Orders & Tracking - ${brandName}`}
        description="Track your KP Clothing handloom saree orders and shipment updates."
        canonical="/my-orders"
        noIndex={true}
      />

      <div className="view on" id="v-my-orders" style={{ minHeight: '65vh', paddingBottom: 60 }}>
        <div className="w" style={{ maxWidth: 840, margin: '0 auto' }}>
          {/* Breadcrumb Navigation */}
          <nav className="crumb" aria-label="Breadcrumb" style={{ margin: '16px 0 14px' }}>
            <Link to="/">Home</Link>
            {' / '}
            <span aria-current="page">My Orders</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Package size={28} color="var(--gold)" />
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', margin: 0, fontWeight: 600 }}>
              Order History & Tracking
            </h1>
          </div>
          <p style={{ color: 'var(--mut)', fontSize: 14, marginBottom: 24 }}>
            Enter your 10-digit mobile number to view and track all your saree orders.
          </p>

          {/* Lookup Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#231a15',
              padding: '18px 20px',
              borderRadius: 8,
              border: '1px solid #554438',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Phone
                size={18}
                color="var(--mut)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={12}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  background: '#19120e',
                  border: '1px solid #6b5849',
                  borderRadius: 6,
                  color: 'var(--txt)',
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={16} />
              {loading ? 'Searching...' : 'Find Orders'}
            </button>
          </form>

          {errorMsg && (
            <p style={{ color: '#e07a6a', fontSize: 13, marginBottom: 16 }}>{errorMsg}</p>
          )}

          {/* Orders Results List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mut)' }}>
              Fetching your orders...
            </div>
          ) : orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {orders.map((order, idx) => {
                const code = order.orderCode || `KP${String(order.id || idx + 1).padStart(4, '0')}`;
                const items = order.items || (order.productName ? [{ name: order.productName, price: order.price, qty: order.quantity || 1 }] : []);
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (order.date || 'Recent');

                return (
                  <div
                    key={order.id || idx}
                    style={{
                      background: '#231a15',
                      border: '1px solid #5a483a',
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 10,
                        borderBottom: '1px solid #3d2f26',
                        paddingBottom: 12,
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block' }}>
                          ORDER ID
                        </span>
                        <b style={{ fontSize: 16, color: 'var(--gold)', letterSpacing: 0.5 }}>
                          {code}
                        </b>
                        <span style={{ fontSize: 13, color: 'var(--mut)', marginLeft: 12 }}>
                          Placed on {orderDate}
                        </span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      {items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 14,
                          }}
                        >
                          <span style={{ color: 'var(--txt)' }}>
                            {item.name || item.productName || 'Handloom Cotton Saree'}{' '}
                            <span style={{ color: 'var(--mut)', fontSize: 13 }}>
                              &times; {item.quantity || item.qty || 1}
                            </span>
                          </span>
                          <b style={{ color: 'var(--txt)' }}>
                            &#8377;{Number((item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                          </b>
                        </div>
                      ))}
                    </div>

                    {/* Summary Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        borderTop: '1px solid #3d2f26',
                        paddingTop: 12,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 13, color: 'var(--mut)' }}>Payment: </span>
                        <b style={{ fontSize: 13, color: 'var(--txt)' }}>
                          {order.paymentMethod || 'Cash on Delivery'}
                        </b>
                        <span style={{ margin: '0 8px', color: '#554438' }}>|</span>
                        <span style={{ fontSize: 13, color: 'var(--mut)' }}>Total: </span>
                        <b style={{ fontSize: 15, color: 'var(--gold)' }}>
                          &#8377;{Number(order.totalAmount || order.price || 0).toLocaleString('en-IN')}
                        </b>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppHelp(order)}
                        className="btn o sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                      >
                        <ExternalLink size={14} />
                        Get Help on WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div
              style={{
                background: '#231a15',
                padding: '36px 20px',
                borderRadius: 8,
                textAlign: 'center',
                border: '1px solid #4a3a2e',
              }}
            >
              <Package size={40} color="var(--mut)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>No orders found for {phone}</h3>
              <p style={{ color: 'var(--mut)', fontSize: 14, maxWidth: '45ch', margin: '0 auto 20px' }}>
                Please check the mobile number used during checkout or contact us on WhatsApp for assistance.
              </p>
              <Link to="/" className="btn sm">
                Continue Shopping
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
