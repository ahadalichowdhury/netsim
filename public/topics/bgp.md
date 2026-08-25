---
name: BGP
description: The internet's routing protocol — how autonomous systems exchange routes
category: Advanced Networking
order: 39
---

## Step 1: eBGP — Between ASes

**eBGP (External BGP)** is the protocol used to exchange routing information **between different Autonomous Systems**.

Each AS is a network under a single administrative domain (ISP, enterprise, cloud provider). eBGP peers sit on directly connected links and advertise their prefixes.

**Key points:**
• Different AS numbers on each side
• Directly connected interfaces (TTL=1 by default)
• Used to share routes across ISP boundaries

## Step 2: iBGP — Within AS

**iBGP (Internal BGP)** distributes routes learned via eBGP **within a single Autonomous System**.

When AS 100 learns a route from AS 300 via eBGP, iBGP propagates that route to all routers inside AS 100 (including AS 200).

**Key points:**
• Same AS number on both sides
• Route reflectors reduce full-mesh requirements
• Ensures internal routers know external routes

## Step 3: AS_PATH Attribute

The **AS_PATH** is a mandatory BGP attribute that lists every AS a route has traversed.

`AS_PATH: [AS300, AS100, AS200]`

This serves two purposes:
**1. Loop prevention** — If a router sees its own AS in the path, it rejects the route.
**2. Path selection** — Shorter AS_PATH is preferred (lower hop count).

BGP is a **path-vector** protocol — it carries the entire AS path, not just a distance metric.

## Step 4: BGP Path Selection

BGP selects the best route using a **decision process** with multiple attributes, evaluated in order:

**1. Weight** (Cisco) — local preference, highest wins
**2. Local Preference** — highest wins
**3. AS_PATH length** — shortest wins
**4. Origin** — IGP < EGP < Incomplete
**5. MED (Multi-Exit Discriminator)** — lowest wins

Only the **best path** is installed in the routing table and advertised to peers.

## Step 5: BGP Summary

**Key takeaway:** BGP is the protocol that makes the internet work.

**Two types:**
• **eBGP** — between different ASes (ISP peering, customer/provider)
• **iBGP** — within a single AS (route distribution)

**Path attributes:**
• AS_PATH — loop prevention and path length
• Local Pref — outbound path selection
• MED — inbound path suggestion
• Weight — local-only preference

**Use cases:**
• ISP peering and transit
• Enterprise multi-homing
• Cloud provider connectivity
• VPN and traffic engineering
