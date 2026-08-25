---
name: Layer 3
description: Routing between different networks via a router
category: Networking Fundamentals
order: 15
---

## Step 1: PC-A wants to reach PC-C (different subnet)

PC-A (192.168.1.10) wants to send data to PC-C (192.168.2.10).

PC-A checks its subnet mask: `255.255.255.0`. The destination 192.168.2.10 is **not** in the 192.168.1.0/24 network.

**Key rule:** When the destination is on a different subnet, the frame must go to the **default gateway** (Router) — never directly to the destination.

**Prerequisite:** Understand **ARP** (how MAC addresses are discovered) and **Gateway** (how routers connect networks) first.

**See also:** **Routing Table** and **IP Address** topics for routing decisions and address structure.

## Step 2: PC-A checks: destination not in my subnet

PC-A performs the subnet check:

`Destination: 192.168.2.10`
`My subnet: 192.168.1.0/24`

The first three octets don't match — the destination is **remote**. PC-A must forward to its **default gateway** (Router at 192.168.1.1).

But PC-A needs the Router's **MAC address** to build the Ethernet frame. It only has the IP — time to ARP!

## Step 3: PC-A ARPs for default gateway (192.168.1.1)

PC-A sends an **ARP Request** broadcast:
`"Who has 192.168.1.1? Tell 192.168.1.10"`

The broadcast reaches Switch 1, which floods it to all ports — including the Router's eth0 interface.

## Step 4: Router replies with its MAC

The Router recognizes the ARP query for its eth0 IP (192.168.1.1) and sends an **ARP Reply**:
`"192.168.1.1 is at AA:BB:CC:DD:EE:FF"`

PC-A now has the Router's MAC address and can build a proper frame.

## Step 5: PC-A builds frame (dst MAC = Router)

PC-A constructs the Ethernet frame with the **Router's MAC** as the Layer 2 destination — even though the final destination is PC-C.

**Layer 2:** PC-A → Router (local delivery)
**Layer 3:** PC-A → PC-C (end-to-end)

## Step 6: Frame: PC-A → Switch 1

The frame travels from PC-A to Switch 1 via **link-a-sw1**.

The frame header:
`Src MAC: AA:BB:CC:DD:EE:01 (PC-A)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Router)`

The IP packet inside:
`Src IP: 192.168.1.10 (PC-A)`
`Dst IP: 192.168.2.10 (PC-C)`

## Step 7: Switch 1 learns PC-A, forwards to Router

Switch 1 receives the frame and:
1. **Learns** PC-A's MAC on port 1 from the source address
2. Looks up the destination MAC (AA:BB:CC:DD:EE:FF) — **found** on port 2
3. **Forwards** the frame directly to the Router — no flooding needed

## Step 8: Router strips L2 header, checks routing table

The Router receives the frame on eth0 and performs Layer 3 processing:

**1.** Strips the Ethernet header (Hop 1 L2 is discarded)
**2.** Reads the IP destination: `192.168.2.10`
**3.** Checks its **routing table**: 192.168.2.0/24 → eth1
**4.** Decrements **TTL** (64 → 63)
**5.** Needs to build a **new** L2 frame for eth1

## Step 9: Router ARPs for PC-C on eth1

The Router needs PC-C's MAC address to send the frame on the 192.168.2.0/24 network.

It sends an **ARP Request** broadcast from its eth1 interface:
`"Who has 192.168.2.10? Tell 192.168.2.1"`

## Step 10: PC-C replies with its MAC

PC-C receives the ARP Request and sends an **ARP Reply**:
`"192.168.2.10 is at AA:BB:CC:DD:EE:02"`

The Router now has PC-C's MAC address in its ARP cache.

## Step 11: Router builds NEW frame (dst MAC = PC-C)

The Router constructs a **brand-new** Ethernet frame for the second hop:

`Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)`
`Dst MAC: AA:BB:CC:DD:EE:02 (PC-C)`

**Crucial:** The L2 header is completely new, but the L3 IP addresses remain unchanged — `192.168.1.10 → 192.168.2.10`.

## Step 12: Frame: Router → Switch 2

The Router sends the new frame out eth1 via **link-r-sw2** to Switch 2.

The frame now carries the Router as source and PC-C as destination at Layer 2.

## Step 13: Switch 2 forwards to PC-C

Switch 2 receives the frame, looks up the destination MAC (AA:BB:CC:DD:EE:02) — found on the port connected to PC-C.

It **forwards** the frame directly. PC-C receives it, checks the destination IP — it matches! The packet is accepted.

## Step 14: Layer 3 routing complete!

PC-C accepts the frame — the destination IP matches its own.

**Key takeaway:** At every Layer 3 hop, the **Layer 2 frame is stripped and rebuilt** with new MAC addresses, but the **Layer 3 IP addresses stay the same** from source to destination.

Hop 1: PC-A → Router (MAC changes, IP same)
Hop 2: Router → PC-C (MAC changes again, IP still same)

This is the fundamental difference between Layer 2 (local delivery via MAC) and Layer 3 (end-to-end delivery via IP).
