---
name: NAT
description: Network Address Translation — private to public IP mapping
category: Networking Fundamentals
order: 18
---

## Step 1: PC-1 wants to access the internet

PC-1 (192.168.1.10) wants to reach a Web Server at `93.184.216.34` on the internet.

PC-1 uses a **private IP address** (192.168.1.x). Private IPs can't be routed on the public internet — the **NAT Router** must translate the address.

**Prerequisite:** Understand **Default Gateway** (how packets reach the router) and **Layer 3** (how routers forward packets) first.

## Step 2: PC-1 sends packet to default gateway

PC-1 creates a packet destined for the Web Server:
`Src IP: 192.168.1.10:49152`
`Dst IP: 93.184.216.34:80`

The packet arrives at the NAT Router with the **private source address** intact.

## Step 3: Packet: PC-1 → Switch

The packet travels from PC-1 to the LAN Switch on its way to the NAT Router.

## Step 4: Switch forwards to Router

The LAN Switch receives the frame and forwards it to the NAT Router on its LAN interface.

## Step 5: Router performs NAT translation

The NAT Router receives the packet and **translates** the private source IP to its public IP:
`192.168.1.10:49152 → 203.0.113.1:40001`

It creates a **NAT mapping entry** so it can route the response back to PC-1 later.

## Step 6: Translated: Router → Web Server

The Router forwards the translated packet toward the Web Server on the internet.
`Src: 203.0.113.1:40001`
`Dst: 93.184.216.34:80`

The server will see the **public IP**, not the private one.

## Step 7: Web Server responds to public IP

The Web Server receives the packet from `203.0.113.1:40001` and responds:
`Src IP: 93.184.216.34:80`
`Dst IP: 203.0.113.1:40001`

The server has **no idea** about the private IP 192.168.1.10 — it only sees the public address.

## Step 8: Response: Web Server → Router

The Web Server sends its response back to the NAT Router's public IP.

## Step 9: Router translates destination back

The NAT Router receives the response and looks up the mapping:
`203.0.113.1:40001 → 192.168.1.10:49152`

It replaces the destination with the **original private IP** and forwards the packet to PC-1.

## Step 10: Translated: Router → Switch

The Router forwards the translated response to the LAN Switch.
`Dst: 192.168.1.10:49152`

## Step 11: Switch delivers to PC-1

The LAN Switch looks up the destination MAC and delivers the response frame to PC-1.

## Step 12: NAT complete!

**Key takeaway:** NAT translates **private IPs to public IPs** and back, allowing many devices to share one public address.

How it worked:
1. PC-1 sent with **private source IP**
2. Switch forwarded to Router
3. Router **replaced source** with its public IP + new port
4. Router **recorded a mapping** (private ↔ public)
5. Server responded to the **public IP**
6. Router **looked up mapping** and replaced destination
7. Switch delivered to PC-1

This conserves public IPv4 addresses — a single public IP can serve hundreds of devices behind NAT.
