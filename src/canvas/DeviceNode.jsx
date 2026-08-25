import React, { useCallback, useRef } from 'react';

const icons = {
  computer: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="16" rx="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <line x1="12" y1="24" x2="20" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="20" x2="16" y2="24" stroke="white" strokeWidth="2"/>
      <rect x="8" y="8" width="16" height="8" rx="1" fill="rgba(255,255,255,0.15)"/>
    </svg>
  ),
  switch: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="10" width="26" height="12" rx="3" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <circle cx="9" cy="16" r="2" fill="white" opacity="0.8"/>
      <circle cx="16" cy="16" r="2" fill="white" opacity="0.8"/>
      <circle cx="23" cy="16" r="2" fill="white" opacity="0.8"/>
      <line x1="9" y1="22" x2="9" y2="26" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <line x1="16" y1="22" x2="16" y2="26" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <line x1="23" y1="22" x2="23" y2="26" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),
  router: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <line x1="4" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <line x1="16" y1="4" x2="16" y2="28" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <polygon points="16,6 20,12 12,12" fill="white" opacity="0.9"/>
      <polygon points="16,26 12,20 20,20" fill="white" opacity="0.9"/>
      <polygon points="6,16 12,12 12,20" fill="white" opacity="0.9"/>
      <polygon points="26,16 20,12 20,20" fill="white" opacity="0.9"/>
    </svg>
  ),
  server: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="4" width="20" height="8" rx="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="6" y="14" width="20" height="8" rx="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <circle cx="10" cy="8" r="1.5" fill="#4ade80"/>
      <circle cx="10" cy="18" r="1.5" fill="#4ade80"/>
      <line x1="16" y1="22" x2="16" y2="28" stroke="white" strokeWidth="2"/>
      <line x1="12" y1="28" x2="20" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  nic: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="16" rx="3" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="8" y="12" width="8" height="8" rx="1" fill="rgba(255,255,255,0.2)"/>
      <circle cx="22" cy="16" r="2" fill="#4ade80"/>
      <line x1="2" y1="16" x2="6" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="16" x2="30" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  bridge: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="10" width="24" height="12" rx="3" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <line x1="10" y1="10" x2="10" y2="22" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <line x1="22" y1="10" x2="22" y2="22" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <line x1="4" y1="16" x2="28" y2="16" stroke="white" strokeWidth="2"/>
      <circle cx="10" cy="16" r="2" fill="white" opacity="0.9"/>
      <circle cx="16" cy="16" r="2" fill="white" opacity="0.9"/>
      <circle cx="22" cy="16" r="2" fill="white" opacity="0.9"/>
    </svg>
  ),
  firewall: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="3" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <line x1="4" y1="12" x2="28" y2="12" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <line x1="4" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="16" cy="8" r="2" fill="#ef4444" opacity="0.9"/>
      <circle cx="16" cy="16" r="2" fill="#f59e0b" opacity="0.9"/>
      <circle cx="16" cy="24" r="2" fill="#4ade80" opacity="0.9"/>
      <line x1="10" y1="8" x2="22" y2="8" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="10" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="10" y1="24" x2="22" y2="24" stroke="white" strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  linux: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="12" r="6" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <circle cx="14" cy="10" r="1" fill="white"/>
      <circle cx="18" cy="10" r="1" fill="white"/>
      <line x1="14" y1="14" x2="18" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="8" y="18" width="16" height="10" rx="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <line x1="12" y1="22" x2="20" y2="22" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <line x1="12" y1="25" x2="18" y2="25" stroke="white" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  ),
  internet: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      <ellipse cx="16" cy="16" rx="5" ry="12" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="4" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <path d="M6 10 Q16 8 26 10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M6 22 Q16 24 26 22" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </svg>
  )
};

const DeviceNode = ({ device, isHighlighted, isDragging, isSelected, onDragStart, onClick }) => {
  const { type, name, ip, mac, x, y } = device;
  const typeClass = `device-${type}`;
  const highlightClass = isHighlighted ? 'highlighted' : '';
  const dragClass = isDragging ? 'dragging' : '';
  const selectClass = isSelected ? 'selected' : '';
  const dragStarted = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    dragStarted.current = false;
    const onMove = (me) => {
      dragStarted.current = true;
      onDragStart?.(device.id, me.clientX, me.clientY);
      window.removeEventListener('mousemove', onMove);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [device.id, onDragStart]);

  const handleClick = useCallback((e) => {
    if (!dragStarted.current) {
      onClick?.(device);
    }
  }, [device, onClick]);

  return (
    <div
      className={`device-node ${typeClass} ${highlightClass} ${dragClass} ${selectClass}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      data-device-id={device.id}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="device-icon-wrap">
        {icons[type]}
      </div>
      <div className="device-label">{name}</div>
      {ip && <div className="device-sublabel">{ip}</div>}
    </div>
  );
};

export default DeviceNode;
