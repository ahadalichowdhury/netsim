---
name: Gateway
description: How routers act as gateways between different networks
category: Networking Fundamentals
order: 13
---

## Step 1: PC-A wants to reach Server (10.0.0.20)

**PC-A** (192.168.1.10) needs to send data to **Server** (10.0.0.20).

These two devices are on **completely different networks**:
• PC-A: 192.168.1.0/24
• Server: 10.0.0.0/24

PC-A cannot send a frame directly to the Server — it needs help from a **gateway** (router).

**Prerequisite:** Understand **Default Gateway** (how hosts reach other networks) and **ARP** (how MAC addresses are resolved) first.

**How does PC-A know the Server's IP?** The application has it configured, or DNS resolved a hostname. See **How Networks Start** for the complete chain from user action to first packet.

**See also:** **Routing Table** and **Subnetting** topics for routing decisions and network boundaries.

## Step 2: PC-A checks: 10.0.0.20 is NOT in my subnet

PC-A compares the destination IP against its own subnet:

`Destination: 10.0.0.20`
`My subnet: 192.168.1.0/24`

The networks don't match — the Server is **remote**. PC-A must forward the frame to its **default gateway** (Router at 192.168.1.1).

## Step 3: PC-A sends frame to default gateway (Router)

PC-A builds an Ethernet frame with the **Router's MAC** as the Layer 2 destination.

The IP packet inside still has the **Server's IP** as the final destination — but the frame is addressed to the **Router** for local delivery.

## Step 4: Switch forwards to Router

The Switch receives the frame and looks up the destination MAC (AA:BB:CC:DD:EE:FF).

It finds the Router on the connected port and **forwards** the frame directly.

## Step 5: Router receives on eth0 (192.168.1.1)

The Router receives the frame on its **eth0 interface** (192.168.1.1) — the gateway interface for the 192.168.1.0/24 network.

It strips the Ethernet header and examines the **IP destination**: 10.0.0.20.

## Step 6: Router checks routing table for 10.0.0.0/24

The Router looks up the destination IP (10.0.0.20) in its **routing table**.

It finds a match:
`10.0.0.0/24 → eth1 (directly connected)`

The network 10.0.0.0/24 is **directly attached** to the Router's eth1 interface. No next-hop router needed.

## Step 7: Router knows 10.0.0.0/24 is directly connected on eth1

Since the destination network is **directly connected**, the Router knows it can reach the Server through its **eth1 interface** (10.0.0.1).

The Router decrements the TTL and prepares to build a **new Ethernet frame** for the Server.

## Step 8: Router builds NEW frame for Server

The Router constructs a **brand-new Ethernet frame** for the second hop:

`Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)`
`Dst MAC: 11:22:33:44:55:66 (Server)`

**Crucial:** The L2 header is completely new, but the L3 IP addresses remain unchanged — `192.168.1.10 → 10.0.0.20`.

## Step 9: Frame: Router → Switch B

The Router sends the new frame out eth1 to **Switch B**.

The frame now carries the Router as source and Server as destination at Layer 2.

## Step 10: Switch B forwards to Server

Switch B receives the frame, looks up the destination MAC — found on the port connected to the Server.

It **forwards** the frame directly. The Server receives it, checks the destination IP — it matches!

## Step 11: Server receives and replies

The Server accepts the frame — the destination IP matches its own.

It processes the data and sends a **reply** back:
`Src IP: 10.0.0.20 (Server)`
`Dst IP: 192.168.1.10 (PC-A)`

The reply travels back through the Router (gateway) to reach PC-A.

## Step 12: Gateway routing complete!

The Router receives the reply from the Server, looks up the destination (192.168.1.10), and forwards it to PC-A via eth0.

**Key takeaway:** A **gateway** (router) connects different networks. When devices need to communicate across networks, they send frames to the gateway, which:
1. Strips the old L2 header
2. Looks up the routing table
3. Builds a **new L2 header** for the next network
4. Forwards the packet

The L3 IP addresses stay the same end-to-end, but the L2 MAC addresses change at every hop.
