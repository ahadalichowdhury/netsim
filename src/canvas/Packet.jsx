import React, { useState, useEffect, useRef } from 'react';

const Packet = ({ packet, devices, onComplete }) => {
  const [trail, setTrail] = useState([]);
  const [visible, setVisible] = useState(false);
  const animRef = useRef(null);

  const fromDevice = devices.find(d => d.id === packet.from);
  const toDevice = devices.find(d => d.id === packet.to);

  useEffect(() => {
    if (!fromDevice || !toDevice) return;

    const startX = fromDevice.x;
    const startY = fromDevice.y;
    const endX = toDevice.x;
    const endY = toDevice.y;
    const duration = packet.duration || 1200;
    const trailLength = 8;
    const startTime = Date.now();

    setVisible(true);
    setTrail([]);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const cx = startX + (endX - startX) * eased;
      const cy = startY + (endY - startY) * eased;

      setTrail(prev => {
        const next = [...prev, { x: cx, y: cy, t: Date.now() }];
        return next.slice(-trailLength);
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setVisible(false);
          onComplete?.(packet.id);
        }, 200);
      }
    };

    const delay = packet.delay || 0;
    const timeout = setTimeout(() => {
      animRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [packet.from, packet.to, packet.duration, packet.delay, fromDevice, toDevice]);

  if (!visible || trail.length === 0) return null;

  const color = packet.color || 'var(--cyan)';
  const head = trail[trail.length - 1];

  return (
    <div className="packet-flow" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <filter id={`glow-${packet.id}`}>
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Trail */}
        {trail.map((pt, i) => {
          const age = (Date.now() - pt.t) / 600;
          const opacity = Math.max(0, 1 - age) * (i / trail.length);
          const r = 3 + (i / trail.length) * 3;
          return (
            <circle key={i} cx={pt.x} cy={pt.y} r={r} fill={color}
              opacity={opacity * 0.5} filter={`url(#glow-${packet.id})`}/>
          );
        })}

        {/* Head */}
        <circle cx={head.x} cy={head.y} r="6" fill={color} opacity="0.3"
          filter={`url(#glow-${packet.id})`}/>
        <circle cx={head.x} cy={head.y} r="4" fill={color}/>

        {/* Broadcast wave */}
        {packet.broadcast && (
          <>
            <circle cx={head.x} cy={head.y} r="10" fill="none" stroke={color}
              strokeWidth="2" opacity="0.4" className="broadcast-ring"/>
            <circle cx={head.x} cy={head.y} r="20" fill="none" stroke={color}
              strokeWidth="1.5" opacity="0.2" className="broadcast-ring-delay"/>
          </>
        )}
      </svg>

      {/* Label */}
      {packet.label && (
        <div style={{
          position: 'absolute',
          left: head.x,
          top: head.y - 18,
          transform: 'translateX(-50%)',
          fontSize: '10px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          background: 'rgba(0,0,0,0.8)',
          padding: '2px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)'
        }}>{packet.label}</div>
      )}
    </div>
  );
};

export default Packet;
