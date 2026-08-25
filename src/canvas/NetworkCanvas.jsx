import React, { useState, useCallback, useEffect, useRef } from 'react';
import DeviceNode from './DeviceNode';
import DeviceTooltip from './DeviceTooltip';
import Cable from './Cable';
import Packet from './Packet';

const BASE_W = 1000;
const BASE_H = 480;

const NetworkCanvas = ({ topology, step, layoutKey }) => {
  const [devicePositions, setDevicePositions] = useState(() => {
    const pos = {};
    topology.devices.forEach(d => { pos[d.id] = { x: d.x, y: d.y }; });
    return pos;
  });
  const [dragging, setDragging] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [packets, setPackets] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ w: BASE_W, h: BASE_H });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const dragRef = useRef({ id: null, offsetX: 0, offsetY: 0 });
  const gestureRef = useRef(null); // Unified gesture tracker

  const { devices, links } = topology;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ w: width, h: height });
        }
      }
    });
    ro.observe(el);
    setCanvasSize({ w: el.clientWidth || BASE_W, h: el.clientHeight || BASE_H });
    return () => ro.disconnect();
  }, []);

  const scaleX = canvasSize.w / BASE_W * zoom;
  const scaleY = canvasSize.h / BASE_H * zoom;

  useEffect(() => {
    const pos = {};
    topology.devices.forEach(d => { pos[d.id] = { x: d.x, y: d.y }; });
    setDevicePositions(pos);
    setSelectedDevice(null);
    setDragging(null);
  }, [layoutKey]);

  useEffect(() => {
    setPackets([]);
    if (step?.packets && step.packets.length > 0) {
      const timer = setTimeout(() => {
        setPackets(step.packets.map((p, i) => ({ ...p, delay: i * 200 })));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step?.title]);

  const handlePacketComplete = useCallback(() => {}, []);

  const screenToBase = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / scaleX,
      y: (clientY - rect.top - pan.y) / scaleY
    };
  }, [scaleX, scaleY, pan]);

  // --- Mouse drag (desktop) ---
  const handleDragStart = useCallback((deviceId, mouseX, mouseY) => {
    const base = screenToBase(mouseX, mouseY);
    const devPos = devicePositions[deviceId];
    dragRef.current = {
      id: deviceId,
      offsetX: base.x - devPos.x,
      offsetY: base.y - devPos.y
    };
    setDragging(deviceId);
  }, [devicePositions, screenToBase]);

  const handleMouseMove = useCallback((e) => {
    const g = gestureRef.current;
    if (dragRef.current.id) {
      const base = screenToBase(e.clientX, e.clientY);
      const x = Math.max(20, Math.min(BASE_W - 20, base.x - dragRef.current.offsetX));
      const y = Math.max(20, Math.min(BASE_H - 20, base.y - dragRef.current.offsetY));
      setDevicePositions(prev => ({ ...prev, [dragRef.current.id]: { x, y } }));
    } else if (g?.type === 'pan') {
      const dx = e.clientX - g.sx;
      const dy = e.clientY - g.sy;
      setPan({ x: g.px + dx, y: g.py + dy });
    }
  }, [screenToBase]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
    gestureRef.current = null;
    setDragging(null);
  }, []);

  useEffect(() => {
    const onMove = (e) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // --- Unified touch handler on container ---
  const handleTouchStart = useCallback((e) => {
    // Two-finger → pinch
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      gestureRef.current = { type: 'pinch', dist: Math.hypot(dx, dy), zoom };
      return;
    }

    const touch = e.touches[0];
    const target = e.target.closest('.device-node');

    if (target) {
      // Touch on device → start device drag
      const deviceId = target.dataset.deviceId;
      if (deviceId) {
        const base = screenToBase(touch.clientX, touch.clientY);
        const devPos = devicePositions[deviceId];
        dragRef.current = {
          id: deviceId,
          offsetX: base.x - devPos.x,
          offsetY: base.y - devPos.y
        };
        gestureRef.current = { type: 'device' };
        setDragging(deviceId);
        return;
      }
    }

    // Touch on empty space → pan
    gestureRef.current = {
      type: 'pan',
      sx: touch.clientX,
      sy: touch.clientY,
      px: pan.x,
      py: pan.y
    };
  }, [zoom, pan, devicePositions, screenToBase]);

  const handleTouchMove = useCallback((e) => {
    const g = gestureRef.current;
    if (!g) return;

    if (g.type === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / g.dist;
      setZoom(Math.min(3, Math.max(0.25, g.zoom * scale)));
    } else if (g.type === 'pan' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - g.sx;
      const dy = t.clientY - g.sy;
      setPan({ x: g.px + dx, y: g.py + dy });
    } else if (g.type === 'device' && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const base = screenToBase(touch.clientX, touch.clientY);
      const x = Math.max(20, Math.min(BASE_W - 20, base.x - dragRef.current.offsetX));
      const y = Math.max(20, Math.min(BASE_H - 20, base.y - dragRef.current.offsetY));
      setDevicePositions(prev => ({ ...prev, [dragRef.current.id]: { x, y } }));
    }
  }, [screenToBase]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
      gestureRef.current = null;
      setDragging(null);
    } else if (e.touches.length === 1 && gestureRef.current?.type === 'pinch') {
      // Went from 2 fingers to 1 → switch to pan
      const t = e.touches[0];
      gestureRef.current = { type: 'pan', sx: t.clientX, sy: t.clientY, px: pan.x, py: pan.y };
    }
  }, [pan]);

  const handleDeviceClick = useCallback((device) => {
    setSelectedDevice(prev => prev?.id === device.id ? null : device);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const highlights = step?.highlights || [];
  const activeLinks = step?.activeLinks || [];

  const getDeviceMeta = useCallback((deviceId) => {
    return devices.find(d => d.id === deviceId) || null;
  }, [devices]);

  return (
    <div className="canvas-wrapper">
      <div
        className="canvas-container"
        ref={containerRef}
        style={{ cursor: dragging ? 'grabbing' : 'default', touchAction: 'none' }}
        onMouseDown={(e) => {
          if (e.target === containerRef.current || e.target.classList.contains('canvas-bg')) {
            handlePaneClick();
            gestureRef.current = { type: 'pan', sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="canvas-bg" />

        <svg className="canvas-svg" width={canvasSize.w} height={canvasSize.h} style={{ overflow: 'visible' }}>
          <defs>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="var(--cyan)" floodOpacity="0.6" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#4ade80" floodOpacity="0.6" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g transform={`translate(${pan.x},${pan.y})`}>
            {links.map(link => {
              const fromPos = devicePositions[link.from];
              const toPos = devicePositions[link.to];
              if (!fromPos || !toPos) return null;
              const isActive = activeLinks.includes(link.id);
              const activePacket = step?.packets?.find(
                p => (p.from === link.from && p.to === link.to) || (p.from === link.to && p.to === link.from)
              );
              return (
                <Cable
                  key={link.id}
                  from={{ x: fromPos.x * scaleX, y: fromPos.y * scaleY }}
                  to={{ x: toPos.x * scaleX, y: toPos.y * scaleY }}
                  isActive={isActive}
                  color={activePacket?.color}
                />
              );
            })}
          </g>
        </svg>

        <div className="canvas-devices" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {devices.map(device => {
            const pos = devicePositions[device.id] || { x: device.x, y: device.y };
            return (
              <DeviceNode
                key={device.id}
                device={{
                  ...device,
                  x: pos.x * scaleX,
                  y: pos.y * scaleY
                }}
                isHighlighted={highlights.includes(device.id)}
                isDragging={dragging === device.id}
                isSelected={selectedDevice?.id === device.id}
                onDragStart={handleDragStart}
                onClick={handleDeviceClick}
              />
            );
          })}
        </div>

        <div className="canvas-packets" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {packets.map(packet => {
            const enrichedDevices = devices.map(d => {
              const pos = devicePositions[d.id] || { x: d.x, y: d.y };
              return { ...d, x: pos.x * scaleX, y: pos.y * scaleY };
            });
            return (
              <Packet
                key={`${packet.id}-${step?.title}`}
                packet={packet}
                devices={enrichedDevices}
                onComplete={handlePacketComplete}
              />
            );
          })}
        </div>

        {selectedDevice && (
          <DeviceTooltip
            device={{
              ...selectedDevice,
              x: (devicePositions[selectedDevice.id]?.x || selectedDevice.x) * scaleX + pan.x,
              y: (devicePositions[selectedDevice.id]?.y || selectedDevice.y) * scaleY + pan.y
            }}
            meta={getDeviceMeta(selectedDevice.id)}
            tables={step?.tables?.[selectedDevice.id]}
            onClose={() => setSelectedDevice(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NetworkCanvas;
