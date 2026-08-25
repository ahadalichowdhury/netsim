---
name: Default Gateway
description: How hosts use 0.0.0.0/0 default route to reach the internet
category: Networking Fundamentals
order: 12
---

## Step 1: PC wants to reach Google (8.8.8.8)

**PC** (192.168.1.10) wants to access Google at `8.8.8.8`.

The destination is on the **internet** — far beyond the local network. The PC needs a way to route traffic outside its own subnet.

**Prerequisite:** You should first understand **ARP** (how MAC addresses are discovered) and **Layer 2** (how switches forward frames).

**How does PC know 8.8.8.8?** The user typed `ping 8.8.8.8` or a DNS server resolved a hostname to this IP. See **How Networks Start** for the full journey.

**See also:** **Subnetting** topic to understand why different subnets need a gateway.

## Step 2: PC checks routing table — no specific route for 8.8.8.8

PC checks its **routing table** for a route to 8.8.8.8.

There is no specific route for this IP. But there IS a **default route**:
`0.0.0.0/0 → 192.168.1.1 (Gateway)`

The `0.0.0.0/0` entry is a **wildcard** — it matches ANY destination that doesn't have a more specific route.

## Step 3: PC uses default gateway (0.0.0.0/0 matches everything)

The default route `0.0.0.0/0` is like saying "send **everything else** to this gateway."

It's the network equivalent of a **catch-all**. Any traffic not destined for the local subnet gets forwarded to the Default Gateway (192.168.1.1), which knows how to reach the internet.

## Step 4: PC sends frame to Gateway MAC

PC builds an Ethernet frame addressed to the **Gateway's MAC**:

`Src MAC: AA:BB:CC:DD:EE:01 (PC)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Gateway)`

The IP packet inside targets `8.8.8.8`, but the frame is for local delivery to the Gateway.

## Step 5: Switch forwards to Gateway

The Switch receives the frame and looks up the destination MAC — found on the port connected to the Default Gateway.

It **forwards** the frame directly to the Gateway.

## Step 6: Gateway receives, checks routing table

The Default Gateway receives the frame, strips the Ethernet header, and examines the IP destination: `8.8.8.8`.

It checks its **routing table** and finds a route to the internet via its **eth1 interface** (WAN side).

## Step 7: Gateway has route to internet via eth1

The Gateway's routing table shows:
`192.168.1.0/24 → eth0 (LAN side)`
`0.0.0.0/0 → eth1 (WAN → ISP)`

The default route on the WAN side means "send all non-local traffic to the **ISP**." The Gateway decrements the TTL and builds a new frame for the internet.

## Step 8: Gateway forwards to Internet

The Gateway sends the packet out its **WAN interface** (eth1) toward the Internet.

It may also perform **NAT** (replacing the private source IP with its public IP), but the key idea is that the Gateway knows how to reach the internet because of its default route.

## Step 9: Internet responds — Gateway translates back

Google (8.8.8.8) responds and the reply reaches the Gateway.

The Gateway looks up its **NAT table** (or routing table) and translates the destination back to the PC's private IP: `192.168.1.10`.

## Step 10: Default Gateway delivers reply to PC

The Gateway builds a new frame and sends the reply through the Switch to the PC.

**Key takeaway:** A **default gateway** is the exit door from a local network. The `0.0.0.0/0` route is the most important route on any host — it tells the device "if you don't know where to send a packet, send it here."

Every device on a network needs a default gateway to reach the internet. Without it, the PC could only communicate with devices on its own subnet (192.168.1.0/24).
