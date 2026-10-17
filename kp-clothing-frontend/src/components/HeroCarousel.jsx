import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IM } from '../services/demoAssets.js';

export const INSTAGRAM_URL = 'https://www.instagram.com/kp_clothingz?srtk=MTk1ZThsMG9mNjE2eA==';

const BW = 480;
const SR = {
  crm: { i: IM.crm, m: IM.crmm, a: 10, l: 6 },
  blk: { i: IM.blk, m: IM.blkm, a: 9, l: 3 },
  kal: { i: IM.kal, m: IM.kalm, a: 10, l: 6 },
  mar: { i: IM.mar, m: IM.marm, a: 9, l: 3 },
};

const BASE = {};

function ss(a, b, x) {
  x = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function draw(o, t) {
  const { W, H, src, wt, px, s } = o;
  const K = W / 640;
  const dst = o.out.data;
  const gust =
    0.65 +
    0.35 * Math.sin(t * 0.5) +
    0.15 * Math.sin(t * 1.3 + 1) +
    0.12 * Math.sin(t * 4.1 + 2);
  const ph = t * 2.2;
  const A = s.a;
  const L = s.l;

  for (let i = 0; i < px.length; i++) {
    const p = px[i];
    const y = (p / W) | 0;
    const x = p - y * W;
    const w = wt[p] * gust;
    const xx = x / K;
    const yy = y / K;
    const f = y / H;

    const dx =
      K *
      A *
      w *
      (Math.sin(yy * 0.0084 - ph + xx * 0.01) +
        0.5 * Math.sin(yy * 0.0189 - ph * 1.6 + xx * 0.02));
    const dy =
      K *
      (-L *
        w *
        ss(0.58, 0.94, f) *
        (0.5 + 0.5 * Math.sin(xx * 0.02 - ph * 0.9)) +
        0.25 * A * w * Math.sin(xx * 0.015 - ph * 1.2 + yy * 0.01));

    let sx = x - dx;
    let sy = y - dy;
    sx = sx < 0 ? 0 : sx > W - 1.01 ? W - 1.01 : sx;
    sy = sy < 0 ? 0 : sy > H - 1.01 ? H - 1.01 : sy;

    const x0 = sx | 0;
    const y0 = sy | 0;
    const fx = sx - x0;
    const fy = sy - y0;
    const a = (y0 * W + x0) * 4;
    const b = a + 4;
    const c = a + W * 4;
    const e = c + 4;
    const w1 = (1 - fx) * (1 - fy);
    const w2 = fx * (1 - fy);
    const w3 = (1 - fx) * fy;
    const w4 = fx * fy;
    const q = p * 4;

    dst[q] = src[a] * w1 + src[b] * w2 + src[c] * w3 + src[e] * w4;
    dst[q + 1] = src[a + 1] * w1 + src[b + 1] * w2 + src[c + 1] * w3 + src[e + 1] * w4;
    dst[q + 2] = src[a + 2] * w1 + src[b + 2] * w2 + src[c + 2] * w3 + src[e + 2] * w4;
  }
  o.cg.putImageData(o.out, 0, 0);
}

function loadBase(k) {
  if (BASE[k]) return BASE[k];
  return (BASE[k] = new Promise((res) => {
    const s = SR[k];
    const a = new Image();
    const b = new Image();
    let c = 0;
    a.onload = b.onload = () => {
      if (++c < 2) return;
      const W = BW;
      const H = Math.round((BW * a.naturalHeight) / a.naturalWidth);
      const o = document.createElement('canvas');
      o.width = W;
      o.height = H;
      const g = o.getContext('2d');
      g.drawImage(a, 0, 0, W, H);
      const src = g.getImageData(0, 0, W, H).data;
      g.clearRect(0, 0, W, H);
      g.drawImage(b, 0, 0, W, H);
      const md = g.getImageData(0, 0, W, H).data;
      const wt = new Float32Array(W * H);
      const px = [];
      for (let p = 0; p < W * H; p++) {
        const w = md[p * 4] / 255;
        wt[p] = w;
        if (w > 0.002) px.push(p);
      }
      res({ W, H, src, wt, px, s });
    };
    a.src = s.i;
    b.src = s.m;
  }));
}

const CAPTIONS = {
  crm: 'Mulmul Cotton',
  blk: 'Mangalagiri',
  kal: 'Kalamkari',
  mar: 'Chettinad Cotton',
};

const HS = [
  {
    h: 'Comfort meets <em>elegance</em>',
    s: 'Handpicked cotton sarees for every you',
    im: ['crm', 'blk', 'kal'],
  },
  {
    h: 'Handloom cotton, <em>real zari</em>',
    s: 'Chettinad checks and gold borders',
    im: ['mar', 'crm', 'blk'],
  },
  {
    h: 'Kalamkari <em>stories</em>',
    s: 'Hand-painted style motifs on soft cotton',
    im: ['kal', 'mar', 'crm'],
  },
];

export default function HeroCarousel({ onExplore }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const containerRef = useRef(null);
  const canvasInstancesRef = useRef([]);

  const changeSlide = useCallback((delta) => {
    setSlideIdx((prev) => (prev + delta + HS.length) % HS.length);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Initialize and run the saree breeze canvas animation
  useEffect(() => {
    if (!containerRef.current) return;
    const canvases = containerRef.current.querySelectorAll('canvas[data-k]');
    const instances = [];
    let cancelled = false;

    canvases.forEach((cv, n) => {
      const k = cv.dataset.k;
      if (!k || !SR[k]) return;
      loadBase(k).then((b) => {
        if (cancelled) return;
        cv.width = b.W;
        cv.height = b.H;
        const cg = cv.getContext('2d');
        const out = cg.createImageData(b.W, b.H);
        out.data.set(b.src);
        const inst = { ...b, out, cg };
        draw(inst, 0);
        instances.push({ inst, cv, n });
      });
    });

    canvasInstancesRef.current = instances;

    let rafId;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function frame(ms) {
      const t = (ms / 1000) * 0.75 * (reducedMotion ? 0.2 : 1);
      instances.forEach((p) => {
        if (p.cv.offsetParent) {
          draw(p.inst, t + p.n * 1.7);
        }
      });
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="hb"
      id="hb"
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div id="hsl">
        {HS.map((slide, i) => (
          <div
            key={i}
            className={`hs${i === slideIdx ? ' on' : ''}`}
            style={{ display: i === slideIdx ? 'grid' : 'none' }}
          >
            {/* Slide Text */}
            <div className="ht">
              <h1 dangerouslySetInnerHTML={{ __html: slide.h }} />
              <p>{slide.s}</p>
              <button
                className="btn"
                onClick={onExplore}
              >
                Shop now &rarr;
              </button>
            </div>

            {/* Saree Breeze Canvas Image Grid */}
            <div className="hi">
              {slide.im.map((k, colIdx) => (
                <div key={colIdx} className="ph">
                  <canvas
                    data-k={k}
                    role="img"
                    aria-label={`${CAPTIONS[k]} saree`}
                  />
                  <span className="pc" data-k={k}>
                    {CAPTIONS[k]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next controls */}
      <button
        className="nb"
        style={{ left: 18 }}
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
      >
        &#8249;
      </button>
      <button
        className="nb"
        style={{ right: 18 }}
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
      >
        &#8250;
      </button>

      {/* Social pill with official Instagram link */}
      <div className="soc">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="KP Clothing Instagram"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r=".8" fill="currentColor" />
          </svg>
          <span className="igh">@kp_clothingz</span>
        </a>

        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="KP Clothing YouTube"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="5" width="20" height="14" rx="4" />
            <path d="M10 9l5 3-5 3z" fill="currentColor" />
          </svg>
        </a>
      </div>
    </section>
  );
}
