---
name: Default Gateway (Linux)
description: Configuring default gateway with ip route on Linux
category: Linux Core Networking
order: 23
---

## Step 1: Linux host wants to reach 8.8.8.8 [বাংলা অনুবাদ প্রয়োজন]

The Linux host wants to ping **8.8.8.8** (Google DNS) on the internet.

It needs to determine how to reach this destination — time to check the **routing table**.

**Prerequisite:** Understand **Route Table** (ip route basics) and **Default Gateway** (concept) first.

## Step 2: Check local routing table [বাংলা অনুবাদ প্রয়োজন]

The kernel checks the routing table for a match:
`ip route show`

The routing table contains connected routes and any static routes. The host looks for a route to 8.8.8.8.

## Step 3: No specific route for 8.8.8.8 — use default [বাংলা অনুবাদ প্রয়োজন]

The routing table has no specific entry for 8.8.8.8.

The kernel falls back to the **default route** (0.0.0.0/0) — a catch-all that matches any destination not covered by a more specific route.

## Step 4: Default route: via 192.168.1.1 dev eth0 [বাংলা অনুবাদ প্রয়োজন]

The default route specifies:
`default via 192.168.1.1 dev eth0`

This means: send all unmatched traffic to **192.168.1.1** (the Router) through interface **eth0**.

## Step 5: Packet: Host → eth0 [বাংলা অনুবাদ প্রয়োজন]

The kernel builds the ICMP Echo packet and passes it to **eth0** for transmission.

The frame is addressed to the Router's MAC (ARP resolved for 192.168.1.1).

## Step 6: eth0 sends to Router (192.168.1.1) [বাংলা অনুবাদ প্রয়োজন]

The packet travels from eth0 to the **Router** (default gateway).

The Router receives the packet on its LAN interface (192.168.1.1) and checks the destination IP.

## Step 7: Router forwards to Internet [বাংলা অনুবাদ প্রয়োজন]

The Router receives the packet and performs **NAT** (Network Address Translation), replacing the private source IP with its public IP.

It then forwards the packet toward the Internet.

## Step 8: Reply comes back [বাংলা অনুবাদ প্রয়োজন]

The Internet host (8.8.8.8) replies to the Router's public IP.

The Router receives the reply and looks up its NAT table to translate back to the private IP.

## Step 9: Router NAT translates, sends to Host [বাংলা অনুবাদ প্রয়োজন]

The Router performs reverse NAT:
`Public IP → 192.168.1.10`

It forwards the translated reply to the Linux Host via eth0.

## Step 10: Default gateway routing complete! [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** The default gateway is the **fallback route** for any destination not in the local routing table.

How it worked:
1. Host checks routing table for 8.8.8.8 — **no match**
2. Falls back to **default route** (0.0.0.0/0)
3. Default via **192.168.1.1** (Router)
4. Packet sent to Router → NAT → Internet
5. Reply comes back through NAT

Configure with:
`ip route add default via 192.168.1.1`
`ip route show`
