---
name: MAC Address Table
description: How switches remember which port connects to which device
category: Components
order: 5
---

## Step 1: What is a MAC Table?

A **MAC address table** (also called a forwarding database or FDB) is the switch's internal database that maps **MAC addresses to physical ports**.

When a switch receives an Ethernet frame, it looks at the **source MAC address** to learn which device is on which port. It then uses this table to **forward frames** to the correct port — rather than flooding all ports.

This is the fundamental mechanism that makes switches smarter than hubs.

## Step 2: How Switches Learn

Switches learn by inspecting the **source MAC address** of every incoming frame:

1. Frame arrives on **Port 1** from MAC `AA:BB:CC:DD:EE:01`
2. Switch records: `AA:BB:CC:DD:EE:01 → Port 1`
3. Frame arrives on **Port 2** from MAC `AA:BB:CC:DD:EE:02`
4. Switch records: `AA:BB:CC:DD:EE:02 → Port 2`

This process is called **MAC learning** — it happens automatically on every frame. The switch doesn't need any configuration to build its table.

## Step 3: Forwarding Decision

When a switch receives a frame, it uses its MAC table for the **forwarding decision**:

**Known destination MAC:**
• Look up the destination in the MAC table
• Find the associated port
• Forward the frame **only to that port** (unicast)

**Unknown destination MAC:**
• The MAC is not in the table
• **Flood** the frame out all ports except the source
• This is called **unknown unicast flooding**

**Broadcast (FF:FF:FF:FF:FF:FF):**
• Always flood to all ports except source

## Step 4: Aging and Timeout

MAC table entries are **temporary** and expire after an **aging time** (typically 300 seconds).

If a device stops sending frames (e.g., it's turned off or disconnected), its MAC entry will **age out** and be removed from the table.

Why aging matters:
• Devices can **move between ports** (laptop moves to different jack)
• Prevents **stale entries** from causing misforwarding
• Keeps the MAC table **compact and accurate**

The aging time is configurable on managed switches:
`switch(config)# mac address-table aging-time 600`

## Step 5: Viewing MAC Table

On **Cisco IOS** switches:
`show mac address-table`

`MAC Address Table`
`-------------------------------------------`
`Vlan    MAC Address       Type    Ports`
`----    -----------------  ------  ------`
`1       AA:BB:CC:DD:EE:01  DYNAMIC  Fa0/1`
`1       AA:BB:CC:DD:EE:02  DYNAMIC  Fa0/2`

On **Linux bridges**:
`bridge fdb show`

On **Linux** with `brctl`:
`brctl showmacs br0`

## Step 6: MAC Table Summary

**Key takeaway:** The MAC address table is the switch's forwarding database that maps MAC addresses to physical ports.

**How it works:**
• Switch **learns** by inspecting source MACs on incoming frames
• Switch **forwards** by looking up destination MACs in the table
• Entries **age out** after 300 seconds if not refreshed

**Commands:**
• Cisco: `show mac address-table`
• Linux bridge: `bridge fdb show`
• Add static: `mac address-table static AA:BB:CC:DD:EE:01 vlan 1 interface Fa0/1`

The MAC table is what makes switches efficient — without it, every frame would be flooded like a hub.
