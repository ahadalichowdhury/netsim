---
name: TCP vs UDP
description: The tradeoff — reliability vs speed
category: Networking Fundamentals
order: 31
---

## Step 1: TCP — Reliable [বাংলা অনুবাদ প্রয়োজন]

**TCP (Transmission Control Protocol)** provides **reliable, ordered** delivery.

Key features:
• **Connection-oriented** — 3-way handshake before data transfer
• **Ordered delivery** — sequence numbers ensure data arrives in order
• **Retransmission** — lost packets are automatically resent
• **Flow control** — prevents overwhelming the receiver
• **Congestion control** — adapts to network conditions

TCP guarantees that every byte arrives intact and in order — but this comes with overhead.

## Step 2: TCP Use Cases [বাংলা অনুবাদ প্রয়োজন]

TCP is used when **data integrity is critical**:

**HTTP/HTTPS (Web):**
• Web pages must load completely — no missing images or broken HTML

**Email (SMTP/IMAP):**
• An email can't arrive with missing words

**File Transfer (FTP/SFTP):**
• A corrupted file could be catastrophic

**SSH:**
• Remote commands must execute exactly as typed

In short: if losing even one byte would break the application, use TCP.

## Step 3: UDP — Fast [বাংলা অনুবাদ প্রয়োজন]

**UDP (User Datagram Protocol)** provides **fast, connectionless** delivery.

Key characteristics:
• **Connectionless** — no handshake, just send
• **No ordering** — packets may arrive out of order
• **No retransmission** — lost packets are gone
• **8-byte header** — minimal overhead
• **No flow/congestion control** — sends at full speed

UDP is the "fire and forget" protocol — ideal when speed matters more than perfection.

## Step 4: When to Use Which [বাংলা অনুবাদ প্রয়োজন]

**Decision guide:**

`Protocol    | Use TCP?  | Use UDP?`
`HTTP/HTTPS  | YES       | No`
`DNS         | Rarely    | YES (default)`
`Gaming      | No        | YES`
`Email       | YES       | No`
`Video       | Streaming | Live YES`
`VoIP        | No        | YES`
`File Trans  | YES       | No`
`DHCP        | No        | YES`

**Rule of thumb:**
• Every byte must arrive? → **TCP**
• Speed matters more? → **UDP**
• Small query/response? → **UDP**
• Large data transfer? → **TCP**
