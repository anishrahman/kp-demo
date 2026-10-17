import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext.jsx';
import './styles/global.css';
import { IM } from './services/demoAssets.js';
import App from './App.jsx';

// Inject authentic fabric swatches for .i-crm, .i-blk, .i-kal, .i-mar matching demo
if (typeof document !== 'undefined') {
  const st = document.createElement('style');
  st.textContent = Object.keys(IM)
    .filter((k) => k.length === 3)
    .map((k) => `.i-${k}, .i-${k} .inner { background-image: url(${IM[k]}); }`)
    .join('');
  document.head.appendChild(st);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  </StrictMode>,
);
