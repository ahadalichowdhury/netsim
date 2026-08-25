import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Layers, Radio, Globe, Network, Search, Handshake,
  ArrowLeftRight, Building2, Cpu, Route, Shield, Box,
  Link2, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen,
  DoorOpen, Target, Puzzle, Zap
} from 'lucide-react';

const categoryIcons = {
  'Components': Puzzle,
  'Networking Fundamentals': Layers,
  'Linux Core Networking': Cpu,
  'Advanced Networking': Zap,
};

const categoryOrder = ['Components', 'Networking Fundamentals', 'Linux Core Networking', 'Advanced Networking'];

const categoryDisplayOrder = { 'Components': 0, 'Networking Fundamentals': 1, 'Linux Core Networking': 2, 'Advanced Networking': 3 };

const scenarioIcons = {
  layer2: Layers, arp: Radio, dhcp: Globe, layer3: Network,
  dns: Search, tcp: Handshake, nat: ArrowLeftRight, vlan: Building2,
  gateway: DoorOpen, 'default-gateway': Target,
  nic: Cpu, stack: Route, route: Route, iptables: Shield,
  namespace: Box, bridge: Link2,
  'linux-gateway': DoorOpen, 'linux-default-gw': Target,
  'mac-address': Radio, 'ip-address': Network, subnetting: Route,
  ports: DoorOpen, 'arp-table': Layers, 'mac-table': Shield,
  'dhcp-table': Globe, 'routing-table': Route,
  'osi-model': Layers, icmp: Radio, udp: Handshake, 'tcp-vs-udp': Handshake,
  ipv6: Globe, vpn: Shield, wifi: Radio, nftables: Shield,
  'ethernet-frame': Box, ttl: Target, mtu: Route,
  'dns-records': Search, troubleshooting: Route, http: Globe,
  bgp: Globe, ospf: Route, mpls: Layers, 'load-balancing': ArrowLeftRight,
  cdn: Globe, vxlan: Box, sdn: Cpu, 'zero-trust': Shield,
  tls13: Shield, wireguard: Shield, dnssec: Shield,
  quic: Zap, qos: Layers, automation: Cpu, ebpf: Route
};

const Sidebar = ({ scenarios, activeId, onSelect, stepIndex, totalSteps, collapsed, onToggle }) => {
  const listRef = useRef(null);
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const cats = {};
    scenarios.forEach(s => {
      const cat = s.category || 'Other';
      if (cats[cat] === undefined) cats[cat] = true;
    });
    return cats;
  });

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Scroll active item into view on mount and when activeId changes
  useEffect(() => {
    if (!listRef.current) return;
    const timer = setTimeout(() => {
      const activeEl = listRef.current.querySelector('.sidebar-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeId]);

  // Group and SORT by order field
  const grouped = {};
  scenarios.forEach(s => {
    const cat = s.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  let globalIndex = 0;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <BookOpen size={16} style={{ color: 'var(--cyan)' }} />
            <span>Lessons</span>
          </>
        )}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="sidebar-list" ref={listRef}>
        {Object.entries(grouped)
          .sort(([a], [b]) => (categoryDisplayOrder[a] ?? 99) - (categoryDisplayOrder[b] ?? 99))
          .map(([category, items]) => {
          const CatIcon = categoryIcons[category] || Layers;
          const isExpanded = expandedCategories[category] !== false;

          return (
            <div key={category} className="sidebar-category">
              <button
                className="sidebar-category-header"
                onClick={() => toggleCategory(category)}
                title={collapsed ? category : undefined}
              >
                {!collapsed && (
                  <>
                    <span className="sidebar-category-icon">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <CatIcon size={14} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                    <span className="sidebar-category-name">{category}</span>
                    <span className="sidebar-category-count">{items.length}</span>
                  </>
                )}
                {collapsed && <CatIcon size={16} style={{ color: 'var(--cyan)' }} />}
              </button>

              {isExpanded && !collapsed && (
                <div className="sidebar-category-items">
                  {items.map((s) => {
                    const Icon = scenarioIcons[s.id] || Layers;
                    const isActive = activeId === s.id;
                    globalIndex++;
                    return (
                      <button
                        key={s.id}
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => onSelect(s.id)}
                      >
                        <div className="sidebar-item-num">{s.order || globalIndex}</div>
                        <div className="sidebar-item-icon">
                          <Icon size={14} />
                        </div>
                        <div className="sidebar-item-content">
                          <div className="sidebar-item-name">{s.name}</div>
                          <div className="sidebar-item-desc">{s.description}</div>
                        </div>
                        {isActive && (
                          <div className="sidebar-item-indicator">
                            {stepIndex + 1}/{totalSteps}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
