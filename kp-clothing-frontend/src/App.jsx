import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import IntroOverlay from './components/IntroOverlay.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import ReviewModal from './components/ReviewModal.jsx';
import CustomerGateModal from './components/CustomerGateModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { AdminPortal } from './components/admin/AdminPortal.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import NewCollectionPage from './pages/NewCollectionPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import * as api from './services/api.js';
import { STORE_CATEGORIES } from './constants/categories.js';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './services/initialData.js';
import { getProductSlug, getCategorySlug, findCategoryBySlug } from './utils/slugs.js';
import { getWhatsAppNumber, formatProductWhatsAppMessage, openWhatsApp } from './services/whatsapp.js';

// Handler for direct top-level URLs like /Mangalagiri or /mangalagiri
function DirectCategoryRoute({ categories, products, settings }) {
  const { categorySlug } = useParams();
  const category = findCategoryBySlug(categories, categorySlug);
  if (category) {
    return (
      <CategoryPage
        categories={categories}
        products={products}
        settings={settings}
        categorySlug={getCategorySlug(category)}
      />
    );
  }
  return (
    <Home
      categories={categories}
      products={products}
      settings={settings}
    />
  );
}

export default function App() {
  const [categories, setCategories] = useState(() => {
    try {
      const v = localStorage.getItem('kp_cats');
      return v ? JSON.parse(v) : STORE_CATEGORIES;
    } catch {
      return STORE_CATEGORIES;
    }
  });

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState(() => {
    try {
      const v = localStorage.getItem('kp_customers');
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [customer, setCustomer] = useState(() => {
    try {
      const v = localStorage.getItem('kp_customer');
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });

  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [showCustomerGate, setShowCustomerGate] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg) => {
    setToastMsg(msg);
  };

  // Sync categories changes to localStorage
  const handleSaveCategories = (nextCats) => {
    setCategories(nextCats);
    try {
      localStorage.setItem('kp_cats', JSON.stringify(nextCats));
    } catch {}
  };

  // Load live data from Spring Boot if running
  useEffect(() => {
    async function loadData() {
      try {
        const [liveProducts, liveSettings, liveCategories] = await Promise.all([
          api.getProducts(),
          api.getSettings(),
          api.getCategories(),
        ]);
        if (Array.isArray(liveProducts) && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
        if (liveSettings && liveSettings.brandName) {
          setSettings(liveSettings);
        }
        if (Array.isArray(liveCategories) && liveCategories.length > 0) {
          setCategories(liveCategories);
        }
      } catch (err) {
        console.log('Backend not connected yet; using local boutique demo data.', err);
      }
    }
    loadData();
  }, []);

  // Sync hash changes for #admin
  useEffect(() => {
    if (window.location.hash === '#admin') {
      navigate('/admin');
    }
  }, [navigate]);

  // Load orders and customers if in admin view
  useEffect(() => {
    if (location.pathname.startsWith('/admin') && api.hasAdminToken()) {
      Promise.all([api.getOrders(), api.getCustomers()])
        .then(([liveOrders, liveCustomers]) => {
          if (liveOrders) setOrders(liveOrders);
          if (liveCustomers) setCustomers(liveCustomers);
        })
        .catch((e) => console.log('Admin data fetch notice:', e));
    }
  }, [location.pathname]);

  // Customer Management
  const handleSaveCustomer = (cust) => {
    setCustomer(cust);
    try {
      localStorage.setItem('kp_customer', JSON.stringify(cust));
    } catch {}
    setCustomers((prev) => {
      const next = [cust, ...prev.filter((c) => c.phone !== cust.phone)];
      try {
        localStorage.setItem('kp_customers', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Welcome, ${cust.name}`);
  };

  const handleLogoutCustomer = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('kp_customer');
    } catch {}
    showToast('Signed out');
  };

  // Product & Admin CRUD
  const handleSaveProduct = async (p) => {
    try {
      const saved = await api.saveProduct(p);
      // Immediately refresh all products from backend database
      try {
        const freshList = await api.getProducts();
        if (freshList && freshList.length > 0) {
          setProducts(freshList);
        } else {
          setProducts((prev) => {
            const idx = prev.findIndex((x) => x.id === saved.id || x.code === saved.code);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = saved;
              return next;
            }
            return [saved, ...prev];
          });
        }
      } catch {
        setProducts((prev) => {
          const idx = prev.findIndex((x) => x.id === saved.id || x.code === saved.code);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
      }
      showToast('Saree saved successfully');
    } catch {
      setProducts((prev) => {
        const id = p.id !== undefined ? p.id : prev.length;
        const item = { ...p, id };
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [item, ...prev];
      });
      showToast('Saved locally');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      try {
        const freshList = await api.getProducts();
        setProducts(freshList || []);
      } catch {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      showToast('Saree deleted');
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Deleted locally');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      showToast(`Status updated to ${status}`);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      showToast(`Status updated locally to ${status}`);
    }
  };

  const handleSaveSettings = async (s) => {
    try {
      const saved = await api.saveSettings(s);
      setSettings(saved);
      showToast('Settings saved');
    } catch {
      setSettings(s);
      showToast('Settings saved locally');
    }
  };

  const handleSelectCategory = (catId) => {
    const cat = categories.find((c) => c.id === catId) || categories[0];
    const slug = getCategorySlug(cat);
    navigate(`/sarees/${slug}`);
  };

  const handleSelectProduct = (prod) => {
    const slug = getProductSlug(prod);
    navigate(`/saree/${slug}`);
  };

  const handleBuyNow = (prod) => {
    const wp = getWhatsAppNumber(settings);
    const isUpcoming = Boolean(prod.isUpcoming || prod.status === 'UPCOMING');
    const msg = formatProductWhatsAppMessage(prod, isUpcoming);
    openWhatsApp(wp, msg);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Intro Overlay / Splash Screen */}
      {showIntro && (
        <IntroOverlay
          brandName={settings.brandName || 'KP_CLOTHINGZ'}
          tagline={settings.brandTagline || 'COMFORT MEETS ELEGANCE'}
          onFinish={() => setShowIntro(false)}
        />
      )}

      {/* Cart Drawer for Quick Checkout */}
      {!isAdminRoute && (
        <CartDrawer
          onOpenReviews={() => setShowReviews(true)}
        />
      )}

      {/* Header (Hidden on admin) */}
      {!isAdminRoute && (
        <Header
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          customer={customer}
          onOpenCustomerModal={() => setShowCustomerGate(true)}
          onOpenReviews={() => setShowReviews(true)}
        />
      )}

      {/* Main Routes */}
      <main>
        <Routes>
          {/* 1. Admin Portal Route */}
          <Route
            path="/admin"
            element={
              <AdminPortal
                products={products}
                orders={orders}
                customers={customers}
                categories={categories}
                settings={settings}
                onClose={() => navigate('/')}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSaveSettings={handleSaveSettings}
                onSaveCategories={handleSaveCategories}
              />
            }
          />

          {/* 2. Homepage */}
          <Route
            path="/"
            element={
              <Home
                categories={categories}
                products={products}
                settings={settings}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
                onSelectCategory={handleSelectCategory}
                onSelectProduct={handleSelectProduct}
                onOpenReviews={() => setShowReviews(true)}
              />
            }
          />

          {/* 3. All Sarees route */}
          <Route
            path="/all-sarees"
            element={
              <CategoryPage
                categories={categories}
                products={products}
                settings={settings}
                categorySlug="all"
              />
            }
          />

          {/* 4. Category Page under /sarees/:categorySlug */}
          <Route
            path="/sarees/:categorySlug"
            element={
              <CategoryPage
                categories={categories}
                products={products}
                settings={settings}
              />
            }
          />

          {/* 5. Product Page */}
          <Route
            path="/saree/:productSlug"
            element={
              <ProductPage
                products={products}
                categories={categories}
                settings={settings}
              />
            }
          />

          {/* 6. New Collection Page */}
          <Route
            path="/new-collection"
            element={
              <NewCollectionPage
                settings={settings}
                customer={customer}
                onOpenCustomerModal={() => setShowCustomerGate(true)}
                onShowToast={showToast}
              />
            }
          />

          {/* 7. Cart Page */}
          <Route
            path="/cart"
            element={<CartPage />}
          />

          {/* 8. 3-Step Checkout Page */}
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                customer={customer}
                settings={settings}
                onSaveCustomer={handleSaveCustomer}
              />
            }
          />

          {/* 9. Customer My Orders Page */}
          <Route
            path="/my-orders"
            element={
              <MyOrdersPage
                customer={customer}
                settings={settings}
              />
            }
          />

          {/* 10. Direct Category Route (e.g. /Mangalagiri, /mangalagiri, /chettinad-cotton) */}
          <Route
            path="/:categorySlug"
            element={
              <DirectCategoryRoute
                categories={categories}
                products={products}
                settings={settings}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer (Hidden on admin) */}
      {!isAdminRoute && (
        <Footer settings={settings} />
      )}

      {/* Customer Gate Modal */}
      <CustomerGateModal
        isOpen={showCustomerGate}
        customer={customer}
        onClose={() => setShowCustomerGate(false)}
        onSaveCustomer={handleSaveCustomer}
        onLogout={handleLogoutCustomer}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        onShopSarees={() => {
          navigate('/');
          const el = document.getElementById('cats');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMsg} />
    </>
  );
}
