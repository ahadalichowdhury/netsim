---
name: Load Balancing
description: Distributing traffic — L4/L7 balancers, algorithms, health checks
category: Advanced Networking
order: 42
---

## Step 1: L4 Load Balancing

**L4 (Layer 4) Load Balancing** operates at the transport layer.

It routes traffic based on **IP address and port number** only — it does not inspect the payload.

**How it works:**
• Receives a TCP/UDP connection
• Selects a backend based on the algorithm
• Forwards the raw packet stream

**Advantages:**
• Very fast — minimal processing per packet
• Low latency — no payload inspection
• High throughput — handles millions of connections

L4 is ideal for simple, high-volume traffic distribution where content inspection is not needed.

## Step 2: L7 Load Balancing

**L7 (Layer 7) Load Balancing** operates at the application layer.

It can inspect **HTTP headers, URLs, cookies, and content** to make intelligent routing decisions.

**How it works:**
• Terminates the client TCP connection
• Inspects the HTTP request
• Routes to the appropriate backend based on rules

**Example rules:**
• `/api/*` → Backend API servers
• `/static/*` → CDN or file servers
• `Host: shop.example.com` → Shopping cart servers

L7 enables content-aware routing but adds latency due to deep packet inspection.

## Step 3: Load Balancing Algorithms

The load balancer uses an **algorithm** to decide which backend receives each connection:

**Round Robin:**
• Cycles through backends sequentially
• Simple and fair for equal-capacity servers

**Least Connections:**
• Routes to the backend with fewest active connections
• Good for variable request durations

**IP Hash:**
• Hashes the client IP to determine backend
• Same client always hits the same server (session persistence)

**Weighted:**
• Backends have assigned weights (e.g., 3:1)
• More powerful servers get more traffic

## Step 4: Backend Pool Management

Backends are organized into a **server pool** managed by the load balancer.

**Key concepts:**
• **Weighting** — assign traffic proportionally based on server capacity
• **Draining** — gracefully remove a server from rotation without dropping active connections
• **Connection limits** — cap concurrent connections per backend
• **Session persistence** — sticky sessions ensure same client hits same backend

When a backend is draining, new connections go elsewhere while existing ones complete. This enables zero-downtime maintenance.

## Step 5: Health Checks

The load balancer continuously monitors backend health using **health checks**.

**Active probes:**
• **TCP check** — can we establish a TCP connection?
• **HTTP check** — does `GET /health` return 200 OK?
• Custom checks — verify specific endpoints or responses

**Passive monitoring:**
• Track error rates from real traffic
• Detect slow responses or timeouts

**Failover:**
• If a backend fails checks → **removed from pool**
• Traffic redistributed to healthy backends
• When health restores → **automatically re-added**

Health checks prevent the load balancer from sending traffic to failed or overloaded servers.
