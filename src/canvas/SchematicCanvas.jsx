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

  const onTouchStart = useCallback(e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      interaction.current = { type: 'pinch', dist: Math.hypot(dx, dy), zoom };
    } else if (e.touches.length === 1 && !interaction.current?.type) {
      const t = e.touches[0];
      interaction.current = { type: 'pan', sx: t.clientX, sy: t.clientY, px: pan.x, py: pan.y };
    }
  }, [zoom, pan]);

  const onTouchMove = useCallback(e => {
    const act = interaction.current;
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      if (act?.type === 'pinch') {
        const scale = newDist / act.dist;
        setZoom(Math.min(3, Math.max(0.25, act.zoom * scale)));
      } else {
        interaction.current = { type: 'pinch', dist: newDist, zoom };
      }
    } else if (e.touches.length === 1 && act) {
      const t = e.touches[0];
      if (act.type === 'pan') {
        setPan({ x: act.px + (t.clientX - act.sx) / zoom, y: act.py + (t.clientY - act.sy) / zoom });
      } else if (act.type === 'drag') {
        const pt = toSVG(t.clientX, t.clientY);
        updateEl(act.id, { x: pt.x - act.ox, y: pt.y - act.oy });
      }
    }
  }, [zoom, toSVG, updateEl]);

  const onTouchEnd = useCallback(e => {
    if (e.touches.length === 0) {
      interaction.current = null;
    } else if (e.touches.length === 1 && interaction.current?.type === 'pinch') {
      const t = e.touches[0];
      interaction.current = { type: 'pan', sx: t.clientX, sy: t.clientY, px: pan.x, py: pan.y };
    }
  }, [pan]);

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
      <svg ref={svgRef} viewBox="0 0 960 480" className="schematic-svg" style={{ cursor: interaction.current?.type === 'pan' ? 'grabbing' : 'default', overflow: 'visible' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>
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
            <rect x={x} y={y} width={w} height={h} rx="6" fill={fill || 'var(--diagram-box)'}
              stroke={sColor || 'var(--diagram-border)'} strokeWidth={highlighted ? 2.5 : 1.5}/>
            <text x={x + w/2} y={y + h/2 + (sub ? -2 : 4)} textAnchor="middle" fill="var(--text-primary)"
              fontSize="12" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>
            {sub && <text x={x + w/2} y={y + h/2 + 12} textAnchor="middle" fill="var(--text-muted)"
              fontSize="10" fontFamily="var(--font-mono)">{sub}</text>}
          </g>
        );
      case 'container':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="18" fill="var(--diagram-container)"
              stroke={sColor || 'var(--diagram-container-border)'} strokeWidth="2" opacity="0.7"/>
            {label && <text x={x + w/2} y={y - 8} textAnchor="middle" fill="var(--text-muted)"
              fontSize="12" fontFamily="var(--font-sans)">{label}</text>}
          </g>
        );
      case 'nic':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="6"
              fill={highlighted ? 'var(--diagram-nic-highlight)' : 'var(--diagram-nic)'}
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
              fill={highlighted ? 'rgba(139,92,246,0.2)' : 'var(--diagram-bridge)'}
              stroke={sColor || 'var(--purple)'} strokeWidth={highlighted ? 2 : 1.5}/>
            {label && <text x={x + w/2} y={y + h + 16} textAnchor="middle" fill="var(--text-muted)"
              fontSize="11" fontWeight="600" fontFamily="var(--font-mono)">{label}</text>}
            {subnet && <text x={x + w/2} y={y - 8} textAnchor="middle" fill="var(--cyan)"
              fontSize="10" fontFamily="var(--font-mono)">{subnet}</text>}
            {Array.from({ length: ports || 5 }).map((_, i) => (
              <rect key={i} x={x + gap + i * (pw + gap)} y={y + (h - 22) / 2}
                width={pw} height={22} rx="3"
                fill={highlighted ? 'rgba(139,92,246,0.3)' : 'var(--diagram-bridge-port)'}
                stroke="var(--purple)" strokeWidth="1" opacity="0.8"/>
            ))}
          </g>
        );
      }
      case 'snat':
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx="6"
              fill={highlighted ? 'var(--diagram-snat-fill)' : 'var(--diagram-snat)'}
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
              fill={highlighted ? 'rgba(0,102,204,0.15)' : 'var(--diagram-ns)'}
              stroke={sColor || 'var(--diagram-ns-border)'} strokeWidth={highlighted ? 2 : 1.5}/>
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

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      const t = e.touches[0];
      onDrag(id, { clientX: t.clientX, clientY: t.clientY, stopPropagation: () => {} });
    }
  };

  return (
    <g>
      <g onMouseDown={isBox ? (e) => onDrag(id, e) : undefined}
        onTouchStart={isBox ? handleTouchStart : undefined}
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
  const scenes = { nic: nicScene, stack: stackScene, route: routeScene, iptables: iptablesScene, namespace: namespaceScene, bridge: bridgeScene, 'linux-gateway': linuxGatewayScene, 'linux-default-gw': linuxDefaultGwScene, 'network-basics': networkBasicsScene, 'mac-address': macAddressScene, 'ip-address': ipAddressScene, subnetting: subnettingScene, ports: portsScene, 'arp-table': arpTableScene, 'mac-table': macTableScene, 'dhcp-table': dhcpTableScene, 'routing-table': routingTableScene, 'dns-records': dnsRecordsScene, troubleshooting: troubleshootingScene, http: httpScene, 'osi-model': osiModelScene, icmp: icmpScene, udp: udpScene, 'tcp-vs-udp': tcpVsUdpScene, ipv6: ipv6Scene, vpn: vpnScene, wifi: wifiScene, nftables: nftablesScene, 'ethernet-frame': ethernetFrameScene, ttl: ttlScene, mtu: mtuScene, bgp: bgpScene, ospf: ospfScene, mpls: mplsScene, 'load-balancing': loadBalancingScene, cdn: cdnScene, vxlan: vxlanScene, sdn: sdnScene, 'zero-trust': zeroTrustScene, tls13: tls13Scene, wireguard: wireGuardScene, dnssec: dnssecScene, quic: quicScene, qos: qosScene, automation: automationScene, ebpf: ebpfScene };
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

function linuxGatewayScene(s) {
  return {
    elements: {
      ns1:   { x: 40, y: 60, w: 180, h: 140, type: 'container', label: 'Namespace: web' },
      n1:    { x: 60, y: 100, w: 140, h: 60, type: 'namespace', label: 'ns-web', cmds: ['curl 10.0.0.20'], ip: '192.168.1.10', highlighted: s === 2 },
      veth1: { x: 260, y: 100, w: 80, h: 50, type: 'nic', label: 'veth1', highlighted: s === 2 || s === 3 },
      br0:   { x: 380, y: 80, w: 140, h: 60, type: 'bridge', label: 'br0', subnet: '192.168.1.1/24', highlighted: s === 3 || s === 4 },
      fwd:   { x: 480, y: 180, w: 120, h: 50, type: 'box', label: 'ip_forward=1', color: 'var(--green)', highlighted: s === 1 || s === 5 || s === 6 },
      br1:   { x: 580, y: 280, w: 140, h: 60, type: 'bridge', label: 'br1', subnet: '10.0.0.1/24', highlighted: s === 5 || s === 6 || s === 7 },
      veth2: { x: 750, y: 280, w: 80, h: 50, type: 'nic', label: 'veth2', highlighted: s === 7 || s === 8 },
      ns2:   { x: 860, y: 240, w: 180, h: 140, type: 'container', label: 'Namespace: db' },
      n2:    { x: 880, y: 280, w: 140, h: 60, type: 'namespace', label: 'ns-db', cmds: ['10.0.0.20'], ip: '10.0.0.20', highlighted: s === 8 },
      ...(s === 2 ? { d1: { x: 200, y: 120, type: 'dot', color: 'var(--cyan)', label: '192.168.1.10→10.0.0.20' } } : {}),
      ...(s === 3 ? { d1: { x: 330, y: 120, type: 'dot', color: 'var(--cyan)' } } : {}),
      ...(s === 6 ? { d1: { x: 530, y: 200, type: 'dot', color: 'var(--green)', label: 'Forwarded' } } : {}),
      ...(s === 7 ? { d1: { x: 660, y: 300, type: 'dot', color: 'var(--green)' } } : {}),
      ...(s === 9 ? { d1: { x: 400, y: 200, type: 'dot', color: 'var(--amber)', label: 'Reply' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'ns1', to: 'veth1', color: 'var(--cyan)', highlighted: s === 2, fromSide: 'right', toSide: 'left' },
      { id: 'a2', from: 'veth1', to: 'br0', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a3', from: 'br0', to: 'fwd', color: 'var(--cyan)', highlighted: s === 4, fromSide: 'bottom', toSide: 'top' },
      { id: 'a4', from: 'fwd', to: 'br1', color: 'var(--green)', highlighted: s === 5 || s === 6, fromSide: 'bottom', toSide: 'top' },
      { id: 'a5', from: 'br1', to: 'veth2', color: 'var(--green)', highlighted: s === 7 },
      { id: 'a6', from: 'veth2', to: 'ns2', color: 'var(--green)', highlighted: s === 8, fromSide: 'right', toSide: 'left' },
      { id: 'a7', from: 'ns2', to: 'ns1', color: 'var(--amber)', highlighted: s === 9, label: 'Reply' },
    ]
  };
}

function linuxDefaultGwScene(s) {
  return {
    elements: {
      host:  { x: 40, y: 80, w: 180, h: 140, type: 'container', label: 'Linux Host' },
      hcmd:  { x: 60, y: 120, w: 140, h: 60, type: 'namespace', label: 'host', cmds: ['ping 8.8.8.8'], ip: '192.168.1.10', highlighted: s === 0 },
      eth0:  { x: 260, y: 120, w: 80, h: 50, type: 'nic', label: 'eth0', highlighted: s === 4 || s === 5 },
      route: { x: 380, y: 80, w: 160, h: 70, type: 'box', label: 'ip route', sub: 'default via 192.168.1.1', highlighted: s >= 1 && s <= 3 },
      router:{ x: 580, y: 100, w: 100, h: 60, type: 'box', label: 'Router', sub: '192.168.1.1', color: 'var(--amber)', highlighted: s === 5 || s === 6 || s === 9 },
      inet:  { x: 750, y: 100, w: 100, h: 60, type: 'box', label: 'Internet', sub: '8.8.8.8', highlighted: s === 7 },
      ...(s === 1 ? { d1: { x: 460, y: 60, type: 'dot', color: 'var(--cyan)', label: 'ip route' } } : {}),
      ...(s === 4 ? { d1: { x: 200, y: 140, type: 'dot', color: 'var(--cyan)', label: 'ICMP Echo' } } : {}),
      ...(s === 5 ? { d1: { x: 320, y: 140, type: 'dot', color: 'var(--cyan)', label: 'To Gateway' } } : {}),
      ...(s === 7 ? { d1: { x: 660, y: 120, type: 'dot', color: 'var(--green)', label: 'NAT + Forward' } } : {}),
      ...(s === 8 ? { d1: { x: 660, y: 120, type: 'dot', color: 'var(--amber)', label: 'Reply' } } : {}),
      ...(s === 9 ? { d1: { x: 400, y: 140, type: 'dot', color: 'var(--green)', label: 'Reply → Host' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'host', to: 'eth0', color: 'var(--cyan)', highlighted: s === 4, fromSide: 'right', toSide: 'left' },
      { id: 'a2', from: 'eth0', to: 'router', color: 'var(--cyan)', highlighted: s === 5, label: 'To Gateway' },
      { id: 'a3', from: 'router', to: 'inet', color: 'var(--green)', highlighted: s === 6 || s === 7 },
      { id: 'a4', from: 'inet', to: 'router', color: 'var(--amber)', highlighted: s === 8, label: 'Reply' },
      { id: 'a5', from: 'router', to: 'eth0', color: 'var(--green)', highlighted: s === 9, label: 'NAT Reply' },
    ]
  };
}

function networkBasicsScene(s) {
  return {
    elements: {
      user:  { x: 40, y: 100, w: 120, h: 100, type: 'container', label: 'User' },
      ucmd:  { x: 55, y: 130, w: 90, h: 40, type: 'namespace', label: 'user', cmds: ['ping google.com'], highlighted: s === 0 },
      app:   { x: 200, y: 100, w: 120, h: 100, type: 'container', label: 'Application' },
      areq:  { x: 215, y: 130, w: 90, h: 40, type: 'box', label: 'Needs IP?', color: 'var(--amber)', highlighted: s === 1 },
      dns:   { x: 370, y: 40, w: 120, h: 60, type: 'box', label: 'DNS Server', sub: '8.8.8.8', highlighted: s === 2 },
      arp:   { x: 370, y: 200, w: 120, h: 60, type: 'box', label: 'ARP Cache', sub: 'Empty → Query', highlighted: s === 5 },
      route: { x: 370, y: 120, w: 120, h: 50, type: 'box', label: 'Routing Table', sub: 'Same or diff network?', highlighted: s === 4 },
      frame: { x: 530, y: 100, w: 120, h: 80, type: 'box', label: 'Build Frame', sub: 'MAC + IP headers', highlighted: s === 6 },
      nic:   { x: 690, y: 100, w: 100, h: 60, type: 'nic', label: 'eth0', subnet: 'NIC', highlighted: s === 7 },
      sw:    { x: 830, y: 100, w: 90, h: 60, type: 'box', label: 'Switch', highlighted: s === 7 || s === 8 },
      ...(s === 0 ? { d1: { x: 100, y: 80, type: 'dot', color: 'var(--cyan)', label: 'ping google.com' } } : {}),
      ...(s === 2 ? { d1: { x: 310, y: 70, type: 'dot', color: 'var(--purple)', label: 'DNS Query' } } : {}),
      ...(s === 2 ? { d2: { x: 310, y: 90, type: 'dot', color: 'var(--green)', label: '142.250.80.46' } } : {}),
      ...(s === 5 ? { d1: { x: 310, y: 220, type: 'dot', color: 'var(--amber)', label: 'ARP Broadcast' } } : {}),
      ...(s === 5 ? { d2: { x: 310, y: 240, type: 'dot', color: 'var(--green)', label: 'MAC Found' } } : {}),
      ...(s === 7 ? { d1: { x: 780, y: 120, type: 'dot', color: 'var(--green)', label: 'Frame on wire' } } : {}),
    },
    arrows: [
      { id: 'a1', from: 'user', to: 'app', color: 'var(--cyan)', highlighted: s === 0, label: 'Command' },
      { id: 'a2', from: 'app', to: 'dns', color: 'var(--purple)', highlighted: s === 2, label: 'DNS Query' },
      { id: 'a3', from: 'dns', to: 'app', color: 'var(--green)', highlighted: s === 2, label: 'IP Reply' },
      { id: 'a4', from: 'app', to: 'route', color: 'var(--amber)', highlighted: s === 4 },
      { id: 'a5', from: 'app', to: 'arp', color: 'var(--amber)', highlighted: s === 5, label: 'ARP Query' },
      { id: 'a6', from: 'arp', to: 'app', color: 'var(--green)', highlighted: s === 5, label: 'MAC Reply' },
      { id: 'a7', from: 'app', to: 'frame', color: 'var(--cyan)', highlighted: s === 6 },
      { id: 'a8', from: 'frame', to: 'nic', color: 'var(--cyan)', highlighted: s === 7 },
      { id: 'a9', from: 'nic', to: 'sw', color: 'var(--green)', highlighted: s === 7 || s === 8, label: 'On the wire' },
    ]
  };
}

function macAddressScene(s) {
  return {
    elements: {
      nic:   { x: 40, y: 100, w: 120, h: 70, type: 'nic', label: 'NIC', subnet: 'AA:BB:CC:DD:EE:FF', highlighted: s <= 1 },
      oui:   { x: 250, y: 40, w: 180, h: 60, type: 'box', label: 'OUI (Vendor)', sub: 'First 3 bytes: AA:BB:CC', color: 'var(--cyan)', highlighted: s === 2 },
      nicid: { x: 250, y: 140, w: 180, h: 60, type: 'box', label: 'NIC ID (Device)', sub: 'Last 3 bytes: DD:EE:FF', color: 'var(--amber)', highlighted: s === 3 },
      types: { x: 500, y: 80, w: 160, h: 100, type: 'box', label: 'MAC Types', sub: 'Unicast / Multicast / Broadcast', highlighted: s >= 4 && s <= 6 },
      uni:   { x: 500, y: 220, w: 120, h: 40, type: 'box', label: 'Unicast', sub: 'Single device', color: 'var(--green)' },
      multi: { x: 500, y: 280, w: 120, h: 40, type: 'box', label: 'Multicast', sub: 'Group', color: 'var(--amber)' },
      bcast: { x: 500, y: 340, w: 120, h: 40, type: 'box', label: 'Broadcast', sub: 'FF:FF:FF:FF:FF:FF', color: 'var(--red)' },
    },
    arrows: [
      { id: 'a1', from: 'nic', to: 'oui', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a2', from: 'nic', to: 'nicid', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a3', from: 'nic', to: 'types', color: 'var(--text-muted)', highlighted: s >= 4 },
    ]
  };
}

function ipAddressScene(s) {
  return {
    elements: {
      ip:    { x: 40, y: 100, w: 140, h: 70, type: 'box', label: 'IPv4 Address', sub: '32-bit dotted decimal', highlighted: s <= 1 },
      cA:    { x: 280, y: 30, w: 200, h: 50, type: 'box', label: 'Class A', sub: '1.0.0.0 — 126.255.255.255', color: 'var(--green)', highlighted: s === 2 },
      cB:    { x: 280, y: 110, w: 200, h: 50, type: 'box', label: 'Class B', sub: '128.0.0.0 — 191.255.255.255', color: 'var(--cyan)', highlighted: s === 3 },
      cC:    { x: 280, y: 190, w: 200, h: 50, type: 'box', label: 'Class C', sub: '192.0.0.0 — 223.255.255.255', color: 'var(--amber)', highlighted: s === 4 },
      priv:  { x: 550, y: 80, w: 200, h: 100, type: 'box', label: 'Private Ranges', sub: '10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'ip', to: 'cA', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a2', from: 'ip', to: 'cB', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a3', from: 'ip', to: 'cC', color: 'var(--amber)', highlighted: s === 4 },
      { id: 'a4', from: 'cC', to: 'priv', color: 'var(--amber)', highlighted: s === 5 },
    ]
  };
}

function subnettingScene(s) {
  return {
    elements: {
      ip:   { x: 40, y: 60, w: 160, h: 50, type: 'box', label: 'IP: 192.168.1.100', sub: '/24', highlighted: s <= 1 },
      mask: { x: 40, y: 150, w: 160, h: 50, type: 'box', label: 'Subnet Mask', sub: '255.255.255.0', highlighted: s === 1 },
      net:  { x: 300, y: 30, w: 160, h: 50, type: 'box', label: 'Network', sub: '192.168.1.0', color: 'var(--green)', highlighted: s === 3 },
      brd:  { x: 300, y: 110, w: 160, h: 50, type: 'box', label: 'Broadcast', sub: '192.168.1.255', color: 'var(--red)', highlighted: s === 4 },
      use:  { x: 300, y: 190, w: 180, h: 50, type: 'box', label: 'Usable Hosts', sub: '192.168.1.1 — 192.168.1.254', color: 'var(--cyan)', highlighted: s === 5 },
      calc: { x: 550, y: 100, w: 140, h: 60, type: 'box', label: 'Hosts: 254', sub: '2^8 - 2', highlighted: s === 6 },
    },
    arrows: [
      { id: 'a1', from: 'ip', to: 'net', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a2', from: 'ip', to: 'brd', color: 'var(--red)', highlighted: s === 4 },
      { id: 'a3', from: 'ip', to: 'use', color: 'var(--cyan)', highlighted: s === 5 },
      { id: 'a4', from: 'use', to: 'calc', color: 'var(--text-muted)', highlighted: s === 6 },
    ]
  };
}

function portsScene(s) {
  return {
    elements: {
      srv:  { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Server', sub: '192.168.1.20', highlighted: s >= 5 },
      p80:  { x: 250, y: 30, w: 140, h: 40, type: 'box', label: ':80', sub: 'HTTP (Web)', color: 'var(--green)', highlighted: s === 2 },
      p443: { x: 250, y: 90, w: 140, h: 40, type: 'box', label: ':443', sub: 'HTTPS (Secure)', color: 'var(--green)', highlighted: s === 2 },
      p22:  { x: 250, y: 150, w: 140, h: 40, type: 'box', label: ':22', sub: 'SSH (Login)', color: 'var(--cyan)', highlighted: s === 2 },
      p53:  { x: 250, y: 210, w: 140, h: 40, type: 'box', label: ':53', sub: 'DNS (Names)', color: 'var(--purple)', highlighted: s === 2 },
      rng:  { x: 470, y: 80, w: 180, h: 120, type: 'box', label: 'Port Ranges', sub: '0-1023: Well-Known\n1024-49151: Registered\n49152-65535: Dynamic', highlighted: s >= 3 && s <= 4 },
    },
    arrows: [
      { id: 'a1', from: 'srv', to: 'p80', color: 'var(--green)', highlighted: s >= 2 },
      { id: 'a2', from: 'srv', to: 'p443', color: 'var(--green)', highlighted: s >= 2 },
      { id: 'a3', from: 'srv', to: 'p22', color: 'var(--cyan)', highlighted: s >= 2 },
      { id: 'a4', from: 'srv', to: 'p53', color: 'var(--purple)', highlighted: s >= 2 },
      { id: 'a5', from: 'p80', to: 'rng', color: 'var(--text-muted)', highlighted: s >= 3 },
    ]
  };
}

function arpTableScene(s) {
  return {
    elements: {
      pc:    { x: 40, y: 100, w: 100, h: 60, type: 'box', label: 'PC', sub: '192.168.1.10', highlighted: s <= 1 },
      cache: { x: 220, y: 80, w: 160, h: 60, type: 'box', label: 'ARP Cache', sub: 'Dynamic entries', highlighted: s === 1 },
      e1:    { x: 450, y: 40, w: 220, h: 50, type: 'box', label: '192.168.1.20', sub: 'AA:BB:CC:DD:EE:02', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      e2:    { x: 450, y: 120, w: 220, h: 50, type: 'box', label: '192.168.1.1', sub: 'AA:BB:CC:DD:EE:FF', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      timer: { x: 450, y: 210, w: 160, h: 50, type: 'box', label: 'Timeout: 300s', sub: 'Entries expire', color: 'var(--amber)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'pc', to: 'cache', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'cache', to: 'e1', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a3', from: 'cache', to: 'e2', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a4', from: 'cache', to: 'timer', color: 'var(--amber)', highlighted: s === 3 },
    ]
  };
}

function macTableScene(s) {
  return {
    elements: {
      sw:    { x: 40, y: 100, w: 100, h: 60, type: 'box', label: 'Switch', highlighted: s <= 1 },
      tbl:   { x: 220, y: 80, w: 160, h: 60, type: 'box', label: 'MAC Table', sub: 'Forwarding Database', highlighted: s === 1 },
      e1:    { x: 450, y: 40, w: 220, h: 50, type: 'box', label: 'AA:BB:CC:DD:EE:01', sub: 'Port 1 (PC-A)', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      e2:    { x: 450, y: 120, w: 220, h: 50, type: 'box', label: 'AA:BB:CC:DD:EE:02', sub: 'Port 2 (PC-B)', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      aging: { x: 450, y: 210, w: 160, h: 50, type: 'box', label: 'Aging: 300s', sub: 'Entries expire', color: 'var(--amber)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'sw', to: 'tbl', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'tbl', to: 'e1', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a3', from: 'tbl', to: 'e2', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a4', from: 'tbl', to: 'aging', color: 'var(--amber)', highlighted: s === 3 },
    ]
  };
}

function dhcpTableScene(s) {
  return {
    elements: {
      srv:   { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'DHCP Server', sub: '192.168.1.1', highlighted: s <= 1 },
      tbl:   { x: 230, y: 80, w: 160, h: 60, type: 'box', label: 'Lease Table', sub: 'Active Assignments', highlighted: s === 1 },
      l1:    { x: 460, y: 40, w: 250, h: 50, type: 'box', label: '192.168.1.100', sub: 'AA:BB:CC:01:01:01 — PC-A — 8h left', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      l2:    { x: 460, y: 120, w: 250, h: 50, type: 'box', label: '192.168.1.101', sub: 'AA:BB:CC:01:01:02 — PC-B — 6h left', color: 'var(--green)', highlighted: s >= 1 && s <= 2 },
      pool:  { x: 460, y: 210, w: 200, h: 50, type: 'box', label: 'Pool: .100-.200', sub: '101 addresses available', color: 'var(--amber)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'srv', to: 'tbl', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'tbl', to: 'l1', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a3', from: 'tbl', to: 'l2', color: 'var(--green)', highlighted: s >= 1 },
      { id: 'a4', from: 'tbl', to: 'pool', color: 'var(--amber)', highlighted: s === 3 },
    ]
  };
}

function routingTableScene(s) {
  return {
    elements: {
      host: { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Linux Host', highlighted: s <= 1 },
      tbl:  { x: 230, y: 80, w: 160, h: 60, type: 'box', label: 'Routing Table', sub: 'ip route show', highlighted: s === 1 },
      r1:   { x: 460, y: 30, w: 200, h: 50, type: 'box', label: '192.168.1.0/24', sub: 'dev eth0 — Connected', color: 'var(--green)', highlighted: s === 2 },
      r2:   { x: 460, y: 110, w: 200, h: 50, type: 'box', label: '10.0.0.0/8', sub: 'via 192.168.1.1 — Static', color: 'var(--cyan)', highlighted: s === 3 },
      r3:   { x: 460, y: 190, w: 200, h: 50, type: 'box', label: '0.0.0.0/0', sub: 'via 192.168.1.1 — Default', color: 'var(--amber)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'host', to: 'tbl', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'tbl', to: 'r1', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'tbl', to: 'r2', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a4', from: 'tbl', to: 'r3', color: 'var(--amber)', highlighted: s === 4 },
    ]
  };
}

function dnsRecordsScene(s) {
  return {
    elements: {
      zone:   { x: 40, y: 80, w: 200, h: 60, type: 'box', label: 'example.com Zone', sub: 'DNS Zone File', highlighted: s === 5 },
      a:      { x: 350, y: 30, w: 280, h: 50, type: 'box', label: 'A Record', sub: 'example.com → 93.184.216.34', color: 'var(--green)', highlighted: s === 0 || s === 5 },
      aaaa:   { x: 350, y: 100, w: 280, h: 50, type: 'box', label: 'AAAA Record', sub: 'example.com → 2606:2800:220:1::248', color: 'var(--cyan)', highlighted: s === 1 || s === 5 },
      cname:  { x: 350, y: 170, w: 280, h: 50, type: 'box', label: 'CNAME Record', sub: 'www → example.com', color: 'var(--amber)', highlighted: s === 2 || s === 5 },
      mx:     { x: 350, y: 240, w: 280, h: 50, type: 'box', label: 'MX Record', sub: 'mail.example.com (priority 10)', color: 'var(--purple)', highlighted: s === 3 || s === 5 },
      txt:    { x: 350, y: 310, w: 280, h: 50, type: 'box', label: 'TXT Record', sub: 'SPF, DKIM, verification', color: 'var(--red)', highlighted: s === 4 || s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'zone', to: 'a', color: 'var(--green)', highlighted: s === 0 },
      { id: 'a2', from: 'zone', to: 'aaaa', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a3', from: 'zone', to: 'cname', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a4', from: 'zone', to: 'mx', color: 'var(--purple)', highlighted: s === 3 },
      { id: 'a5', from: 'zone', to: 'txt', color: 'var(--red)', highlighted: s === 4 },
    ]
  };
}

function troubleshootingScene(s) {
  return {
    elements: {
      problem:    { x: 40, y: 80, w: 180, h: 60, type: 'box', label: 'Problem', sub: 'No connectivity?', highlighted: s === 5 },
      ping:       { x: 320, y: 30, w: 160, h: 50, type: 'box', label: 'ping', sub: 'Reachable?', color: 'var(--green)', highlighted: s === 0 || s === 5 },
      traceroute: { x: 320, y: 100, w: 160, h: 50, type: 'box', label: 'traceroute', sub: 'Path?', color: 'var(--cyan)', highlighted: s === 1 || s === 5 },
      ss:         { x: 320, y: 170, w: 160, h: 50, type: 'box', label: 'ss / netstat', sub: 'Ports open?', color: 'var(--amber)', highlighted: s === 2 || s === 5 },
      dig:        { x: 320, y: 240, w: 160, h: 50, type: 'box', label: 'dig', sub: 'DNS resolving?', color: 'var(--purple)', highlighted: s === 3 || s === 5 },
      tcpdump:    { x: 320, y: 310, w: 160, h: 50, type: 'box', label: 'tcpdump', sub: 'Traffic flowing?', color: 'var(--red)', highlighted: s === 4 || s === 5 },
      fix:        { x: 600, y: 150, w: 140, h: 60, type: 'box', label: 'Fix!', sub: 'Found the issue', color: 'var(--green)', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'problem', to: 'ping', color: 'var(--green)', highlighted: s === 0 },
      { id: 'a2', from: 'problem', to: 'traceroute', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a3', from: 'problem', to: 'ss', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a4', from: 'problem', to: 'dig', color: 'var(--purple)', highlighted: s === 3 },
      { id: 'a5', from: 'problem', to: 'tcpdump', color: 'var(--red)', highlighted: s === 4 },
      { id: 'a6', from: 'tcpdump', to: 'fix', color: 'var(--green)', highlighted: s === 5 },
    ]
  };
}

function httpScene(s) {
  return {
    elements: {
      client: { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Browser', sub: 'Client', highlighted: s <= 1 || s === 3 },
      server: { x: 640, y: 100, w: 140, h: 60, type: 'box', label: 'Web Server', sub: 'nginx/Apache', highlighted: s === 2 || s === 3 },
      req:    { x: 280, y: 40, w: 220, h: 50, type: 'box', label: 'HTTP Request', sub: 'GET /index.html HTTP/1.1', color: 'var(--cyan)', highlighted: s <= 1 },
      resp:   { x: 280, y: 120, w: 220, h: 50, type: 'box', label: 'HTTP Response', sub: '200 OK + HTML', color: 'var(--green)', highlighted: s === 2 },
      tls:    { x: 280, y: 210, w: 220, h: 50, type: 'box', label: 'TLS Handshake', sub: 'Certificate exchange', color: 'var(--amber)', highlighted: s === 3 },
      codes:  { x: 280, y: 300, w: 220, h: 50, type: 'box', label: 'Status Codes', sub: '200=OK, 404=Not Found, 500=Error', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'client', to: 'server', color: 'var(--cyan)', highlighted: s <= 1, label: 'Request' },
      { id: 'a2', from: 'server', to: 'client', color: 'var(--green)', highlighted: s === 2, label: 'Response' },
      { id: 'a3', from: 'client', to: 'server', color: 'var(--amber)', highlighted: s === 3, label: 'TLS', dashed: true },
    ]
  };
}

function osiModelScene(s) {
  return {
    elements: {
      o7: { x: 40, y: 30, w: 130, h: 35, type: 'box', label: '7. Application', sub: 'HTTP, DNS', color: 'var(--purple)', highlighted: s === 6 },
      o6: { x: 40, y: 75, w: 130, h: 35, type: 'box', label: '6. Presentation', sub: 'Encryption' },
      o5: { x: 40, y: 120, w: 130, h: 35, type: 'box', label: '5. Session', sub: 'Sessions' },
      o4: { x: 40, y: 165, w: 130, h: 35, type: 'box', label: '4. Transport', sub: 'TCP, UDP', color: 'var(--cyan)', highlighted: s === 4 },
      o3: { x: 40, y: 210, w: 130, h: 35, type: 'box', label: '3. Network', sub: 'IP, Routing', color: 'var(--green)', highlighted: s === 3 },
      o2: { x: 40, y: 255, w: 130, h: 35, type: 'box', label: '2. Data Link', sub: 'Ethernet, MAC', color: 'var(--amber)', highlighted: s === 2 },
      o1: { x: 40, y: 300, w: 130, h: 35, type: 'box', label: '1. Physical', sub: 'Cables, Signals', color: 'var(--red)', highlighted: s === 1 },
      tcpip: { x: 260, y: 120, w: 160, h: 160, type: 'box', label: 'TCP/IP Model', sub: '4 Layers', color: 'var(--cyan)', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'o1', to: 'o2', color: 'var(--text-muted)' },
      { id: 'a2', from: 'o2', to: 'o3', color: 'var(--text-muted)' },
      { id: 'a3', from: 'o3', to: 'o4', color: 'var(--text-muted)' },
      { id: 'a4', from: 'o4', to: 'o5', color: 'var(--text-muted)' },
    ]
  };
}

function icmpScene(s) {
  return {
    elements: {
      src:  { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Source', sub: '192.168.1.10', highlighted: s <= 2 },
      echo: { x: 280, y: 50, w: 160, h: 50, type: 'box', label: 'Echo Request', sub: 'Type 8, Code 0', color: 'var(--cyan)', highlighted: s >= 2 && s <= 3 },
      reply: { x: 280, y: 150, w: 160, h: 50, type: 'box', label: 'Echo Reply', sub: 'Type 0, Code 0', color: 'var(--green)', highlighted: s === 4 },
      dst:  { x: 540, y: 100, w: 120, h: 60, type: 'box', label: 'Destination', sub: '8.8.8.8', highlighted: s <= 4 },
      err: { x: 280, y: 250, w: 160, h: 50, type: 'box', label: 'Unreachable', sub: 'Type 3', color: 'var(--red)', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'src', to: 'echo', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a2', from: 'echo', to: 'dst', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a3', from: 'dst', to: 'reply', color: 'var(--green)', highlighted: s === 4 },
      { id: 'a4', from: 'reply', to: 'src', color: 'var(--green)', highlighted: s === 4 },
      { id: 'a5', from: 'dst', to: 'err', color: 'var(--red)', highlighted: s === 5 },
    ]
  };
}

function udpScene(s) {
  return {
    elements: {
      src:  { x: 40, y: 100, w: 100, h: 60, type: 'box', label: 'Client' },
      seg:  { x: 250, y: 50, w: 160, h: 50, type: 'box', label: 'UDP Segment', sub: '8-byte header', color: 'var(--amber)', highlighted: s <= 2 },
      app:  { x: 250, y: 150, w: 140, h: 40, type: 'box', label: 'DNS Query', sub: 'Port 53', color: 'var(--purple)', highlighted: s === 3 },
      game: { x: 250, y: 220, w: 140, h: 40, type: 'box', label: 'Game Packet', sub: 'Port 7777', color: 'var(--cyan)', highlighted: s === 4 },
      dst:  { x: 500, y: 100, w: 100, h: 60, type: 'box', label: 'Server' },
    },
    arrows: [
      { id: 'a1', from: 'src', to: 'seg', color: 'var(--amber)', highlighted: s === 1 },
      { id: 'a2', from: 'seg', to: 'dst', color: 'var(--amber)', highlighted: s === 2 },
    ]
  };
}

function tcpVsUdpScene(s) {
  return {
    elements: {
      tcp:  { x: 40, y: 60, w: 120, h: 50, type: 'box', label: 'TCP', sub: 'Reliable', color: 'var(--cyan)', highlighted: s <= 2 },
      udp:  { x: 40, y: 180, w: 120, h: 50, type: 'box', label: 'UDP', sub: 'Fast', color: 'var(--amber)', highlighted: s === 3 },
      tH:   { x: 260, y: 30, w: 160, h: 40, type: 'box', label: '20-byte Header', sub: 'Seq, Ack, Window', color: 'var(--cyan)' },
      tF:   { x: 260, y: 90, w: 160, h: 40, type: 'box', label: 'Features', sub: 'Ordered, Retransmit', color: 'var(--cyan)' },
      uH:   { x: 260, y: 160, w: 160, h: 40, type: 'box', label: '8-byte Header', sub: 'Port, Length, Checksum', color: 'var(--amber)' },
      uU:   { x: 260, y: 220, w: 160, h: 40, type: 'box', label: 'Use Cases', sub: 'DNS, Gaming, Video', color: 'var(--amber)' },
    },
    arrows: [
      { id: 'a1', from: 'tcp', to: 'tH', color: 'var(--cyan)', highlighted: s <= 2 },
      { id: 'a2', from: 'tcp', to: 'tF', color: 'var(--cyan)', highlighted: s <= 2 },
      { id: 'a3', from: 'udp', to: 'uH', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a4', from: 'udp', to: 'uU', color: 'var(--amber)', highlighted: s === 3 },
    ]
  };
}

function ipv6Scene(s) {
  return {
    elements: {
      v4:   { x: 40, y: 60, w: 160, h: 50, type: 'box', label: 'IPv4', sub: '32-bit (4.3B)', color: 'var(--amber)', highlighted: s <= 1 },
      v6:   { x: 40, y: 170, w: 160, h: 50, type: 'box', label: 'IPv6', sub: '128-bit (3.4×10³⁸)', color: 'var(--green)', highlighted: s === 2 },
      fmt:  { x: 300, y: 30, w: 200, h: 50, type: 'box', label: 'Format', sub: '2001:0db8::8a2e:0370:7334', highlighted: s === 3 },
      feat: { x: 300, y: 110, w: 200, h: 50, type: 'box', label: 'Features', sub: 'No NAT, Auto-config, IPSec', highlighted: s === 4 },
      dual: { x: 300, y: 200, w: 200, h: 50, type: 'box', label: 'Dual Stack', sub: 'IPv4 + IPv6 together', color: 'var(--cyan)', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'v4', to: 'fmt', color: 'var(--text-muted)', highlighted: s >= 2 },
      { id: 'a2', from: 'v6', to: 'feat', color: 'var(--green)', highlighted: s === 4 },
      { id: 'a3', from: 'feat', to: 'dual', color: 'var(--cyan)', highlighted: s === 5 },
    ]
  };
}

function vpnScene(s) {
  return {
    elements: {
      client: { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Client', sub: 'Remote Worker' },
      tunnel: { x: 260, y: 80, w: 180, h: 60, type: 'box', label: 'Encrypted Tunnel', sub: 'IPSec/WireGuard', color: 'var(--cyan)', highlighted: s === 2 },
      inet:   { x: 260, y: 180, w: 160, h: 50, type: 'box', label: 'Public Internet', sub: 'Untrusted' },
      corp:   { x: 530, y: 100, w: 160, h: 60, type: 'box', label: 'Corporate Network', sub: '10.0.0.0/8' },
      vpnSrv: { x: 530, y: 200, w: 140, h: 50, type: 'box', label: 'VPN Server', sub: '10.0.0.1', color: 'var(--green)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'client', to: 'tunnel', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a2', from: 'tunnel', to: 'corp', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a3', from: 'corp', to: 'vpnSrv', color: 'var(--green)', highlighted: s === 3 },
    ]
  };
}

function wifiScene(s) {
  return {
    elements: {
      ap:     { x: 40, y: 100, w: 130, h: 60, type: 'box', label: 'Access Point', sub: 'SSID: MyNetwork' },
      client: { x: 40, y: 210, w: 130, h: 60, type: 'box', label: 'WiFi Client', sub: 'Phone/Laptop' },
      ch:     { x: 280, y: 40, w: 200, h: 50, type: 'box', label: 'Channels', sub: '2.4GHz: 1-11 | 5GHz: 36-165', color: 'var(--cyan)', highlighted: s === 1 },
      band:   { x: 280, y: 120, w: 200, h: 50, type: 'box', label: 'Bands', sub: '2.4GHz (range) vs 5GHz (speed)', color: 'var(--green)', highlighted: s === 2 },
      sec:    { x: 280, y: 210, w: 200, h: 50, type: 'box', label: 'Security', sub: 'WPA2/WPA3 — AES', color: 'var(--amber)', highlighted: s === 3 },
      std:    { x: 550, y: 120, w: 180, h: 50, type: 'box', label: '802.11', sub: 'ac (WiFi 5) / ax (WiFi 6)', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'ap', to: 'ch', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'ap', to: 'band', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'ap', to: 'sec', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a4', from: 'sec', to: 'std', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

function nftablesScene(s) {
  return {
    elements: {
      pkt:  { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Incoming Packet' },
      tbl:  { x: 260, y: 40, w: 160, h: 50, type: 'box', label: 'Tables', sub: 'ip, ip6, inet, arp', highlighted: s === 1 },
      chn:  { x: 260, y: 130, w: 160, h: 50, type: 'box', label: 'Chains', sub: 'input, forward, output', color: 'var(--cyan)', highlighted: s === 2 },
      rls:  { x: 260, y: 220, w: 160, h: 50, type: 'box', label: 'Rules', sub: 'accept, drop, reject', color: 'var(--green)', highlighted: s === 3 },
      vrd:  { x: 500, y: 100, w: 160, h: 50, type: 'box', label: 'Verdicts', sub: 'accept / drop / jump', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'pkt', to: 'tbl', color: 'var(--text-muted)', highlighted: s >= 1 },
      { id: 'a2', from: 'tbl', to: 'chn', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a3', from: 'chn', to: 'rls', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a4', from: 'rls', to: 'vrd', color: 'var(--text-muted)', highlighted: s === 4 },
    ]
  };
}

function ethernetFrameScene(s) {
  return {
    elements: {
      pre: { x: 30, y: 100, w: 80, h: 50, type: 'box', label: 'Preamble', sub: '7 bytes', color: 'var(--red)', highlighted: s === 1 },
      dst: { x: 120, y: 100, w: 100, h: 50, type: 'box', label: 'Dst MAC', sub: '6 bytes', color: 'var(--amber)', highlighted: s === 2 },
      src: { x: 230, y: 100, w: 100, h: 50, type: 'box', label: 'Src MAC', sub: '6 bytes', color: 'var(--amber)', highlighted: s === 3 },
      typ: { x: 340, y: 100, w: 80, h: 50, type: 'box', label: 'Type', sub: '2 bytes', color: 'var(--cyan)', highlighted: s === 4 },
      pay: { x: 430, y: 100, w: 120, h: 50, type: 'box', label: 'Payload', sub: '46-1500 B', color: 'var(--green)', highlighted: s === 5 },
      fcs: { x: 560, y: 100, w: 80, h: 50, type: 'box', label: 'FCS', sub: '4 bytes', color: 'var(--purple)', highlighted: s === 6 },
    },
    arrows: [
      { id: 'a1', from: 'pre', to: 'dst', color: 'var(--text-muted)' },
      { id: 'a2', from: 'dst', to: 'src', color: 'var(--text-muted)' },
      { id: 'a3', from: 'src', to: 'typ', color: 'var(--text-muted)' },
      { id: 'a4', from: 'typ', to: 'pay', color: 'var(--text-muted)' },
      { id: 'a5', from: 'pay', to: 'fcs', color: 'var(--text-muted)' },
    ]
  };
}

function ttlScene(s) {
  return {
    elements: {
      src: { x: 40, y: 100, w: 110, h: 50, type: 'box', label: 'Sender', sub: 'TTL=64', highlighted: s <= 1 },
      r1:  { x: 220, y: 100, w: 110, h: 50, type: 'box', label: 'Router 1', sub: 'TTL=63', color: 'var(--green)', highlighted: s === 2 },
      r2:  { x: 390, y: 100, w: 110, h: 50, type: 'box', label: 'Router 2', sub: 'TTL=62', color: 'var(--green)', highlighted: s === 2 },
      r3:  { x: 560, y: 100, w: 110, h: 50, type: 'box', label: 'Router 3', sub: 'TTL=61', color: 'var(--amber)', highlighted: s === 2 },
      dead: { x: 620, y: 200, w: 110, h: 50, type: 'box', label: 'TTL=0', sub: 'DROPPED', color: 'var(--red)', highlighted: s === 5 },
      icmp: { x: 420, y: 200, w: 160, h: 50, type: 'box', label: 'ICMP Time Exceeded', sub: 'Type 11', color: 'var(--red)', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'src', to: 'r1', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a2', from: 'r1', to: 'r2', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'r2', to: 'r3', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a4', from: 'r3', to: 'dead', color: 'var(--red)', highlighted: s === 5 },
      { id: 'a5', from: 'dead', to: 'icmp', color: 'var(--red)', highlighted: s === 5 },
    ]
  };
}

function mtuScene(s) {
  return {
    elements: {
      pkt:  { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Packet', sub: '4000 bytes' },
      mtu:  { x: 250, y: 100, w: 140, h: 60, type: 'box', label: 'MTU: 1500', sub: 'Ethernet limit', color: 'var(--amber)', highlighted: s <= 2 },
      f1:   { x: 480, y: 40, w: 120, h: 40, type: 'box', label: 'Fragment 1', sub: '1500 bytes', color: 'var(--cyan)', highlighted: s === 3 },
      f2:   { x: 480, y: 110, w: 120, h: 40, type: 'box', label: 'Fragment 2', sub: '1500 bytes', color: 'var(--cyan)', highlighted: s === 3 },
      f3:   { x: 480, y: 180, w: 120, h: 40, type: 'box', label: 'Fragment 3', sub: '1000 bytes', color: 'var(--cyan)', highlighted: s === 3 },
      pmtud: { x: 250, y: 220, w: 180, h: 50, type: 'box', label: 'Path MTU Discovery', sub: 'DF bit set', color: 'var(--green)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'pkt', to: 'mtu', color: 'var(--amber)', highlighted: s >= 2 },
      { id: 'a2', from: 'mtu', to: 'f1', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a3', from: 'mtu', to: 'f2', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a4', from: 'mtu', to: 'f3', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a5', from: 'mtu', to: 'pmtud', color: 'var(--green)', highlighted: s === 4 },
    ]
  };
}

function bgpScene(s) {
  return {
    elements: {
      as100: { x: 40, y: 60, w: 130, h: 50, type: 'box', label: 'AS 100', sub: 'ISP A', color: 'var(--cyan)' },
      as200: { x: 40, y: 180, w: 130, h: 50, type: 'box', label: 'AS 200', sub: 'Enterprise', color: 'var(--green)' },
      as300: { x: 550, y: 60, w: 130, h: 50, type: 'box', label: 'AS 300', sub: 'ISP B', color: 'var(--amber)' },
      as400: { x: 550, y: 180, w: 130, h: 50, type: 'box', label: 'AS 400', sub: 'Cloud', color: 'var(--purple)' },
      ebgp: { x: 280, y: 40, w: 150, h: 45, type: 'box', label: 'eBGP Peering', sub: 'External', highlighted: s === 1 },
      ibgp: { x: 280, y: 120, w: 150, h: 45, type: 'box', label: 'iBGP', sub: 'Internal', color: 'var(--cyan)', highlighted: s === 2 },
      path: { x: 280, y: 210, w: 160, h: 45, type: 'box', label: 'AS_PATH', sub: 'Loop prevention', color: 'var(--green)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'as100', to: 'ebgp', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'ebgp', to: 'as300', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a3', from: 'as100', to: 'ibgp', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a4', from: 'ibgp', to: 'as200', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a5', from: 'as300', to: 'path', color: 'var(--green)', highlighted: s === 3 },
    ]
  };
}

function ospfScene(s) {
  return {
    elements: {
      a0:  { x: 40, y: 60, w: 160, h: 50, type: 'box', label: 'Area 0 (Backbone)', sub: 'Core', color: 'var(--cyan)', highlighted: s === 0 },
      a1:  { x: 40, y: 180, w: 140, h: 50, type: 'box', label: 'Area 1', sub: 'Branch', color: 'var(--green)', highlighted: s === 1 },
      a2:  { x: 500, y: 60, w: 140, h: 50, type: 'box', label: 'Area 2', sub: 'Data Center', color: 'var(--amber)', highlighted: s === 1 },
      abr: { x: 280, y: 80, w: 150, h: 45, type: 'box', label: 'ABR', sub: 'Area Border Router', highlighted: s === 2 },
      lsa: { x: 280, y: 180, w: 170, h: 45, type: 'box', label: 'LSA Flooding', sub: 'Link-State Ads', color: 'var(--green)', highlighted: s === 3 },
      spf: { x: 520, y: 180, w: 150, h: 45, type: 'box', label: 'SPF Algorithm', sub: 'Dijkstra', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'a0', to: 'abr', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a2', from: 'a1', to: 'abr', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'a2', to: 'abr', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a4', from: 'a0', to: 'lsa', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a5', from: 'lsa', to: 'spf', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

function mplsScene(s) {
  return {
    elements: {
      inL:  { x: 40, y: 100, w: 140, h: 50, type: 'box', label: 'Ingress LSR', sub: 'Push label', color: 'var(--cyan)', highlighted: s === 1 },
      lbl:  { x: 240, y: 40, w: 150, h: 45, type: 'box', label: 'MPLS Label', sub: '20-bit + TC + TTL', color: 'var(--amber)', highlighted: s === 2 },
      mid:  { x: 350, y: 100, w: 130, h: 50, type: 'box', label: 'Mid LSR', sub: 'Swap label', color: 'var(--green)', highlighted: s === 3 },
      outL: { x: 540, y: 100, w: 140, h: 50, type: 'box', label: 'Egress LSR', sub: 'Pop label', color: 'var(--purple)', highlighted: s === 4 },
      fec:  { x: 240, y: 200, w: 170, h: 45, type: 'box', label: 'FEC', sub: 'Forwarding Equivalence Class', highlighted: s === 1 },
    },
    arrows: [
      { id: 'a1', from: 'inL', to: 'lbl', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a2', from: 'lbl', to: 'mid', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a3', from: 'mid', to: 'outL', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a4', from: 'fec', to: 'inL', color: 'var(--text-muted)', highlighted: s === 1 },
    ]
  };
}

function loadBalancingScene(s) {
  return {
    elements: {
      client: { x: 40, y: 100, w: 120, h: 60, type: 'box', label: 'Clients' },
      lb:     { x: 280, y: 100, w: 150, h: 60, type: 'box', label: 'Load Balancer', sub: 'L4/L7', color: 'var(--cyan)', highlighted: s <= 2 },
      b1:     { x: 540, y: 30, w: 130, h: 45, type: 'box', label: 'Backend 1', sub: '.10', color: 'var(--green)', highlighted: s === 3 },
      b2:     { x: 540, y: 100, w: 130, h: 45, type: 'box', label: 'Backend 2', sub: '.11', color: 'var(--green)', highlighted: s === 3 },
      b3:     { x: 540, y: 170, w: 130, h: 45, type: 'box', label: 'Backend 3', sub: '.12', color: 'var(--green)', highlighted: s === 3 },
      health: { x: 280, y: 220, w: 160, h: 45, type: 'box', label: 'Health Checks', sub: 'TCP/HTTP probes', color: 'var(--amber)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'client', to: 'lb', color: 'var(--cyan)', highlighted: s >= 1 },
      { id: 'a2', from: 'lb', to: 'b1', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a3', from: 'lb', to: 'b2', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a4', from: 'lb', to: 'b3', color: 'var(--green)', highlighted: s === 3 },
      { id: 'a5', from: 'lb', to: 'health', color: 'var(--amber)', highlighted: s === 4 },
    ]
  };
}

function cdnScene(s) {
  return {
    elements: {
      origin: { x: 40, y: 100, w: 130, h: 60, type: 'box', label: 'Origin Server', sub: 'US-East', color: 'var(--amber)' },
      e1:     { x: 280, y: 20, w: 150, h: 45, type: 'box', label: 'Edge: Europe', sub: 'London', color: 'var(--green)', highlighted: s === 1 },
      e2:     { x: 280, y: 100, w: 150, h: 45, type: 'box', label: 'Edge: Asia', sub: 'Tokyo', color: 'var(--green)', highlighted: s === 1 },
      e3:     { x: 280, y: 180, w: 150, h: 45, type: 'box', label: 'Edge: Americas', sub: 'São Paulo', color: 'var(--green)', highlighted: s === 1 },
      dns:    { x: 520, y: 80, w: 160, h: 45, type: 'box', label: 'DNS Routing', sub: 'GeoDNS / Anycast', color: 'var(--cyan)', highlighted: s === 2 },
      cache:  { x: 520, y: 170, w: 150, h: 45, type: 'box', label: 'Cache Hit', sub: 'TTL freshness', color: 'var(--purple)', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'origin', to: 'e1', color: 'var(--green)', highlighted: s === 1 },
      { id: 'a2', from: 'origin', to: 'e2', color: 'var(--green)', highlighted: s === 1 },
      { id: 'a3', from: 'origin', to: 'e3', color: 'var(--green)', highlighted: s === 1 },
      { id: 'a4', from: 'e1', to: 'dns', color: 'var(--cyan)', highlighted: s === 2 },
      { id: 'a5', from: 'e2', to: 'cache', color: 'var(--purple)', highlighted: s === 3 },
    ]
  };
}

function vxlanScene(s) {
  return {
    elements: {
      v1:    { x: 40, y: 100, w: 130, h: 50, type: 'box', label: 'VTEP 1', sub: '192.168.1.10', color: 'var(--cyan)', highlighted: s === 1 },
      v2:    { x: 550, y: 100, w: 130, h: 50, type: 'box', label: 'VTEP 2', sub: '192.168.1.20', color: 'var(--amber)', highlighted: s === 1 },
      under: { x: 250, y: 200, w: 180, h: 50, type: 'box', label: 'Underlay', sub: 'Physical IP fabric', color: 'var(--green)', highlighted: s === 2 },
      vni:   { x: 280, y: 40, w: 140, h: 45, type: 'box', label: 'VNI 10000', sub: '24-bit (16M VLANs)', color: 'var(--purple)', highlighted: s === 3 },
      encap: { x: 280, y: 130, w: 170, h: 45, type: 'box', label: 'Encapsulation', sub: 'UDP:4789 + VXLAN', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'v1', to: 'encap', color: 'var(--cyan)', highlighted: s === 4 },
      { id: 'a2', from: 'encap', to: 'v2', color: 'var(--amber)', highlighted: s === 4 },
      { id: 'a3', from: 'v1', to: 'under', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a4', from: 'under', to: 'v2', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a5', from: 'vni', to: 'encap', color: 'var(--purple)', highlighted: s === 3 },
    ]
  };
}

function sdnScene(s) {
  return {
    elements: {
      app:  { x: 40, y: 30, w: 150, h: 50, type: 'box', label: 'Application Layer', sub: 'Network apps', color: 'var(--purple)', highlighted: s === 0 },
      ctrl: { x: 40, y: 120, w: 160, h: 50, type: 'box', label: 'Control Plane', sub: 'SDN Controller', color: 'var(--cyan)', highlighted: s === 1 },
      data: { x: 40, y: 220, w: 160, h: 50, type: 'box', label: 'Data Plane', sub: 'OpenFlow Switches', color: 'var(--green)', highlighted: s === 2 },
      north: { x: 300, y: 60, w: 150, h: 45, type: 'box', label: 'Northbound API', sub: 'REST', highlighted: s === 3 },
      south: { x: 300, y: 170, w: 160, h: 45, type: 'box', label: 'Southbound API', sub: 'OpenFlow', color: 'var(--amber)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'app', to: 'north', color: 'var(--purple)', highlighted: s === 3 },
      { id: 'a2', from: 'north', to: 'ctrl', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a3', from: 'ctrl', to: 'south', color: 'var(--amber)', highlighted: s === 4 },
      { id: 'a4', from: 'south', to: 'data', color: 'var(--green)', highlighted: s === 4 },
    ]
  };
}

function zeroTrustScene(s) {
  return {
    elements: {
      ident:  { x: 40, y: 20, w: 140, h: 45, type: 'box', label: 'Identity', sub: 'Who are you?', color: 'var(--cyan)', highlighted: s === 1 },
      device: { x: 40, y: 90, w: 150, h: 45, type: 'box', label: 'Device Posture', sub: 'Is it healthy?', color: 'var(--green)', highlighted: s === 2 },
      net:    { x: 40, y: 160, w: 160, h: 45, type: 'box', label: 'Network Access', sub: 'Micro-segmentation', color: 'var(--amber)', highlighted: s === 3 },
      app:    { x: 40, y: 230, w: 150, h: 45, type: 'box', label: 'Application', sub: 'Per-app access', color: 'var(--purple)', highlighted: s === 4 },
      policy: { x: 350, y: 120, w: 160, h: 50, type: 'box', label: 'Policy Engine', sub: 'Context-aware', highlighted: s === 5 },
    },
    arrows: [
      { id: 'a1', from: 'ident', to: 'policy', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'device', to: 'policy', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'net', to: 'policy', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a4', from: 'app', to: 'policy', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

function tls13Scene(s) {
  return {
    elements: {
      client: { x: 40, y: 100, w: 100, h: 60, type: 'box', label: 'Client' },
      server: { x: 550, y: 100, w: 100, h: 60, type: 'box', label: 'Server' },
      ch:     { x: 250, y: 30, w: 170, h: 45, type: 'box', label: 'ClientHello', sub: 'Key share + ciphers', color: 'var(--cyan)', highlighted: s === 1 },
      sh:     { x: 250, y: 110, w: 170, h: 45, type: 'box', label: 'ServerHello', sub: 'Selected cipher', color: 'var(--green)', highlighted: s === 2 },
      fin:    { x: 250, y: 190, w: 150, h: 45, type: 'box', label: 'Finished', sub: '1-RTT', color: 'var(--amber)', highlighted: s === 3 },
      zrtt:   { x: 250, y: 270, w: 140, h: 45, type: 'box', label: '0-RTT', sub: 'Resumed session', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'client', to: 'ch', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'ch', to: 'server', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a3', from: 'server', to: 'sh', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a4', from: 'sh', to: 'client', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a5', from: 'client', to: 'fin', color: 'var(--amber)', highlighted: s === 3 },
    ]
  };
}

function wireGuardScene(s) {
  return {
    elements: {
      p1:    { x: 40, y: 100, w: 130, h: 50, type: 'box', label: 'Peer A', sub: 'PublicKey: abc...', color: 'var(--cyan)', highlighted: s === 1 },
      p2:    { x: 550, y: 100, w: 130, h: 50, type: 'box', label: 'Peer B', sub: 'PublicKey: xyz...', color: 'var(--green)', highlighted: s === 1 },
      tun:   { x: 260, y: 50, w: 180, h: 50, type: 'box', label: 'Encrypted Tunnel', sub: 'ChaCha20 + Poly1305', color: 'var(--amber)', highlighted: s === 2 },
      keys:  { x: 260, y: 150, w: 160, h: 45, type: 'box', label: 'Key Exchange', sub: 'Static + ephemeral', highlighted: s === 3 },
      roam:  { x: 260, y: 240, w: 140, h: 45, type: 'box', label: 'Roaming', sub: 'Auto discovery', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'p1', to: 'tun', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a2', from: 'tun', to: 'p2', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a3', from: 'tun', to: 'keys', color: 'var(--text-muted)', highlighted: s === 3 },
      { id: 'a4', from: 'keys', to: 'roam', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

function dnssecScene(s) {
  return {
    elements: {
      root:   { x: 280, y: 20, w: 140, h: 45, type: 'box', label: 'Root Zone', sub: '.', color: 'var(--purple)', highlighted: s === 1 },
      tld:    { x: 280, y: 100, w: 140, h: 45, type: 'box', label: '.com Zone', sub: 'DS from root', color: 'var(--cyan)', highlighted: s === 2 },
      domain: { x: 280, y: 180, w: 170, h: 45, type: 'box', label: 'example.com', sub: 'RRSIG + DNSKEY', color: 'var(--green)', highlighted: s === 3 },
      valid:  { x: 520, y: 120, w: 160, h: 45, type: 'box', label: 'Resolver Validates', sub: 'Chain of trust', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'root', to: 'tld', color: 'var(--purple)', highlighted: s === 2 },
      { id: 'a2', from: 'tld', to: 'domain', color: 'var(--cyan)', highlighted: s === 3 },
      { id: 'a3', from: 'domain', to: 'valid', color: 'var(--green)', highlighted: s === 4 },
      { id: 'a4', from: 'tld', to: 'valid', color: 'var(--cyan)', highlighted: s === 4 },
    ]
  };
}

function quicScene(s) {
  return {
    elements: {
      tcp:  { x: 40, y: 40, w: 150, h: 50, type: 'box', label: 'TCP + TLS 1.3', sub: '2-3 RTTs', color: 'var(--amber)', highlighted: s <= 1 },
      quic: { x: 40, y: 160, w: 140, h: 50, type: 'box', label: 'QUIC', sub: '0-1 RTT', color: 'var(--green)', highlighted: s === 2 },
      mux:  { x: 300, y: 80, w: 180, h: 50, type: 'box', label: 'Multiplexed Streams', sub: 'No head-of-line blocking', color: 'var(--cyan)', highlighted: s === 3 },
      loss: { x: 300, y: 200, w: 170, h: 50, type: 'box', label: 'Per-Stream Recovery', sub: 'Independent loss', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'tcp', to: 'mux', color: 'var(--amber)', highlighted: s <= 1 },
      { id: 'a2', from: 'quic', to: 'mux', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'mux', to: 'loss', color: 'var(--cyan)', highlighted: s === 3 },
    ]
  };
}

function qosScene(s) {
  return {
    elements: {
      in:      { x: 30, y: 100, w: 120, h: 50, type: 'box', label: 'Mixed Traffic' },
      classify: { x: 220, y: 100, w: 140, h: 50, type: 'box', label: 'Classifier', sub: 'DSCP / 802.1p', color: 'var(--cyan)', highlighted: s === 1 },
      voice:   { x: 460, y: 20, w: 130, h: 40, type: 'box', label: 'Voice Queue', sub: 'EF (DSCP 46)', color: 'var(--green)', highlighted: s === 2 },
      video:   { x: 460, y: 90, w: 140, h: 40, type: 'box', label: 'Video Queue', sub: 'AF41 (DSCP 34)', color: 'var(--amber)', highlighted: s === 2 },
      data:    { x: 460, y: 160, w: 130, h: 40, type: 'box', label: 'Data Queue', sub: 'BE (DSCP 0)', highlighted: s === 2 },
      shape:   { x: 460, y: 240, w: 160, h: 45, type: 'box', label: 'Traffic Shaping', sub: 'Rate limit, WRED', highlighted: s === 3 },
    },
    arrows: [
      { id: 'a1', from: 'in', to: 'classify', color: 'var(--cyan)', highlighted: s >= 1 },
      { id: 'a2', from: 'classify', to: 'voice', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'classify', to: 'video', color: 'var(--amber)', highlighted: s === 2 },
      { id: 'a4', from: 'classify', to: 'data', color: 'var(--text-muted)', highlighted: s === 2 },
      { id: 'a5', from: 'classify', to: 'shape', color: 'var(--text-muted)', highlighted: s === 3 },
    ]
  };
}

function automationScene(s) {
  return {
    elements: {
      git:     { x: 40, y: 30, w: 130, h: 50, type: 'box', label: 'Git Repo', sub: 'Config as Code', color: 'var(--cyan)', highlighted: s === 1 },
      cicd:    { x: 40, y: 130, w: 150, h: 50, type: 'box', label: 'CI/CD Pipeline', sub: 'GitHub Actions', color: 'var(--green)', highlighted: s === 2 },
      ansible: { x: 300, y: 60, w: 150, h: 50, type: 'box', label: 'Ansible', sub: 'Playbooks', color: 'var(--amber)', highlighted: s === 3 },
      tf:      { x: 300, y: 170, w: 150, h: 50, type: 'box', label: 'Terraform', sub: 'IaC', color: 'var(--purple)', highlighted: s === 4 },
      devs:    { x: 550, y: 110, w: 160, h: 50, type: 'box', label: 'Devices', sub: 'Routers, Switches' },
    },
    arrows: [
      { id: 'a1', from: 'git', to: 'cicd', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'cicd', to: 'ansible', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a3', from: 'cicd', to: 'tf', color: 'var(--purple)', highlighted: s === 4 },
      { id: 'a4', from: 'ansible', to: 'devs', color: 'var(--amber)', highlighted: s === 3 },
      { id: 'a5', from: 'tf', to: 'devs', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

function ebpfScene(s) {
  return {
    elements: {
      user: { x: 40, y: 30, w: 130, h: 45, type: 'box', label: 'Userspace', sub: 'XDP/Cilium', color: 'var(--cyan)', highlighted: s === 0 },
      prog: { x: 40, y: 120, w: 150, h: 45, type: 'box', label: 'eBPF Program', sub: 'Verified bytecode', color: 'var(--green)', highlighted: s === 1 },
      hook: { x: 40, y: 220, w: 150, h: 45, type: 'box', label: 'Kernel Hooks', sub: 'XDP, TC, Socket', color: 'var(--amber)', highlighted: s === 2 },
      map:  { x: 300, y: 120, w: 140, h: 45, type: 'box', label: 'eBPF Maps', sub: 'Key-value state', highlighted: s === 3 },
      perf: { x: 300, y: 220, w: 140, h: 45, type: 'box', label: 'Perf Events', sub: 'Observability', color: 'var(--purple)', highlighted: s === 4 },
    },
    arrows: [
      { id: 'a1', from: 'user', to: 'prog', color: 'var(--cyan)', highlighted: s === 1 },
      { id: 'a2', from: 'prog', to: 'hook', color: 'var(--green)', highlighted: s === 2 },
      { id: 'a3', from: 'prog', to: 'map', color: 'var(--text-muted)', highlighted: s === 3 },
      { id: 'a4', from: 'hook', to: 'perf', color: 'var(--purple)', highlighted: s === 4 },
    ]
  };
}

export default SchematicCanvas;
