import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import kpLogo from '../../assets/kp_logo.png';
import * as api from '../../services/api.js';

export function AdminLogin({ onSuccess, onBackToStore }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);
    try {
      await api.loginAdmin(username.trim(), password);
      onSuccess();
    } catch (err) {
      console.error('Admin authentication failure:', err);
      setAuthError('Invalid admin credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#241209',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        color: '#fff8ec',
      }}
    >
      {/* Back to store navigation */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
        }}
      >
        <button
          onClick={onBackToStore}
          style={{
            color: '#dcc9a6',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Storefront</span>
        </button>
        <span style={{ color: '#8a6a3f' }}>Spring Boot • Port 5000</span>
      </div>

      <div
        style={{
          backgroundColor: '#fff8ec',
          borderRadius: 24,
          border: '1px solid #f3e6cd',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          padding: 32,
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 10,
          color: '#241209',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '2px solid #e8c766',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              padding: 4,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={kpLogo}
              alt="KP Clothing"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
              onError={(e) => {
                e.currentTarget.src = '/kp_logo.png';
              }}
            />
          </div>
          <span
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: '#7a2e2e',
              backgroundColor: '#fbf3e4',
              padding: '3px 10px',
              borderRadius: 99,
              border: '1px solid #d9c6a3',
              marginBottom: 8,
            }}
          >
            SECURE BOUTIQUE PORTAL
          </span>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#241209',
              margin: '6px 0',
            }}
          >
            Admin Login
          </h2>
          <p style={{ fontSize: 12, color: '#8a6a3f', margin: 0 }}>
            Enter your Spring Boot administrator credentials to access dashboard and inventory.
          </p>
        </div>

        {/* Error Alert Box */}
        {authError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              backgroundColor: '#fde8e8',
              border: '1px solid #f8b4b4',
              color: '#7a2e2e',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} color="#991b1b" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 700 }}>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#5c3a22',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Admin Username / Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 36px',
                  borderRadius: 10,
                  border: '1px solid #d9c6a3',
                  backgroundColor: '#fff',
                  fontSize: 14,
                  color: '#241209',
                  boxSizing: 'border-box',
                }}
              />
              <User
                size={16}
                color="#8a6a3f"
                style={{ position: 'absolute', left: 12, top: 13 }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#5c3a22',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 36px',
                  borderRadius: 10,
                  border: '1px solid #d9c6a3',
                  backgroundColor: '#fff',
                  fontSize: 14,
                  color: '#241209',
                  boxSizing: 'border-box',
                }}
              />
              <Lock
                size={16}
                color="#8a6a3f"
                style={{ position: 'absolute', left: 12, top: 13 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: '#241209',
              color: '#e8c766',
              padding: '13px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              marginTop: 6,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Shield size={16} />
            <span>{submitting ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            paddingTop: 16,
            marginTop: 20,
            borderTop: '1px solid #f3e6cd',
            fontSize: 11,
            color: '#8a6a3f',
          }}
        >
          Protected with Spring Security + JWT Authentication
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
