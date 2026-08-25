---
name: Ethernet Frame
description: The data container — how bits are packaged for the wire
category: Components
order: 8
---

## Step 1: Preamble

The **preamble** is the first field in an Ethernet frame — 7 bytes of alternating 1s and 0s (10101010 pattern).

Its purpose is **synchronization**. It gives the receiving NIC time to lock onto the signal's timing before the actual frame begins.

The preamble is followed by the **SFD (Start Frame Delimiter)**, a 1-byte field that signals "the actual frame starts now."

## Step 2: Destination MAC

The **destination MAC address** identifies who the frame is for — 6 bytes (48 bits).

Special values:
• `FF:FF:FF:FF:FF:FF` — broadcast, received by all devices
• Multicast addresses — received by a group of devices
• Unicast — addressed to a specific NIC

If the destination is on the same network, the frame goes directly. If it's on a different network, it goes to the default gateway (router).

## Step 3: Source MAC

The **source MAC address** identifies who sent the frame — 6 bytes (48 bits).

Switches use the source MAC to **learn** which device is on which port. When a switch receives a frame, it records the source MAC and the incoming port in its MAC address table.

The source MAC is **always** a unicast address (never broadcast or multicast).

## Step 4: EtherType

The **EtherType** field identifies which protocol is encapsulated in the payload — 2 bytes.

Common values:
• `0x0800` — IPv4
• `0x0806` — ARP
• `0x86DD` — IPv6

This field tells the receiving device how to interpret the payload. If the payload is an IPv4 packet, the NIC passes it up to the IPv4 stack.

## Step 5: Payload

The **payload** contains the actual data being transmitted — 46 to 1500 bytes.

This is typically an **IP packet**, but it could also be ARP, IPv6, or other protocols as indicated by the EtherType field.

If the data is smaller than 46 bytes, it's padded to meet the minimum Ethernet frame size (64 bytes total). The maximum of 1500 bytes is the **MTU** (Maximum Transmission Unit).

## Step 6: Frame Check Sequence

The **FCS (Frame Check Sequence)** is a 4-byte CRC (Cyclic Redundancy Check) used for error detection.

The sender calculates a CRC value over the entire frame (excluding preamble and SFD) and appends it. The receiver recalculates the CRC and compares — if they don't match, the frame is **silently discarded**.

FCS detects:
• Bit flips from electrical noise
• Truncated frames
• Corrupted data in transit

FCS does **not** detect or correct all errors — it's a best-effort check.
