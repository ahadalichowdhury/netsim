import React, { useState, useEffect, useRef, useCallback } from 'react';

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24];
const FONT_SIZE_LABELS = { 12: 'XS', 13: 'S', 14: 'M', 15: 'ML', 16: 'L', 18: 'XL', 20: '2XL', 22: '3XL', 24: '4XL' };
const MIN_WIDTH = 280;
const MAX_WIDTH = 700;

const InfoPanel = ({ scenario, currentStep, stepIndex, tables, packetDetails, width, onWidthChange }) => {
  const [fontSizeIdx, setFontSizeIdx] = useState(() => {
    const saved = localStorage.getItem('info-font-size');
    return saved ? parseInt(saved) : 3;
  });
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('info-font-size', fontSizeIdx);
  }, [fontSizeIdx]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  if (!scenario || !currentStep) return null;

  const fontSize = FONT_SIZES[fontSizeIdx];
  const label = FONT_SIZE_LABELS[fontSize] || fontSize;

  const decreaseFont = () => setFontSizeIdx(i => Math.max(0, i - 1));
  const increaseFont = () => setFontSizeIdx(i => Math.min(FONT_SIZES.length - 1, i + 1));

  return (
    <div className="info-panel" style={{ width: `${width}px` }}>
      <div className="resize-handle" onMouseDown={handleMouseDown} title="Drag to resize">
        <div className="resize-handle-dots" />
      </div>

      <div className="info-header">
        <h3>{scenario.icon} {scenario.name}</h3>
        <p>{scenario.description}</p>
      </div>

      <div className="info-controls">
        <label>Text Size</label>
        <button className="font-size-btn" onClick={decreaseFont} disabled={fontSizeIdx === 0} title="Decrease font size">
          A−
        </button>
        <span className="font-size-value">{label}</span>
        <button className="font-size-btn" onClick={increaseFont} disabled={fontSizeIdx === FONT_SIZES.length - 1} title="Increase font size">
          A+
        </button>
      </div>

      <div className="info-body">
        <div className="info-step-title">
          <span className="info-step-num">{stepIndex + 1}</span>
          {currentStep.title}
        </div>

        <div
          className="info-explanation"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: currentStep.explanation?.replace(/\n/g, '<br/>') }}
        />

        {packetDetails && Object.keys(packetDetails).length > 0 && (
          <div className="packet-inspector">
            <h4>Packet Contents</h4>
            {Object.entries(packetDetails).map(([pktId, pkt]) => (
              <div key={pktId} className="packet-card">
                {pkt.layers.map((layer, i) => (
                  <div key={i} className="packet-layer">
                    <div className="packet-layer-name" style={{ color: layer.color }}>
                      {layer.name}
                    </div>
                    {layer.fields.map(([key, val], j) => (
                      <div key={j} className="packet-field">
                        <span className="packet-field-key">{key}</span>
                        <span className="packet-field-val">{val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tables && Object.keys(tables).length > 0 && (
          <div className="tables-section">
            <h4>Device Tables</h4>
            {Object.entries(tables).map(([deviceId, deviceTables]) => (
              <React.Fragment key={deviceId}>
                {deviceTables.arp && Object.keys(deviceTables.arp).length > 0 && (
                  <div className="table-card">
                    <div className="table-card-header">
                      <span className="dot" style={{ background: 'var(--amber)' }} />
                      {deviceId.toUpperCase()} — ARP Cache
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>IP Address</th>
                          <th>MAC Address</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(deviceTables.arp).map(([ip, entry]) => (
                          <tr key={ip}>
                            <td>{ip}</td>
                            <td className={entry.isNew ? 'new-entry' : (entry.mac === '???' ? 'unknown' : '')}>
                              {entry.mac}
                            </td>
                            <td className={entry.isNew ? 'new-entry' : ''}>
                              {entry.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {deviceTables.mac && Object.keys(deviceTables.mac).length > 0 && (
                  <div className="table-card">
                    <div className="table-card-header">
                      <span className="dot" style={{ background: 'var(--purple)' }} />
                      {deviceId.toUpperCase()} — MAC Address Table
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>MAC Address</th>
                          <th>Port</th>
                          <th>Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(deviceTables.mac).map(([mac, entry]) => (
                          <tr key={mac}>
                            <td className={entry.isNew ? 'new-entry' : ''}>{mac}</td>
                            <td>{entry.port}</td>
                            <td>{entry.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {deviceTables.dhcp && (
                  <div className="table-card">
                    <div className="table-card-header">
                      <span className="dot" style={{ background: 'var(--green)' }} />
                      {deviceId.toUpperCase()} — DHCP Configuration
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(deviceTables.dhcp).map(([key, val]) => (
                          <tr key={key} className={val?.isNew ? 'new-entry' : ''}>
                            <td>{key}</td>
                            <td>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {deviceTables.leases && Object.keys(deviceTables.leases).length > 0 && (
                  <div className="table-card">
                    <div className="table-card-header">
                      <span className="dot" style={{ background: 'var(--green)' }} />
                      {deviceId.toUpperCase()} — DHCP Lease Table
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>IP Address</th>
                          <th>MAC Address</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(deviceTables.leases).map(([ip, entry]) => (
                          <tr key={ip}>
                            <td>{ip}</td>
                            <td className={entry.isNew ? 'new-entry' : ''}>{entry.mac}</td>
                            <td className={entry.isNew ? 'new-entry' : ''}>{entry.status}{entry.timer ? ` (${entry.timer})` : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {deviceTables.routing && (
                  <div className="table-card">
                    <div className="table-card-header">
                      <span className="dot" style={{ background: 'var(--cyan)' }} />
                      {deviceId.toUpperCase()} — Routing Table
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Destination</th>
                          <th>Interface / Gateway</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(deviceTables.routing).map(([dest, iface]) => (
                          <tr key={dest}>
                            <td>{dest}</td>
                            <td>{iface}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
