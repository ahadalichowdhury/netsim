---
name: MTU
description: Maximum Transmission Unit — the largest packet the network allows
category: Components
order: 10
---

## Step 1: What is MTU?

**MTU (Maximum Transmission Unit)** is the largest Layer 2 payload size that can be transmitted without fragmentation.

Common MTU values:
• **Ethernet:** 1500 bytes (standard)
• **Jumbo frames:** 9000 bytes (data centers)
• **Loopback:** 65535 bytes (Linux)
• **PPP over Ethernet (PPPoE):** 1492 bytes (2 bytes reserved)

If a packet exceeds the MTU, it must be fragmented or dropped.

## Step 2: Common MTUs

Different network technologies have different MTU limits:

`Ethernet:     1500 bytes`
`Jumbo Frame:  9000 bytes`
`PPPoE:        1492 bytes`
`Wi-Fi:        2304 bytes (802.11)`
`Loopback:     65535 bytes (Linux)`

The standard Ethernet MTU of 1500 bytes is the most common limit you'll encounter. Jumbo frames are used in data centers for high-throughput storage and clustering traffic.

## Step 3: Fragmentation

When a packet exceeds the MTU, it must be **fragmented** into smaller pieces.

A 4000-byte packet must be split to fit the 1500-byte Ethernet MTU:
• **Fragment 1:** 1500 bytes (offset 0)
• **Fragment 2:** 1500 bytes (offset 1500)
• **Fragment 3:** 1000 bytes (offset 3000)

Each fragment is an independent packet with its own IP header. The receiver reassembles them using the **Identification**, **Fragment Offset**, and **More Fragments (MF)** flags.

Fragmentation adds overhead and can cause performance issues.

## Step 4: Path MTU Discovery

**Path MTU Discovery (PMTUD)** finds the largest MTU along the entire path without fragmentation.

How it works:
1. Sender sets the **DF (Don't Fragment)** bit in the IP header
2. If a router can't forward the packet (too large, DF=1), it drops it and sends an **ICMP Fragmentation Needed** message (Type 3, Code 4)
3. The sender reduces the packet size and retries
4. This continues until the packet reaches the destination

PMTUD avoids fragmentation entirely, improving performance. It's the preferred approach for TCP applications.
