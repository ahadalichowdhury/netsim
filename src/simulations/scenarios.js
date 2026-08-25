export const scenarios = [
  {
    id: 'layer2',
    name: 'Layer 2',
    icon: '🔀',
    description: 'How switches forward frames using MAC addresses',
    category: 'Networking Fundamentals',
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
        explanation: '<strong>PC-A</strong> has data to send to <strong>PC-B</strong> (192.168.1.20). Both are on the same subnet (192.168.1.0/24), so PC-A can send directly via Layer 2.\n\nBut first, PC-A needs to build an <strong>Ethernet frame</strong> with PC-B\'s MAC address as the destination.',
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
        explanation: 'PC-A wants to send data to PC-B (192.168.1.20). It knows PC-B\'s <strong>IP address</strong>, but to send an Ethernet frame, it needs the <strong>MAC address</strong>.\n\nPC-A checks its <strong>ARP cache</strong> \u2014 it\'s empty. It must use ARP to discover the MAC.',
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
        explanation: 'A brand-new PC powers on with a <strong>burned-in MAC address</strong> (AA:BB:CC:DD:EE:10) but <strong>no IP configuration</strong> at all.\n\nWithout an IP, it cannot communicate on the network. It must run <strong>DHCP DORA</strong> to obtain one automatically.',
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
        explanation: 'PC-A (192.168.1.10) wants to send data to PC-C (192.168.2.10).\n\nPC-A checks its subnet mask: <code>255.255.255.0</code>. The destination 192.168.2.10 is <strong>not</strong> in the 192.168.1.0/24 network.\n\n<strong>Key rule:</strong> When the destination is on a different subnet, the frame must go to the <strong>default gateway</strong> (Router) — never directly to the destination.',
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
        explanation: 'The user opens a browser and types <strong>google.com</strong> in the address bar.\n\nThe computer needs to convert this human-readable <strong>domain name</strong> into an IP address. It starts by checking its <strong>local DNS cache</strong> to see if it already knows the answer.',
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
        explanation: 'The Client wants to fetch a web page from the <strong>Web Server</strong> (192.168.1.20).\n\nBefore any data can be exchanged, TCP requires a <strong>3-way handshake</strong> to establish a reliable connection. Both sides must agree on initial sequence numbers.',
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
        explanation: 'PC-1 (192.168.1.10) wants to reach a Web Server at <code>93.184.216.34</code> on the internet.\n\nPC-1 uses a <strong>private IP address</strong> (192.168.1.x). Private IPs can\'t be routed on the public internet — the <strong>NAT Router</strong> must translate the address.',
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
        explanation: 'All four PCs are connected to the <strong>same physical switch</strong>, but the switch has been configured to create <strong>two VLANs</strong>:\n\n• <strong>VLAN 10</strong>: PC-A (Port 1) and PC-B (Port 2)\n• <strong>VLAN 20</strong>: PC-C (Port 3) and PC-D (Port 4)\n\nVLANs <strong>logically segment</strong> the network — even though all devices share one switch, they are isolated into separate broadcast domains.',
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
        explanation: 'The <strong>Web Server</strong> (192.168.1.20) has prepared an Ethernet frame destined for the Linux Host (192.168.1.10).\n\nThe frame travels across the network toward the Linux Host\'s NIC. Let\'s see how the NIC processes it step by step.',
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
        explanation: 'A <strong>user application</strong> (e.g., curl, browser) wants to send data to a remote server at <code>10.0.0.50</code>.\n\nThe data must travel down through each layer of the <strong>TCP/IP network stack</strong> before it can be transmitted on the wire.',
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
        explanation: 'The Linux box has two network interfaces:\n<code>eth0: 192.168.1.1/24</code>\n<code>eth1: 10.0.0.1/24</code>\n\nThe kernel maintains a <strong>routing table</strong> that determines where to send packets based on their destination IP.',
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
        explanation: 'The Linux firewall uses <strong>iptables</strong> with three built-in chains:\n\n<strong>INPUT</strong> — packets destined for the firewall itself\n<strong>OUTPUT</strong> — packets originating from the firewall\n<strong>FORWARD</strong> — packets passing through the firewall (not destined for it)\n\nIncoming packets from the internet first hit the <strong>PREROUTING</strong> chain, then are routed to INPUT or FORWARD.',
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
        explanation: '<strong>Linux network namespaces</strong> provide complete network stack isolation. Each namespace has its own interfaces, routes, and iptables rules.\n\nWe\'ve created two namespaces:\n<code>ip netns add app1</code>\n<code>ip netns add app2</code>\n\nThey are completely invisible to each other — like two separate machines.',
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
        explanation: 'A <strong>Linux bridge</strong> is a kernel-level virtual switch. It works just like a physical switch — it learns MAC addresses and forwards frames.\n\nCreated with:\n<code>ip link add br0 type bridge</code>\n<code>brctl show br0</code>\n\nThe bridge has ports where VMs/containers attach, and an uplink to the outside network.',
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
  }
];
