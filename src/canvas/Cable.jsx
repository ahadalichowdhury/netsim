import React, { useMemo } from 'react';

const Cable = ({ from, to, isActive, color }) => {
  const style = useMemo(() => ({
    stroke: isActive ? (color || 'var(--cyan)') : 'var(--border-bright)',
    strokeWidth: isActive ? 3 : 2,
    filter: isActive ? `drop-shadow(0 0 6px ${color || 'var(--cyan)'})` : 'none',
    transition: 'all 0.3s ease'
  }), [isActive, color]);

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      className={`cable ${isActive ? 'active' : ''}`}
      style={style}
    />
  );
};

export default Cable;
