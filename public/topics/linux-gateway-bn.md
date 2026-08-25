---
name: Linux Gateway
description: Linux as a gateway with ip forwarding enabled
category: Linux Core Networking
order: 24
---

## Step 1: Linux box connects two networks [বাংলা অনুবাদ প্রয়োজন]

A Linux box sits between two networks:
`Network 1 (br0): 192.168.1.0/24`
`Network 2 (br1): 10.0.0.0/24`

The Linux box has two bridges (br0, br1) and **ip forwarding enabled**, acting as a gateway between them.

**Prerequisite:** Understand **Default Gateway (Linux)** and **Network Namespaces** first.

## Step 2: ip_forward is enabled in kernel [বাংলা অনুবাদ প্রয়োজন]

IP forwarding is checked:
`cat /proc/sys/net/ipv4/ip_forward`

Output: `1` (enabled)

When enabled, the Linux kernel can **route packets between interfaces** instead of dropping them. This turns the Linux box into a router/gateway.

## Step 3: Web namespace sends packet to 10.0.0.20 [বাংলা অনুবাদ প্রয়োজন]

The web namespace (NS: web) wants to reach the DB namespace (10.0.0.20) on a different subnet.

The packet is sent through **veth1** toward br0 (192.168.1.1).

## Step 4: Packet reaches br0 (192.168.1.1) [বাংলা অনুবাদ প্রয়োজন]

The packet travels from veth1 to **bridge br0**.

br0 is the gateway for the 192.168.1.0/24 network. The kernel processes the packet and checks the routing table.

## Step 5: Kernel routing table: 10.0.0.0/24 via br1 [বাংলা অনুবাদ প্রয়োজন]

The kernel checks its routing table:
`192.168.1.0/24 dev br0`
`10.0.0.0/24 dev br1`

Destination 10.0.0.20 matches the 10.0.0.0/24 route — forward to **br1**.

## Step 6: Kernel forwards packet to br1 [বাংলা অনুবাদ প্রয়োজন]

Since ip_forward is enabled, the kernel **forwards the packet** from br0 to br1.

The packet crosses the gateway — moving from one network to another.

## Step 7: Packet reaches veth2-ns [বাংলা অনুবাদ প্রয়োজন]

The packet arrives at **br1 (10.0.0.1)** and is forwarded to **veth2-ns** on the 10.0.0.0/24 network.

## Step 8: DB namespace receives packet [বাংলা অনুবাদ প্রয়োজন]

The DB namespace (NS: db) receives the packet on **veth2-ns**.

Destination IP 10.0.0.20 matches — the packet is accepted.

## Step 9: Reply flows back through gateway [বাংলা অনুবাদ প্রয়োজন]

The DB namespace sends a reply back to the web namespace. The reply follows the reverse path through the Linux gateway.

## Step 10: Linux Gateway summary! [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** Linux can act as a **network gateway** using IP forwarding.

How it worked:
1. **ip_forward=1** enables packet forwarding between interfaces
2. Web namespace sends to 10.0.0.20 (remote subnet)
3. Kernel checks **routing table** → route via br1
4. Kernel **forwards packet** from br0 to br1
5. DB namespace receives the packet
6. Reply flows back through the gateway

Enable with:
`echo 1 > /proc/sys/net/ipv4/ip_forward`
`sysctl -w net.ipv4.ip_forward=1`
