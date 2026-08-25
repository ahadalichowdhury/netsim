---
name: Route Table
description: Linux routing decisions with ip route
category: Linux Core Networking
order: 22
---

## Step 1: Linux box has 2 interfaces, 2 route table entries [বাংলা অনুবাদ প্রয়োজন]

The Linux box has two network interfaces:
`eth0: 192.168.1.1/24`
`eth1: 10.0.0.1/24`

The kernel maintains a **routing table** that determines where to send packets based on their destination IP.

**Prerequisite:** Understand **Layer 3** (routing decisions) and **Gateway** (how routers connect networks) first.

**See also:** **Routing Table** topic for the conceptual overview.

## Step 2: Packet arrives from PC-A (192.168.1.10) [বাংলা অনুবাদ প্রয়োজন]

PC-A (192.168.1.10) sends a packet destined for the Server (8.8.8.8).

The packet travels from PC-A to Switch A, which will forward it to the Linux box on eth0.

## Step 3: Packet arrives at eth0 [বাংলা অনুবাদ প্রয়োজন]

Switch A forwards the packet to eth0 on the Linux box.

The kernel now owns the packet and must decide where to send it next based on the destination IP (8.8.8.8).

## Step 4: Kernel checks routing table for destination 8.8.8.8 [বাংলা অনুবাদ প্রয়োজন]

The Linux kernel consults its **routing table** to find a match for destination 8.8.8.8.

It checks each entry:
• `192.168.1.0/24` → No match (8.8.8.8 is not in this subnet)
• `10.0.0.0/24` → No match (8.8.8.8 is not in this subnet)

No specific route matches — the kernel looks for a **default route**.

## Step 5: Match: 0.0.0.0/0 via 10.0.0.1 (default route) [বাংলা অনুবাদ প্রয়োজন]

The kernel finds the **default route** (0.0.0.0/0) — a catch-all entry that matches any destination.

The default gateway is `10.0.0.1`, which is the Linux box's own eth1 interface. The packet should be sent out via **eth1**.

## Step 6: Kernel forwards packet to eth1 [বাংলা অনুবাদ প্রয়োজন]

Based on the routing decision, the kernel **forwards** the packet from eth0 to eth1.

The packet is now being routed between the two interfaces — the Linux box is acting as a **router**.

## Step 7: Packet: eth1 → Switch B [বাংলা অনুবাদ প্রয়োজন]

The packet exits eth1 (10.0.0.1) and travels to Switch B.

The packet is now on the 10.0.0.0/24 network, heading toward the destination 8.8.8.8.

## Step 8: Switch B forwards to server [বাংলা অনুবাদ প্রয়োজন]

Switch B receives the packet and forwards it to the Server (8.8.8.8) based on its forwarding table.

## Step 9: Routing decision summary [বাংলা অনুবাদ প্রয়োজন]

The packet was successfully routed from the 192.168.1.0/24 network to the 10.0.0.0/24 network.

**Key steps:**
1. Packet arrived on eth0 from PC-A
2. Kernel checked routing table for destination 8.8.8.8
3. No specific route matched — used **default route**
4. Packet forwarded to eth1 and delivered to the server

The `ip route` command shows the kernel's routing table.

## Step 10: ip route shows the kernel's routing table [বাংলা অনুবাদ প্রয়োজন]

The `ip route` command displays the routing table:

`192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.1`
`10.0.0.0/24 dev eth1 proto kernel scope link src 10.0.0.1`
`default via 10.0.0.1 dev eth1`

**Key takeaway:** Linux uses its routing table to make forwarding decisions. The default route (0.0.0.0/0) is the fallback when no specific route matches the destination.
