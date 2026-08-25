---
name: Network Namespaces
description: Linux network isolation with namespaces and veth pairs
category: Linux Core Networking
order: 26
---

## Step 1: Two isolated network namespaces: app1 and app2

**Linux network namespaces** provide complete network stack isolation. Each namespace has its own interfaces, routes, and iptables rules.

We've created two namespaces:
`ip netns add app1`
`ip netns add app2`

They are completely invisible to each other — like two separate machines.

**Prerequisite:** Understand **Network Interface (NIC)** and **Network Stack** first.

## Step 2: Each namespace has its own network stack

Each namespace runs its own independent **network stack**:
• Its own **loopback** (lo) interface
• Its own **routing table**
• Its own **iptables/nftables** rules
• Its own set of **sockets**

If you run `ip netns exec app1 ip addr`, you'll see only the lo interface — no eth0, no bridge, nothing else.

## Step 3: Veth pairs connect namespaces to bridge

**Veth pairs** are virtual Ethernet cables — what goes in one end comes out the other.

We create two veth pairs:
`ip link add veth-a type veth peer name veth-a-br`
`ip link add veth-b type veth peer name veth-b-br`

Then move one end into each namespace and attach the other to the bridge:
`ip link set veth-a netns app1`
`ip link set veth-b netns app2`
`brctl addif br0 veth-a-br`
`brctl addif br0 veth-b-br`

## Step 4: app1 sends a packet to the outside world

Namespace **app1** sends a packet destined for the internet.

Inside the namespace, the packet travels through **veth-a** — the veth pair acts as a virtual cable, delivering the frame out to the bridge.

## Step 5: Veth-a forwards to bridge br0

The other end of the veth pair delivers the frame to **bridge br0**.

The bridge receives the frame on the port connected to veth-a and begins standard bridge processing: learning the source MAC and looking up the destination.

## Step 6: Bridge forwards to internet

The bridge looks up the destination — it's not local, so it forwards the frame out its **uplink port** toward the internet.

The packet has successfully left app1's namespace, traversed the veth pair, been bridged, and reached the outside world.

## Step 7: Now app2 tries to send — but namespace is isolated

Namespace **app2** also wants to send a packet. But here's the key: app2 and app1 are in **completely separate network namespaces**.

App2 cannot see app1's interfaces, ARP table, or routing table. They are isolated at the kernel level.

However, app2 *can* reach the bridge through its own veth pair (veth-b), because the bridge is a shared resource outside both namespaces.

## Step 8: app2 packet reaches bridge

App2 sends a packet through **veth-b**, which delivers it to the bridge.

The bridge now sees traffic from a **second namespace**. It learns app2's MAC on the veth-b-br port. Both namespaces share the same bridge but remain isolated from each other.

## Step 9: Bridge can forward — namespaces share the bridge

The bridge forwards app2's packet to the internet, just like it did for app1.

**Key insight:** Both namespaces are isolated from *each other*, but they can both reach the **shared bridge** and communicate with the outside world.

This is how containers (Docker, Podman) provide network isolation while still allowing internet access.

## Step 10: Network namespace summary

**Key takeaway:** Linux network namespaces provide **complete network isolation** at the kernel level.

How it works:
1. Each namespace has its own **network stack** (interfaces, routes, iptables)
2. **Veth pairs** connect namespaces to the outside (like virtual Ethernet cables)
3. A **bridge** can connect multiple namespaces and provide internet access
4. Namespaces are **isolated from each other** — they can't see each other's traffic

Used by: Docker, Podman, Kubernetes, LXC/LXD, network function virtualization (NFV).
