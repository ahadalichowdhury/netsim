---
name: MPLS
description: Label switching — fast forwarding without IP lookup
category: Advanced Networking
order: 41
---

## Step 1: FEC — Forwarding Equivalence Class [বাংলা অনুবাদ প্রয়োজন]

A **FEC (Forwarding Equivalence Class)** groups packets that are forwarded the same way — same path, same service, same QoS.

All packets in a FEC receive the **same label** at the ingress LSR. This groups traffic by destination prefix, VPN, or traffic engineering policy.

**Key points:**
• Packets with same FEC = same label = same path
• FEC can be based on destination IP, QoS, or VPN
• Simplifies forwarding decisions

## Step 2: Label Push (Ingress) [বাংলা অনুবাদ প্রয়োজন]

The **Ingress LSR (Label Switch Router)** receives an IP packet and performs a **label push** — it adds an MPLS label to the packet.

The label is a 20-bit value that identifies the FEC. The packet is now an MPLS frame and will be forwarded by label switching instead of IP lookup.

**MPLS Label format:**
• Label (20 bits) — identifies the FEC
• TC (3 bits) — Traffic Class (QoS)
• S (1 bit) — Bottom of stack
• TTL (8 bits) — hop limit

## Step 3: Label Swap (Transit) [বাংলা অনুবাদ প্রয়োজন]

The **Mid LSR** receives the labeled packet and performs a **label swap** — it replaces the incoming label with the outgoing label for the next hop.

This is the core of MPLS switching: the LSR looks up the incoming label in its **LFIB (Label Forwarding Information Base)** and swaps to the next label.

**Key points:**
• LFIB lookup by incoming label
• Swap label for next hop
• No IP header inspection needed — fast!

## Step 4: Label Pop (Egress) [বাংলা অনুবাদ প্রয়োজন]

The **Egress LSR** receives the labeled packet and performs a **label pop** — it removes the MPLS label and forwards the original IP packet.

This is called **PHP (Penultimate Hop Popping)** when the second-to-last LSR pops the label — the egress LSR then only needs to do a normal IP lookup.

**Key points:**
• Remove MPLS label
• Forward by IP lookup (normal routing)
• PHP optimizes the last hop

## Step 5: MPLS Summary [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** MPLS provides fast label-based forwarding without IP header inspection at every hop.

**Label operations:**
• **Push** — Ingress adds label
• **Swap** — Transit routers change label
• **Pop** — Egress removes label

**LSR Types:**
• **Ingress LER** — pushes labels on IP packets
• **Transit LSR** — swaps labels (fast switching)
• **Egress LER** — pops labels, forwards by IP

**Use cases:**
• MPLS VPNs (L3VPN, L2VPN)
• Traffic engineering
• Fast reroute (FRR)
• QoS differentiation
