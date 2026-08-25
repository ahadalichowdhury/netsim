import React, { useState, useCallback, useRef, useEffect } from 'react';

const SchematicCanvas = ({ scenario, step }) => {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState({});
  const [arrows, setArrows] = useState([]);
  const [selected, setSelected] = useState(null);
  const interaction = useRef(null);

  const toSVG = useCallback((cx, cy) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return { x: (cx - r.left) / zoom - pan.x, y: (cy - r.top) / zoom - pan.y };
  }, [zoom, pan]);

  const updateEl = useCallback((id, patch) => {
    setElements(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const initScene = useCallback((els, arrs) => {
    setElements(els);
    setArrows(arrs);
    setSelected(null);
  }, []);

  useEffect(() => {
    const scene = buildScene(scenario.id, step?.stepIndex ?? 0);
    initScene(scene.elements, scene.arrows);
  }, [scenario.id, step?.stepIndex, initScene]);

  const onWheel = useCallback(e => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.25, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const onMouseDown = useCallback(e => {
    if (e.target === svgRef.current || e.target.classList?.contains('bg')) {
      setSelected(null);
      interaction.current = { type: 'pan', sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    }
  }, [pan]);

  const startDrag = useCallback((id, e) => {
    e.stopPropagation();
    setSelected(id);
    const el = elements[id];
    const pt = toSVG(e.clientX, e.clientY);
    interaction.current = { type: 'drag', id, ox: pt.x - el.x, oy: pt.y - el.y };
  }, [elements, toSVG]);

  const startResize = useCallback((id, e) => {
    e.stopPropagation();
    setSelected(id);
    const pt = toSVG(e.clientX, e.clientY);
    interaction.current = { type: 'resize', id, startX: pt.x, startY: pt.y };
  }, [toSVG]);

  const onMouseMove = useCallback(e => {
    const act = interaction.current;
    if (!act) return;
    if (act.type === 'pan') {
      const svg = svgRef.current;
      const r = svg.getBoundingClientRect();
      setPan({ x: act.px + (e.clientX - act.sx) / zoom, y: act.py + (e.clientY - act.sy) / zoom });
    } else if (act.type === 'drag') {
      const pt = toSVG(e.clientX, e.clientY);
      updateEl(act.id, { x: pt.x - act.ox, y: pt.y - act.oy });
    } else if (act.type === 'resize') {
      const pt = toSVG(e.clientX, e.clientY);
      const el = elements[act.id];
      const nw = Math.max(40, el.w + (pt.x - act.startX));
      const nh = Math.max(20, el.h + (pt.y - act.startY));
      updateEl(act.id, { w: nw, h: nh });
      interaction.current = { ...act, startX: pt.x, startY: pt.y };
    }
  }, [zoom, toSVG, elements, updateEl]);

  const onMouseUp = useCallback(() => { interaction.current = null; }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) { svg.addEventListener('wheel', onWheel, { passive: false }); return () => svg.removeEventListener('wheel', onWheel); }
  }, [onWheel]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const getAnchor = (id, side) => {
    const el = elements[id];
    if (!el) return { x: 0, y: 0 };
    const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
    if (side === 'right') return { x: el.x + el.w, y: cy };
    if (side === 'left') return { x: el.x, y: cy };
    if (side === 'top') return { x: cx, y: el.y };
    if (side === 'bottom') return { x: cx, y: el.y + el.h };
    return { x: cx, y: cy };
  };

  return (
    <div className="schematic-canvas">
      <div className="schematic-zoom-controls">
        <button onClick={() => setZoom(z => Math.min(3, z + 0.15))}>+</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.15))}>−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>⟲</button>
      </div>
      <svg ref={svgRef} viewBox="0 0 960 480" className="schematic-svg"
        style={{ cursor: interaction.current?.type === 'pan' ? 'grabbing' : 'default' }} onMouseDown={onMouseDown}>
        <rect className="bg" x="-5000" y="-5000" width="15000" height="15000" fill="transparent"/>
        <g transform={`scale(${zoom}) translate(${pan.x},${pan.y})`}>
          {arrows.map((a, i) => {
            const from = getAnchor(a.from, a.fromSide || 'right');
            const to = getAnchor(a.to, a.toSide || 'left');
            return <Arrow key={i} {...a} x1={from.x} y1={from.y} x2={to.x} y2={to.y} selected={selected === a.id}/>;
          })}
          {Object.entries(elements).map(([id, el]) => (
            <Element key={id} id={id} el={el} selected={selected === id}
              onDrag={startDrag} onResize={startResize} onSelect={() => setSelected(id)}/>
          ))}
        </g>
      </svg>
    </div>
  );
};

const Element = ({ id, el, selected, onDrag, onResize, onSelect }) => {
  const { x, y, w, h, type, label, sub, color, fill, highlighted, cmds, ip, subnet, ports, lettering } = el;
  const sColor = selected ? 'var(--cyan)' : color;

  const renderBody = () => {
    switch (type) {
      case 'box':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="6" fill={fill || 'rgba(42,53,85,0.5)'}
              stroke={sColor || 'var(--border-bright)'} strokeWidth={highlighted ? 2.5 : 1.5}/>
            <text x={x + w/2} y={y + h/2 + (sub ? -2 : 4)} textAnchor="middle" fill="var(--text-primary)"
              fontSize="12" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>
            {sub && <text x={x + w/2} y={y + h/2 + 12} textAnchor="middle" fill="var(--text-muted)"
              fontSize="10" fontFamily="var(--font-mono)">{sub}</text>}
          </g>
        );
      case 'container':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="18" fill="none"
              stroke="var(--green)" strokeWidth="2" opacity="0.6"/>
            {label && <text x={x + w/2} y={y - 8} textAnchor="middle" fill="var(--text-muted)"
              fontSize="12" fontFamily="var(--font-sans)">{label}</text>}
          </g>
        );
      case 'nic':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="6"
              fill={highlighted ? 'rgba(6,182,212,0.25)' : 'rgba(42,53,85,0.5)'}
              stroke={sColor || 'var(--cyan)'} strokeWidth={highlighted ? 2.5 : 1.5}/>
            <text x={x + w/2} y={y + h/2 + 4} textAnchor="middle" fill="var(--cyan)"
              fontSize="11" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>
            {subnet && <text x={x + w/2} y={y + h + 16} textAnchor="middle" fill="var(--text-muted)"
              fontSize="10" fontFamily="var(--font-mono)">{subnet}</text>}
          </g>
        );
      case 'bridge': {
        const pw = Math.min(20, (w - 24) / ((ports || 5) + 1));
        const gap = (w - (ports || 5) * pw) / ((ports || 5) + 1);
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="8"
              fill={highlighted ? 'rgba(139,92,246,0.2)' : 'rgba(42,53,85,0.4)'}
              stroke={sColor || 'var(--text-muted)'} strokeWidth={highlighted ? 2 : 1.5}/>
            {label && <text x={x + w/2} y={y + h + 16} textAnchor="middle" fill="var(--text-muted)"
              fontSize="11" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>}
            {subnet && <text x={x + w/2} y={y - 8} textAnchor="middle" fill="var(--cyan)"
              fontSize="10" fontFamily="var(--font-mono)">{subnet}</text>}
            {Array.from({ length: ports || 5 }).map((_, i) => (
              <rect key={i} x={x + gap + i * (pw + gap)} y={y + (h - 22) / 2}
                width={pw} height={22} rx="3"
                fill={highlighted ? 'rgba(139,92,246,0.3)' : 'rgba(42,53,85,0.6)'}
                stroke="var(--text-muted)" strokeWidth="1"/>
            ))}
          </g>
        );
      }
      case 'snat':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="6"
              fill={highlighted ? 'rgba(74,222,128,0.25)' : 'rgba(74,222,128,0.1)'}
              stroke="var(--green)" strokeWidth={highlighted ? 2.5 : 1.5}/>
            {(lettering || ['S','N','A','T']).map((c, i) => (
              <text key={i} x={x + w/2} y={y + h/2 - 18 + i * 14} textAnchor="middle"
                fill="var(--green)" fontSize="12" fontWeight="700"
                fontFamily="var(--font-mono)" letterSpacing="2">{c}</text>
            ))}
          </g>
        );
      case 'namespace':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="12"
              fill={highlighted ? 'rgba(0,212,255,0.12)' : 'rgba(42,53,85,0.4)'}
              stroke="var(--cyan)" strokeWidth={highlighted ? 2 : 1.5}/>
            {label && <text x={x + w/2} y={y - 8} textAnchor="middle" fill="var(--cyan)"
              fontSize="11" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>}
            {cmds?.map((c, i) => (
              <text key={i} x={x + w/2} y={y + 22 + i * 18} textAnchor="middle"
                fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">{c}</text>
            ))}
            {ip && <text x={x + w/2} y={y + h + 16} textAnchor="middle" fill="var(--text-muted)"
              fontSize="10" fontFamily="var(--font-mono)">{ip}</text>}
          </g>
        );
      case 'text':
        return (
          <text x={x} y={y} textAnchor="middle" fill="var(--text-primary)"
            fontSize={el.fontSize || 14} fontWeight={el.fontWeight || '600'}
            fontFamily={el.fontFamily || 'var(--font-sans)'}>{label}
            {sub && <tspan x={x} dy="18" fill="var(--text-muted)" fontSize="13"
              fontFamily="var(--font-mono)">{sub}</tspan>}
          </text>
        );
      case 'dot':
        return (
          <g>
            <circle cx={x} cy={y} r="8" fill={color || 'var(--cyan)'} opacity="0.25" className="packet-pulse"/>
            <circle cx={x} cy={y} r="5" fill={color || 'var(--cyan)'}/>
            {label && <text x={x} y={y - 14} textAnchor="middle" fill="var(--text-primary)"
              fontSize="10" fontWeight="600" fontFamily="var(--font-mono)"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{label}</text>}
          </g>
        );
      default:
        return <rect x={x} y={y} width={w} height={h} fill="red" opacity="0.3"/>;
    }
  };

  const isBox = ['box', 'container', 'nic', 'bridge', 'snat', 'namespace'].includes(type);

  return (
    <g>
      <g onMouseDown={isBox ? (e) => onDrag(id, e) : undefined}
        style={{ cursor: isBox ? 'grab' : 'default' }}>
        {renderBody()}
      </g>
      {isBox && selected && (
        <>
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--cyan)"
            strokeWidth="1" strokeDasharray="4,3" pointerEvents="none"/>
          <rect x={x + w - 6} y={y + h - 6} width="10" height="10" rx="2"
            fill="var(--cyan)" stroke="var(--bg-primary)" strokeWidth="1"
            style={{ cursor: 'nwse-resize' }}
            onMouseDown={e => onResize(id, e)}/>
        </>
      )}
    </g>
  );
};

const Arrow = ({ x1, y1, x2, y2, label, color = 'var(--green)', highlighted, dashed, selected }) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const nx = -uy * 14, ny = ux * 14;
  const id = 'm' + Math.random().toString(36).slice(2, 8);
  const sw = selected ? 3.5 : highlighted ? 3 : 2;
  const c = selected ? 'var(--cyan)' : color;
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={c}/>
        </marker>
      </defs>
      <line x1={x1 + ux * 12} y1={y1 + uy * 12} x2={x2 - ux * 16} y2={y2 - uy * 16}
        stroke={c} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={dashed ? '8,5' : 'none'} markerEnd={`url(#${id})`}
        opacity={highlighted ? 1 : 0.7}/>
      {label && <text x={mx + nx} y={my + ny} textAnchor="middle" fill="var(--text-secondary)"
        fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">{label}</text>}
    </g>
  );
};

function buildScene(scenarioId, stepIdx) {
  const s = stepIdx;
  const scenes = { nic: nicScene, stack: stackScene, route: routeScene, iptables: iptablesScene, namespace: namespaceScene, bridge: bridgeScene };
  return (scenes[scenarioId] || (() => ({ elements: {}, arrows: [] })))(s);
}

function nicScene(s) {
  return {
    elements: {
      host:   { x: 60, y: 60, w: 440, h: 280, type: 'container', label: 'Linux Host' },
      kernel: { x: 100, y: 140, w: 140, h: 70, type: 'box', label: 'Kernel', sub: 'Network Stack', highlighted: s >= 5 && s <= 8 },
      eth0:   { x: 320, y: 140, w: 120, h: 70, type: 'nic', label: 'eth0', subnet: 'AA:BB:CC:DD:EE:01', highlighted: s === 1 || s === 4 || s === 9 },
      sw:     { x: 600, y: 140, w: 100, h: 70, type: 'box', label: 'Switch', highlighted: s >= 2 && s <= 3 || s === 8 },
      srv:    { x: 780, y: 140, w: 120, h: 70, type: 'box', label: 'Web Server', sub: '192.168.1.20', highlighted: s === 0 || s === 9 },
      ...(s === 1 ? { d1: { x: 660, y: 175, type: 'dot', color: 'var(--cyan)', label: 'Incoming Frame' } } : {}),
      ...(s === 2 ? { d1: { x: 380, y: 175, type: 'dot', color: 'var(--cyan)', label: 'MAC check' } } : {}),
      ...(s === 8 ? { d1: { x: 380, y: 175, type: 'dot', color: 'var(--green)', label: 'TX' } } : {}),
      ...(s === 9 ? { d1: { x: 660, y: 175, type: 'dot', color: 'var(--green)', label: 'Outgoing Frame' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'eth0', to: 'sw', label: 'cable', highlighted: s >= 2 && s <= 3 || s === 8 },
      { id: 'a2', from: 'sw', to: 'srv', highlighted: s >= 2 && s <= 3 },
    ]
  };
}

function stackScene(s) {
  const L = [
    { id: 'app', label: 'Application', y: 40, c: 'var(--cyan)' },
    { id: 'sock', label: 'Socket API', y: 110, c: 'var(--cyan)' },
    { id: 'tcp', label: 'TCP Layer', y: 180, c: 'var(--blue)' },
    { id: 'ip', label: 'IP Layer', y: 250, c: 'var(--purple)' },
    { id: 'nic', label: 'NIC (eth0)', y: 320, c: 'var(--amber)' },
  ];
  const els = {
    ctn1: { x: 60, y: 20, w: 360, h: 370, type: 'container', label: 'Sending Host' },
    ctn2: { x: 560, y: 20, w: 340, h: 370, type: 'container', label: 'Receiving Host' },
  };
  const arrs = [];
  L.forEach((l, i) => {
    els[l.id] = { x: 100, y: l.y, w: 280, h: 50, type: 'box', label: l.label, color: l.c, highlighted: s >= i + 1 && s <= i + 5 };
    if (i < 4) arrs.push({ id: `sa${i}`, from: l.id, to: L[i + 1].id, color: 'var(--text-muted)', highlighted: s === i + 2 });
    els[`r${l.id}`] = { x: 600, y: l.y, w: 260, h: 50, type: 'box', label: l.label, color: l.c, highlighted: s >= 10 + i };
  });
  arrs.push({ id: 'wire', from: 'nic', to: 'rnic', label: 'Wire', color: 'var(--green)', highlighted: s === 8 || s === 9 });
  if (s >= 2 && s <= 8) els.dot1 = { x: 190 + (s - 2) * 35, y: 70 + (s - 2) * 70, type: 'dot', color: 'var(--cyan)' };
  if (s === 9) els.dot2 = { x: 490, y: 345, type: 'dot', color: 'var(--green)' };
  return { elements: els, arrows: arrs };
}

function routeScene(s) {
  return {
    elements: {
      box:  { x: 160, y: 40, w: 640, h: 280, type: 'container', label: 'Linux Box' },
      eth0: { x: 190, y: 120, w: 100, h: 50, type: 'nic', label: 'eth0', subnet: '192.168.1.1', highlighted: s >= 2 && s <= 4 },
      rt:   { x: 360, y: 100, w: 200, h: 90, type: 'box', label: 'Routing Table', sub: 'ip route', highlighted: s >= 4 && s <= 6 },
      eth1: { x: 630, y: 120, w: 100, h: 50, type: 'nic', label: 'eth1', subnet: '10.0.0.1', highlighted: s >= 6 && s <= 8 },
      pca:  { x: 80, y: 360, w: 100, h: 50, type: 'box', label: 'PC-A', sub: '192.168.1.10' },
      swa:  { x: 360, y: 360, w: 100, h: 50, type: 'box', label: 'Switch A', highlighted: s >= 2 && s <= 3 },
      swb:  { x: 630, y: 360, w: 100, h: 50, type: 'box', label: 'Switch B', highlighted: s >= 7 && s <= 8 },
      srv:  { x: 800, y: 360, w: 100, h: 50, type: 'box', label: 'Server', sub: '8.8.8.8' },
      ...(s === 2 ? { d1: { x: 270, y: 385, type: 'dot', color: 'var(--cyan)', label: 'from PC-A' } } : {}),
      ...(s === 3 ? { d1: { x: 240, y: 260, type: 'dot', color: 'var(--cyan)' } } : {}),
      ...(s === 5 ? { d1: { x: 460, y: 145, type: 'dot', color: 'var(--green)', label: 'lookup' } } : {}),
      ...(s === 7 ? { d1: { x: 660, y: 260, type: 'dot', color: 'var(--green)' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'eth0', to: 'rt', highlighted: s === 3 || s === 4 },
      { id: 'a2', from: 'rt', to: 'eth1', highlighted: s === 6 },
      { id: 'a3', from: 'pca', to: 'swa', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a4', from: 'swa', to: 'eth0', color: 'var(--cyan)', highlighted: s === 3, fromSide: 'top', toSide: 'bottom' },
      { id: 'a5', from: 'swb', to: 'srv', color: 'var(--green)', highlighted: s === 8 },
    ]
  };
}

function iptablesScene(s) {
  return {
    elements: {
      inet: { x: 40, y: 140, w: 120, h: 70, type: 'box', label: 'Internet', highlighted: s <= 1 || s === 9 },
      fw:   { x: 200, y: 80, w: 320, h: 240, type: 'container', label: 'Linux Firewall' },
      pre:  { x: 240, y: 110, w: 0, h: 0, type: 'text', label: 'PREROUTING', fontSize: 11, fontWeight: '600', fontFamily: 'var(--font-mono)' },
      inp:  { x: 230, y: 125, w: 80, h: 40, type: 'box', label: 'INPUT', color: 'var(--green)', highlighted: s === 4 || s === 5 },
      fwd:  { x: 340, y: 125, w: 80, h: 40, type: 'box', label: 'FORWARD', color: 'var(--amber)', highlighted: s >= 3 && s <= 7 },
      out:  { x: 450, y: 125, w: 80, h: 40, type: 'box', label: 'OUTPUT', color: 'var(--cyan)' },
      post: { x: 240, y: 200, w: 0, h: 0, type: 'text', label: 'POSTROUTING', fontSize: 11, fontWeight: '600', fontFamily: 'var(--font-mono)' },
      sw:   { x: 580, y: 140, w: 100, h: 70, type: 'box', label: 'Switch', highlighted: s === 7 || s === 8 },
      srv:  { x: 740, y: 140, w: 120, h: 70, type: 'box', label: 'Server', sub: 'Web App', highlighted: s === 8 },
      ...(s === 1 ? { d1: { x: 180, y: 175, type: 'dot', color: 'var(--red)', label: 'HTTP Request' } } : {}),
      ...(s === 10 ? { d1: { x: 180, y: 175, type: 'dot', color: 'var(--red)', label: 'SSH Attack' } } : {}),
      ...(s === 11 ? { d1: { x: 360, y: 340, type: 'text', label: 'DROPPED', fontSize: 13, fontWeight: '700', color: 'var(--red)' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'inet', to: 'fw', color: s === 10 ? 'var(--red)' : 'var(--cyan)', highlighted: s === 1 || s === 10 },
      { id: 'a2', from: 'fw', to: 'sw', color: s === 11 ? 'var(--red)' : 'var(--green)', highlighted: s === 7 || s === 8 || s === 11 },
      { id: 'a3', from: 'sw', to: 'srv', color: 'var(--green)', highlighted: s === 8 },
    ]
  };
}

function namespaceScene(s) {
  return {
    elements: {
      ns1:  { x: 40, y: 60, w: 200, h: 160, type: 'container', label: 'Namespace: app1' },
      n1:   { x: 60, y: 100, w: 160, h: 80, type: 'namespace', label: 'ns-app1', cmds: ['ping 8.8.8.8', 'ip addr'], ip: '192.168.1.10', highlighted: s === 0 || s === 4 },
      ns2:  { x: 40, y: 280, w: 200, h: 160, type: 'container', label: 'Namespace: app2' },
      n2:   { x: 60, y: 320, w: 160, h: 80, type: 'namespace', label: 'ns-app2', cmds: ['curl google.com'], ip: '192.168.2.10', highlighted: s === 7 },
      va:   { x: 300, y: 100, w: 80, h: 50, type: 'nic', label: 'veth-a', highlighted: s >= 4 && s <= 5 },
      vb:   { x: 300, y: 320, w: 80, h: 50, type: 'nic', label: 'veth-b', highlighted: s === 7 },
      br:   { x: 440, y: 160, w: 160, h: 60, type: 'bridge', label: 'br0', subnet: '192.168.1.1/24', highlighted: s >= 5 && s <= 9 },
      snat: { x: 660, y: 120, w: 30, h: 200, type: 'snat', highlighted: s === 6 || s === 9 },
      inet: { x: 780, y: 175, type: 'text', label: 'Internet', sub: '8.8.8.8', fontSize: 15, fontWeight: '600' },
      ...(s === 4 ? { d1: { x: 260, y: 130, type: 'dot', color: 'var(--cyan)' } } : {}),
      ...(s === 5 ? { d1: { x: 410, y: 150, type: 'dot', color: 'var(--cyan)' } } : {}),
      ...(s === 7 ? { d1: { x: 260, y: 350, type: 'dot', color: 'var(--amber)' } } : {}),
      ...(s === 8 ? { d1: { x: 410, y: 270, type: 'dot', color: 'var(--amber)' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'ns1', to: 'va', color: 'var(--cyan)', highlighted: s === 4, fromSide: 'right', toSide: 'left' },
      { id: 'a2', from: 'ns2', to: 'vb', color: 'var(--amber)', highlighted: s === 7, fromSide: 'right', toSide: 'left' },
      { id: 'a3', from: 'va', to: 'br', color: 'var(--cyan)', highlighted: s === 5 },
      { id: 'a4', from: 'vb', to: 'br', color: 'var(--amber)', highlighted: s === 8 },
      { id: 'a5', from: 'br', to: 'snat', color: 'var(--green)', highlighted: s === 6 || s === 9 },
      { id: 'a6', from: 'snat', to: 'inet', color: 'var(--green)', highlighted: s === 6 || s === 9 },
    ]
  };
}

function bridgeScene(s) {
  return {
    elements: {
      vm1:  { x: 60, y: 100, w: 120, h: 60, type: 'box', label: 'VM-1', sub: '192.168.1.10', highlighted: s >= 2 && s <= 4 || s === 7 },
      vm2:  { x: 60, y: 300, w: 120, h: 60, type: 'box', label: 'VM-2', sub: '192.168.1.20', highlighted: s === 4 || s === 5 || s === 8 },
      br:   { x: 280, y: 160, w: 200, h: 70, type: 'bridge', label: 'br0 (Linux Bridge)', ports: 6, highlighted: s >= 5 && s <= 8 },
      rt:   { x: 580, y: 180, w: 100, h: 60, type: 'box', label: 'Router', sub: 'Gateway', highlighted: s === 9 || s === 10 },
      inet: { x: 760, y: 180, w: 100, h: 60, type: 'box', label: 'Internet' },
      ...(s === 2 ? { d1: { x: 230, y: 155, type: 'dot', color: 'var(--amber)' } } : {}),
      ...(s === 3 ? { d1: { x: 230, y: 270, type: 'dot', color: 'var(--amber)' } } : {}),
      ...(s === 5 ? { d1: { x: 230, y: 155, type: 'dot', color: 'var(--green)' } } : {}),
      ...(s === 7 ? { d1: { x: 230, y: 155, type: 'dot', color: 'var(--cyan)' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'vm1', to: 'br', color: 'var(--amber)', highlighted: s === 2 || s === 3, label: s === 2 ? 'ARP Broadcast' : '' },
      { id: 'a2', from: 'vm2', to: 'br', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a3', from: 'br', to: 'vm1', color: 'var(--green)', highlighted: s === 5, label: 'ARP Reply' },
      { id: 'a4', from: 'vm1', to: 'br', color: 'var(--cyan)', highlighted: s === 7, label: 'Unicast' },
      { id: 'a5', from: 'br', to: 'vm2', color: 'var(--green)', highlighted: s === 8 },
      { id: 'a6', from: 'br', to: 'rt', color: 'var(--green)', highlighted: s === 9 || s === 10 },
      { id: 'a7', from: 'rt', to: 'inet', color: 'var(--green)', highlighted: s === 10 },
    ]
  };
}

export default SchematicCanvas;
