---
name: Linux Bridges
description: Connecting VMs/containers with Linux bridge (brctl)
category: Linux Core Networking
order: 27
---

## Step 1: Linux bridge acts like a virtual switch [বাংলা অনুবাদ প্রয়োজন]

A **Linux bridge** is a kernel-level virtual switch. It works just like a physical switch — it learns MAC addresses and forwards frames.

Created with:
`ip link add br0 type bridge`
`brctl show br0`

The bridge has ports where VMs/containers attach, and an uplink to the outside network.

**Prerequisite:** Understand **Network Namespaces** and **Layer 2** (MAC learning) first.

## Step 2: VM-1 and VM-2 both connected to br0 [বাংলা অনুবাদ প্রয়োজন]

Both VMs are attached to bridge br0 via their virtual NICs:
`brctl addif br0 tap-vm1`
`brctl addif br0 tap-vm2`

The bridge's **Forwarding Database (FDB)** is currently empty — it hasn't learned any MAC addresses yet.

## Step 3: VM-1 sends ARP broadcast [বাংলা অনুবাদ প্রয়োজন]

VM-1 wants to communicate with VM-2 but doesn't know its MAC address. It sends an **ARP broadcast**:
`"Who has VM-2? Tell VM-1"`

The broadcast frame enters the bridge on the vm-1 port.

## Step 4: Bridge floods to VM-2 [বাংলা অনুবাদ প্রয়োজন]

The bridge receives the broadcast and **floods** it out all ports except the source — including the port connected to VM-2.

VM-2 receives the ARP request and recognizes its own IP.

## Step 5: VM-2 replies (unicast) [বাংলা অনুবাদ প্রয়োজন]

VM-2 sends an **ARP Reply** — this time a **unicast** frame addressed to VM-1's MAC.

The bridge receives the reply and **learns** VM-2's MAC address from the source field. It adds an entry to its FDB.

## Step 6: Bridge learns VM-1 MAC, adds to FDB [বাংলা অনুবাদ প্রয়োজন]

The bridge now forwards the ARP reply toward VM-1. When VM-1's frame arrives, the bridge also **learns VM-1's MAC** from the source.

The FDB now has entries for **both VMs**. Future unicast frames won't need flooding.

## Step 7: VM-1 sends data to VM-2 (unicast) [বাংলা অনুবাদ প্রয়োজন]

Now that ARP is resolved, VM-1 sends a **data frame** to VM-2.

The frame enters the bridge with VM-1 as the source (already learned) and VM-2 as the destination.

## Step 8: Bridge looks up FDB — forwards to VM-2 [বাংলা অনুবাদ প্রয়োজন]

The bridge checks its FDB for VM-2's MAC — **found on the vm-2 port**.

It forwards the frame directly to VM-2. No flooding needed — the bridge learned the MAC addresses earlier.

## Step 9: VM-1 sends to internet (not local) [বাংলা অনুবাদ প্রয়োজন]

VM-1 now sends a packet destined for the **internet** (outside the local bridge network).

The bridge receives the frame, but the destination MAC belongs to the **Router** (next hop), not a local VM.

## Step 10: Bridge forwards to router (uplink) [বাংলা অনুবাদ প্রয়োজন]

The bridge looks up the destination MAC — it belongs to the **Router**, connected on the uplink port.

The frame is forwarded to the Router, which will route it to the internet.

**Key takeaway:** A Linux bridge works exactly like a physical switch — it learns MAC addresses in its FDB and forwards unicast frames directly. It floods broadcasts and unknown unicast. Combined with a router on the uplink, it provides full network connectivity for VMs and containers.
