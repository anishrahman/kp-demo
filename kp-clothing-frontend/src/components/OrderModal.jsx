import React, { useState } from 'react';
import { X, CheckCircle, MessageSquare } from 'lucide-react';
import { getWhatsAppNumber, openWhatsApp } from '../services/whatsapp.js';

/**
 * OrderModal – order checkout popup for placing an order directly and over WhatsApp.
 */
export default function OrderModal({
  product,
  customer,
  settings = {},
  onClose,
  onSubmitOrder,
}) {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [city, setCity] = useState(customer?.city || '');
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!product) return null;

  const priceNum = parseInt(String(product.price).replace(/[^0-9]/g, '') || '0', 10);
  const total = (priceNum * qty).toLocaleString('en-IN');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city.trim()) {
      alert('Please provide your name, phone number, and delivery city.');
      return;
    }

    const orderId = 'ord-' + Date.now().toString(36);
    const orderCode = 'KPO-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderId,
      orderCode,
      createdAt: new Date().toISOString(),
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerCity: city.trim(),
      items: [
        {
          productCode: product.code || 'KP-SAREE',
          name: product.name,
          price: product.price,
          quantity: qty,
          size: 'Free Size',
        },
      ],
      totalAmount: `₹${total}`,
      status: 'Pending',
      notes: notes.trim(),
    };

    setPlacedOrder(newOrder);
    onSubmitOrder?.(newOrder, { name, phone, city });
  };

  const handleWhatsAppSend = () => {
    if (!placedOrder) return;
    const msg = `🛍️ *NEW ORDER - ${settings.brandName || 'KP CLOTHING'}*\n\n*Order Code:* ${placedOrder.orderCode}\n*Date:* ${new Date(placedOrder.createdAt).toLocaleDateString('en-IN')}\n\n*Customer Details:*\nName: ${placedOrder.customerName}\nPhone: ${placedOrder.customerPhone}\nCity: ${placedOrder.customerCity}\n\n*Item:* ${product.name} (${product.code || 'N/A'})\nQty: ${qty}\n*Total:* ₹${total}\nNotes: ${placedOrder.notes || 'None'}\n\nPlease confirm availability and payment options!`;

    const wp = getWhatsAppNumber(settings);
    openWhatsApp(wp, msg);
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
          maxWidth: 580,
          background: 'var(--bg)',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--btn)',
            color: '#fff',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 20, color: '#fff', fontFamily: 'var(--serif)', margin: 0 }}>
            {placedOrder ? 'Order Confirmation' : 'Order Saree'}
          </h2>
          <button className="gx" style={{ color: '#fff' }} onClick={onClose}>
            &#10005;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {placedOrder ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={48} color="#257042" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 24, marginBottom: 8, fontFamily: 'var(--serif)' }}>
                Thank You, {placedOrder.customerName}!
              </h3>
              <p style={{ color: 'var(--mut)', marginBottom: 20 }}>
                Your order <b>#{placedOrder.orderCode}</b> has been received. Tap below to send details directly to our WhatsApp boutique assistant for instant dispatch.
              </p>

              <button
                className="btn"
                style={{
                  width: '100%',
                  backgroundColor: '#128C7E',
                  borderColor: '#128C7E',
                  marginBottom: 12,
                }}
                onClick={handleWhatsAppSend}
              >
                <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Send to WhatsApp Assistant
              </button>

              <button className="btn o" style={{ width: '100%' }} onClick={onClose}>
                Back to Store
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Product summary card */}
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  padding: 12,
                  background: 'var(--ivory)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 65,
                    borderRadius: 4,
                    background: (product.images?.[0] || product.image)
                      ? `url(${product.images?.[0] || product.image}) center/cover`
                      : 'var(--alt)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--mut)',
                  }}
                >
                  {!(product.images?.[0] || product.image) && 'KP'}
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ display: 'block', fontSize: 16 }}>{product.name}</b>
                  <span style={{ fontSize: 12, color: 'var(--mut)' }}>Code: {product.code || 'N/A'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ color: 'var(--btn)', fontSize: 18 }}>₹{total}</b>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: 'grid', gap: 14 }}>
                <div className="fld">
                  <label htmlFor="ord-name">Full Name</label>
                  <input
                    id="ord-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="fld">
                  <label htmlFor="ord-phone">WhatsApp Number</label>
                  <input
                    id="ord-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="fld">
                  <label htmlFor="ord-city">Delivery City / Address</label>
                  <input
                    id="ord-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                  />
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                      Quantity
                    </label>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid var(--btn)',
                        borderRadius: 3,
                        background: '#fff',
                        font: 'inherit',
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} Saree{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid var(--btn)',
                        borderRadius: 3,
                        background: '#fff',
                        font: 'inherit',
                      }}
                    />
                  </div>
                </div>

                <button
                  className="btn"
                  type="submit"
                  style={{
                    marginTop: 10,
                    width: '100%',
                    backgroundColor: 'var(--btn)',
                  }}
                >
                  Place Order (₹{total})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
