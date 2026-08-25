---
name: TTL & Hop Limit
description: Why packets die — prevents infinite loops in the network
category: Components
order: 9
---

## Step 1: What is TTL? [বাংলা অনুবাদ প্রয়োজন]

**TTL (Time To Live)** is an 8-bit field in the IPv4 header (called **Hop Limit** in IPv6).

It's a counter that prevents packets from circulating forever in a network loop. Every time a packet passes through a router, the TTL is decremented by 1. When it reaches 0, the packet is dropped.

Without TTL, a misconfigured routing loop could cause packets to circulate indefinitely, consuming bandwidth and CPU until the network collapses.

## Step 2: Initial Value [বাংলা অনুবাদ প্রয়োজন]

When a host sends a packet, it sets the **initial TTL value**. Common defaults:

• **Linux:** 64
• **Windows:** 128
• **Cisco IOS:** 255
• **macOS:** 64

The choice is somewhat arbitrary — the important thing is that it's large enough to reach any destination in the internet, but small enough to catch loops.

## Step 3: Decrement at Each Hop [বাংলা অনুবাদ প্রয়োজন]

Each router **decrements the TTL by 1** before forwarding the packet.

The packet starts with TTL=64 and passes through:
• Router 1: TTL becomes 63
• Router 2: TTL becomes 62
• Router 3: TTL becomes 61

If the path has many hops, TTL continues to decrease. This is the core mechanism that prevents infinite loops.

## Step 4: TTL Field in IP Header [বাংলা অনুবাদ প্রয়োজন]

The TTL field is located in the **IPv4 header** at byte offset 8:

`0                   1                   2`
`0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3`
`+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`
`|  Ver  |  IHL  |     TTL     |  Protocol  |`

In IPv6, this field is called **Hop Limit** and works identically — decremented by each router, dropped at 0.

## Step 5: TTL Reaches Zero [বাংলা অনুবাদ প্রয়োজন]

When a router receives a packet with **TTL=1**, it decrements to 0 and **drops the packet**.

The router then sends an **ICMP Time Exceeded** message (Type 11, Code 0) back to the sender, informing them the packet was discarded.

This is how **traceroute** works — it intentionally sends packets with low TTL values to map the path to a destination.

## Step 6: Traceroute Uses TTL [বাংলা অনুবাদ প্রয়োজন]

**traceroute** maps the path to a destination by exploiting TTL:

1. Send packet with **TTL=1** → Router 1 drops it, sends ICMP Time Exceeded
2. Send packet with **TTL=2** → Router 1 decrements, Router 2 drops it
3. Send packet with **TTL=3** → Router 1→2, Router 3 drops it
4. Continue until you reach the destination

Each ICMP reply reveals a router on the path. This is one of the most fundamental network diagnostic tools.

`traceroute example.com`
