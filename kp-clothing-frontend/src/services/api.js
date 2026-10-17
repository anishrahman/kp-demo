// src/services/api.js
// Ported from kp-clothing-saree-fullstack/src/lib/api.ts (TypeScript → JavaScript)
import { normalizeCategoryName, getCategoryIdForName, STORE_CATEGORIES, normalizeCategoryItem } from '../constants/categories.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const API_SERVER_URL = API_BASE.replace(/\/api$/, '');

export function resolveMediaUrl(url) {
  if (!url) return '';
  const str = String(url).trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str;
  }
  if (str.startsWith('/uploads/')) {
    return `${API_SERVER_URL}${str}`;
  }
  if (str.startsWith('uploads/')) {
    return `${API_SERVER_URL}/${str}`;
  }
  return str;
}

let adminToken = localStorage.getItem('kp_admin_token') || '';

export function setAdminToken(token) {
  adminToken = token;
  if (token) localStorage.setItem('kp_admin_token', token);
  else localStorage.removeItem('kp_admin_token');
}

export function hasAdminToken() {
  return Boolean(adminToken);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (adminToken) headers.set('Authorization', `Bearer ${adminToken}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined;
  return response.json();
}

export const normalizeProduct = (p) => {
  const isUpcoming = Boolean(p.upcoming ?? p.isUpcoming ?? (p.status === 'UPCOMING'));
  let stockQty = p.inStock ? 10 : 0;
  if (typeof p.stockQuantity === 'number') {
    stockQty = p.stockQuantity;
  } else if (p.details) {
    try {
      const parsed = JSON.parse(p.details);
      if (typeof parsed.stockQuantity === 'number') stockQty = parsed.stockQuantity;
    } catch {
      // details was plain text
    }
  }

  // Preserve real category name
  const rawCat = p.category && p.category.toLowerCase() !== 'sarees' ? p.category : 'Chettinad Cotton';
  const catName = rawCat.trim();
  const images = Array.isArray(p.images) ? p.images.map(resolveMediaUrl).filter(Boolean) : [];
  const media = Array.isArray(p.media)
    ? p.media.map((m) => ({ ...m, url: resolveMediaUrl(m.url) }))
    : [];

  const videoObj = media.find((m) => m.type === 'VIDEO');
  const videoUrl = resolveMediaUrl(p.videoUrl || videoObj?.url || '');

  return {
    id: String(p.id),
    code: p.code || '',
    name: p.name || '',
    category: catName,
    cid: getCategoryIdForName(catName),
    slug: p.slug || '',
    price: Number(p.price || 0).toLocaleString('en-IN'),
    rawPrice: Number(p.price || 0),
    description: p.description || '',
    highlights: Array.isArray(p.highlights) ? p.highlights.filter(Boolean) : [],
    sareeLength: p.sareeLength || '',
    blousePiece: p.blousePiece || '',
    fabric: p.fabric || '',
    fabricWeight: p.fabricWeight || '',
    weaveDetails: p.weaveDetails || '',
    careInstructions: p.careInstructions || '',
    authenticityNote: p.authenticityNote || '',
    availabilityText: p.availabilityText || '',
    images,
    media,
    videoUrl,
    stock: isUpcoming ? false : Boolean(p.inStock && stockQty > 0),
    stockQuantity: isUpcoming ? 0 : stockQty,
    featured: Boolean(p.featured),
    sizes: ['Free Size'],
    isUpcoming,
    status: isUpcoming ? 'UPCOMING' : (stockQty > 0 && p.inStock !== false ? 'AVAILABLE' : 'OUT_OF_STOCK'),
  };
};

export const toBackendProduct = (p) => {
  const isUpcoming = p.status === 'UPCOMING' || Boolean(p.isUpcoming);
  const stockQty = typeof p.stockQuantity === 'number' ? p.stockQuantity : (p.stock ? 10 : 0);
  const inStock = isUpcoming ? false : stockQty > 0;
  const rawPrice = Number(String(p.price).replace(/[^0-9.]/g, '')) || 0;

  return {
    id: p.id || undefined,
    code: p.code,
    name: p.name,
    category: (p.category || 'Chettinad Cotton').trim(),
    price: rawPrice,
    images: (p.images || []).map(resolveMediaUrl),
    media: p.media || [],
    description: p.description || '',
    highlights: Array.isArray(p.highlights) ? p.highlights.filter(Boolean) : [],
    sareeLength: p.sareeLength || '',
    blousePiece: p.blousePiece || '',
    fabric: p.fabric || '',
    fabricWeight: p.fabricWeight || '',
    weaveDetails: p.weaveDetails || '',
    careInstructions: p.careInstructions || '',
    authenticityNote: p.authenticityNote || '',
    availabilityText: p.availabilityText || '',
    details: JSON.stringify({ stockQuantity: stockQty }),
    weaver: p.weaver || '',
    handloom: p.handloom !== false,
    inStock,
    upcoming: isUpcoming,
  };
};

export async function loginAdmin(username, password) {
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAdminToken(data.token);
    return true;
  } catch (err) {
    // If backend is not running or unreachable, allow default credentials
    if (
      (username === 'admin' || username === 'admin@kpclothing.com') &&
      password === 'changeme123'
    ) {
      const demoToken = 'demo-admin-token-' + Date.now();
      setAdminToken(demoToken);
      return true;
    }
    throw err;
  }
}

export function logoutAdmin() {
  setAdminToken('');
}

export async function getCategories() {
  try {
    const data = await request('/categories');
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeCategoryItem);
    }
  } catch (err) {
    console.warn('Backend categories unavailable, using local default:', err);
  }
  return STORE_CATEGORIES;
}

export async function createCategory(name, description = '') {
  const data = await request('/categories', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), description: description.trim() }),
  });
  return normalizeCategoryItem(data);
}

export async function getProducts() {
  const data = await request('/products');
  if (!Array.isArray(data)) return [];
  return data.map(normalizeProduct);
}

export async function saveProduct(product) {
  const method = product.id ? 'PUT' : 'POST';
  const path = product.id ? `/products/${encodeURIComponent(product.id)}` : '/products';
  const data = await request(path, { method, body: JSON.stringify(toBackendProduct(product)) });
  return normalizeProduct(data);
}

export async function deleteProduct(id) {
  await request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function uploadImage(file, slot) {
  const form = new FormData();
  form.append('file', file);
  if (slot) form.append('slot', slot);
  const data = await request('/upload', { method: 'POST', body: form });
  return resolveMediaUrl(data.url);
}

export async function getOrders() {
  const data = await request('/orders');
  return data.map((o) => ({
    id: String(o.id),
    orderCode: o.orderCode || String(o.id),
    createdAt: o.date || new Date().toISOString(),
    customerName: o.clientName || '',
    customerPhone: o.clientPhone || '',
    customerAlternativePhone: o.alternativePhone || '',
    customerAddressLine: o.addressLine || '',
    customerLandmark: o.landmark || '',
    customerCity: o.city || '',
    customerState: o.state || '',
    customerPincode: o.pincode || '',
    clientAddress: o.clientAddress || '',
    addressType: o.addressType || 'Home',
    paymentMethod: o.paymentMethod || 'COD',
    items: Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((it) => ({
          productCode: it.code || it.productId || '',
          name: it.name || '',
          price: Number(it.price || 0).toLocaleString('en-IN'),
          quantity: it.quantity || 1,
          size: it.size || 'Free Size',
          image: resolveMediaUrl(it.image),
        }))
      : o.productCode ? [{
          productCode: o.productCode,
          name: o.productName || '',
          price: Number(o.productPrice || 0).toLocaleString('en-IN'),
          quantity: o.quantity || 1,
          size: o.size || 'Free Size',
          image: resolveMediaUrl(o.productImage),
        }] : [],
    totalAmount: Number(o.totalAmount || (o.productPrice || 0) * (o.quantity || 1)).toLocaleString('en-IN'),
    status: normalizeOrderStatus(o.status),
    notes: o.notes || '',
  }));
}

function normalizeOrderStatus(value) {
  const v = String(value || 'ORDER PLACED').trim().toUpperCase();
  const map = {
    'ORDER PLACED': 'ORDER PLACED',
    'PENDING': 'ORDER PLACED',
    'PROCESSING': 'PROCESSING',
    'CONFIRMED': 'PROCESSING',
    'PACKED': 'PACKED',
    'SHIPPED': 'SHIPPED',
    'OUT FOR DELIVERY': 'OUT FOR DELIVERY',
    'DELIVERED': 'DELIVERED',
    'COMPLETED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
  };
  return map[v] || value || 'ORDER PLACED';
}

export async function createOrder(order) {
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const primaryItem = items[0] || {};
  const fullAddress = [order.addressLine, order.landmark, order.city, order.state, order.pincode].filter(Boolean).join(', ')
    || order.clientAddress || order.customerCity || 'Chennai, Tamil Nadu';

  const body = {
    ...order,
    clientName: order.clientName || order.customerName || 'Customer',
    clientPhone: order.clientPhone || order.customerPhone || '',
    alternativePhone: order.alternativePhone || order.customerAlternativePhone || '',
    clientAddress: fullAddress,
    addressLine: order.addressLine || fullAddress,
    landmark: order.landmark || '',
    city: order.city || order.customerCity || 'Chennai',
    state: order.state || 'Tamil Nadu',
    pincode: order.pincode ? String(order.pincode).replace(/\D/g, '') : '600001',
    addressType: order.addressType || 'Home',
    paymentMethod: order.paymentMethod || 'COD',
    customerId: order.customerId,
    productCode: primaryItem.code || primaryItem.productCode || 'CUSTOM-ORDER',
    productName: primaryItem.name || 'Handloom Saree',
    productPrice: Number(String(primaryItem.price || 0).replace(/[^0-9.]/g, '')) || 0,
    productImage: resolveMediaUrl(primaryItem.image || primaryItem.productImage || ''),
    quantity: primaryItem.quantity || 1,
    size: primaryItem.size || 'Free Size',
    items: items.map((it) => ({
      productId: String(it.productId || it.id || ''),
      code: it.code || it.productCode || '',
      name: it.name || '',
      price: Number(String(it.price || 0).replace(/[^0-9.]/g, '')) || 0,
      quantity: it.quantity || 1,
      size: it.size || 'Free Size',
      image: resolveMediaUrl(it.image),
    })),
    notes: order.notes || 'Order placed via website checkout',
  };

  return request('/orders', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateOrderStatus(id, status) {
  await request(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getCustomerOrders(phone) {
  const clean = (phone || '').replace(/\D/g, '');
  return request(`/orders/mine?phone=${encodeURIComponent(clean)}`);
}

export async function getOrderByCode(code) {
  return request(`/orders/code/${encodeURIComponent(code)}`);
}

export async function getCustomers() {
  const data = await request('/customers');
  return data.map((c) => ({
    id: String(c.id),
    name: c.name || '',
    phone: c.phone || '',
    alternativePhone: c.alternativePhone || '',
    addressLine: c.addressLine || '',
    landmark: c.landmark || '',
    city: c.city || '',
    state: c.state || '',
    pincode: c.pincode || '',
    fullAddress: c.fullAddress || '',
    email: c.email || undefined,
    firstSeen: c.dateRegistered ? String(c.dateRegistered).slice(0, 10) : '',
    orderCount: Number(c.orderCount || 0),
    totalSpent: Number(c.totalSpent || 0),
  }));
}

export async function registerCustomer(customer) {
  const c = await request('/customers/register', {
    method: 'POST',
    body: JSON.stringify({
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      email: customer.email || '',
    }),
  });
  return {
    ...customer,
    id: String(c.id),
    firstSeen: c.dateRegistered ? String(c.dateRegistered).slice(0, 10) : customer.firstSeen,
  };
}

const defaultSettings = {
  brandName: 'KP CLOTHING',
  brandTagline: 'COMFORT MEETS ELEGANCE',
  address: 'Chennai, Tamil Nadu',
  phone: '',
  whatsappPhone: '917397335037',
  upiId: 'kpclothing@upi',
  upiPayeeName: 'KP Clothing',
  upiQrImageUrl: '',
  aboutHeading: 'Our Story & Artisanal Heritage',
  aboutText: 'Handpicked sarees with a focus on comfort, craftsmanship and timeless elegance.',
  bannerText: '',
};

export async function getSettings() {
  const s = await request('/settings');
  return {
    brandName: s.brandName || defaultSettings.brandName,
    brandTagline: s.brandTagline || defaultSettings.brandTagline,
    address: s.address || defaultSettings.address,
    phone: s.phone || '',
    whatsappPhone: s.whatsappPhone || defaultSettings.whatsappPhone,
    upiId: s.upiId || defaultSettings.upiId,
    upiPayeeName: s.upiPayeeName || defaultSettings.upiPayeeName,
    upiQrImageUrl: s.upiQrImageUrl || defaultSettings.upiQrImageUrl,
    aboutHeading: s.aboutHeading || s.storyTitle || defaultSettings.aboutHeading,
    aboutText: s.aboutText || s.storyContent || defaultSettings.aboutText,
    bannerText: s.bannerText || '',
  };
}

export async function saveSettings(settings) {
  await request('/settings', {
    method: 'PUT',
    body: JSON.stringify({
      brandName: settings.brandName,
      brandTagline: settings.brandTagline,
      address: settings.address,
      phone: settings.phone,
      whatsappPhone: settings.whatsappPhone || '917397335037',
      upiId: settings.upiId || 'kpclothing@upi',
      upiPayeeName: settings.upiPayeeName || 'KP Clothing',
      upiQrImageUrl: settings.upiQrImageUrl || '',
      aboutHeading: settings.aboutHeading,
      aboutText: settings.aboutText,
      bannerText: settings.bannerText || '',
    }),
  });
}
