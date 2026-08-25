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
  const containerRef = useRef(null);
  const dragRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  const { devices, links } = topology;

  // Measure actual container size
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
    // Initial measure
    setCanvasSize({ w: el.clientWidth || BASE_W, h: el.clientHeight || BASE_H });
    return () => ro.disconnect();
  }, []);

  // Scale factors: map base coords → actual pixels
  const scaleX = canvasSize.w / BASE_W;
  const scaleY = canvasSize.h / BASE_H;

  // Reset positions when scenario/layout changes
  useEffect(() => {
    const pos = {};
    topology.devices.forEach(d => { pos[d.id] = { x: d.x, y: d.y }; });
    setDevicePositions(pos);
    setSelectedDevice(null);
    setDragging(null);
  }, [layoutKey]);

  // Packet animation on step change
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

  // Convert screen coords to base coords
  const screenToBase = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / scaleX,
      y: (clientY - rect.top) / scaleY
    };
  }, [scaleX, scaleY]);

  // --- Drag handlers ---
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
    if (!dragRef.current.id) return;
    const base = screenToBase(e.clientX, e.clientY);
    const x = Math.max(20, Math.min(BASE_W - 20, base.x - dragRef.current.offsetX));
    const y = Math.max(20, Math.min(BASE_H - 20, base.y - dragRef.current.offsetY));
    setDevicePositions(prev => ({ ...prev, [dragRef.current.id]: { x, y } }));
  }, [screenToBase]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // --- Touch drag handlers ---
  const handleTouchStart = useCallback((deviceId, touch) => {
    const base = screenToBase(touch.clientX, touch.clientY);
    const devPos = devicePositions[deviceId];
    dragRef.current = {
      id: deviceId,
      offsetX: base.x - devPos.x,
      offsetY: base.y - devPos.y
    };
    setDragging(deviceId);
  }, [devicePositions, screenToBase]);

  const handleTouchMove = useCallback((e) => {
    if (!dragRef.current.id) return;
    e.preventDefault();
    const touch = e.touches[0];
    const base = screenToBase(touch.clientX, touch.clientY);
    const x = Math.max(20, Math.min(BASE_W - 20, base.x - dragRef.current.offsetX));
    const y = Math.max(20, Math.min(BASE_H - 20, base.y - dragRef.current.offsetY));
    setDevicePositions(prev => ({ ...prev, [dragRef.current.id]: { x, y } }));
  }, [screenToBase]);

  const handleTouchEnd = useCallback(() => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragging, handleTouchMove, handleTouchEnd]);

  // --- Device click (tooltip) ---
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
        style={{ cursor: dragging ? 'grabbing' : 'default' }}
        onMouseDown={(e) => {
          if (e.target === containerRef.current || e.target.classList.contains('canvas-bg')) handlePaneClick();
        }}
      >
        <div className="canvas-bg" />

        <svg className="canvas-svg" width={canvasSize.w} height={canvasSize.h}>
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
        </svg>

        <div className="canvas-devices">
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
                onTouchStart={handleTouchStart}
                onClick={handleDeviceClick}
              />
            );
          })}
        </div>

        <div className="canvas-packets">
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
              x: (devicePositions[selectedDevice.id]?.x || selectedDevice.x) * scaleX,
              y: (devicePositions[selectedDevice.id]?.y || selectedDevice.y) * scaleY
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
