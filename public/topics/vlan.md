---
name: VLAN
description: Virtual LANs — segmenting networks logically
category: Networking Fundamentals
order: 19
---

## Step 1: 4 PCs, 2 VLANs on one switch

All four PCs are connected to the **same physical switch**, but the switch has been configured to create **two VLANs**:

• **VLAN 10**: PC-A (Port 1) and PC-B (Port 2)
• **VLAN 20**: PC-C (Port 3) and PC-D (Port 4)

VLANs **logically segment** the network — even though all devices share one switch, they are isolated into separate broadcast domains.

**Prerequisite:** Understand **Layer 2** (how switches forward frames) first. VLANs extend switching with logical segmentation.

## Step 2: VLAN assignments: PC-A,B = VLAN 10; PC-C,D = VLAN 20

The VLAN table on the switch is fully configured:

`Port 1 → VLAN 10 (PC-A)`
`Port 2 → VLAN 10 (PC-B)`
`Port 3 → VLAN 20 (PC-C)`
`Port 4 → VLAN 20 (PC-D)`

Frames within the same VLAN can communicate. Frames across different VLANs are **blocked** at Layer 2.

## Step 3: PC-A (VLAN 10) sends to PC-B (VLAN 10)

PC-A (VLAN 10) wants to send data to PC-B (also VLAN 10).

Since both are in the **same VLAN**, the switch will forward the frame normally. The VLAN tag is **internal** to the switch — PC-A doesn't need to know about VLANs.

## Step 4: Switch receives untagged frame, assigns VLAN 10

The switch receives the frame on Port 1. Since the port is an **access port** in VLAN 10, the switch internally tags the frame with **VLAN 10**.

The 802.1Q tag is inserted into the Ethernet header:
`TPID: 0x8100`
`VID: 10`

## Step 5: Same VLAN — forwards to PC-B

The switch checks its VLAN table:
• Source port (Port 1) is in **VLAN 10**
• Destination MAC (PC-B) is on Port 2 — also in **VLAN 10**

**Same VLAN → forward!** The switch strips the VLAN tag and delivers the frame to PC-B.

## Step 6: PC-B receives successfully

**PC-B** receives the frame, sees the destination MAC matches its own — it **accepts** the frame.

Communication within the same VLAN works exactly like a normal switch — VLANs are transparent to the end devices.

## Step 7: PC-A sends to PC-C (VLAN 20)

Now PC-A (VLAN 10) tries to send data to PC-C (VLAN 20).

PC-A doesn't know about VLANs — it just sends the frame to the switch. The switch will check the VLAN configuration.

## Step 8: Switch assigns VLAN 10 from PC-A's port

The switch receives the frame on Port 1 (an access port in **VLAN 10**). It internally tags the frame as VLAN 10.

Now it looks up the destination MAC (PC-C) in its forwarding table.

## Step 9: Checks VLAN table — PC-C is VLAN 20

The switch checks its VLAN table:
• Source port (Port 1) is in **VLAN 10**
• Destination MAC (PC-C) is on Port 3 — which is in **VLAN 20**

**VLAN 10 ≠ VLAN 20** — the frame cannot be forwarded!

## Step 10: BLOCKED! Different VLANs cannot communicate directly

The switch **will not forward** the frame.

VLANs create separate **broadcast domains** — traffic cannot cross between them at Layer 2. The frame from PC-A is silently dropped.

PC-A will never reach PC-C without a Layer 3 device.

## Step 11: Cross-VLAN needs a Layer 3 router (Router-on-a-Stick)

To communicate across VLANs, you need a **Layer 3 device** (router or Layer 3 switch).

The common approach is **Router-on-a-Stick**: a single router interface with **802.1Q trunk** carrying tagged traffic for multiple VLANs.

The router has sub-interfaces:
`VLAN 10: 192.168.10.1`
`VLAN 20: 192.168.20.1`

PC-A sends to the router (its default gateway), and the router forwards to PC-C in VLAN 20.

## Step 12: VLAN summary!

**Key takeaway:** VLANs **logically segment** a physical network into separate broadcast domains.

How they worked in this scenario:
1. 4 PCs on one switch, assigned to **VLAN 10 and VLAN 20**
2. PC-A → PC-B (same VLAN 10) — **forwarded** successfully
3. PC-A → PC-C (different VLANs) — **BLOCKED** at Layer 2
4. Cross-VLAN needs a **Layer 3 router** (Router-on-a-Stick with 802.1Q trunk)

Benefits:
• **Security** — traffic isolation between departments
• **Reduced broadcast** — smaller broadcast domains
• **Flexibility** — group users logically, not physically
