import React from 'react';
import { INITIAL_CATEGORIES } from '../services/initialData.js';

/**
 * CategoryGrid – "Shop by saree type" 4-column category grid.
 * Uses exact CSS classes (.i-mar, .i-blk, .i-kal, .i-crm) and descriptions from the demo.
 */
export default function CategoryGrid({ categories = INITIAL_CATEGORIES, onSelectCategory }) {
  const visibleCategories = categories.filter((c) => c.on !== false);

  return (
    <section className="sec alt" id="cats">
      <div className="w">
        <div className="sh">
          <h2>Shop by saree type</h2>
        </div>
        <div className="cats" id="catgrid">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((c) => (
              <button
                key={c.id}
                className="t"
                onClick={() => onSelectCategory?.(c.id)}
                aria-label={c.n}
              >
                <div className={`sw i-${c.k}`} />
                <b>{c.n}</b>
                <span>{c.d}</span>
              </button>
            ))
          ) : (
            <p style={{ color: 'var(--mut)', gridColumn: '1 / -1' }}>
              No categories are visible yet. Add one from Admin.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
