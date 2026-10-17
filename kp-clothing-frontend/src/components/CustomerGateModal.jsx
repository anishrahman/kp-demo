import React, { useState, useEffect } from 'react';
import kpLogo from '../assets/kp_logo.png';

/**
 * CustomerGateModal – login/profile modal matching demo's #gate .gc design.
 */
export default function CustomerGateModal({
  isOpen,
  customer,
  onClose,
  onSaveCustomer,
  onLogout,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone ? String(customer.phone).replace('+91', '').trim() : '');
      setCity(customer.city || '');
    } else {
      setName('');
      setPhone('');
      setCity('');
    }
    setNameError('');
    setPhoneError('');
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const validateName = (v) => v.trim().length >= 2;
  const validatePhone = (v) => {
    const d = v.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(d);
  };

  const handleNameBlur = () => {
    if (!validateName(name)) {
      setNameError('Enter your name (at least 2 letters).');
    } else {
      setNameError('');
    }
  };

  const handlePhoneBlur = () => {
    if (!validatePhone(phone)) {
      setPhoneError('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isNValid = validateName(name);
    const isPValid = validatePhone(phone);

    if (!isNValid) setNameError('Enter your name (at least 2 letters).');
    if (!isPValid) setPhoneError('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');

    if (!isNValid || !isPValid) return;

    const cleanPhone = '+91' + phone.replace(/\D/g, '');
    const updated = {
      id: customer?.id || 'cust-' + Date.now().toString(36),
      name: name.trim(),
      phone: cleanPhone,
      city: city.trim() || 'Chennai',
      at: customer?.at || new Date().toISOString().slice(0, 10),
    };

    onSaveCustomer(updated);
    onClose();
  };

  const isFormValid = validateName(name) && validatePhone(phone);

  return (
    <div
      className="ov"
      id="gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gt"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="gc" id="gf" noValidate onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="gl">
          <h2 id="gt">{customer ? 'Your details' : 'Login'}</h2>
          <p id="gs">
            {customer
              ? 'Update your name or phone number for fast WhatsApp checkouts'
              : 'Get access to your orders, new arrivals and offers'}
          </p>
          <div className="art">
            <span style={{ backgroundImage: `url(${kpLogo})` }} />
          </div>
        </div>

        {/* Right column */}
        <div className="gr">
          <button
            className="gx"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            &#10005;
          </button>
          <h3>Log in for the best experience</h3>
          <p className="sub">Enter your name and mobile number to continue</p>

          {/* Name Field */}
          <div className="fld">
            <label htmlFor="gn">Your name</label>
            <input
              id="gn"
              type="text"
              maxLength={60}
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              onBlur={handleNameBlur}
              placeholder="e.g. Priya Sharma"
            />
          </div>
          <small className="er" id="gne" role="alert">
            {nameError}
          </small>

          {/* Phone Field */}
          <div className="fld">
            <label htmlFor="gp">Phone number</label>
            <b>+91</b>
            <input
              id="gp"
              type="tel"
              inputMode="numeric"
              maxLength={15}
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              onBlur={handlePhoneBlur}
              placeholder="98765 43210"
            />
          </div>
          <small className="er" id="gpe" role="alert">
            {phoneError}
          </small>

          {/* City (optional) */}
          <div className="fld" style={{ marginTop: 8 }}>
            <label htmlFor="gc">City (optional)</label>
            <input
              id="gc"
              type="text"
              maxLength={60}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chennai, Bangalore"
            />
          </div>

          <button
            className="btn"
            id="gb"
            type="submit"
            disabled={!isFormValid}
            style={{ marginTop: 18 }}
          >
            {customer ? 'Save' : 'Continue'}
          </button>

          {customer && (
            <div>
              <button
                className="lnk"
                type="button"
                id="gout"
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
              >
                Sign out
              </button>
            </div>
          )}

          <p className="fine">
            By continuing, you agree that KP Clothing may contact you on WhatsApp about your orders and new arrivals.
          </p>
        </div>
      </form>
    </div>
  );
}
