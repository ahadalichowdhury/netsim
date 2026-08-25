export const scenarios = [
  {
    id: 'layer2',
    name: 'Layer 2',
    icon: '🔀',
    description: 'How switches forward frames using MAC addresses',
    category: 'Networking Fundamentals',
    order: 10,
    topology: {
      devices: [
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 150, y: 280 },
        { id: 'pc-b', type: 'computer', name: 'PC-B', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:02', x: 850, y: 280 },
        { id: 'pc-c', type: 'computer', name: 'PC-C', ip: '192.168.1.30', mac: 'AA:BB:CC:DD:EE:03', x: 850, y: 120 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 500, y: 200 }
      ],
      links: [
        { id: 'link-a', from: 'pc-a', to: 'switch' },
        { id: 'link-b', from: 'pc-b', to: 'switch' },
        { id: 'link-c', from: 'pc-c', to: 'switch' }
      ]
    },
    steps: [
      {
        title: 'PC-A wants to send data to PC-B',
        explanation: '<strong>PC-A</strong> has data to send to <strong>PC-B</strong> (192.168.1.20). Both are on the same subnet (192.168.1.0/24), so PC-A can send directly via Layer 2.\n\nBut first, PC-A needs to build an <strong>Ethernet frame</strong> with PC-B\'s MAC address as the destination.\n\n<strong>How does PC-A know PC-B\'s MAC?</strong>\nPC-A uses <strong>ARP</strong> (Address Resolution Protocol) to discover it. Before this step, PC-A sent an ARP broadcast: "Who has 192.168.1.20?" and PC-B replied with its MAC. See the <strong>ARP topic</strong> for the full process.\n\n<strong>How does PC-A know PC-B\'s IP?</strong> The user or application provided it — either directly (ping 192.168.1.20) or via DNS resolution (ping pc-b.local). See <strong>How Networks Start</strong> for the complete chain.\n\n<strong>See also:</strong> <strong>MAC Address</strong> and <strong>MAC Table</strong> topics for how switches learn and forward.',
        highlights: ['pc-a'],
        packets: [],
        tables: { 'switch': { mac: {} } }
      },
      {
        title: 'PC-A builds Ethernet frame',
        explanation: 'PC-A creates an <strong>Ethernet II frame</strong>:\n<code>Src MAC: AA:BB:CC:DD:EE:01</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:02</code>\n\nInside the Ethernet payload is an <strong>IPv4 packet</strong> carrying the data. The frame is now ready to be sent to the Switch.',
        highlights: ['pc-a'],
        packets: [],
        tables: { 'switch': { mac: {} } },
        packetDetails: {
          f1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10'],
                ['Destination', '192.168.1.20'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Frame travels: PC-A \u2192 Switch',
        explanation: 'The Ethernet frame travels from <strong>PC-A</strong> to the <strong>Switch</strong> over the physical cable.\n\nThe Switch receives the frame on <strong>port 1</strong> and begins processing it.',
        highlights: ['pc-a', 'switch'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'f1', type: 'data', from: 'pc-a', to: 'switch', color: 'var(--cyan)', label: 'Frame \u2192 Switch', duration: 1200 }
        ],
        tables: { 'switch': { mac: {} } },
        packetDetails: {
          f1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10'],
                ['Destination', '192.168.1.20'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch learns PC-A\'s MAC address',
        explanation: 'The Switch inspects the frame\'s <strong>source MAC address</strong> (AA:BB:CC:DD:EE:01).\n\nIt creates an entry in its <strong>MAC address table</strong>:\n<code>AA:BB:CC:DD:EE:01 \u2192 Port 1 (PC-A)</code>\n\nThis is the <strong>learning</strong> phase \u2014 the switch now knows where to find PC-A.',
        highlights: ['switch'],
        packets: [],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A', isNew: true } }
          }
        }
      },
      {
        title: 'Switch checks MAC table \u2014 PC-B unknown',
        explanation: 'The Switch looks at the frame\'s <strong>destination MAC</strong> (AA:BB:CC:DD:EE:02) and searches its MAC table.\n\n<strong>PC-B is not in the table.</strong> The switch doesn\'t know which port leads to PC-B.\n\nThe only option: <strong>flood</strong> the frame out all ports except the one it came in on.',
        highlights: ['switch'],
        packets: [],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' } }
          }
        }
      },
      {
        title: 'Switch floods frame to PC-B',
        explanation: 'The Switch floods the frame out <strong>all ports except port 1</strong>.\n\nThe first copy travels to <strong>PC-B</strong> via port 2. This is called <strong>unknown unicast flooding</strong>.',
        highlights: ['switch', 'pc-b'],
        activeLinks: ['link-b'],
        packets: [
          { id: 'f2', type: 'data', from: 'switch', to: 'pc-b', color: 'var(--cyan)', label: 'Flood \u2192 PC-B', duration: 1200 }
        ],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' } }
          }
        }
      },
      {
        title: 'Switch also floods to PC-C',
        explanation: 'The Switch simultaneously sends a copy of the frame to <strong>PC-C</strong> via port 3.\n\nPC-C will examine the destination MAC and decide whether to accept or drop the frame.',
        highlights: ['switch', 'pc-c'],
        activeLinks: ['link-c'],
        packets: [
          { id: 'f3', type: 'data', from: 'switch', to: 'pc-c', color: 'var(--text-muted)', label: 'Flood \u2192 PC-C', duration: 1200 }
        ],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' } }
          }
        }
      },
      {
        title: 'PC-C drops \u2014 wrong destination MAC',
        explanation: '<strong>PC-C</strong> receives the flooded frame and checks the destination MAC.\n\n<code>Dst MAC: AA:BB:CC:DD:EE:02</code>\n<code>PC-C MAC: AA:BB:CC:DD:EE:03</code>\n\nThe addresses don\'t match \u2014 <strong>PC-C silently drops the frame</strong>. It was never meant for PC-C.',
        highlights: ['pc-c'],
        packets: [],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' } }
          }
        }
      },
      {
        title: 'PC-B accepts and sends reply',
        explanation: '<strong>PC-B</strong> receives the frame and sees the destination MAC matches its own \u2014 it <strong>accepts</strong> the frame.\n\nPC-B processes the data and sends a <strong>reply frame</strong> back:\n<code>Src MAC: AA:BB:CC:DD:EE:02 (PC-B)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:01 (PC-A)</code>',
        highlights: ['pc-b'],
        activeLinks: ['link-b'],
        packets: [
          { id: 'f4', type: 'data', from: 'pc-b', to: 'switch', color: 'var(--green)', label: 'Reply \u2192 Switch', duration: 1200 }
        ],
        tables: {
          'switch': {
            mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' } }
          }
        },
        packetDetails: {
          f4: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Source', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20'],
                ['Destination', '192.168.1.10'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch learns PC-B\'s MAC',
        explanation: 'The Switch receives the reply and inspects the <strong>source MAC</strong> (AA:BB:CC:DD:EE:02).\n\nIt creates a new entry:\n<code>AA:BB:CC:DD:EE:02 \u2192 Port 2 (PC-B)</code>\n\nThe MAC table now has entries for <strong>both</strong> PC-A and PC-B.',
        highlights: ['switch'],
        packets: [],
        tables: {
          'switch': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B', isNew: true }
            }
          }
        }
      },
      {
        title: 'Switch forwards unicast to PC-A',
        explanation: 'The Switch checks the destination MAC (AA:BB:CC:DD:EE:01) in its table \u2014 <strong>found! Port 1 = PC-A.</strong>\n\nNo flooding needed \u2014 the Switch forwards the frame <strong>only to PC-A</strong>. This is efficient <strong>unicast forwarding</strong>.',
        highlights: ['switch', 'pc-a'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'f5', type: 'data', from: 'switch', to: 'pc-a', color: 'var(--green)', label: 'Reply \u2192 PC-A', duration: 1200 }
        ],
        tables: {
          'switch': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B' }
            }
          }
        }
      },
      {
        title: 'Layer 2 switching complete!',
        explanation: 'The Switch has now <strong>learned</strong> both PC-A and PC-B\'s MAC addresses.\n\nFuture frames between PC-A and PC-B will be <strong>forwarded directly</strong> via unicast \u2014 no more flooding!\n\n<strong>Key concept:</strong> Switches learn by inspecting the <strong>source MAC</strong> of every frame. They forward by looking up the <strong>destination MAC</strong> in their MAC address table.',
        highlights: ['pc-a', 'pc-b', 'switch'],
        packets: [],
        tables: {
          'switch': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B' }
            }
          }
        }
      }
    ]
  },

  {
    id: 'arp',
    name: 'ARP',
    icon: '📡',
    description: 'Address Resolution Protocol - IP to MAC mapping',
    category: 'Networking Fundamentals',
    order: 11,
    topology: {
      devices: [
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 200, y: 280 },
        { id: 'pc-b', type: 'computer', name: 'PC-B', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:02', x: 800, y: 280 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 500, y: 160 }
      ],
      links: [
        { id: 'link-a', from: 'pc-a', to: 'switch' },
        { id: 'link-b', from: 'pc-b', to: 'switch' }
      ]
    },
    steps: [
      {
        title: 'PC-A needs PC-B\'s MAC address',
        explanation: 'PC-A wants to send data to PC-B (192.168.1.20). <strong>How does PC-A know this IP?</strong>\n\n• The user typed <code>ping 192.168.1.20</code> (IP given directly)\n• Or the user typed <code>ping pc-b.local</code> and <strong>DNS</strong> resolved it to 192.168.1.20\n\nSee the <strong>How Networks Start</strong> topic for the full journey from user action to first packet.\n\nNow PC-A needs to send an Ethernet frame, but it needs PC-B\'s <strong>MAC address</strong>. PC-A checks its ARP cache — it\'s empty. It must use ARP to discover the MAC.\n\n<strong>See also:</strong> <strong>ARP Table</strong> topic for cache entries and timeouts.',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { arp: {} },
          'pc-b': { arp: {} }
        }
      },
      {
        title: 'PC-A builds ARP Request (broadcast)',
        explanation: 'PC-A creates an <strong>ARP Request</strong>:\n<code>"Who has 192.168.1.20? Tell 192.168.1.10"</code>\n\nThe Ethernet destination is <code>FF:FF:FF:FF:FF:FF</code> \u2014 a <strong>broadcast</strong> address. Every device on the network will receive this frame.\n\nThe ARP payload includes the <strong>target IP</strong> (what PC-A wants) and the <strong>sender MAC</strong> (so PC-B can reply).',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: {} }
        },
        packetDetails: {
          arp1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--amber)', fields: [
                ['Opcode', 'Request (1)'],
                ['Sender MAC', 'AA:BB:CC:DD:EE:01'],
                ['Sender IP', '192.168.1.10'],
                ['Target MAC', '00:00:00:00:00:00'],
                ['Target IP', '192.168.1.20']
              ]}
            ]
          }
        }
      },
      {
        title: 'ARP Request: PC-A \u2192 Switch',
        explanation: 'The broadcast ARP Request travels from <strong>PC-A</strong> to the <strong>Switch</strong>.\n\nThe Switch receives the frame on port 1 and will flood it out all other ports because the destination is the broadcast address.',
        highlights: ['pc-a', 'switch'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'arp1', type: 'arp-request', from: 'pc-a', to: 'switch', color: 'var(--amber)', label: 'ARP Request (Broadcast)', duration: 1200, broadcast: true }
        ],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: {} }
        },
        packetDetails: {
          arp1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--amber)', fields: [
                ['Opcode', 'Request (1)'],
                ['Sender MAC', 'AA:BB:CC:DD:EE:01'],
                ['Sender IP', '192.168.1.10'],
                ['Target MAC', '00:00:00:00:00:00'],
                ['Target IP', '192.168.1.20']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch floods broadcast to PC-B',
        explanation: 'The Switch receives the broadcast frame and <strong>floods</strong> it out all ports except the source.\n\nThe ARP Request reaches <strong>PC-B</strong> via port 2. Both devices on the network will process this broadcast.',
        highlights: ['switch', 'pc-b'],
        activeLinks: ['link-b'],
        packets: [
          { id: 'arp2', type: 'arp-request', from: 'switch', to: 'pc-b', color: 'var(--amber)', label: 'ARP Request', duration: 1200, broadcast: true }
        ],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: {} }
        }
      },
      {
        title: 'PC-B recognizes its IP address',
        explanation: 'PC-B receives the ARP Request and checks the <strong>target IP address</strong> (192.168.1.20) \u2014 it matches PC-B\'s own IP!\n\nPC-B now knows someone wants its MAC address. It <strong>learns</strong> PC-A\'s IP and MAC from the ARP payload and will send an <strong>ARP Reply</strong>.',
        highlights: ['pc-b'],
        packets: [],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned', isNew: true } } }
        }
      },
      {
        title: 'PC-B builds ARP Reply (unicast)',
        explanation: 'PC-B creates an <strong>ARP Reply</strong>:\n<code>"192.168.1.10 is at AA:BB:CC:DD:EE:02"</code>\n\nUnlike the request, this is a <strong>unicast</strong> frame \u2014 the Ethernet destination is PC-A\'s MAC address, not the broadcast address. Only PC-A will receive it.',
        highlights: ['pc-b'],
        packets: [],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned' } } }
        },
        packetDetails: {
          arp3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Unicast)'],
                ['Source', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--green)', fields: [
                ['Opcode', 'Reply (2)'],
                ['Sender MAC', 'AA:BB:CC:DD:EE:02'],
                ['Sender IP', '192.168.1.20'],
                ['Target MAC', 'AA:BB:CC:DD:EE:01'],
                ['Target IP', '192.168.1.10']
              ]}
            ]
          }
        }
      },
      {
        title: 'ARP Reply: PC-B \u2192 Switch',
        explanation: 'The unicast ARP Reply travels from <strong>PC-B</strong> to the <strong>Switch</strong>.\n\nThe Switch will look up the destination MAC (PC-A) in its table and forward directly.',
        highlights: ['pc-b', 'switch'],
        activeLinks: ['link-b'],
        packets: [
          { id: 'arp3', type: 'arp-reply', from: 'pc-b', to: 'switch', color: 'var(--green)', label: 'ARP Reply (Unicast)', duration: 1200 }
        ],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned' } } }
        },
        packetDetails: {
          arp3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Unicast)'],
                ['Source', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--green)', fields: [
                ['Opcode', 'Reply (2)'],
                ['Sender MAC', 'AA:BB:CC:DD:EE:02'],
                ['Sender IP', '192.168.1.20'],
                ['Target MAC', 'AA:BB:CC:DD:EE:01'],
                ['Target IP', '192.168.1.10']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards unicast to PC-A',
        explanation: 'The Switch receives the ARP Reply and looks at the destination MAC (AA:BB:CC:DD:EE:01).\n\nIt finds it in its MAC table \u2014 <strong>port 1 = PC-A</strong>. It forwards the frame <strong>only to PC-A</strong>. No flooding!',
        highlights: ['switch', 'pc-a'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'arp4', type: 'arp-reply', from: 'switch', to: 'pc-a', color: 'var(--green)', label: 'ARP Reply', duration: 1200 }
        ],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: '???', status: 'querying' } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned' } } }
        }
      },
      {
        title: 'PC-A receives and updates ARP cache',
        explanation: 'PC-A receives the ARP Reply and now knows:\n<code>192.168.1.20 \u2192 AA:BB:CC:DD:EE:02</code>\n\nThis entry is stored in PC-A\'s <strong>ARP cache</strong> for future use. PC-A can now send data to PC-B without another ARP request!',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'resolved', isNew: true } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned' } } }
        }
      },
      {
        title: 'ARP resolution complete!',
        explanation: 'Both devices now have each other\'s MAC addresses in their ARP caches.\n\n<strong>ARP</strong> maps IP addresses to MAC addresses, enabling Layer 2 communication. Without ARP, devices couldn\'t build the Ethernet frames needed to send data on a local network.',
        highlights: ['pc-a', 'pc-b'],
        packets: [],
        tables: {
          'pc-a': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'resolved' } } },
          'pc-b': { arp: { '192.168.1.10': { mac: 'AA:BB:CC:DD:EE:01', status: 'learned' } } }
        }
      }
    ]
  },

  {
    id: 'dhcp',
    name: 'DHCP',
    icon: '🌐',
    description: 'Dynamic Host Configuration Protocol - DORA process',
    category: 'Networking Fundamentals',
    order: 14,
    topology: {
      devices: [
        { id: 'pc-new', type: 'computer', name: 'New PC', ip: '???.???.???.???', mac: 'AA:BB:CC:DD:EE:10', x: 200, y: 280 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 500, y: 160 },
        { id: 'dhcp', type: 'server', name: 'DHCP Server', ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', x: 800, y: 280 }
      ],
      links: [
        { id: 'link-new', from: 'pc-new', to: 'switch' },
        { id: 'link-dhcp', from: 'dhcp', to: 'switch' }
      ]
    },
    steps: [
      {
        title: 'New PC boots up — no IP address!',
        explanation: 'A brand-new PC powers on with a <strong>burned-in MAC address</strong> (AA:BB:CC:DD:EE:10) but <strong>no IP configuration</strong> at all.\n\nWithout an IP, it cannot communicate on the network. It must run <strong>DHCP DORA</strong> to obtain one automatically.\n\n<strong>Note:</strong> DHCP also provides the <strong>default gateway</strong> and <strong>DNS server</strong> addresses. See those topics for details.\n\n<strong>See also:</strong> <strong>DHCP Table</strong> topic for lease database details.',
        highlights: ['pc-new'],
        packets: [],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: {} }
        }
      },
      {
        title: 'PC builds DHCP Discover (broadcast)',
        explanation: 'The PC constructs a <strong>DHCP Discover</strong> message — the very first step of the DORA process.\n\nSince it has no IP yet, the source address is <code>0.0.0.0:68</code>. The destination is the broadcast address <code>255.255.255.255:67</code>, so any DHCP server on the LAN can hear the request.\n\nThe Ethernet frame is also broadcast (<code>FF:FF:FF:FF:FF:FF</code>).',
        highlights: ['pc-new'],
        packets: [],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: {} }
        }
      },
      {
        title: 'DHCP Discover: PC → Switch',
        explanation: 'The DHCP Discover frame leaves PC-A and reaches the Switch on <strong>link-new</strong>.\n\nThe frame is a <strong>broadcast</strong> — the switch will flood it to every other port.',
        highlights: ['pc-new'],
        activeLinks: ['link-new'],
        packets: [
          { id: 'd1', type: 'dhcp-discover', from: 'pc-new', to: 'switch', color: 'var(--purple)', label: 'DHCP Discover', duration: 1200, broadcast: true }
        ],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: {} }
        },
        packetDetails: {
          d1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:10'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '68 (DHCP Client)'],
                ['Dest Port', '67 (DHCP Server)']
              ]},
              { name: 'DHCP', color: 'var(--purple)', fields: [
                ['Message Type', 'DHCPDISCOVER'],
                ['Client MAC', 'AA:BB:CC:DD:EE:10'],
                ['Requested IP', 'Any (0.0.0.0)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch floods to DHCP Server',
        explanation: 'The Switch receives the broadcast Discover and <strong>floods</strong> it out all ports except the source.\n\nThe DHCP Server receives the message on <strong>link-dhcp</strong> and begins processing the request.',
        highlights: ['switch'],
        activeLinks: ['link-dhcp'],
        packets: [
          { id: 'd2', type: 'dhcp-discover', from: 'switch', to: 'dhcp', color: 'var(--purple)', label: 'DHCP Discover', duration: 1000 }
        ],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: {} }
        }
      },
      {
        title: 'DHCP Server checks IP pool',
        explanation: 'The DHCP Server examines its <strong>address pool</strong> and selects an available IP: <code>192.168.1.100</code>.\n\nIt reserves this address for the new PC\'s MAC address and marks the lease as <strong>"offered"</strong> — pending the client\'s confirmation.',
        highlights: ['dhcp'],
        packets: [],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'offered', isNew: true } } }
        }
      },
      {
        title: 'Server builds DHCP Offer',
        explanation: 'The Server builds a <strong>DHCP Offer</strong> reply containing:\n• Offered IP: <code>192.168.1.100</code>\n• Subnet Mask: <code>255.255.255.0</code>\n• Default Gateway: <code>192.168.1.1</code>\n• DNS Server: <code>8.8.8.8</code>\n• Lease Time: <code>86400 sec (24h)</code>\n\nThe Offer is addressed as a broadcast so the PC (which still has no IP) can receive it.',
        highlights: ['dhcp'],
        packets: [],
        tables: {
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'offered' } } }
        }
      },
      {
        title: 'DHCP Offer: Server → Switch',
        explanation: 'The DHCP Server sends the Offer frame to the Switch via <strong>link-dhcp</strong>.\n\nThe frame is broadcast so the IP-less PC can pick it up.',
        highlights: ['dhcp'],
        activeLinks: ['link-dhcp'],
        packets: [
          { id: 'd3', type: 'dhcp-offer', from: 'dhcp', to: 'switch', color: 'var(--blue)', label: 'DHCP Offer', duration: 1000 }
        ],
        tables: {
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'offered' } } }
        },
        packetDetails: {
          d3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:FF'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '67 (DHCP Server)'],
                ['Dest Port', '68 (DHCP Client)']
              ]},
              { name: 'DHCP', color: 'var(--blue)', fields: [
                ['Message Type', 'DHCPOFFER'],
                ['Your IP', '192.168.1.100'],
                ['Server IP', '192.168.1.1'],
                ['Subnet Mask', '255.255.255.0'],
                ['Gateway', '192.168.1.1'],
                ['DNS Server', '8.8.8.8'],
                ['Lease Time', '86400 sec (24h)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards Offer to PC',
        explanation: 'The Switch forwards the broadcast Offer out all ports. The New PC receives it and now knows an IP is available.\n\nThe PC records the offered IP and prepares its response.',
        highlights: ['pc-new'],
        activeLinks: ['link-new'],
        packets: [
          { id: 'd4', type: 'dhcp-offer', from: 'switch', to: 'pc-new', color: 'var(--blue)', label: 'DHCP Offer', duration: 1000 }
        ],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'offered' } } }
        }
      },
      {
        title: 'PC sends DHCP Request (broadcast)',
        explanation: 'The PC sends a <strong>DHCP Request</strong> — still a broadcast — accepting the offered IP <code>192.168.1.100</code>.\n\nThis broadcast serves two purposes:\n1. Tells the chosen Server: "I accept your offer"\n2. Tells any other DHCP Servers: "Release your offers — I chose someone else"',
        highlights: ['pc-new'],
        activeLinks: ['link-new'],
        packets: [
          { id: 'd5', type: 'dhcp-request', from: 'pc-new', to: 'switch', color: 'var(--amber)', label: 'DHCP Request', duration: 1200, broadcast: true }
        ],
        tables: {
          'pc-new': { dhcp: null },
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'offered' } } }
        },
        packetDetails: {
          d5: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:10'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '68 (DHCP Client)'],
                ['Dest Port', '67 (DHCP Server)']
              ]},
              { name: 'DHCP', color: 'var(--amber)', fields: [
                ['Message Type', 'DHCPREQUEST'],
                ['Requested IP', '192.168.1.100'],
                ['Server IP', '192.168.1.1']
              ]}
            ]
          }
        }
      },
      {
        title: 'Server sends DHCP Ack',
        explanation: 'The DHCP Server receives the Request and sends a <strong>DHCP Acknowledge</strong> — the final step of DORA.\n\nThe ACK confirms the lease is <strong>officially granted</strong>. The Server marks the IP as "leased" in its table.',
        highlights: ['dhcp'],
        activeLinks: ['link-dhcp'],
        packets: [
          { id: 'd6', type: 'dhcp-ack', from: 'dhcp', to: 'switch', color: 'var(--green)', label: 'DHCP ACK', duration: 1000 }
        ],
        tables: {
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'leased', isNew: true } } }
        },
        packetDetails: {
          d6: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'AA:BB:CC:DD:EE:FF'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '67 (DHCP Server)'],
                ['Dest Port', '68 (DHCP Client)']
              ]},
              { name: 'DHCP', color: 'var(--green)', fields: [
                ['Message Type', 'DHCPACK'],
                ['Your IP', '192.168.1.100'],
                ['Server IP', '192.168.1.1'],
                ['Subnet Mask', '255.255.255.0'],
                ['Gateway', '192.168.1.1'],
                ['DNS Server', '8.8.8.8'],
                ['Lease Time', '86400 sec (24h)']
              ]}
            ]
          }
        }
      },
      {
        title: 'PC configures network interface',
        explanation: 'The PC receives the ACK and <strong>applies the configuration</strong> to its NIC:\n• IP Address: <code>192.168.1.100</code>\n• Subnet Mask: <code>255.255.255.0</code>\n• Default Gateway: <code>192.168.1.1</code>\n• DNS Server: <code>8.8.8.8</code>\n• Lease Duration: <code>24 hours</code>\n\nThe interface comes up — the PC is now fully configured.',
        highlights: ['pc-new'],
        tables: {
          'pc-new': { dhcp: { ip: '192.168.1.100', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', lease: '24h', isNew: true } },
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'leased' } } }
        }
      },
      {
        title: 'DORA process complete!',
        explanation: 'The full <strong>DORA</strong> cycle is finished:\n\n<strong>D</strong>iscover → <strong>O</strong>ffer → <strong>R</strong>equest → <strong>A</strong>cknowledge\n\nThe PC now has a valid IP address, subnet mask, gateway, and DNS server. It can communicate on the network.\n\nThe DHCP Server\'s lease table shows the active lease with a running timer. When the lease expires, the PC must renew — or the IP returns to the pool.',
        highlights: ['pc-new', 'switch', 'dhcp'],
        tables: {
          'pc-new': { dhcp: { ip: '192.168.1.100', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', lease: '24h' } },
          'dhcp': { leases: { '192.168.1.100': { mac: 'AA:BB:CC:DD:EE:10', status: 'leased', timer: '23:59:58' } } }
        }
      }
    ]
  },

  {
    id: 'layer3',
    name: 'Layer 3',
    icon: '🌍',
    description: 'Routing between different networks via a router',
    category: 'Networking Fundamentals',
    order: 15,
    topology: {
      devices: [
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 120, y: 280, subnet: '192.168.1.0/24', gw: '192.168.1.1' },
        { id: 'sw1', type: 'switch', name: 'Switch 1', x: 300, y: 160 },
        { id: 'router', type: 'router', name: 'Router', ip: '192.168.1.1 / 192.168.2.1', mac: 'AA:BB:CC:DD:EE:FF', x: 500, y: 280 },
        { id: 'sw2', type: 'switch', name: 'Switch 2', x: 700, y: 160 },
        { id: 'pc-c', type: 'computer', name: 'PC-C', ip: '192.168.2.10', mac: 'AA:BB:CC:DD:EE:02', x: 880, y: 280, subnet: '192.168.2.0/24', gw: '192.168.2.1' }
      ],
      links: [
        { id: 'link-a-sw1', from: 'pc-a', to: 'sw1' },
        { id: 'link-sw1-r', from: 'sw1', to: 'router' },
        { id: 'link-r-sw2', from: 'router', to: 'sw2' },
        { id: 'link-sw2-c', from: 'sw2', to: 'pc-c' }
      ]
    },
    steps: [
      {
        title: 'PC-A wants to reach PC-C (different subnet)',
        explanation: 'PC-A (192.168.1.10) wants to send data to PC-C (192.168.2.10).\n\nPC-A checks its subnet mask: <code>255.255.255.0</code>. The destination 192.168.2.10 is <strong>not</strong> in the 192.168.1.0/24 network.\n\n<strong>Key rule:</strong> When the destination is on a different subnet, the frame must go to the <strong>default gateway</strong> (Router) — never directly to the destination.\n\n<strong>Prerequisite:</strong> Understand <strong>ARP</strong> (how MAC addresses are discovered) and <strong>Gateway</strong> (how routers connect networks) first.\n\n<strong>See also:</strong> <strong>Routing Table</strong> and <strong>IP Address</strong> topics for routing decisions and address structure.',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } },
          'router': { routing: { '192.168.1.0/24': 'eth0', '192.168.2.0/24': 'eth1' } },
          'pc-c': { routing: { 'default': '192.168.2.1 (Router)' } }
        }
      },
      {
        title: 'PC-A checks: destination not in my subnet',
        explanation: 'PC-A performs the subnet check:\n\n<code>Destination: 192.168.2.10</code>\n<code>My subnet: 192.168.1.0/24</code>\n\nThe first three octets don\'t match — the destination is <strong>remote</strong>. PC-A must forward to its <strong>default gateway</strong> (Router at 192.168.1.1).\n\nBut PC-A needs the Router\'s <strong>MAC address</strong> to build the Ethernet frame. It only has the IP — time to ARP!',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        }
      },
      {
        title: 'PC-A ARPs for default gateway (192.168.1.1)',
        explanation: 'PC-A sends an <strong>ARP Request</strong> broadcast:\n<code>"Who has 192.168.1.1? Tell 192.168.1.10"</code>\n\nThe broadcast reaches Switch 1, which floods it to all ports — including the Router\'s eth0 interface.',
        highlights: ['pc-a'],
        activeLinks: ['link-a-sw1'],
        packets: [
          { id: 'arp-r1', type: 'arp-request', from: 'pc-a', to: 'sw1', color: 'var(--amber)', label: 'ARP: Who has 192.168.1.1?', duration: 1000, broadcast: true }
        ],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        }
      },
      {
        title: 'Router replies with its MAC',
        explanation: 'The Router recognizes the ARP query for its eth0 IP (192.168.1.1) and sends an <strong>ARP Reply</strong>:\n<code>"192.168.1.1 is at AA:BB:CC:DD:EE:FF"</code>\n\nPC-A now has the Router\'s MAC address and can build a proper frame.',
        highlights: ['router'],
        activeLinks: ['link-a-sw1'],
        packets: [
          { id: 'arp-r2', type: 'arp-reply', from: 'sw1', to: 'pc-a', color: 'var(--green)', label: 'ARP Reply: AA:BB:CC:DD:EE:FF', duration: 1000 }
        ],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        }
      },
      {
        title: 'PC-A builds frame (dst MAC = Router)',
        explanation: 'PC-A constructs the Ethernet frame with the <strong>Router\'s MAC</strong> as the Layer 2 destination — even though the final destination is PC-C.\n\n<strong>Layer 2:</strong> PC-A → Router (local delivery)\n<strong>Layer 3:</strong> PC-A → PC-C (end-to-end)',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        }
      },
      {
        title: 'Frame: PC-A → Switch 1',
        explanation: 'The frame travels from PC-A to Switch 1 via <strong>link-a-sw1</strong>.\n\nThe frame header:\n<code>Src MAC: AA:BB:CC:DD:EE:01 (PC-A)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:FF (Router)</code>\n\nThe IP packet inside:\n<code>Src IP: 192.168.1.10 (PC-A)</code>\n<code>Dst IP: 192.168.2.10 (PC-C)</code>',
        highlights: ['pc-a'],
        activeLinks: ['link-a-sw1'],
        packets: [
          { id: 'd1', type: 'data', from: 'pc-a', to: 'sw1', color: 'var(--cyan)', label: 'Frame → Router', duration: 1200 }
        ],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        },
        packetDetails: {
          d1: {
            layers: [
              { name: 'Ethernet II (Hop 1)', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Router)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC-A)'],
                ['Destination', '192.168.2.10 (PC-C)'],
                ['TTL', '64'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch 1 learns PC-A, forwards to Router',
        explanation: 'Switch 1 receives the frame and:\n1. <strong>Learns</strong> PC-A\'s MAC on port 1 from the source address\n2. Looks up the destination MAC (AA:BB:CC:DD:EE:FF) — <strong>found</strong> on port 2\n3. <strong>Forwards</strong> the frame directly to the Router — no flooding needed',
        highlights: ['sw1'],
        activeLinks: ['link-sw1-r'],
        packets: [
          { id: 'd2', type: 'data', from: 'sw1', to: 'router', color: 'var(--cyan)', label: 'Frame → Router', duration: 1000 }
        ],
        tables: {
          'sw1': { mac: { 'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A', isNew: true } } }
        }
      },
      {
        title: 'Router strips L2 header, checks routing table',
        explanation: 'The Router receives the frame on eth0 and performs Layer 3 processing:\n\n<strong>1.</strong> Strips the Ethernet header (Hop 1 L2 is discarded)\n<strong>2.</strong> Reads the IP destination: <code>192.168.2.10</code>\n<strong>3.</strong> Checks its <strong>routing table</strong>: 192.168.2.0/24 → eth1\n<strong>4.</strong> Decrements <strong>TTL</strong> (64 → 63)\n<strong>5.</strong> Needs to build a <strong>new</strong> L2 frame for eth1',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (LAN 1)', '192.168.2.0/24': 'eth1 (LAN 2)' } }
        }
      },
      {
        title: 'Router ARPs for PC-C on eth1',
        explanation: 'The Router needs PC-C\'s MAC address to send the frame on the 192.168.2.0/24 network.\n\nIt sends an <strong>ARP Request</strong> broadcast from its eth1 interface:\n<code>"Who has 192.168.2.10? Tell 192.168.2.1"</code>',
        highlights: ['router'],
        activeLinks: ['link-r-sw2'],
        packets: [
          { id: 'arp-r3', type: 'arp-request', from: 'router', to: 'sw2', color: 'var(--amber)', label: 'ARP: Who has 192.168.2.10?', duration: 1000, broadcast: true }
        ],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0', '192.168.2.0/24': 'eth1' } }
        }
      },
      {
        title: 'PC-C replies with its MAC',
        explanation: 'PC-C receives the ARP Request and sends an <strong>ARP Reply</strong>:\n<code>"192.168.2.10 is at AA:BB:CC:DD:EE:02"</code>\n\nThe Router now has PC-C\'s MAC address in its ARP cache.',
        highlights: ['pc-c'],
        activeLinks: ['link-r-sw2'],
        packets: [
          { id: 'arp-r4', type: 'arp-reply', from: 'sw2', to: 'router', color: 'var(--green)', label: 'ARP Reply: AA:BB:CC:DD:EE:02', duration: 1000 }
        ],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0', '192.168.2.0/24': 'eth1' } }
        }
      },
      {
        title: 'Router builds NEW frame (dst MAC = PC-C)',
        explanation: 'The Router constructs a <strong>brand-new</strong> Ethernet frame for the second hop:\n\n<code>Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:02 (PC-C)</code>\n\n<strong>Crucial:</strong> The L2 header is completely new, but the L3 IP addresses remain unchanged — <code>192.168.1.10 → 192.168.2.10</code>.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0', '192.168.2.0/24': 'eth1' } }
        }
      },
      {
        title: 'Frame: Router → Switch 2',
        explanation: 'The Router sends the new frame out eth1 via <strong>link-r-sw2</strong> to Switch 2.\n\nThe frame now carries the Router as source and PC-C as destination at Layer 2.',
        highlights: ['router'],
        activeLinks: ['link-r-sw2'],
        packets: [
          { id: 'd3', type: 'data', from: 'router', to: 'sw2', color: 'var(--cyan)', label: 'Frame → PC-C (new L2)', duration: 1200 }
        ],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0', '192.168.2.0/24': 'eth1' } }
        },
        packetDetails: {
          d3: {
            layers: [
              { name: 'Ethernet II (Hop 2)', color: 'var(--green)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-C)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Router eth1)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4 (unchanged)', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC-A)'],
                ['Destination', '192.168.2.10 (PC-C)'],
                ['TTL', '63 (decremented!)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch 2 forwards to PC-C',
        explanation: 'Switch 2 receives the frame, looks up the destination MAC (AA:BB:CC:DD:EE:02) — found on the port connected to PC-C.\n\nIt <strong>forwards</strong> the frame directly. PC-C receives it, checks the destination IP — it matches! The packet is accepted.',
        highlights: ['sw2', 'pc-c'],
        activeLinks: ['link-sw2-c'],
        packets: [
          { id: 'd4', type: 'data', from: 'sw2', to: 'pc-c', color: 'var(--cyan)', label: 'Frame → PC-C', duration: 1000 }
        ],
        tables: {
          'sw2': { mac: { 'AA:BB:CC:DD:EE:02': { port: 1, label: 'PC-C' } } }
        }
      },
      {
        title: 'Layer 3 routing complete!',
        explanation: 'PC-C accepts the frame — the destination IP matches its own.\n\n<strong>Key takeaway:</strong> At every Layer 3 hop, the <strong>Layer 2 frame is stripped and rebuilt</strong> with new MAC addresses, but the <strong>Layer 3 IP addresses stay the same</strong> from source to destination.\n\nHop 1: PC-A → Router (MAC changes, IP same)\nHop 2: Router → PC-C (MAC changes again, IP still same)\n\nThis is the fundamental difference between Layer 2 (local delivery via MAC) and Layer 3 (end-to-end delivery via IP).',
        highlights: ['pc-a', 'sw1', 'router', 'sw2', 'pc-c'],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } },
          'router': { routing: { '192.168.1.0/24': 'eth0 (LAN 1)', '192.168.2.0/24': 'eth1 (LAN 2)' } },
          'pc-c': { routing: { 'default': '192.168.2.1 (Router)' } }
        }
      }
    ]
  },
  {
    id: 'dns',
    name: 'DNS',
    icon: '🔍',
    description: 'Domain Name System — how names become IP addresses',
    category: 'Networking Fundamentals',
    order: 16,
    topology: {
      devices: [
        { id: 'pc', type: 'computer', name: 'PC', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 150, y: 280 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 500, y: 160 },
        { id: 'dns-server', type: 'server', name: 'DNS Server', ip: '8.8.8.8', mac: 'AA:BB:CC:DD:EE:FF', x: 850, y: 280 }
      ],
      links: [
        { id: 'link-pc-sw', from: 'pc', to: 'switch' },
        { id: 'link-sw-dns', from: 'switch', to: 'dns-server' }
      ]
    },
    steps: [
      {
        title: 'User types google.com in browser',
        explanation: 'The user opens a browser and types <strong>google.com</strong> in the address bar.\n\nThe computer needs to convert this human-readable <strong>domain name</strong> into an IP address. It starts by checking its <strong>local DNS cache</strong> to see if it already knows the answer.\n\n<strong>Note:</strong> DNS resolution happens before most network connections. After DNS, the <strong>TCP Handshake</strong> establishes the connection to the resolved IP.\n\n<strong>See also:</strong> <strong>TCP/UDP Ports</strong> topic — DNS uses port 53.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { dns: { 'google.com': '??? (not resolved)' } }
        }
      },
      {
        title: 'PC checks local DNS cache — miss',
        explanation: 'The PC checks its <strong>local DNS cache</strong> for "google.com".\n\nThe cache is <strong>empty</strong> — this is the first time visiting this site. The PC must now send a <strong>DNS query</strong> to a recursive DNS resolver to look up the IP address.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { dns: { 'google.com': '??? (not resolved)' } }
        }
      },
      {
        title: 'PC builds DNS Query (UDP port 53)',
        explanation: 'The PC creates a <strong>DNS query</strong> packet:\n<code>Type: A (IPv4 address request)</code>\n<code>Name: google.com</code>\n\nThe query will travel from PC → Switch → DNS Server (8.8.8.8) using UDP port 53.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { dns: { 'google.com': '??? (not resolved)' } }
        },
        packetDetails: {
          dnsq: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (DNS Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC)'],
                ['Destination', '8.8.8.8 (DNS Server)'],
                ['Protocol', 'UDP (17)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '54321'],
                ['Destination', '53 (DNS)']
              ]},
              { name: 'DNS Query', color: 'var(--purple)', fields: [
                ['Type', 'A (Host Address)'],
                ['Name', 'google.com']
              ]}
            ]
          }
        }
      },
      {
        title: 'DNS Query: PC → Switch',
        explanation: 'The PC sends the DNS query frame to the Switch.\n<code>Src MAC: AA:BB:CC:DD:EE:01 (PC)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:FF (DNS Server)</code>\n\nThe Switch receives the frame and will forward it toward the DNS Server.',
        highlights: ['pc'],
        activeLinks: ['link-pc-sw'],
        packets: [
          { id: 'dns1', type: 'query', from: 'pc', to: 'switch', color: 'var(--purple)', label: 'DNS Query: google.com?', duration: 1200 }
        ],
        tables: {
          'pc': { dns: { 'google.com': '??? (not resolved)' } }
        },
        packetDetails: {
          dns1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (DNS Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC)'],
                ['Destination', '8.8.8.8 (DNS Server)'],
                ['Protocol', 'UDP (17)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '54321'],
                ['Destination', '53 (DNS)']
              ]},
              { name: 'DNS Query', color: 'var(--purple)', fields: [
                ['Type', 'A (Host Address)'],
                ['Name', 'google.com']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards to DNS Server',
        explanation: 'The Switch receives the frame and looks up the destination MAC in its forwarding table.\n\nThe DNS Server (AA:BB:CC:DD:EE:FF) is reachable on the port connected to it. The Switch <strong>forwards</strong> the frame directly to the DNS Server.',
        highlights: ['switch'],
        activeLinks: ['link-sw-dns'],
        packets: [
          { id: 'dns2', type: 'query', from: 'switch', to: 'dns-server', color: 'var(--purple)', label: 'DNS Query', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'DNS Server looks up A record',
        explanation: 'The DNS Server receives the query for <strong>google.com</strong>.\n\nIt looks up the <strong>A record</strong> in its zone files and finds the IP address: <code>142.250.80.46</code>\n\nThe DNS Server builds a response with the resolved IP address.',
        highlights: ['dns-server'],
        packets: [],
        tables: {
          'dns-server': {
            dnsRecords: { 'google.com': { ip: '142.250.80.46', type: 'A', ttl: '300s', isNew: true } }
          }
        }
      },
      {
        title: 'DNS Reply: Server → Switch',
        explanation: 'The DNS Server sends back a <strong>DNS response</strong>:\n<code>Type: A</code>\n<code>Name: google.com</code>\n<code>IP: 142.250.80.46</code>\n<code>TTL: 300 seconds</code>\n\nThe reply travels from DNS Server → Switch.',
        highlights: ['dns-server'],
        activeLinks: ['link-sw-dns'],
        packets: [
          { id: 'dns3', type: 'reply', from: 'dns-server', to: 'switch', color: 'var(--green)', label: 'DNS Reply: 142.250.80.46', duration: 1000 }
        ],
        tables: {
          'dns-server': {
            dnsRecords: { 'google.com': { ip: '142.250.80.46', type: 'A', ttl: '300s' } }
          }
        },
        packetDetails: {
          dns3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (PC)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (DNS Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '8.8.8.8 (DNS Server)'],
                ['Destination', '192.168.1.10 (PC)'],
                ['Protocol', 'UDP (17)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', '53 (DNS)'],
                ['Destination', '54321']
              ]},
              { name: 'DNS Response', color: 'var(--green)', fields: [
                ['Type', 'A (Host Address)'],
                ['Name', 'google.com'],
                ['IP Address', '142.250.80.46'],
                ['TTL', '300 seconds']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards Reply to PC',
        explanation: 'The Switch receives the DNS reply and looks up the destination MAC (AA:BB:CC:DD:EE:01 — PC).\n\nIt forwards the frame out the port connected to the PC.',
        highlights: ['switch'],
        activeLinks: ['link-pc-sw'],
        packets: [
          { id: 'dns4', type: 'reply', from: 'switch', to: 'pc', color: 'var(--green)', label: 'DNS Reply', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'PC caches IP address',
        explanation: 'The PC receives the DNS reply and <strong>caches</strong> the result:\n<code>google.com → 142.250.80.46</code>\n\nThis entry will stay in the cache for <strong>300 seconds</strong> (the TTL). Future visits to this domain won\'t need another DNS lookup!',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': {
            dns: {
              'google.com': { ip: '142.250.80.46', ttl: '300s', isNew: true }
            }
          }
        }
      },
      {
        title: 'DNS Resolution complete!',
        explanation: '<strong>Key takeaway:</strong> DNS translates human-readable domain names into IP addresses that computers can use.\n\nThe process involved:\n1. Checking the <strong>local cache</strong> — miss!\n2. Building a <strong>DNS Query</strong> (UDP port 53)\n3. Query travels PC → Switch → DNS Server\n4. DNS Server looks up the <strong>A record</strong>\n5. Reply travels DNS Server → Switch → PC\n6. PC <strong>caches</strong> the result with a TTL\n\nWithout DNS, you\'d have to remember IP addresses like <code>142.250.80.46</code> instead of typing <code>google.com</code>!',
        highlights: ['pc', 'switch', 'dns-server'],
        tables: {
          'pc': {
            dns: {
              'google.com': { ip: '142.250.80.46', ttl: '300s' }
            }
          },
          'dns-server': {
            dnsRecords: { 'google.com': { ip: '142.250.80.46', type: 'A', ttl: '300s' } }
          }
        }
      }
    ]
  },
  {
    id: 'tcp',
    name: 'TCP Handshake',
    icon: '🤝',
    description: 'TCP 3-Way Handshake — how connections are established',
    category: 'Networking Fundamentals',
    order: 17,
    topology: {
      devices: [
        { id: 'client', type: 'computer', name: 'Client', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 200, y: 280 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 500, y: 160 },
        { id: 'server', type: 'server', name: 'Web Server', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:FF', x: 800, y: 280 }
      ],
      links: [
        { id: 'link-c-sw', from: 'client', to: 'switch' },
        { id: 'link-sw-s', from: 'switch', to: 'server' }
      ]
    },
    steps: [
      {
        title: 'Client wants to connect to Web Server',
        explanation: 'The Client wants to fetch a web page from the <strong>Web Server</strong> (192.168.1.20).\n\nBefore any data can be exchanged, TCP requires a <strong>3-way handshake</strong> to establish a reliable connection. Both sides must agree on initial sequence numbers.\n\n<strong>Prerequisite:</strong> DNS resolution must happen first to get the server\'s IP address. See the <strong>DNS</strong> topic.\n\n<strong>See also:</strong> <strong>TCP/UDP Ports</strong> topic for port numbers used in the handshake.',
        highlights: ['client'],
        packets: [],
        tables: {}
      },
      {
        title: 'Client builds SYN (Seq=1000)',
        explanation: 'The Client initiates the handshake by building a <strong>SYN</strong> (Synchronize) segment:\n<code>SYN=1, Seq=1000</code>\n\nThis tells the server: "I want to connect, and my starting sequence number is <strong>1000</strong>."',
        highlights: ['client'],
        packets: [],
        tables: {},
        packetDetails: {
          syn: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Client)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--blue)', fields: [
                ['Source Port', '49152'],
                ['Destination', '80 (HTTP)'],
                ['Flags', 'SYN'],
                ['Seq', '1000']
              ]}
            ]
          }
        }
      },
      {
        title: 'SYN: Client → Switch',
        explanation: 'The Client sends the SYN segment to the Switch.\n<code>Src MAC: AA:BB:CC:DD:EE:01 (Client)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)</code>\n\nThe Switch receives the frame and will forward it toward the Server.',
        highlights: ['client'],
        activeLinks: ['link-c-sw'],
        packets: [
          { id: 'syn', type: 'control', from: 'client', to: 'switch', color: 'var(--blue)', label: 'SYN (Seq=1000)', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          syn: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Client)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--blue)', fields: [
                ['Source Port', '49152'],
                ['Destination', '80 (HTTP)'],
                ['Flags', 'SYN'],
                ['Seq', '1000']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards SYN to Server',
        explanation: 'The Switch looks up the destination MAC and forwards the SYN frame to the Web Server.',
        highlights: ['switch'],
        activeLinks: ['link-sw-s'],
        packets: [
          { id: 'syn2', type: 'control', from: 'switch', to: 'server', color: 'var(--blue)', label: 'SYN (Seq=1000)', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Server receives SYN, builds SYN-ACK',
        explanation: 'The Web Server receives the SYN and builds a <strong>SYN-ACK</strong>:\n<code>SYN=1, ACK=1, Seq=5000, Ack=1001</code>\n\nThis means: "I acknowledge your SYN (Ack=<strong>1001</strong> = your Seq + 1), and my starting sequence number is <strong>5000</strong>."',
        highlights: ['server'],
        packets: [],
        tables: {},
        packetDetails: {
          synack: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20 (Web Server)'],
                ['Destination', '192.168.1.10 (Client)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--purple)', fields: [
                ['Source Port', '80 (HTTP)'],
                ['Destination', '49152'],
                ['Flags', 'SYN, ACK'],
                ['Seq', '5000'],
                ['Ack', '1001']
              ]}
            ]
          }
        }
      },
      {
        title: 'SYN-ACK: Server → Switch',
        explanation: 'The Web Server sends the SYN-ACK segment to the Switch.\n<code>Src MAC: AA:BB:CC:DD:EE:FF (Server)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:01 (Client)</code>',
        highlights: ['server'],
        activeLinks: ['link-sw-s'],
        packets: [
          { id: 'synack1', type: 'control', from: 'server', to: 'switch', color: 'var(--purple)', label: 'SYN-ACK (Seq=5000, Ack=1001)', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          synack1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20 (Web Server)'],
                ['Destination', '192.168.1.10 (Client)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--purple)', fields: [
                ['Source Port', '80 (HTTP)'],
                ['Destination', '49152'],
                ['Flags', 'SYN, ACK'],
                ['Seq', '5000'],
                ['Ack', '1001']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards SYN-ACK to Client',
        explanation: 'The Switch looks up the destination MAC (Client) and forwards the SYN-ACK frame.',
        highlights: ['switch'],
        activeLinks: ['link-c-sw'],
        packets: [
          { id: 'synack2', type: 'control', from: 'switch', to: 'client', color: 'var(--purple)', label: 'SYN-ACK', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Client builds final ACK (Ack=5001)',
        explanation: 'The Client receives the SYN-ACK and builds the final <strong>ACK</strong>:\n<code>ACK=1, Ack=5001</code>\n\nThis means: "I acknowledge your SYN (Ack=<strong>5001</strong> = your Seq + 1)." The 3-way handshake is complete!',
        highlights: ['client'],
        packets: [],
        tables: {},
        packetDetails: {
          ack: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Client)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--green)', fields: [
                ['Source Port', '49152'],
                ['Destination', '80 (HTTP)'],
                ['Flags', 'ACK'],
                ['Ack', '5001']
              ]}
            ]
          }
        }
      },
      {
        title: 'ACK: Client → Switch',
        explanation: 'The Client sends the final ACK to the Switch. The TCP 3-way handshake is now complete — a reliable connection is established!',
        highlights: ['client'],
        activeLinks: ['link-c-sw'],
        packets: [
          { id: 'ack1', type: 'control', from: 'client', to: 'switch', color: 'var(--green)', label: 'ACK (Ack=5001)', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          ack1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Client)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--green)', fields: [
                ['Source Port', '49152'],
                ['Destination', '80 (HTTP)'],
                ['Flags', 'ACK'],
                ['Ack', '5001']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards ACK to Server',
        explanation: 'The Switch forwards the ACK frame to the Web Server. Both sides have agreed on sequence numbers — the connection is established!',
        highlights: ['switch'],
        activeLinks: ['link-sw-s'],
        packets: [
          { id: 'ack2', type: 'control', from: 'switch', to: 'server', color: 'var(--green)', label: 'ACK', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Connection established! HTTP GET sent',
        explanation: 'Now that the TCP connection is established, the Client sends an <strong>HTTP GET</strong> request:\n<code>GET / HTTP/1.1</code>\n<code>Host: web-server</code>\n\nTCP ensures this data arrives reliably and in order.',
        highlights: ['client'],
        activeLinks: ['link-c-sw', 'link-sw-s'],
        packets: [
          { id: 'http', type: 'data', from: 'client', to: 'server', color: 'var(--cyan)', label: 'HTTP GET /', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          http: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Client)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--green)', fields: [
                ['Source Port', '49152'],
                ['Destination', '80 (HTTP)'],
                ['Seq', '1001'],
                ['Ack', '5001']
              ]},
              { name: 'HTTP', color: 'var(--cyan)', fields: [
                ['Method', 'GET'],
                ['Path', '/'],
                ['Version', 'HTTP/1.1'],
                ['Host', 'web-server']
              ]}
            ]
          }
        }
      },
      {
        title: 'Server responds HTTP 200 OK',
        explanation: 'The Web Server processes the request and sends back an <strong>HTTP response</strong>:\n<code>HTTP/1.1 200 OK</code>\n<code>Content-Type: text/html</code>\n\nTCP guarantees the response data arrives intact and in order.',
        highlights: ['server'],
        activeLinks: ['link-sw-s', 'link-c-sw'],
        packets: [
          { id: 'httpresp', type: 'data', from: 'server', to: 'client', color: 'var(--cyan)', label: 'HTTP 200 OK', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          httpresp: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Client)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20 (Web Server)'],
                ['Destination', '192.168.1.10 (Client)'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--green)', fields: [
                ['Source Port', '80 (HTTP)'],
                ['Destination', '49152'],
                ['Seq', '5001'],
                ['Ack', '1101']
              ]},
              { name: 'HTTP', color: 'var(--cyan)', fields: [
                ['Status', '200 OK'],
                ['Content-Type', 'text/html'],
                ['Body', '<html>...']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'nat',
    name: 'NAT',
    icon: '🔄',
    description: 'Network Address Translation — private to public IP mapping',
    category: 'Networking Fundamentals',
    order: 18,
    topology: {
      devices: [
        { id: 'pc-1', type: 'computer', name: 'PC-1', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 100, y: 320 },
        { id: 'pc-2', type: 'computer', name: 'PC-2', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:02', x: 100, y: 160 },
        { id: 'sw1', type: 'switch', name: 'LAN Switch', x: 300, y: 240 },
        { id: 'router', type: 'router', name: 'NAT Router', ip: '192.168.1.1 / 203.0.113.1', mac: 'AA:BB:CC:DD:EE:FF', x: 550, y: 240 },
        { id: 'internet', type: 'server', name: 'Web Server', ip: '93.184.216.34', mac: '11:22:33:44:55:66', x: 850, y: 240 }
      ],
      links: [
        { id: 'link-pc1', from: 'pc-1', to: 'sw1' },
        { id: 'link-pc2', from: 'pc-2', to: 'sw1' },
        { id: 'link-sw-r', from: 'sw1', to: 'router' },
        { id: 'link-r-net', from: 'router', to: 'internet' }
      ]
    },
    steps: [
      {
        title: 'PC-1 wants to access the internet',
        explanation: 'PC-1 (192.168.1.10) wants to reach a Web Server at <code>93.184.216.34</code> on the internet.\n\nPC-1 uses a <strong>private IP address</strong> (192.168.1.x). Private IPs can\'t be routed on the public internet — the <strong>NAT Router</strong> must translate the address.\n\n<strong>Prerequisite:</strong> Understand <strong>Default Gateway</strong> (how packets reach the router) and <strong>Layer 3</strong> (how routers forward packets) first.',
        highlights: ['pc-1'],
        packets: [],
        tables: {
          'router': { nat: {} }
        }
      },
      {
        title: 'PC-1 sends packet to default gateway',
        explanation: 'PC-1 creates a packet destined for the Web Server:\n<code>Src IP: 192.168.1.10:49152</code>\n<code>Dst IP: 93.184.216.34:80</code>\n\nThe packet arrives at the NAT Router with the <strong>private source address</strong> intact.',
        highlights: ['pc-1'],
        packets: [],
        tables: {
          'router': { nat: {} }
        },
        packetDetails: {
          natpre: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (NAT Router)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-1)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10:49152'],
                ['Destination', '93.184.216.34:80'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Packet: PC-1 → Switch',
        explanation: 'The packet travels from PC-1 to the LAN Switch on its way to the NAT Router.',
        highlights: ['pc-1'],
        activeLinks: ['link-pc1-sw'],
        packets: [
          { id: 'nat1', type: 'data', from: 'pc-1', to: 'sw1', color: 'var(--cyan)', label: '192.168.1.10 → 93.184.216.34', duration: 1200 }
        ],
        tables: {
          'router': { nat: {} }
        },
        packetDetails: {
          nat1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (NAT Router)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-1)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10:49152'],
                ['Destination', '93.184.216.34:80'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards to Router',
        explanation: 'The LAN Switch receives the frame and forwards it to the NAT Router on its LAN interface.',
        highlights: ['sw1'],
        activeLinks: ['link-sw-r'],
        packets: [
          { id: 'nat2', type: 'data', from: 'sw1', to: 'router', color: 'var(--cyan)', label: 'To NAT Router', duration: 1000 }
        ],
        tables: {
          'router': { nat: {} }
        }
      },
      {
        title: 'Router performs NAT translation',
        explanation: 'The NAT Router receives the packet and <strong>translates</strong> the private source IP to its public IP:\n<code>192.168.1.10:49152 → 203.0.113.1:40001</code>\n\nIt creates a <strong>NAT mapping entry</strong> so it can route the response back to PC-1 later.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active',
                isNew: true
              }
            }
          }
        },
        packetDetails: {
          natbefore: {
            layers: [
              { name: 'IPv4 (Before NAT)', color: 'var(--red)', fields: [
                ['Source IP', '192.168.1.10:49152'],
                ['Destination', '93.184.216.34:80']
              ]}
            ]
          },
          natafter: {
            layers: [
              { name: 'IPv4 (After NAT)', color: 'var(--green)', fields: [
                ['Source IP', '203.0.113.1:40001 (translated!)'],
                ['Destination', '93.184.216.34:80']
              ]}
            ]
          }
        }
      },
      {
        title: 'Translated: Router → Web Server',
        explanation: 'The Router forwards the translated packet toward the Web Server on the internet.\n<code>Src: 203.0.113.1:40001</code>\n<code>Dst: 93.184.216.34:80</code>\n\nThe server will see the <strong>public IP</strong>, not the private one.',
        highlights: ['router'],
        activeLinks: ['link-r-net'],
        packets: [
          { id: 'nat3', type: 'data', from: 'router', to: 'internet', color: 'var(--green)', label: '203.0.113.1:40001 → 93.184.216.34', duration: 1200 }
        ],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        },
        packetDetails: {
          nat3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', '11:22:33:44:55:66 (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (NAT Router)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--green)', fields: [
                ['Source IP', '203.0.113.1:40001 (translated!)'],
                ['Destination', '93.184.216.34:80'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Web Server responds to public IP',
        explanation: 'The Web Server receives the packet from <code>203.0.113.1:40001</code> and responds:\n<code>Src IP: 93.184.216.34:80</code>\n<code>Dst IP: 203.0.113.1:40001</code>\n\nThe server has <strong>no idea</strong> about the private IP 192.168.1.10 — it only sees the public address.',
        highlights: ['internet'],
        packets: [],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        },
        packetDetails: {
          natresppre: {
            layers: [
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '93.184.216.34:80'],
                ['Destination', '203.0.113.1:40001'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Response: Web Server → Router',
        explanation: 'The Web Server sends its response back to the NAT Router\'s public IP.',
        highlights: ['internet'],
        activeLinks: ['link-r-net'],
        packets: [
          { id: 'nat4', type: 'data', from: 'internet', to: 'router', color: 'var(--cyan)', label: '93.184.216.34 → 203.0.113.1:40001', duration: 1200 }
        ],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        },
        packetDetails: {
          nat4: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (NAT Router)'],
                ['Source', '11:22:33:44:55:66 (Web Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '93.184.216.34:80'],
                ['Destination', '203.0.113.1:40001'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Router translates destination back',
        explanation: 'The NAT Router receives the response and looks up the mapping:\n<code>203.0.113.1:40001 → 192.168.1.10:49152</code>\n\nIt replaces the destination with the <strong>original private IP</strong> and forwards the packet to PC-1.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        },
        packetDetails: {
          natrespbefore: {
            layers: [
              { name: 'IPv4 (Before NAT)', color: 'var(--red)', fields: [
                ['Source IP', '93.184.216.34:80'],
                ['Destination', '203.0.113.1:40001']
              ]}
            ]
          },
          natrespafter: {
            layers: [
              { name: 'IPv4 (After NAT)', color: 'var(--green)', fields: [
                ['Source IP', '93.184.216.34:80'],
                ['Destination', '192.168.1.10:49152 (translated back!)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Translated: Router → Switch',
        explanation: 'The Router forwards the translated response to the LAN Switch.\n<code>Dst: 192.168.1.10:49152</code>',
        highlights: ['router'],
        activeLinks: ['link-sw-r'],
        packets: [
          { id: 'nat5', type: 'data', from: 'router', to: 'sw1', color: 'var(--green)', label: '→ 192.168.1.10:49152', duration: 1000 }
        ],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        },
        packetDetails: {
          nat5: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (PC-1)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (NAT Router)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--green)', fields: [
                ['Source IP', '93.184.216.34:80'],
                ['Destination', '192.168.1.10:49152 (translated back!)'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch delivers to PC-1',
        explanation: 'The LAN Switch looks up the destination MAC and delivers the response frame to PC-1.',
        highlights: ['sw1'],
        activeLinks: ['link-pc1-sw'],
        packets: [
          { id: 'nat6', type: 'data', from: 'sw1', to: 'pc-1', color: 'var(--green)', label: 'Delivered to PC-1', duration: 1000 }
        ],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        }
      },
      {
        title: 'NAT complete!',
        explanation: '<strong>Key takeaway:</strong> NAT translates <strong>private IPs to public IPs</strong> and back, allowing many devices to share one public address.\n\nHow it worked:\n1. PC-1 sent with <strong>private source IP</strong>\n2. Switch forwarded to Router\n3. Router <strong>replaced source</strong> with its public IP + new port\n4. Router <strong>recorded a mapping</strong> (private ↔ public)\n5. Server responded to the <strong>public IP</strong>\n6. Router <strong>looked up mapping</strong> and replaced destination\n7. Switch delivered to PC-1\n\nThis conserves public IPv4 addresses — a single public IP can serve hundreds of devices behind NAT.',
        highlights: ['pc-1', 'sw1', 'router', 'internet'],
        tables: {
          'router': {
            nat: {
              '203.0.113.1:40001': {
                internal: '192.168.1.10:49152',
                status: 'active'
              }
            }
          }
        }
      }
    ]
  },

  {
    id: 'vlan',
    name: 'VLAN',
    icon: '🏢',
    description: 'Virtual LANs — segmenting networks logically',
    category: 'Networking Fundamentals',
    order: 19,
    topology: {
      devices: [
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.10.10', mac: 'AA:BB:CC:DD:EE:01', x: 150, y: 350 },
        { id: 'pc-b', type: 'computer', name: 'PC-B', ip: '192.168.10.20', mac: 'AA:BB:CC:DD:EE:02', x: 150, y: 150 },
        { id: 'pc-c', type: 'computer', name: 'PC-C', ip: '192.168.20.10', mac: 'AA:BB:CC:DD:EE:03', x: 500, y: 350 },
        { id: 'pc-d', type: 'computer', name: 'PC-D', ip: '192.168.20.20', mac: 'AA:BB:CC:DD:EE:04', x: 500, y: 150 },
        { id: 'vlan-switch', type: 'switch', name: 'VLAN Switch', x: 325, y: 250 }
      ],
      links: [
        { id: 'link-a', from: 'pc-a', to: 'vlan-switch' },
        { id: 'link-b', from: 'pc-b', to: 'vlan-switch' },
        { id: 'link-c', from: 'pc-c', to: 'vlan-switch' },
        { id: 'link-d', from: 'pc-d', to: 'vlan-switch' }
      ]
    },
    steps: [
      {
        title: '4 PCs, 2 VLANs on one switch',
        explanation: 'All four PCs are connected to the <strong>same physical switch</strong>, but the switch has been configured to create <strong>two VLANs</strong>:\n\n• <strong>VLAN 10</strong>: PC-A (Port 1) and PC-B (Port 2)\n• <strong>VLAN 20</strong>: PC-C (Port 3) and PC-D (Port 4)\n\nVLANs <strong>logically segment</strong> the network — even though all devices share one switch, they are isolated into separate broadcast domains.\n\n<strong>Prerequisite:</strong> Understand <strong>Layer 2</strong> (how switches forward frames) first. VLANs extend switching with logical segmentation.',
        highlights: [],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'VLAN assignments: PC-A,B = VLAN 10; PC-C,D = VLAN 20',
        explanation: 'The VLAN table on the switch is fully configured:\n\n<code>Port 1 → VLAN 10 (PC-A)</code>\n<code>Port 2 → VLAN 10 (PC-B)</code>\n<code>Port 3 → VLAN 20 (PC-C)</code>\n<code>Port 4 → VLAN 20 (PC-D)</code>\n\nFrames within the same VLAN can communicate. Frames across different VLANs are <strong>blocked</strong> at Layer 2.',
        highlights: [],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'PC-A (VLAN 10) sends to PC-B (VLAN 10)',
        explanation: 'PC-A (VLAN 10) wants to send data to PC-B (also VLAN 10).\n\nSince both are in the <strong>same VLAN</strong>, the switch will forward the frame normally. The VLAN tag is <strong>internal</strong> to the switch — PC-A doesn\'t need to know about VLANs.',
        highlights: ['pc-a'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'v1', type: 'data', from: 'pc-a', to: 'vlan-switch', color: 'var(--cyan)', label: 'Frame to PC-B (VLAN 10)', duration: 1200 }
        ],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        },
        packetDetails: {
          v1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.10.10 (PC-A)'],
                ['Destination', '192.168.10.20 (PC-B)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch receives untagged frame, assigns VLAN 10',
        explanation: 'The switch receives the frame on Port 1. Since the port is an <strong>access port</strong> in VLAN 10, the switch internally tags the frame with <strong>VLAN 10</strong>.\n\nThe 802.1Q tag is inserted into the Ethernet header:\n<code>TPID: 0x8100</code>\n<code>VID: 10</code>',
        highlights: ['vlan-switch'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        },
        packetDetails: {
          v1tag: {
            layers: [
              { name: 'Ethernet II + 802.1Q', color: 'var(--purple)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['802.1Q TPID', '0x8100'],
                ['VLAN ID', '10'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.10.10 (PC-A)'],
                ['Destination', '192.168.10.20 (PC-B)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Same VLAN — forwards to PC-B',
        explanation: 'The switch checks its VLAN table:\n• Source port (Port 1) is in <strong>VLAN 10</strong>\n• Destination MAC (PC-B) is on Port 2 — also in <strong>VLAN 10</strong>\n\n<strong>Same VLAN → forward!</strong> The switch strips the VLAN tag and delivers the frame to PC-B.',
        highlights: ['vlan-switch'],
        activeLinks: ['link-b'],
        packets: [
          { id: 'v2', type: 'data', from: 'vlan-switch', to: 'pc-b', color: 'var(--green)', label: 'VLAN 10 → PC-B', duration: 1000 }
        ],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'PC-B receives successfully',
        explanation: '<strong>PC-B</strong> receives the frame, sees the destination MAC matches its own — it <strong>accepts</strong> the frame.\n\nCommunication within the same VLAN works exactly like a normal switch — VLANs are transparent to the end devices.',
        highlights: ['pc-b'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'PC-A sends to PC-C (VLAN 20)',
        explanation: 'Now PC-A (VLAN 10) tries to send data to PC-C (VLAN 20).\n\nPC-A doesn\'t know about VLANs — it just sends the frame to the switch. The switch will check the VLAN configuration.',
        highlights: ['pc-a'],
        activeLinks: ['link-a'],
        packets: [
          { id: 'v3', type: 'data', from: 'pc-a', to: 'vlan-switch', color: 'var(--cyan)', label: 'Frame to PC-C', duration: 1200 }
        ],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'Switch assigns VLAN 10 from PC-A\'s port',
        explanation: 'The switch receives the frame on Port 1 (an access port in <strong>VLAN 10</strong>). It internally tags the frame as VLAN 10.\n\nNow it looks up the destination MAC (PC-C) in its forwarding table.',
        highlights: ['vlan-switch'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'Checks VLAN table — PC-C is VLAN 20',
        explanation: 'The switch checks its VLAN table:\n• Source port (Port 1) is in <strong>VLAN 10</strong>\n• Destination MAC (PC-C) is on Port 3 — which is in <strong>VLAN 20</strong>\n\n<strong>VLAN 10 ≠ VLAN 20</strong> — the frame cannot be forwarded!',
        highlights: ['vlan-switch'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'BLOCKED! Different VLANs cannot communicate directly',
        explanation: 'The switch <strong>will not forward</strong> the frame.\n\nVLANs create separate <strong>broadcast domains</strong> — traffic cannot cross between them at Layer 2. The frame from PC-A is silently dropped.\n\nPC-A will never reach PC-C without a Layer 3 device.',
        highlights: ['vlan-switch'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'Cross-VLAN needs a Layer 3 router (Router-on-a-Stick)',
        explanation: 'To communicate across VLANs, you need a <strong>Layer 3 device</strong> (router or Layer 3 switch).\n\nThe common approach is <strong>Router-on-a-Stick</strong>: a single router interface with <strong>802.1Q trunk</strong> carrying tagged traffic for multiple VLANs.\n\nThe router has sub-interfaces:\n<code>VLAN 10: 192.168.10.1</code>\n<code>VLAN 20: 192.168.20.1</code>\n\nPC-A sends to the router (its default gateway), and the router forwards to PC-C in VLAN 20.',
        highlights: ['vlan-switch'],
        packets: [],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      },
      {
        title: 'VLAN summary!',
        explanation: '<strong>Key takeaway:</strong> VLANs <strong>logically segment</strong> a physical network into separate broadcast domains.\n\nHow they worked in this scenario:\n1. 4 PCs on one switch, assigned to <strong>VLAN 10 and VLAN 20</strong>\n2. PC-A → PC-B (same VLAN 10) — <strong>forwarded</strong> successfully\n3. PC-A → PC-C (different VLANs) — <strong>BLOCKED</strong> at Layer 2\n4. Cross-VLAN needs a <strong>Layer 3 router</strong> (Router-on-a-Stick with 802.1Q trunk)\n\nBenefits:\n• <strong>Security</strong> — traffic isolation between departments\n• <strong>Reduced broadcast</strong> — smaller broadcast domains\n• <strong>Flexibility</strong> — group users logically, not physically',
        highlights: ['pc-a', 'pc-b', 'pc-c', 'pc-d', 'vlan-switch'],
        tables: {
          'vlan-switch': {
            vlanTable: {
              'Port 1': { vlan: 10, label: 'PC-A' },
              'Port 2': { vlan: 10, label: 'PC-B' },
              'Port 3': { vlan: 20, label: 'PC-C' },
              'Port 4': { vlan: 20, label: 'PC-D' }
            }
          }
        }
      }
    ]
  },

  {
    id: 'nic',
    name: 'Network Interface (NIC)',
    icon: '🔌',
    description: 'How NICs receive, filter, and transmit frames',
    category: 'Linux Core Networking',
    order: 20,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'linux-host', type: 'linux', name: 'Linux Host', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 150, y: 280 },
        { id: 'eth0', type: 'nic', name: 'eth0 (NIC)', mac: 'AA:BB:CC:DD:EE:01', x: 350, y: 280 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 550, y: 280 },
        { id: 'web-server', type: 'server', name: 'Web Server', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:FF', x: 850, y: 280 }
      ],
      links: [
        { id: 'link-host-nic', from: 'linux-host', to: 'eth0' },
        { id: 'link-nic-sw', from: 'eth0', to: 'switch' },
        { id: 'link-sw-srv', from: 'switch', to: 'web-server' }
      ]
    },
    steps: [
      {
        title: 'Web Server sends a frame to Linux Host',
        explanation: 'The <strong>Web Server</strong> (192.168.1.20) has prepared an Ethernet frame destined for the Linux Host (192.168.1.10).\n\nThe frame travels across the network toward the Linux Host\'s NIC. Let\'s see how the NIC processes it step by step.\n\n<strong>Prerequisite:</strong> This topic shows how Linux handles network interfaces at the hardware level.',
        highlights: [],
        packets: [],
        tables: {},
        activeLinks: []
      },
      {
        title: 'Frame arrives at NIC (eth0) from cable',
        explanation: 'The Ethernet frame travels through the cable and arrives at the <strong>Network Interface Controller (eth0)</strong>.\n\nThe NIC\'s physical layer detects the incoming electrical/optical signals and converts them back into digital bits.',
        highlights: [],
        activeLinks: ['link-sw-srv'],
        packets: [
          { id: 'f1', type: 'data', from: 'switch', to: 'eth0', color: 'var(--cyan)', label: 'Incoming Frame', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          f1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01 (Linux Host)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20 (Web Server)'],
                ['Destination', '192.168.1.10 (Linux Host)'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'NIC checks destination MAC',
        explanation: 'The NIC inspects the <strong>destination MAC address</strong> in the Ethernet header:\n\n<code>Dst MAC: AA:BB:CC:DD:EE:01</code>\n\nThe NIC compares this against its own MAC address. This is called <strong>MAC filtering</strong> — the NIC only accepts frames addressed to it (or broadcast/multicast frames).',
        highlights: ['eth0'],
        packets: [],
        tables: {}
      },
      {
        title: 'NIC accepts — MAC matches eth0',
        explanation: 'The destination MAC <strong>matches</strong> eth0\'s MAC address! The NIC accepts the frame.\n\nIf the MAC didn\'t match, the NIC would <strong>silently discard</strong> the frame without interrupting the CPU. This filtering happens in hardware — it\'s extremely fast.',
        highlights: ['eth0'],
        packets: [],
        tables: {}
      },
      {
        title: 'NIC strips Ethernet header, passes payload up',
        explanation: 'The NIC removes the <strong>Ethernet II header and trailer</strong> (FCS/CRC check passed).\n\nThe remaining payload — an <strong>IPv4 packet</strong> — is passed up to the network stack via a <strong>DMA (Direct Memory Access)</strong> transfer into the kernel\'s receive ring buffer.',
        highlights: ['eth0'],
        packets: [],
        tables: {},
        packetDetails: {
          demux: {
            layers: [
              { name: 'Ethernet II (stripped)', color: 'var(--text-muted)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:01'],
                ['Source', 'AA:BB:CC:DD:EE:FF'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4 (passed up)', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.20 (Web Server)'],
                ['Destination', '192.168.1.10 (Linux Host)'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Kernel receives IP packet',
        explanation: 'The NIC triggers a <strong>hardware interrupt (IRQ)</strong> to notify the Linux kernel that a packet has arrived.\n\nThe kernel\'s NIC driver processes the interrupt, reads the packet from the DMA ring buffer, and passes it up through the network stack:\n<code>NIC Driver → IP Layer → TCP → Application</code>',
        highlights: ['linux-host'],
        packets: [],
        tables: {}
      },
      {
        title: 'Now Linux Host sends a reply',
        explanation: 'The Linux Host has processed the incoming data and generated a <strong>reply</strong>.\n\nThe application passes the response data down through the network stack toward the NIC for transmission.',
        highlights: ['linux-host'],
        packets: [],
        tables: {}
      },
      {
        title: 'Kernel passes data down to NIC',
        explanation: 'The kernel\'s network stack hands the outgoing packet to the <strong>NIC driver</strong>, which places it into the NIC\'s <strong>TX (transmit) queue</strong>.\n\nThe NIC is now responsible for building the Ethernet frame and transmitting it on the wire.',
        highlights: ['eth0'],
        packets: [],
        tables: {}
      },
      {
        title: 'NIC builds frame, adds MAC header',
        explanation: 'The NIC constructs a new <strong>Ethernet II frame</strong>:\n<code>Src MAC: AA:BB:CC:DD:EE:01 (eth0)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)</code>\n\nIt appends the Ethernet header and calculates the <strong>FCS (Frame Check Sequence)</strong> for error detection.',
        highlights: ['eth0'],
        packets: [],
        tables: {},
        packetDetails: {
          f2: {
            layers: [
              { name: 'Ethernet II (new frame)', color: 'var(--green)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (eth0)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Linux Host)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      },
      {
        title: 'NIC transmits frame onto cable',
        explanation: 'The NIC converts the digital frame into <strong>electrical signals</strong> (or optical pulses) and transmits them onto the physical cable.\n\nThe frame travels through the switch and reaches the Web Server.',
        highlights: ['eth0'],
        activeLinks: ['link-nic-sw'],
        packets: [
          { id: 'f2', type: 'data', from: 'eth0', to: 'switch', color: 'var(--green)', label: 'Outgoing Frame', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          f2: {
            layers: [
              { name: 'Ethernet II', color: 'var(--green)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Web Server)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (eth0)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Linux Host)'],
                ['Destination', '192.168.1.20 (Web Server)'],
                ['Protocol', 'TCP (6)']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'stack',
    name: 'Network Stack',
    icon: '📚',
    description: 'TCP/IP stack layers and packet flow through the kernel',
    category: 'Linux Core Networking',
    order: 21,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'user-app', type: 'linux', name: 'User App', ip: '192.168.1.10', x: 150, y: 100 },
        { id: 'socket-api', type: 'linux', name: 'Socket API', x: 150, y: 200 },
        { id: 'tcp-layer', type: 'linux', name: 'TCP Layer', x: 150, y: 300 },
        { id: 'ip-layer', type: 'linux', name: 'IP Layer', x: 150, y: 400 },
        { id: 'eth0', type: 'nic', name: 'eth0 (NIC)', mac: 'AA:BB:CC:DD:EE:01', x: 350, y: 400 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 550, y: 400 },
        { id: 'remote-server', type: 'server', name: 'Remote Server', ip: '10.0.0.50', mac: '11:22:33:44:55:66', x: 850, y: 400 }
      ],
      links: [
        { id: 'link-app-sock', from: 'user-app', to: 'socket-api' },
        { id: 'link-sock-tcp', from: 'socket-api', to: 'tcp-layer' },
        { id: 'link-tcp-ip', from: 'tcp-layer', to: 'ip-layer' },
        { id: 'link-ip-nic', from: 'ip-layer', to: 'eth0' },
        { id: 'link-nic-sw', from: 'eth0', to: 'switch' },
        { id: 'link-sw-srv', from: 'switch', to: 'remote-server' }
      ]
    },
    steps: [
      {
        title: 'App wants to send data to remote server',
        explanation: 'A <strong>user application</strong> (e.g., curl, browser) wants to send data to a remote server at <code>10.0.0.50</code>.\n\nThe data must travel down through each layer of the <strong>TCP/IP network stack</strong> before it can be transmitted on the wire.\n\n<strong>Prerequisite:</strong> Understand the <strong>TCP Handshake</strong> and <strong>DNS</strong> topics to see how applications use the stack.\n\n<strong>See also:</strong> <strong>TCP/UDP Ports</strong> and <strong>IP Address</strong> topics for the headers at each layer.',
        highlights: ['user-app'],
        packets: [],
        tables: {}
      },
      {
        title: 'Application calls send() — data enters Socket API',
        explanation: 'The application calls the <code>send()</code> system call. The data enters the <strong>Socket API</strong> layer — the boundary between user space and kernel space.\n\nThe Socket API provides a standardized interface for network communication.',
        highlights: ['user-app'],
        activeLinks: ['link-app-sock'],
        packets: [
          { id: 'p1', type: 'data', from: 'user-app', to: 'socket-api', color: 'var(--cyan)', label: 'send(data)', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Socket API passes data to TCP layer',
        explanation: 'The Socket API hands the data to the <strong>TCP layer</strong> in the kernel.\n\nTCP will handle reliability, sequencing, flow control, and congestion management. The data is placed into a TCP segment.',
        highlights: ['socket-api'],
        activeLinks: ['link-sock-tcp'],
        packets: [
          { id: 'p2', type: 'data', from: 'socket-api', to: 'tcp-layer', color: 'var(--cyan)', label: 'TCP Segment', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'TCP adds header: ports, seq/ack numbers',
        explanation: 'The TCP layer wraps the data with a <strong>TCP header</strong>:\n<code>Source Port: 49152</code>\n<code>Dest Port: 80</code>\n<code>Seq: 1000</code>\n<code>Ack: 0</code>\n<code>Flags: SYN</code>\n\nThis segment is now ready to be passed to the IP layer.',
        highlights: ['tcp-layer'],
        packets: [],
        tables: {},
        packetDetails: {
          tcp: {
            layers: [
              { name: 'TCP', color: 'var(--blue)', fields: [
                ['Source Port', '49152'],
                ['Dest Port', '80 (HTTP)'],
                ['Seq', '1000'],
                ['Ack', '0'],
                ['Flags', 'SYN'],
                ['Window', '65535']
              ]}
            ]
          }
        }
      },
      {
        title: 'TCP passes segment to IP layer',
        explanation: 'The TCP segment is passed down to the <strong>IP layer</strong>. IP will wrap it with an IP header for routing across networks.',
        highlights: ['tcp-layer'],
        activeLinks: ['link-tcp-ip'],
        packets: [
          { id: 'p3', type: 'data', from: 'tcp-layer', to: 'ip-layer', color: 'var(--cyan)', label: 'IP Packet', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'IP adds header: src/dst IP, TTL, protocol',
        explanation: 'The IP layer wraps the TCP segment with an <strong>IPv4 header</strong>:\n<code>Src IP: 192.168.1.10</code>\n<code>Dst IP: 10.0.0.50</code>\n<code>TTL: 64</code>\n<code>Protocol: TCP (6)</code>\n\nThe IP packet is now ready for the NIC driver.',
        highlights: ['ip-layer'],
        packets: [],
        tables: {},
        packetDetails: {
          ip: {
            layers: [
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (Local)'],
                ['Destination', '10.0.0.50 (Remote)'],
                ['TTL', '64'],
                ['Protocol', 'TCP (6)'],
                ['Header Checksum', '0x1a2b']
              ]}
            ]
          }
        }
      },
      {
        title: 'IP passes frame to NIC driver',
        explanation: 'The IP layer passes the packet to the <strong>NIC driver</strong>. The driver will hand it to the physical NIC (eth0) for transmission.',
        highlights: ['ip-layer'],
        activeLinks: ['link-ip-nic'],
        packets: [
          { id: 'p4', type: 'data', from: 'ip-layer', to: 'eth0', color: 'var(--cyan)', label: 'Ethernet Frame', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'NIC adds MAC header, transmits on wire',
        explanation: 'The NIC adds the <strong>Ethernet II header</strong> with source and destination MAC addresses, calculates the FCS, and transmits the frame onto the physical wire.\n\n<code>Src MAC: AA:BB:CC:DD:EE:01 (eth0)</code>\n<code>Dst MAC: Default Gateway MAC</code>',
        highlights: ['eth0'],
        activeLinks: ['link-nic-sw'],
        packets: [
          { id: 'p5', type: 'data', from: 'eth0', to: 'switch', color: 'var(--cyan)', label: 'On the Wire', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          wire: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'Gateway MAC'],
                ['Source', 'AA:BB:CC:DD:EE:01 (eth0)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10'],
                ['Destination', '10.0.0.50'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--blue)', fields: [
                ['Source Port', '49152'],
                ['Dest Port', '80'],
                ['Seq', '1000'],
                ['Flags', 'SYN']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards to remote server',
        explanation: 'The <strong>Switch</strong> receives the frame, looks up the destination MAC in its forwarding table, and forwards the frame toward the remote server.',
        highlights: ['switch'],
        activeLinks: ['link-sw-srv'],
        packets: [
          { id: 'p6', type: 'data', from: 'switch', to: 'remote-server', color: 'var(--cyan)', label: 'Frame \u2192 Server', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Server NIC receives frame',
        explanation: 'The <strong>Remote Server\'s NIC</strong> receives the frame, checks the destination MAC — it matches! The NIC strips the Ethernet header and passes the IP packet up to the server\'s network stack.\n\nThe server\'s NIC triggers an interrupt to notify the CPU.',
        highlights: ['remote-server'],
        packets: [],
        tables: {}
      },
      {
        title: 'Server processes UP the stack',
        explanation: 'The Remote Server processes the packet <strong>upward</strong> through its own network stack:\n\n<code>NIC Driver \u2192 IP Layer \u2192 TCP Layer \u2192 Application</code>\n\nEach layer strips its header and passes the payload upward — the reverse of what the sending host did.',
        highlights: ['remote-server'],
        packets: [],
        tables: {}
      },
      {
        title: 'Full journey complete!',
        explanation: '<strong>Key takeaway:</strong> Data travels <strong>DOWN</strong> the sending host\'s stack, across the wire, then <strong>UP</strong> the receiving host\'s stack.\n\nThe journey:\n1. <strong>Application</strong> \u2192 Socket API (<code>send()</code>)\n2. <strong>TCP</strong> adds ports, sequence numbers\n3. <strong>IP</strong> adds source/destination IPs, TTL\n4. <strong>NIC</strong> adds MAC header, transmits\n5. <strong>Switch</strong> forwards to destination\n6. Server NIC receives, strips MAC header\n7. <strong>IP</strong> strips IP header\n8. <strong>TCP</strong> strips TCP header, delivers data\n9. <strong>Application</strong> receives the data!\n\nEach layer only talks to its <strong>peer</strong> on the other side (TCP-to-TCP, IP-to-IP, MAC-to-MAC).',
        highlights: ['user-app', 'socket-api', 'tcp-layer', 'ip-layer', 'eth0', 'switch', 'remote-server'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'route',
    name: 'Route Table',
    icon: '🗺️',
    description: 'Linux routing decisions with ip route',
    category: 'Linux Core Networking',
    order: 22,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'linux-box', type: 'linux', name: 'Linux Box', x: 400, y: 200 },
        { id: 'eth0', type: 'nic', name: 'eth0', ip: '192.168.1.1', x: 200, y: 300 },
        { id: 'eth1', type: 'nic', name: 'eth1', ip: '10.0.0.1', x: 600, y: 300 },
        { id: 'switch-a', type: 'switch', name: 'Switch A', x: 200, y: 400 },
        { id: 'switch-b', type: 'switch', name: 'Switch B', x: 600, y: 400 },
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.1.10', x: 100, y: 400 },
        { id: 'pc-b', type: 'computer', name: 'PC-B', ip: '10.0.0.20', x: 700, y: 400 },
        { id: 'server', type: 'server', name: 'Server', ip: '8.8.8.8', x: 850, y: 400 }
      ],
      links: [
        { id: 'link-eth0-a', from: 'eth0', to: 'switch-a' },
        { id: 'link-eth1-b', from: 'eth1', to: 'switch-b' },
        { id: 'link-pca', from: 'pc-a', to: 'switch-a' },
        { id: 'link-pcb', from: 'pc-b', to: 'switch-b' },
        { id: 'link-srv', from: 'server', to: 'switch-b' }
      ]
    },
    steps: [
      {
        title: 'Linux box has 2 interfaces, 2 route table entries',
        explanation: 'The Linux box has two network interfaces:\n<code>eth0: 192.168.1.1/24</code>\n<code>eth1: 10.0.0.1/24</code>\n\nThe kernel maintains a <strong>routing table</strong> that determines where to send packets based on their destination IP.\n\n<strong>Prerequisite:</strong> Understand <strong>Layer 3</strong> (routing decisions) and <strong>Gateway</strong> (how routers connect networks) first.\n\n<strong>See also:</strong> <strong>Routing Table</strong> topic for the conceptual overview.',
        highlights: [],
        packets: [],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Packet arrives from PC-A (192.168.1.10)',
        explanation: 'PC-A (192.168.1.10) sends a packet destined for the Server (8.8.8.8).\n\nThe packet travels from PC-A to Switch A, which will forward it to the Linux box on eth0.',
        highlights: ['pc-a'],
        activeLinks: ['link-pca'],
        packets: [
          { id: 'rt1', type: 'data', from: 'pc-a', to: 'switch-a', color: 'var(--cyan)', label: 'From 192.168.1.10', duration: 1200 }
        ],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Packet arrives at eth0',
        explanation: 'Switch A forwards the packet to eth0 on the Linux box.\n\nThe kernel now owns the packet and must decide where to send it next based on the destination IP (8.8.8.8).',
        highlights: ['eth0'],
        activeLinks: ['link-eth0-a'],
        packets: [
          { id: 'rt2', type: 'data', from: 'switch-a', to: 'eth0', color: 'var(--cyan)', label: 'Arrives at eth0', duration: 1200 }
        ],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Kernel checks routing table for destination 8.8.8.8',
        explanation: 'The Linux kernel consults its <strong>routing table</strong> to find a match for destination 8.8.8.8.\n\nIt checks each entry:\n• <code>192.168.1.0/24</code> → No match (8.8.8.8 is not in this subnet)\n• <code>10.0.0.0/24</code> → No match (8.8.8.8 is not in this subnet)\n\nNo specific route matches — the kernel looks for a <strong>default route</strong>.',
        highlights: ['linux-box'],
        packets: [],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0, match: false },
              '10.0.0.0/24': { via: 'eth1', metric: 0, match: false },
              'default': { via: '10.0.0.1', metric: 0, match: true }
            }
          }
        }
      },
      {
        title: 'Match: 0.0.0.0/0 via 10.0.0.1 (default route)',
        explanation: 'The kernel finds the <strong>default route</strong> (0.0.0.0/0) — a catch-all entry that matches any destination.\n\nThe default gateway is <code>10.0.0.1</code>, which is the Linux box\'s own eth1 interface. The packet should be sent out via <strong>eth1</strong>.',
        highlights: ['linux-box'],
        packets: [],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0, match: false },
              '10.0.0.0/24': { via: 'eth1', metric: 0, match: false },
              'default': { via: '10.0.0.1 (eth1)', metric: 0, match: true }
            }
          }
        }
      },
      {
        title: 'Kernel forwards packet to eth1',
        explanation: 'Based on the routing decision, the kernel <strong>forwards</strong> the packet from eth0 to eth1.\n\nThe packet is now being routed between the two interfaces — the Linux box is acting as a <strong>router</strong>.',
        highlights: ['linux-box'],
        packets: [
          { id: 'rt3', type: 'data', from: 'eth0', to: 'eth1', color: 'var(--green)', label: 'Forward → eth1', duration: 1200 }
        ],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 },
              'default': { via: '10.0.0.1 (eth1)', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Packet: eth1 → Switch B',
        explanation: 'The packet exits eth1 (10.0.0.1) and travels to Switch B.\n\nThe packet is now on the 10.0.0.0/24 network, heading toward the destination 8.8.8.8.',
        highlights: ['eth1'],
        activeLinks: ['link-eth1-b'],
        packets: [
          { id: 'rt4', type: 'data', from: 'eth1', to: 'switch-b', color: 'var(--green)', label: 'To Switch B', duration: 1200 }
        ],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 },
              'default': { via: '10.0.0.1 (eth1)', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Switch B forwards to server',
        explanation: 'Switch B receives the packet and forwards it to the Server (8.8.8.8) based on its forwarding table.',
        highlights: ['switch-b'],
        activeLinks: ['link-srv'],
        packets: [
          { id: 'rt5', type: 'data', from: 'switch-b', to: 'server', color: 'var(--green)', label: 'To 8.8.8.8', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Routing decision summary',
        explanation: 'The packet was successfully routed from the 192.168.1.0/24 network to the 10.0.0.0/24 network.\n\n<strong>Key steps:</strong>\n1. Packet arrived on eth0 from PC-A\n2. Kernel checked routing table for destination 8.8.8.8\n3. No specific route matched — used <strong>default route</strong>\n4. Packet forwarded to eth1 and delivered to the server\n\nThe <code>ip route</code> command shows the kernel\'s routing table.',
        highlights: ['linux-box', 'eth0', 'eth1', 'switch-a', 'switch-b', 'pc-a', 'server'],
        packets: [],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              '10.0.0.0/24': { via: 'eth1', metric: 0 },
              'default': { via: '10.0.0.1 (eth1)', metric: 0 }
            }
          }
        }
      },
      {
        title: 'ip route shows the kernel\'s routing table',
        explanation: 'The <code>ip route</code> command displays the routing table:\n\n<code>192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.1</code>\n<code>10.0.0.0/24 dev eth1 proto kernel scope link src 10.0.0.1</code>\n<code>default via 10.0.0.1 dev eth1</code>\n\n<strong>Key takeaway:</strong> Linux uses its routing table to make forwarding decisions. The default route (0.0.0.0/0) is the fallback when no specific route matches the destination.',
        highlights: ['linux-box'],
        packets: [],
        tables: {
          'linux-box': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0, detail: 'dev eth0 proto kernel scope link src 192.168.1.1' },
              '10.0.0.0/24': { via: 'eth1', metric: 0, detail: 'dev eth1 proto kernel scope link src 10.0.0.1' },
              'default': { via: '10.0.0.1', metric: 0, detail: 'via 10.0.0.1 dev eth1' }
            }
          }
        }
      }
    ]
  },

  {
    id: 'iptables',
    name: 'iptables Firewall',
    icon: '🔥',
    description: 'Linux packet filtering with iptables chains',
    category: 'Linux Core Networking',
    order: 25,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'internet', type: 'internet', name: 'Internet', x: 100, y: 200 },
        { id: 'firewall', type: 'firewall', name: 'Firewall (Linux)', x: 350, y: 200 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 550, y: 200 },
        { id: 'server', type: 'server', name: 'Server', x: 750, y: 200 },
        { id: 'client', type: 'computer', name: 'Client', x: 550, y: 380 }
      ],
      links: [
        { id: 'link-inet', from: 'internet', to: 'firewall' },
        { id: 'link-fw-sw', from: 'firewall', to: 'switch' },
        { id: 'link-sw-srv', from: 'switch', to: 'server' },
        { id: 'link-sw-cli', from: 'switch', to: 'client' }
      ]
    },
    steps: [
      {
        title: 'Firewall has iptables rules on 3 chains',
        explanation: 'The Linux firewall uses <strong>iptables</strong> with three built-in chains:\n\n<strong>INPUT</strong> — packets destined for the firewall itself\n<strong>OUTPUT</strong> — packets originating from the firewall\n<strong>FORWARD</strong> — packets passing through the firewall (not destined for it)\n\nIncoming packets from the internet first hit the <strong>PREROUTING</strong> chain, then are routed to INPUT or FORWARD.\n\n<strong>Prerequisite:</strong> Understand <strong>Linux Gateway</strong> (ip forwarding) and <strong>Route Table</strong> first.',
        highlights: [],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        }
      },
      {
        title: 'Incoming packet from internet hits PREROUTING',
        explanation: 'A legitimate HTTP request (port 80) arrives from the internet.\n\nThe packet enters the <strong>PREROUTING</strong> chain — the first stop for all incoming packets. PREROUTING handles DNAT (Destination NAT) rules before routing decisions are made.',
        highlights: ['internet'],
        activeLinks: ['link-inet'],
        packets: [
          { id: 'fw1', type: 'data', from: 'internet', to: 'firewall', color: 'var(--red)', label: 'Incoming Packet', duration: 1200 }
        ],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        },
        packetDetails: {
          fw1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'Firewall (Linux)'],
                ['Source', 'Internet'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '203.0.113.50'],
                ['Destination', '10.0.0.100'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--green)', fields: [
                ['Source Port', '52431'],
                ['Destination', '80 (HTTP)']
              ]}
            ]
          }
        }
      },
      {
        title: 'PREROUTING: No DNAT rule — continue',
        explanation: 'The PREROUTING chain processes the packet.\n\n<strong>No DNAT rules match</strong> — the destination IP remains unchanged. The kernel now performs a routing decision to determine whether the packet is for this host (INPUT) or needs to be forwarded (FORWARD).',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'PREROUTING': { status: 'No DNAT match', policy: 'CONTINUE' },
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        }
      },
      {
        title: 'Packet destined for server — use FORWARD chain',
        explanation: 'The routing decision determines the packet is <strong>not destined for the firewall itself</strong> (destination 10.0.0.100 ≠ firewall IP).\n\nThe packet is sent to the <strong>FORWARD chain</strong> for processing.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        }
      },
      {
        title: 'FORWARD chain: Check rule — ACCEPT if port 80',
        explanation: 'The FORWARD chain evaluates its rules against the packet:\n\n<strong>Rule 1:</strong> <code>-p tcp --dport 80 -j ACCEPT</code>\nMatch? <strong>YES</strong> — destination port is 80.\n\nTarget: <strong>ACCEPT</strong> — the packet is allowed through the firewall.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP', matched: true },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        },
        packetDetails: {
          fw2: {
            layers: [
              { name: 'iptables Rule Match', color: 'var(--green)', fields: [
                ['Chain', 'FORWARD'],
                ['Rule', '-p tcp --dport 80 -j ACCEPT'],
                ['Result', 'MATCHED — ACCEPT'],
                ['Action', 'Allow packet through']
              ]}
            ]
          }
        }
      },
      {
        title: 'Rule matched! ALLOW through firewall',
        explanation: 'The ACCEPT target is reached — the firewall <strong>allows</strong> the packet to continue through the FORWARD chain.\n\nNo further rules are evaluated. The packet proceeds to POSTROUTING.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP', matched: true }
              ]}
            }
          }
        }
      },
      {
        title: 'POSTROUTING: No MASQUERADE — continue',
        explanation: 'The packet reaches the <strong>POSTROUTING</strong> chain — the last stop before leaving the firewall.\n\n<strong>No MASQUERADE or SNAT rules match</strong> — the packet exits with its original source IP intact.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'POSTROUTING': { status: 'No MASQUERADE match', policy: 'CONTINUE' }
            }
          }
        }
      },
      {
        title: 'Packet: Firewall → Switch',
        explanation: 'The firewall forwards the allowed packet to the Switch.\n\nThe packet is now on its way to the server — the firewall has done its job of filtering.',
        highlights: ['firewall'],
        activeLinks: ['link-fw-sw'],
        packets: [
          { id: 'fw2', type: 'data', from: 'firewall', to: 'switch', color: 'var(--green)', label: 'ALLOWED → Switch', duration: 1200 }
        ],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP', matched: true }
              ]}
            }
          }
        }
      },
      {
        title: 'Switch forwards to server',
        explanation: 'The Switch receives the packet and forwards it to the Server (10.0.0.100). The HTTP request is delivered successfully.',
        highlights: ['switch'],
        activeLinks: ['link-sw-srv'],
        packets: [
          { id: 'fw3', type: 'data', from: 'switch', to: 'server', color: 'var(--green)', label: 'To Server', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Now a MALICIOUS packet arrives (port 22)',
        explanation: 'A new packet arrives from the internet — this time attempting an <strong>SSH connection</strong> (port 22) to the server.\n\nThis is a common attack vector. The firewall must evaluate its rules again.',
        highlights: ['internet'],
        activeLinks: ['link-inet'],
        packets: [
          { id: 'fw4', type: 'data', from: 'internet', to: 'firewall', color: 'var(--red)', label: 'SSH Attack', duration: 1200 }
        ],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH' }
              ]}
            }
          }
        },
        packetDetails: {
          fw4: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'Firewall (Linux)'],
                ['Source', 'Internet (Attacker)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--red)', fields: [
                ['Source IP', '198.51.100.66'],
                ['Destination', '10.0.0.100'],
                ['Protocol', 'TCP (6)']
              ]},
              { name: 'TCP', color: 'var(--red)', fields: [
                ['Source Port', '44812'],
                ['Destination', '22 (SSH)']
              ]}
            ]
          }
        }
      },
      {
        title: 'FORWARD chain: DROP rule matches port 22',
        explanation: 'The FORWARD chain evaluates its rules:\n\n<strong>Rule 1:</strong> <code>--dport 80 -j ACCEPT</code>\nMatch? NO — port is 22, not 80.\n\n<strong>Rule 2:</strong> <code>--dport 22 -j DROP</code>\nMatch? <strong>YES</strong> — destination port is 22.\n\nTarget: <strong>DROP</strong> — the packet is silently discarded.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH', matched: true }
              ]}
            }
          }
        },
        packetDetails: {
          fw5: {
            layers: [
              { name: 'iptables Rule Match', color: 'var(--red)', fields: [
                ['Chain', 'FORWARD'],
                ['Rule', '-p tcp --dport 22 -j DROP'],
                ['Result', 'MATCHED — DROP'],
                ['Action', 'Silently discard packet']
              ]}
            ]
          }
        }
      },
      {
        title: 'Packet DROPPED! Never reaches server',
        explanation: 'The firewall <strong>drops</strong> the malicious SSH packet. It is silently discarded — no response is sent to the attacker.\n\nThe server never receives the packet. The attack is blocked.\n\n<strong>Key takeaway:</strong> iptables evaluates rules in order. The first matching rule determines the action (ACCEPT or DROP). Packets that match no rules fall through to the chain\'s <strong>default policy</strong> (often DROP for FORWARD).\n\n<code>iptables -L -v</code> shows the rules with hit counters.',
        highlights: ['firewall'],
        packets: [],
        tables: {
          'firewall': {
            iptables: {
              'FORWARD': { policy: 'DROP', rules: [
                { chain: 'FORWARD', match: 'dport 80', target: 'ACCEPT', label: 'Allow HTTP' },
                { chain: 'FORWARD', match: 'dport 22', target: 'DROP', label: 'Block SSH', matched: true }
              ]}
            }
          }
        }
      }
    ]
  },

  {
    id: 'namespace',
    name: 'Network Namespaces',
    icon: '📦',
    description: 'Linux network isolation with namespaces and veth pairs',
    category: 'Linux Core Networking',
    order: 26,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ns-app1', type: 'linux', name: 'NS: app1', x: 150, y: 200 },
        { id: 'ns-app2', type: 'linux', name: 'NS: app2', x: 150, y: 380 },
        { id: 'veth-a', type: 'nic', name: 'veth-a', x: 350, y: 200 },
        { id: 'veth-b', type: 'nic', name: 'veth-b', x: 350, y: 380 },
        { id: 'bridge', type: 'bridge', name: 'br0', x: 550, y: 290 },
        { id: 'internet', type: 'internet', x: 750, y: 290 }
      ],
      links: [
        { id: 'link-ns1-vetha', from: 'ns-app1', to: 'veth-a' },
        { id: 'link-ns2-vethb', from: 'ns-app2', to: 'veth-b' },
        { id: 'link-vetha-br', from: 'veth-a', to: 'bridge' },
        { id: 'link-vethb-br', from: 'veth-b', to: 'bridge' },
        { id: 'link-br-int', from: 'bridge', to: 'internet' }
      ]
    },
    steps: [
      {
        title: 'Two isolated network namespaces: app1 and app2',
        explanation: '<strong>Linux network namespaces</strong> provide complete network stack isolation. Each namespace has its own interfaces, routes, and iptables rules.\n\nWe\'ve created two namespaces:\n<code>ip netns add app1</code>\n<code>ip netns add app2</code>\n\nThey are completely invisible to each other — like two separate machines.\n\n<strong>Prerequisite:</strong> Understand <strong>Network Interface (NIC)</strong> and <strong>Network Stack</strong> first.',
        highlights: [],
        packets: [],
        tables: {
          'ns-app1': { namespace: { 'Name': 'app1', 'Interfaces': 'lo (only)', 'Status': 'isolated', isNew: true } },
          'ns-app2': { namespace: { 'Name': 'app2', 'Interfaces': 'lo (only)', 'Status': 'isolated', isNew: true } }
        }
      },
      {
        title: 'Each namespace has its own network stack',
        explanation: 'Each namespace runs its own independent <strong>network stack</strong>:\n• Its own <strong>loopback</strong> (lo) interface\n• Its own <strong>routing table</strong>\n• Its own <strong>iptables/nftables</strong> rules\n• Its own set of <strong>sockets</strong>\n\nIf you run <code>ip netns exec app1 ip addr</code>, you\'ll see only the lo interface — no eth0, no bridge, nothing else.',
        highlights: ['ns-app1', 'ns-app2'],
        packets: [],
        tables: {
          'ns-app1': { namespace: { 'Name': 'app1', 'Interfaces': 'lo (127.0.0.1)', 'Routing': 'local only' } },
          'ns-app2': { namespace: { 'Name': 'app2', 'Interfaces': 'lo (127.0.0.1)', 'Routing': 'local only' } }
        }
      },
      {
        title: 'Veth pairs connect namespaces to bridge',
        explanation: '<strong>Veth pairs</strong> are virtual Ethernet cables — what goes in one end comes out the other.\n\nWe create two veth pairs:\n<code>ip link add veth-a type veth peer name veth-a-br</code>\n<code>ip link add veth-b type veth peer name veth-b-br</code>\n\nThen move one end into each namespace and attach the other to the bridge:\n<code>ip link set veth-a netns app1</code>\n<code>ip link set veth-b netns app2</code>\n<code>brctl addif br0 veth-a-br</code>\n<code>brctl addif br0 veth-b-br</code>',
        highlights: ['veth-a', 'veth-b', 'bridge'],
        packets: [],
        tables: {}
      },
      {
        title: 'app1 sends a packet to the outside world',
        explanation: 'Namespace <strong>app1</strong> sends a packet destined for the internet.\n\nInside the namespace, the packet travels through <strong>veth-a</strong> — the veth pair acts as a virtual cable, delivering the frame out to the bridge.',
        highlights: ['ns-app1'],
        activeLinks: ['link-ns1-vetha'],
        packets: [
          { id: 'ns1', type: 'data', from: 'ns-app1', to: 'veth-a', color: 'var(--cyan)', label: 'Packet from NS:app1', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Veth-a forwards to bridge br0',
        explanation: 'The other end of the veth pair delivers the frame to <strong>bridge br0</strong>.\n\nThe bridge receives the frame on the port connected to veth-a and begins standard bridge processing: learning the source MAC and looking up the destination.',
        highlights: ['veth-a', 'bridge'],
        activeLinks: ['link-vetha-br'],
        packets: [
          { id: 'ns2', type: 'data', from: 'veth-a', to: 'bridge', color: 'var(--cyan)', label: 'To Bridge', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: { 'veth-a peer': { port: 'veth-a-br', label: 'app1 MAC', isNew: true } } }
        }
      },
      {
        title: 'Bridge forwards to internet',
        explanation: 'The bridge looks up the destination — it\'s not local, so it forwards the frame out its <strong>uplink port</strong> toward the internet.\n\nThe packet has successfully left app1\'s namespace, traversed the veth pair, been bridged, and reached the outside world.',
        highlights: ['bridge', 'internet'],
        activeLinks: ['link-br-int'],
        packets: [
          { id: 'ns3', type: 'data', from: 'bridge', to: 'internet', color: 'var(--green)', label: 'To Internet', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Now app2 tries to send — but namespace is isolated',
        explanation: 'Namespace <strong>app2</strong> also wants to send a packet. But here\'s the key: app2 and app1 are in <strong>completely separate network namespaces</strong>.\n\nApp2 cannot see app1\'s interfaces, ARP table, or routing table. They are isolated at the kernel level.\n\nHowever, app2 <em>can</em> reach the bridge through its own veth pair (veth-b), because the bridge is a shared resource outside both namespaces.',
        highlights: ['ns-app2'],
        packets: [],
        tables: {
          'ns-app2': { namespace: { 'Name': 'app2', 'Can see app1?': 'NO (isolated)', 'Can reach bridge?': 'YES (via veth-b)' } }
        }
      },
      {
        title: 'app2 packet reaches bridge',
        explanation: 'App2 sends a packet through <strong>veth-b</strong>, which delivers it to the bridge.\n\nThe bridge now sees traffic from a <strong>second namespace</strong>. It learns app2\'s MAC on the veth-b-br port. Both namespaces share the same bridge but remain isolated from each other.',
        highlights: ['ns-app2', 'veth-b', 'bridge'],
        activeLinks: ['link-ns2-vethb', 'link-vethb-br'],
        packets: [
          { id: 'ns4', type: 'data', from: 'ns-app2', to: 'bridge', color: 'var(--amber)', label: 'From NS:app2', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: {
            'app1 MAC': { port: 'veth-a-br', label: 'NS: app1' },
            'app2 MAC': { port: 'veth-b-br', label: 'NS: app2', isNew: true }
          } }
        }
      },
      {
        title: 'Bridge can forward — namespaces share the bridge',
        explanation: 'The bridge forwards app2\'s packet to the internet, just like it did for app1.\n\n<strong>Key insight:</strong> Both namespaces are isolated from <em>each other</em>, but they can both reach the <strong>shared bridge</strong> and communicate with the outside world.\n\nThis is how containers (Docker, Podman) provide network isolation while still allowing internet access.',
        highlights: ['bridge', 'internet'],
        activeLinks: ['link-br-int'],
        packets: [
          { id: 'ns5', type: 'data', from: 'bridge', to: 'internet', color: 'var(--green)', label: 'Bridge forwards', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Network namespace summary',
        explanation: '<strong>Key takeaway:</strong> Linux network namespaces provide <strong>complete network isolation</strong> at the kernel level.\n\nHow it works:\n1. Each namespace has its own <strong>network stack</strong> (interfaces, routes, iptables)\n2. <strong>Veth pairs</strong> connect namespaces to the outside (like virtual Ethernet cables)\n3. A <strong>bridge</strong> can connect multiple namespaces and provide internet access\n4. Namespaces are <strong>isolated from each other</strong> — they can\'t see each other\'s traffic\n\nUsed by: Docker, Podman, Kubernetes, LXC/LXD, network function virtualization (NFV).',
        highlights: ['ns-app1', 'ns-app2', 'veth-a', 'veth-b', 'bridge', 'internet'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'bridge',
    name: 'Linux Bridges',
    icon: '🔗',
    description: 'Connecting VMs/containers with Linux bridge (brctl)',
    category: 'Linux Core Networking',
    order: 27,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'vm-1', type: 'computer', name: 'VM-1', x: 150, y: 200 },
        { id: 'vm-2', type: 'computer', name: 'VM-2', x: 150, y: 380 },
        { id: 'bridge', type: 'bridge', name: 'br0', x: 450, y: 290 },
        { id: 'router', type: 'router', name: 'Router', x: 700, y: 290 },
        { id: 'internet', type: 'internet', x: 880, y: 290 }
      ],
      links: [
        { id: 'link-vm1-br', from: 'vm-1', to: 'bridge' },
        { id: 'link-vm2-br', from: 'vm-2', to: 'bridge' },
        { id: 'link-br-router', from: 'bridge', to: 'router' },
        { id: 'link-router-int', from: 'router', to: 'internet' }
      ]
    },
    steps: [
      {
        title: 'Linux bridge acts like a virtual switch',
        explanation: 'A <strong>Linux bridge</strong> is a kernel-level virtual switch. It works just like a physical switch — it learns MAC addresses and forwards frames.\n\nCreated with:\n<code>ip link add br0 type bridge</code>\n<code>brctl show br0</code>\n\nThe bridge has ports where VMs/containers attach, and an uplink to the outside network.\n\n<strong>Prerequisite:</strong> Understand <strong>Network Namespaces</strong> and <strong>Layer 2</strong> (MAC learning) first.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'VM-1 and VM-2 both connected to br0',
        explanation: 'Both VMs are attached to bridge br0 via their virtual NICs:\n<code>brctl addif br0 tap-vm1</code>\n<code>brctl addif br0 tap-vm2</code>\n\nThe bridge\'s <strong>Forwarding Database (FDB)</strong> is currently empty — it hasn\'t learned any MAC addresses yet.',
        highlights: ['vm-1', 'vm-2', 'bridge'],
        packets: [],
        tables: {
          'bridge': { fdb: {} }
        }
      },
      {
        title: 'VM-1 sends ARP broadcast',
        explanation: 'VM-1 wants to communicate with VM-2 but doesn\'t know its MAC address. It sends an <strong>ARP broadcast</strong>:\n<code>"Who has VM-2? Tell VM-1"</code>\n\nThe broadcast frame enters the bridge on the vm-1 port.',
        highlights: ['vm-1'],
        activeLinks: ['link-vm1-br'],
        packets: [
          { id: 'br1', type: 'arp-request', from: 'vm-1', to: 'bridge', color: 'var(--amber)', label: 'ARP: Who has VM-2?', duration: 1200, broadcast: true }
        ],
        tables: {
          'bridge': { fdb: {} }
        },
        packetDetails: {
          br1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
                ['Source', 'VM-1 MAC'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--amber)', fields: [
                ['Opcode', 'Request (1)'],
                ['Sender MAC', 'VM-1 MAC'],
                ['Target MAC', '00:00:00:00:00:00']
              ]}
            ]
          }
        }
      },
      {
        title: 'Bridge floods to VM-2',
        explanation: 'The bridge receives the broadcast and <strong>floods</strong> it out all ports except the source — including the port connected to VM-2.\n\nVM-2 receives the ARP request and recognizes its own IP.',
        highlights: ['bridge', 'vm-2'],
        activeLinks: ['link-vm2-br'],
        packets: [
          { id: 'br2', type: 'arp-request', from: 'bridge', to: 'vm-2', color: 'var(--amber)', label: 'Flood ARP', duration: 1000 }
        ],
        tables: {
          'bridge': { fdb: {} }
        }
      },
      {
        title: 'VM-2 replies (unicast)',
        explanation: 'VM-2 sends an <strong>ARP Reply</strong> — this time a <strong>unicast</strong> frame addressed to VM-1\'s MAC.\n\nThe bridge receives the reply and <strong>learns</strong> VM-2\'s MAC address from the source field. It adds an entry to its FDB.',
        highlights: ['vm-2', 'bridge'],
        activeLinks: ['link-vm2-br'],
        packets: [
          { id: 'br3', type: 'arp-reply', from: 'vm-2', to: 'bridge', color: 'var(--green)', label: 'ARP Reply', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: { 'VM-2 MAC': { port: 'vm-2', label: 'VM-2', isNew: true } } }
        },
        packetDetails: {
          br3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'VM-1 MAC (Unicast)'],
                ['Source', 'VM-2 MAC'],
                ['Type', 'ARP (0x0806)']
              ]},
              { name: 'ARP', color: 'var(--green)', fields: [
                ['Opcode', 'Reply (2)'],
                ['Sender MAC', 'VM-2 MAC'],
                ['Target MAC', 'VM-1 MAC']
              ]}
            ]
          }
        }
      },
      {
        title: 'Bridge learns VM-1 MAC, adds to FDB',
        explanation: 'The bridge now forwards the ARP reply toward VM-1. When VM-1\'s frame arrives, the bridge also <strong>learns VM-1\'s MAC</strong> from the source.\n\nThe FDB now has entries for <strong>both VMs</strong>. Future unicast frames won\'t need flooding.',
        highlights: ['bridge'],
        packets: [],
        tables: {
          'bridge': { fdb: {
            'VM-2 MAC': { port: 'vm-2', label: 'VM-2' },
            'VM-1 MAC': { port: 'vm-1', label: 'VM-1', isNew: true }
          } }
        }
      },
      {
        title: 'VM-1 sends data to VM-2 (unicast)',
        explanation: 'Now that ARP is resolved, VM-1 sends a <strong>data frame</strong> to VM-2.\n\nThe frame enters the bridge with VM-1 as the source (already learned) and VM-2 as the destination.',
        highlights: ['vm-1'],
        activeLinks: ['link-vm1-br'],
        packets: [
          { id: 'br4', type: 'data', from: 'vm-1', to: 'bridge', color: 'var(--cyan)', label: 'Frame to VM-2', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: {
            'VM-1 MAC': { port: 'vm-1', label: 'VM-1' },
            'VM-2 MAC': { port: 'vm-2', label: 'VM-2' }
          } }
        }
      },
      {
        title: 'Bridge looks up FDB — forwards to VM-2',
        explanation: 'The bridge checks its FDB for VM-2\'s MAC — <strong>found on the vm-2 port</strong>.\n\nIt forwards the frame directly to VM-2. No flooding needed — the bridge learned the MAC addresses earlier.',
        highlights: ['bridge', 'vm-2'],
        activeLinks: ['link-vm2-br'],
        packets: [
          { id: 'br5', type: 'data', from: 'bridge', to: 'vm-2', color: 'var(--green)', label: 'Forwarded', duration: 1000 }
        ],
        tables: {
          'bridge': { fdb: {
            'VM-1 MAC': { port: 'vm-1', label: 'VM-1' },
            'VM-2 MAC': { port: 'vm-2', label: 'VM-2' }
          } }
        }
      },
      {
        title: 'VM-1 sends to internet (not local)',
        explanation: 'VM-1 now sends a packet destined for the <strong>internet</strong> (outside the local bridge network).\n\nThe bridge receives the frame, but the destination MAC belongs to the <strong>Router</strong> (next hop), not a local VM.',
        highlights: ['vm-1'],
        activeLinks: ['link-vm1-br'],
        packets: [
          { id: 'br6', type: 'data', from: 'vm-1', to: 'bridge', color: 'var(--cyan)', label: 'To Internet', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: {
            'VM-1 MAC': { port: 'vm-1', label: 'VM-1' },
            'VM-2 MAC': { port: 'vm-2', label: 'VM-2' }
          } }
        }
      },
      {
        title: 'Bridge forwards to router (uplink)',
        explanation: 'The bridge looks up the destination MAC — it belongs to the <strong>Router</strong>, connected on the uplink port.\n\nThe frame is forwarded to the Router, which will route it to the internet.\n\n<strong>Key takeaway:</strong> A Linux bridge works exactly like a physical switch — it learns MAC addresses in its FDB and forwards unicast frames directly. It floods broadcasts and unknown unicast. Combined with a router on the uplink, it provides full network connectivity for VMs and containers.',
        highlights: ['bridge', 'router'],
        activeLinks: ['link-br-router'],
        packets: [
          { id: 'br7', type: 'data', from: 'bridge', to: 'router', color: 'var(--green)', label: 'To Router', duration: 1200 }
        ],
        tables: {
          'bridge': { fdb: {
            'VM-1 MAC': { port: 'vm-1', label: 'VM-1' },
            'VM-2 MAC': { port: 'vm-2', label: 'VM-2' },
            'Router MAC': { port: 'uplink', label: 'Router', isNew: true }
          } }
        }
      }
    ]
  },

  {
    id: 'linux-gateway',
    name: 'Linux Gateway',
    icon: '🔀',
    description: 'Linux as a gateway with ip forwarding enabled',
    category: 'Linux Core Networking',
    order: 24,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ns1', type: 'linux', name: 'NS: web', x: 80, y: 100, cmds: ['curl 10.0.0.20'] },
        { id: 'veth1', type: 'nic', name: 'veth1-ns', x: 280, y: 100 },
        { id: 'br1', type: 'bridge', name: 'br0', subnet: '192.168.1.1/24', x: 400, y: 100 },
        { id: 'fwd', type: 'box', name: 'ip_forward=1', color: 'var(--green)', x: 500, y: 200 },
        { id: 'br2', type: 'bridge', name: 'br1', subnet: '10.0.0.1/24', x: 600, y: 300 },
        { id: 'veth2', type: 'nic', name: 'veth2-ns', x: 700, y: 300 },
        { id: 'ns2', type: 'linux', name: 'NS: db', x: 850, y: 300, cmds: ['10.0.0.20'] }
      ],
      links: [
        { id: 'link-ns1-v1', from: 'ns1', to: 'veth1' },
        { id: 'link-v1-br1', from: 'veth1', to: 'br1' },
        { id: 'link-br1-br2', from: 'br1', to: 'br2' },
        { id: 'link-br2-v2', from: 'br2', to: 'veth2' },
        { id: 'link-v2-ns2', from: 'veth2', to: 'ns2' }
      ]
    },
    steps: [
      {
        title: 'Linux box connects two networks',
        explanation: 'A Linux box sits between two networks:\n<code>Network 1 (br0): 192.168.1.0/24</code>\n<code>Network 2 (br1): 10.0.0.0/24</code>\n\nThe Linux box has two bridges (br0, br1) and <strong>ip forwarding enabled</strong>, acting as a gateway between them.\n\n<strong>Prerequisite:</strong> Understand <strong>Default Gateway (Linux)</strong> and <strong>Network Namespaces</strong> first.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'ip_forward is enabled in kernel',
        explanation: 'IP forwarding is checked:\n<code>cat /proc/sys/net/ipv4/ip_forward</code>\n\nOutput: <code>1</code> (enabled)\n\nWhen enabled, the Linux kernel can <strong>route packets between interfaces</strong> instead of dropping them. This turns the Linux box into a router/gateway.',
        highlights: ['fwd'],
        packets: [],
        tables: {
          'fwd': { kernel: { '/proc/sys/net/ipv4/ip_forward': '1 (enabled)' } }
        }
      },
      {
        title: 'Web namespace sends packet to 10.0.0.20',
        explanation: 'The web namespace (NS: web) wants to reach the DB namespace (10.0.0.20) on a different subnet.\n\nThe packet is sent through <strong>veth1</strong> toward br0 (192.168.1.1).',
        highlights: ['ns1'],
        activeLinks: ['link-ns1-v1'],
        packets: [
          { id: 'gw1', type: 'data', from: 'ns1', to: 'veth1', color: 'var(--cyan)', label: '192.168.1.10→10.0.0.20', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Packet reaches br0 (192.168.1.1)',
        explanation: 'The packet travels from veth1 to <strong>bridge br0</strong>.\n\nbr0 is the gateway for the 192.168.1.0/24 network. The kernel processes the packet and checks the routing table.',
        highlights: ['br1'],
        activeLinks: ['link-v1-br1'],
        packets: [
          { id: 'gw2', type: 'data', from: 'veth1', to: 'br1', color: 'var(--cyan)', label: 'To br0', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Kernel routing table: 10.0.0.0/24 via br1',
        explanation: 'The kernel checks its routing table:\n<code>192.168.1.0/24 dev br0</code>\n<code>10.0.0.0/24 dev br1</code>\n\nDestination 10.0.0.20 matches the 10.0.0.0/24 route — forward to <strong>br1</strong>.',
        highlights: ['fwd'],
        packets: [],
        tables: {
          'fwd': {
            routeTable: {
              '192.168.1.0/24': { via: 'br0', metric: 0 },
              '10.0.0.0/24': { via: 'br1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Kernel forwards packet to br1',
        explanation: 'Since ip_forward is enabled, the kernel <strong>forwards the packet</strong> from br0 to br1.\n\nThe packet crosses the gateway — moving from one network to another.',
        highlights: ['fwd'],
        packets: [
          { id: 'gw3', type: 'data', from: 'br1', to: 'br2', color: 'var(--green)', label: 'Forwarded', duration: 1200 }
        ],
        tables: {
          'fwd': {
            routeTable: {
              '192.168.1.0/24': { via: 'br0', metric: 0 },
              '10.0.0.0/24': { via: 'br1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'Packet reaches veth2-ns',
        explanation: 'The packet arrives at <strong>br1 (10.0.0.1)</strong> and is forwarded to <strong>veth2-ns</strong> on the 10.0.0.0/24 network.',
        highlights: ['br2'],
        activeLinks: ['link-br2-v2'],
        packets: [
          { id: 'gw4', type: 'data', from: 'br2', to: 'veth2', color: 'var(--green)', label: 'To veth2-ns', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'DB namespace receives packet',
        explanation: 'The DB namespace (NS: db) receives the packet on <strong>veth2-ns</strong>.\n\nDestination IP 10.0.0.20 matches — the packet is accepted.',
        highlights: ['ns2'],
        activeLinks: ['link-v2-ns2'],
        packets: [
          { id: 'gw5', type: 'data', from: 'veth2', to: 'ns2', color: 'var(--green)', label: 'Delivered', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Reply flows back through gateway',
        explanation: 'The DB namespace sends a reply back to the web namespace. The reply follows the reverse path through the Linux gateway.',
        highlights: ['ns2', 'br2', 'br1', 'ns1'],
        packets: [
          { id: 'gw6', type: 'data', from: 'ns2', to: 'ns1', color: 'var(--amber)', label: 'Reply', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Linux Gateway summary!',
        explanation: '<strong>Key takeaway:</strong> Linux can act as a <strong>network gateway</strong> using IP forwarding.\n\nHow it worked:\n1. <strong>ip_forward=1</strong> enables packet forwarding between interfaces\n2. Web namespace sends to 10.0.0.20 (remote subnet)\n3. Kernel checks <strong>routing table</strong> → route via br1\n4. Kernel <strong>forwards packet</strong> from br0 to br1\n5. DB namespace receives the packet\n6. Reply flows back through the gateway\n\nEnable with:\n<code>echo 1 > /proc/sys/net/ipv4/ip_forward</code>\n<code>sysctl -w net.ipv4.ip_forward=1</code>',
        highlights: ['ns1', 'veth1', 'br1', 'fwd', 'br2', 'veth2', 'ns2'],
        packets: [],
        tables: {
          'fwd': {
            routeTable: {
              '192.168.1.0/24': { via: 'br0', metric: 0 },
              '10.0.0.0/24': { via: 'br1', metric: 0 }
            }
          }
        }
      }
    ]
  },

  {
    id: 'linux-default-gw',
    name: 'Default Gateway (Linux)',
    icon: '🎯',
    description: 'Configuring default gateway with ip route on Linux',
    category: 'Linux Core Networking',
    order: 23,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'host', type: 'linux', name: 'Linux Host', x: 100, y: 100, cmds: ['ping 8.8.8.8'] },
        { id: 'eth0', type: 'nic', name: 'eth0', subnet: '192.168.1.10', x: 280, y: 100 },
        { id: 'route', type: 'box', name: 'ip route', sub: 'default via 192.168.1.1', x: 400, y: 100 },
        { id: 'router', type: 'router', name: 'Router', subnet: '192.168.1.1', x: 550, y: 200 },
        { id: 'inet', type: 'internet', name: 'Internet', sub: '8.8.8.8', x: 720, y: 200 }
      ],
      links: [
        { id: 'link-host-eth0', from: 'host', to: 'eth0' },
        { id: 'link-eth0-router', from: 'eth0', to: 'router' },
        { id: 'link-router-inet', from: 'router', to: 'inet' }
      ]
    },
    steps: [
      {
        title: 'Linux host wants to reach 8.8.8.8',
        explanation: 'The Linux host wants to ping <strong>8.8.8.8</strong> (Google DNS) on the internet.\n\nIt needs to determine how to reach this destination — time to check the <strong>routing table</strong>.\n\n<strong>Prerequisite:</strong> Understand <strong>Route Table</strong> (ip route basics) and <strong>Default Gateway</strong> (concept) first.',
        highlights: ['host'],
        packets: [],
        tables: {}
      },
      {
        title: 'Check local routing table',
        explanation: 'The kernel checks the routing table for a match:\n<code>ip route show</code>\n\nThe routing table contains connected routes and any static routes. The host looks for a route to 8.8.8.8.',
        highlights: ['route'],
        packets: [],
        tables: {
          'route': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              'default': { via: '192.168.1.1', metric: 0 }
            }
          }
        }
      },
      {
        title: 'No specific route for 8.8.8.8 — use default',
        explanation: 'The routing table has no specific entry for 8.8.8.8.\n\nThe kernel falls back to the <strong>default route</strong> (0.0.0.0/0) — a catch-all that matches any destination not covered by a more specific route.',
        highlights: ['route'],
        packets: [],
        tables: {
          'route': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0, match: false },
              'default (0.0.0.0/0)': { via: '192.168.1.1', metric: 0, match: true }
            }
          }
        }
      },
      {
        title: 'Default route: via 192.168.1.1 dev eth0',
        explanation: 'The default route specifies:\n<code>default via 192.168.1.1 dev eth0</code>\n\nThis means: send all unmatched traffic to <strong>192.168.1.1</strong> (the Router) through interface <strong>eth0</strong>.',
        highlights: ['route'],
        packets: [],
        tables: {
          'route': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              'default (0.0.0.0/0)': { via: '192.168.1.1 dev eth0', metric: 0, match: true }
            }
          }
        }
      },
      {
        title: 'Packet: Host → eth0',
        explanation: 'The kernel builds the ICMP Echo packet and passes it to <strong>eth0</strong> for transmission.\n\nThe frame is addressed to the Router\'s MAC (ARP resolved for 192.168.1.1).',
        highlights: ['host'],
        activeLinks: ['link-host-eth0'],
        packets: [
          { id: 'dg1', type: 'data', from: 'host', to: 'eth0', color: 'var(--cyan)', label: 'ICMP Echo', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'eth0 sends to Router (192.168.1.1)',
        explanation: 'The packet travels from eth0 to the <strong>Router</strong> (default gateway).\n\nThe Router receives the packet on its LAN interface (192.168.1.1) and checks the destination IP.',
        highlights: ['eth0'],
        activeLinks: ['link-eth0-router'],
        packets: [
          { id: 'dg2', type: 'data', from: 'eth0', to: 'router', color: 'var(--cyan)', label: 'To Gateway', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Router forwards to Internet',
        explanation: 'The Router receives the packet and performs <strong>NAT</strong> (Network Address Translation), replacing the private source IP with its public IP.\n\nIt then forwards the packet toward the Internet.',
        highlights: ['router'],
        activeLinks: ['link-router-inet'],
        packets: [
          { id: 'dg3', type: 'data', from: 'router', to: 'inet', color: 'var(--green)', label: 'NAT + Forward', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Reply comes back',
        explanation: 'The Internet host (8.8.8.8) replies to the Router\'s public IP.\n\nThe Router receives the reply and looks up its NAT table to translate back to the private IP.',
        highlights: ['inet'],
        activeLinks: ['link-router-inet'],
        packets: [
          { id: 'dg4', type: 'data', from: 'inet', to: 'router', color: 'var(--amber)', label: 'Reply', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Router NAT translates, sends to Host',
        explanation: 'The Router performs reverse NAT:\n<code>Public IP → 192.168.1.10</code>\n\nIt forwards the translated reply to the Linux Host via eth0.',
        highlights: ['router'],
        activeLinks: ['link-eth0-router', 'link-host-eth0'],
        packets: [
          { id: 'dg5', type: 'data', from: 'router', to: 'eth0', color: 'var(--green)', label: 'Reply → Host', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Default gateway routing complete!',
        explanation: '<strong>Key takeaway:</strong> The default gateway is the <strong>fallback route</strong> for any destination not in the local routing table.\n\nHow it worked:\n1. Host checks routing table for 8.8.8.8 — <strong>no match</strong>\n2. Falls back to <strong>default route</strong> (0.0.0.0/0)\n3. Default via <strong>192.168.1.1</strong> (Router)\n4. Packet sent to Router → NAT → Internet\n5. Reply comes back through NAT\n\nConfigure with:\n<code>ip route add default via 192.168.1.1</code>\n<code>ip route show</code>',
        highlights: ['host', 'eth0', 'route', 'router', 'inet'],
        packets: [],
        tables: {
          'route': {
            routeTable: {
              '192.168.1.0/24': { via: 'eth0', metric: 0 },
              'default (0.0.0.0/0)': { via: '192.168.1.1 dev eth0', metric: 0 }
            }
          }
        }
      }
    ]
  },

  {
    id: 'gateway',
    name: 'Gateway',
    icon: '🚪',
    description: 'How routers act as gateways between different networks',
    category: 'Networking Fundamentals',
    order: 13,
    topology: {
      devices: [
        { id: 'pc-a', type: 'computer', name: 'PC-A', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 100, y: 300 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 280, y: 300 },
        { id: 'router', type: 'router', name: 'Router (Gateway)', ip: '192.168.1.1 / 10.0.0.1', mac: 'AA:BB:CC:DD:EE:FF', x: 500, y: 200 },
        { id: 'switch-b', type: 'switch', name: 'Switch B', x: 700, y: 300 },
        { id: 'server', type: 'server', name: 'Server', ip: '10.0.0.20', mac: '11:22:33:44:55:66', x: 880, y: 300 }
      ],
      links: [
        { id: 'link-pc-sw', from: 'pc-a', to: 'switch' },
        { id: 'link-sw-rt', from: 'switch', to: 'router' },
        { id: 'link-rt-sw2', from: 'router', to: 'switch-b' },
        { id: 'link-sw2-srv', from: 'switch-b', to: 'server' }
      ]
    },
    steps: [
      {
        title: 'PC-A wants to reach Server (10.0.0.20)',
        explanation: '<strong>PC-A</strong> (192.168.1.10) needs to send data to <strong>Server</strong> (10.0.0.20).\n\nThese two devices are on <strong>completely different networks</strong>:\n• PC-A: 192.168.1.0/24\n• Server: 10.0.0.0/24\n\nPC-A cannot send a frame directly to the Server — it needs help from a <strong>gateway</strong> (router).\n\n<strong>Prerequisite:</strong> Understand <strong>Default Gateway</strong> (how hosts reach other networks) and <strong>ARP</strong> (how MAC addresses are resolved) first.\n\n<strong>How does PC-A know the Server\'s IP?</strong> The application has it configured, or DNS resolved a hostname. See <strong>How Networks Start</strong> for the complete chain from user action to first packet.\n\n<strong>See also:</strong> <strong>Routing Table</strong> and <strong>Subnetting</strong> topics for routing decisions and network boundaries.',
        highlights: ['pc-a'],
        packets: [],
        tables: {}
      },
      {
        title: 'PC-A checks: 10.0.0.20 is NOT in my subnet',
        explanation: 'PC-A compares the destination IP against its own subnet:\n\n<code>Destination: 10.0.0.20</code>\n<code>My subnet: 192.168.1.0/24</code>\n\nThe networks don\'t match — the Server is <strong>remote</strong>. PC-A must forward the frame to its <strong>default gateway</strong> (Router at 192.168.1.1).',
        highlights: ['pc-a'],
        packets: [],
        tables: {
          'pc-a': { routing: { 'default': '192.168.1.1 (Router)' } }
        }
      },
      {
        title: 'PC-A sends frame to default gateway (Router)',
        explanation: 'PC-A builds an Ethernet frame with the <strong>Router\'s MAC</strong> as the Layer 2 destination.\n\nThe IP packet inside still has the <strong>Server\'s IP</strong> as the final destination — but the frame is addressed to the <strong>Router</strong> for local delivery.',
        highlights: ['pc-a'],
        activeLinks: ['link-pc-sw'],
        packets: [
          { id: 'gw1', type: 'data', from: 'pc-a', to: 'switch', color: 'var(--cyan)', label: 'Frame → Gateway', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          gw1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Router)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC-A)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC-A)'],
                ['Destination', '10.0.0.20 (Server)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards to Router',
        explanation: 'The Switch receives the frame and looks up the destination MAC (AA:BB:CC:DD:EE:FF).\n\nIt finds the Router on the connected port and <strong>forwards</strong> the frame directly.',
        highlights: ['switch'],
        activeLinks: ['link-sw-rt'],
        packets: [
          { id: 'gw2', type: 'data', from: 'switch', to: 'router', color: 'var(--cyan)', label: 'Frame → Router', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Router receives on eth0 (192.168.1.1)',
        explanation: 'The Router receives the frame on its <strong>eth0 interface</strong> (192.168.1.1) — the gateway interface for the 192.168.1.0/24 network.\n\nIt strips the Ethernet header and examines the <strong>IP destination</strong>: 10.0.0.20.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (connected)', '10.0.0.0/24': 'eth1 (connected)' } }
        }
      },
      {
        title: 'Router checks routing table for 10.0.0.0/24',
        explanation: 'The Router looks up the destination IP (10.0.0.20) in its <strong>routing table</strong>.\n\nIt finds a match:\n<code>10.0.0.0/24 → eth1 (directly connected)</code>\n\nThe network 10.0.0.0/24 is <strong>directly attached</strong> to the Router\'s eth1 interface. No next-hop router needed.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (connected)', '10.0.0.0/24': 'eth1 (connected)' } }
        }
      },
      {
        title: 'Router knows 10.0.0.0/24 is directly connected on eth1',
        explanation: 'Since the destination network is <strong>directly connected</strong>, the Router knows it can reach the Server through its <strong>eth1 interface</strong> (10.0.0.1).\n\nThe Router decrements the TTL and prepares to build a <strong>new Ethernet frame</strong> for the Server.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (connected)', '10.0.0.0/24': 'eth1 (connected)' } }
        }
      },
      {
        title: 'Router builds NEW frame for Server',
        explanation: 'The Router constructs a <strong>brand-new Ethernet frame</strong> for the second hop:\n\n<code>Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)</code>\n<code>Dst MAC: 11:22:33:44:55:66 (Server)</code>\n\n<strong>Crucial:</strong> The L2 header is completely new, but the L3 IP addresses remain unchanged — <code>192.168.1.10 → 10.0.0.20</code>.',
        highlights: ['router'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (connected)', '10.0.0.0/24': 'eth1 (connected)' } }
        },
        packetDetails: {
          gw3: {
            layers: [
              { name: 'Ethernet II (new frame)', color: 'var(--green)', fields: [
                ['Destination', '11:22:33:44:55:66 (Server)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Router eth1)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4 (unchanged)', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC-A)'],
                ['Destination', '10.0.0.20 (Server)'],
                ['TTL', '63 (decremented)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Frame: Router → Switch B',
        explanation: 'The Router sends the new frame out eth1 to <strong>Switch B</strong>.\n\nThe frame now carries the Router as source and Server as destination at Layer 2.',
        highlights: ['router'],
        activeLinks: ['link-rt-sw2'],
        packets: [
          { id: 'gw4', type: 'data', from: 'router', to: 'switch-b', color: 'var(--green)', label: 'New Frame → Server', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          gw4: {
            layers: [
              { name: 'Ethernet II', color: 'var(--green)', fields: [
                ['Destination', '11:22:33:44:55:66 (Server)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Router eth1)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC-A)'],
                ['Destination', '10.0.0.20 (Server)'],
                ['TTL', '63'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch B forwards to Server',
        explanation: 'Switch B receives the frame, looks up the destination MAC — found on the port connected to the Server.\n\nIt <strong>forwards</strong> the frame directly. The Server receives it, checks the destination IP — it matches!',
        highlights: ['switch-b', 'server'],
        activeLinks: ['link-sw2-srv'],
        packets: [
          { id: 'gw5', type: 'data', from: 'switch-b', to: 'server', color: 'var(--green)', label: 'Delivered', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Server receives and replies',
        explanation: 'The Server accepts the frame — the destination IP matches its own.\n\nIt processes the data and sends a <strong>reply</strong> back:\n<code>Src IP: 10.0.0.20 (Server)</code>\n<code>Dst IP: 192.168.1.10 (PC-A)</code>\n\nThe reply travels back through the Router (gateway) to reach PC-A.',
        highlights: ['server'],
        activeLinks: ['link-sw2-srv'],
        packets: [
          { id: 'gw6', type: 'data', from: 'server', to: 'router', color: 'var(--amber)', label: 'Reply', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Gateway routing complete!',
        explanation: 'The Router receives the reply from the Server, looks up the destination (192.168.1.10), and forwards it to PC-A via eth0.\n\n<strong>Key takeaway:</strong> A <strong>gateway</strong> (router) connects different networks. When devices need to communicate across networks, they send frames to the gateway, which:\n1. Strips the old L2 header\n2. Looks up the routing table\n3. Builds a <strong>new L2 header</strong> for the next network\n4. Forwards the packet\n\nThe L3 IP addresses stay the same end-to-end, but the L2 MAC addresses change at every hop.',
        highlights: ['pc-a', 'switch', 'router', 'switch-b', 'server'],
        packets: [],
        tables: {
          'router': { routing: { '192.168.1.0/24': 'eth0 (connected)', '10.0.0.0/24': 'eth1 (connected)' } }
        }
      }
    ]
  },

  {
    id: 'default-gateway',
    name: 'Default Gateway',
    icon: '🎯',
    description: 'How hosts use 0.0.0.0/0 default route to reach the internet',
    category: 'Networking Fundamentals',
    order: 12,
    topology: {
      devices: [
        { id: 'pc', type: 'computer', name: 'PC', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', x: 100, y: 300 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 300, y: 300 },
        { id: 'gateway', type: 'router', name: 'Default Gateway', ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', x: 520, y: 200 },
        { id: 'internet', type: 'internet', name: 'Internet', ip: '8.8.8.8', mac: '11:22:33:44:55:66', x: 750, y: 200 }
      ],
      links: [
        { id: 'link-pc-sw', from: 'pc', to: 'switch' },
        { id: 'link-sw-gw', from: 'switch', to: 'gateway' },
        { id: 'link-gw-int', from: 'gateway', to: 'internet' }
      ]
    },
    steps: [
      {
        title: 'PC wants to reach Google (8.8.8.8)',
        explanation: '<strong>PC</strong> (192.168.1.10) wants to access Google at <code>8.8.8.8</code>.\n\nThe destination is on the <strong>internet</strong> — far beyond the local network. The PC needs a way to route traffic outside its own subnet.\n\n<strong>Prerequisite:</strong> You should first understand <strong>ARP</strong> (how MAC addresses are discovered) and <strong>Layer 2</strong> (how switches forward frames).\n\n<strong>How does PC know 8.8.8.8?</strong> The user typed <code>ping 8.8.8.8</code> or a DNS server resolved a hostname to this IP. See <strong>How Networks Start</strong> for the full journey.\n\n<strong>See also:</strong> <strong>Subnetting</strong> topic to understand why different subnets need a gateway.',
        highlights: ['pc'],
        packets: [],
        tables: {}
      },
      {
        title: 'PC checks routing table — no specific route for 8.8.8.8',
        explanation: 'PC checks its <strong>routing table</strong> for a route to 8.8.8.8.\n\nThere is no specific route for this IP. But there IS a <strong>default route</strong>:\n<code>0.0.0.0/0 → 192.168.1.1 (Gateway)</code>\n\nThe <code>0.0.0.0/0</code> entry is a <strong>wildcard</strong> — it matches ANY destination that doesn\'t have a more specific route.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { routing: { '0.0.0.0/0': '192.168.1.1 (Default Gateway)' } }
        }
      },
      {
        title: 'PC uses default gateway (0.0.0.0/0 matches everything)',
        explanation: 'The default route <code>0.0.0.0/0</code> is like saying "send <strong>everything else</strong> to this gateway."\n\nIt\'s the network equivalent of a <strong>catch-all</strong>. Any traffic not destined for the local subnet gets forwarded to the Default Gateway (192.168.1.1), which knows how to reach the internet.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { routing: { '0.0.0.0/0': '192.168.1.1 (Default Gateway)' } }
        }
      },
      {
        title: 'PC sends frame to Gateway MAC',
        explanation: 'PC builds an Ethernet frame addressed to the <strong>Gateway\'s MAC</strong>:\n\n<code>Src MAC: AA:BB:CC:DD:EE:01 (PC)</code>\n<code>Dst MAC: AA:BB:CC:DD:EE:FF (Gateway)</code>\n\nThe IP packet inside targets <code>8.8.8.8</code>, but the frame is for local delivery to the Gateway.',
        highlights: ['pc'],
        activeLinks: ['link-pc-sw'],
        packets: [
          { id: 'dg1', type: 'data', from: 'pc', to: 'switch', color: 'var(--cyan)', label: 'To Gateway', duration: 1200 }
        ],
        tables: {
          'pc': { routing: { '0.0.0.0/0': '192.168.1.1 (Default Gateway)' } }
        },
        packetDetails: {
          dg1: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:FF (Gateway)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (PC)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC)'],
                ['Destination', '8.8.8.8 (Google)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Switch forwards to Gateway',
        explanation: 'The Switch receives the frame and looks up the destination MAC — found on the port connected to the Default Gateway.\n\nIt <strong>forwards</strong> the frame directly to the Gateway.',
        highlights: ['switch'],
        activeLinks: ['link-sw-gw'],
        packets: [
          { id: 'dg2', type: 'data', from: 'switch', to: 'gateway', color: 'var(--cyan)', label: 'To Gateway', duration: 1000 }
        ],
        tables: {}
      },
      {
        title: 'Gateway receives, checks routing table',
        explanation: 'The Default Gateway receives the frame, strips the Ethernet header, and examines the IP destination: <code>8.8.8.8</code>.\n\nIt checks its <strong>routing table</strong> and finds a route to the internet via its <strong>eth1 interface</strong> (WAN side).',
        highlights: ['gateway'],
        packets: [],
        tables: {
          'gateway': { routing: { '192.168.1.0/24': 'eth0 (LAN)', '0.0.0.0/0': 'eth1 (WAN → ISP)' } }
        }
      },
      {
        title: 'Gateway has route to internet via eth1',
        explanation: 'The Gateway\'s routing table shows:\n<code>192.168.1.0/24 → eth0 (LAN side)</code>\n<code>0.0.0.0/0 → eth1 (WAN → ISP)</code>\n\nThe default route on the WAN side means "send all non-local traffic to the <strong>ISP</strong>." The Gateway decrements the TTL and builds a new frame for the internet.',
        highlights: ['gateway'],
        packets: [],
        tables: {
          'gateway': { routing: { '192.168.1.0/24': 'eth0 (LAN)', '0.0.0.0/0': 'eth1 (WAN → ISP)' } }
        }
      },
      {
        title: 'Gateway forwards to Internet',
        explanation: 'The Gateway sends the packet out its <strong>WAN interface</strong> (eth1) toward the Internet.\n\nIt may also perform <strong>NAT</strong> (replacing the private source IP with its public IP), but the key idea is that the Gateway knows how to reach the internet because of its default route.',
        highlights: ['gateway'],
        activeLinks: ['link-gw-int'],
        packets: [
          { id: 'dg3', type: 'data', from: 'gateway', to: 'internet', color: 'var(--green)', label: 'To Internet', duration: 1200 }
        ],
        tables: {},
        packetDetails: {
          dg3: {
            layers: [
              { name: 'Ethernet II', color: 'var(--green)', fields: [
                ['Destination', '11:22:33:44:55:66 (ISP Gateway)'],
                ['Source', 'AA:BB:CC:DD:EE:FF (Gateway)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (PC)'],
                ['Destination', '8.8.8.8 (Google)'],
                ['TTL', '63 (decremented)'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Internet responds — Gateway translates back',
        explanation: 'Google (8.8.8.8) responds and the reply reaches the Gateway.\n\nThe Gateway looks up its <strong>NAT table</strong> (or routing table) and translates the destination back to the PC\'s private IP: <code>192.168.1.10</code>.',
        highlights: ['gateway'],
        activeLinks: ['link-gw-int'],
        packets: [
          { id: 'dg4', type: 'data', from: 'internet', to: 'gateway', color: 'var(--amber)', label: 'Reply', duration: 1200 }
        ],
        tables: {
          'gateway': { routing: { '192.168.1.0/24': 'eth0 (LAN)', '0.0.0.0/0': 'eth1 (WAN → ISP)' } }
        }
      },
      {
        title: 'Default Gateway delivers reply to PC',
        explanation: 'The Gateway builds a new frame and sends the reply through the Switch to the PC.\n\n<strong>Key takeaway:</strong> A <strong>default gateway</strong> is the exit door from a local network. The <code>0.0.0.0/0</code> route is the most important route on any host — it tells the device "if you don\'t know where to send a packet, send it here."\n\nEvery device on a network needs a default gateway to reach the internet. Without it, the PC could only communicate with devices on its own subnet (192.168.1.0/24).',
        highlights: ['pc', 'switch', 'gateway'],
        activeLinks: ['link-sw-gw'],
        packets: [
          { id: 'dg5', type: 'data', from: 'gateway', to: 'pc', color: 'var(--green)', label: 'Reply → PC', duration: 1200 }
        ],
        tables: {
          'pc': { routing: { '0.0.0.0/0': '192.168.1.1 (Default Gateway)' } },
          'gateway': { routing: { '192.168.1.0/24': 'eth0 (LAN)', '0.0.0.0/0': 'eth1 (WAN → ISP)' } }
        }
      }
    ]
  },

  {
    id: 'network-basics',
    name: 'How Networks Start',
    icon: '🚀',
    description: 'From user action to first packet — the complete journey',
    category: 'Networking Fundamentals',
    order: 8,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'user', type: 'computer', name: 'User', x: 100, y: 200 },
        { id: 'app', type: 'linux', name: 'Application', x: 250, y: 200 },
        { id: 'dns', type: 'server', name: 'DNS Server', x: 450, y: 100 },
        { id: 'arp', type: 'linux', name: 'ARP Cache', x: 450, y: 300 },
        { id: 'nic', type: 'nic', name: 'NIC (eth0)', x: 650, y: 200 },
        { id: 'switch', type: 'switch', name: 'Switch', x: 800, y: 200 }
      ],
      links: [
        { id: 'l1', from: 'user', to: 'app' },
        { id: 'l2', from: 'app', to: 'dns' },
        { id: 'l3', from: 'app', to: 'arp' },
        { id: 'l4', from: 'app', to: 'nic' },
        { id: 'l5', from: 'nic', to: 'switch' }
      ]
    },
    steps: [
      {
        title: 'User initiates a network action',
        explanation: 'Everything starts with a <strong>user action</strong>:\n\n• User types <code>ping google.com</code>\n• User opens a web browser and enters a URL\n• User runs <code>ssh server.example.com</code>\n\nThe application now needs to communicate with a remote server. But how does it know <strong>where</strong> to send the data?',
        highlights: ['user'],
        packets: [],
        tables: {}
      },
      {
        title: 'Application needs the server\'s IP address',
        explanation: 'The application has a <strong>hostname</strong> (like google.com) but needs an <strong>IP address</strong> to route packets.\n\n<strong>Two scenarios:</strong>\n\n1. <strong>Hostname given</strong> (e.g., google.com) → Need <strong>DNS</strong> to resolve to IP\n2. <strong>IP given directly</strong> (e.g., ping 192.168.1.20) → Skip DNS\n\nSee the <strong>DNS topic</strong> for how resolution works.',
        highlights: ['app'],
        packets: [],
        tables: {}
      },
      {
        title: 'DNS resolves hostname to IP (if needed)',
        explanation: 'If the user typed a <strong>hostname</strong>, the application sends a <strong>DNS query</strong>:\n\n<code>DNS Query: google.com → ?</code>\n<code>DNS Reply: google.com → 142.250.80.46</code>\n\nNow the application has the <strong>destination IP</strong>. See the <strong>DNS topic</strong> for the full process.',
        highlights: ['app', 'dns'],
        activeLinks: ['l2'],
        packets: [
          { id: 'dns1', type: 'data', from: 'app', to: 'dns', color: 'var(--purple)', label: 'DNS Query', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Application needs the destination MAC address',
        explanation: 'Now the application has the <strong>IP address</strong>, but to send an <strong>Ethernet frame</strong>, it needs the <strong>MAC address</strong>.\n\n<strong>Question:</strong> How does the sender know the destination MAC?\n\n<strong>Answer:</strong> <strong>ARP</strong> (Address Resolution Protocol) discovers it.\n\nBut first — is the destination on the <strong>same network</strong> or a <strong>different network</strong>?',
        highlights: ['app'],
        packets: [],
        tables: {}
      },
      {
        title: 'Same network? Use ARP directly. Different network? Use Gateway.',
        explanation: '<strong>If same subnet</strong> (e.g., both 192.168.1.x):\n• Use <strong>ARP</strong> to find the destination MAC directly\n• See the <strong>ARP topic</strong>\n\n<strong>If different subnet</strong> (e.g., 192.168.1.x → 8.8.8.8):\n• Send frame to the <strong>default gateway</strong> (router)\n• Use <strong>ARP</strong> to find the gateway\'s MAC\n• See <strong>Default Gateway</strong> and <strong>Gateway</strong> topics\n\nThe <strong>routing table</strong> decides which path to take.',
        highlights: ['app'],
        packets: [],
        tables: {}
      },
      {
        title: 'ARP discovers the MAC address',
        explanation: 'The application (or OS kernel) sends an <strong>ARP broadcast</strong>:\n\n<code>ARP Request: "Who has 192.168.1.20?"</code>\n<code>ARP Reply: "192.168.1.20 is at AA:BB:CC:DD:EE:02"</code>\n\nNow we have both the <strong>IP address</strong> and the <strong>MAC address</strong>. See the <strong>ARP topic</strong> for the full process.',
        highlights: ['app', 'arp'],
        activeLinks: ['l3'],
        packets: [
          { id: 'arp1', type: 'data', from: 'app', to: 'arp', color: 'var(--amber)', label: 'ARP Query', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Application builds the Ethernet frame',
        explanation: 'Now the application has everything it needs:\n\n<code>Source MAC: AA:BB:CC:DD:EE:01 (our NIC)</code>\n<code>Destination MAC: AA:BB:CC:DD:EE:02 (target)</code>\n<code>Source IP: 192.168.1.10</code>\n<code>Destination IP: 192.168.1.20</code>\n\nThe <strong>Ethernet frame</strong> is constructed with the IP packet inside.',
        highlights: ['app'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Destination', 'AA:BB:CC:DD:EE:02 (PC-B)'],
                ['Source', 'AA:BB:CC:DD:EE:01 (Our NIC)'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10'],
                ['Destination', '192.168.1.20'],
                ['Protocol', 'ICMP (1)']
              ]}
            ]
          }
        }
      },
      {
        title: 'NIC transmits the frame onto the wire',
        explanation: 'The <strong>NIC</strong> (Network Interface Card) takes the frame and <strong>transmits it</strong> as electrical/optical signals on the cable.\n\nThe <strong>switch</strong> receives the frame and forwards it to the destination. See the <strong>Layer 2 topic</strong> for how switches work.',
        highlights: ['nic', 'switch'],
        activeLinks: ['l4', 'l5'],
        packets: [
          { id: 'tx1', type: 'data', from: 'nic', to: 'switch', color: 'var(--green)', label: 'Frame on wire', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'The complete journey',
        explanation: '<strong>Full chain from user action to network packet:</strong>\n\n1. <strong>User</strong> types command or opens URL\n2. <strong>Application</strong> needs destination IP\n3. <strong>DNS</strong> resolves hostname → IP (if needed)\n4. <strong>Routing table</strong> decides: same network or gateway?\n5. <strong>ARP</strong> discovers MAC address\n6. <strong>Frame</strong> is built with MAC + IP headers\n7. <strong>NIC</strong> transmits onto the wire\n8. <strong>Switch</strong> forwards to destination\n\nEach step is covered in detail in the other topics!',
        highlights: ['user', 'app', 'dns', 'arp', 'nic', 'switch'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'mac-address',
    name: 'MAC Address',
    icon: '🏷️',
    description: 'Physical address — the unique ID burned into every NIC',
    category: 'Components',
    order: 0,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'nic', type: 'nic', name: 'Network Card', subnet: 'AA:BB:CC:DD:EE:FF', x: 100, y: 100 },
        { id: 'oui', type: 'box', name: 'OUI (Vendor)', sub: 'First 3 bytes: AA:BB:CC', x: 350, y: 60 },
        { id: 'nicid', type: 'box', name: 'NIC ID (Device)', sub: 'Last 3 bytes: DD:EE:FF', x: 350, y: 160 },
        { id: 'types', type: 'box', name: 'MAC Types', sub: 'Unicast / Multicast / Broadcast', x: 600, y: 100 }
      ],
      links: [
        { id: 'link-nic-oui', from: 'nic', to: 'oui' },
        { id: 'link-nic-id', from: 'nic', to: 'nicid' },
        { id: 'link-nic-types', from: 'nic', to: 'types' }
      ]
    },
    steps: [
      {
        title: 'What is a MAC Address?',
        explanation: 'A <strong>MAC (Media Access Control)</strong> address is the <strong>physical address</strong> burned into every Network Interface Card (NIC) by the manufacturer.\n\nIt operates at <strong>Layer 2</strong> (Data Link layer) of the OSI model and is used to identify devices on a local network segment.\n\nUnlike IP addresses (which are logical and can change), a MAC address is a <strong>permanent hardware identifier</strong> — though it can be spoofed in software.',
        highlights: ['nic'],
        packets: [],
        tables: {}
      },
      {
        title: 'MAC Address Format',
        explanation: 'A MAC address is a <strong>48-bit (6-byte)</strong> number written in hexadecimal:\n\n<code>AA:BB:CC:DD:EE:FF</code>\n\nEach pair of hex digits represents one byte. The first 3 bytes identify the <strong>vendor (OUI)</strong>, and the last 3 bytes identify the <strong>specific device</strong>.',
        highlights: ['nic'],
        packets: [],
        tables: {},
        packetDetails: {
          mac: {
            layers: [
              { name: 'MAC Address (48-bit)', color: 'var(--blue)', fields: [
                ['Full Address', 'AA:BB:CC:DD:EE:FF'],
                ['Bit Length', '48 bits (6 bytes)'],
                ['Format', 'Hexadecimal (XX:XX:XX:XX:XX:XX)']
              ]}
            ]
          }
        }
      },
      {
        title: 'OUI — Vendor Identifier',
        explanation: 'The first <strong>3 bytes (24 bits)</strong> of a MAC address form the <strong>OUI (Organizationally Unique Identifier)</strong>.\n\n<code>AA:BB:CC</code> ← OUI identifies the manufacturer\n\nThe IEEE (Institute of Electrical and Electronics Engineers) assigns OUIs to companies. For example:\n• Intel: <code>00:1B:21</code>\n• Cisco: <code>00:1A:A0</code>\n• Apple: <code>3C:22:FB</code>',
        highlights: ['oui'],
        packets: [],
        tables: {}
      },
      {
        title: 'NIC ID — Device Identifier',
        explanation: 'The last <strong>3 bytes (24 bits)</strong> form the <strong>NIC ID</strong> — a unique identifier assigned by the manufacturer.\n\n<code>DD:EE:FF</code> ← NIC ID (device-specific)\n\nCombined with the OUI, this creates a globally unique address. With 2²⁴ (16.7 million) possible NIC IDs per OUI, manufacturers rarely run out.',
        highlights: ['nicid'],
        packets: [],
        tables: {}
      },
      {
        title: 'Unicast MAC',
        explanation: 'A <strong>unicast</strong> MAC address identifies a <strong>single device</strong> on the network.\n\nThe <strong>least significant bit</strong> of the first byte is <strong>even (0)</strong>:\n<code>AA:BB:CC:DD:EE:02</code> → Unicast\n\nWhen a frame is sent to a unicast address, only the device with that MAC will accept it. This is the most common type of MAC address.',
        highlights: ['types'],
        packets: [],
        tables: {}
      },
      {
        title: 'Broadcast MAC',
        explanation: 'The <strong>broadcast</strong> MAC address is <code>FF:FF:FF:FF:FF:FF</code> — all bits set to 1.\n\nWhen a frame is sent to this address, <strong>every device</strong> on the local network segment will process it.\n\nBroadcast MAC is used for:\n• ARP requests ("Who has this IP?")\n• DHCP discovery ("I need an IP!")\n• Network announcements',
        highlights: ['types'],
        packets: [],
        tables: {}
      },
      {
        title: 'Multicast MAC',
        explanation: 'A <strong>multicast</strong> MAC address identifies a <strong>group of devices</strong>.\n\nThe <strong>least significant bit</strong> of the first byte is <strong>odd (1)</strong>:\n<code>01:00:5E:xx:xx:xx</code> → IPv4 Multicast\n<code>33:33:xx:xx:xx:xx</code> → IPv6 Multicast\n\nMulticast allows one sender to reach multiple receivers efficiently — without broadcasting to everyone.',
        highlights: ['types'],
        packets: [],
        tables: {}
      },
      {
        title: 'MAC Address Summary',
        explanation: '<strong>Key takeaway:</strong> MAC addresses are the foundation of Layer 2 communication.\n\n• <strong>48-bit</strong> hexadecimal address (e.g., AA:BB:CC:DD:EE:FF)\n• <strong>OUI</strong> (first 3 bytes) = vendor identifier\n• <strong>NIC ID</strong> (last 3 bytes) = device identifier\n• <strong>Unicast</strong> = single device (first byte even)\n• <strong>Broadcast</strong> = all devices (FF:FF:FF:FF:FF:FF)\n• <strong>Multicast</strong> = group of devices (first byte odd)\n\nSwitches use MAC addresses to forward frames. ARP maps IP addresses to MAC addresses.',
        highlights: ['nic', 'oui', 'nicid', 'types'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'ip-address',
    name: 'IP Address',
    icon: '📍',
    description: 'Logical address — how devices are identified across networks',
    category: 'Components',
    order: 1,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ip', type: 'box', name: 'IPv4 Address', sub: '32-bit dotted decimal', x: 100, y: 100 },
        { id: 'classA', type: 'box', name: 'Class A', sub: '1.0.0.0 — 126.255.255.255', color: 'var(--green)', x: 350, y: 40 },
        { id: 'classB', type: 'box', name: 'Class B', sub: '128.0.0.0 — 191.255.255.255', color: 'var(--cyan)', x: 350, y: 120 },
        { id: 'classC', type: 'box', name: 'Class C', sub: '192.0.0.0 — 223.255.255.255', color: 'var(--amber)', x: 350, y: 200 },
        { id: 'priv', type: 'box', name: 'Private Ranges', sub: '10.x / 172.16-31.x / 192.168.x', x: 600, y: 100 }
      ],
      links: [
        { id: 'link-ip-a', from: 'ip', to: 'classA' },
        { id: 'link-ip-b', from: 'ip', to: 'classB' },
        { id: 'link-ip-c', from: 'ip', to: 'classC' },
        { id: 'link-ip-priv', from: 'ip', to: 'priv' }
      ]
    },
    steps: [
      {
        title: 'What is an IP Address?',
        explanation: 'An <strong>IP (Internet Protocol)</strong> address is a <strong>logical address</strong> assigned to devices for routing across networks.\n\nUnlike MAC addresses (which are burned into hardware), IP addresses are <strong>configured by software</strong> — via DHCP or manual assignment.\n\nIP addresses operate at <strong>Layer 3</strong> (Network layer) and enable communication across different networks.',
        highlights: ['ip'],
        packets: [],
        tables: {}
      },
      {
        title: 'IPv4 Format',
        explanation: 'An <strong>IPv4 address</strong> is a <strong>32-bit</strong> number written in <strong>dotted decimal</strong> notation:\n\n<code>192.168.1.10</code>\n\nEach number (octet) represents 8 bits, ranging from 0 to 255. With 32 bits, IPv4 provides approximately <strong>4.3 billion</strong> unique addresses.',
        highlights: ['ip'],
        packets: [],
        tables: {},
        packetDetails: {
          ipv4: {
            layers: [
              { name: 'IPv4 Address', color: 'var(--cyan)', fields: [
                ['Address', '192.168.1.10'],
                ['Bit Length', '32 bits (4 octets)'],
                ['Format', 'Dotted Decimal (X.X.X.X)'],
                ['Total Addresses', '~4.3 billion (2³²)']
              ]}
            ]
          }
        }
      },
      {
        title: 'Class A Networks',
        explanation: '<strong>Class A</strong> networks use the first octet for the network and the remaining three for hosts:\n\n<code>Network.Host.Host.Host</code>\n<code>1.0.0.0 — 126.255.255.255</code>\n\nPrefix: <code>/8</code> (subnet mask 255.0.0.0)\nHosts per network: <strong>16.7 million</strong> (2²⁴)\n\nClass A is designed for <strong>very large networks</strong> — originally assigned to major corporations and governments.',
        highlights: ['classA'],
        packets: [],
        tables: {}
      },
      {
        title: 'Class B Networks',
        explanation: '<strong>Class B</strong> networks use the first two octets for the network and two for hosts:\n\n<code>Network.Network.Host.Host</code>\n<code>128.0.0.0 — 191.255.255.255</code>\n\nPrefix: <code>/16</code> (subnet mask 255.255.0.0)\nHosts per network: <strong>65,536</strong> (2¹⁶)\n\nClass B is suitable for <strong>medium to large organizations</strong> — universities, large companies.',
        highlights: ['classB'],
        packets: [],
        tables: {}
      },
      {
        title: 'Class C Networks',
        explanation: '<strong>Class C</strong> networks use the first three octets for the network and one for hosts:\n\n<code>Network.Network.Network.Host</code>\n<code>192.0.0.0 — 223.255.255.255</code>\n\nPrefix: <code>/24</code> (subnet mask 255.255.255.0)\nHosts per network: <strong>254</strong> (2⁸ - 2)\n\nClass C is used for <strong>small networks</strong> — small businesses, home networks.',
        highlights: ['classC'],
        packets: [],
        tables: {}
      },
      {
        title: 'Private IP Ranges',
        explanation: '<strong>Private IP addresses</strong> (defined in RFC 1918) are not routable on the public internet:\n\n<code>Class A: 10.0.0.0 — 10.255.255.255</code> (10.0.0.0/8)\n<code>Class B: 172.16.0.0 — 172.31.255.255</code> (172.16.0.0/12)\n<code>Class C: 192.168.0.0 — 192.168.255.255</code> (192.168.0.0/16)\n\nThese addresses can be used freely within private networks but must be <strong>translated (NAT)</strong> before reaching the internet.',
        highlights: ['priv'],
        packets: [],
        tables: {}
      },
      {
        title: 'Public vs Private',
        explanation: '<strong>Public IPs</strong> are globally unique and routable on the internet — assigned by ISPs.\n\n<strong>Private IPs</strong> are used within local networks and are not routable externally.\n\n<strong>NAT (Network Address Translation)</strong> allows many devices with private IPs to share a single public IP:\n\n<code>192.168.1.10 → NAT → 203.0.113.1 (public)</code>\n\nThis is how most home and office networks access the internet.',
        highlights: ['priv'],
        packets: [],
        tables: {}
      },
      {
        title: 'IP Address Summary',
        explanation: '<strong>Key takeaway:</strong> IP addresses are the foundation of Layer 3 routing.\n\n• <strong>32-bit</strong> dotted decimal (e.g., 192.168.1.10)\n• <strong>Class A:</strong> /8 prefix, 16.7M hosts (large networks)\n• <strong>Class B:</strong> /16 prefix, 65K hosts (medium networks)\n• <strong>Class C:</strong> /24 prefix, 254 hosts (small networks)\n• <strong>Private ranges:</strong> 10.x / 172.16-31.x / 192.168.x\n• <strong>Public IPs</strong> are routable on the internet; <strong>private IPs</strong> need NAT\n\nIP addresses enable routing between different networks — the core function of Layer 3.',
        highlights: ['ip', 'classA', 'classB', 'classC', 'priv'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'subnetting',
    name: 'Subnetting & CIDR',
    icon: '🧮',
    description: 'How networks are divided — subnet masks, CIDR notation, IP ranges',
    category: 'Components',
    order: 2,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ip', type: 'box', name: 'IP: 192.168.1.100', sub: '/24', x: 100, y: 80 },
        { id: 'mask', type: 'box', name: 'Subnet Mask', sub: '255.255.255.0', x: 100, y: 180 },
        { id: 'net', type: 'box', name: 'Network', sub: '192.168.1.0', color: 'var(--green)', x: 350, y: 40 },
        { id: 'brd', type: 'box', name: 'Broadcast', sub: '192.168.1.255', color: 'var(--red)', x: 350, y: 120 },
        { id: 'usable', type: 'box', name: 'Usable Hosts', sub: '192.168.1.1 — 192.168.1.254', color: 'var(--cyan)', x: 350, y: 200 },
        { id: 'calc', type: 'box', name: 'Hosts: 254', sub: '2^8 - 2', x: 600, y: 100 }
      ],
      links: [
        { id: 'link-ip-mask', from: 'ip', to: 'mask' },
        { id: 'link-ip-net', from: 'ip', to: 'net' },
        { id: 'link-ip-brd', from: 'ip', to: 'brd' },
        { id: 'link-ip-usable', from: 'ip', to: 'usable' },
        { id: 'link-ip-calc', from: 'ip', to: 'calc' }
      ]
    },
    steps: [
      {
        title: 'What is Subnetting?',
        explanation: '<strong>Subnetting</strong> is the process of dividing a large network into smaller, more manageable <strong>sub-networks (subnets)</strong>.\n\nEach subnet is a separate broadcast domain. Subnetting improves:\n• <strong>Security</strong> — isolate traffic between groups\n• <strong>Performance</strong> — reduce broadcast domain size\n• <strong>Management</strong> — organize devices logically\n\nThe key tool for subnetting is the <strong>subnet mask</strong>.',
        highlights: ['ip'],
        packets: [],
        tables: {}
      },
      {
        title: 'Subnet Mask',
        explanation: 'A <strong>subnet mask</strong> determines which part of an IP address is the <strong>network</strong> and which is the <strong>host</strong>.\n\n<code>IP: 192.168.1.100</code>\n<code>Mask: 255.255.255.0</code>\n\nThe mask performs a <strong>bitwise AND</strong> operation with the IP to extract the network address:\n\n<code>192.168.1.100 AND 255.255.255.0 = 192.168.1.0</code>',
        highlights: ['mask'],
        packets: [],
        tables: {},
        packetDetails: {
          mask: {
            layers: [
              { name: 'Subnet Mask', color: 'var(--amber)', fields: [
                ['Mask (Decimal)', '255.255.255.0'],
                ['Mask (Binary)', '11111111.11111111.11111111.00000000'],
                ['CIDR Notation', '/24'],
                ['Network Bits', '24'],
                ['Host Bits', '8']
              ]}
            ]
          }
        }
      },
      {
        title: 'CIDR Notation',
        explanation: '<strong>CIDR (Classless Inter-Domain Routing)</strong> notation uses a slash followed by the number of network bits:\n\n<code>/24 = 255.255.255.0</code> (24 network bits)\n<code>/16 = 255.255.0.0</code> (16 network bits)\n<code>/8 = 255.0.0.0</code> (8 network bits)\n\nCIDR replaced the old classful system, allowing <strong>flexible</strong> subnet sizes. A /20 network, for example, gives 4,094 hosts — between a /16 and a /24.',
        highlights: ['mask'],
        packets: [],
        tables: {}
      },
      {
        title: 'Network Address',
        explanation: 'The <strong>network address</strong> is the <strong>first address</strong> in a subnet — where all host bits are set to 0.\n\n<code>192.168.1.0</code> (for /24)\n\nThis address <strong>cannot</strong> be assigned to a host. It identifies the network itself and is used in routing tables.',
        highlights: ['net'],
        packets: [],
        tables: {}
      },
      {
        title: 'Broadcast Address',
        explanation: 'The <strong>broadcast address</strong> is the <strong>last address</strong> in a subnet — where all host bits are set to 1.\n\n<code>192.168.1.255</code> (for /24)\n\nWhen a frame is sent to this address, <strong>every host</strong> in the subnet receives it. This address also <strong>cannot</strong> be assigned to a host.',
        highlights: ['brd'],
        packets: [],
        tables: {}
      },
      {
        title: 'Usable Host Range',
        explanation: 'The <strong>usable host range</strong> includes all addresses between the network and broadcast addresses:\n\n<code>First usable: 192.168.1.1</code>\n<code>Last usable: 192.168.1.254</code>\n\nThese are the addresses that <strong>can</strong> be assigned to devices. For a /24 subnet, that gives 254 usable addresses.',
        highlights: ['usable'],
        packets: [],
        tables: {}
      },
      {
        title: 'Calculating Hosts',
        explanation: 'The number of usable hosts in a subnet is calculated with:\n\n<code>2^(32 - prefix) - 2</code>\n\nFor /24: 2^(32-24) - 2 = 2⁸ - 2 = <strong>254 hosts</strong>\n\nThe <strong>-2</strong> accounts for the network and broadcast addresses (which can\'t be assigned).\n\nCommon subnets:\n<code>/24 → 254 hosts</code>\n<code>/16 → 65,534 hosts</code>\n<code>/20 → 4,094 hosts</code>',
        highlights: ['calc'],
        packets: [],
        tables: {}
      },
      {
        title: 'Subnetting Summary',
        explanation: '<strong>Key takeaway:</strong> Subnetting divides networks into manageable segments.\n\n• <strong>Subnet mask</strong> separates network bits from host bits\n• <strong>CIDR notation</strong> (/24, /16, etc.) is shorthand for the mask\n• <strong>Network address</strong> = first address (all host bits 0) — unusable\n• <strong>Broadcast address</strong> = last address (all host bits 1) — unusable\n• <strong>Usable hosts</strong> = 2^(host bits) - 2\n\nUnderstanding subnetting is essential for network design, IP allocation, and troubleshooting.',
        highlights: ['ip', 'mask', 'net', 'brd', 'usable', 'calc'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'dhcp-table',
    name: 'DHCP Lease Table',
    icon: '📑',
    description: 'Active IP leases — who has what address and for how long',
    category: 'Components',
    order: 6,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'srv', type: 'box', name: 'DHCP Server', sub: '192.168.1.1', x: 100, y: 100 },
        { id: 'table', type: 'box', name: 'Lease Table', sub: 'Active Assignments', x: 350, y: 80 },
        { id: 'lease1', type: 'box', name: '192.168.1.100', sub: 'AA:BB:CC:01:01:01 — PC-A — 8h left', color: 'var(--green)', x: 550, y: 40 },
        { id: 'lease2', type: 'box', name: '192.168.1.101', sub: 'AA:BB:CC:01:01:02 — PC-B — 6h left', color: 'var(--green)', x: 550, y: 120 },
        { id: 'pool', type: 'box', name: 'Pool: 192.168.1.100-200', sub: '101 addresses available', x: 550, y: 200 }
      ],
      links: [
        { id: 'link-srv-table', from: 'srv', to: 'table' },
        { id: 'link-table-l1', from: 'table', to: 'lease1' },
        { id: 'link-table-l2', from: 'table', to: 'lease2' },
        { id: 'link-table-pool', from: 'table', to: 'pool' }
      ]
    },
    steps: [
      {
        title: 'What is a DHCP Table?',
        explanation: 'The <strong>DHCP Lease Table</strong> is a database maintained by the DHCP server.\n\nIt tracks which devices have been assigned which IP addresses, along with important metadata like MAC addresses, hostnames, and lease expiry times.\n\nThink of it as a <strong>guest registry</strong> — the DHCP server "checks in" each device and records the details of their stay.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Lease Entry Fields',
        explanation: 'Each entry in the lease table contains several fields:\n\n<code>IP Address</code> — The assigned IP (e.g., 192.168.1.100)\n<code>MAC Address</code> — Hardware address of the client (e.g., AA:BB:CC:01:01:01)\n<code>Hostname</code> — Client name (e.g., PC-A)\n<code>Lease Time</code> — How long the lease is valid (e.g., 8 hours)\n<code>Expiry</code> — When the lease expires (countdown timer)\n\nThese fields let the server track who is using which IP and when the address will return to the pool.',
        highlights: ['table'],
        packets: [],
        tables: {
          'srv': {
            dhcpLeases: {
              '192.168.1.100': { mac: 'AA:BB:CC:01:01:01', hostname: 'PC-A', leaseTime: '8h', expiry: '7:59:58', isNew: true },
              '192.168.1.101': { mac: 'AA:BB:CC:01:01:02', hostname: 'PC-B', leaseTime: '6h', expiry: '5:59:58' }
            }
          }
        }
      },
      {
        title: 'Lease Lifecycle',
        explanation: 'DHCP leases follow a lifecycle defined by the <strong>DORA</strong> process:\n\n<strong>1. Discover</strong> — Client broadcasts looking for a DHCP server\n<strong>2. Offer</strong> — Server offers an available IP from the pool\n<strong>3. Request</strong> — Client accepts the offered IP\n<strong>4. Acknowledge</strong> — Server confirms and records the lease\n\nRenewal happens automatically:\n• At <strong>50% of lease time</strong> — client tries to renew with the original server\n• At <strong>87.5%</strong> — client broadcasts to any available server if the original is unreachable\n• At <strong>100%</strong> — lease expires, IP returns to the pool',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'IP Pool Range',
        explanation: 'The DHCP server manages an <strong>address pool</strong> — a range of IPs it can assign.\n\nIn this example:\n<code>Pool: 192.168.1.100 — 192.168.1.200</code>\n<code>Total: 101 addresses</code>\n<code>In use: 2 (PC-A, PC-B)</code>\n<code>Available: 99</code>\n\nAdministrators can also configure:\n• <strong>Exclusions</strong> — IPs reserved for static devices (printers, servers)\n• <strong>Reservations</strong> — Always assign the same IP to a specific MAC address',
        highlights: ['pool'],
        packets: [],
        tables: {
          'srv': {
            dhcpPool: {
              'Range': '192.168.1.100 — 192.168.1.200',
              'Total': '101 addresses',
              'In Use': '2',
              'Available': '99',
              'Exclusions': '192.168.1.1-99 (static)',
              'Reservations': 'None configured'
            }
          }
        }
      },
      {
        title: 'Viewing DHCP Leases',
        explanation: 'On Linux, you can view the DHCP lease table using:\n\n<code>dhcp-lease-list</code> — Shows active leases from the DHCP server\n<code>cat /var/lib/dhcp/dhclient.leases</code> — Client-side lease file\n<code>journalctl -u dhcpd</code> — DHCP server logs\n\nOn a router or dedicated DHCP server, the lease table is typically accessible via the web interface or CLI.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'DHCP Table Summary',
        explanation: '<strong>Key takeaway:</strong> The DHCP Lease Table is the <strong>master record</strong> of IP address assignments on a network.\n\nHow it works:\n1. Clients request IPs via <strong>DORA</strong> (Discover, Offer, Request, Acknowledge)\n2. Server assigns an IP from the <strong>address pool</strong>\n3. Lease entry is recorded with <strong>MAC, hostname, lease time</strong>\n4. Clients <strong>renew</strong> before expiry to keep their IP\n5. Expired IPs return to the pool for reuse\n\n<strong>Why it matters:</strong>\n• Troubleshooting IP conflicts\n• Identifying unauthorized devices\n• Planning address space capacity\n• Tracking device history on the network',
        highlights: ['srv', 'table', 'lease1', 'lease2', 'pool'],
        packets: [],
        tables: {
          'srv': {
            dhcpLeases: {
              '192.168.1.100': { mac: 'AA:BB:CC:01:01:01', hostname: 'PC-A', leaseTime: '8h', expiry: '7:59:55' },
              '192.168.1.101': { mac: 'AA:BB:CC:01:01:02', hostname: 'PC-B', leaseTime: '6h', expiry: '5:59:55' }
            },
            dhcpPool: {
              'Range': '192.168.1.100 — 192.168.1.200',
              'Total': '101 addresses',
              'In Use': '2',
              'Available': '99'
            }
          }
        }
      }
    ]
  },

  {
    id: 'routing-table',
    name: 'Routing Table',
    icon: '🗺️',
    description: 'The kernel\'s road map — how packets find their destination',
    category: 'Components',
    order: 7,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'host', type: 'box', name: 'Linux Host', x: 100, y: 100 },
        { id: 'table', type: 'box', name: 'Routing Table', sub: 'ip route show', x: 350, y: 80 },
        { id: 'r1', type: 'box', name: '192.168.1.0/24', sub: 'dev eth0 — Connected', color: 'var(--green)', x: 550, y: 40 },
        { id: 'r2', type: 'box', name: '10.0.0.0/8', sub: 'via 192.168.1.1 — Static', color: 'var(--cyan)', x: 550, y: 120 },
        { id: 'r3', type: 'box', name: '0.0.0.0/0', sub: 'via 192.168.1.1 — Default', color: 'var(--amber)', x: 550, y: 200 }
      ],
      links: [
        { id: 'link-host-table', from: 'host', to: 'table' },
        { id: 'link-table-r1', from: 'table', to: 'r1' },
        { id: 'link-table-r2', from: 'table', to: 'r2' },
        { id: 'link-table-r3', from: 'table', to: 'r3' }
      ]
    },
    steps: [
      {
        title: 'What is a Routing Table?',
        explanation: 'The <strong>routing table</strong> is the kernel\'s forwarding decision database.\n\nEvery time a packet arrives, the kernel consults this table to determine:\n• Is the destination <strong>local</strong> (deliver directly)?\n• Is the destination <strong>remote</strong> (forward to a gateway)?\n• Which <strong>interface</strong> should the packet go out on?\n\nThink of it as a <strong>road map</strong> — the kernel looks up the destination and picks the best route.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Connected Routes',
        explanation: 'When you configure an IP address on an interface, the kernel <strong>automatically</strong> adds a connected route.\n\n<code>192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10</code>\n\nThis means: "I can reach any device on 192.168.1.0/24 directly through eth0 — no gateway needed."\n\nConnected routes have the <strong>lowest metric</strong> (highest priority) because they are directly attached.',
        highlights: ['r1'],
        packets: [],
        tables: {
          'host': {
            routeTable: {
              '192.168.1.0/24': { via: 'dev eth0', type: 'Connected', metric: 0, isNew: true }
            }
          }
        }
      },
      {
        title: 'Static Routes',
        explanation: 'Administrators can manually add routes using:\n\n<code>ip route add 10.0.0.0/8 via 192.168.1.1</code>\n\nThis tells the kernel: "To reach anything in the 10.0.0.0/8 network, send packets to the gateway at 192.168.1.1."\n\nStatic routes are useful when:\n• You need to reach a <strong>specific remote network</strong>\n• There are <strong>multiple paths</strong> and you want to control which one is used\n• You\'re building a <strong>lab or small network</strong> without dynamic routing protocols',
        highlights: ['r2'],
        packets: [],
        tables: {
          'host': {
            routeTable: {
              '192.168.1.0/24': { via: 'dev eth0', type: 'Connected', metric: 0 },
              '10.0.0.0/8': { via: '192.168.1.1', type: 'Static', metric: 1, isNew: true }
            }
          }
        }
      },
      {
        title: 'Default Route',
        explanation: 'The <strong>default route</strong> (0.0.0.0/0) is the catch-all entry:\n\n<code>default via 192.168.1.1 dev eth0</code>\n\nWhen no specific route matches the destination, the kernel uses the default route. It\'s like saying "send everything else to this gateway."\n\nEvery internet-connected host needs a default route — without it, you can only reach directly connected networks.',
        highlights: ['r3'],
        packets: [],
        tables: {
          'host': {
            routeTable: {
              '192.168.1.0/24': { via: 'dev eth0', type: 'Connected', metric: 0 },
              '10.0.0.0/8': { via: '192.168.1.1', type: 'Static', metric: 1 },
              '0.0.0.0/0': { via: '192.168.1.1', type: 'Default', metric: 0, isNew: true }
            }
          }
        }
      },
      {
        title: 'Route Lookup Order',
        explanation: 'The kernel uses <strong>longest prefix match</strong> to find the best route:\n\n1. Compare the destination IP against all routes\n2. The route with the <strong>longest matching prefix</strong> wins\n3. If multiple routes have the same prefix length, use the one with the <strong>lowest metric</strong>\n4. If still tied, the kernel may use round-robin (equal-cost multipath)\n\n<strong>Example:</strong>\n<code>Destination: 10.5.5.5</code>\n<code>10.0.0.0/8 (matches) → via 192.168.1.1</code>\n<code>0.0.0.0/0 (matches) → via 192.168.1.1</code>\n<strong>Winner: 10.0.0.0/8</strong> (8-bit prefix > 0-bit prefix)',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Viewing Routes',
        explanation: 'Display the routing table using:\n\n<code>ip route show</code> — Modern Linux command\n<code>route -n</code> — Legacy command (same output)\n\n<strong>Output format:</strong>\n<code>192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10</code>\n<code>10.0.0.0/8 via 192.168.1.1 dev eth0</code>\n<code>default via 192.168.1.1 dev eth0</code>\n\nEach line shows: destination, gateway (if remote), interface, and optional parameters like metric and protocol.',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Routing Table Summary',
        explanation: '<strong>Key takeaway:</strong> The routing table is the kernel\'s <strong>road map</strong> for forwarding packets.\n\nHow it works:\n1. <strong>Connected routes</strong> — auto-added when you configure an IP\n2. <strong>Static routes</strong> — manually added by administrators\n3. <strong>Default route</strong> — catch-all for unmatched destinations\n4. <strong>Longest prefix match</strong> — selects the most specific route\n\n<strong>Why it matters:</strong>\n• Troubleshooting connectivity issues\n• Understanding why packets take a certain path\n• Configuring multi-homed systems (multiple NICs)\n• Setting up firewalls and network security\n\n<strong>Commands:</strong>\n<code>ip route show</code> — view routes\n<code>ip route add</code> — add a route\n<code>ip route del</code> — remove a route\n<code>ip route get 8.8.8.8</code> — test which route is used',
        highlights: ['host', 'table', 'r1', 'r2', 'r3'],
        packets: [],
        tables: {
          'host': {
            routeTable: {
              '192.168.1.0/24': { via: 'dev eth0', type: 'Connected', metric: 0 },
              '10.0.0.0/8': { via: '192.168.1.1', type: 'Static', metric: 1 },
              '0.0.0.0/0': { via: '192.168.1.1', type: 'Default', metric: 0 }
            }
          }
        }
      }
    ]
  },

  {
    id: 'ports',
    name: 'TCP/UDP Ports',
    icon: '🚪',
    description: 'How multiple services share one IP — port numbers explained',
    category: 'Components',
    order: 3,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'server', type: 'server', name: 'Server', sub: '192.168.1.20', x: 100, y: 100 },
        { id: 'p80', type: 'box', name: ':80', sub: 'HTTP (Web)', color: 'var(--green)', x: 350, y: 40 },
        { id: 'p443', type: 'box', name: ':443', sub: 'HTTPS (Secure Web)', color: 'var(--green)', x: 350, y: 110 },
        { id: 'p22', type: 'box', name: ':22', sub: 'SSH (Remote Login)', color: 'var(--cyan)', x: 350, y: 180 },
        { id: 'p53', type: 'box', name: ':53', sub: 'DNS (Name Resolution)', color: 'var(--purple)', x: 350, y: 250 },
        { id: 'ranges', type: 'box', name: 'Port Ranges', sub: '0-1023: Well-Known\n1024-49151: Registered\n49152-65535: Dynamic', x: 600, y: 100 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What are Ports?',
        explanation: 'A single server with one IP address (192.168.1.20) can run <strong>multiple services simultaneously</strong> — a web server, an SSH daemon, a DNS resolver, and more.\n\n<strong>Ports</strong> are the mechanism that makes this possible. A port is a 16-bit number (0–65535) that identifies a specific service or application on a host.\n\nThink of an IP address as a <strong>building address</strong> and port numbers as <strong>apartment numbers</strong> — the building (IP) gets you to the right place, but the apartment number (port) gets you to the right service.',
        highlights: ['server'],
        packets: [],
        tables: {}
      },
      {
        title: 'TCP vs UDP Ports',
        explanation: 'Both <strong>TCP</strong> and <strong>UDP</strong> use port numbers, but they work differently:\n\n<strong>TCP (Transmission Control Protocol)</strong>:\n• Connection-oriented — establishes a connection before sending data\n• Reliable delivery with acknowledgments\n• Used for: HTTP, HTTPS, SSH, SMTP, FTP\n\n<strong>UDP (User Datagram Protocol)</strong>:\n• Connectionless — sends data without establishing a connection\n• No acknowledgments, no guaranteed delivery\n• Used for: DNS queries, streaming, gaming, VoIP\n\nBoth protocols use the same port number ranges — port 80 is HTTP whether TCP or UDP carries it.',
        highlights: ['server'],
        packets: [],
        tables: {}
      },
      {
        title: 'Well-Known Ports (0-1023)',
        explanation: 'Ports in the range <strong>0–1023</strong> are reserved for <strong>standardized services</strong> defined by IANA. These require root/admin privileges to bind.\n\nCommon well-known ports:\n<code>:80 — HTTP (Web traffic)</code>\n<code>:443 — HTTPS (Encrypted web)</code>\n<code>:22 — SSH (Secure Shell)</code>\n<code>:53 — DNS (Domain Name System)</code>\n<code>:25 — SMTP (Email sending)</code>\n<code>:21 — FTP (File Transfer)</code>\n<code>:3389 — RDP (Remote Desktop)</code>',
        highlights: ['ranges'],
        packets: [],
        tables: {
          'server': { ports: { ':80': 'HTTP', ':443': 'HTTPS', ':22': 'SSH', ':53': 'DNS' } }
        }
      },
      {
        title: 'Registered Ports (1024-49151)',
        explanation: 'Ports in the range <strong>1024–49151</strong> are registered with IANA for specific applications but don\'t require elevated privileges.\n\nCommon registered ports:\n<code>:3306 — MySQL Database</code>\n<code>:5432 — PostgreSQL Database</code>\n<code>:6379 — Redis Cache</code>\n<code>:8080 — HTTP Alternate</code>\n<code>:8443 — HTTPS Alternate</code>\n<code>:27017 — MongoDB</code>\n\nThese are often used for development servers and databases that shouldn\'t need root access.',
        highlights: ['ranges'],
        packets: [],
        tables: {
          'server': { ports: { ':3306': 'MySQL', ':5432': 'PostgreSQL', ':6379': 'Redis' } }
        }
      },
      {
        title: 'Dynamic/Ephemeral Ports (49152-65535)',
        explanation: 'Ports in the range <strong>49152–65535</strong> are dynamic or ephemeral — they\'re assigned <strong>temporarily</strong> to client-side applications.\n\nWhen your browser connects to a web server on port 80, it picks a random ephemeral port (e.g., 49152) as its source port. This allows:\n\n• <strong>Multiple connections</strong> to the same server from one client\n• <strong>Response routing</strong> — the server knows where to send the reply\n• <strong>Connection tracking</strong> — the OS knows which socket owns the packet',
        highlights: ['ranges'],
        packets: [],
        tables: {}
      },
      {
        title: 'How Ports Work in Communication',
        explanation: 'When a client connects to a server, both <strong>source and destination ports</strong> are used:\n\n<code>Client (192.168.1.10:49152) → Server (192.168.1.20:80)</code>\n\nThe TCP/UDP header contains both port numbers:\n• <strong>Source port</strong> (49152) — the client\'s temporary port\n• <strong>Destination port</strong> (80) — the server\'s well-known port\n\nThe server responds using the <strong>reversed</strong> port pair:\n<code>Server (192.168.1.20:80) → Client (192.168.1.10:49152)</code>',
        highlights: ['server', 'p80', 'p443', 'p22', 'p53'],
        packets: [],
        tables: {},
        packetDetails: {
          pkt1: {
            layers: [
              { name: 'TCP Header', color: 'var(--blue)', fields: [
                ['Source Port', '49152 (Ephemeral)'],
                ['Destination', '80 (HTTP)'],
                ['Flags', 'SYN'],
                ['Seq', '1000']
              ]}
            ]
          }
        }
      },
      {
        title: 'Ports Summary',
        explanation: '<strong>Key takeaway:</strong> Ports enable a single IP address to host multiple services by assigning unique numbers to each.\n\n<strong>Range breakdown:</strong>\n• 0–1023: Well-known (root required)\n• 1024–49151: Registered (application-specific)\n• 49152–65535: Dynamic (client temporary)\n\n<strong>Protocol distinction:</strong>\n• TCP: Reliable, connection-oriented\n• UDP: Fast, connectionless\n\nUnderstanding ports is essential for <strong>firewall rules</strong>, <strong>port forwarding</strong>, <strong>NAT</strong>, and <strong>service troubleshooting</strong>.',
        highlights: ['server', 'p80', 'p443', 'p22', 'p53', 'ranges'],
        packets: [],
        tables: {
          'server': {
            ports: {
              ':80': 'HTTP',
              ':443': 'HTTPS',
              ':22': 'SSH',
              ':53': 'DNS',
              ':3306': 'MySQL',
              ':6379': 'Redis'
            }
          }
        }
      }
    ]
  },

  {
    id: 'arp-table',
    name: 'ARP Table',
    icon: '📋',
    description: 'The mapping cache — IP to MAC address translations',
    category: 'Components',
    order: 4,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'pc', type: 'computer', name: 'PC', sub: '192.168.1.10', x: 100, y: 100 },
        { id: 'cache', type: 'box', name: 'ARP Cache', sub: 'Dynamic entries', x: 350, y: 80 },
        { id: 'entry1', type: 'box', name: '192.168.1.20', sub: 'AA:BB:CC:DD:EE:02', color: 'var(--green)', x: 550, y: 40 },
        { id: 'entry2', type: 'box', name: '192.168.1.1', sub: 'AA:BB:CC:DD:EE:FF', color: 'var(--green)', x: 550, y: 120 },
        { id: 'timer', type: 'box', name: 'Timeout: 300s', sub: 'Entries expire', x: 550, y: 200 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is an ARP Table?',
        explanation: 'An <strong>ARP table</strong> (also called an ARP cache) is a local mapping stored on each device that translates <strong>IP addresses to MAC addresses</strong>.\n\nSince Ethernet frames require MAC addresses (not IPs), every device needs this mapping to communicate at Layer 2. The ARP table is the result of ARP requests and replies that have occurred on the local network.\n\nWithout an ARP table, every single packet would require a new ARP broadcast — incredibly inefficient.',
        highlights: ['pc'],
        packets: [],
        tables: {
          'pc': { arp: {} }
        }
      },
      {
        title: 'Dynamic Entries',
        explanation: 'Most ARP table entries are <strong>dynamic</strong> — they are learned automatically through the ARP request/reply process.\n\nWhen a device needs to send data to an IP on the same subnet, it broadcasts an ARP request: <code>"Who has 192.168.1.20?"</code>. The target replies with its MAC address, and the asking device <strong>caches the mapping</strong> in its ARP table.\n\nDynamic entries have a <strong>timeout</strong> (typically 300 seconds) and are removed if not refreshed.',
        highlights: ['cache'],
        packets: [],
        tables: {
          'pc': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'dynamic', isNew: true } } }
        }
      },
      {
        title: 'Static Entries',
        explanation: 'You can also create <strong>static ARP entries</strong> manually using the <code>arp -s</code> command:\n\n<code>arp -s 192.168.1.20 AA:BB:CC:DD:EE:02</code>\n\nStatic entries:\n• <strong>Never expire</strong> — they persist until manually removed\n• <strong>Override dynamic</strong> — if both exist, static takes priority\n• <strong>Used for security</strong> — prevent ARP spoofing attacks\n• <strong>Used for reliability</strong> — critical infrastructure (gateways, DNS servers)\n\nView with <code>arp -a</code> — static entries are marked differently from dynamic ones.',
        highlights: ['cache'],
        packets: [],
        tables: {
          'pc': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'static' } } }
        }
      },
      {
        title: 'ARP Cache Timeout',
        explanation: 'Dynamic ARP entries are <strong>temporary</strong> and expire after a configurable timeout.\n\nOn Linux, the default timeout is <strong>300 seconds (5 minutes)</strong>. After this period, the entry is removed and the next packet will trigger a new ARP request.\n\nWhy the timeout?\n• Devices can <strong>change IPs</strong> (DHCP reassignment)\n• Devices can <strong>leave the network</strong> (laptop disconnects)\n• NICs can <strong>change</strong> (hardware replacement)\n• Prevents <strong>stale entries</strong> from causing communication failures\n\nThe timeout is configurable: <code>sysctl net.ipv4.neigh.default.gc_stale_time</code>',
        highlights: ['timer'],
        packets: [],
        tables: {
          'pc': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'dynamic', timeout: '300s' } } }
        }
      },
      {
        title: 'Viewing ARP Table',
        explanation: 'Use the <code>arp -a</code> command to view the ARP cache:\n\n<code>arp -a</code>\n<code>? (192.168.1.20) at AA:BB:CC:DD:EE:02 [ether] on eth0</code>\n<code>? (192.168.1.1) at AA:BB:CC:DD:EE:FF [ether] on eth0</code>\n\nOn Linux, you can also use:\n<code>ip neigh show</code>\n<code>ip neigh show dev eth0</code>\n\nThe output shows the IP address, MAC address, interface, and entry type (dynamic/static).',
        highlights: ['cache', 'entry1', 'entry2'],
        packets: [],
        tables: {
          'pc': { arp: { '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'dynamic' }, '192.168.1.1': { mac: 'AA:BB:CC:DD:EE:FF', status: 'dynamic' } } }
        }
      },
      {
        title: 'ARP Table Summary',
        explanation: '<strong>Key takeaway:</strong> The ARP table is a local cache that maps IP addresses to MAC addresses on the same subnet.\n\n<strong>Entry types:</strong>\n• <strong>Dynamic</strong> — learned via ARP request/reply, expires after 300s\n• <strong>Static</strong> — manually configured, never expires\n\n<strong>Commands:</strong>\n• <code>arp -a</code> — view ARP cache\n• <code>arp -s &lt;ip&gt; &lt;mac&gt;</code> — add static entry\n• <code>arp -d &lt;ip&gt;</code> — delete entry\n\nThe ARP table is essential for Layer 2 communication. Without it, devices cannot build the Ethernet frames needed to send data on the local network.',
        highlights: ['pc', 'cache', 'entry1', 'entry2', 'timer'],
        packets: [],
        tables: {
          'pc': {
            arp: {
              '192.168.1.20': { mac: 'AA:BB:CC:DD:EE:02', status: 'dynamic', timeout: '300s' },
              '192.168.1.1': { mac: 'AA:BB:CC:DD:EE:FF', status: 'dynamic', timeout: '300s' }
            }
          }
        }
      }
    ]
  },

  {
    id: 'mac-table',
    name: 'MAC Address Table',
    icon: '📊',
    description: 'How switches remember which port connects to which device',
    category: 'Components',
    order: 5,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'sw', type: 'switch', name: 'Switch', x: 100, y: 100 },
        { id: 'table', type: 'box', name: 'MAC Table', sub: 'Forwarding Database', x: 350, y: 80 },
        { id: 'e1', type: 'box', name: 'AA:BB:CC:DD:EE:01', sub: 'Port 1 (PC-A)', color: 'var(--green)', x: 550, y: 40 },
        { id: 'e2', type: 'box', name: 'AA:BB:CC:DD:EE:02', sub: 'Port 2 (PC-B)', color: 'var(--green)', x: 550, y: 120 },
        { id: 'aging', type: 'box', name: 'Aging Time', sub: '300 seconds', x: 550, y: 200 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is a MAC Table?',
        explanation: 'A <strong>MAC address table</strong> (also called a forwarding database or FDB) is the switch\'s internal database that maps <strong>MAC addresses to physical ports</strong>.\n\nWhen a switch receives an Ethernet frame, it looks at the <strong>source MAC address</strong> to learn which device is on which port. It then uses this table to <strong>forward frames</strong> to the correct port — rather than flooding all ports.\n\nThis is the fundamental mechanism that makes switches smarter than hubs.',
        highlights: ['sw'],
        packets: [],
        tables: {
          'sw': { mac: {} }
        }
      },
      {
        title: 'How Switches Learn',
        explanation: 'Switches learn by inspecting the <strong>source MAC address</strong> of every incoming frame:\n\n1. Frame arrives on <strong>Port 1</strong> from MAC <code>AA:BB:CC:DD:EE:01</code>\n2. Switch records: <code>AA:BB:CC:DD:EE:01 → Port 1</code>\n3. Frame arrives on <strong>Port 2</strong> from MAC <code>AA:BB:CC:DD:EE:02</code>\n4. Switch records: <code>AA:BB:CC:DD:EE:02 → Port 2</code>\n\nThis process is called <strong>MAC learning</strong> — it happens automatically on every frame. The switch doesn\'t need any configuration to build its table.',
        highlights: ['table'],
        packets: [],
        tables: {
          'sw': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A', isNew: true },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B', isNew: true }
            }
          }
        }
      },
      {
        title: 'Forwarding Decision',
        explanation: 'When a switch receives a frame, it uses its MAC table for the <strong>forwarding decision</strong>:\n\n<strong>Known destination MAC:</strong>\n• Look up the destination in the MAC table\n• Find the associated port\n• Forward the frame <strong>only to that port</strong> (unicast)\n\n<strong>Unknown destination MAC:</strong>\n• The MAC is not in the table\n• <strong>Flood</strong> the frame out all ports except the source\n• This is called <strong>unknown unicast flooding</strong>\n\n<strong>Broadcast (FF:FF:FF:FF:FF:FF):</strong>\n• Always flood to all ports except source',
        highlights: ['table'],
        packets: [],
        tables: {
          'sw': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A' },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B' }
            }
          }
        }
      },
      {
        title: 'Aging and Timeout',
        explanation: 'MAC table entries are <strong>temporary</strong> and expire after an <strong>aging time</strong> (typically 300 seconds).\n\nIf a device stops sending frames (e.g., it\'s turned off or disconnected), its MAC entry will <strong>age out</strong> and be removed from the table.\n\nWhy aging matters:\n• Devices can <strong>move between ports</strong> (laptop moves to different jack)\n• Prevents <strong>stale entries</strong> from causing misforwarding\n• Keeps the MAC table <strong>compact and accurate</strong>\n\nThe aging time is configurable on managed switches:\n<code>switch(config)# mac address-table aging-time 600</code>',
        highlights: ['aging'],
        packets: [],
        tables: {
          'sw': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 1, label: 'PC-A', aging: '300s' },
              'AA:BB:CC:DD:EE:02': { port: 2, label: 'PC-B', aging: '300s' }
            }
          }
        }
      },
      {
        title: 'Viewing MAC Table',
        explanation: 'On <strong>Cisco IOS</strong> switches:\n<code>show mac address-table</code>\n\n<code>MAC Address Table</code>\n<code>-------------------------------------------</code>\n<code>Vlan    MAC Address       Type    Ports</code>\n<code>----    -----------------  ------  ------</code>\n<code>1       AA:BB:CC:DD:EE:01  DYNAMIC  Fa0/1</code>\n<code>1       AA:BB:CC:DD:EE:02  DYNAMIC  Fa0/2</code>\n\nOn <strong>Linux bridges</strong>:\n<code>bridge fdb show</code>\n\nOn <strong>Linux</strong> with <code>brctl</code>:\n<code>brctl showmacs br0</code>',
        highlights: ['table', 'e1', 'e2'],
        packets: [],
        tables: {
          'sw': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 'Fa0/1', label: 'PC-A', type: 'DYNAMIC' },
              'AA:BB:CC:DD:EE:02': { port: 'Fa0/2', label: 'PC-B', type: 'DYNAMIC' }
            }
          }
        }
      },
      {
        title: 'MAC Table Summary',
        explanation: '<strong>Key takeaway:</strong> The MAC address table is the switch\'s forwarding database that maps MAC addresses to physical ports.\n\n<strong>How it works:</strong>\n• Switch <strong>learns</strong> by inspecting source MACs on incoming frames\n• Switch <strong>forwards</strong> by looking up destination MACs in the table\n• Entries <strong>age out</strong> after 300 seconds if not refreshed\n\n<strong>Commands:</strong>\n• Cisco: <code>show mac address-table</code>\n• Linux bridge: <code>bridge fdb show</code>\n• Add static: <code>mac address-table static AA:BB:CC:DD:EE:01 vlan 1 interface Fa0/1</code>\n\nThe MAC table is what makes switches efficient — without it, every frame would be flooded like a hub.',
        highlights: ['sw', 'table', 'e1', 'e2', 'aging'],
        packets: [],
        tables: {
          'sw': {
            mac: {
              'AA:BB:CC:DD:EE:01': { port: 'Fa0/1', label: 'PC-A', type: 'DYNAMIC', aging: '300s' },
              'AA:BB:CC:DD:EE:02': { port: 'Fa0/2', label: 'PC-B', type: 'DYNAMIC', aging: '300s' }
            }
          }
        }
      }
    ]
  },

  {
    id: 'vpn',
    name: 'VPN Basics',
    icon: '🔒',
    description: 'Encrypted tunnel — private communication over public networks',
    category: 'Networking Fundamentals',
    order: 36,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'client', type: 'box', name: 'Client', sub: 'Remote Worker', x: 100, y: 100 },
        { id: 'tunnel', type: 'box', name: 'Encrypted Tunnel', sub: 'IPSec/WireGuard', color: 'var(--cyan)', x: 350, y: 100 },
        { id: 'internet', type: 'box', name: 'Public Internet', sub: 'Untrusted', x: 350, y: 200 },
        { id: 'corp', type: 'box', name: 'Corporate Network', sub: '10.0.0.0/8', x: 600, y: 100 },
        { id: 'server', type: 'box', name: 'VPN Server', sub: '10.0.0.1', x: 600, y: 200 }
      ],
      links: [
        { id: 'link-client-tunnel', from: 'client', to: 'tunnel' },
        { id: 'link-tunnel-corp', from: 'tunnel', to: 'corp' },
        { id: 'link-tunnel-server', from: 'tunnel', to: 'server' }
      ]
    },
    steps: [
      {
        title: 'What is a VPN?',
        explanation: 'A <strong>VPN (Virtual Private Network)</strong> creates an <strong>encrypted tunnel</strong> over a public network.\n\nIt allows a remote worker to securely access a private corporate network through the untrusted public internet. All traffic is encrypted end-to-end, so eavesdroppers on the public network cannot read the data.',
        highlights: ['client', 'internet'],
        packets: [],
        tables: {}
      },
      {
        title: 'How VPN Works',
        explanation: 'The VPN client on the remote worker\'s machine establishes an <strong>encrypted tunnel</strong> to the VPN server.\n\nTraffic destined for the corporate network (10.0.0.0/8) is <strong>encapsulated</strong> inside an encrypted outer packet. This encrypted packet travels safely over the public internet.\n\nThe VPN server on the corporate side <strong>decrypts</strong> the packet and forwards it into the internal network.',
        highlights: ['tunnel'],
        packets: [],
        tables: {}
      },
      {
        title: 'VPN Protocols',
        explanation: 'Two major VPN protocols:\n\n<strong>IPSec</strong> (traditional) — operates at Layer 3, uses IKE for key exchange, provides strong encryption but can be complex to configure.\n\n<strong>WireGuard</strong> (modern) — simpler, faster, and uses state-of-the-art cryptography. Growing rapidly in popularity due to its performance and ease of use.',
        highlights: ['server'],
        packets: [],
        tables: {}
      },
      {
        title: 'VPN Use Cases',
        explanation: '<strong>Remote Access:</strong> Employees working from home connect securely to the corporate network.\n\n<strong>Site-to-Site:</strong> Two office networks connected via VPN over the internet.\n\n<strong>Privacy:</strong> Encrypting traffic on public WiFi to prevent eavesdropping.\n\n<strong>Bypass Geo-Restrictions:</strong> Accessing content available in other regions by routing through a VPN server in that location.',
        highlights: ['client', 'tunnel', 'server'],
        packets: [],
        tables: {}
      },
      {
        title: 'VPN Summary',
        explanation: '<strong>Key takeaway:</strong> VPNs provide encrypted, private communication over public networks.\n\n<strong>Pros:</strong>\n• Security — encrypted traffic even on untrusted networks\n• Privacy — hides your real IP address from destination servers\n• Remote access — securely reach internal resources from anywhere\n\n<strong>Cons:</strong>\n• Latency — encryption/decryption adds overhead\n• Complexity — requires proper configuration and maintenance\n• Not bulletproof — VPN providers can still log traffic',
        highlights: ['client', 'tunnel', 'corp', 'server', 'internet'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'wifi',
    name: 'WiFi Fundamentals',
    icon: '📶',
    description: 'Wireless networking — SSID, channels, WPA2/3, 802.11',
    category: 'Networking Fundamentals',
    order: 37,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ap', type: 'box', name: 'Access Point', sub: 'SSID: MyNetwork', x: 100, y: 100 },
        { id: 'client', type: 'box', name: 'WiFi Client', sub: 'Phone/Laptop', x: 100, y: 200 },
        { id: 'ch', type: 'box', name: 'Channels', sub: '2.4GHz: 1-11 | 5GHz: 36-165', color: 'var(--cyan)', x: 350, y: 60 },
        { id: 'band', type: 'box', name: 'Bands', sub: '2.4GHz (range) vs 5GHz (speed)', color: 'var(--green)', x: 350, y: 150 },
        { id: 'sec', type: 'box', name: 'Security', sub: 'WPA2/WPA3 — AES encryption', color: 'var(--amber)', x: 350, y: 240 },
        { id: 'proto', type: 'box', name: '802.11 Standards', sub: 'ac (WiFi 5) / ax (WiFi 6)', color: 'var(--purple)', x: 350, y: 320 }
      ],
      links: [
        { id: 'link-ap-ch', from: 'ap', to: 'ch' },
        { id: 'link-ap-band', from: 'ap', to: 'band' },
        { id: 'link-ap-sec', from: 'ap', to: 'sec' },
        { id: 'link-ap-proto', from: 'ap', to: 'proto' }
      ]
    },
    steps: [
      {
        title: 'WiFi Channels',
        explanation: 'WiFi operates on specific <strong>frequency channels</strong> within the 2.4GHz and 5GHz bands.\n\nIn the <strong>2.4GHz band</strong>, channels 1, 6, and 11 are the only non-overlapping channels. Using overlapping channels causes interference from neighboring networks.\n\nThe <strong>5GHz band</strong> has many more non-overlapping channels (36, 40, 44, 48, etc.), reducing congestion.',
        highlights: ['ch'],
        packets: [],
        tables: {}
      },
      {
        title: 'WiFi Bands',
        explanation: '<strong>2.4GHz band:</strong> Better range, penetrates walls better, but slower speeds and more interference from devices like microwaves and Bluetooth.\n\n<strong>5GHz band:</strong> Faster speeds, more available channels, but shorter range and less wall penetration.\n\nModern routers support <strong>dual-band</strong> or <strong>tri-band</strong> to combine both frequencies.',
        highlights: ['band'],
        packets: [],
        tables: {}
      },
      {
        title: 'WiFi Security',
        explanation: '<strong>WEP</strong> (Wired Equivalent Privacy) — broken and deprecated. Never use.\n\n<strong>WPA2</strong> (WiFi Protected Access 2) — uses <strong>AES encryption</strong>, widely deployed and considered secure when using strong passwords.\n\n<strong>WPA3</strong> (latest) — stronger encryption, protection against offline dictionary attacks, and forward secrecy.',
        highlights: ['sec'],
        packets: [],
        tables: {}
      },
      {
        title: '802.11 Standards',
        explanation: 'The IEEE 802.11 family defines WiFi standards:\n\n<strong>WiFi 4 (802.11n)</strong> — introduced MIMO, up to 600 Mbps\n<strong>WiFi 5 (802.11ac)</strong> — 5GHz only, MU-MIMO, up to 3.5 Gbps\n<strong>WiFi 6 (802.11ax)</strong> — OFDMA, BSS coloring, up to 9.6 Gbps, better in dense environments\n\nEach generation improves speed, capacity, and efficiency.',
        highlights: ['proto'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'nftables',
    name: 'nftables',
    icon: '🛡️',
    description: 'Modern Linux firewall — the successor to iptables',
    category: 'Linux Core Networking',
    order: 38,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'pkt', type: 'box', name: 'Incoming Packet', x: 100, y: 100 },
        { id: 'tables', type: 'box', name: 'Tables', sub: 'ip, ip6, inet, arp', x: 350, y: 60 },
        { id: 'chains', type: 'box', name: 'Chains', sub: 'input, forward, output', color: 'var(--cyan)', x: 350, y: 150 },
        { id: 'rules', type: 'box', name: 'Rules', sub: 'accept, drop, reject', color: 'var(--green)', x: 350, y: 240 },
        { id: 'verdicts', type: 'box', name: 'Verdicts', sub: 'accept / drop / continue / jump', x: 550, y: 100 }
      ],
      links: [
        { id: 'link-pkt-tables', from: 'pkt', to: 'tables' },
        { id: 'link-tables-chains', from: 'tables', to: 'chains' },
        { id: 'link-chains-rules', from: 'chains', to: 'rules' },
        { id: 'link-rules-verdicts', from: 'rules', to: 'verdicts' }
      ]
    },
    steps: [
      {
        title: 'nftables Tables',
        explanation: 'nftables organizes firewall rules into <strong>tables</strong> by protocol family:\n\n<strong>ip</strong> — IPv4 rules\n<strong>ip6</strong> — IPv6 rules\n<strong>inet</strong> — Both IPv4 and IPv6\n<strong>arp</strong> — ARP rules\n\nTables are containers for chains. A single table can hold all your firewall rules for a given protocol family.',
        highlights: ['tables'],
        packets: [],
        tables: {}
      },
      {
        title: 'Chains',
        explanation: 'Within each table, <strong>chains</strong> define where rules are evaluated in the packet flow:\n\n<strong>input</strong> — packets destined for the firewall itself\n<strong>forward</strong> — packets passing through the firewall\n<strong>output</strong> — packets originating from the firewall\n\nChains are attached to <strong>hooks</strong> (prerouting, input, forward, output, postrouting) that determine when they execute.',
        highlights: ['chains'],
        packets: [],
        tables: {}
      },
      {
        title: 'Rules & Expressions',
        explanation: 'Each chain contains an ordered list of <strong>rules</strong>. Each rule has <strong>match conditions</strong> and an <strong>action</strong>:\n\nExample rule:\n<code>tcp dport 22 accept</code>\n\nThis matches TCP packets on port 22 and accepts them. If no rule matches, the chain\'s <strong>default policy</strong> applies.',
        highlights: ['rules'],
        packets: [],
        tables: {}
      },
      {
        title: 'nft vs iptables',
        explanation: '<strong>nftables</strong> is the modern successor to iptables with key advantages:\n\n<strong>Atomic ruleset changes</strong> — replace entire rulesets without locking\n<strong>Better performance</strong> — optimized kernel backend\n<strong>Simpler syntax</strong> — more readable configuration\n<strong>Native set/map support</strong> — efficient matching of IPs, ports, interfaces\n<strong>Unified framework</strong> — replaces iptables, ip6tables, arptables, ebtables\n\nMost modern Linux distributions now use nftables as the default firewall.',
        highlights: ['verdicts'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'ethernet-frame',
    name: 'Ethernet Frame',
    icon: '📦',
    description: 'The data container — how bits are packaged for the wire',
    category: 'Components',
    order: 8,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'pre', type: 'box', name: 'Preamble', sub: '7 bytes', color: 'var(--red)', x: 40, y: 100 },
        { id: 'dst', type: 'box', name: 'Dst MAC', sub: '6 bytes', color: 'var(--amber)', x: 140, y: 100 },
        { id: 'src', type: 'box', name: 'Src MAC', sub: '6 bytes', color: 'var(--amber)', x: 260, y: 100 },
        { id: 'type', type: 'box', name: 'Type', sub: '2 bytes', color: 'var(--cyan)', x: 380, y: 100 },
        { id: 'payload', type: 'box', name: 'Payload', sub: '46-1500 bytes', color: 'var(--green)', x: 480, y: 100 },
        { id: 'fcs', type: 'box', name: 'FCS', sub: '4 bytes', color: 'var(--purple)', x: 620, y: 100 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Preamble',
        explanation: 'The <strong>preamble</strong> is the first field in an Ethernet frame — 7 bytes of alternating 1s and 0s (10101010 pattern).\n\nIts purpose is <strong>synchronization</strong>. It gives the receiving NIC time to lock onto the signal\'s timing before the actual frame begins.\n\nThe preamble is followed by the <strong>SFD (Start Frame Delimiter)</strong>, a 1-byte field that signals "the actual frame starts now."',
        highlights: ['pre'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', '—'],
                ['Source MAC', '—'],
                ['Type', '—'],
                ['Payload', '—'],
                ['FCS', '—']
              ]}
            ]
          }
        }
      },
      {
        title: 'Destination MAC',
        explanation: 'The <strong>destination MAC address</strong> identifies who the frame is for — 6 bytes (48 bits).\n\nSpecial values:\n• <code>FF:FF:FF:FF:FF:FF</code> — broadcast, received by all devices\n• Multicast addresses — received by a group of devices\n• Unicast — addressed to a specific NIC\n\nIf the destination is on the same network, the frame goes directly. If it\'s on a different network, it goes to the default gateway (router).',
        highlights: ['dst'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', 'AA:BB:CC:DD:EE:02'],
                ['Source MAC', '—'],
                ['Type', '—'],
                ['Payload', '—'],
                ['FCS', '—']
              ]}
            ]
          }
        }
      },
      {
        title: 'Source MAC',
        explanation: 'The <strong>source MAC address</strong> identifies who sent the frame — 6 bytes (48 bits).\n\nSwitches use the source MAC to <strong>learn</strong> which device is on which port. When a switch receives a frame, it records the source MAC and the incoming port in its MAC address table.\n\nThe source MAC is <strong>always</strong> a unicast address (never broadcast or multicast).',
        highlights: ['src'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', 'AA:BB:CC:DD:EE:02'],
                ['Source MAC', 'AA:BB:CC:DD:EE:01'],
                ['Type', '—'],
                ['Payload', '—'],
                ['FCS', '—']
              ]}
            ]
          }
        }
      },
      {
        title: 'EtherType',
        explanation: 'The <strong>EtherType</strong> field identifies which protocol is encapsulated in the payload — 2 bytes.\n\nCommon values:\n• <code>0x0800</code> — IPv4\n• <code>0x0806</code> — ARP\n• <code>0x86DD</code> — IPv6\n\nThis field tells the receiving device how to interpret the payload. If the payload is an IPv4 packet, the NIC passes it up to the IPv4 stack.',
        highlights: ['type'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', 'AA:BB:CC:DD:EE:02'],
                ['Source MAC', 'AA:BB:CC:DD:EE:01'],
                ['Type', 'IPv4 (0x0800)'],
                ['Payload', '—'],
                ['FCS', '—']
              ]}
            ]
          }
        }
      },
      {
        title: 'Payload',
        explanation: 'The <strong>payload</strong> contains the actual data being transmitted — 46 to 1500 bytes.\n\nThis is typically an <strong>IP packet</strong>, but it could also be ARP, IPv6, or other protocols as indicated by the EtherType field.\n\nIf the data is smaller than 46 bytes, it\'s padded to meet the minimum Ethernet frame size (64 bytes total). The maximum of 1500 bytes is the <strong>MTU</strong> (Maximum Transmission Unit).',
        highlights: ['payload'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', 'AA:BB:CC:DD:EE:02'],
                ['Source MAC', 'AA:BB:CC:DD:EE:01'],
                ['Type', 'IPv4 (0x0800)'],
                ['Payload', '46-1500 bytes of data'],
                ['FCS', '—']
              ]}
            ]
          }
        }
      },
      {
        title: 'Frame Check Sequence',
        explanation: 'The <strong>FCS (Frame Check Sequence)</strong> is a 4-byte CRC (Cyclic Redundancy Check) used for error detection.\n\nThe sender calculates a CRC value over the entire frame (excluding preamble and SFD) and appends it. The receiver recalculates the CRC and compares — if they don\'t match, the frame is <strong>silently discarded</strong>.\n\nFCS detects:\n• Bit flips from electrical noise\n• Truncated frames\n• Corrupted data in transit\n\nFCS does <strong>not</strong> detect or correct all errors — it\'s a best-effort check.',
        highlights: ['fcs'],
        packets: [],
        tables: {},
        packetDetails: {
          frame: {
            layers: [
              { name: 'Ethernet II', color: 'var(--blue)', fields: [
                ['Preamble', '10101010 (7 bytes)'],
                ['SFD', '10101011 (1 byte)'],
                ['Destination MAC', 'AA:BB:CC:DD:EE:02'],
                ['Source MAC', 'AA:BB:CC:DD:EE:01'],
                ['Type', 'IPv4 (0x0800)'],
                ['Payload', '46-1500 bytes'],
                ['FCS', 'CRC-32 (4 bytes)']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'ttl',
    name: 'TTL & Hop Limit',
    icon: '⏳',
    description: 'Why packets die — prevents infinite loops in the network',
    category: 'Components',
    order: 9,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'src', type: 'box', name: 'Sender', sub: 'TTL=64', x: 100, y: 100 },
        { id: 'r1', type: 'box', name: 'Router 1', sub: 'TTL=63', color: 'var(--green)', x: 280, y: 100 },
        { id: 'r2', type: 'box', name: 'Router 2', sub: 'TTL=62', color: 'var(--green)', x: 430, y: 100 },
        { id: 'r3', type: 'box', name: 'Router 3', sub: 'TTL=61', color: 'var(--amber)', x: 580, y: 100 },
        { id: 'dead', type: 'box', name: 'TTL=0', sub: 'Packet DROPPED', color: 'var(--red)', x: 700, y: 100 },
        { id: 'icmp', type: 'box', name: 'ICMP Time Exceeded', sub: 'Type 11', color: 'var(--red)', x: 700, y: 200 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is TTL?',
        explanation: '<strong>TTL (Time To Live)</strong> is an 8-bit field in the IPv4 header (called <strong>Hop Limit</strong> in IPv6).\n\nIt\'s a counter that prevents packets from circulating forever in a network loop. Every time a packet passes through a router, the TTL is decremented by 1. When it reaches 0, the packet is dropped.\n\nWithout TTL, a misconfigured routing loop could cause packets to circulate indefinitely, consuming bandwidth and CPU until the network collapses.',
        highlights: ['src'],
        packets: [],
        tables: {},
        packetDetails: {
          ip: {
            layers: [
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['Version', '4'],
                ['IHL', '5 (20 bytes)'],
                ['TTL', '64'],
                ['Protocol', 'ICMP (1)'],
                ['Source IP', '192.168.1.10'],
                ['Destination', '10.0.0.1']
              ]}
            ]
          }
        }
      },
      {
        title: 'Initial Value',
        explanation: 'When a host sends a packet, it sets the <strong>initial TTL value</strong>. Common defaults:\n\n• <strong>Linux:</strong> 64\n• <strong>Windows:</strong> 128\n• <strong>Cisco IOS:</strong> 255\n• <strong>macOS:</strong> 64\n\nThe choice is somewhat arbitrary — the important thing is that it\'s large enough to reach any destination in the internet, but small enough to catch loops.',
        highlights: ['src'],
        packets: [],
        tables: {},
        packetDetails: {
          ip: {
            layers: [
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['TTL', '64 (Linux default)'],
                ['Purpose', 'Hop counter'],
                ['Size', '8 bits (0-255)'],
                ['Max hops', '255']
              ]}
            ]
          }
        }
      },
      {
        title: 'Decrement at Each Hop',
        explanation: 'Each router <strong>decrements the TTL by 1</strong> before forwarding the packet.\n\nThe packet starts with TTL=64 and passes through:\n• Router 1: TTL becomes 63\n• Router 2: TTL becomes 62\n• Router 3: TTL becomes 61\n\nIf the path has many hops, TTL continues to decrease. This is the core mechanism that prevents infinite loops.',
        highlights: ['r1', 'r2', 'r3'],
        packets: [],
        tables: {}
      },
      {
        title: 'TTL Field in IP Header',
        explanation: 'The TTL field is located in the <strong>IPv4 header</strong> at byte offset 8:\n\n<code>0                   1                   2</code>\n<code>0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3</code>\n<code>+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+</code>\n<code>|  Ver  |  IHL  |     TTL     |  Protocol  |</code>\n\nIn IPv6, this field is called <strong>Hop Limit</strong> and works identically — decremented by each router, dropped at 0.',
        highlights: [],
        packets: [],
        tables: {},
        packetDetails: {
          ip: {
            layers: [
              { name: 'IPv4 Header', color: 'var(--cyan)', fields: [
                ['Byte 8', 'TTL (8 bits)'],
                ['Current Value', '64'],
                ['Operation', 'Decrement by 1 at each hop'],
                ['At 0', 'Packet dropped, ICMP sent']
              ]}
            ]
          }
        }
      },
      {
        title: 'TTL Reaches Zero',
        explanation: 'When a router receives a packet with <strong>TTL=1</strong>, it decrements to 0 and <strong>drops the packet</strong>.\n\nThe router then sends an <strong>ICMP Time Exceeded</strong> message (Type 11, Code 0) back to the sender, informing them the packet was discarded.\n\nThis is how <strong>traceroute</strong> works — it intentionally sends packets with low TTL values to map the path to a destination.',
        highlights: ['dead', 'icmp'],
        packets: [],
        tables: {},
        packetDetails: {
          icmp: {
            layers: [
              { name: 'ICMP', color: 'var(--red)', fields: [
                ['Type', '11 (Time Exceeded)'],
                ['Code', '0 (TTL expired in transit)'],
                ['Description', 'Packet dropped — TTL=0'],
                ['Original Packet', 'Included in ICMP message']
              ]}
            ]
          }
        }
      },
      {
        title: 'Traceroute Uses TTL',
        explanation: '<strong>traceroute</strong> maps the path to a destination by exploiting TTL:\n\n1. Send packet with <strong>TTL=1</strong> → Router 1 drops it, sends ICMP Time Exceeded\n2. Send packet with <strong>TTL=2</strong> → Router 1 decrements, Router 2 drops it\n3. Send packet with <strong>TTL=3</strong> → Router 1→2, Router 3 drops it\n4. Continue until you reach the destination\n\nEach ICMP reply reveals a router on the path. This is one of the most fundamental network diagnostic tools.\n\n<code>traceroute example.com</code>',
        highlights: ['r1', 'r2', 'r3', 'dead', 'icmp'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'mtu',
    name: 'MTU',
    icon: '📏',
    description: 'Maximum Transmission Unit — the largest packet the network allows',
    category: 'Components',
    order: 10,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'pkt', type: 'box', name: 'Packet', sub: '4000 bytes', x: 100, y: 100 },
        { id: 'mtu', type: 'box', name: 'MTU: 1500', sub: 'Ethernet limit', color: 'var(--amber)', x: 300, y: 100 },
        { id: 'frag', type: 'box', name: 'Fragment 1', sub: '1500 bytes', color: 'var(--cyan)', x: 500, y: 60 },
        { id: 'frag2', type: 'box', name: 'Fragment 2', sub: '1500 bytes', color: 'var(--cyan)', x: 500, y: 140 },
        { id: 'frag3', type: 'box', name: 'Fragment 3', sub: '1000 bytes', color: 'var(--cyan)', x: 500, y: 220 },
        { id: 'pmtud', type: 'box', name: 'Path MTU Discovery', sub: 'DF bit set', color: 'var(--green)', x: 300, y: 250 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is MTU?',
        explanation: '<strong>MTU (Maximum Transmission Unit)</strong> is the largest Layer 2 payload size that can be transmitted without fragmentation.\n\nCommon MTU values:\n• <strong>Ethernet:</strong> 1500 bytes (standard)\n• <strong>Jumbo frames:</strong> 9000 bytes (data centers)\n• <strong>Loopback:</strong> 65535 bytes (Linux)\n• <strong>PPP over Ethernet (PPPoE):</strong> 1492 bytes (2 bytes reserved)\n\nIf a packet exceeds the MTU, it must be fragmented or dropped.',
        highlights: ['pkt'],
        packets: [],
        tables: {}
      },
      {
        title: 'Common MTUs',
        explanation: 'Different network technologies have different MTU limits:\n\n<code>Ethernet:     1500 bytes</code>\n<code>Jumbo Frame:  9000 bytes</code>\n<code>PPPoE:        1492 bytes</code>\n<code>Wi-Fi:        2304 bytes (802.11)</code>\n<code>Loopback:     65535 bytes (Linux)</code>\n\nThe standard Ethernet MTU of 1500 bytes is the most common limit you\'ll encounter. Jumbo frames are used in data centers for high-throughput storage and clustering traffic.',
        highlights: ['mtu'],
        packets: [],
        tables: {}
      },
      {
        title: 'Fragmentation',
        explanation: 'When a packet exceeds the MTU, it must be <strong>fragmented</strong> into smaller pieces.\n\nA 4000-byte packet must be split to fit the 1500-byte Ethernet MTU:\n• <strong>Fragment 1:</strong> 1500 bytes (offset 0)\n• <strong>Fragment 2:</strong> 1500 bytes (offset 1500)\n• <strong>Fragment 3:</strong> 1000 bytes (offset 3000)\n\nEach fragment is an independent packet with its own IP header. The receiver reassembles them using the <strong>Identification</strong>, <strong>Fragment Offset</strong>, and <strong>More Fragments (MF)</strong> flags.\n\nFragmentation adds overhead and can cause performance issues.',
        highlights: ['frag', 'frag2', 'frag3'],
        packets: [],
        tables: {},
        packetDetails: {
          frag1: {
            layers: [
              { name: 'IPv4 (Fragment 1)', color: 'var(--cyan)', fields: [
                ['Identification', '0x1234'],
                ['Fragment Offset', '0'],
                ['More Fragments', 'Yes (1)'],
                ['Total Length', '1500 bytes']
              ]}
            ]
          },
          frag2: {
            layers: [
              { name: 'IPv4 (Fragment 2)', color: 'var(--cyan)', fields: [
                ['Identification', '0x1234'],
                ['Fragment Offset', '185 (1480 bytes)'],
                ['More Fragments', 'Yes (1)'],
                ['Total Length', '1500 bytes']
              ]}
            ]
          },
          frag3: {
            layers: [
              { name: 'IPv4 (Fragment 3)', color: 'var(--cyan)', fields: [
                ['Identification', '0x1234'],
                ['Fragment Offset', '370 (2960 bytes)'],
                ['More Fragments', 'No (0)'],
                ['Total Length', '1000 bytes']
              ]}
            ]
          }
        }
      },
      {
        title: 'Path MTU Discovery',
        explanation: '<strong>Path MTU Discovery (PMTUD)</strong> finds the largest MTU along the entire path without fragmentation.\n\nHow it works:\n1. Sender sets the <strong>DF (Don\'t Fragment)</strong> bit in the IP header\n2. If a router can\'t forward the packet (too large, DF=1), it drops it and sends an <strong>ICMP Fragmentation Needed</strong> message (Type 3, Code 4)\n3. The sender reduces the packet size and retries\n4. This continues until the packet reaches the destination\n\nPMTUD avoids fragmentation entirely, improving performance. It\'s the preferred approach for TCP applications.',
        highlights: ['pmtud'],
        packets: [],
        tables: {},
        packetDetails: {
          pmtud: {
            layers: [
              { name: 'IPv4', color: 'var(--cyan)', fields: [
                ['DF Bit', '1 (Don\'t Fragment)'],
                ['ICMP Reply', 'Type 3, Code 4'],
                ['Action', 'Reduce packet size'],
                ['Result', 'No fragmentation needed']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'dns-records',
    name: 'DNS Records',
    icon: '📖',
    description: 'The phonebook entries — A, AAAA, CNAME, MX, TXT and more',
    category: 'Networking Fundamentals',
    order: 33,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'zone', type: 'box', name: 'example.com Zone', sub: 'DNS Zone File', x: 100, y: 80 },
        { id: 'a', type: 'box', name: 'A Record', sub: 'example.com → 93.184.216.34', color: 'var(--green)', x: 350, y: 30 },
        { id: 'aaaa', type: 'box', name: 'AAAA Record', sub: 'example.com → 2606:2800:220:1::248', color: 'var(--cyan)', x: 350, y: 90 },
        { id: 'cname', type: 'box', name: 'CNAME Record', sub: 'www → example.com', color: 'var(--amber)', x: 350, y: 150 },
        { id: 'mx', type: 'box', name: 'MX Record', sub: 'mail.example.com (priority 10)', color: 'var(--purple)', x: 350, y: 210 },
        { id: 'txt', type: 'box', name: 'TXT Record', sub: 'SPF, DKIM, verification', color: 'var(--red)', x: 350, y: 270 }
      ],
      links: []
    },
    steps: [
      {
        title: 'A Record (IPv4)',
        explanation: 'An <strong>A Record</strong> maps a hostname to an <strong>IPv4 address</strong>.\n\n<code>example.com → 93.184.216.34</code>\n\nThis is the most fundamental DNS record. When you type a URL in your browser, the first step is resolving the domain name to an IP address via A records.\n\n<strong>Key facts:</strong>\n• Returns a 32-bit IPv4 address\n• Multiple A records can exist for load balancing\n• TTL (Time To Live) controls caching duration\n\n<strong>Query:</strong> <code>dig example.com A</code>',
        highlights: ['a'],
        packets: [],
        tables: {}
      },
      {
        title: 'AAAA Record (IPv6)',
        explanation: 'An <strong>AAAA Record</strong> (quad-A) maps a hostname to an <strong>IPv6 address</strong>.\n\n<code>example.com → 2606:2800:220:1::248</code>\n\nAs IPv4 addresses run out, AAAA records become essential for modern websites. A domain can have both A and AAAA records — clients try IPv6 first if available.\n\n<strong>Key facts:</strong>\n• Returns a 128-bit IPv6 address\n• Named "AAAA" because IPv6 addresses are 4x longer than IPv4\n• Dual-stack: most sites run both A and AAAA\n\n<strong>Query:</strong> <code>dig example.com AAAA</code>',
        highlights: ['aaaa'],
        packets: [],
        tables: {}
      },
      {
        title: 'CNAME (Alias)',
        explanation: 'A <strong>CNAME Record</strong> (Canonical Name) points one hostname to another hostname.\n\n<code>www.example.com → example.com</code>\n\nCNAMEs are used for aliases. Instead of duplicating IP addresses, you point an alias to the canonical domain. The resolver then looks up the A/AAAA record of the target.\n\n<strong>Key facts:</strong>\n• Must point to a hostname, not an IP\n• Cannot coexist with other records on the same name\n• Common use: www → naked domain\n• chain lookups add latency\n\n<strong>Query:</strong> <code>dig www.example.com CNAME</code>',
        highlights: ['cname'],
        packets: [],
        tables: {}
      },
      {
        title: 'MX (Mail Exchange)',
        explanation: 'An <strong>MX Record</strong> specifies the mail server responsible for receiving email.\n\n<code>example.com → mail.example.com (priority 10)</code>\n\nMX records include a <strong>priority number</strong> — lower values are tried first. If the primary server is down, mail is routed to the next priority.\n\n<strong>Key facts:</strong>\n• Must point to a hostname (not IP)\n• Priority determines delivery order\n• Multiple MX records for redundancy\n• Required for receiving email\n\n<strong>Query:</strong> <code>dig example.com MX</code>',
        highlights: ['mx'],
        packets: [],
        tables: {}
      },
      {
        title: 'TXT (Text)',
        explanation: '<strong>TXT Records</strong> store arbitrary text. Originally for human-readable notes, they now serve critical security and verification purposes.\n\n<strong>Common uses:</strong>\n• <strong>SPF</strong> — Authorizes mail servers to send on behalf of your domain\n• <strong>DKIM</strong> — Cryptographic email signing\n• <strong>DMARC</strong> — Email authentication policy\n• <strong>Domain verification</strong> — Prove ownership to services (Google, Cloudflare)\n• <strong>SSL verification</strong> — Let\'s Encrypt DNS-01 challenge\n\n<strong>Example SPF:</strong>\n<code>v=spf1 include:_spf.google.com ~all</code>\n\n<strong>Query:</strong> <code>dig example.com TXT</code>',
        highlights: ['txt'],
        packets: [],
        tables: {}
      },
      {
        title: 'DNS Records Summary',
        explanation: '<strong>DNS Record Types Overview:</strong>\n\n• <strong>A</strong> — Maps hostname to IPv4 address\n• <strong>AAAA</strong> — Maps hostname to IPv6 address\n• <strong>CNAME</strong> — Alias pointing to another hostname\n• <strong>MX</strong> — Mail server with priority\n• <strong>TXT</strong> — Text data (SPF, DKIM, verification)\n• <strong>NS</strong> — Authoritative name servers for the zone\n• <strong>SOA</strong> — Start of Authority — zone metadata (serial, refresh, retry, expire)\n• <strong>PTR</strong> — Reverse DNS — maps IP to hostname\n\n<strong>Commands:</strong>\n<code>dig example.com</code> — Full query\n<code>dig +short example.com</code> — IP only\n<code>nslookup example.com</code> — Simple lookup\n<code>host example.com</code> — Quick check',
        highlights: ['zone', 'a', 'aaaa', 'cname', 'mx', 'txt'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'troubleshooting',
    name: 'Network Troubleshooting',
    icon: '🔧',
    description: 'The diagnostic toolkit — ping, traceroute, ss, tcpdump, dig',
    category: 'Networking Fundamentals',
    order: 34,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'problem', type: 'box', name: 'Problem', sub: 'No connectivity?', x: 100, y: 80 },
        { id: 'ping', type: 'box', name: 'ping', sub: 'Reachable?', color: 'var(--green)', x: 300, y: 30 },
        { id: 'traceroute', type: 'box', name: 'traceroute', sub: 'Path?', color: 'var(--cyan)', x: 300, y: 100 },
        { id: 'ss', type: 'box', name: 'ss / netstat', sub: 'Ports open?', color: 'var(--amber)', x: 300, y: 170 },
        { id: 'dig', type: 'box', name: 'dig', sub: 'DNS resolving?', color: 'var(--purple)', x: 300, y: 240 },
        { id: 'tcpdump', type: 'box', name: 'tcpdump', sub: 'Traffic flowing?', color: 'var(--red)', x: 300, y: 310 },
        { id: 'fix', type: 'box', name: 'Fix!', sub: 'Found the issue', color: 'var(--green)', x: 550, y: 150 }
      ],
      links: []
    },
    steps: [
      {
        title: 'ping — Is it alive?',
        explanation: '<strong>ping</strong> sends ICMP Echo Request packets to test basic connectivity.\n\n<code>ping google.com</code>\n\nIf you get replies, the destination is reachable at the network layer. If not, the problem is between you and the destination — could be DNS, routing, firewall, or the host itself.\n\n<strong>Key flags:</strong>\n• <code>-c 4</code> — Send 4 packets\n• <code>-i 0.2</code> — Interval between packets\n• <code>-s 1400</code> — Packet size (test MTU)\n• <code>-W 2</code> — Timeout in seconds\n\n<strong>What it tells you:</strong> Layer 3 connectivity is working.',
        highlights: ['ping'],
        packets: [],
        tables: {}
      },
      {
        title: 'traceroute — Where is it?',
        explanation: '<strong>traceroute</strong> (Linux) or <strong>tracert</strong> (Windows) shows the hop-by-hop path packets take.\n\n<code>traceroute google.com</code>\n\nIt works by sending packets with incrementing TTL (Time To Live). Each router along the path decrements TTL and sends back an ICMP "Time Exceeded" message.\n\n<strong>What it tells you:</strong>\n• Which routers the traffic passes through\n• Where latency occurs (high RTT at a hop)\n• Where packets are dropped (*** timeouts)\n• If there\'s a routing loop\n\n<strong>Key flags:</strong>\n• <code>-n</code> — Don\'t resolve hostnames\n• <code>-I</code> — Use ICMP (not UDP)\n• <code>-m 30</code> — Max hops',
        highlights: ['traceroute'],
        packets: [],
        tables: {}
      },
      {
        title: 'ss / netstat — What\'s listening?',
        explanation: '<strong>ss</strong> (socket statistics) shows open ports and established connections.\n\n<code>ss -tlnp</code> — TCP listening ports\n<code>ss -ulnp</code> — UDP listening ports\n<code>ss -tunap</code> — All connections\n\n<strong>Legacy:</strong> <code>netstat -tlnp</code> does the same thing.\n\n<strong>What it tells you:</strong>\n• Is the service listening on the expected port?\n• Is it bound to 0.0.0.0 (all interfaces) or 127.0.0.1 (localhost only)?\n• Are there established connections?\n• Which process owns the socket?\n\n<strong>Common issue:</strong> Service bound to localhost when it should be accessible remotely.',
        highlights: ['ss'],
        packets: [],
        tables: {}
      },
      {
        title: 'dig — DNS working?',
        explanation: '<strong>dig</strong> (Domain Information Groper) queries DNS servers directly.\n\n<code>dig example.com</code>\n<code>dig @8.8.8.8 example.com</code> — Use specific DNS server\n<code>dig +trace example.com</code> — Full resolution path\n\n<strong>What it tells you:</strong>\n• Is DNS resolving correctly?\n• What\'s the TTL?\n• Are there the right record types?\n• Is your DNS server returning stale data?\n\n<strong>Common issues:</strong>\n• Wrong DNS server configured\n• DNS cache poisoning\n• Missing records (A vs CNAME)\n• TTL too high (stale cache)\n\n<strong>Quick check:</strong> <code>dig +short example.com</code>',
        highlights: ['dig'],
        packets: [],
        tables: {}
      },
      {
        title: 'tcpdump — What\'s on the wire?',
        explanation: '<strong>tcpdump</strong> captures raw network packets for deep analysis.\n\n<code>tcpdump -i eth0 port 80</code>\n<code>tcpdump -i eth0 host 192.168.1.20</code>\n<code>tcpdump -w capture.pcap</code> — Save to file\n\n<strong>What it tells you:</strong>\n• Are packets actually arriving?\n• Are they going to the right destination?\n• What\'s in the packet headers?\n• Are there retransmissions (sign of packet loss)?\n• Is the TCP handshake completing?\n\n<strong>Key flags:</strong>\n• <code>-n</code> — Don\'t resolve names\n• <code>-A</code> — Show payload as ASCII\n• <code>-X</code> — Show payload as hex+ASCII\n• <code>-c 100</code> — Capture 100 packets\n\n<strong>Pro tip:</strong> Pipe to Wireshark: <code>tcpdump -w - | wireshark -k -i -</code>',
        highlights: ['tcpdump'],
        packets: [],
        tables: {}
      },
      {
        title: 'Troubleshooting Flow',
        explanation: '<strong>Systematic network troubleshooting approach:</strong>\n\n<strong>1. ping</strong> — Is the destination reachable?\n<strong>2. traceroute</strong> — Where does the path break?\n<strong>3. ss / netstat</strong> — Is the service listening?\n<strong>4. dig</strong> — Is DNS resolving correctly?\n<strong>5. tcpdump</strong> — What\'s actually on the wire?\n\n<strong>The golden rule:</strong> Start broad (ping) and narrow down (tcpdump). Each tool answers a specific question, and the order matters.\n\n<strong>Common flow:</strong>\n• ping fails → traceroute to find the broken hop\n• ping works but app fails → ss to check ports\n• DNS issues → dig to verify resolution\n• Intermittent issues → tcpdump to capture evidence',
        highlights: ['problem', 'ping', 'traceroute', 'ss', 'dig', 'tcpdump', 'fix'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'http',
    name: 'HTTP & HTTPS',
    icon: '🌐',
    description: 'The web protocol — requests, responses, status codes, TLS',
    category: 'Networking Fundamentals',
    order: 35,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'client', type: 'computer', name: 'Browser', sub: 'Client', x: 100, y: 100 },
        { id: 'server', type: 'server', name: 'Web Server', sub: 'nginx/Apache', x: 600, y: 100 },
        { id: 'req', type: 'box', name: 'HTTP Request', sub: 'GET /index.html HTTP/1.1', color: 'var(--cyan)', x: 350, y: 50 },
        { id: 'resp', type: 'box', name: 'HTTP Response', sub: '200 OK + HTML', color: 'var(--green)', x: 350, y: 150 },
        { id: 'tls', type: 'box', name: 'TLS Handshake', sub: 'Certificate exchange', color: 'var(--amber)', x: 350, y: 240 },
        { id: 'codes', type: 'box', name: 'Status Codes', sub: '200=OK, 404=Not Found, 500=Error', x: 350, y: 320 }
      ],
      links: []
    },
    steps: [
      {
        title: 'HTTP Request',
        explanation: 'An <strong>HTTP Request</strong> is sent by the client to the server.\n\n<code>GET /index.html HTTP/1.1</code>\n<code>Host: example.com</code>\n<code>User-Agent: Mozilla/5.0</code>\n<code>Accept: text/html</code>\n\n<strong>Request components:</strong>\n• <strong>Method</strong> — What action to perform (GET, POST, etc.)\n• <strong>Path</strong> — The resource URL (/index.html)\n• <strong>Version</strong> — HTTP version (HTTP/1.1, HTTP/2)\n• <strong>Headers</strong> — Metadata (Host, Accept, Authorization)\n• <strong>Body</strong> — Data payload (for POST/PUT)\n\n<strong>Example with curl:</strong>\n<code>curl -v https://example.com/index.html</code>',
        highlights: ['client', 'req', 'server'],
        packets: [],
        tables: {}
      },
      {
        title: 'HTTP Methods',
        explanation: '<strong>HTTP Methods</strong> define the action to perform on a resource:\n\n<strong>GET</strong> — Read a resource (idempotent)\n<strong>POST</strong> — Create a new resource\n<strong>PUT</strong> — Replace/update a resource (idempotent)\n<strong>PATCH</strong> — Partially update a resource\n<strong>DELETE</strong> — Remove a resource (idempotent)\n<strong>HEAD</strong> — Same as GET but no body (headers only)\n<strong>OPTIONS</strong> — What methods are allowed (CORS preflight)\n\n<strong>Idempotent</strong> means calling it multiple times has the same effect as calling it once.\n\n<strong>REST API example:</strong>\n<code>GET /api/users</code> — List users\n<code>POST /api/users</code> — Create user\n<code>PUT /api/users/1</code> — Update user 1\n<code>DELETE /api/users/1</code> — Delete user 1',
        highlights: ['req'],
        packets: [],
        tables: {}
      },
      {
        title: 'HTTP Response',
        explanation: 'The server sends back an <strong>HTTP Response</strong>:\n\n<code>HTTP/1.1 200 OK</code>\n<code>Content-Type: text/html</code>\n<code>Content-Length: 1234</code>\n\n<code>&lt;!DOCTYPE html&gt;</code>\n<code>&lt;html&gt;...&lt;/html&gt;</code>\n\n<strong>Response components:</strong>\n• <strong>Status Line</strong> — Version + status code + reason phrase\n• <strong>Headers</strong> — Metadata (Content-Type, Cache-Control, Set-Cookie)\n• <strong>Body</strong> — The actual content (HTML, JSON, images)\n\n<strong>Common headers:</strong>\n• <code>Content-Type</code> — MIME type of the body\n• <code>Cache-Control</code> — Caching directives\n• <code>Set-Cookie</code> — Set browser cookies\n• <code>Location</code> — Redirect URL (3xx)',
        highlights: ['resp', 'server', 'client'],
        packets: [],
        tables: {}
      },
      {
        title: 'HTTPS & TLS',
        explanation: '<strong>HTTPS</strong> is HTTP wrapped in <strong>TLS (Transport Layer Security)</strong> encryption.\n\n<strong>TLS Handshake:</strong>\n1. Client sends <strong>ClientHello</strong> (supported ciphers, TLS version)\n2. Server sends <strong>ServerHello</strong> (chosen cipher, certificate)\n3. Client verifies certificate against trusted CAs\n4. Key exchange — both sides generate shared secret\n5. Encrypted communication begins\n\n<strong>What TLS protects:</strong>\n• <strong>Confidentiality</strong> — Encryption prevents eavesdropping\n• <strong>Integrity</strong> — MAC prevents tampering\n• <strong>Authentication</strong> — Certificates verify server identity\n\n<strong>Check TLS:</strong>\n<code>openssl s_client -connect example.com:443</code>\n<code>curl -vI https://example.com</code>',
        highlights: ['tls', 'client', 'server'],
        packets: [],
        tables: {}
      },
      {
        title: 'Status Codes',
        explanation: '<strong>HTTP Status Codes</strong> indicate the result of the request:\n\n<strong>2xx Success:</strong>\n• <code>200 OK</code> — Request succeeded\n• <code>201 Created</code> — Resource created (POST)\n• <code>204 No Content</code> — Success, no body (DELETE)\n\n<strong>3xx Redirection:</strong>\n• <code>301 Moved Permanently</code> — Permanent redirect\n• <code>302 Found</code> — Temporary redirect\n• <code>304 Not Modified</code> — Use cached version\n\n<strong>4xx Client Error:</strong>\n• <code>400 Bad Request</code> — Malformed syntax\n• <code>401 Unauthorized</code> — Authentication required\n• <code>403 Forbidden</code> — No permission\n• <code>404 Not Found</code> — Resource doesn\'t exist\n\n<strong>5xx Server Error:</strong>\n• <code>500 Internal Server Error</code> — Generic server failure\n• <code>502 Bad Gateway</code> — Upstream server error\n• <code>503 Service Unavailable</code> — Server overloaded\n• <code>504 Gateway Timeout</code> — Upstream timeout',
        highlights: ['codes'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'osi-model',
    name: 'OSI & TCP-IP Model',
    icon: '\uD83D\uDCDA',
    description: 'The layered architecture \u2014 why networking is split into layers',
    category: 'Networking Fundamentals',
    order: 28,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'osi7', type: 'box', name: '7. Application', sub: 'HTTP, DNS, SMTP', color: 'var(--purple)', x: 100, y: 30, w: 120, h: 35 },
        { id: 'osi6', type: 'box', name: '6. Presentation', sub: 'Encryption, Compression', color: 'var(--purple)', x: 100, y: 80, w: 120, h: 35 },
        { id: 'osi5', type: 'box', name: '5. Session', sub: 'Sessions, Auth', color: 'var(--purple)', x: 100, y: 130, w: 120, h: 35 },
        { id: 'osi4', type: 'box', name: '4. Transport', sub: 'TCP, UDP', color: 'var(--cyan)', x: 100, y: 180, w: 120, h: 35 },
        { id: 'osi3', type: 'box', name: '3. Network', sub: 'IP, Routing', color: 'var(--green)', x: 100, y: 230, w: 120, h: 35 },
        { id: 'osi2', type: 'box', name: '2. Data Link', sub: 'Ethernet, MAC', color: 'var(--amber)', x: 100, y: 280, w: 120, h: 35 },
        { id: 'osi1', type: 'box', name: '1. Physical', sub: 'Cables, Signals', color: 'var(--red)', x: 100, y: 330, w: 120, h: 35 },
        { id: 'tcpip', type: 'box', name: 'TCP/IP Model', sub: '4 Layers', color: 'var(--cyan)', x: 350, y: 130, w: 160, h: 160 },
        { id: 'app', type: 'box', name: 'Application', sub: 'HTTP, DNS, SMTP', x: 350, y: 330, w: 140, h: 35 },
        { id: 'trans', type: 'box', name: 'Transport', sub: 'TCP, UDP', x: 350, y: 280, w: 140, h: 35 },
        { id: 'net', type: 'box', name: 'Internet', sub: 'IP, ICMP', x: 350, y: 230, w: 140, h: 35 },
        { id: 'link', type: 'box', name: 'Network Access', sub: 'Ethernet, WiFi', x: 350, y: 180, w: 140, h: 35 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Why Layers?',
        explanation: 'Networking is complex \u2014 from physical cables to application protocols. To manage this complexity, the industry split networking into <strong>layers</strong>.\n\nEach layer has <strong>one specific job</strong> and communicates with the layers directly above and below it. This is called <strong>modularity</strong>.\n\nBenefits:\n\u2022 <strong>Simpler design</strong> \u2014 each layer only handles its own concerns\n\u2022 <strong>Easier troubleshooting</strong> \u2014 isolate problems to a specific layer\n\u2022 <strong>Interoperability</strong> \u2014 vendors can build products for one layer without worrying about others\n\u2022 <strong>Flexibility</strong> \u2014 swap one layer without changing the others',
        highlights: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Physical Layer (Layer 1)',
        explanation: 'The <strong>Physical Layer</strong> deals with the raw transmission of <strong>bits</strong> over a physical medium.\n\nThis includes:\n\u2022 <strong>Cables</strong> \u2014 copper (Cat5e/Cat6), fiber optic, coaxial\n\u2022 <strong>Signals</strong> \u2014 electrical voltage, light pulses, radio waves\n\u2022 <strong>Connectors</strong> \u2014 RJ-45, LC, SC\n\u2022 <strong>Data rate</strong> \u2014 100 Mbps, 1 Gbps, 10 Gbps\n\nAt this layer, there are no addresses, no frames \u2014 just <strong>1s and 0s</strong> on the wire.',
        highlights: ['osi1'],
        packets: [],
        tables: {}
      },
      {
        title: 'Data Link Layer (Layer 2)',
        explanation: 'The <strong>Data Link Layer</strong> provides <strong>reliable node-to-node</strong> delivery on the same network.\n\nKey concepts:\n\u2022 <strong>MAC addresses</strong> \u2014 physical hardware identifiers (AA:BB:CC:DD:EE:FF)\n\u2022 <strong>Ethernet frames</strong> \u2014 the data unit at this layer\n\u2022 <strong>Switches</strong> \u2014 forward frames using MAC address tables\n\u2022 <strong>Error detection</strong> \u2014 CRC/FCS checks\n\nLayer 2 handles communication within a <strong>single local network</strong>. To reach a different network, you need Layer 3.',
        highlights: ['osi2'],
        packets: [],
        tables: {}
      },
      {
        title: 'Network Layer (Layer 3)',
        explanation: 'The <strong>Network Layer</strong> handles <strong>routing across different networks</strong>.\n\nKey concepts:\n\u2022 <strong>IP addresses</strong> \u2014 logical addresses (192.168.1.10)\n\u2022 <strong>Routers</strong> \u2014 forward packets between networks\n\u2022 <strong>Packets</strong> \u2014 the data unit at this layer\n\u2022 <strong>Routing tables</strong> \u2014 determine the best path\n\nLayer 3 enables communication across the internet by finding the best path from source to destination.',
        highlights: ['osi3'],
        packets: [],
        tables: {}
      },
      {
        title: 'Transport Layer (Layer 4)',
        explanation: 'The <strong>Transport Layer</strong> provides <strong>end-to-end communication</strong> between applications.\n\nTwo main protocols:\n\u2022 <strong>TCP</strong> \u2014 reliable, ordered delivery with acknowledgments\n\u2022 <strong>UDP</strong> \u2014 fast, connectionless, no guarantees\n\nKey concepts:\n\u2022 <strong>Port numbers</strong> \u2014 identify specific services (80 = HTTP, 443 = HTTPS)\n\u2022 <strong>Segments</strong> \u2014 the data unit at this layer\n\u2022 <strong>Flow control</strong> \u2014 prevent overwhelming the receiver',
        highlights: ['osi4'],
        packets: [],
        tables: {}
      },
      {
        title: 'Session/Presentation/Application (Layers 5-7)',
        explanation: 'The upper three layers handle <strong>application-level concerns</strong>:\n\n<strong>Layer 5 \u2014 Session:</strong>\n\u2022 Manages sessions between applications\n\u2022 Authentication and reconnection\n\n<strong>Layer 6 \u2014 Presentation:</strong>\n\u2022 Data formatting, encryption, compression\n\u2022 SSL/TLS encryption happens here\n\n<strong>Layer 7 \u2014 Application:</strong>\n\u2022 The protocols users interact with directly\n\u2022 HTTP, DNS, SMTP, FTP, SSH\n\nIn practice, the TCP/IP model merges these three into a single <strong>Application layer</strong>.',
        highlights: ['osi5', 'osi6', 'osi7'],
        packets: [],
        tables: {}
      },
      {
        title: 'TCP/IP Model (4 Layers)',
        explanation: 'The <strong>TCP/IP model</strong> is the practical, real-world model used on the internet today. It simplifies the OSI model into <strong>4 layers</strong>:\n\n\u2022 <strong>Application</strong> \u2014 HTTP, DNS, SMTP (combines OSI layers 5-7)\n\u2022 <strong>Transport</strong> \u2014 TCP, UDP (same as OSI layer 4)\n\u2022 <strong>Internet</strong> \u2014 IP, ICMP (same as OSI layer 3)\n\u2022 <strong>Network Access</strong> \u2014 Ethernet, WiFi (combines OSI layers 1-2)\n\n<strong>Key takeaway:</strong> Both models describe the same concepts \u2014 TCP/IP is just more practical. When people refer to "layers" in networking, they usually mean the TCP/IP model.',
        highlights: ['tcpip', 'app', 'trans', 'net', 'link'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'icmp',
    name: 'ICMP',
    icon: '\uD83D\uDCE1',
    description: 'The network messenger \u2014 ping, traceroute, error reporting',
    category: 'Networking Fundamentals',
    order: 29,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'src', type: 'box', name: 'Source', sub: '192.168.1.10', x: 100, y: 100 },
        { id: 'dst', type: 'box', name: 'Destination', sub: '8.8.8.8', x: 600, y: 100 },
        { id: 'echo', type: 'box', name: 'Echo Request', sub: 'Type 8, Code 0', color: 'var(--cyan)', x: 350, y: 60 },
        { id: 'reply', type: 'box', name: 'Echo Reply', sub: 'Type 0, Code 0', color: 'var(--green)', x: 350, y: 160 },
        { id: 'err', type: 'box', name: 'Unreachable', sub: 'Type 3, Code *', color: 'var(--red)', x: 350, y: 250 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is ICMP?',
        explanation: '<strong>ICMP (Internet Control Message Protocol)</strong> is a network-layer protocol used for <strong>error reporting</strong> and <strong>diagnostics</strong>.\n\nUnlike TCP or UDP, ICMP is not used to transport application data. Instead, it provides feedback about network conditions:\n\u2022 Is the destination reachable?\n\u2022 Did a packet get dropped?\n\u2022 Is the network congested?\n\nICMP operates at <strong>Layer 3</strong> (encapsulated directly in IP) and uses IP for delivery \u2014 but it\'s not a transport protocol.',
        highlights: ['src', 'dst'],
        packets: [],
        tables: {}
      },
      {
        title: 'ICMP Header',
        explanation: 'An ICMP message has a simple header structure:\n\n<code>Type (8 bits)</code> \u2014 identifies the message type (e.g., 8 = Echo Request)\n<code>Code (8 bits)</code> \u2014 provides additional detail for the type\n<code>Checksum (16 bits)</code> \u2014 error detection\n<code>Data</code> \u2014 variable payload (often the original packet header)\n\nThe Type and Code fields together define the ICMP message purpose.',
        highlights: [],
        packets: [],
        tables: {},
        packetDetails: {
          icmp: {
            layers: [
              { name: 'ICMP Header', color: 'var(--cyan)', fields: [
                ['Type', '8 (Echo Request)'],
                ['Code', '0'],
                ['Checksum', '0x1234'],
                ['Identifier', '0x0001'],
                ['Sequence', '1']
              ]}
            ]
          }
        }
      },
      {
        title: 'Echo Request (ping)',
        explanation: 'The <strong>ping</strong> command sends ICMP <strong>Echo Request</strong> messages (Type 8, Code 0) to test connectivity.\n\nWhen you type <code>ping 8.8.8.8</code>:\n\u2022 Your host sends an ICMP Echo Request to the destination\n\u2022 The destination replies with an ICMP Echo Reply (Type 0)\n\u2022 Round-trip time is measured\n\nPing is the most common ICMP use case \u2014 it\'s the network equivalent of "are you there?"',
        highlights: ['echo'],
        packets: [
          { id: 'icmp1', type: 'data', from: 'src', to: 'dst', color: 'var(--cyan)', label: 'Echo Request (Type 8)', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Echo Reply',
        explanation: 'The destination receives the Echo Request and responds with an <strong>Echo Reply</strong> (Type 0, Code 0).\n\nThe reply contains the same data that was sent in the request, allowing the source to verify that the data was received intact.\n\n<strong>Traceroute</strong> builds on this by sending packets with incrementing TTL values. Each router that decrements TTL to 0 sends back an ICMP <strong>Time Exceeded</strong> message (Type 11), revealing the path.',
        highlights: ['reply'],
        packets: [
          { id: 'icmp2', type: 'data', from: 'dst', to: 'src', color: 'var(--green)', label: 'Echo Reply (Type 0)', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Error Messages',
        explanation: 'ICMP generates <strong>error messages</strong> when packets can\'t be delivered:\n\n<strong>Type 3 \u2014 Destination Unreachable:</strong>\n\u2022 Code 0: Network unreachable\n\u2022 Code 1: Host unreachable\n\u2022 Code 2: Protocol unreachable\n\u2022 Code 3: Port unreachable\n\n<strong>Type 11 \u2014 Time Exceeded:</strong>\n\u2022 Code 0: TTL expired in transit (used by traceroute)\n\u2022 Code 1: Fragment reassembly timeout\n\nThese messages help <strong>diagnose network problems</strong> without needing access to the destination.',
        highlights: ['err'],
        packets: [],
        tables: {}
      },
      {
        title: 'ICMP Summary',
        explanation: '<strong>Key ICMP message types:</strong>\n\n<code>Type 0</code> \u2014 Echo Reply (response to ping)\n<code>Type 8</code> \u2014 Echo Request (ping)\n<code>Type 3</code> \u2014 Destination Unreachable\n<code>Type 5</code> \u2014 Redirect (use a better route)\n<code>Type 11</code> \u2014 Time Exceeded (TTL expired)\n<code>Type 13</code> \u2014 Timestamp Request\n\n<strong>Common tools using ICMP:</strong>\n\u2022 <strong>ping</strong> \u2014 Echo Request/Reply (Types 8/0)\n\u2022 <strong>traceroute</strong> \u2014 Time Exceeded (Type 11) + Echo Reply (Type 0)\n\u2022 <strong>path MTU discovery</strong> \u2014 Unreachable with "DF set" (Type 3, Code 4)',
        highlights: ['src', 'echo', 'reply', 'err', 'dst'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'udp',
    name: 'UDP',
    icon: '\u26A1',
    description: 'Fast and simple \u2014 connectionless transport for speed',
    category: 'Networking Fundamentals',
    order: 30,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'src', type: 'box', name: 'Client', x: 100, y: 100 },
        { id: 'dst', type: 'box', name: 'Server', x: 600, y: 100 },
        { id: 'seg', type: 'box', name: 'UDP Segment', sub: '8-byte header', color: 'var(--amber)', x: 350, y: 60 },
        { id: 'app', type: 'box', name: 'DNS Query', sub: 'Port 53', color: 'var(--purple)', x: 350, y: 160 },
        { id: 'game', type: 'box', name: 'Game Packet', sub: 'Port 7777', color: 'var(--cyan)', x: 350, y: 240 }
      ],
      links: []
    },
    steps: [
      {
        title: 'What is UDP?',
        explanation: '<strong>UDP (User Datagram Protocol)</strong> is a <strong>connectionless</strong> transport protocol defined in RFC 768.\n\nUnlike TCP, UDP:\n\u2022 Does <strong>not establish a connection</strong> (no handshake)\n\u2022 Does <strong>not guarantee delivery</strong> (packets may be lost)\n\u2022 Does <strong>not guarantee ordering</strong> (packets may arrive out of order)\n\u2022 Has <strong>no retransmission</strong> mechanism\n\nUDP is the "send and forget" protocol \u2014 it sends data and hopes for the best. This makes it <strong>extremely fast</strong> with minimal overhead.',
        highlights: ['src', 'dst'],
        packets: [],
        tables: {}
      },
      {
        title: 'UDP Header',
        explanation: 'The UDP header is incredibly simple \u2014 only <strong>8 bytes</strong> (compared to TCP\'s 20+ bytes):\n\n<code>Source Port (16 bits)</code> \u2014 sender\'s port\n<code>Destination Port (16 bits)</code> \u2014 receiver\'s port\n<code>Length (16 bits)</code> \u2014 total segment size (header + data)\n<code>Checksum (16 bits)</code> \u2014 error detection (optional in IPv4)\n\nThat\'s it \u2014 no sequence numbers, no acknowledgments, no flow control. Just ports and a length.',
        highlights: ['seg'],
        packets: [],
        tables: {},
        packetDetails: {
          udp: {
            layers: [
              { name: 'UDP Header (8 bytes)', color: 'var(--amber)', fields: [
                ['Source Port', '54321'],
                ['Destination', '53 (DNS)'],
                ['Length', '40 bytes'],
                ['Checksum', '0xABCD']
              ]}
            ]
          }
        }
      },
      {
        title: 'When UDP is Used',
        explanation: 'UDP is the protocol of choice when <strong>speed matters more than reliability</strong>:\n\n<strong>DNS queries:</strong>\n\u2022 Small request/response \u2014 no need for TCP overhead\n\u2022 If the query fails, just send another one\n\n<strong>DHCP:</strong>\n\u2022 Client has no IP yet \u2014 can\'t establish TCP connection\n\u2022 Broadcast discovery works better with UDP\n\n<strong>SNMP (monitoring):</strong>\n\u2022 Small, frequent status updates\n\u2022 Losing one update isn\'t critical',
        highlights: ['seg', 'app'],
        packets: [
          { id: 'udp1', type: 'data', from: 'src', to: 'dst', color: 'var(--purple)', label: 'DNS Query (Port 53)', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'Real-time Applications',
        explanation: 'UDP dominates <strong>real-time applications</strong> where latency is critical:\n\n<strong>Online Gaming:</strong>\n\u2022 Player positions update 60+ times per second\n\u2022 A lost packet is meaningless \u2014 the next one has newer data\n\u2022 TCP retransmission would cause lag spikes\n\n<strong>Video Streaming:</strong>\n\u2022 Buffering handles occasional losses\n\u2022 Live streams can\'t wait for retransmissions\n\n<strong>VoIP (Voice over IP):</strong>\n\u2022 Real-time voice can\'t tolerate delays\n\u2022 Brief audio glitches are acceptable, lag is not',
        highlights: ['app', 'game'],
        packets: [
          { id: 'udp2', type: 'data', from: 'src', to: 'dst', color: 'var(--cyan)', label: 'Game Packet (Port 7777)', duration: 1200 }
        ],
        tables: {}
      },
      {
        title: 'UDP Summary',
        explanation: '<strong>Key takeaway:</strong> UDP trades reliability for speed.\n\n\u2022 <strong>No handshake</strong> \u2014 just send immediately\n\u2022 <strong>No ordering</strong> \u2014 packets may arrive out of order\n\u2022 <strong>No retransmission</strong> \u2014 lost packets are gone\n\u2022 <strong>8-byte header</strong> \u2014 minimal overhead\n\u2022 <strong>Best for:</strong> DNS, DHCP, gaming, streaming, VoIP\n\n<strong>When to use UDP:</strong>\nIf your application can handle occasional lost packets and needs low latency, UDP is the right choice. If every byte must arrive, use TCP instead.',
        highlights: ['src', 'seg', 'app', 'game', 'dst'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'tcp-vs-udp',
    name: 'TCP vs UDP',
    icon: '\u2696\uFE0F',
    description: 'The tradeoff \u2014 reliability vs speed',
    category: 'Networking Fundamentals',
    order: 31,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'tcp', type: 'box', name: 'TCP', sub: 'Reliable', color: 'var(--cyan)', x: 100, y: 80 },
        { id: 'udp', type: 'box', name: 'UDP', sub: 'Fast', color: 'var(--amber)', x: 100, y: 200 },
        { id: 'tcpH', type: 'box', name: '20-byte Header', sub: 'Seq, Ack, Window', color: 'var(--cyan)', x: 350, y: 40 },
        { id: 'tcpF', type: 'box', name: 'Features', sub: 'Ordered, Retransmit, Flow Control', color: 'var(--cyan)', x: 350, y: 100 },
        { id: 'udpH', type: 'box', name: '8-byte Header', sub: 'Port, Length, Checksum', color: 'var(--amber)', x: 350, y: 180 },
        { id: 'udpU', type: 'box', name: 'Use Cases', sub: 'DNS, Gaming, Video', color: 'var(--amber)', x: 350, y: 240 }
      ],
      links: []
    },
    steps: [
      {
        title: 'TCP \u2014 Reliable',
        explanation: '<strong>TCP (Transmission Control Protocol)</strong> provides <strong>reliable, ordered</strong> delivery.\n\nKey features:\n\u2022 <strong>Connection-oriented</strong> \u2014 3-way handshake before data transfer\n\u2022 <strong>Ordered delivery</strong> \u2014 sequence numbers ensure data arrives in order\n\u2022 <strong>Retransmission</strong> \u2014 lost packets are automatically resent\n\u2022 <strong>Flow control</strong> \u2014 prevents overwhelming the receiver\n\u2022 <strong>Congestion control</strong> \u2014 adapts to network conditions\n\nTCP guarantees that every byte arrives intact and in order \u2014 but this comes with overhead.',
        highlights: ['tcp', 'tcpH', 'tcpF'],
        packets: [],
        tables: {}
      },
      {
        title: 'TCP Use Cases',
        explanation: 'TCP is used when <strong>data integrity is critical</strong>:\n\n<strong>HTTP/HTTPS (Web):</strong>\n\u2022 Web pages must load completely \u2014 no missing images or broken HTML\n\n<strong>Email (SMTP/IMAP):</strong>\n\u2022 An email can\'t arrive with missing words\n\n<strong>File Transfer (FTP/SFTP):</strong>\n\u2022 A corrupted file could be catastrophic\n\n<strong>SSH:</strong>\n\u2022 Remote commands must execute exactly as typed\n\nIn short: if losing even one byte would break the application, use TCP.',
        highlights: ['tcpF'],
        packets: [],
        tables: {}
      },
      {
        title: 'UDP \u2014 Fast',
        explanation: '<strong>UDP (User Datagram Protocol)</strong> provides <strong>fast, connectionless</strong> delivery.\n\nKey characteristics:\n\u2022 <strong>Connectionless</strong> \u2014 no handshake, just send\n\u2022 <strong>No ordering</strong> \u2014 packets may arrive out of order\n\u2022 <strong>No retransmission</strong> \u2014 lost packets are gone\n\u2022 <strong>8-byte header</strong> \u2014 minimal overhead\n\u2022 <strong>No flow/congestion control</strong> \u2014 sends at full speed\n\nUDP is the "fire and forget" protocol \u2014 ideal when speed matters more than perfection.',
        highlights: ['udp', 'udpH', 'udpU'],
        packets: [],
        tables: {}
      },
      {
        title: 'When to Use Which',
        explanation: '<strong>Decision guide:</strong>\n\n<code>Protocol    | Use TCP?  | Use UDP?</code>\n<code>HTTP/HTTPS  | YES       | No</code>\n<code>DNS         | Rarely    | YES (default)</code>\n<code>Gaming      | No        | YES</code>\n<code>Email       | YES       | No</code>\n<code>Video       | Streaming | Live YES</code>\n<code>VoIP        | No        | YES</code>\n<code>File Trans  | YES       | No</code>\n<code>DHCP        | No        | YES</code>\n\n<strong>Rule of thumb:</strong>\n\u2022 Every byte must arrive? \u2192 <strong>TCP</strong>\n\u2022 Speed matters more? \u2192 <strong>UDP</strong>\n\u2022 Small query/response? \u2192 <strong>UDP</strong>\n\u2022 Large data transfer? \u2192 <strong>TCP</strong>',
        highlights: ['tcp', 'udp'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'ipv6',
    name: 'IPv6',
    icon: '\uD83C\uDF0D',
    description: 'The next generation \u2014 128-bit addresses for the future',
    category: 'Networking Fundamentals',
    order: 32,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'v4', type: 'box', name: 'IPv4', sub: '32-bit (4.3B addresses)', color: 'var(--amber)', x: 100, y: 80 },
        { id: 'v6', type: 'box', name: 'IPv6', sub: '128-bit (3.4\u00D710^38)', color: 'var(--green)', x: 100, y: 200 },
        { id: 'format', type: 'box', name: 'Format', sub: '2001:0db8:85a3::8a2e:0370:7334', x: 400, y: 40 },
        { id: 'feat', type: 'box', name: 'Features', sub: 'No NAT, Auto-config, IPSec', x: 400, y: 140 },
        { id: 'dual', type: 'box', name: 'Dual Stack', sub: 'IPv4 + IPv6 running together', color: 'var(--cyan)', x: 400, y: 240 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Why IPv6?',
        explanation: 'IPv4 provides only <strong>4.3 billion</strong> addresses (2^32). With the explosion of devices \u2014 smartphones, IoT, servers \u2014 the world is <strong>running out of IPv4 addresses</strong>.\n\nWorkarounds like <strong>NAT</strong> and <strong>private IP ranges</strong> have extended IPv4\'s life, but they add complexity and break the end-to-end principle.\n\n<strong>IPv6</strong> solves this with <strong>128-bit addresses</strong> \u2014 providing 3.4\u00D710^38 addresses. That\'s enough to give every atom on Earth its own IP address.',
        highlights: ['v4'],
        packets: [],
        tables: {}
      },
      {
        title: 'IPv4 vs IPv6',
        explanation: '<strong>IPv4:</strong>\n\u2022 32-bit address (4 octets)\n\u2022 Dotted decimal: <code>192.168.1.10</code>\n\u2022 ~4.3 billion addresses\n\u2022 Header: 20-60 bytes (variable)\n\u2022 Checksum required\n\n<strong>IPv6:</strong>\n\u2022 128-bit address (8 groups of 16 bits)\n\u2022 Colon-hex: <code>2001:0db8:85a3::8a2e:0370:7334</code>\n\u2022 3.4\u00D710^38 addresses\n\u2022 Header: fixed 40 bytes\n\u2022 No checksum (relying on link-layer CRC)',
        highlights: ['v4', 'v6'],
        packets: [],
        tables: {}
      },
      {
        title: 'IPv6 Address Format',
        explanation: 'An IPv6 address is written as <strong>8 groups of 4 hexadecimal digits</strong>, separated by colons:\n\n<code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code>\n\n<strong>Compression rules:</strong>\n\u2022 Leading zeros in a group can be omitted: <code>0db8</code> \u2192 <code>db8</code>\n\u2022 One consecutive group of all zeros can be replaced with <code>::</code>\n\u2022 <code>2001:0db8:85a3::8a2e:0370:7334</code>\n\n<strong>Special addresses:</strong>\n\u2022 <code>::1</code> \u2014 loopback (like 127.0.0.1)\n\u2022 <code>::</code> \u2014 unspecified (like 0.0.0.0)\n\u2022 <code>fe80::/10</code> \u2014 link-local range',
        highlights: ['format'],
        packets: [],
        tables: {},
        packetDetails: {
          ipv6: {
            layers: [
              { name: 'IPv6 Address', color: 'var(--green)', fields: [
                ['Full', '2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
                ['Compressed', '2001:db8:85a3::8a2e:370:7334'],
                ['Bit Length', '128 bits (8 groups of 16)'],
                ['Format', 'Colon-Hexadecimal']
              ]}
            ]
          }
        }
      },
      {
        title: 'IPv6 Features',
        explanation: 'IPv6 introduces several improvements over IPv4:\n\n<strong>No NAT needed:</strong>\n\u2022 Every device can have a globally unique address\n\u2022 Restores end-to-end connectivity\n\n<strong>SLAAC (Stateless Address Auto-configuration):</strong>\n\u2022 Devices automatically configure their own IPv6 address\n\u2022 No DHCP server required (though DHCPv6 exists)\n\n<strong>Built-in IPSec:</strong>\n\u2022 Originally mandatory in IPv6 (now recommended)\n\u2022 Provides authentication and encryption at the network layer\n\n<strong>Simplified header:</strong>\n\u2022 Fixed 40-byte header (faster processing)\n\u2022 No checksum (rely on link-layer and upper-layer checksums)',
        highlights: ['feat'],
        packets: [],
        tables: {}
      },
      {
        title: 'Dual Stack',
        explanation: 'The transition from IPv4 to IPv6 is happening <strong>gradually</strong> through <strong>dual stack</strong> operation.\n\nDuring the transition period:\n\u2022 Devices run <strong>both IPv4 and IPv6</strong> simultaneously\n\u2022 Applications try IPv6 first, fall back to IPv4\n\u2022 Networks carry both protocol types on the same infrastructure\n\n<strong>Transition mechanisms:</strong>\n\u2022 <strong>Dual Stack</strong> \u2014 run both protocols (most common)\n\u2022 <strong>Tunneling</strong> \u2014 encapsulate IPv6 in IPv4 packets (6to4, Teredo)\n\u2022 <strong>NAT64/DNS64</strong> \u2014 translate between IPv4 and IPv6\n\nIPv6 adoption is growing \u2014 over 40% of Google traffic now comes over IPv6.',
        highlights: ['dual'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'load-balancing',
    name: 'Load Balancing',
    icon: '⚖️',
    description: 'Distributing traffic — L4/L7 balancers, algorithms, health checks',
    category: 'Advanced Networking',
    order: 42,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'client', type: 'box', name: 'Clients', sub: 'Internet traffic', x: 100, y: 100 },
        { id: 'lb', type: 'box', name: 'Load Balancer', sub: 'L4/L7', color: 'var(--cyan)', x: 350, y: 100 },
        { id: 'b1', type: 'box', name: 'Backend 1', sub: '192.168.1.10', color: 'var(--green)', x: 600, y: 40 },
        { id: 'b2', type: 'box', name: 'Backend 2', sub: '192.168.1.11', color: 'var(--green)', x: 600, y: 120 },
        { id: 'b3', type: 'box', name: 'Backend 3', sub: '192.168.1.12', color: 'var(--green)', x: 600, y: 200 },
        { id: 'health', type: 'box', name: 'Health Checks', sub: 'TCP/HTTP probes', color: 'var(--amber)', x: 350, y: 220 }
      ],
      links: [
        { id: 'link-client-lb', from: 'client', to: 'lb' },
        { id: 'link-lb-b1', from: 'lb', to: 'b1' },
        { id: 'link-lb-b2', from: 'lb', to: 'b2' },
        { id: 'link-lb-b3', from: 'lb', to: 'b3' },
        { id: 'link-health-lb', from: 'health', to: 'lb' }
      ]
    },
    steps: [
      {
        title: 'L4 Load Balancing',
        explanation: '<strong>L4 (Layer 4) Load Balancing</strong> operates at the transport layer.\n\nIt routes traffic based on <strong>IP address and port number</strong> only — it does not inspect the payload.\n\n<strong>How it works:</strong>\n• Receives a TCP/UDP connection\n• Selects a backend based on the algorithm\n• Forwards the raw packet stream\n\n<strong>Advantages:</strong>\n• Very fast — minimal processing per packet\n• Low latency — no payload inspection\n• High throughput — handles millions of connections\n\nL4 is ideal for simple, high-volume traffic distribution where content inspection is not needed.',
        highlights: ['lb'],
        packets: [],
        tables: {}
      },
      {
        title: 'L7 Load Balancing',
        explanation: '<strong>L7 (Layer 7) Load Balancing</strong> operates at the application layer.\n\nIt can inspect <strong>HTTP headers, URLs, cookies, and content</strong> to make intelligent routing decisions.\n\n<strong>How it works:</strong>\n• Terminates the client TCP connection\n• Inspects the HTTP request\n• Routes to the appropriate backend based on rules\n\n<strong>Example rules:</strong>\n• <code>/api/*</code> → Backend API servers\n• <code>/static/*</code> → CDN or file servers\n• <code>Host: shop.example.com</code> → Shopping cart servers\n\nL7 enables content-aware routing but adds latency due to deep packet inspection.',
        highlights: ['lb'],
        packets: [],
        tables: {}
      },
      {
        title: 'Load Balancing Algorithms',
        explanation: 'The load balancer uses an <strong>algorithm</strong> to decide which backend receives each connection:\n\n<strong>Round Robin:</strong>\n• Cycles through backends sequentially\n• Simple and fair for equal-capacity servers\n\n<strong>Least Connections:</strong>\n• Routes to the backend with fewest active connections\n• Good for variable request durations\n\n<strong>IP Hash:</strong>\n• Hashes the client IP to determine backend\n• Same client always hits the same server (session persistence)\n\n<strong>Weighted:</strong>\n• Backends have assigned weights (e.g., 3:1)\n• More powerful servers get more traffic',
        highlights: ['lb'],
        packets: [],
        tables: {}
      },
      {
        title: 'Backend Pool Management',
        explanation: 'Backends are organized into a <strong>server pool</strong> managed by the load balancer.\n\n<strong>Key concepts:</strong>\n• <strong>Weighting</strong> — assign traffic proportionally based on server capacity\n• <strong>Draining</strong> — gracefully remove a server from rotation without dropping active connections\n• <strong>Connection limits</strong> — cap concurrent connections per backend\n• <strong>Session persistence</strong> — sticky sessions ensure same client hits same backend\n\nWhen a backend is draining, new connections go elsewhere while existing ones complete. This enables zero-downtime maintenance.',
        highlights: ['b1', 'b2', 'b3'],
        packets: [],
        tables: {}
      },
      {
        title: 'Health Checks',
        explanation: 'The load balancer continuously monitors backend health using <strong>health checks</strong>.\n\n<strong>Active probes:</strong>\n• <strong>TCP check</strong> — can we establish a TCP connection?\n• <strong>HTTP check</strong> — does <code>GET /health</code> return 200 OK?\n• Custom checks — verify specific endpoints or responses\n\n<strong>Passive monitoring:</strong>\n• Track error rates from real traffic\n• Detect slow responses or timeouts\n\n<strong>Failover:</strong>\n• If a backend fails checks → <strong>removed from pool</strong>\n• Traffic redistributed to healthy backends\n• When health restores → <strong>automatically re-added</strong>\n\nHealth checks prevent the load balancer from sending traffic to failed or overloaded servers.',
        highlights: ['health'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'cdn',
    name: 'CDN',
    icon: '🌍',
    description: 'Content Delivery Networks — edge caching for global performance',
    category: 'Advanced Networking',
    order: 43,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'origin', type: 'box', name: 'Origin Server', sub: 'US-East', color: 'var(--amber)', x: 100, y: 100 },
        { id: 'edge1', type: 'box', name: 'Edge: Europe', sub: 'London POP', color: 'var(--green)', x: 350, y: 30 },
        { id: 'edge2', type: 'box', name: 'Edge: Asia', sub: 'Tokyo POP', color: 'var(--green)', x: 350, y: 120 },
        { id: 'edge3', type: 'box', name: 'Edge: Americas', sub: 'São Paulo POP', color: 'var(--green)', x: 350, y: 210 },
        { id: 'dns', type: 'box', name: 'DNS Routing', sub: 'GeoDNS / Anycast', color: 'var(--cyan)', x: 550, y: 100 },
        { id: 'cache', type: 'box', name: 'Cache Hit', sub: 'TTL-based freshness', color: 'var(--purple)', x: 550, y: 200 }
      ],
      links: [
        { id: 'link-origin-e1', from: 'origin', to: 'edge1' },
        { id: 'link-origin-e2', from: 'origin', to: 'edge2' },
        { id: 'link-origin-e3', from: 'origin', to: 'edge3' },
        { id: 'link-dns-cache', from: 'dns', to: 'cache' }
      ]
    },
    steps: [
      {
        title: 'Edge Locations — POPs Worldwide',
        explanation: 'A <strong>CDN (Content Delivery Network)</strong> distributes content across <strong>Points of Presence (POPs)</strong> worldwide.\n\nEach POP contains <strong>edge servers</strong> that cache copies of the origin content.\n\n<strong>How it helps:</strong>\n• <strong>Reduced latency</strong> — content served from the nearest edge, not the origin\n• <strong>Reduced bandwidth</strong> — origin only serves cache misses\n• <strong>High availability</strong> — if one edge fails, others serve the content\n• <strong>DDoS protection</strong> — traffic is distributed across many edge servers\n\nPopular CDNs include Cloudflare, AWS CloudFront, Akamai, and Fastly.',
        highlights: ['edge1', 'edge2', 'edge3'],
        packets: [],
        tables: {}
      },
      {
        title: 'DNS-Based Routing',
        explanation: 'The CDN uses <strong>DNS routing</strong> to direct users to the nearest edge server.\n\n<strong>GeoDNS:</strong>\n• DNS resolver returns the IP of the closest edge based on the user\'s geographic location\n• European users → London POP, Asian users → Tokyo POP\n\n<strong>Anycast:</strong>\n• Multiple edge servers announce the same IP address\n• BGP routing naturally directs traffic to the nearest server\n• Same IP, different physical locations\n\nThe user doesn\'t know which edge they\'re hitting — the CDN handles the routing transparently.',
        highlights: ['dns'],
        packets: [],
        tables: {}
      },
      {
        title: 'Cache Strategy — HIT vs MISS',
        explanation: 'When a user requests content, the edge server checks its <strong>cache</strong>:\n\n<strong>Cache HIT:</strong>\n• Content is in the edge cache and still fresh (within TTL)\n• Edge serves it immediately — fast!\n• No request to the origin server\n\n<strong>Cache MISS:</strong>\n• Content is not cached or has expired\n• Edge fetches from the origin server\n• Stores a copy for future requests\n• Serves the response to the user\n\n<strong>TTL (Time To Live):</strong>\n• Controls how long cached content stays fresh\n• Short TTL → more origin fetches, but fresher content\n• Long TTL → fewer origin fetches, but stale content risk',
        highlights: ['cache'],
        packets: [],
        tables: {}
      },
      {
        title: 'CDN Summary',
        explanation: '<strong>CDN Models:</strong>\n\n<strong>Pull CDN:</strong>\n• Edge fetches from origin on first request (cache miss)\n• Content pulled automatically as needed\n• Good for: dynamic or frequently updated content\n\n<strong>Push CDN:</strong>\n• Content pushed to edges ahead of time\n• Origin controls when and what to distribute\n• Good for: static content with predictable access patterns\n\n<strong>Cache Invalidation:</strong>\n• Purge cached content before TTL expires\n• Purge by URL, tag, or entire cache\n• Essential for content updates or emergency fixes\n\n<strong>Protocols:</strong>\n• HTTP/HTTPS — web content, APIs\n• Video streaming — HLS, DASH segments\n• Software updates — OS patches, app downloads\n\nCDNs are critical infrastructure — they serve over 50% of all web traffic globally.',
        highlights: ['origin', 'edge1', 'edge2', 'edge3', 'dns', 'cache'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'vxlan',
    name: 'VXLAN',
    icon: '📦',
    description: 'Virtual Extensible LAN — overlay networking for data centers',
    category: 'Advanced Networking',
    order: 44,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'vtep1', type: 'box', name: 'VTEP 1', sub: '192.168.1.10', color: 'var(--cyan)', x: 100, y: 100 },
        { id: 'vtep2', type: 'box', name: 'VTEP 2', sub: '192.168.1.20', color: 'var(--amber)', x: 600, y: 100 },
        { id: 'under', type: 'box', name: 'Underlay Network', sub: 'Physical IP fabric', color: 'var(--green)', x: 350, y: 200 },
        { id: 'vni', type: 'box', name: 'VNI 10000', sub: '24-bit segment ID (16M VLANs)', color: 'var(--purple)', x: 350, y: 80 },
        { id: 'encap', type: 'box', name: 'Encapsulation', sub: 'UDP:4789 + VXLAN header', x: 350, y: 150 }
      ],
      links: [
        { id: 'link-vtep1-under', from: 'vtep1', to: 'under' },
        { id: 'link-vtep2-under', from: 'vtep2', to: 'under' },
        { id: 'link-vni-encap', from: 'vni', to: 'encap' }
      ]
    },
    steps: [
      {
        title: 'VTEPs — Tunnel Endpoints',
        explanation: '<strong>VTEPs (VXLAN Tunnel Endpoints)</strong> are the devices that encapsulate and decapsulate VXLAN packets.\n\n<strong>What they do:</strong>\n• <strong>Encapsulate:</strong> Take an original Ethernet frame and wrap it in a VXLAN/UDP/IP header\n• <strong>Decapsulate:</strong> Strip the outer headers and deliver the original frame\n\nVTEPs can be:\n• Physical switches (hardware VTEPs)\n• Hypervisors (software VTEPs in VMware, KVM)\n• Linux hosts (using <code>ip link</code> or OVS)\n\nEach VTEP has both a <strong>VXLAN VTEP IP</strong> (outer) and connects to <strong>virtual networks</strong> (inner).',
        highlights: ['vtep1', 'vtep2'],
        packets: [],
        tables: {}
      },
      {
        title: 'Underlay Network',
        explanation: 'The <strong>underlay network</strong> is the physical IP fabric that carries VXLAN traffic.\n\n<strong>Key characteristics:</strong>\n• Standard IP routing — the underlay doesn\'t know about VXLAN\n• Could be a simple L3 network or a complex spine-leaf fabric\n• Each VTEP is reachable via its underlay IP\n\n<strong>Overlay vs Underlay:</strong>\n• <strong>Overlay</strong> — the virtual network (VXLAN segments)\n• <strong>Underlay</strong> — the physical network (IP fabric)\n\nThe underlay just routes outer IP packets between VTEPs. It doesn\'t care what\'s inside the VXLAN tunnel — it treats them as normal UDP packets.',
        highlights: ['under'],
        packets: [],
        tables: {}
      },
      {
        title: 'VNI — VXLAN Network Identifier',
        explanation: 'The <strong>VNI (VXLAN Network Identifier)</strong> is a 24-bit segment ID that identifies the virtual network.\n\n<strong>Why VNI matters:</strong>\n• <strong>24-bit</strong> → supports up to <strong>16,777,216 segments</strong> (16 million)\n• Compare to VLANs: only <strong>4,096</strong> possible VLANs (12-bit)\n• VNI is the VLAN equivalent in the overlay world\n\n<strong>How it works:</strong>\n• Each VNI maps to a virtual network (like a VLAN)\n• VMs in the same VNI can communicate directly\n• VMs in different VNIs are isolated (need a router)\n\nVXLAN solves the VLAN scalability problem — large cloud providers need millions of network segments, not just 4,096.',
        highlights: ['vni'],
        packets: [],
        tables: {}
      },
      {
        title: 'Encapsulation — The VXLAN Packet',
        explanation: 'When VTEP 1 sends a frame to VTEP 2, it <strong>encapsulates</strong> the original frame:\n\n<strong>Encapsulation stack:</strong>\n<code>Original Ethernet Frame</code>\n<code>  → VXLAN Header (8 bytes, includes VNI)</code>\n<code>    → UDP Header (src port, dst port 4789)</code>\n<code>      → Outer IP Header (VTEP IPs)</code>\n<code>        → Outer Ethernet Header</code>\n\n<strong>Port 4789</strong> is the IANA-assigned UDP port for VXLAN.\n\nThe underlay network only sees a normal UDP packet. The VXLAN header is invisible to physical switches and routers.\n\nAt the receiving VTEP, the outer headers are stripped and the original frame is delivered to the destination VM.',
        highlights: ['encap'],
        packets: [],
        tables: {},
        packetDetails: {
          vxlan: {
            layers: [
              { name: 'Outer Ethernet', color: 'var(--blue)', fields: [
                ['Destination', 'VTEP 2 MAC'],
                ['Source', 'VTEP 1 MAC'],
                ['Type', 'IPv4 (0x0800)']
              ]},
              { name: 'Outer IPv4', color: 'var(--cyan)', fields: [
                ['Source IP', '192.168.1.10 (VTEP 1)'],
                ['Destination', '192.168.1.20 (VTEP 2)'],
                ['Protocol', 'UDP (17)']
              ]},
              { name: 'UDP', color: 'var(--green)', fields: [
                ['Source Port', 'Random'],
                ['Destination', '4789 (VXLAN)']
              ]},
              { name: 'VXLAN Header', color: 'var(--purple)', fields: [
                ['Flags', '0x08 (I flag set)'],
                ['VNI', '10000'],
                ['Reserved', '24 bits']
              ]},
              { name: 'Original Frame', color: 'var(--amber)', fields: [
                ['Ethernet', 'Inner src/dst MAC'],
                ['Payload', 'Original data']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'sdn',
    name: 'SDN',
    icon: '🎛️',
    description: 'Software Defined Networking — separating control and data planes',
    category: 'Advanced Networking',
    order: 45,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'app', type: 'box', name: 'Application Layer', sub: 'Network apps', color: 'var(--purple)', x: 100, y: 30 },
        { id: 'ctrl', type: 'box', name: 'Control Plane', sub: 'SDN Controller (ONOS, ODL)', color: 'var(--cyan)', x: 100, y: 120 },
        { id: 'data', type: 'box', name: 'Data Plane', sub: 'OpenFlow Switches', color: 'var(--green)', x: 100, y: 220 },
        { id: 'api', type: 'box', name: 'Northbound API', sub: 'REST API', x: 350, y: 80 },
        { id: 'south', type: 'box', name: 'Southbound API', sub: 'OpenFlow, NETCONF', color: 'var(--amber)', x: 350, y: 180 }
      ],
      links: [
        { id: 'link-app-api', from: 'app', to: 'api' },
        { id: 'link-api-ctrl', from: 'api', to: 'ctrl' },
        { id: 'link-ctrl-south', from: 'ctrl', to: 'south' },
        { id: 'link-south-data', from: 'south', to: 'data' }
      ]
    },
    steps: [
      {
        title: 'Application Layer — Network Apps',
        explanation: 'The <strong>Application Layer</strong> contains network applications that define <strong>what</strong> the network should do.\n\n<strong>Examples:</strong>\n• <strong>Routing apps</strong> — compute optimal paths for traffic\n• <strong>Monitoring apps</strong> — track traffic flows and anomalies\n• <strong>Security apps</strong> — detect and block threats\n• <strong>Load balancing apps</strong> — distribute traffic across servers\n\nThese applications communicate with the controller via the <strong>Northbound API</strong>. They don\'t directly configure switches — they express intent, and the controller translates that into forwarding rules.',
        highlights: ['app'],
        packets: [],
        tables: {}
      },
      {
        title: 'Control Plane — The SDN Controller',
        explanation: 'The <strong>SDN Controller</strong> is the centralized brain of the network.\n\n<strong>What it does:</strong>\n• Maintains a <strong>global view</strong> of the entire network topology\n• Makes <strong>forwarding decisions</strong> based on application requirements\n• Pushes <strong>flow rules</strong> to switches via the Southbound API\n• Responds to <strong>network events</strong> (link failures, new devices)\n\n<strong>Popular controllers:</strong>\n• <strong>ONOS</strong> — open-source, carrier-grade\n• <strong>OpenDaylight (ODL)</strong> — modular, extensible\n• <strong>Ryu</strong> — lightweight, Python-based\n\nThe controller is the single point of intelligence — it knows the entire network state and makes optimal decisions.',
        highlights: ['ctrl'],
        packets: [],
        tables: {}
      },
      {
        title: 'Data Plane — OpenFlow Switches',
        explanation: 'The <strong>Data Plane</strong> consists of <strong>programmable switches</strong> that follow controller instructions.\n\n<strong>How they work:</strong>\n• Switches have <strong>flow tables</strong> (not MAC tables)\n• Each flow table entry matches packets and defines actions\n• Switches forward packets based on these entries\n• If no match → send to controller (packet-in)\n\n<strong>Flow table entry structure:</strong>\n<code>Match fields → Priority → Counters → Actions</code>\n\n<strong>Match fields:</strong> src/dst IP, ports, VLAN, protocol\n<strong>Actions:</strong> forward, drop, modify headers, send to controller\n\nUnlike traditional switches, OpenFlow switches are <strong>dumb forwarding engines</strong> — the controller tells them exactly what to do.',
        highlights: ['data'],
        packets: [],
        tables: {}
      },
      {
        title: 'Northbound API — Apps ↔ Controller',
        explanation: 'The <strong>Northbound API</strong> enables applications to communicate with the SDN controller.\n\n<strong>Primary interface: REST API</strong>\n• Apps send HTTP requests to the controller\n• Query topology, push rules, get statistics\n• Language-agnostic — any app in any language can use it\n\n<strong>Example API calls:</strong>\n<code>GET /topology</code> — get network topology\n<code>POST /flows</code> — install new flow rules\n<code>GET /stats/flow</code> — get flow statistics\n\nThe Northbound API is what makes SDN <strong>programmable</strong> — developers can write network applications without understanding hardware-specific CLI commands.',
        highlights: ['api'],
        packets: [],
        tables: {}
      },
      {
        title: 'Southbound API — Controller ↔ Switches',
        explanation: 'The <strong>Southbound API</strong> enables the controller to communicate with network devices.\n\n<strong>Primary protocols:</strong>\n• <strong>OpenFlow</strong> — the standard SDN protocol for switch control\n• <strong>NETCONF/YANG</strong> — configuration management for routers/switches\n• <strong>gRPC/gNMI</strong> — modern, high-performance device management\n\n<strong>How it works:</strong>\n• Controller pushes flow entries to switches via OpenFlow\n• Switches report events (packet-in, link changes) back to controller\n• Controller maintains real-time view of all device states\n\n<strong>OpenFlow message types:</strong>\n• <code>FlowMod</code> — add/modify/delete flow entries\n• <code>PacketOut</code> — send a packet out a switch port\n• <code>PacketIn</code> — switch sends unknown packet to controller\n• <code>Barrier</code> — ensure ordering of operations\n\nThe Southbound API is what <strong>decouples</strong> the control plane from the data plane — the defining characteristic of SDN.',
        highlights: ['south'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'zero-trust',
    name: 'Zero Trust',
    icon: '🛡️',
    description: 'Never trust, always verify — identity-based network security',
    category: 'Advanced Networking',
    order: 46,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'identity', type: 'box', name: 'Identity', sub: 'Who are you?', x: 100, y: 40, color: 'var(--cyan)' },
        { id: 'device', type: 'box', name: 'Device Posture', sub: 'Is it healthy?', x: 100, y: 130, color: 'var(--green)' },
        { id: 'network', type: 'box', name: 'Network Access', sub: 'Micro-segmentation', x: 100, y: 220, color: 'var(--amber)' },
        { id: 'app', type: 'box', name: 'Application', sub: 'Per-app access', x: 100, y: 310, color: 'var(--purple)' },
        { id: 'policy', type: 'box', name: 'Policy Engine', sub: 'Context-aware decisions', x: 350, y: 150 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Identity Verification',
        explanation: '<strong>Identity</strong> is the first pillar of Zero Trust.\n\n<strong>Who are you?</strong>\n\nEvery access request begins with <strong>strong identity verification</strong>:\n• <strong>MFA (Multi-Factor Authentication)</strong> — something you know + something you have\n• <strong>SSO (Single Sign-On)</strong> — centralized authentication across all apps\n• <strong>Continuous authentication</strong> — re-verify throughout the session, not just at login\n\n<strong>Traditional model:</strong> "You logged in once, you\u2019re trusted."\n<strong>Zero Trust:</strong> "Prove who you are, every single time."',
        highlights: ['identity'],
        packets: [],
        tables: {}
      },
      {
        title: 'Device Trust',
        explanation: '<strong>Device Posture</strong> — the second pillar.\n\n<strong>Is it healthy?</strong>\n\nBefore granting access, Zero Trust verifies the <strong>device itself</strong>:\n• <strong>Device health checks</strong> — is the OS patched? Is antivirus running?\n• <strong>Compliance</strong> — does the device meet security baselines?\n• <strong>EDR (Endpoint Detection & Response)</strong> — is there malware or suspicious activity?\n\n<strong>Why it matters:</strong> Even a valid user on a compromised device is a risk. Zero Trust evaluates <strong>both</strong> user identity AND device health.',
        highlights: ['device'],
        packets: [],
        tables: {}
      },
      {
        title: 'Micro-segmentation',
        explanation: '<strong>Network Access</strong> — the third pillar.\n\n<strong>Micro-segmentation</strong> means:\n• <strong>Least-privilege access</strong> — only access what you need, nothing more\n• <strong>No implicit trust</strong> — being on the network doesn\u2019t mean you\u2019re trusted\n• <strong>Per-workload segmentation</strong> — each app/server is its own security zone\n\n<strong>Traditional:</strong> Flat network — once inside, you can reach everything.\n<strong>Zero Trust:</strong> Every connection is individually authorized and encrypted.',
        highlights: ['network'],
        packets: [],
        tables: {}
      },
      {
        title: 'Per-Application Access',
        explanation: '<strong>Application</strong> layer — the fourth pillar.\n\n<strong>ZTNA (Zero Trust Network Access)</strong> replaces traditional VPN:\n• <strong>No VPN</strong> — users connect directly to apps, not the network\n• <strong>Per-app access</strong> — each application requires separate authorization\n• <strong>Direct app access</strong> — no backhauling through corporate network\n\n<strong>Traditional VPN:</strong> Full network access once connected.\n<strong>ZTNA:</strong> Only access the specific app you\u2019re authorized for, nothing else.',
        highlights: ['app'],
        packets: [],
        tables: {}
      },
      {
        title: 'Policy Engine',
        explanation: '<strong>Policy Engine</strong> — the brain of Zero Trust.\n\n<strong>Context-aware decisions:</strong>\n\nThe policy engine evaluates multiple signals before granting access:\n• <strong>User identity</strong> — who is requesting?\n• <strong>Device posture</strong> — is the device compliant?\n• <strong>Location</strong> — where are they connecting from?\n• <strong>Time</strong> — is it during business hours?\n• <strong>Risk score</strong> — how likely is this a threat?\n\n<strong>Result:</strong> ALLOW or DENY — every request is individually evaluated.',
        highlights: ['policy'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'tls13',
    name: 'TLS 1.3',
    icon: '🔐',
    description: 'Modern encryption — faster, simpler, more secure handshake',
    category: 'Advanced Networking',
    order: 47,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'client', type: 'box', name: 'Client', sub: 'Browser', x: 100, y: 100 },
        { id: 'server', type: 'box', name: 'Server', sub: 'nginx', x: 600, y: 100 },
        { id: 'ch', type: 'box', name: 'ClientHello', sub: 'Key share, supported ciphers', x: 350, y: 40, color: 'var(--cyan)' },
        { id: 'sh', type: 'box', name: 'ServerHello', sub: 'Selected cipher, key share', x: 350, y: 120, color: 'var(--green)' },
        { id: 'fin', type: 'box', name: 'Finished', sub: 'Encrypted, 1-RTT', x: 350, y: 200, color: 'var(--amber)' },
        { id: 'zero', type: 'box', name: '0-RTT', sub: 'Resumed session', x: 350, y: 280, color: 'var(--purple)' }
      ],
      links: []
    },
    steps: [
      {
        title: '1-RTT Handshake',
        explanation: '<strong>TLS 1.3</strong> completes the handshake in <strong>1 round trip (1-RTT)</strong>.\n\nCompare to TLS 1.2 which needed <strong>2 round trips</strong>:\n\n<strong>TLS 1.2:</strong>\n1. ClientHello → ServerHello\n2. Certificate + ServerKeyExchange → ClientKeyExchange\n3. ChangeCipherSpec + Finished (both sides)\n\n<strong>TLS 1.3:</strong>\n1. ClientHello (with key share) → ServerHello (with key share)\n2. Finished (encrypted)\n\n<strong>Result:</strong> Faster connection establishment, especially on high-latency networks.',
        highlights: ['ch', 'sh'],
        packets: [],
        tables: {}
      },
      {
        title: 'Key Exchange',
        explanation: '<strong>DH key shares</strong> are included in the <strong>first message</strong>.\n\nIn TLS 1.3, the client includes its <strong>Diffie-Hellman key share</strong> in the ClientHello. The server responds with its key share in ServerHello.\n\n<strong>Forward secrecy is mandatory</strong> — every connection uses ephemeral keys that are destroyed after use. Even if the server\u2019s private key is compromised later, past sessions cannot be decrypted.\n\n<strong>Removed:</strong> RSA key exchange (no forward secrecy) is no longer allowed.',
        highlights: ['ch'],
        packets: [],
        tables: {}
      },
      {
        title: 'Cipher Suites',
        explanation: 'TLS 1.3 <strong>drastically reduces</strong> the number of cipher suites.\n\n<strong>TLS 1.3 only allows 5 cipher suites:</strong>\n• <code>TLS_AES_256_GCM_SHA384</code>\n• <code>TLS_AES_128_GCM_SHA256</code>\n• <code>TLS_CHACHA20_POLY1305_SHA256</code>\n• <code>TLS_AES_128_CCM_SHA256</code>\n• <code>TLS_AES_128_CCM_8_SHA256</code>\n\n<strong>Removed insecure ciphers:</strong>\n• RSA key exchange\n• CBC mode ciphers\n• RC4, 3DES, DES\n• SHA-1\n\n<strong>Result:</strong> Smaller attack surface, fewer configuration mistakes.',
        highlights: ['ch', 'sh'],
        packets: [],
        tables: {}
      },
      {
        title: '0-RTT Resumption',
        explanation: '<strong>0-RTT (Zero Round Trip)</strong> allows instant reconnection.\n\nWhen a client reconnects to a server it has visited before:\n• The server provides a <strong>Pre-Shared Key (PSK)</strong> during the first connection\n• On reconnect, the client sends the PSK + encrypted data <strong>immediately</strong>\n• No handshake needed — data flows instantly\n\n<strong>Trade-off:</strong> 0-RTT data is <strong>not replay-protected</strong>. An attacker could capture and replay the 0-RTT data. Use for idempotent requests only.',
        highlights: ['fin', 'zero'],
        packets: [],
        tables: {}
      },
      {
        title: 'TLS 1.3 vs 1.2',
        explanation: '<strong>Key differences between TLS 1.3 and 1.2:</strong>\n\n<strong>Removed in TLS 1.3:</strong>\n• RSA key exchange (no forward secrecy)\n• CBC mode ciphers (BEAST, Lucky13 attacks)\n• SHA-1 (collision attacks)\n• RC4, 3DES, DES (weak encryption)\n• Compression (CRIME attack)\n• Renegotiation (security issues)\n\n<strong>Added in TLS 1.3:</strong>\n• 0-RTT resumption\n• 1-RTT handshake (vs 2-RTT)\n• Mandatory forward secrecy\n• Encrypted handshake (most of ServerHello is now encrypted)\n• Simplified cipher suites (5 vs dozens)\n\n<strong>Result:</strong> Faster, simpler, and significantly more secure.',
        highlights: ['ch', 'sh', 'fin', 'zero'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'wireguard',
    name: 'WireGuard',
    icon: '🔑',
    description: 'Modern VPN — fast, simple, secure tunnel protocol',
    category: 'Advanced Networking',
    order: 48,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'peer1', type: 'box', name: 'Peer A', sub: 'PublicKey: abc...', x: 100, y: 100, color: 'var(--cyan)' },
        { id: 'peer2', type: 'box', name: 'Peer B', sub: 'PublicKey: xyz...', x: 600, y: 100, color: 'var(--green)' },
        { id: 'tunnel', type: 'box', name: 'Encrypted Tunnel', sub: 'Noise Protocol, ChaCha20', x: 350, y: 80, color: 'var(--amber)' },
        { id: 'keys', type: 'box', name: 'Key Exchange', sub: 'Static + ephemeral keys', x: 350, y: 180 },
        { id: 'roam', type: 'box', name: 'Roaming', sub: 'Auto peer discovery', x: 350, y: 260, color: 'var(--purple)' }
      ],
      links: []
    },
    steps: [
      {
        title: 'Peer-to-Peer',
        explanation: '<strong>WireGuard</strong> operates as a <strong>mesh VPN</strong> — peers connect directly to each other.\n\n<strong>No central server needed</strong> (though one can be used for coordination):\n• Each peer has a pair of cryptographic keys\n• Peers communicate directly when possible\n• NAT traversal is handled automatically\n\n<strong>Traditional VPN:</strong> All traffic routes through a central server.\n<strong>WireGuard:</strong> Peers establish direct encrypted tunnels when they can reach each other.',
        highlights: ['peer1', 'peer2'],
        packets: [],
        tables: {}
      },
      {
        title: 'Noise Protocol',
        explanation: '<strong>Noise Protocol Framework</strong> — the foundation of WireGuard.\n\nThe <strong>IK (Init with known responder)</strong> handshake pattern:\n1. Initiator sends: ephemeral key + encrypted static key + encrypted payload\n2. Responder replies: ephemeral key + encrypted payload + MAC\n\n<strong>Encryption:</strong>\n• <strong>ChaCha20</strong> — stream cipher for data encryption\n• <strong>Poly1305</strong> — MAC for message authentication\n• <strong>Curve25519</strong> — elliptic curve for key exchange\n\n<strong>Result:</strong> Complete handshake in just <strong>1 round trip</strong> — 1-RTT.',
        highlights: ['tunnel'],
        packets: [],
        tables: {}
      },
      {
        title: 'Key Management',
        explanation: '<strong>Static + ephemeral keys</strong> provide both identity and forward secrecy.\n\n<strong>Static keys:</strong>\n• Long-term public/private key pair per peer\n• Used for peer identification\n• Distributed out-of-band (config files)\n\n<strong>Ephemeral keys:</strong>\n• Generated fresh for each session\n• Used for key derivation during handshake\n• Destroyed after use\n\n<strong>Result:</strong> Even if a static key is compromised, past sessions remain secure (forward secrecy).',
        highlights: ['keys'],
        packets: [],
        tables: {}
      },
      {
        title: 'Roaming & Mobility',
        explanation: '<strong>Auto peer discovery</strong> and seamless IP changes.\n\nWireGuard handles network changes automatically:\n• <strong>Auto peer discovery</strong> — peers find each other without static configuration\n• <strong>IP changes handled seamlessly</strong> — if a peer\u2019s IP changes (e.g., switching WiFi to cellular), the tunnel continues uninterrupted\n• <strong>NAT traversal</strong> — built-in hole punching for peers behind NAT\n\n<strong>Why it works:</strong> WireGuard identifies peers by their public key, not their IP address. As long as the key is the same, the peer can appear from any IP.',
        highlights: ['roam'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'dnssec',
    name: 'DNSSEC',
    icon: '✅',
    description: 'DNS Security Extensions — preventing cache poisoning and spoofing',
    category: 'Advanced Networking',
    order: 49,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'root', type: 'box', name: 'Root Zone', sub: '.', sub2: 'Signed', x: 350, y: 30, color: 'var(--purple)' },
        { id: 'tld', type: 'box', name: '.com Zone', sub: 'DS record from root', x: 350, y: 120, color: 'var(--cyan)' },
        { id: 'domain', type: 'box', name: 'example.com', sub: 'RRSIG + DNSKEY', x: 350, y: 210, color: 'var(--green)' },
        { id: 'valid', type: 'box', name: 'Resolver Validates', sub: 'Chain of trust', x: 550, y: 150 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Chain of Trust',
        explanation: '<strong>DNSSEC</strong> builds a <strong>chain of trust</strong> from the root zone down.\n\n<strong>Root zone</strong> (.) — the anchor:\n• Signed with a well-known Key Signing Key (KSK)\n• Published in IANA root key signing ceremony\n• Resolvers trust this key as the starting point\n\n<strong>How it works:</strong>\n1. Root zone signs the TLD zones\n2. TLD zones sign the domains under them\n3. Domains sign their own records\n4. Resolver verifies each signature up to the root\n\n<strong>Result:</strong> If any record is tampered with, the signature chain breaks.',
        highlights: ['root'],
        packets: [],
        tables: {}
      },
      {
        title: 'DS Records',
        explanation: '<strong>DS (Delegation Signer)</strong> records — parent signs child.\n\nThe parent zone (e.g., .com) contains a <strong>DS record</strong> that hashes the child zone\'s DNSKEY:\n\n<code>.com → DS: SHA-256 hash of example.com DNSKEY</code>\n\n<strong>How it works:</strong>\n1. Parent zone signs the DS record with its own key\n2. Resolver fetches the DS record from the parent\n3. Resolver verifies the hash matches the child\'s DNSKEY\n\n<strong>Result:</strong> The parent zone vouches for the child zone\'s key — extending the chain of trust.',
        highlights: ['tld'],
        packets: [],
        tables: {}
      },
      {
        title: 'RRSIG + DNSKEY',
        explanation: '<strong>Resource records</strong> are signed with <strong>RRSIG</strong>.\n\nEach DNS record type has associated security records:\n\n<strong>DNSKEY:</strong>\n• Contains the public key used to verify signatures\n• Zone Signing Key (ZSK) — signs individual records\n• Key Signing Key (KSK) — signs the DNSKEY record itself\n\n<strong>RRSIG:</strong>\n• The cryptographic signature over the resource records\n• Contains: signature algorithm, expiration, original TTL\n• Generated using the zone\'s private key\n\n<strong>Query:</strong> <code>dig example.com +dnssec</code>',
        highlights: ['domain'],
        packets: [],
        tables: {}
      },
      {
        title: 'Validation',
        explanation: '<strong>Resolver verifies</strong> the entire chain of trust.\n\n<strong>Validation process:</strong>\n1. Resolver receives a DNS response with RRSIG\n2. Fetches the zone\'s DNSKEY\n3. Verifies the RRSIG against the DNSKEY\n4. Checks the DS record from the parent zone\n5. Verifies the parent\'s DS matches the child\'s DNSKEY hash\n6. Continues up to the root zone (which it already trusts)\n\n<strong>If any step fails:</strong>\n• Signature mismatch → <strong>SERVFAIL</strong>\n• Expired signature → <strong>SERVFAIL</strong>\n• Missing signature → <strong>SERVFAIL</strong>\n\n<strong>Result:</strong> DNSSEC-validated responses are cryptographically proven authentic.',
        highlights: ['valid'],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'quic',
    name: 'QUIC',
    icon: '⚡',
    description: 'UDP-based transport — HTTP/3, 0-RTT, multiplexing',
    category: 'Advanced Networking',
    order: 50,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'tcp', type: 'box', name: 'TCP + TLS 1.3', sub: '2-3 RTTs', color: 'var(--amber)', x: 100, y: 60, highlighted: 's<=1' },
        { id: 'quic', type: 'box', name: 'QUIC', sub: '0-1 RTT', color: 'var(--green)', x: 100, y: 180, highlighted: 's===2' },
        { id: 'mux', type: 'box', name: 'Multiplexed Streams', sub: 'No head-of-line blocking', color: 'var(--cyan)', x: 350, y: 100, highlighted: 's===3' },
        { id: 'loss', type: 'box', name: 'Per-Stream Recovery', sub: 'Independent loss handling', color: 'var(--purple)', x: 350, y: 200, highlighted: 's===4' }
      ],
      links: []
    },
    steps: [
      {
        title: 'TCP + TLS Overhead',
        explanation: 'Traditional <strong>TCP + TLS 1.3</strong> requires <strong>2-3 round trips</strong> before any application data can be sent:\n\n1. TCP SYN → SYN-ACK (1 RTT)\n2. TLS ClientHello → ServerHello + Finished (1 RTT)\n3. TLS Finished → ACK (1 RTT)\n\nOnly after these handshakes can the HTTP request begin. Each RTT adds latency — especially painful on high-latency connections.',
        highlights: ['tcp'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          tcpHs: {
            layers: [
              { name: 'TCP + TLS 1.3 Handshake', color: 'var(--amber)', fields: [
                ['Step 1', 'TCP SYN → SYN-ACK (1 RTT)'],
                ['Step 2', 'TLS ClientHello → ServerHello (1 RTT)'],
                ['Step 3', 'TLS Finished → ACK (1 RTT)'],
                ['Total', '2-3 RTTs before data']
              ]}
            ]
          }
        }
      },
      {
        title: 'QUIC Speed',
        explanation: '<strong>QUIC</strong> runs over <strong>UDP</strong> and integrates TLS 1.3 directly into the protocol.\n\nFirst connection: <strong>1 RTT</strong> (QUIC combines transport + crypto handshake)\nResuming: <strong>0-RTT</strong> (client can send data immediately using cached crypto params)\n\nQUIC eliminates the TCP+TLS layering overhead by building both into a single protocol.',
        highlights: ['quic'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          quicHs: {
            layers: [
              { name: 'QUIC Handshake', color: 'var(--green)', fields: [
                ['First Connection', '1 RTT (combined transport + crypto)'],
                ['Resumption', '0-RTT (cached parameters)'],
                ['Transport', 'UDP (port 443)'],
                ['Crypto', 'TLS 1.3 built-in']
              ]}
            ]
          }
        }
      },
      {
        title: 'Stream Multiplexing',
        explanation: '<strong>QUIC</strong> supports <strong>multiple independent streams</strong> within a single connection.\n\nUnlike TCP (where one lost packet blocks all data), QUIC streams are <strong>independently multiplexed</strong>. A loss on one stream doesn\'t affect others.\n\nThis eliminates <strong>head-of-line blocking</strong> — a major performance problem in HTTP/2 over TCP.',
        highlights: ['mux'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          muxStreams: {
            layers: [
              { name: 'Stream Multiplexing', color: 'var(--cyan)', fields: [
                ['Stream 1', 'HTML document (independent)'],
                ['Stream 2', 'CSS stylesheet (independent)'],
                ['Stream 3', 'JavaScript file (independent)'],
                ['Key Benefit', 'No head-of-line blocking']
              ]}
            ]
          }
        }
      },
      {
        title: 'Per-Stream Recovery',
        explanation: 'Each QUIC stream has <strong>independent loss detection and recovery</strong>.\n\nIf a packet carrying Stream 1 data is lost, only Stream 1 waits for retransmission. Streams 2 and 3 continue uninterrupted.\n\nTCP, by contrast, treats all data as one byte stream — a single lost packet blocks delivery to the application for <em>all</em> data.',
        highlights: ['loss'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          lossRecovery: {
            layers: [
              { name: 'Per-Stream Loss Recovery', color: 'var(--purple)', fields: [
                ['Stream 1', 'Packet lost → only Stream 1 waits'],
                ['Stream 2', 'Unaffected — continues delivering'],
                ['Stream 3', 'Unaffected — continues delivering'],
                ['TCP Comparison', 'One loss blocks ALL streams']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'qos',
    name: 'QoS',
    icon: '📊',
    description: 'Quality of Service — traffic shaping, prioritization, DSCP',
    category: 'Advanced Networking',
    order: 51,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'traffic', type: 'box', name: 'Mixed Traffic', sub: 'All packets', x: 40, y: 100 },
        { id: 'classify', type: 'box', name: 'Classifier', sub: 'DSCP / 802.1p', color: 'var(--cyan)', x: 250, y: 100, highlighted: 's===1' },
        { id: 'voice', type: 'box', name: 'Voice Queue', sub: 'EF (DSCP 46)', color: 'var(--green)', x: 500, y: 30, highlighted: 's===2' },
        { id: 'video', type: 'box', name: 'Video Queue', sub: 'AF41 (DSCP 34)', color: 'var(--amber)', x: 500, y: 110, highlighted: 's===2' },
        { id: 'data', type: 'box', name: 'Data Queue', sub: 'BE (DSCP 0)', color: 'var(--text-muted)', x: 500, y: 190, highlighted: 's===2' },
        { id: 'shape', type: 'box', name: 'Traffic Shaping', sub: 'Rate limiting, WRED', x: 500, y: 280, highlighted: 's===3' }
      ],
      links: []
    },
    steps: [
      {
        title: 'Classification',
        explanation: '<strong>Classification</strong> is the first step of QoS — identifying and marking traffic.\n\nPackets are classified using:\n• <strong>DSCP</strong> (Differentiated Services Code Point) — 6-bit field in the IP header\n• <strong>802.1p CoS</strong> (Class of Service) — 3-bit field in the VLAN tag\n\nThe classifier reads these bits and assigns each packet to a traffic class.',
        highlights: ['classify'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          dscp: {
            layers: [
              { name: 'Classification Fields', color: 'var(--cyan)', fields: [
                ['DSCP (IP Header)', '6 bits — 64 possible classes'],
                ['802.1p (VLAN Tag)', '3 bits — 8 priority levels'],
                ['ACLs', 'Access Control Lists match fields'],
                ['NBAR', 'Network-Based Application Recognition']
              ]}
            ]
          }
        }
      },
      {
        title: 'Queuing',
        explanation: 'After classification, packets are placed into <strong>priority queues</strong>:\n\n• <strong>Voice Queue (EF, DSCP 46)</strong> — strict priority, lowest latency\n• <strong>Video Queue (AF41, DSCP 34)</strong> — weighted fair queuing\n• <strong>Data Queue (BE, DSCP 0)</strong> — best effort, lowest priority\n\nQueuing algorithms include <strong>WFQ</strong> (Weighted Fair Queuing), <strong>CBWFQ</strong> (Class-Based WFQ), and <strong>LLQ</strong> (Low Latency Queuing).',
        highlights: ['voice', 'video', 'data'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          queues: {
            layers: [
              { name: 'Priority Queues', color: 'var(--green)', fields: [
                ['Voice (EF)', 'Strict Priority — always sent first'],
                ['Video (AF41)', 'Weighted — guaranteed bandwidth'],
                ['Data (BE)', 'Best Effort — send when available'],
                ['Algorithms', 'WFQ, CBWFQ, LLQ']
              ]}
            ]
          }
        }
      },
      {
        title: 'Traffic Shaping',
        explanation: '<strong>Traffic Shaping</strong> controls the rate of outgoing traffic to prevent congestion.\n\nKey mechanisms:\n• <strong>Token Bucket</strong> — allows bursts up to bucket size\n• <strong>Leaky Bucket</strong> — smooths traffic to a fixed rate\n• <strong>WRED</strong> (Weighted Random Early Detection) — proactively drops packets before queues fill up, preferring to drop low-priority traffic',
        highlights: ['shape'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          shaping: {
            layers: [
              { name: 'Traffic Shaping Mechanisms', color: 'var(--amber)', fields: [
                ['Token Bucket', 'Allows controlled bursts'],
                ['Leaky Bucket', 'Enforces constant output rate'],
                ['WRED', 'Proactive drop before queue overflow'],
                ['Rate Limiting', 'Police/Shape to committed rates']
              ]}
            ]
          }
        }
      },
      {
        title: 'QoS Summary',
        explanation: '<strong>QoS</strong> ensures critical traffic gets priority during congestion.\n\n<strong>Key steps:</strong>\n1. <strong>Classify</strong> — mark packets with DSCP/CoS\n2. <strong>Queue</strong> — place into priority queues (EF, AF, BE)\n3. <strong>Shape</strong> — control rates, prevent congestion\n4. <strong>Schedule</strong> — strict priority for voice, weighted for others\n\nWithout QoS, all traffic is treated equally — voice calls would suffer during file transfers.',
        highlights: ['classify', 'voice', 'video', 'data', 'shape'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          qosSummary: {
            layers: [
              { name: 'QoS Classes', color: 'var(--green)', fields: [
                ['EF (Expedited Forwarding)', 'Voice — DSCP 46 — Strict Priority'],
                ['AF (Assured Forwarding)', 'Video — DSCP 34 — Weighted'],
                ['BE (Best Effort)', 'Data — DSCP 0 — Lowest Priority'],
                ['Algorithms', 'WFQ, CBWFQ, LLQ, WRED']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'automation',
    name: 'Network Automation',
    icon: '🤖',
    description: 'NetDevOps — Ansible, Terraform, programmable infrastructure',
    category: 'Advanced Networking',
    order: 52,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'git', type: 'box', name: 'Git Repo', sub: 'Config as Code', color: 'var(--cyan)', x: 100, y: 40, highlighted: 's===1' },
        { id: 'cicd', type: 'box', name: 'CI/CD Pipeline', sub: 'GitHub Actions / GitLab CI', color: 'var(--green)', x: 100, y: 140, highlighted: 's===2' },
        { id: 'ansible', type: 'box', name: 'Ansible', sub: 'Idempotent playbooks', color: 'var(--amber)', x: 350, y: 80, highlighted: 's===3' },
        { id: 'terraform', type: 'box', name: 'Terraform', sub: 'Infrastructure as Code', color: 'var(--purple)', x: 350, y: 180, highlighted: 's===4' },
        { id: 'devices', type: 'box', name: 'Network Devices', sub: 'Routers, Switches, Firewalls', x: 600, y: 120 }
      ],
      links: []
    },
    steps: [
      {
        title: 'Config as Code',
        explanation: '<strong>Configuration as Code</strong> stores all network device configs in a <strong>Git repository</strong>.\n\nInstead of manually logging into devices and typing commands:\n• Every config change is a <strong>Git commit</strong>\n• Changes are <strong>reviewed</strong> via pull requests\n• History is <strong>versioned</strong> — easy rollback\n• Configs are <strong>auditable</strong> — who changed what, when\n\nThis is the foundation of <strong>NetDevOps</strong>.',
        highlights: ['git'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          gitConfig: {
            layers: [
              { name: 'Config as Code Benefits', color: 'var(--cyan)', fields: [
                ['Version Control', 'Every change tracked in Git'],
                ['Code Review', 'Pull requests for approval'],
                ['Rollback', 'Revert to any previous version'],
                ['Audit Trail', 'Full history of who changed what']
              ]}
            ]
          }
        }
      },
      {
        title: 'CI/CD for Networks',
        explanation: '<strong>CI/CD pipelines</strong> automate testing and deployment of network configs:\n\n1. Engineer pushes config change to Git\n2. <strong>CI pipeline</strong> runs:\n   - Syntax validation (linting)\n   - Compliance checks\n   - Dry-run against test environment\n3. <strong>CD pipeline</strong> deploys to production after approval\n\nThis catches errors <strong>before</strong> they reach production devices.',
        highlights: ['cicd'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          cicd: {
            layers: [
              { name: 'CI/CD Pipeline Stages', color: 'var(--green)', fields: [
                ['Commit', 'Push config change to Git'],
                ['Lint', 'Syntax and best-practice validation'],
                ['Test', 'Dry-run against lab/sandbox'],
                ['Deploy', 'Push to production devices']
              ]}
            ]
          }
        }
      },
      {
        title: 'Ansible',
        explanation: '<strong>Ansible</strong> is a push-based automation tool using <strong>YAML playbooks</strong>.\n\nKey characteristics:\n• <strong>Idempotent</strong> — running the same playbook twice produces the same result\n• <strong>Agentless</strong> — uses SSH/NETCONF, no software on devices\n• <strong>Push-based</strong> — controller pushes configs to devices\n• <strong>Declarative</strong> — describe the desired state, Ansible makes it happen\n\nAnsible is ideal for <strong>configuration management</strong> — ensuring devices stay in the desired state.',
        highlights: ['ansible'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          ansible: {
            layers: [
              { name: 'Ansible Characteristics', color: 'var(--amber)', fields: [
                ['Idempotent', 'Same result every run'],
                ['Agentless', 'No software on managed devices'],
                ['Push-Based', 'Controller pushes to devices'],
                ['YAML Playbooks', 'Human-readable automation']
              ]}
            ]
          }
        }
      },
      {
        title: 'Terraform',
        explanation: '<strong>Terraform</strong> is a declarative Infrastructure as Code (IaC) tool.\n\nKey differences from Ansible:\n• <strong>Declarative</strong> — describe what you want, not how to get there\n• <strong>State management</strong> — tracks what exists vs what\'s desired\n• <strong>Multi-vendor</strong> — works with AWS, Azure, VMware, and network devices\n• <strong>Plan/Apply</strong> — preview changes before applying\n\nTerraform excels at <strong>infrastructure provisioning</strong> — creating and destroying resources.',
        highlights: ['terraform'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          terraform: {
            layers: [
              { name: 'Terraform Characteristics', color: 'var(--purple)', fields: [
                ['Declarative', 'Describe desired state'],
                ['State Management', 'Track resource state'],
                ['Multi-Vendor', 'AWS, Azure, VMware, etc.'],
                ['Plan/Apply', 'Preview before changes']
              ]}
            ]
          }
        }
      }
    ]
  },

  {
    id: 'ebpf',
    name: 'eBPF Networking',
    icon: '🔧',
    description: 'Programmable kernel — packet processing without kernel modules',
    category: 'Advanced Networking',
    order: 53,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'user', type: 'box', name: 'Userspace', sub: 'XDP/Cilium', color: 'var(--cyan)', x: 100, y: 40, highlighted: 's===0' },
        { id: 'prog', type: 'box', name: 'eBPF Program', sub: 'Verified bytecode', color: 'var(--green)', x: 100, y: 140, highlighted: 's===1' },
        { id: 'kernel', type: 'box', name: 'Kernel Hooks', sub: 'XDP, TC, Socket', color: 'var(--amber)', x: 100, y: 240, highlighted: 's===2' },
        { id: 'map', type: 'box', name: 'eBPF Maps', sub: 'Shared state', x: 350, y: 140, highlighted: 's===3' },
        { id: 'perf', type: 'box', name: 'Perf Events', sub: 'Observability', color: 'var(--purple)', x: 350, y: 240, highlighted: 's===4' }
      ],
      links: []
    },
    steps: [
      {
        title: 'eBPF Programs',
        explanation: '<strong>eBPF</strong> (extended Berkeley Packet Filter) allows <strong>safe, verified programs</strong> to run inside the Linux kernel.\n\nHow it works:\n1. Write a program in C or restricted BPF\n2. <strong>Verifier</strong> checks it\'s safe (no crashes, no loops)\n3. <strong>JIT compiler</strong> converts to native machine code\n4. Program is attached to a kernel hook\n\neBPF programs run at <strong>kernel speed</strong> — no context switches to userspace.',
        highlights: ['prog'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          ebpfProg: {
            layers: [
              { name: 'eBPF Program Lifecycle', color: 'var(--green)', fields: [
                ['Write', 'C or restricted BPF code'],
                ['Verify', 'Kernel verifier checks safety'],
                ['JIT', 'Compile to native machine code'],
                ['Attach', 'Hook into kernel data path']
              ]}
            ]
          }
        }
      },
      {
        title: 'Hook Points',
        explanation: 'eBPF programs attach to specific <strong>kernel hook points</strong>:\n\n• <strong>XDP (eXpress Data Path)</strong> — earliest hook, runs before the kernel network stack. Maximum performance for filtering/routing.\n• <strong>TC (Traffic Control)</strong> — runs at the traffic control layer, after XDP but before the socket layer.\n• <strong>Socket hooks</strong> — run at the socket level for application-aware processing.\n\nThe earlier the hook, the less kernel code is traversed — XDP is the fastest.',
        highlights: ['kernel'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          hooks: {
            layers: [
              { name: 'Kernel Hook Points', color: 'var(--amber)', fields: [
                ['XDP', 'Earliest — before network stack'],
                ['TC', 'Traffic control layer'],
                ['Socket', 'Application socket layer'],
                ['Tracepoints', 'Various kernel functions']
              ]}
            ]
          }
        }
      },
      {
        title: 'eBPF Maps',
        explanation: '<strong>eBPF Maps</strong> are <strong>key-value stores</strong> shared between eBPF programs and userspace.\n\nThey enable:\n• <strong>Stateful processing</strong> — track connections, counters, statistics\n• <strong>Communication</strong> — programs can share data with each other\n• <strong>Userspace access</strong> — read/update maps from userspace tools\n\nCommon map types: <strong>HashMap</strong>, <strong>ArrayMap</strong>, <strong>LPM Trie</strong> (longest prefix match), <strong>Ring Buffer</strong>.',
        highlights: ['map'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          maps: {
            layers: [
              { name: 'eBPF Map Types', color: 'var(--cyan)', fields: [
                ['HashMap', 'Generic key-value store'],
                ['ArrayMap', 'Fixed-size array, fast lookup'],
                ['LPM Trie', 'Longest prefix match (IP lookups)'],
                ['Ring Buffer', 'Kernel → userspace streaming']
              ]}
            ]
          }
        }
      },
      {
        title: 'Use Cases',
        explanation: 'eBPF powers several major networking projects:\n\n• <strong>Cilium</strong> — Kubernetes CNI (Container Network Interface) using eBPF for high-performance networking, load balancing, and security policies\n• <strong>Falco</strong> — runtime security threat detection using eBPF to monitor syscall activity\n• <strong>bcc</strong> — BPF Compiler Collection for tracing and observability (tcpdump, network statistics)\n\neBPF eliminates the need for kernel modules — programs are verified and sandboxed by the kernel.',
        highlights: ['perf'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          useCases: {
            layers: [
              { name: 'eBPF Projects', color: 'var(--purple)', fields: [
                ['Cilium', 'Kubernetes CNI — networking + security'],
                ['Falco', 'Runtime security — syscall monitoring'],
                ['bcc', 'Observability — tracing + statistics'],
                ['Katran', 'Facebook L4 load balancer']
              ]}
            ]
          }
        }
      }
    ]
  }
,

  {
    id: 'bgp',
    name: 'BGP',
    icon: '\u{1F310}',
    description: 'The internet\'s routing protocol \u2014 how autonomous systems exchange routes',
    category: 'Advanced Networking',
    order: 39,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'as100', type: 'box', name: 'AS 100', sub: 'ISP A', color: 'var(--cyan)', x: 100, y: 80 },
        { id: 'as200', type: 'box', name: 'AS 200', sub: 'Enterprise', color: 'var(--green)', x: 100, y: 200 },
        { id: 'as300', type: 'box', name: 'AS 300', sub: 'ISP B', color: 'var(--amber)', x: 600, y: 80 },
        { id: 'as400', type: 'box', name: 'AS 400', sub: 'Cloud Provider', color: 'var(--purple)', x: 600, y: 200 },
        { id: 'peer1', type: 'box', name: 'eBGP Peering', sub: 'External BGP', x: 350, y: 60 },
        { id: 'peer2', type: 'box', name: 'iBGP', sub: 'Internal BGP', color: 'var(--cyan)', x: 350, y: 150 },
        { id: 'path', type: 'box', name: 'AS_PATH', sub: 'Prevent loops', color: 'var(--green)', x: 350, y: 250 }
      ],
      links: [
        { id: 'link-as100-peer1', from: 'as100', to: 'peer1' },
        { id: 'link-as300-peer1', from: 'as300', to: 'peer1' },
        { id: 'link-as100-peer2', from: 'as100', to: 'peer2' },
        { id: 'link-as200-peer2', from: 'as200', to: 'peer2' },
        { id: 'link-as300-path', from: 'as300', to: 'path' },
        { id: 'link-as400-path', from: 'as400', to: 'path' }
      ]
    },
    steps: [
      {
        title: 'eBGP \u2014 Between ASes',
        explanation: '<strong>eBGP (External BGP)</strong> is the protocol used to exchange routing information <strong>between different Autonomous Systems</strong>.\n\nEach AS is a network under a single administrative domain (ISP, enterprise, cloud provider). eBGP peers sit on directly connected links and advertise their prefixes.\n\n<strong>Key points:</strong>\n\u2022 Different AS numbers on each side\n\u2022 Directly connected interfaces (TTL=1 by default)\n\u2022 Used to share routes across ISP boundaries',
        highlights: ['peer1'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'iBGP \u2014 Within AS',
        explanation: '<strong>iBGP (Internal BGP)</strong> distributes routes learned via eBGP <strong>within a single Autonomous System</strong>.\n\nWhen AS 100 learns a route from AS 300 via eBGP, iBGP propagates that route to all routers inside AS 100 (including AS 200).\n\n<strong>Key points:</strong>\n\u2022 Same AS number on both sides\n\u2022 Route reflectors reduce full-mesh requirements\n\u2022 Ensures internal routers know external routes',
        highlights: ['peer2'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'AS_PATH Attribute',
        explanation: 'The <strong>AS_PATH</strong> is a mandatory BGP attribute that lists every AS a route has traversed.\n\n<code>AS_PATH: [AS300, AS100, AS200]</code>\n\nThis serves two purposes:\n<strong>1. Loop prevention</strong> \u2014 If a router sees its own AS in the path, it rejects the route.\n<strong>2. Path selection</strong> \u2014 Shorter AS_PATH is preferred (lower hop count).\n\nBGP is a <strong>path-vector</strong> protocol \u2014 it carries the entire AS path, not just a distance metric.',
        highlights: ['path'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'BGP Path Selection',
        explanation: 'BGP selects the best route using a <strong>decision process</strong> with multiple attributes, evaluated in order:\n\n<strong>1. Weight</strong> (Cisco) \u2014 local preference, highest wins\n<strong>2. Local Preference</strong> \u2014 highest wins\n<strong>3. AS_PATH length</strong> \u2014 shortest wins\n<strong>4. Origin</strong> \u2014 IGP < EGP < Incomplete\n<strong>5. MED (Multi-Exit Discriminator)</strong> \u2014 lowest wins\n\nOnly the <strong>best path</strong> is installed in the routing table and advertised to peers.',
        highlights: ['peer1', 'peer2', 'path'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          bgpattrs: {
            layers: [
              { name: 'BGP Path Attributes', color: 'var(--cyan)', fields: [
                ['Weight', 'Local (0-65535), highest wins'],
                ['Local Pref', '100 (default), highest wins'],
                ['AS_PATH', '[AS300, AS100] \u2014 2 hops'],
                ['Origin', 'IGP (i)'],
                ['MED', '0 (lowest wins)']
              ]}
            ]
          }
        }
      },
      {
        title: 'BGP Summary',
        explanation: '<strong>Key takeaway:</strong> BGP is the protocol that makes the internet work.\n\n<strong>Two types:</strong>\n\u2022 <strong>eBGP</strong> \u2014 between different ASes (ISP peering, customer/provider)\n\u2022 <strong>iBGP</strong> \u2014 within a single AS (route distribution)\n\n<strong>Path attributes:</strong>\n\u2022 AS_PATH \u2014 loop prevention and path length\n\u2022 Local Pref \u2014 outbound path selection\n\u2022 MED \u2014 inbound path suggestion\n\u2022 Weight \u2014 local-only preference\n\n<strong>Use cases:</strong>\n\u2022 ISP peering and transit\n\u2022 Enterprise multi-homing\n\u2022 Cloud provider connectivity\n\u2022 VPN and traffic engineering',
        highlights: ['as100', 'as200', 'as300', 'as400', 'peer1', 'peer2', 'path'],
        activeLinks: [],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'ospf',
    name: 'OSPF',
    icon: '\u{1F5FA}\u{FE0F}',
    description: 'Link-state routing \u2014 fast convergence within an enterprise',
    category: 'Advanced Networking',
    order: 40,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'area0', type: 'box', name: 'Area 0 (Backbone)', sub: 'Core routers', color: 'var(--cyan)', x: 100, y: 80 },
        { id: 'area1', type: 'box', name: 'Area 1', sub: 'Branch office', color: 'var(--green)', x: 100, y: 200 },
        { id: 'area2', type: 'box', name: 'Area 2', sub: 'Data center', color: 'var(--amber)', x: 600, y: 80 },
        { id: 'abr', type: 'box', name: 'ABR', sub: 'Area Border Router', x: 350, y: 100 },
        { id: 'lsa', type: 'box', name: 'LSA Flooding', sub: 'Link-State Advertisements', color: 'var(--green)', x: 350, y: 220 },
        { id: 'spf', type: 'box', name: 'SPF Algorithm', sub: 'Dijkstra shortest path', color: 'var(--purple)', x: 550, y: 220 }
      ],
      links: [
        { id: 'link-area0-abr', from: 'area0', to: 'abr' },
        { id: 'link-area2-abr', from: 'area2', to: 'abr' },
        { id: 'link-area1-lsa', from: 'area1', to: 'lsa' },
        { id: 'link-lsa-spf', from: 'lsa', to: 'spf' }
      ]
    },
    steps: [
      {
        title: 'OSPF Areas',
        explanation: 'OSPF divides the network into <strong>areas</strong> to limit the scope of routing updates.\n\n<strong>Area 0 (Backbone)</strong> is the core \u2014 all other areas must connect to it. This hierarchy reduces the size of link-state databases and speeds convergence.\n\n<strong>Key points:</strong>\n\u2022 Area 0 is mandatory (the backbone)\n\u2022 Each area maintains its own LSDB\n\u2022 Inter-area routing goes through the backbone',
        highlights: ['area0', 'area1', 'area2'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Area Border Routers',
        explanation: 'An <strong>ABR (Area Border Router)</strong> connects one or more areas to the backbone.\n\nThe ABR summarizes routes between areas, reducing the amount of LSA flooding. It maintains separate link-state databases for each area it connects.\n\n<strong>Key points:</strong>\n\u2022 Connects areas to the backbone\n\u2022 Summarizes routes between areas\n\u2022 Reduces LSA flooding scope',
        highlights: ['abr'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'LSA Flooding',
        explanation: 'OSPF routers exchange <strong>LSAs (Link-State Advertisements)</strong> to build a complete topology map.\n\nEach router advertises its directly connected links, costs, and neighbors. LSAs are flooded to all routers within an area, ensuring everyone has the same view of the network.\n\n<strong>LSA Types:</strong>\n\u2022 Type 1 (Router LSA) \u2014 each router generates\n\u2022 Type 2 (Network LSA) \u2014 broadcast networks\n\u2022 Type 3 (Summary LSA) \u2014 ABR summarizes routes',
        highlights: ['lsa'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'SPF Calculation',
        explanation: 'After receiving all LSAs, each router runs <strong>Dijkstra\'s SPF algorithm</strong> to compute the shortest path tree.\n\nThe algorithm considers link costs (bandwidth-based) to determine the best path to each destination. Each router builds its own routing table from the SPF tree.\n\n<strong>Key points:</strong>\n\u2022 Dijkstra algorithm finds shortest paths\n\u2022 Cost = reference bandwidth / interface bandwidth\n\u2022 Lowest cost = best path\n\u2022 Only direct neighbors are in the SPF tree',
        highlights: ['spf'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'OSPF Summary',
        explanation: '<strong>Key takeaway:</strong> OSPF is a fast-converging link-state routing protocol for enterprise networks.\n\n<strong>Structure:</strong>\n\u2022 <strong>Areas</strong> \u2014 hierarchical design, Area 0 is backbone\n\u2022 <strong>ABRs</strong> \u2014 connect areas, summarize routes\n\u2022 <strong>LSAs</strong> \u2014 link-state advertisements, full topology map\n\u2022 <strong>SPF</strong> \u2014 Dijkstra algorithm, shortest path tree\n\n<strong>Use cases:</strong>\n\u2022 Enterprise campus networks\n\u2022 Data center fabrics\n\u2022 ISP internal routing\n\u2022 Multi-area designs for scalability',
        highlights: ['area0', 'area1', 'area2', 'abr', 'lsa', 'spf'],
        activeLinks: [],
        packets: [],
        tables: {}
      }
    ]
  },

  {
    id: 'mpls',
    name: 'MPLS',
    icon: '\u{1F3F7}\u{FE0F}',
    description: 'Label switching \u2014 fast forwarding without IP lookup',
    category: 'Advanced Networking',
    order: 41,
    diagramStyle: 'schematic',
    topology: {
      devices: [
        { id: 'ingress', type: 'box', name: 'Ingress LSR', sub: 'Push label', color: 'var(--cyan)', x: 40, y: 100 },
        { id: 'label', type: 'box', name: 'MPLS Label', sub: '20-bit label + TC + TTL', color: 'var(--amber)', x: 250, y: 60 },
        { id: 'mid', type: 'box', name: 'Mid LSR', sub: 'Swap label', color: 'var(--green)', x: 350, y: 100 },
        { id: 'egress', type: 'box', name: 'Egress LSR', sub: 'Pop label', color: 'var(--purple)', x: 550, y: 100 },
        { id: 'fec', type: 'box', name: 'FEC', sub: 'Forwarding Equivalence Class', x: 250, y: 200 }
      ],
      links: [
        { id: 'link-ingress-label', from: 'ingress', to: 'label' },
        { id: 'link-label-mid', from: 'label', to: 'mid' },
        { id: 'link-mid-egress', from: 'mid', to: 'egress' },
        { id: 'link-fec-ingress', from: 'fec', to: 'ingress' }
      ]
    },
    steps: [
      {
        title: 'FEC \u2014 Forwarding Equivalence Class',
        explanation: 'A <strong>FEC (Forwarding Equivalence Class)</strong> groups packets that are forwarded the same way \u2014 same path, same service, same QoS.\n\nAll packets in a FEC receive the <strong>same label</strong> at the ingress LSR. This groups traffic by destination prefix, VPN, or traffic engineering policy.\n\n<strong>Key points:</strong>\n\u2022 Packets with same FEC = same label = same path\n\u2022 FEC can be based on destination IP, QoS, or VPN\n\u2022 Simplifies forwarding decisions',
        highlights: ['fec'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Label Push (Ingress)',
        explanation: 'The <strong>Ingress LSR (Label Switch Router)</strong> receives an IP packet and performs a <strong>label push</strong> \u2014 it adds an MPLS label to the packet.\n\nThe label is a 20-bit value that identifies the FEC. The packet is now an MPLS frame and will be forwarded by label switching instead of IP lookup.\n\n<strong>MPLS Label format:</strong>\n\u2022 Label (20 bits) \u2014 identifies the FEC\n\u2022 TC (3 bits) \u2014 Traffic Class (QoS)\n\u2022 S (1 bit) \u2014 Bottom of stack\n\u2022 TTL (8 bits) \u2014 hop limit',
        highlights: ['ingress', 'label'],
        activeLinks: [],
        packets: [],
        tables: {},
        packetDetails: {
          mplshdr: {
            layers: [
              { name: 'MPLS Header (4 bytes)', color: 'var(--amber)', fields: [
                ['Label', '20 bits \u2014 identifies FEC'],
                ['TC', '3 bits \u2014 Traffic Class (QoS)'],
                ['S', '1 bit \u2014 Bottom of Stack'],
                ['TTL', '8 bits \u2014 Hop Limit']
              ]}
            ]
          }
        }
      },
      {
        title: 'Label Swap (Transit)',
        explanation: 'The <strong>Mid LSR</strong> receives the labeled packet and performs a <strong>label swap</strong> \u2014 it replaces the incoming label with the outgoing label for the next hop.\n\nThis is the core of MPLS switching: the LSR looks up the incoming label in its <strong>LFIB (Label Forwarding Information Base)</strong> and swaps to the next label.\n\n<strong>Key points:</strong>\n\u2022 LFIB lookup by incoming label\n\u2022 Swap label for next hop\n\u2022 No IP header inspection needed \u2014 fast!',
        highlights: ['mid'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'Label Pop (Egress)',
        explanation: 'The <strong>Egress LSR</strong> receives the labeled packet and performs a <strong>label pop</strong> \u2014 it removes the MPLS label and forwards the original IP packet.\n\nThis is called <strong>PHP (Penultimate Hop Popping)</strong> when the second-to-last LSR pops the label \u2014 the egress LSR then only needs to do a normal IP lookup.\n\n<strong>Key points:</strong>\n\u2022 Remove MPLS label\n\u2022 Forward by IP lookup (normal routing)\n\u2022 PHP optimizes the last hop',
        highlights: ['egress'],
        activeLinks: [],
        packets: [],
        tables: {}
      },
      {
        title: 'MPLS Summary',
        explanation: '<strong>Key takeaway:</strong> MPLS provides fast label-based forwarding without IP header inspection at every hop.\n\n<strong>Label operations:</strong>\n\u2022 <strong>Push</strong> \u2014 Ingress adds label\n\u2022 <strong>Swap</strong> \u2014 Transit routers change label\n\u2022 <strong>Pop</strong> \u2014 Egress removes label\n\n<strong>LSR Types:</strong>\n\u2022 <strong>Ingress LER</strong> \u2014 pushes labels on IP packets\n\u2022 <strong>Transit LSR</strong> \u2014 swaps labels (fast switching)\n\u2022 <strong>Egress LER</strong> \u2014 pops labels, forwards by IP\n\n<strong>Use cases:</strong>\n\u2022 MPLS VPNs (L3VPN, L2VPN)\n\u2022 Traffic engineering\n\u2022 Fast reroute (FRR)\n\u2022 QoS differentiation',
        highlights: ['ingress', 'label', 'mid', 'egress', 'fec'],
        activeLinks: [],
        packets: [],
        tables: {}
      }
    ]
  }
];
