import React from 'react';

/**
 * Strip – the trust/feature bar below the hero.
 * Uses demo's .strip, .si, .dts CSS classes.
 */
export default function Strip({ slideCount = 0, currentIdx = 0 }) {
  return (
    <div className="strip">
      <div className="w">
        <div className="si"><i>&#10003;</i>Secure payments</div>
        <div className="si"><i>&#9825;</i>Loved by thousands</div>
        <div className="si"><i>&#10086;</i>Premium quality</div>
        {slideCount > 0 && (
          <div className="dts" id="dts">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                className={i === currentIdx ? 'on' : ''}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
        <div className="si"><i>&#9992;</i>Delivery across India</div>
      </div>
    </div>
  );
}
