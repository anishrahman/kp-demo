import React, { useState } from 'react';
import {
  Truck,
  Eye,
  MessageSquare,
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Package,
} from 'lucide-react';
import { getWhatsAppNumber, openWhatsApp } from '../../services/whatsapp.js';

const SHIPPING_STAGES = [
  { key: 'ORDER PLACED', label: 'Order Placed', color: '#8a6a3f', bg: '#fbf3e4', border: '#d9c6a3' },
  { key: 'PACKED', label: 'Packed & Quality Checked', color: '#c9a227', bg: '#fef9e7', border: '#e8c766' },
  { key: 'SHIPPED', label: 'Shipped via Courier', color: '#20a4b8', bg: '#e6f7fa', border: '#2eb7d9' },
  { key: 'OUT FOR DELIVERY', label: 'Out for Delivery', color: '#7a2e2e', bg: '#fde8e8', border: '#f8b4b4' },
  { key: 'DELIVERED', label: 'Delivered Successfully', color: '#1e5338', bg: '#e8f5e9', border: '#a5d6a7' },
  { key: 'CANCELLED', label: 'Cancelled / Returned', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
];

export function ShippingMonitoring({
  orders = [],
  settings = {},
  onUpdateStatus,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const getStageInfo = (status) => {
    const norm = (status || 'ORDER PLACED').toUpperCase();
    return (
      SHIPPING_STAGES.find((s) => s.key === norm) || {
        key: norm,
        label: status || 'Order Placed',
        color: '#8a6a3f',
        bg: '#fbf3e4',
        border: '#d9c6a3',
      }
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStage === 'ALL') return true;
    return (o.status || 'ORDER PLACED').toUpperCase() === filterStage;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWhatsAppCustomer = (order) => {
    const phone = order.customerPhone ? String(order.customerPhone).replace(/\D/g, '') : '';
    if (!phone) {
      alert('No customer phone number available for this order.');
      return;
    }
    const currentStatus = order.status || 'Order Placed';
    const msg = `Namaste ${order.customerName || 'Customer'}! 🙏\n\nUpdate regarding your KP Clothing Saree order *#${order.orderCode}*:\n\n📦 *Current Shipping Status:* ${currentStatus}\n💰 *Total Amount:* ${order.totalAmount}\n\nThank you for choosing KP Clothing! Reply here if you have any questions. ✨`;
    openWhatsApp(phone, msg);
  };

  return (
    <div
      style={{
        backgroundColor: '#fff8ec',
        borderRadius: 20,
        padding: 24,
        border: '1px solid #f3e6cd',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderBottom: '1px solid #f3e6cd',
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#7a2e2e',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            <Truck size={14} />
            <span>DISPATCH & DELIVERY TRACKING</span>
          </div>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: '#241209', margin: '4px 0 0' }}>
            Shipping Monitoring
          </h3>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterStage('ALL')}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 99,
              border: '1px solid #d9c6a3',
              backgroundColor: filterStage === 'ALL' ? '#241209' : '#fff',
              color: filterStage === 'ALL' ? '#e8c766' : '#241209',
              cursor: 'pointer',
            }}
          >
            All ({orders.length})
          </button>
          {SHIPPING_STAGES.map((s) => {
            const count = orders.filter((o) => (o.status || 'ORDER PLACED').toUpperCase() === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setFilterStage(s.key)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${s.border}`,
                  backgroundColor: filterStage === s.key ? s.color : '#fff',
                  color: filterStage === s.key ? '#fff' : s.color,
                  cursor: 'pointer',
                }}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="ct" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Order Code</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Shipping Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px 10px', color: '#8a6a3f' }}>
                  No orders found in this shipping stage.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const stage = getStageInfo(order.status);
                return (
                  <tr key={order.id || order.orderCode}>
                    <td>
                      <b style={{ color: '#241209' }}>#{order.orderCode}</b>
                    </td>
                    <td>
                      <div>
                        <b>{order.customerName}</b>
                        <span style={{ display: 'block', fontSize: 11, color: '#8a6a3f' }}>
                          {order.customerPhone} • {order.customerCity || 'Chennai'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td>
                      <b>{order.totalAmount}</b>
                    </td>
                    <td>
                      <select
                        disabled={updatingId === order.id}
                        value={(order.status || 'ORDER PLACED').toUpperCase()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: `1px solid ${stage.border}`,
                          backgroundColor: stage.bg,
                          color: stage.color,
                          cursor: 'pointer',
                        }}
                      >
                        {SHIPPING_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span style={{ fontSize: 10, color: '#7a2e2e', marginLeft: 6 }}>Saving...</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            backgroundColor: '#f3e6cd',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="View Order Details"
                        >
                          <Eye size={14} color="#241209" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppCustomer(order)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            backgroundColor: '#128C7E',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Message on WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <div
          className="ov"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            className="rvm"
            style={{
              maxWidth: 520,
              background: '#fff8ec',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #f3e6cd',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f3e6cd',
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#7a2e2e', textTransform: 'uppercase' }}>
                  ORDER DETAILS
                </span>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: '2px 0 0', color: '#241209' }}>
                  #{selectedOrder.orderCode}
                </h3>
              </div>
              <button
                className="gx"
                onClick={() => setSelectedOrder(null)}
                style={{ position: 'static' }}
              >
                &#10005;
              </button>
            </div>

            {/* Customer Details */}
            <div
              style={{
                backgroundColor: '#fff',
                padding: 14,
                borderRadius: 10,
                border: '1px solid #f3e6cd',
                marginBottom: 14,
                fontSize: 13,
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <User size={14} color="#c9a227" />
                <span>{selectedOrder.customerName || 'Customer'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5c3a22' }}>
                <Phone size={14} color="#8a6a3f" />
                <span>Primary: <b>{selectedOrder.customerPhone || '-'}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5c3a22' }}>
                <Phone size={14} color="#8a6a3f" />
                <span>Alternative: <b>{selectedOrder.customerAlternativePhone || '-'}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#5c3a22' }}>
                <MapPin size={14} color="#8a6a3f" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  {selectedOrder.customerAddressLine ? (
                    <div>
                      <div><b>Street / Lane:</b> {selectedOrder.customerAddressLine}</div>
                      {selectedOrder.customerLandmark && <div><b>Landmark:</b> {selectedOrder.customerLandmark}</div>}
                      <div><b>City & State:</b> {selectedOrder.customerCity || 'Chennai'}, {selectedOrder.customerState || 'Tamil Nadu'}</div>
                      <div><b>Pincode:</b> {selectedOrder.customerPincode || '-'}</div>
                    </div>
                  ) : (
                    <div>{selectedOrder.clientAddress || selectedOrder.customerCity || '-'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                Items Ordered
              </span>
              {(selectedOrder.items || []).map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#fbf3e4',
                    borderRadius: 8,
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <b>{it.name}</b>
                    <span style={{ display: 'block', fontSize: 11, color: '#8a6a3f' }}>
                      Code: {it.productCode} • Qty: {it.quantity}
                    </span>
                  </div>
                  <b>{it.price}</b>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 15 }}>
                <b>Total Amount:</b>
                <b style={{ color: '#7a2e2e' }}>{selectedOrder.totalAmount}</b>
              </div>
            </div>

            {/* Direct WhatsApp update */}
            <button
              className="btn"
              style={{ width: '100%', backgroundColor: '#128C7E', borderColor: '#128C7E' }}
              onClick={() => handleWhatsAppCustomer(selectedOrder)}
            >
              <MessageSquare size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Send Shipping Status via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShippingMonitoring;
