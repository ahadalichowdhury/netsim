---
name: OSPF
description: Link-state routing — fast convergence within an enterprise
category: Advanced Networking
order: 40
---

## Step 1: OSPF Areas

OSPF divides the network into **areas** to limit the scope of routing updates.

**Area 0 (Backbone)** is the core — all other areas must connect to it. This hierarchy reduces the size of link-state databases and speeds convergence.

**Key points:**
• Area 0 is mandatory (the backbone)
• Each area maintains its own LSDB
• Inter-area routing goes through the backbone

## Step 2: Area Border Routers

An **ABR (Area Border Router)** connects one or more areas to the backbone.

The ABR summarizes routes between areas, reducing the amount of LSA flooding. It maintains separate link-state databases for each area it connects.

**Key points:**
• Connects areas to the backbone
• Summarizes routes between areas
• Reduces LSA flooding scope

## Step 3: LSA Flooding

OSPF routers exchange **LSAs (Link-State Advertisements)** to build a complete topology map.

Each router advertises its directly connected links, costs, and neighbors. LSAs are flooded to all routers within an area, ensuring everyone has the same view of the network.

**LSA Types:**
• Type 1 (Router LSA) — each router generates
• Type 2 (Network LSA) — broadcast networks
• Type 3 (Summary LSA) — ABR summarizes routes

## Step 4: SPF Calculation

After receiving all LSAs, each router runs **Dijkstra's SPF algorithm** to compute the shortest path tree.

The algorithm considers link costs (bandwidth-based) to determine the best path to each destination. Each router builds its own routing table from the SPF tree.

**Key points:**
• Dijkstra algorithm finds shortest paths
• Cost = reference bandwidth / interface bandwidth
• Lowest cost = best path
• Only direct neighbors are in the SPF tree

## Step 5: OSPF Summary

**Key takeaway:** OSPF is a fast-converging link-state routing protocol for enterprise networks.

**Structure:**
• **Areas** — hierarchical design, Area 0 is backbone
• **ABRs** — connect areas, summarize routes
• **LSAs** — link-state advertisements, full topology map
• **SPF** — Dijkstra algorithm, shortest path tree

**Use cases:**
• Enterprise campus networks
• Data center fabrics
• ISP internal routing
• Multi-area designs for scalability
