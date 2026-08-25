---
name: Layer 2
description: How switches forward frames using MAC addresses
category: Networking Fundamentals
order: 10
---

## Step 1: PC-A wants to send data to PC-B

**PC-A** has data to send to **PC-B** (192.168.1.20). Both are on the same subnet (192.168.1.0/24), so PC-A can send directly via Layer 2.

But first, PC-A needs to build an **Ethernet frame** with PC-B's MAC address as the destination.

**How does PC-A know PC-B's MAC?**
PC-A uses **ARP** (Address Resolution Protocol) to discover it. Before this step, PC-A sent an ARP broadcast: "Who has 192.168.1.20?" and PC-B replied with its MAC. See the **ARP topic** for the full process.

**How does PC-A know PC-B's IP?** The user or application provided it — either directly (ping 192.168.1.20) or via DNS resolution (ping pc-b.local). See **How Networks Start** for the complete chain.

**See also:** **MAC Address** and **MAC Table** topics for how switches learn and forward.

## Step 2: PC-A builds Ethernet frame

PC-A creates an **Ethernet II frame**:
`Src MAC: AA:BB:CC:DD:EE:01`
`Dst MAC: AA:BB:CC:DD:EE:02`

Inside the Ethernet payload is an **IPv4 packet** carrying the data. The frame is now ready to be sent to the Switch.

## Step 3: Frame travels: PC-A → Switch

The Ethernet frame travels from **PC-A** to the **Switch** over the physical cable.

The Switch receives the frame on **port 1** and begins processing it.

## Step 4: Switch learns PC-A's MAC address

The Switch inspects the frame's **source MAC address** (AA:BB:CC:DD:EE:01).

It creates an entry in its **MAC address table**:
`AA:BB:CC:DD:EE:01 → Port 1 (PC-A)`

This is the **learning** phase — the switch now knows where to find PC-A.

## Step 5: Switch checks MAC table — PC-B unknown

The Switch looks at the frame's **destination MAC** (AA:BB:CC:DD:EE:02) and searches its MAC table.

**PC-B is not in the table.** The switch doesn't know which port leads to PC-B.

The only option: **flood** the frame out all ports except the one it came in on.

## Step 6: Switch floods frame to PC-B

The Switch floods the frame out **all ports except port 1**.

The first copy travels to **PC-B** via port 2. This is called **unknown unicast flooding**.

## Step 7: Switch also floods to PC-C

The Switch simultaneously sends a copy of the frame to **PC-C** via port 3.

PC-C will examine the destination MAC and decide whether to accept or drop the frame.

## Step 8: PC-C drops — wrong destination MAC

**PC-C** receives the flooded frame and checks the destination MAC.

`Dst MAC: AA:BB:CC:DD:EE:02`
`PC-C MAC: AA:BB:CC:DD:EE:03`

The addresses don't match — **PC-C silently drops the frame**. It was never meant for PC-C.

## Step 9: PC-B accepts and sends reply

**PC-B** receives the frame and sees the destination MAC matches its own — it **accepts** the frame.

PC-B processes the data and sends a **reply frame** back:
`Src MAC: AA:BB:CC:DD:EE:02 (PC-B)`
`Dst MAC: AA:BB:CC:DD:EE:01 (PC-A)`

## Step 10: Switch learns PC-B's MAC

The Switch receives the reply and inspects the **source MAC** (AA:BB:CC:DD:EE:02).

It creates a new entry:
`AA:BB:CC:DD:EE:02 → Port 2 (PC-B)`

The MAC table now has entries for **both** PC-A and PC-B.

## Step 11: Switch forwards unicast to PC-A

The Switch checks the destination MAC (AA:BB:CC:DD:EE:01) in its table — **found! Port 1 = PC-A.**

No flooding needed — the Switch forwards the frame **only to PC-A**. This is efficient **unicast forwarding**.

## Step 12: Layer 2 switching complete!

The Switch has now **learned** both PC-A and PC-B's MAC addresses.

Future frames between PC-A and PC-B will be **forwarded directly** via unicast — no more flooding!

**Key concept:** Switches learn by inspecting the **source MAC** of every frame. They forward by looking up the **destination MAC** in their MAC address table.
