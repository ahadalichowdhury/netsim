---
name: UDP
description: Fast and simple — connectionless transport for speed
category: Networking Fundamentals
order: 30
---

## Step 1: What is UDP?

**UDP (User Datagram Protocol)** is a **connectionless** transport protocol defined in RFC 768.

Unlike TCP, UDP:
• Does **not establish a connection** (no handshake)
• Does **not guarantee delivery** (packets may be lost)
• Does **not guarantee ordering** (packets may arrive out of order)
• Has **no retransmission** mechanism

UDP is the "send and forget" protocol — it sends data and hopes for the best. This makes it **extremely fast** with minimal overhead.

## Step 2: UDP Header

The UDP header is incredibly simple — only **8 bytes** (compared to TCP's 20+ bytes):

`Source Port (16 bits)` — sender's port
`Destination Port (16 bits)` — receiver's port
`Length (16 bits)` — total segment size (header + data)
`Checksum (16 bits)` — error detection (optional in IPv4)

That's it — no sequence numbers, no acknowledgments, no flow control. Just ports and a length.

## Step 3: When UDP is Used

UDP is the protocol of choice when **speed matters more than reliability**:

**DNS queries:**
• Small request/response — no need for TCP overhead
• If the query fails, just send another one

**DHCP:**
• Client has no IP yet — can't establish TCP connection
• Broadcast discovery works better with UDP

**SNMP (monitoring):**
• Small, frequent status updates
• Losing one update isn't critical

## Step 4: Real-time Applications

UDP dominates **real-time applications** where latency is critical:

**Online Gaming:**
• Player positions update 60+ times per second
• A lost packet is meaningless — the next one has newer data
• TCP retransmission would cause lag spikes

**Video Streaming:**
• Buffering handles occasional losses
• Live streams can't wait for retransmissions

**VoIP (Voice over IP):**
• Real-time voice can't tolerate delays
• Brief audio glitches are acceptable, lag is not

## Step 5: UDP Summary

**Key takeaway:** UDP trades reliability for speed.

• **No handshake** — just send immediately
• **No ordering** — packets may arrive out of order
• **No retransmission** — lost packets are gone
• **8-byte header** — minimal overhead
• **Best for:** DNS, DHCP, gaming, streaming, VoIP

**When to use UDP:**
If your application can handle occasional lost packets and needs low latency, UDP is the right choice. If every byte must arrive, use TCP instead.
