---
name: Network Troubleshooting
description: The diagnostic toolkit — ping, traceroute, ss, tcpdump, dig
category: Networking Fundamentals
order: 34
---

## Step 1: ping — Is it alive? [বাংলা অনুবাদ প্রয়োজন]

**ping** sends ICMP Echo Request packets to test basic connectivity.

`ping google.com`

If you get replies, the destination is reachable at the network layer. If not, the problem is between you and the destination — could be DNS, routing, firewall, or the host itself.

**Key flags:**
• `-c 4` — Send 4 packets
• `-i 0.2` — Interval between packets
• `-s 1400` — Packet size (test MTU)
• `-W 2` — Timeout in seconds

**What it tells you:** Layer 3 connectivity is working.

## Step 2: traceroute — Where is it? [বাংলা অনুবাদ প্রয়োজন]

**traceroute** (Linux) or **tracert** (Windows) shows the hop-by-hop path packets take.

`traceroute google.com`

It works by sending packets with incrementing TTL (Time To Live). Each router along the path decrements TTL and sends back an ICMP "Time Exceeded" message.

**What it tells you:**
• Which routers the traffic passes through
• Where latency occurs (high RTT at a hop)
• Where packets are dropped (*** timeouts)
• If there's a routing loop

**Key flags:**
• `-n` — Don't resolve hostnames
• `-I` — Use ICMP (not UDP)
• `-m 30` — Max hops

## Step 3: ss / netstat — What's listening? [বাংলা অনুবাদ প্রয়োজন]

**ss** (socket statistics) shows open ports and established connections.

`ss -tlnp` — TCP listening ports
`ss -ulnp` — UDP listening ports
`ss -tunap` — All connections

**Legacy:** `netstat -tlnp` does the same thing.

**What it tells you:**
• Is the service listening on the expected port?
• Is it bound to 0.0.0.0 (all interfaces) or 127.0.0.1 (localhost only)?
• Are there established connections?
• Which process owns the socket?

**Common issue:** Service bound to localhost when it should be accessible remotely.

## Step 4: dig — DNS working? [বাংলা অনুবাদ প্রয়োজন]

**dig** (Domain Information Groper) queries DNS servers directly.

`dig example.com`
`dig @8.8.8.8 example.com` — Use specific DNS server
`dig +trace example.com` — Full resolution path

**What it tells you:**
• Is DNS resolving correctly?
• What's the TTL?
• Are there the right record types?
• Is your DNS server returning stale data?

**Common issues:**
• Wrong DNS server configured
• DNS cache poisoning
• Missing records (A vs CNAME)
• TTL too high (stale cache)

**Quick check:** `dig +short example.com`

## Step 5: tcpdump — What's on the wire? [বাংলা অনুবাদ প্রয়োজন]

**tcpdump** captures raw network packets for deep analysis.

`tcpdump -i eth0 port 80`
`tcpdump -i eth0 host 192.168.1.20`
`tcpdump -w capture.pcap` — Save to file

**What it tells you:**
• Are packets actually arriving?
• Are they going to the right destination?
• What's in the packet headers?
• Are there retransmissions (sign of packet loss)?
• Is the TCP handshake completing?

**Key flags:**
• `-n` — Don't resolve names
• `-A` — Show payload as ASCII
• `-X` — Show payload as hex+ASCII
• `-c 100` — Capture 100 packets

**Pro tip:** Pipe to Wireshark: `tcpdump -w - | wireshark -k -i -`

## Step 6: Troubleshooting Flow [বাংলা অনুবাদ প্রয়োজন]

**Systematic network troubleshooting approach:**

**1. ping** — Is the destination reachable?
**2. traceroute** — Where does the path break?
**3. ss / netstat** — Is the service listening?
**4. dig** — Is DNS resolving correctly?
**5. tcpdump** — What's actually on the wire?

**The golden rule:** Start broad (ping) and narrow down (tcpdump). Each tool answers a specific question, and the order matters.

**Common flow:**
• ping fails → traceroute to find the broken hop
• ping works but app fails → ss to check ports
• DNS issues → dig to verify resolution
• Intermittent issues → tcpdump to capture evidence
