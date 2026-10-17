import React, { useState } from 'react';
import { Package, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

export function StockChart({ products = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Compute actual stock categories
  const inStockCount = products.filter(
    (p) => !p.isUpcoming && p.status !== 'UPCOMING' && (p.stockQuantity !== undefined ? p.stockQuantity >= 5 : p.stock)
  ).length;

  const lowStockCount = products.filter(
    (p) => !p.isUpcoming && p.status !== 'UPCOMING' && (p.stockQuantity !== undefined ? p.stockQuantity > 0 && p.stockQuantity < 5 : false)
  ).length;

  const outOfStockCount = products.filter(
    (p) => !p.isUpcoming && p.status !== 'UPCOMING' && (p.stockQuantity !== undefined ? p.stockQuantity === 0 : !p.stock)
  ).length;

  const upcomingCount = products.filter(
    (p) => Boolean(p.isUpcoming || p.status === 'UPCOMING')
  ).length;

  const total = products.length;

  const slices = [
    {
      label: 'In Stock (>= 5)',
      count: inStockCount,
      color: '#20a4b8',
      icon: CheckCircle,
      desc: 'Healthy inventory ready to dispatch',
    },
    {
      label: 'Low Stock (< 5)',
      count: lowStockCount,
      color: '#e0a64e',
      icon: AlertTriangle,
      desc: 'Immediate reorder recommended',
    },
    {
      label: 'Out of Stock',
      count: outOfStockCount,
      color: '#be2f67',
      icon: XCircle,
      desc: 'Zero active inventory units',
    },
    {
      label: 'Upcoming Line',
      count: upcomingCount,
      color: '#7a6b68',
      icon: Clock,
      desc: 'Crafting in loom / Pre-orders only',
    },
  ];

  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;
  const arcs = slices.map((s, idx) => {
    const fraction = total > 0 ? s.count / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;
    return {
      ...s,
      idx,
      fraction,
      percentage: total > 0 ? Math.round(fraction * 100) : 0,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div
      style={{
        backgroundColor: '#fff8ec',
        borderRadius: 20,
        padding: 24,
        border: '1px solid #f3e6cd',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          borderBottom: '1px solid #f3e6cd',
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#7a2e2e',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            <Package size={13} />
            <span>INVENTORY INTELLIGENCE</span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 24,
              fontWeight: 700,
              color: '#241209',
              margin: '4px 0 0',
            }}
          >
            Saree Stock Analysis
          </h3>
        </div>
        <span
          style={{
            fontSize: 12,
            color: '#8a6a3f',
            backgroundColor: '#fbf3e4',
            padding: '4px 12px',
            borderRadius: 99,
            border: '1px solid #f3e6cd',
          }}
        >
          Live Database Data • {total} Sarees
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'center' }}>
        {/* SVG Donut Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {total === 0 ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '6px dashed #d9c6a3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8a6a3f',
                  fontSize: 12,
                }}
              >
                No Sarees Recorded
              </div>
            ) : (
              <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#f3e6cd"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {arcs.map((arc) => (
                  <circle
                    key={arc.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={arc.color}
                    strokeWidth={hoveredIdx === arc.idx ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={arc.strokeDasharray}
                    strokeDashoffset={arc.strokeDashoffset}
                    fill="transparent"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIdx(arc.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </svg>
            )}

            {/* Inner Center KPI */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 10, color: '#8a6a3f', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                Total Sarees
              </span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: '#241209' }}>
                {total}
              </span>
              {hoveredIdx !== null && arcs[hoveredIdx] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    marginTop: 2,
                    color: '#fff',
                    backgroundColor: arcs[hoveredIdx].color,
                  }}
                >
                  {arcs[hoveredIdx].percentage}% {arcs[hoveredIdx].label.split(' ')[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div style={{ display: 'grid', gap: 10 }}>
          {arcs.map((arc) => {
            const Icon = arc.icon;
            const isHovered = hoveredIdx === arc.idx;
            return (
              <div
                key={arc.label}
                onMouseEnter={() => setHoveredIdx(arc.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: isHovered ? '1px solid #c9a227' : '1px solid #f3e6cd',
                  backgroundColor: isHovered ? '#fbf3e4' : '#fff',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: arc.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#241209', display: 'block' }}>
                      {arc.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#8a6a3f' }}>{arc.desc}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#241209' }}>{arc.count}</span>
                    <span style={{ fontSize: 11, color: '#8a6a3f', marginLeft: 4 }}>({arc.percentage}%)</span>
                  </div>
                  <Icon size={16} color={arc.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StockChart;
