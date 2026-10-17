import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, X } from 'lucide-react';
import {
  getWhatsAppNumber,
  formatGeneralWhatsAppMessage,
  formatBulkOrderWhatsAppMessage,
  openWhatsApp,
} from '../services/whatsapp.js';
import { INSTAGRAM_URL } from './HeroCarousel.jsx';

/**
 * Footer – matches demo's footer .fg grid with WhatsApp action and boutique details.
 * Note: Admin link removed from public view as requested (accessible directly at /admin).
 */
export default function Footer({ settings = {} }) {
  const [showBulkPopup, setShowBulkPopup] = useState(false);

  const handleWhatsApp = (e) => {
    e?.preventDefault?.();
    const phone = getWhatsAppNumber(settings);
    openWhatsApp(phone, formatGeneralWhatsAppMessage());
  };

  const handleBulkWhatsApp = (e) => {
    e?.preventDefault?.();
    const phone = getWhatsAppNumber(settings);
    openWhatsApp(phone, formatBulkOrderWhatsAppMessage());
    setShowBulkPopup(false);
  };

  return (
    <>
      <footer>
        <div className="w fg">
          <div>
            <h3>{settings.brandName || 'KP Clothing'}</h3>
            <p>
              {settings.brandTagline || 'Comfort meets elegance'}. Handloom cotton sarees, made to be lived in.
            </p>
            <p style={{ marginTop: 14, fontSize: 13, color: 'var(--mut)' }}>
              © {new Date().getFullYear()} {settings.brandName || 'KP Clothing'}. All rights reserved.
            </p>
          </div>

          <div>
            <h3>Reach Us</h3>
            <p>
              Instagram:{' '}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold)', textDecoration: 'underline' }}
                title="Follow KP Clothing on Instagram"
              >
                @kp_clothingz
              </a>
            </p>
            {settings.phone && <p>Phone: {settings.phone}</p>}
            <p>WhatsApp: +{getWhatsAppNumber(settings)}</p>
            <p>{settings.address || 'Chennai, Tamil Nadu, India'}</p>
          </div>

          <div>
            <div
              className="map"
              role="img"
              aria-label="Store location map"
              style={{
                borderRadius: 6,
                border: '1px solid #6b5a4e',
                background: '#2c211c',
                color: '#cdbca8',
                padding: '24px 16px',
                textAlign: 'center',
              }}
            >
              <b>KP Clothing Boutique</b>
              <br />
              <span style={{ fontSize: 13, color: '#a89886' }}>
                Handloom Weaves Studio & Express Shipping Hub
              </span>
              <br />
              <button
                className="btn o sm"
                style={{ marginTop: 12, borderColor: 'var(--gold)', color: 'var(--gold)' }}
                onClick={handleWhatsApp}
              >
                Inquire Store Visit
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Bulk Order Enquiry Interactive Popup Bubble */}
      {showBulkPopup && (
        <div
          role="dialog"
          aria-label="Bulk Order Enquiry"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 'calc(118px + env(safe-area-inset-bottom, 0px))',
            zIndex: 35,
            width: 290,
            maxWidth: 'calc(100vw - 36px)',
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid var(--line)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            padding: '16px 18px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--btn)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} color="var(--gold)" /> Bulk / Wholesale Enquiry
            </span>
            <button
              onClick={() => setShowBulkPopup(false)}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--mut)',
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 14px' }}>
            Hey beauties! 💛 Are you enquiring about a large quantity? Chat with us on WhatsApp below.
          </p>

          <button
            onClick={handleBulkWhatsApp}
            className="btn"
            style={{
              width: '100%',
              backgroundColor: '#25D366',
              borderColor: '#25D366',
              color: '#fff',
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 6,
            }}
          >
            <MessageSquare size={16} />
            Chat on WhatsApp
          </button>
        </div>
      )}

      {/* Floating Bulk Order Enquiry Pill (Above WhatsApp Button) */}
      <button
        type="button"
        onClick={() => setShowBulkPopup((prev) => !prev)}
        aria-label="Bulk Order Enquiry"
        title="Bulk Order Enquiry"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 'calc(74px + env(safe-area-inset-bottom, 0px))',
          zIndex: 30,
          backgroundColor: '#fffdf9',
          color: 'var(--ink)',
          border: '1.5px solid var(--gold)',
          borderRadius: 99,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'transform 0.15s ease',
        }}
      >
        <span>Bulk Order Enquiry</span>
        <Phone size={13} color="var(--gold)" />
      </button>

      {/* Floating WhatsApp Action Button */}
      <button
        className="wa"
        onClick={handleWhatsApp}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Chat on WhatsApp
      </button>
    </>
  );
}
