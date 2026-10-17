import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { DEMO_NEW_COLLECTION } from '../services/initialData.js';
import { getWhatsAppNumber, openWhatsApp } from '../services/whatsapp.js';

const LOCK_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ width: 28, height: 28, color: '#fff' }}
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function NewCollectionPage({
  settings = {},
  customer,
  onOpenCustomerModal,
  onShowToast,
}) {
  const brandName = settings.brandName || 'KP Clothing';

  const handleNotify = (designIndex) => {
    const wp = getWhatsAppNumber(settings);
    const custName = customer?.name ? ` - ${customer.name}` : '';
    const phone = customer?.phone ? ` (${customer.phone})` : '';
    const text = encodeURIComponent(
      `Hello ${brandName}, please notify me when New Collection Design #${designIndex + 1} launches!${custName}${phone}`
    );
    if (!customer?.phone && onOpenCustomerModal) {
      onOpenCustomerModal();
      onShowToast?.('Please sign in so we can notify you on launch day.');
    } else {
      openWhatsApp(wp, text);
      onShowToast?.(`Noted! We will message you on WhatsApp when Design #${designIndex + 1} drops.`);
    }
  };

  return (
    <>
      <SEO
        title={`Upcoming New Collection | Handloom Sarees - ${brandName}`}
        description={`Preview upcoming exclusive handloom saree designs from ${brandName}. Lock your notification to get first access on launch day.`}
        canonical="/new-collection"
        noIndex={false}
      />

      <div className="view on" id="v-new-collection">
        <div className="w">
          {/* Breadcrumb Navigation */}
          <nav className="crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {' / '}
            <span aria-current="page">New Collection</span>
          </nav>

          {/* Header */}
          <div className="sh" style={{ margin: '16px 0 14px' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 600 }}>
              Exclusive New Collection
            </h1>
          </div>

          <p
            className="li"
            style={{
              background: 'rgba(184, 146, 58, 0.1)',
              border: '1px solid rgba(184, 146, 58, 0.3)',
              borderRadius: 8,
              padding: '14px 18px',
              maxWidth: '70ch',
              marginBottom: 28,
            }}
          >
            Fresh handloom weaves are currently on the looms. Full photos stay secret until launch day to preserve exclusivity. Tap <b>Notify me</b> to receive priority access on WhatsApp.
          </p>

          {/* Locked Saree Grid */}
          <div className="grid">
            {DEMO_NEW_COLLECTION.map((item, idx) => (
              <div key={idx} className="t nwc" style={{ background: '#221914', borderRadius: 8, padding: 12 }}>
                <div className="sw" style={{ borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div className={`bi i-${item.k}`} style={{ filter: 'blur(8px) brightness(0.6)' }} />
                  <div className="lk">
                    {LOCK_ICON}
                    <span style={{ fontSize: 13, marginTop: 4 }}>Revealed at launch</span>
                  </div>
                  <span className="badge" style={{ background: 'var(--gold)', color: '#1a1410' }}>
                    Coming soon
                  </span>
                </div>
                <b style={{ display: 'block', marginTop: 10, color: 'var(--txt)', fontSize: 16 }}>
                  Artisan Edition #{idx + 1}
                </b>
                <span style={{ fontSize: 13, color: 'var(--mut)' }}>Pure handloom craft</span>
                <br />
                <button
                  className="btn o sm"
                  type="button"
                  style={{ marginTop: 10, width: '100%' }}
                  onClick={() => handleNotify(idx)}
                >
                  Notify me on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
