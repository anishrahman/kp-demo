import React, { useEffect, useState } from 'react';
import kpLogo from '../assets/kp_logo.png';

/**
 * IntroOverlay – the KP Clothing splash/intro screen.
 * Mirrors the demo's #intro element with ring animation.
 * Click anywhere or wait 2.8s to dismiss.
 */
export default function IntroOverlay({ brandName = 'KP_CLOTHINGZ', tagline = 'COMFORT MEETS ELEGANCE', onFinish }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(), 2800);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setOut(true);
    setTimeout(() => onFinish?.(), 850);
  };

  return (
    <div
      id="intro"
      className={out ? 'out' : ''}
      onClick={dismiss}
      role="dialog"
      aria-label="KP Clothing intro"
    >
      <div>
        <div style={{ position: 'relative', height: 136, display: 'grid', placeItems: 'center' }}>
          <i className="spin" />
          <div className="ring" style={{ position: 'absolute' }}>
            <span style={{ backgroundImage: `url(${kpLogo})` }} />
          </div>
        </div>
        <p className="bn">{brandName}</p>
        <p className="tg">{tagline}</p>
      </div>
    </div>
  );
}
