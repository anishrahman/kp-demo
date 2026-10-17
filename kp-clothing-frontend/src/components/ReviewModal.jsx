import React, { useEffect, useRef } from 'react';

/**
 * ReviewModal – customer reviews modal matching demo's #revp.
 * Includes confetti effect on open.
 */
export default function ReviewModal({ isOpen, onClose, onShopSarees }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const cv = canvasRef.current;
    if (!cv) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const g = cv.getContext('2d');
    const W = (cv.width = window.innerWidth);
    const H = (cv.height = window.innerHeight);
    const cols = ['#B8923A', '#E8C766', '#7A2E2E', '#4A5240', '#FFF8EC', '#C9A227'];

    const ps = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.6,
      w: 6 + Math.random() * 7,
      h: 9 + Math.random() * 9,
      vy: 2.2 + Math.random() * 3.4,
      vx: -1.2 + Math.random() * 2.4,
      r: Math.random() * 6.3,
      vr: -0.2 + Math.random() * 0.4,
      c: cols[(Math.random() * cols.length) | 0],
    }));

    const t0 = performance.now();

    function f(now) {
      const el = now - t0;
      g.clearRect(0, 0, W, H);
      let alive = 0;
      ps.forEach((p) => {
        p.x += p.vx + Math.sin(p.y * 0.02) * 0.6;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < H + 20) alive++;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        g.globalAlpha = Math.max(0, Math.min(1, (3600 - el) / 900));
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      });

      if (el < 3600 && alive) {
        animRef.current = requestAnimationFrame(f);
      } else {
        g.clearRect(0, 0, W, H);
      }
    }

    animRef.current = requestAnimationFrame(f);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        id="cf2"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 120,
          pointerEvents: 'none',
        }}
      />
      <div
        className="ov"
        id="revp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rvt"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="rvm">
          <button
            className="gx"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            &#10005;
          </button>
          <div className="rvh">
            <span className="spk" aria-hidden="true">
              &#10022; &#10022; &#10022;
            </span>
            <h2 id="rvt">Hear it from our customers</h2>
            <p>Real women, real sarees, real comfort.</p>
          </div>
          <div className="rvbd">
            <div className="rvv" role="img" aria-label="Customer review video">
              <span className="rvp">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: 28, height: 28 }}>
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <small>Customer review video (YouTube or uploaded file)</small>
            </div>
            <div className="rvc">
              <blockquote>
                <span className="stars" role="img" aria-label="5 out of 5 stars">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <br />
                Soft, light, and the border looks even richer in person.
                <cite>Ananya, Bangalore</cite>
              </blockquote>
              <blockquote>
                <span className="stars" role="img" aria-label="5 out of 5 stars">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <br />
                I wore it all day in the heat and still felt completely comfortable and elegant.
                <cite>Meera, Chennai</cite>
              </blockquote>
              <blockquote>
                <span className="stars" role="img" aria-label="5 out of 5 stars">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <br />
                Draped easily and washed well. Will order again!
                <cite>Pooja, Coimbatore</cite>
              </blockquote>
            </div>
            <div className="rvf">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  onClose();
                  onShopSarees?.();
                }}
              >
                Shop sarees
              </button>
              <button className="btn o" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
