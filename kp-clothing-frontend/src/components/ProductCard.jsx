import React, { useState } from 'react';
import { resolveMediaUrl } from '../services/api.js';

/**
 * ProductCard – represents an individual saree card in bestsellers & catalog grids.
 * Front image = primary card image; hover shows Back / Side / Fabric close-up.
 */
export default function ProductCard({
  product,
  onSelectProduct,
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const isBestseller = Boolean(product.best || product.featured);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === false || (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0 && !product.isUpcoming);

  const mediaList = product.media || [];
  const frontImage = resolveMediaUrl(
    mediaList.find((m) => m.view === 'FRONT')?.url ||
    product.images?.[0] ||
    product.image ||
    (product.swatchKey ? `/images/${product.swatchKey}.jpg` : '')
  );

  const secondaryMedia = mediaList.find((m) => m.view === 'BACK' || m.view === 'SIDE' || m.view === 'FABRIC')?.url;
  const hoverImage = resolveMediaUrl(
    secondaryMedia ||
    (product.images && product.images.length > 1 ? product.images[1] : frontImage)
  );

  const displayImage = isHovered && hoverImage ? hoverImage : frontImage;
  const swatchClass = !displayImage && product.swatchKey ? `i-${product.swatchKey}` : '';

  const priceFormatted = product.price ? String(product.price).replace('₹', '') : '0';

  return (
    <button
      className="t"
      onClick={() => onSelectProduct?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={product.name}
      style={{ position: 'relative', textAlign: 'left', cursor: 'pointer' }}
    >
      <div
        className={`sw ${swatchClass}`}
        style={
          displayImage
            ? {
                backgroundImage: `url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.25s ease-in-out',
                position: 'relative',
              }
            : { position: 'relative' }
        }
      >
        {isBestseller && !isOutOfStock && <span className="badge">Bestseller</span>}
        {isOutOfStock && (
          <span
            className="badge"
            style={{
              background: '#8a2be2',
              backgroundColor: 'rgba(153, 27, 27, 0.92)',
              color: '#fff',
            }}
          >
            Out of Stock
          </span>
        )}
      </div>

      <b style={{ display: 'block', marginTop: 8 }}>{product.name}</b>
      <span className="price">&#8377;{priceFormatted}</span>
    </button>
  );
}
