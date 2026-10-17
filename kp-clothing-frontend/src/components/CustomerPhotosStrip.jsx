import React from 'react';
import { INITIAL_CATEGORIES } from '../services/initialData.js';

const POSITIONS = ['70% 20%', '30% 15%', '60% 55%', '40% 35%'];

/**
 * CustomerPhotosStrip – renders the 4-photo swatch grid ("Customers in our sarees")
 * using the authentic demo algorithm with 260% background zoom and distinct crops.
 */
export default function CustomerPhotosStrip({
  categories = INITIAL_CATEGORIES,
  offset = 0,
  title = 'Customers in our sarees',
  subtitle = 'Sample photos. Replace with real customer photos.',
}) {
  const visibleCategories = categories.filter((c) => c.on !== false);
  const items = visibleCategories.length > 0 ? visibleCategories : INITIAL_CATEGORIES;

  return (
    <div>
      <div className="sh" style={{ margin: '40px 0 24px' }}>
        <h2>{title}</h2>
      </div>

      <div className="fav">
        {[0, 1, 2, 3].map((i) => {
          const cat = items[(i + offset) % items.length];
          const swatchKey = cat?.k || 'crm';
          return (
            <div
              key={i}
              className={`sw i-${swatchKey}`}
              style={{
                backgroundSize: '260%',
                backgroundPosition: POSITIONS[i],
              }}
            />
          );
        })}
      </div>

      {subtitle && (
        <p style={{ color: 'var(--mut)', fontSize: 13, marginTop: 12 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
