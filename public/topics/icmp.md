---
name: ICMP
description: The network messenger — ping, traceroute, error reporting
category: Networking Fundamentals
order: 29
---

## Step 1: What is ICMP?

**ICMP (Internet Control Message Protocol)** is a network-layer protocol used for **error reporting** and **diagnostics**.

Unlike TCP or UDP, ICMP is not used to transport application data. Instead, it provides feedback about network conditions:
• Is the destination reachable?
• Did a packet get dropped?
• Is the network congested?

ICMP operates at **Layer 3** (encapsulated directly in IP) and uses IP for delivery — but it's not a transport protocol.

## Step 2: ICMP Header

An ICMP message has a simple header structure:

`Type (8 bits)` — identifies the message type (e.g., 8 = Echo Request)
`Code (8 bits)` — provides additional detail for the type
`Checksum (16 bits)` — error detection
`Data` — variable payload (often the original packet header)

The Type and Code fields together define the ICMP message purpose.

## Step 3: Echo Request (ping)

The **ping** command sends ICMP **Echo Request** messages (Type 8, Code 0) to test connectivity.

When you type `ping 8.8.8.8`:
• Your host sends an ICMP Echo Request to the destination
• The destination replies with an ICMP Echo Reply (Type 0)
• Round-trip time is measured

Ping is the most common ICMP use case — it's the network equivalent of "are you there?"

## Step 4: Echo Reply

The destination receives the Echo Request and responds with an **Echo Reply** (Type 0, Code 0).

The reply contains the same data that was sent in the request, allowing the source to verify that the data was received intact.

**Traceroute** builds on this by sending packets with incrementing TTL values. Each router that decrements TTL to 0 sends back an ICMP **Time Exceeded** message (Type 11), revealing the path.

## Step 5: Error Messages

ICMP generates **error messages** when packets can't be delivered:

**Type 3 — Destination Unreachable:**
• Code 0: Network unreachable
• Code 1: Host unreachable
• Code 2: Protocol unreachable
• Code 3: Port unreachable

**Type 11 — Time Exceeded:**
• Code 0: TTL expired in transit (used by traceroute)
• Code 1: Fragment reassembly timeout

These messages help **diagnose network problems** without needing access to the destination.

## Step 6: ICMP Summary

**Key ICMP message types:**

`Type 0` — Echo Reply (response to ping)
`Type 8` — Echo Request (ping)
`Type 3` — Destination Unreachable
`Type 5` — Redirect (use a better route)
`Type 11` — Time Exceeded (TTL expired)
`Type 13` — Timestamp Request

**Common tools using ICMP:**
• **ping** — Echo Request/Reply (Types 8/0)
• **traceroute** — Time Exceeded (Type 11) + Echo Reply (Type 0)
• **path MTU discovery** — Unreachable with "DF set" (Type 3, Code 4)
