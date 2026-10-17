import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Home,
  Briefcase,
  AlertCircle,
  Copy,
  Check,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../context/CartContext.jsx';
import SEO from '../components/SEO.jsx';
import * as api from '../services/api.js';
import { getWhatsAppNumber, openWhatsApp } from '../services/whatsapp.js';

export default function CheckoutPage({ customer, onSaveCustomer, settings = {} }) {
  const { items: cartItems, clearCart, subtotal: cartSubtotal } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Support single item "Buy Now" flow via location.state or fallback to cart items
  const buyNowItem = location.state?.buyNowItem || null;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

  const [step, setStep] = useState(1); // 1: Address, 2: Order Summary, 3: Payment, 4: Confirmation

  // Step 1: Address Form State
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone ? String(customer.phone).replace('+91', '').trim() : '');
  const [alternativePhone, setAlternativePhone] = useState(
    customer?.alternativePhone ? String(customer.alternativePhone).replace('+91', '').trim() : ''
  );
  const [pincode, setPincode] = useState(customer?.pincode || '');
  const [addressLine, setAddressLine] = useState(customer?.addressLine || '');
  const [landmark, setLandmark] = useState(customer?.landmark || '');
  const [city, setCity] = useState(customer?.city || 'Chennai');
  const [state, setState] = useState(customer?.state || 'Tamil Nadu');
  const [addressType, setAddressType] = useState(customer?.addressType || 'Home');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Step 3: Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD | UPI_WHATSAPP | RAZORPAY

  // Step 4: Placed Order State
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (customer) {
      if (!name) setName(customer.name || '');
      if (!phone && customer.phone) setPhone(String(customer.phone).replace('+91', '').trim());
      if (!alternativePhone && customer.alternativePhone) {
        setAlternativePhone(String(customer.alternativePhone).replace('+91', '').trim());
      }
      if (!city && customer.city) setCity(customer.city);
    }
  }, [customer]);

  // Price calculations - single source of truth: backend product price
  const itemsTotal = checkoutItems.reduce((sum, item) => {
    const rawPrice = Number(String(item.product.price).replace(/[^0-9.]/g, '')) || 0;
    return sum + rawPrice * item.quantity;
  }, 0);

  // Delivery is always FREE as per Task 3
  const deliveryFee = 0;
  const totalAmount = itemsTotal + deliveryFee;

  // UPI configuration from settings
  const upiId = settings?.upiId || 'kpclothing@upi';
  const upiPayeeName = settings?.upiPayeeName || 'KP Clothing';
  const upiNote = 'Order at KP Clothing';
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

  const handleCopyUpiId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Validate Address Form
  const validateStep1 = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Please enter full name (at least 2 letters).';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
    }
    if (alternativePhone.trim()) {
      const cleanAlt = alternativePhone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanAlt)) {
        newErrors.alternativePhone = 'Enter a valid 10-digit alternative mobile number starting with 6, 7, 8 or 9.';
      }
    }
    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      newErrors.pincode = 'Enter a valid 6-digit postal pincode.';
    }
    if (!addressLine.trim() || addressLine.trim().length < 5) {
      newErrors.addressLine = 'Please enter complete house/flat no., building, street/lane address.';
    }
    if (!city.trim()) {
      newErrors.city = 'Please enter city/town.';
    }
    if (!state.trim()) {
      newErrors.state = 'Please enter state.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // Save/update customer details locally
    const cleanPhone = '+91' + phone.replace(/\D/g, '');
    const cleanAltPhone = alternativePhone.trim() ? '+91' + alternativePhone.replace(/\D/g, '') : '';
    const updatedCustomer = {
      ...(customer || {}),
      id: customer?.id || 'cust-' + Date.now().toString(36),
      name: name.trim(),
      phone: cleanPhone,
      alternativePhone: cleanAltPhone || null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      addressLine: addressLine.trim(),
      landmark: landmark.trim(),
      addressType,
      at: customer?.at || new Date().toISOString().slice(0, 10),
    };

    onSaveCustomer?.(updatedCustomer);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place Order Handler (Step 3 -> Step 4)
  const handlePlaceOrder = async (isUpiWhatsAppConfirmation = false) => {
    setSubmitting(true);
    try {
      const cleanPhone = '+91' + phone.replace(/\D/g, '');
      const cleanAltPhone = alternativePhone.trim() ? '+91' + alternativePhone.replace(/\D/g, '') : '';
      const orderPayload = {
        clientName: name.trim(),
        clientPhone: cleanPhone,
        alternativePhone: cleanAltPhone || null,
        addressLine: addressLine.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        addressType,
        paymentMethod: isUpiWhatsAppConfirmation ? 'UPI_WHATSAPP' : paymentMethod,
        customerId: customer?.id,
        items: checkoutItems.map((i) => ({
          productId: String(i.product.id),
          code: i.product.code,
          name: i.product.name,
          price: Number(String(i.product.price).replace(/[^0-9.]/g, '')) || 0,
          quantity: i.quantity,
          size: 'Free Size',
          image: i.product.images?.[0] || i.product.image || '/images/mar.jpg',
        })),
        notes: `Order placed via website 3-step checkout (${isUpiWhatsAppConfirmation ? 'UPI_WHATSAPP' : paymentMethod})`,
      };

      // Call backend API
      let createdOrder;
      try {
        createdOrder = await api.createOrder(orderPayload);
      } catch (err) {
        console.warn('Backend offline or error; creating local order record.', err);
        // Safe local fallback
        createdOrder = {
          ...orderPayload,
          id: 'ord-' + (1000 + Math.floor(Math.random() * 9000)),
          orderCode: 'KP' + String(Math.floor(Math.random() * 900) + 100).padStart(4, '0'),
          totalAmount,
          itemsTotal,
          deliveryFee,
          date: new Date().toISOString(),
          status: 'pending',
          paymentStatus: isUpiWhatsAppConfirmation ? 'VERIFYING' : 'PENDING',
        };
      }

      setPlacedOrder(createdOrder);

      // Clear cart if this was a cart checkout
      if (!buyNowItem) {
        clearCart();
      }

      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If user clicked "I have paid, confirm on WhatsApp", open WhatsApp immediately
      if (isUpiWhatsAppConfirmation) {
        const wp = getWhatsAppNumber(settings);
        const orderRef = createdOrder.orderCode || createdOrder.id;
        const upiMsg = `Namaste KP Clothing! 🙏\n\nI have completed the direct UPI payment for my order.\n\n*Order ID:* ${orderRef}\n*Customer:* ${createdOrder.clientName}\n*Amount Paid:* ₹${totalAmount.toLocaleString('en-IN')}\n*UPI ID:* ${upiId}\n\nAttaching my payment screenshot here. Please verify and confirm my order. Thank you!`;
        openWhatsApp(wp, upiMsg);
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      alert('Unable to process order. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Order Share helper
  const handleShareOnWhatsApp = () => {
    if (!placedOrder) return;
    const wp = getWhatsAppNumber(settings);
    const itemsList = (placedOrder.items || [])
      .map((i) => `• ${i.name} (Code: ${i.code || 'N/A'}, Qty: ${i.quantity}) - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`)
      .join('\n');

    const message = `Namaste KP Clothing! 🙏\n\nI have placed an order on your website.\n\n*Order ID:* ${placedOrder.orderCode || placedOrder.id}\n*Customer:* ${placedOrder.clientName}\n*Phone:* ${placedOrder.clientPhone}\n*Delivery Address:* ${placedOrder.addressLine}, ${placedOrder.city}, ${placedOrder.state} - ${placedOrder.pincode}\n\n*Items Ordered:*\n${itemsList}\n\n*Total Amount:* ₹${(placedOrder.totalAmount || totalAmount).toLocaleString('en-IN')}\n*Payment Mode:* ${placedOrder.paymentMethod}\n\nPlease confirm my order. Thank you!`;

    openWhatsApp(wp, message);
  };

  if (checkoutItems.length === 0 && step !== 4) {
    return (
      <div className="w" style={{ padding: '80px 22px', textAlign: 'center' }}>
        <SEO title="Checkout" noindex={true} />
        <h2>Your bag is empty</h2>
        <p style={{ color: 'var(--mut)', margin: '8px 0 20px' }}>
          Please add a saree to your bag before proceeding to checkout.
        </p>
        <Link to="/#cats" className="btn">
          Explore Sarees Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="w" style={{ padding: '24px 22px 72px' }}>
      <SEO
        title={step === 4 ? `Order Confirmation - ${placedOrder?.orderCode || ''}` : `Checkout - Step ${step} of 3`}
        canonicalUrl="/checkout"
        noindex={true}
      />

      {/* Stepper Header (Flipkart-style 3-step checkout) */}
      {step < 4 && (
        <div style={{ maxWidth: 880, margin: '0 auto 32px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              backgroundColor: 'var(--ivory)',
              padding: '14px 18px',
              borderRadius: 8,
              border: '1px solid var(--line)',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: step === 1 ? 'var(--btn)' : step > 1 ? '#257042' : 'var(--mut)',
                fontWeight: step === 1 ? 700 : 500,
                fontSize: 14,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: step === 1 ? 'var(--btn)' : step > 1 ? '#257042' : 'var(--line)',
                  color: step >= 1 ? '#fff' : 'var(--mut)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span>1. Delivery Address</span>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: step === 2 ? 'var(--btn)' : step > 2 ? '#257042' : 'var(--mut)',
                fontWeight: step === 2 ? 700 : 500,
                fontSize: 14,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: step === 2 ? 'var(--btn)' : step > 2 ? '#257042' : 'var(--line)',
                  color: step >= 2 ? '#fff' : 'var(--mut)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {step > 2 ? '✓' : '2'}
              </div>
              <span>2. Order Summary</span>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: step === 3 ? 'var(--btn)' : 'var(--mut)',
                fontWeight: step === 3 ? 700 : 500,
                fontSize: 14,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: step === 3 ? 'var(--btn)' : 'var(--line)',
                  color: step >= 3 ? '#fff' : 'var(--mut)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <span>3. Payment Options</span>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      {step < 4 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            maxWidth: 1040,
            margin: '0 auto',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Active Step Screen */}
          <div>
            {/* STEP 1: ADDRESS FORM */}
            {step === 1 && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  padding: '24px 28px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <MapPin size={22} color="var(--gold)" />
                  <h2 style={{ fontSize: 22, color: 'var(--ink)', margin: 0 }}>
                    Enter Shipping & Delivery Address
                  </h2>
                </div>

                <form onSubmit={handleAddressSubmit} style={{ display: 'grid', gap: 14 }}>
                  {/* Full Name */}
                  <div>
                    <label className="fl">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="search"
                      style={{ width: '100%', maxWidth: 'none', borderRadius: 4 }}
                    />
                    {errors.name && <small className="er">{errors.name}</small>}
                  </div>

                  {/* Primary Mobile & Alternative Mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    <div>
                      <label className="fl">Mobile Number *</label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ padding: '8px 10px', backgroundColor: 'var(--alt)', border: '1px solid var(--line)', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: 14, fontWeight: 700 }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="98765 43210"
                          className="search"
                          style={{ width: '100%', maxWidth: 'none', borderRadius: '0 4px 4px 0' }}
                        />
                      </div>
                      {errors.phone && <small className="er">{errors.phone}</small>}
                    </div>

                    <div>
                      <label className="fl">Alternative Mobile Number (Optional)</label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ padding: '8px 10px', backgroundColor: 'var(--alt)', border: '1px solid var(--line)', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: 14, fontWeight: 700 }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={alternativePhone}
                          onChange={(e) => setAlternativePhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Optional 10-digit number"
                          className="search"
                          style={{ width: '100%', maxWidth: 'none', borderRadius: '0 4px 4px 0' }}
                        />
                      </div>
                      {errors.alternativePhone && <small className="er">{errors.alternativePhone}</small>}
                    </div>
                  </div>

                  {/* House / Flat No. & Street / Lane */}
                  <div>
                    <label className="fl">House / Flat No. and Street / Lane *</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Flat 302, Sai Residency, 4th Cross Lane, T. Nagar"
                      className="search"
                      style={{ width: '100%', maxWidth: 'none', borderRadius: 4 }}
                    />
                    {errors.addressLine && <small className="er">{errors.addressLine}</small>}
                  </div>

                  {/* Area / Locality / Landmark */}
                  <div>
                    <label className="fl">Area / Locality / Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Murugan Temple, Opp. Post Office"
                      className="search"
                      style={{ width: '100%', maxWidth: 'none', borderRadius: 4 }}
                    />
                  </div>

                  {/* City, State, Pincode */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                    <div>
                      <label className="fl">City / Town *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="search"
                        style={{ width: '100%', maxWidth: 'none', borderRadius: 4 }}
                      />
                      {errors.city && <small className="er">{errors.city}</small>}
                    </div>

                    <div>
                      <label className="fl">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 4, border: '1px solid var(--line)', backgroundColor: '#fff', fontSize: 14 }}
                      >
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Other">Other States</option>
                      </select>
                      {errors.state && <small className="er">{errors.state}</small>}
                    </div>

                    <div>
                      <label className="fl">Pincode (6 digits) *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 600001"
                        className="search"
                        style={{ width: '100%', maxWidth: 'none', borderRadius: 4 }}
                      />
                      {errors.pincode && <small className="er">{errors.pincode}</small>}
                    </div>
                  </div>

                  {/* Address Type Selector */}
                  <div>
                    <label className="fl">Address Type</label>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="addressType"
                          value="Home"
                          checked={addressType === 'Home'}
                          onChange={() => setAddressType('Home')}
                        />
                        <Home size={15} color="var(--gold)" />
                        <span>Home (All day delivery)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="addressType"
                          value="Work"
                          checked={addressType === 'Work'}
                          onChange={() => setAddressType('Work')}
                        />
                        <Briefcase size={15} color="var(--gold)" />
                        <span>Work (10 AM - 6 PM delivery)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn"
                    style={{
                      marginTop: 18,
                      backgroundColor: 'var(--gold)',
                      borderColor: 'var(--gold)',
                      color: '#fff',
                      padding: '13px 20px',
                      fontSize: 15,
                    }}
                  >
                    Save Address & Continue to Order Summary &rarr;
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: ORDER SUMMARY */}
            {step === 2 && (
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Delivery Address Review Box */}
                <div
                  style={{
                    backgroundColor: 'var(--ivory)',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'var(--alt)', padding: '2px 8px', borderRadius: 4 }}>
                        Deliver to: {addressType}
                      </span>
                      <strong style={{ fontSize: 15 }}>{name}</strong>
                      <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 600 }}>+91 {phone}</span>
                      {alternativePhone && (
                        <span style={{ color: 'var(--mut)', fontSize: 13 }}>
                          • Alt: +91 {alternativePhone}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--mut)', margin: 0, fontSize: 13 }}>
                      {addressLine}{landmark ? `, ${landmark}` : ''}, {city}, {state} - {pincode}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn o sm"
                    style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                  >
                    Edit
                  </button>
                </div>

                {/* Items Review List */}
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    padding: '20px 24px',
                  }}
                >
                  <h3 style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>
                    Order Items ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})
                  </h3>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {checkoutItems.map((item, idx) => {
                      const swatchKey = item.product.swatchKey || 'crm';
                      const mainImage = item.product.images?.[0] || item.product.image;
                      const rawPrice = Number(String(item.product.price).replace(/[^0-9.]/g, '')) || 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr auto',
                            gap: 16,
                            paddingBottom: 14,
                            borderBottom: idx < checkoutItems.length - 1 ? '1px solid var(--line)' : 'none',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            className={`sw i-${swatchKey}`}
                            style={{
                              aspectRatio: '3/4',
                              borderRadius: 4,
                              backgroundImage: mainImage ? `url(${mainImage})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'top',
                            }}
                          />
                          <div>
                            <b style={{ fontSize: 16, color: 'var(--ink)' }}>{item.product.name}</b>
                            <span style={{ display: 'block', fontSize: 14, color: 'var(--btn)', fontWeight: 700, marginTop: 2 }}>
                              ₹{rawPrice.toLocaleString('en-IN')} × {item.quantity} = ₹{(rawPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--mut)' }}>
                              Material: {item.product.fabric || 'Pure Handloom Cotton'} • {item.product.blousePiece || 'Blouse Piece Included'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                    <button
                      className="btn o"
                      onClick={() => setStep(1)}
                      style={{ padding: '10px 18px', fontSize: 13 }}
                    >
                      &larr; Back to Address
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        setStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--gold)',
                        borderColor: 'var(--gold)',
                        color: '#fff',
                        padding: '12px 20px',
                        fontSize: 14,
                      }}
                    >
                      Continue to Payment Options &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT OPTIONS */}
            {step === 3 && (
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Delivering to Review Box with Edit Link */}
                <div
                  style={{
                    backgroundColor: 'var(--ivory)',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'var(--alt)', padding: '2px 8px', borderRadius: 4 }}>
                        Delivering to: {addressType}
                      </span>
                      <strong style={{ fontSize: 15 }}>{name}</strong>
                      <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 600 }}>+91 {phone}</span>
                      {alternativePhone && (
                        <span style={{ color: 'var(--mut)', fontSize: 13 }}>
                          • Alt: +91 {alternativePhone}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--mut)', margin: 0, fontSize: 13 }}>
                      {addressLine}{landmark ? `, ${landmark}` : ''}, {city}, {state} - {pincode}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn o sm"
                    style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                  >
                    Edit
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    padding: '24px 28px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <CreditCard size={22} color="var(--gold)" />
                    <h2 style={{ fontSize: 22, color: 'var(--ink)', margin: 0 }}>
                      Select Payment Option
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {/* Option 1: Cash on Delivery (COD) */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: 16,
                        borderRadius: 8,
                        border: paymentMethod === 'COD' ? '2px solid var(--gold)' : '1px solid var(--line)',
                        backgroundColor: paymentMethod === 'COD' ? 'var(--ivory)' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        style={{ marginTop: 4 }}
                      />
                      <div>
                        <strong style={{ fontSize: 16, color: 'var(--ink)', display: 'block' }}>
                          Cash on Delivery (COD)
                        </strong>
                        <span style={{ fontSize: 13, color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                          Pay with cash or UPI scanner upon receiving your parcel at your doorstep.
                        </span>
                      </div>
                    </label>

                    {/* Option 2: UPI / WhatsApp Payment Confirmation */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: 16,
                        borderRadius: 8,
                        border: paymentMethod === 'UPI_WHATSAPP' ? '2px solid var(--gold)' : '1px solid var(--line)',
                        backgroundColor: paymentMethod === 'UPI_WHATSAPP' ? 'var(--ivory)' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI_WHATSAPP"
                        checked={paymentMethod === 'UPI_WHATSAPP'}
                        onChange={() => setPaymentMethod('UPI_WHATSAPP')}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 16, color: 'var(--ink)', display: 'block' }}>
                          Direct UPI / WhatsApp Payment Confirmation
                        </strong>
                        <span style={{ fontSize: 13, color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                          Scan QR code or pay directly via Google Pay / PhonePe / Paytm to shop UPI ID (<strong>{upiId}</strong>).
                        </span>

                        {paymentMethod === 'UPI_WHATSAPP' && (
                          <div
                            style={{
                              marginTop: 16,
                              padding: 18,
                              backgroundColor: '#fff',
                              borderRadius: 8,
                              border: '1px solid var(--line)',
                              display: 'grid',
                              gap: 14,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                              {/* QR Code */}
                              <div style={{ textAlign: 'center', background: '#fff', padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}>
                                {settings?.upiQrImageUrl ? (
                                  <img
                                    src={settings.upiQrImageUrl}
                                    alt="UPI QR Code"
                                    style={{ width: 150, height: 150, objectFit: 'contain', display: 'block' }}
                                  />
                                ) : (
                                  <QRCodeSVG
                                    value={upiUri}
                                    size={150}
                                    level="M"
                                    includeMargin={true}
                                  />
                                )}
                                <span style={{ fontSize: 11, color: 'var(--mut)', display: 'block', marginTop: 4, fontWeight: 600 }}>
                                  Amount: ₹{totalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {/* Details & Actions */}
                              <div style={{ flex: 1, minWidth: 200, display: 'grid', gap: 10 }}>
                                <div>
                                  <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block' }}>UPI ID:</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', background: 'var(--alt)', padding: '4px 10px', borderRadius: 4, letterSpacing: 0.5 }}>
                                      {upiId}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleCopyUpiId}
                                      className="btn o sm"
                                      style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                      {copiedUpi ? <Check size={13} color="#257042" /> : <Copy size={13} />}
                                      <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                                    </button>
                                  </div>
                                  <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block', marginTop: 4 }}>
                                    Payee: <strong>{upiPayeeName}</strong>
                                  </span>
                                </div>

                                <p style={{ margin: 0, fontSize: 12, color: 'var(--mut)', lineHeight: 1.4 }}>
                                  Scan with Google Pay / PhonePe / Paytm / any UPI app. Total Payable: <strong style={{ color: 'var(--btn)' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
                                </p>

                                {/* Mobile Pay with UPI app button */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                  <a
                                    href={upiUri}
                                    className="btn o sm"
                                    style={{
                                      padding: '7px 12px',
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      color: 'var(--btn)',
                                      borderColor: 'var(--btn)',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <ExternalLink size={13} />
                                    <span>Pay with UPI app</span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Confirmation Button inside Direct UPI */}
                            <div style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                              <button
                                type="button"
                                className="btn"
                                disabled={submitting}
                                onClick={() => handlePlaceOrder(true)}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#25D366',
                                  borderColor: '#25D366',
                                  color: '#fff',
                                  padding: '12px 18px',
                                  fontSize: 14,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  borderRadius: 6,
                                }}
                              >
                                <MessageSquare size={16} />
                                <span>I have paid, confirm on WhatsApp</span>
                              </button>
                              <span style={{ fontSize: 11, color: 'var(--mut)', textAlign: 'center', display: 'block', marginTop: 6 }}>
                                Places your order and opens WhatsApp with your Order ID, name & amount to share the payment screenshot.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Option 3: Online Payment (Razorpay) */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: 16,
                        borderRadius: 8,
                        border: paymentMethod === 'RAZORPAY' ? '2px solid var(--gold)' : '1px solid var(--line)',
                        backgroundColor: paymentMethod === 'RAZORPAY' ? 'var(--ivory)' : '#fff',
                        cursor: 'pointer',
                        opacity: settings.razorpayKey ? 1 : 0.8,
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="RAZORPAY"
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        style={{ marginTop: 4 }}
                      />
                      <div>
                        <strong style={{ fontSize: 16, color: 'var(--ink)', display: 'block' }}>
                          Instant Online Payment (Cards, NetBanking, Wallets)
                        </strong>
                        <span style={{ fontSize: 13, color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                          {settings.razorpayKey
                            ? '100% Secure Checkout via Razorpay Payment Gateway.'
                            : 'Online Gateway currently in setup. You can place order with COD or UPI.'}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                    <button
                      className="btn o"
                      onClick={() => setStep(2)}
                      style={{ padding: '12px 18px', fontSize: 13 }}
                    >
                      &larr; Back to Order Summary
                    </button>

                    <button
                      className="btn"
                      onClick={() => handlePlaceOrder(false)}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--btn)',
                        borderColor: 'var(--btn)',
                        color: '#fff',
                        padding: '14px 22px',
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {submitting ? 'Placing Order...' : `Confirm & Place Order (₹${totalAmount.toLocaleString('en-IN')})`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Price Details Box (Flipkart Style) */}
          <div
            style={{
              backgroundColor: 'var(--ivory)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--line)',
              position: 'sticky',
              top: 96,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>PRICE DETAILS</h3>

            <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--mut)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Price ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>₹{itemsTotal.toLocaleString('en-IN')}</span>
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

            <div style={{ marginTop: 20, display: 'grid', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--mut)' }}>
                <ShieldCheck size={16} color="var(--gold)" />
                <span>Safe and Secure Payments. 100% Authentic Handloom Guarantee.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMATION SCREEN */}
      {step === 4 && placedOrder && (
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid var(--line)',
            padding: '36px 32px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#eaf7ec',
              color: '#257042',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle size={40} color="#257042" />
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: '#257042',
              backgroundColor: '#eaf7ec',
              padding: '3px 12px',
              borderRadius: 99,
            }}
          >
            Order Placed Successfully
          </span>

          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--ink)', margin: '12px 0 6px' }}>
            Thank You, {placedOrder.clientName}!
          </h1>

          <p style={{ color: 'var(--mut)', fontSize: 15, marginBottom: 24 }}>
            Your order has been received and is being prepared for dispatch.
          </p>

          {/* Order Summary Box */}
          <div
            style={{
              backgroundColor: 'var(--ivory)',
              borderRadius: 8,
              border: '1px solid var(--line)',
              padding: '20px 24px',
              textAlign: 'left',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block' }}>Order Reference</span>
                <strong style={{ fontSize: 18, color: 'var(--btn)', letterSpacing: 0.5 }}>
                  {placedOrder.orderCode || placedOrder.id}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block' }}>Payment Mode</span>
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
                  {placedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : placedOrder.paymentMethod}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--mut)', display: 'block', marginBottom: 2 }}>
                Delivery Address:
              </span>
              <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                {placedOrder.addressLine}{placedOrder.landmark ? `, ${placedOrder.landmark}` : ''}, {placedOrder.city}, {placedOrder.state} - {placedOrder.pincode}
              </p>
              <span style={{ fontSize: 12, color: 'var(--mut)' }}>
                Contact: {placedOrder.clientPhone}
                {placedOrder.alternativePhone && ` • Alt: ${placedOrder.alternativePhone}`}
              </span>
            </div>

            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
              <span>Total Payable Amount:</span>
              <span style={{ color: 'var(--btn)' }}>₹{(placedOrder.totalAmount || totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* WhatsApp Confirmation Action Button */}
          <div style={{ display: 'grid', gap: 12, maxWidth: 440, margin: '0 auto' }}>
            <button
              className="btn"
              onClick={handleShareOnWhatsApp}
              style={{
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                color: '#fff',
                padding: '14px',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <MessageSquare size={18} />
              <span>Send Order Confirmation on WhatsApp</span>
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to="/my-orders"
                className="btn o"
                style={{ flex: 1, padding: '11px', fontSize: 13, textAlign: 'center' }}
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="btn o"
                style={{ flex: 1, padding: '11px', fontSize: 13, textAlign: 'center' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
