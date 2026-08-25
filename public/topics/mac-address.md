---
name: MAC Address
description: Physical address — the unique ID burned into every NIC
category: Components
order: 0
---

## Step 1: What is a MAC Address?

A **MAC (Media Access Control)** address is the **physical address** burned into every Network Interface Card (NIC) by the manufacturer.

It operates at **Layer 2** (Data Link layer) of the OSI model and is used to identify devices on a local network segment.

Unlike IP addresses (which are logical and can change), a MAC address is a **permanent hardware identifier** — though it can be spoofed in software.

## Step 2: MAC Address Format

A MAC address is a **48-bit (6-byte)** number written in hexadecimal:

`AA:BB:CC:DD:EE:FF`

Each pair of hex digits represents one byte. The first 3 bytes identify the **vendor (OUI)**, and the last 3 bytes identify the **specific device**.

## Step 3: OUI — Vendor Identifier

The first **3 bytes (24 bits)** of a MAC address form the **OUI (Organizationally Unique Identifier)**.

`AA:BB:CC` ← OUI identifies the manufacturer

The IEEE (Institute of Electrical and Electronics Engineers) assigns OUIs to companies. For example:
• Intel: `00:1B:21`
• Cisco: `00:1A:A0`
• Apple: `3C:22:FB`

## Step 4: NIC ID — Device Identifier

The last **3 bytes (24 bits)** form the **NIC ID** — a unique identifier assigned by the manufacturer.

`DD:EE:FF` ← NIC ID (device-specific)

Combined with the OUI, this creates a globally unique address. With 2²⁴ (16.7 million) possible NIC IDs per OUI, manufacturers rarely run out.

## Step 5: Unicast MAC

A **unicast** MAC address identifies a **single device** on the network.

The **least significant bit** of the first byte is **even (0)**:
`AA:BB:CC:DD:EE:02` → Unicast

When a frame is sent to a unicast address, only the device with that MAC will accept it. This is the most common type of MAC address.

## Step 6: Broadcast MAC

The **broadcast** MAC address is `FF:FF:FF:FF:FF:FF` — all bits set to 1.

When a frame is sent to this address, **every device** on the local network segment will process it.

Broadcast MAC is used for:
• ARP requests ("Who has this IP?")
• DHCP discovery ("I need an IP!")
• Network announcements

## Step 7: Multicast MAC

A **multicast** MAC address identifies a **group of devices**.

The **least significant bit** of the first byte is **odd (1)**:
`01:00:5E:xx:xx:xx` → IPv4 Multicast
`33:33:xx:xx:xx:xx` → IPv6 Multicast

Multicast allows one sender to reach multiple receivers efficiently — without broadcasting to everyone.

## Step 8: MAC Address Summary

**Key takeaway:** MAC addresses are the foundation of Layer 2 communication.

• **48-bit** hexadecimal address (e.g., AA:BB:CC:DD:EE:FF)
• **OUI** (first 3 bytes) = vendor identifier
• **NIC ID** (last 3 bytes) = device identifier
• **Unicast** = single device (first byte even)
• **Broadcast** = all devices (FF:FF:FF:FF:FF:FF)
• **Multicast** = group of devices (first byte odd)

Switches use MAC addresses to forward frames. ARP maps IP addresses to MAC addresses.
