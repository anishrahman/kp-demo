import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Package,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  LogOut,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Truck,
  PieChart as ChartIcon,
  Store,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import * as api from '../../services/api.js';
import kpLogo from '../../assets/kp_logo.png';
import { AdminLogin } from './AdminLogin.jsx';
import { StockChart } from './StockChart.jsx';
import { ShippingMonitoring } from './ShippingMonitoring.jsx';
import { MediaUploader } from './MediaUploader.jsx';

async function compressImage(file) {
  if (!file.type.startsWith('image/')) return file;
  const bitmap = await createImageBitmap(file);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.78)
  );
  if (!blob) return file;
  const base = file.name.replace(/\.[^.]+$/, '') || 'saree';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}

export function AdminPortal({
  products = [],
  orders = [],
  customers = [],
  settings = {},
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSaveSettings,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(api.hasAdminToken());
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields for Add/Edit Saree
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Chettinad Cotton');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImages, setPImages] = useState([]);
  const [pMedia, setPMedia] = useState([]);
  const [pStock, setPStock] = useState(true);
  const [pStockQty, setPStockQty] = useState(10);
  const [pFeatured, setPFeatured] = useState(false);
  const [pSizes, setPSizes] = useState('Free Size');
  const [pStatus, setPStatus] = useState('AVAILABLE');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Categories state
  const [categoriesList, setCategoriesList] = useState([]);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Per-Saree Detail Fields
  const [pHighlights, setPHighlights] = useState([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [pSareeLength, setPSareeLength] = useState('');
  const [pBlousePiece, setPBlousePiece] = useState('');
  const [pFabric, setPFabric] = useState('');
  const [pFabricWeight, setPFabricWeight] = useState('');
  const [pWeaveDetails, setPWeaveDetails] = useState('');
  const [pCareInstructions, setPCareInstructions] = useState('');
  const [pAuthenticityNote, setPAuthenticityNote] = useState('');
  const [pAvailabilityText, setPAvailabilityText] = useState('');

  // Selected Order for Admin Details Modal
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);

  // Settings state
  const [sBrand, setSBrand] = useState(settings.brandName || 'KP CLOTHING');
  const [sTagline, setSTagline] = useState(settings.brandTagline || 'COMFORT MEETS ELEGANCE');
  const [sAddress, setSAddress] = useState(settings.address || 'Chennai, Tamil Nadu');
  const [sPhone, setSPhone] = useState(settings.phone || '');
  const [sWhatsapp, setSWhatsapp] = useState(settings.whatsappPhone || '917397335037');
  const [sUpiId, setSUpiId] = useState(settings.upiId || 'kpclothing@upi');
  const [sUpiPayeeName, setSUpiPayeeName] = useState(settings.upiPayeeName || 'KP Clothing');
  const [sUpiQrImageUrl, setSUpiQrImageUrl] = useState(settings.upiQrImageUrl || '');
  const [sAboutHeading, setSAboutHeading] = useState(settings.aboutHeading || 'Our Story & Artisanal Heritage');
  const [sAboutText, setSAboutText] = useState(settings.aboutText || '');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  useEffect(() => {
    setSBrand(settings.brandName || 'KP CLOTHING');
    setSTagline(settings.brandTagline || 'COMFORT MEETS ELEGANCE');
    setSAddress(settings.address || 'Chennai, Tamil Nadu');
    setSPhone(settings.phone || '');
    setSWhatsapp(settings.whatsappPhone || '917397335037');
    setSUpiId(settings.upiId || 'kpclothing@upi');
    setSUpiPayeeName(settings.upiPayeeName || 'KP Clothing');
    setSUpiQrImageUrl(settings.upiQrImageUrl || '');
    setSAboutHeading(settings.aboutHeading || 'Our Story & Artisanal Heritage');
    setSAboutText(settings.aboutText || '');
  }, [settings]);

  useEffect(() => {
    api.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats);
      }
    }).catch(console.error);
  }, []);

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => setIsAuthenticated(true)}
        onBackToStore={onClose}
      />
    );
  }

  // Real KPI calculations from backend data
  const totalSarees = products.length;
  const availableStock = products.filter(
    (p) => !p.isUpcoming && p.status !== 'UPCOMING' && (p.stockQuantity !== undefined ? p.stockQuantity > 0 : p.stock)
  ).length;
  const outOfStock = products.filter(
    (p) => !p.isUpcoming && p.status !== 'UPCOMING' && (p.stockQuantity !== undefined ? p.stockQuantity === 0 : !p.stock)
  ).length;
  const upcomingSarees = products.filter(
    (p) => Boolean(p.isUpcoming || p.status === 'UPCOMING')
  ).length;
  const totalOrders = orders.length;

  const generateNextCode = () => {
    const nums = products.map((p) => Number((p.code || '').replace(/\D/g, '')) || 0);
    return `KP${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
  };

  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const created = await api.createCategory(newCatName.trim());
      setCategoriesList((prev) => {
        const exists = prev.some((c) => (c.n || c.name)?.toLowerCase() === (created.n || created.name)?.toLowerCase());
        return exists ? prev : [...prev, created];
      });
      setPCategory(created.n || created.name);
      setNewCatName('');
      setShowAddCat(false);
    } catch (err) {
      alert('Could not create category: ' + (err.message || 'Error'));
    } finally {
      setCreatingCat(false);
    }
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    if (pHighlights.length >= 8) {
      alert('Maximum 8 highlights allowed.');
      return;
    }
    setPHighlights([...pHighlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx) => {
    setPHighlights(pHighlights.filter((_, i) => i !== idx));
  };

  const openNew = () => {
    const code = generateNextCode();
    setEditingProduct({
      id: '',
      code,
      name: '',
      category: categoriesList[0]?.n || categoriesList[0]?.name || 'Chettinad Cotton',
      price: '',
      description: '',
      images: [],
      media: [],
      stock: true,
      stockQuantity: 10,
      featured: false,
      sizes: ['Free Size'],
      isUpcoming: false,
      status: 'AVAILABLE',
    });
    setPCode(code);
    setPName('');
    setPCategory(categoriesList[0]?.n || categoriesList[0]?.name || 'Chettinad Cotton');
    setPPrice('');
    setPDesc('');
    setPHighlights([]);
    setNewHighlight('');
    setPSareeLength('');
    setPBlousePiece('');
    setPFabric('');
    setPFabricWeight('');
    setPWeaveDetails('');
    setPCareInstructions('');
    setPAuthenticityNote('');
    setPAvailabilityText('In Stock (Ready to dispatch)');
    setPImages([]);
    setPMedia([]);
    setPStock(true);
    setPStockQty(10);
    setPFeatured(false);
    setPSizes('Free Size');
    setPStatus('AVAILABLE');
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setPCode(p.code || '');
    setPName(p.name || '');
    setPCategory(p.category || 'Chettinad Cotton');
    setPPrice(String(p.price || ''));
    setPDesc(p.description || '');
    setPHighlights(Array.isArray(p.highlights) ? [...p.highlights] : []);
    setNewHighlight('');
    setPSareeLength(p.sareeLength || '');
    setPBlousePiece(p.blousePiece || '');
    setPFabric(p.fabric || '');
    setPFabricWeight(p.fabricWeight || '');
    setPWeaveDetails(p.weaveDetails || '');
    setPCareInstructions(p.careInstructions || '');
    setPAuthenticityNote(p.authenticityNote || '');
    setPAvailabilityText(p.availabilityText || (p.status === 'UPCOMING' ? 'Crafting on Loom (Upcoming)' : p.stockQuantity === 0 ? 'Out of Stock' : 'In Stock (Ready to dispatch)'));
    setPImages([...(p.images || [])]);
    
    // Populate media structure if available or map images
    const initialMedia = p.media && p.media.length > 0
      ? p.media
      : (p.images || []).map((url, idx) => ({
          url,
          type: 'IMAGE',
          view: idx === 0 ? 'FRONT' : idx === 1 ? 'BACK' : idx === 2 ? 'SIDE' : idx === 3 ? 'FABRIC' : 'OTHER',
          sortOrder: idx,
        }));
    setPMedia(initialMedia);
    setPStock(p.stock !== false);
    setPStockQty(p.stockQuantity ?? (p.stock ? 10 : 0));
    setPFeatured(Boolean(p.featured));
    setPSizes(p.sizes?.join(', ') || 'Free Size');
    setPStatus(p.status || (p.isUpcoming ? 'UPCOMING' : 'AVAILABLE'));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice.trim()) return alert('Please enter saree name and price.');

    setSaving(true);
    const isUpcoming = pStatus === 'UPCOMING';
    const imageList = pMedia.filter((m) => m.type === 'IMAGE').map((m) => m.url);
    const videoObj = pMedia.find((m) => m.type === 'VIDEO');

    try {
      await onSaveProduct({
        id: editingProduct?.id || '',
        code: pCode.trim() || generateNextCode(),
        name: pName.trim(),
        category: pCategory,
        price: pPrice.trim(),
        description: pDesc.trim(),
        highlights: pHighlights.filter(Boolean),
        sareeLength: pSareeLength.trim(),
        blousePiece: pBlousePiece.trim(),
        fabric: pFabric.trim(),
        fabricWeight: pFabricWeight.trim(),
        weaveDetails: pWeaveDetails.trim(),
        careInstructions: pCareInstructions.trim(),
        authenticityNote: pAuthenticityNote.trim(),
        availabilityText: pAvailabilityText.trim(),
        images: imageList.length > 0 ? imageList : pImages,
        media: pMedia,
        videoUrl: videoObj?.url || '',
        stock: isUpcoming ? false : pStockQty > 0,
        stockQuantity: isUpcoming ? 0 : pStockQty,
        featured: pFeatured,
        sizes: pSizes.split(',').map((s) => s.trim()).filter(Boolean) || ['Free Size'],
        isUpcoming,
        status: pStatus,
      });
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Could not save saree.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStock = async (p, newQty) => {
    const qty = Math.max(0, newQty);
    try {
      await onSaveProduct({
        ...p,
        stockQuantity: qty,
        stock: qty > 0,
      });
    } catch (err) {
      console.error(err);
      alert('Could not update stock.');
    }
  };

  const handleLogout = () => {
    api.logoutAdmin();
    setIsAuthenticated(false);
  };

  const exportRows = (rows, filename) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
  };

  const filteredOrders = orders.filter(
    (o) => orderStatusFilter === 'All' || o.status === orderStatusFilter
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: '#1a0c06',
        display: 'flex',
        flexDirection: 'column',
        color: '#2b1810',
        overflow: 'hidden',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#241209',
          color: '#fff8ec',
          padding: '12px 20px',
          borderBottom: '1px solid #3a2313',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '2px solid #e8c766',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#e8c766', margin: 0 }}>
                KP CLOTHING ADMIN
              </h1>
              <span
                style={{
                  backgroundColor: '#7a2e2e',
                  color: '#fff8ec',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Boutique Portal
              </span>
            </div>
            <p style={{ fontSize: 10, color: '#c8ac7d', margin: 0 }}>
              Sarees • Inventory • Shipping Monitoring • Customers
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onClose}
            className="btn o sm"
            style={{ borderColor: '#5c4326', color: '#dcc9a6', display: 'flex', alignItems: 'center', gap: 6 }}
            title="View Live Boutique Website"
          >
            <Store size={14} />
            <span>Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#7a2e2e',
              color: '#fff8ec',
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#dcc9a6',
              cursor: 'pointer',
              padding: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 240,
            backgroundColor: '#241209',
            borderRight: '1px solid #3a2313',
            color: '#dcc9a6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16,
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Overview */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                OVERVIEW
              </span>
              <button
                onClick={() => setActiveSection('dashboard')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'dashboard' ? '#e8c766' : 'transparent',
                  color: activeSection === 'dashboard' ? '#241209' : '#dcc9a6',
                }}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Products */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                PRODUCTS
              </span>
              <button
                onClick={() => setActiveSection('products_all')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'products_all' ? '#e8c766' : 'transparent',
                  color: activeSection === 'products_all' ? '#241209' : '#dcc9a6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={15} />
                  <span>All Sarees</span>
                </div>
                <span style={{ fontSize: 11, background: '#1a0c06', color: '#e8c766', padding: '1px 6px', borderRadius: 99 }}>
                  {products.length}
                </span>
              </button>

              <button
                onClick={openNew}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'none',
                  color: '#e8c766',
                  marginTop: 4,
                }}
              >
                <Plus size={15} />
                <span>Add Saree</span>
              </button>

              <button
                onClick={() => setActiveSection('products_upcoming')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'products_upcoming' ? '#e8c766' : 'transparent',
                  color: activeSection === 'products_upcoming' ? '#241209' : '#dcc9a6',
                  marginTop: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={15} />
                  <span>Upcoming Sarees</span>
                </div>
                <span style={{ fontSize: 11, background: '#7a2e2e', color: '#fff', padding: '1px 6px', borderRadius: 99 }}>
                  {upcomingSarees}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('products_stock')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'products_stock' ? '#e8c766' : 'transparent',
                  color: activeSection === 'products_stock' ? '#241209' : '#dcc9a6',
                  marginTop: 4,
                }}
              >
                <CheckCircle size={15} />
                <span>Stock Management</span>
              </button>
            </div>

            {/* Orders */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                ORDERS & SHIPPING
              </span>
              <button
                onClick={() => setActiveSection('orders_all')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'orders_all' ? '#e8c766' : 'transparent',
                  color: activeSection === 'orders_all' ? '#241209' : '#dcc9a6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingBag size={15} />
                  <span>All Orders</span>
                </div>
                <span style={{ fontSize: 11, background: '#1a0c06', color: '#e8c766', padding: '1px 6px', borderRadius: 99 }}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('orders_shipping')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'orders_shipping' ? '#e8c766' : 'transparent',
                  color: activeSection === 'orders_shipping' ? '#241209' : '#dcc9a6',
                  marginTop: 4,
                }}
              >
                <Truck size={15} />
                <span>Shipping Monitoring</span>
              </button>
            </div>

            {/* Customers & Analytics */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                ANALYTICS & STORE
              </span>
              <button
                onClick={() => setActiveSection('analytics_stock')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'analytics_stock' ? '#e8c766' : 'transparent',
                  color: activeSection === 'analytics_stock' ? '#241209' : '#dcc9a6',
                }}
              >
                <ChartIcon size={15} />
                <span>Stock Analysis</span>
              </button>

              <button
                onClick={() => setActiveSection('customers')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'customers' ? '#e8c766' : 'transparent',
                  color: activeSection === 'customers' ? '#241209' : '#dcc9a6',
                  marginTop: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={15} />
                  <span>Customers</span>
                </div>
                <span style={{ fontSize: 11, background: '#1a0c06', color: '#e8c766', padding: '1px 6px', borderRadius: 99 }}>
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'settings' ? '#e8c766' : 'transparent',
                  color: activeSection === 'settings' ? '#241209' : '#dcc9a6',
                  marginTop: 4,
                }}
              >
                <SettingsIcon size={15} />
                <span>Store Settings</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Body */}
        <main
          style={{
            flex: 1,
            backgroundColor: '#fbf3e4',
            padding: 24,
            overflowY: 'auto',
          }}
        >
          {/* Dashboard Tab */}
          {activeSection === 'dashboard' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* KPI cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                <div style={{ backgroundColor: '#fff8ec', padding: 18, borderRadius: 16, border: '1px solid #f3e6cd' }}>
                  <span style={{ fontSize: 11, color: '#8a6a3f', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Sarees
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#241209', fontFamily: 'var(--serif)' }}>
                    {totalSarees}
                  </div>
                  <span style={{ fontSize: 11, color: '#20a4b8' }}>Catalog Inventory</span>
                </div>

                <div style={{ backgroundColor: '#fff8ec', padding: 18, borderRadius: 16, border: '1px solid #f3e6cd' }}>
                  <span style={{ fontSize: 11, color: '#8a6a3f', textTransform: 'uppercase', fontWeight: 700 }}>
                    In Stock
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#1e5338', fontFamily: 'var(--serif)' }}>
                    {availableStock}
                  </div>
                  <span style={{ fontSize: 11, color: '#1e5338' }}>Ready to Dispatch</span>
                </div>

                <div style={{ backgroundColor: '#fff8ec', padding: 18, borderRadius: 16, border: '1px solid #f3e6cd' }}>
                  <span style={{ fontSize: 11, color: '#8a6a3f', textTransform: 'uppercase', fontWeight: 700 }}>
                    Upcoming
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#7a2e2e', fontFamily: 'var(--serif)' }}>
                    {upcomingSarees}
                  </div>
                  <span style={{ fontSize: 11, color: '#7a2e2e' }}>Crafting on Loom</span>
                </div>

                <div style={{ backgroundColor: '#fff8ec', padding: 18, borderRadius: 16, border: '1px solid #f3e6cd' }}>
                  <span style={{ fontSize: 11, color: '#8a6a3f', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Orders
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#c9a227', fontFamily: 'var(--serif)' }}>
                    {totalOrders}
                  </div>
                  <span style={{ fontSize: 11, color: '#8a6a3f' }}>Customer Orders</span>
                </div>
              </div>

              {/* Stock Chart Preview */}
              <StockChart products={products} />
            </div>
          )}

          {/* All Sarees Tab */}
          {activeSection === 'products_all' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0 }}>All Sarees</h3>
                  <span style={{ fontSize: 12, color: '#8a6a3f' }}>Manage catalog products</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() =>
                      exportRows(
                        products.map((p) => ({
                          Code: p.code,
                          Name: p.name,
                          Price: p.price,
                          Stock: p.stockQuantity ?? 10,
                          Status: p.status,
                        })),
                        'kp-sarees.xlsx'
                      )
                    }
                    className="btn o sm"
                  >
                    <FileSpreadsheet size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Export Excel
                  </button>
                  <button onClick={openNew} className="btn sm">
                    <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Add Saree
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ct" style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#8a6a3f' }}>
                          No sarees found. Add your first saree above!
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id || p.code}>
                          <td>
                            <div
                              style={{
                                width: 40,
                                height: 52,
                                borderRadius: 4,
                                background: `url(${p.images?.[0] || p.image || '/chettinad-cotton.jpg'}) center/cover`,
                              }}
                            />
                          </td>
                          <td>
                            <b>{p.code}</b>
                          </td>
                          <td>
                            <b>{p.name}</b>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, color: '#8a6a3f', fontWeight: 600 }}>
                              {p.category || 'Chettinad Cotton'}
                            </span>
                          </td>
                          <td>₹{p.price}</td>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <button
                                onClick={() => handleQuickStock(p, (p.stockQuantity ?? 10) - 1)}
                                style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #d9c6a3' }}
                              >
                                -
                              </button>
                              <b>{p.stockQuantity ?? (p.stock ? 10 : 0)}</b>
                              <button
                                onClick={() => handleQuickStock(p, (p.stockQuantity ?? 10) + 1)}
                                style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #d9c6a3' }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 99,
                                fontWeight: 700,
                                backgroundColor: p.isUpcoming ? '#fde8e8' : '#e8f5e9',
                                color: p.isUpcoming ? '#7a2e2e' : '#1e5338',
                              }}
                            >
                              {p.isUpcoming ? 'Upcoming' : 'Available'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => openEdit(p)}
                              style={{ background: 'none', border: 'none', color: '#c9a227', cursor: 'pointer', marginRight: 8 }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${p.name}?`)) onDeleteProduct(p.id);
                              }}
                              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upcoming Sarees Tab */}
          {activeSection === 'products_upcoming' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0 }}>Upcoming Sarees</h3>
                  <span style={{ fontSize: 12, color: '#8a6a3f' }}>Exclusive weaves currently crafting on the loom</span>
                </div>
                <button onClick={openNew} className="btn sm">
                  <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Add Upcoming Saree
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {products.filter((p) => p.isUpcoming || p.status === 'UPCOMING').map((p) => (
                  <div key={p.id || p.code} style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #f3e6cd' }}>
                    <div
                      style={{
                        aspectRatio: '3/4',
                        borderRadius: 8,
                        background: `url(${p.images?.[0] || p.image || '/kalamkari-cotton.jpg'}) center/cover`,
                        marginBottom: 10,
                      }}
                    />
                    <b>{p.name}</b>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ color: 'var(--btn)', fontWeight: 700 }}>₹{p.price}</span>
                      <span style={{ fontSize: 11, color: '#7a2e2e', fontWeight: 700 }}>On Loom</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Management Tab */}
          {activeSection === 'products_stock' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 16 }}>Live Stock Management</h3>
              <StockChart products={products} />
            </div>
          )}

          {/* Orders Tab */}
          {activeSection === 'orders_all' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0 }}>Customer Orders</h3>
                  <span style={{ fontSize: 12, color: '#8a6a3f' }}>Manage store orders</span>
                </div>
                <button
                  onClick={() =>
                    exportRows(
                      orders.map((o) => ({
                        Code: o.orderCode,
                        Customer: o.customerName,
                        Phone: o.customerPhone,
                        Total: o.totalAmount,
                        Status: o.status,
                        Date: o.createdAt,
                      })),
                      'kp-orders.xlsx'
                    )
                  }
                  className="btn o sm"
                >
                  <FileSpreadsheet size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Export Orders
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ct" style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Order Code</th>
                      <th>Customer</th>
                      <th>Primary Phone</th>
                      <th>Alt Phone</th>
                      <th>City</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#8a6a3f' }}>
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id || o.orderCode}>
                          <td><b>#{o.orderCode}</b></td>
                          <td>{o.customerName}</td>
                          <td>{o.customerPhone}</td>
                          <td>{o.customerAlternativePhone || '-'}</td>
                          <td>{o.customerCity || 'Chennai'}</td>
                          <td><b>₹{o.totalAmount}</b></td>
                          <td>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#e8f5e9', color: '#1e5338', fontWeight: 700 }}>
                              {o.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedAdminOrder(o)}
                              className="btn o sm"
                              style={{ padding: '4px 10px', fontSize: 11, borderColor: '#c9a227', color: '#8a6a3f' }}
                            >
                              Order Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shipping Monitoring Tab */}
          {activeSection === 'orders_shipping' && (
            <ShippingMonitoring orders={orders} settings={settings} onUpdateStatus={onUpdateOrderStatus} />
          )}

          {/* Analytics Tab */}
          {activeSection === 'analytics_stock' && <StockChart products={products} />}

          {/* Customers Tab */}
          {activeSection === 'customers' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0 }}>Registered Customers</h3>
                  <span style={{ fontSize: 12, color: '#8a6a3f' }}>Customer directory</span>
                </div>
                <button
                  onClick={() =>
                    exportRows(
                      customers.map((c) => ({
                        Name: c.name,
                        Phone: c.phone,
                        AltPhone: c.alternativePhone || '-',
                        Address: c.fullAddress || c.addressLine || '-',
                        City: c.city,
                        Joined: c.firstSeen || c.at,
                      })),
                      'kp-customers.xlsx'
                    )
                  }
                  className="btn o sm"
                >
                  <FileSpreadsheet size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Export Customers
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ct" style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Primary Phone</th>
                      <th>Alternative Phone</th>
                      <th>Full Delivery Address</th>
                      <th>City</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#8a6a3f' }}>
                          No registered customers yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c, i) => (
                        <tr key={c.id || i}>
                          <td><b>{c.name}</b></td>
                          <td>{c.phone}</td>
                          <td>{c.alternativePhone || '-'}</td>
                          <td style={{ maxWidth: 280, fontSize: 12 }}>
                            {c.fullAddress || (c.addressLine ? `${c.addressLine}, ${c.city || ''} ${c.pincode || ''}` : '-')}
                          </td>
                          <td>{c.city || 'Chennai'}</td>
                          <td>{c.firstSeen || c.at || 'Recent'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeSection === 'settings' && (
            <div style={{ backgroundColor: '#fff8ec', borderRadius: 20, padding: 24, border: '1px solid #f3e6cd', maxWidth: 640 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 16 }}>Store Settings</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSaveSettings({
                    ...settings,
                    brandName: sBrand,
                    brandTagline: sTagline,
                    address: sAddress,
                    phone: sPhone,
                    whatsappPhone: sWhatsapp,
                    upiId: sUpiId,
                    upiPayeeName: sUpiPayeeName,
                    upiQrImageUrl: sUpiQrImageUrl,
                    aboutHeading: sAboutHeading,
                    aboutText: sAboutText,
                  });
                  alert('Store settings saved successfully!');
                }}
                style={{ display: 'grid', gap: 14 }}
              >
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Brand Name</label>
                  <input
                    type="text"
                    value={sBrand}
                    onChange={(e) => setSBrand(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Brand Tagline</label>
                  <input
                    type="text"
                    value={sTagline}
                    onChange={(e) => setSTagline(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Store Address</label>
                  <input
                    type="text"
                    value={sAddress}
                    onChange={(e) => setSAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Official WhatsApp Number</label>
                  <input
                    type="text"
                    value={sWhatsapp}
                    onChange={(e) => setSWhatsapp(e.target.value)}
                    placeholder="917397335037"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                {/* Task 6: UPI ID & Payee Name in Admin Settings */}
                <div style={{ borderTop: '1px solid #e8dbc4', paddingTop: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 10 }}>
                    UPI Payment Settings
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>UPI ID *</label>
                      <input
                        type="text"
                        value={sUpiId}
                        onChange={(e) => setSUpiId(e.target.value)}
                        placeholder="kpclothing@upi"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>UPI Payee Name *</label>
                      <input
                        type="text"
                        value={sUpiPayeeName}
                        onChange={(e) => setSUpiPayeeName(e.target.value)}
                        placeholder="KP Clothing"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Custom QR Code Image (Optional)</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={sUpiQrImageUrl}
                        onChange={(e) => setSUpiQrImageUrl(e.target.value)}
                        placeholder="https://... or upload QR image file"
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                      />
                      <label className="btn o sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Upload QR
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await api.uploadImage(file, 'QR');
                              setSUpiQrImageUrl(url);
                            } catch (err) {
                              alert('Failed to upload QR image.');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {sUpiQrImageUrl && (
                      <img src={sUpiQrImageUrl} alt="Custom QR" style={{ width: 90, height: 90, objectFit: 'contain', marginTop: 8, borderRadius: 6, border: '1px solid #d9c6a3' }} />
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>About Story Heading</label>
                  <input
                    type="text"
                    value={sAboutHeading}
                    onChange={(e) => setSAboutHeading(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>About Story Description</label>
                  <textarea
                    rows={4}
                    value={sAboutText}
                    onChange={(e) => setSAboutText(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff', font: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn" style={{ marginTop: 10 }}>
                  Save Store Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Saree Modal */}
      {editingProduct && (
        <div
          className="ov"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProduct(null);
          }}
        >
          <div
            className="rvm"
            style={{
              maxWidth: 620,
              background: '#fff8ec',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #f3e6cd',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0 }}>
                {editingProduct.id ? 'Edit Saree' : 'Add New Saree'}
              </h3>
              <button className="gx" onClick={() => setEditingProduct(null)} style={{ position: 'static' }}>
                &#10005;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Saree Code</label>
                  <input
                    type="text"
                    value={pCode}
                    onChange={(e) => setPCode(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Saree Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Kasavu Chettinad Gold Saree"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Price (₹) *</label>
                  <input
                    type="text"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="1850"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={pStockQty}
                    onChange={(e) => setPStockQty(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(!showAddCat)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#7a2e2e',
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showAddCat ? '✕ Cancel' : '+ Add New Category'}
                    </button>
                  </div>

                  {showAddCat && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Banarasi Silk"
                        style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 6, background: '#fff' }}
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCat || !newCatName.trim()}
                        className="btn sm"
                        style={{ padding: '6px 12px', fontSize: 11 }}
                      >
                        {creatingCat ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  )}

                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  >
                    {(categoriesList.length > 0 ? categoriesList : [
                      { n: 'Chettinad Cotton' },
                      { n: 'Mangalagiri' },
                      { n: 'Kalamkari' },
                      { n: 'Mulmul Cotton' },
                      { n: 'New Collection' },
                    ]).map((cat, idx) => {
                      const name = cat.n || cat.name;
                      return (
                        <option key={cat.id || cat.slug || idx} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Status</label>
                  <select
                    value={pStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPStatus(val);
                      if (val === 'UPCOMING') setPAvailabilityText('Crafting on Loom (Upcoming)');
                      else if (val === 'OUT_OF_STOCK') setPAvailabilityText('Out of Stock');
                      else setPAvailabilityText('In Stock (Ready to dispatch)');
                    }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  >
                    <option value="AVAILABLE">Available / In Stock</option>
                    <option value="UPCOMING">Upcoming (Crafting on Loom)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Weave details, border styling, drape and occasion..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff', font: 'inherit' }}
                />
              </div>

              {/* Task 2: Per-Saree Detail Fields */}
              <div style={{ borderTop: '1px solid #e8dbc4', paddingTop: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 10 }}>
                  Per-Saree Details & Specifications (Optional)
                </span>

                {/* Highlights dynamic list */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Highlights (Bullet Points, up to 8)
                  </label>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="e.g. Breathable, soft pure handloom cotton body"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="btn sm"
                      style={{ padding: '8px 14px', fontSize: 11, whiteSpace: 'nowrap' }}
                    >
                      + Add Highlight
                    </button>
                  </div>
                  {pHighlights.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#fbf3e4',
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          <span>• {hl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saree Length & Blouse Piece */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Saree Length</label>
                    <input
                      type="text"
                      value={pSareeLength}
                      onChange={(e) => setPSareeLength(e.target.value)}
                      placeholder="e.g. 5.5 metres + 0.8 metre blouse piece"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Blouse Piece Details</label>
                    <input
                      type="text"
                      value={pBlousePiece}
                      onChange={(e) => setPBlousePiece(e.target.value)}
                      placeholder="e.g. Running blouse piece included (80 cm)"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                    />
                  </div>
                </div>

                {/* Fabric / Material & Fabric Weight */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Fabric / Material</label>
                    <input
                      type="text"
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      placeholder="e.g. 100% handloom cotton"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Fabric Weight</label>
                    <input
                      type="text"
                      value={pFabricWeight}
                      onChange={(e) => setPFabricWeight(e.target.value)}
                      placeholder="e.g. Lightweight & easy to drape (~480g)"
                      style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                    />
                  </div>
                </div>

                {/* Weave / Border / Pallu details */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Weave / Border / Pallu details</label>
                  <input
                    type="text"
                    value={pWeaveDetails}
                    onChange={(e) => setPWeaveDetails(e.target.value)}
                    placeholder="e.g. Gold zari border and grand pallu"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                {/* Care Instructions */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Care Instructions</label>
                  <input
                    type="text"
                    value={pCareInstructions}
                    onChange={(e) => setPCareInstructions(e.target.value)}
                    placeholder="e.g. Gentle hand wash in cold water, dry in shade"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                {/* Authenticity Note / Guarantee text */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Authenticity Note / Guarantee text</label>
                  <input
                    type="text"
                    value={pAuthenticityNote}
                    onChange={(e) => setPAuthenticityNote(e.target.value)}
                    placeholder="e.g. Handwoven with 100% natural cotton yarns"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>

                {/* Availability text */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>Availability Text</label>
                  <input
                    type="text"
                    value={pAvailabilityText}
                    onChange={(e) => setPAvailabilityText(e.target.value)}
                    placeholder="e.g. In Stock (Ready to dispatch)"
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, border: '1px solid #d9c6a3', borderRadius: 8, background: '#fff' }}
                  />
                </div>
              </div>

              {/* Multi-Perspective Photos & Video upload with client compression */}
              <div>
                <MediaUploader media={pMedia} onChange={setPMedia} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="submit" disabled={saving || uploading} className="btn" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Save Saree to Database'}
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn o" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal in Admin Portal */}
      {selectedAdminOrder && (
        <div
          className="ov"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAdminOrder(null);
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
              maxHeight: '90vh',
              overflowY: 'auto',
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
                  #{selectedAdminOrder.orderCode}
                </h3>
              </div>
              <button
                className="gx"
                onClick={() => setSelectedAdminOrder(null)}
                style={{ position: 'static' }}
              >
                &#10005;
              </button>
            </div>

            {/* Customer & Delivery Details */}
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
              <div><b>Customer:</b> {selectedAdminOrder.customerName || 'Customer'}</div>
              <div><b>Primary Mobile:</b> {selectedAdminOrder.customerPhone || '-'}</div>
              <div><b>Alternative Mobile:</b> {selectedAdminOrder.customerAlternativePhone || '-'}</div>
              <div style={{ borderTop: '1px solid #f0e2cd', paddingTop: 6, marginTop: 4 }}>
                <b>Delivery Address:</b>
                {selectedAdminOrder.customerAddressLine ? (
                  <div style={{ marginTop: 4 }}>
                    <div><b>House / Street / Lane:</b> {selectedAdminOrder.customerAddressLine}</div>
                    {selectedAdminOrder.customerLandmark && <div><b>Landmark:</b> {selectedAdminOrder.customerLandmark}</div>}
                    <div><b>City & State:</b> {selectedAdminOrder.customerCity || 'Chennai'}, {selectedAdminOrder.customerState || 'Tamil Nadu'}</div>
                    <div><b>Pincode:</b> {selectedAdminOrder.customerPincode || '-'}</div>
                    <div><b>Address Type:</b> {selectedAdminOrder.addressType || 'Home'}</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 4 }}>{selectedAdminOrder.clientAddress || selectedAdminOrder.customerCity || '-'}</div>
                )}
              </div>
              <div><b>Payment Mode:</b> {selectedAdminOrder.paymentMethod || 'COD'}</div>
              <div><b>Status:</b> {selectedAdminOrder.status || 'ORDER PLACED'}</div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a6a3f', display: 'block', marginBottom: 8 }}>
                Items Ordered
              </span>
              {(selectedAdminOrder.items || []).map((it, idx) => (
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
                      Code: {it.productCode} • Qty: {it.quantity} • Size: {it.size || 'Free Size'}
                    </span>
                  </div>
                  <b>₹{it.price}</b>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 15 }}>
                <b>Total Amount:</b>
                <b style={{ color: '#7a2e2e' }}>₹{selectedAdminOrder.totalAmount}</b>
              </div>
            </div>

            {/* Direct WhatsApp update */}
            <button
              className="btn"
              style={{ width: '100%', backgroundColor: '#128C7E', borderColor: '#128C7E' }}
              onClick={() => {
                const phone = selectedAdminOrder.customerPhone ? String(selectedAdminOrder.customerPhone).replace(/\D/g, '') : '';
                if (!phone) {
                  alert('No customer phone number available.');
                  return;
                }
                const msg = `Namaste ${selectedAdminOrder.customerName || 'Customer'}! 🙏\n\nUpdate regarding your KP Clothing Saree order *#${selectedAdminOrder.orderCode}*:\n\n📦 *Status:* ${selectedAdminOrder.status || 'Order Placed'}\n💰 *Total Amount:* ₹${selectedAdminOrder.totalAmount}\n\nThank you for choosing KP Clothing! Reply here if you have any questions. ✨`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
              }}
            >
              Send Shipping Status via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
