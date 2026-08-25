import React, { useEffect, useRef } from 'react';

const typeLabels = {
  computer: 'Computer',
  switch: 'Network Switch',
  router: 'Router',
  server: 'DHCP Server'
};

const typeColors = {
  computer: 'var(--blue)',
  switch: 'var(--purple)',
  router: 'var(--amber)',
  server: 'var(--green)'
};

const DeviceTooltip = ({ device, meta, tables, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 10);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      clearTimeout(timer);
    };
  }, [onClose]);

  if (!device) return null;

  const pos = { x: device.x, y: device.y };
  const tooltipX = Math.min(pos.x + 50, 680);
  const tooltipY = Math.max(pos.y - 60, 20);

  return (
    <div
      ref={ref}
      className="device-tooltip"
      style={{ left: `${tooltipX}px`, top: `${tooltipY}px` }}
    >
      <div className="tooltip-header" style={{ borderColor: typeColors[device.type] }}>
        <div className="tooltip-type-badge" style={{ background: typeColors[device.type] }}>
          {typeLabels[device.type] || device.type}
        </div>
        <button className="tooltip-close" onClick={onClose}>&times;</button>
      </div>

      <div className="tooltip-title">{device.name}</div>

      <div className="tooltip-fields">
        {device.ip && (
          <div className="tooltip-field">
            <span className="tooltip-field-label">IP</span>
            <span className="tooltip-field-value mono">{device.ip}</span>
          </div>
        )}
        {device.mac && (
          <div className="tooltip-field">
            <span className="tooltip-field-label">MAC</span>
            <span className="tooltip-field-value mono">{device.mac}</span>
          </div>
        )}
        {device.subnet && (
          <div className="tooltip-field">
            <span className="tooltip-field-label">Subnet</span>
            <span className="tooltip-field-value mono">{device.subnet}</span>
          </div>
        )}
        {device.gw && (
          <div className="tooltip-field">
            <span className="tooltip-field-label">Gateway</span>
            <span className="tooltip-field-value mono">{device.gw}</span>
          </div>
        )}
      </div>

      {tables && (
        <div className="tooltip-tables">
          {tables.arp && Object.keys(tables.arp).length > 0 && (
            <div className="tooltip-table">
              <div className="tooltip-table-title" style={{ color: 'var(--amber)' }}>ARP Cache</div>
              <table>
                <thead><tr><th>IP</th><th>MAC</th><th>Status</th></tr></thead>
                <tbody>
                  {Object.entries(tables.arp).map(([ip, entry]) => (
                    <tr key={ip}>
                      <td>{ip}</td>
                      <td className={entry.isNew ? 'new-entry' : (entry.mac === '???' ? 'unknown' : '')}>{entry.mac}</td>
                      <td className={entry.isNew ? 'new-entry' : ''}>{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tables.mac && Object.keys(tables.mac).length > 0 && (
            <div className="tooltip-table">
              <div className="tooltip-table-title" style={{ color: 'var(--purple)' }}>MAC Table</div>
              <table>
                <thead><tr><th>MAC</th><th>Port</th><th>Device</th></tr></thead>
                <tbody>
                  {Object.entries(tables.mac).map(([mac, entry]) => (
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

          {tables.dhcp && (
            <div className="tooltip-table">
              <div className="tooltip-table-title" style={{ color: 'var(--green)' }}>DHCP Config</div>
              <table>
                <thead><tr><th>Key</th><th>Value</th></tr></thead>
                <tbody>
                  {Object.entries(tables.dhcp).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td className={v?.isNew ? 'new-entry' : ''}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tables.leases && Object.keys(tables.leases).length > 0 && (
            <div className="tooltip-table">
              <div className="tooltip-table-title" style={{ color: 'var(--green)' }}>DHCP Leases</div>
              <table>
                <thead><tr><th>IP</th><th>MAC</th><th>Status</th></tr></thead>
                <tbody>
                  {Object.entries(tables.leases).map(([ip, entry]) => (
                    <tr key={ip}>
                      <td>{ip}</td>
                      <td className={entry.isNew ? 'new-entry' : ''}>{entry.mac}</td>
                      <td className={entry.isNew ? 'new-entry' : ''}>{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tables.routing && (
            <div className="tooltip-table">
              <div className="tooltip-table-title" style={{ color: 'var(--cyan)' }}>Routing Table</div>
              <table>
                <thead><tr><th>Destination</th><th>Interface</th></tr></thead>
                <tbody>
                  {Object.entries(tables.routing).map(([dest, iface]) => (
                    <tr key={dest}>
                      <td>{dest}</td>
                      <td>{iface}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceTooltip;
