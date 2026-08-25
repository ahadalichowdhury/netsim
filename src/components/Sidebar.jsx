import React, { useState } from 'react';
import {
  BookOpen, Layers, Radio, Globe, Network, Search, Handshake,
  ArrowLeftRight, Building2, Cpu, Route, Shield, Box,
  Link2, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const categoryIcons = {
  'Networking Fundamentals': Layers,
  'Linux Core Networking': Cpu,
  'Advanced Topics': Shield
};

const scenarioIcons = {
  layer2: Layers, arp: Radio, dhcp: Globe, layer3: Network,
  dns: Search, tcp: Handshake, nat: ArrowLeftRight, vlan: Building2,
  nic: Cpu, stack: Route, route: Route, iptables: Shield,
  namespace: Box, bridge: Link2
};

const Sidebar = ({ scenarios, activeId, onSelect, stepIndex, totalSteps, collapsed, onToggle }) => {
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

  // Group scenarios by category
  const grouped = {};
  scenarios.forEach(s => {
    const cat = s.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
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

      <div className="sidebar-list">
        {Object.entries(grouped).map(([category, items]) => {
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
                        <div className="sidebar-item-num">{globalIndex}</div>
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
