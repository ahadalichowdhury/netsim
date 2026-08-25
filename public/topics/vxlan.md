---
name: VXLAN
description: Virtual Extensible LAN — overlay networking for data centers
category: Advanced Networking
order: 44
---

## Step 1: VTEPs — Tunnel Endpoints

**VTEPs (VXLAN Tunnel Endpoints)** are the devices that encapsulate and decapsulate VXLAN packets.

**What they do:**
• **Encapsulate:** Take an original Ethernet frame and wrap it in a VXLAN/UDP/IP header
• **Decapsulate:** Strip the outer headers and deliver the original frame

VTEPs can be:
• Physical switches (hardware VTEPs)
• Hypervisors (software VTEPs in VMware, KVM)
• Linux hosts (using `ip link` or OVS)

Each VTEP has both a **VXLAN VTEP IP** (outer) and connects to **virtual networks** (inner).

## Step 2: Underlay Network

The **underlay network** is the physical IP fabric that carries VXLAN traffic.

**Key characteristics:**
• Standard IP routing — the underlay doesn't know about VXLAN
• Could be a simple L3 network or a complex spine-leaf fabric
• Each VTEP is reachable via its underlay IP

**Overlay vs Underlay:**
• **Overlay** — the virtual network (VXLAN segments)
• **Underlay** — the physical network (IP fabric)

The underlay just routes outer IP packets between VTEPs. It doesn't care what's inside the VXLAN tunnel — it treats them as normal UDP packets.

## Step 3: VNI — VXLAN Network Identifier

The **VNI (VXLAN Network Identifier)** is a 24-bit segment ID that identifies the virtual network.

**Why VNI matters:**
• **24-bit** → supports up to **16,777,216 segments** (16 million)
• Compare to VLANs: only **4,096** possible VLANs (12-bit)
• VNI is the VLAN equivalent in the overlay world

**How it works:**
• Each VNI maps to a virtual network (like a VLAN)
• VMs in the same VNI can communicate directly
• VMs in different VNIs are isolated (need a router)

VXLAN solves the VLAN scalability problem — large cloud providers need millions of network segments, not just 4,096.

## Step 4: Encapsulation — The VXLAN Packet

When VTEP 1 sends a frame to VTEP 2, it **encapsulates** the original frame:

**Encapsulation stack:**
`Original Ethernet Frame`
`  → VXLAN Header (8 bytes, includes VNI)`
`    → UDP Header (src port, dst port 4789)`
`      → Outer IP Header (VTEP IPs)`
`        → Outer Ethernet Header`

**Port 4789** is the IANA-assigned UDP port for VXLAN.

The underlay network only sees a normal UDP packet. The VXLAN header is invisible to physical switches and routers.

At the receiving VTEP, the outer headers are stripped and the original frame is delivered to the destination VM.
