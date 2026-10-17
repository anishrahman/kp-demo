// src/services/whatsapp.js
// Ported from kp-clothing-saree-fullstack/src/lib/whatsapp.ts

/**
 * Resolves the official WhatsApp contact number.
 * Priority: StoreSettings.whatsappPhone -> VITE_WHATSAPP_NUMBER env -> StoreSettings.phone -> default
 */
export function getWhatsAppNumber(settings) {
  const configured =
    settings?.whatsappPhone?.trim() ||
    (import.meta.env.VITE_WHATSAPP_NUMBER)?.trim() ||
    settings?.phone?.trim() ||
    '917397335037';

  let clean = configured.replace(/\D/g, '');
  if (clean.length === 10) clean = `91${clean}`;
  return clean || '917397335037';
}

/**
 * Formats a pre-filled WhatsApp message for a specific product.
 */
export function formatProductWhatsAppMessage(product, isUpcoming = false) {
  const code = product.code || product.id;
  const priceDisplay = product.price ? `₹${product.price}` : 'On Request';

  if (isUpcoming || product.isUpcoming || product.status === 'UPCOMING') {
    return `Hi KP Clothing, I'm interested in this upcoming saree.\n\nProduct: ${product.name}\nPrice: ${priceDisplay}\nProduct ID: ${code}\n\nPlease share launch date and pre-order details.`;
  }

  return `Hi KP Clothing, I'm interested in this saree.\n\nProduct: ${product.name}\nPrice: ${priceDisplay}\nProduct ID: ${code}\n\nPlease share more details.`;
}

/**
 * Generates a general enquiry WhatsApp message.
 */
export function formatGeneralWhatsAppMessage() {
  return `Hi KP Clothing, I'm interested in exploring your saree collections and handcrafted handloom designs. Please share more details.`;
}

/**
 * Generates a bulk order enquiry WhatsApp message.
 */
export function formatBulkOrderWhatsAppMessage() {
  return 'Hi KP Clothing, I would like to enquire about a bulk / large quantity order.';
}

/**
 * Opens WhatsApp chat using the official wa.me URL.
 */
export function openWhatsApp(phone, text) {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
