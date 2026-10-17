import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children, products = [] }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kp_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync cart items with localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('kp_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  // Sync cart prices and details whenever fresh product data is received from backend
  useEffect(() => {
    if (!products || products.length === 0) return;
    setItems((prev) =>
      prev.map((item) => {
        const fresh = products.find((p) => p.id === item.product.id || p.code === item.product.code);
        if (fresh) {
          return {
            ...item,
            product: {
              ...item.product,
              price: fresh.price,
              name: fresh.name,
              images: fresh.images,
              stock: fresh.stock,
              stockQuantity: fresh.stockQuantity,
            },
          };
        }
        return item;
      })
    );
  }, [products]);

  const addItem = (product, quantity = 1) => {
    if (!product || product.isUpcoming) return;
    const addQty = Math.max(1, Math.min(10, quantity));

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id || (product.code && i.product.code === product.code)
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        const currentQty = next[existingIdx].quantity;
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: Math.min(10, currentQty + addQty),
        };
        return next;
      }
      return [...prev, { product, quantity: addQty }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const validQty = Math.max(1, Math.min(10, quantity));
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId || i.product.code === productId
          ? { ...i, quantity: validQty }
          : i
      )
    );
  };

  const removeItem = (productId) => {
    setItems((prev) =>
      prev.filter((i) => i.product.id !== productId && i.product.code !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('kp_cart');
    } catch {}
  };

  // Merge customer cart on login
  const mergeCartOnLogin = (customerPhone) => {
    try {
      const userCartKey = `kp_cart_${customerPhone}`;
      const savedUserCart = localStorage.getItem(userCartKey);
      if (savedUserCart) {
        const parsed = JSON.parse(savedUserCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems((current) => {
            const map = new Map();
            current.forEach((i) => map.set(i.product.code || i.product.id, i));
            parsed.forEach((i) => {
              const key = i.product.code || i.product.id;
              if (map.has(key)) {
                const ex = map.get(key);
                map.set(key, { ...ex, quantity: Math.min(10, ex.quantity + i.quantity) });
              } else {
                map.set(key, i);
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch {}
  };

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    const rawPrice = Number(String(i.product.price).replace(/[^0-9.]/g, '')) || 0;
    return sum + rawPrice * i.quantity;
  }, 0);

  // Delivery fee: FREE above ₹999, else ₹100
  const deliveryFee = subtotal >= 999 || items.length === 0 ? 0 : 100;
  const totalAmount = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalCount,
        subtotal,
        deliveryFee,
        totalAmount,
        addItem,
        addToCart: addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((o) => !o),
        mergeCartOnLogin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
