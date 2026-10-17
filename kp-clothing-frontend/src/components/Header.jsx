import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import kpLogo from '../assets/kp_logo.png';
import { getCategorySlug } from '../utils/slugs.js';
import { useCart } from '../context/CartContext.jsx';

export default function Header({
  categories = [],
  searchQuery = '',
  onSearchChange,
  customer,
  onOpenCustomerModal,
  onOpenReviews,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems, toggleCart } = useCart();

  const visibleCategories = categories.filter((c) => c.on !== false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setMenuOpen(false);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header>
      <div className="w nav">
        {/* Logo */}
        <Link
          to="/"
          className="lg"
          style={{ backgroundImage: `url(${kpLogo})` }}
          aria-label="KP Clothing Home"
          onClick={() => setMenuOpen(false)}
        />

        {/* Desktop category navigation links */}
        <nav
          className={`links${menuOpen ? ' open' : ''}`}
          id="links"
          aria-label="Saree categories"
        >
          <Link
            to="/sarees/all"
            onClick={() => setMenuOpen(false)}
          >
            All Sarees
          </Link>
          {visibleCategories
            .filter((c) => {
              if (c.id === 'c-new-collection' || c.slug === 'new-collection') return false;
              const name = (c.n || c.name || '').trim().toLowerCase();
              const slug = (c.slug || getCategorySlug(c) || '').toLowerCase();
              return name !== 'test silk' && slug !== 'test-silk';
            })
            .map((c) => {
              const slug = getCategorySlug(c);
              return (
                <Link
                  key={c.id}
                  to={`/sarees/${slug}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {c.n}
                </Link>
              );
            })}
          <Link
            to="/new-collection"
            className="nw"
            onClick={() => setMenuOpen(false)}
          >
            New Collection
          </Link>
        </nav>

        {/* Search input */}
        <input
          className="search"
          type="search"
          placeholder="Search sarees"
          aria-label="Search sarees"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />

        {/* Reviews button */}
        <button
          className="ico rvb"
          type="button"
          onClick={onOpenReviews}
        >
          Reviews
        </button>

        {/* User / Account button */}
        <div style={{ position: 'relative' }}>
          <button
            className="ico"
            id="lgn"
            type="button"
            onClick={() => {
              if (customer) {
                setAccountMenuOpen((v) => !v);
              } else {
                onOpenCustomerModal?.();
              }
            }}
            aria-label={customer ? `Account: ${customer.name}` : 'Login'}
            title={customer ? `Signed in as ${customer.name}` : 'Login'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </button>

          {/* Customer Dropdown Menu if signed in */}
          {customer && accountMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                background: '#231a15',
                border: '1px solid #5a483a',
                borderRadius: 8,
                padding: '10px 0',
                minWidth: 170,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1000,
              }}
            >
              <div style={{ padding: '6px 14px', borderBottom: '1px solid #3d2f26' }}>
                <b style={{ color: 'var(--txt)', fontSize: 13, display: 'block' }}>
                  {customer.name}
                </b>
                <span style={{ color: 'var(--mut)', fontSize: 12 }}>{customer.phone}</span>
              </div>
              <Link
                to="/my-orders"
                onClick={() => setAccountMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '8px 14px',
                  color: 'var(--txt)',
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                My Orders & Tracking
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  onOpenCustomerModal?.();
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Manage Profile
              </button>
            </div>
          )}
        </div>

        {/* Cart button */}
        <button
          className="ico"
          type="button"
          onClick={toggleCart}
          aria-label="Cart"
          title="Shopping Cart"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
          </svg>
          <span className="cb" style={{ display: totalItems > 0 ? 'block' : 'none' }}>
            <span id="cc">{totalItems}</span>
          </span>
        </button>

        {/* Mobile Hamburger toggle */}
        <button
          className="ico burger"
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          &#9776;
        </button>
      </div>
    </header>
  );
}
