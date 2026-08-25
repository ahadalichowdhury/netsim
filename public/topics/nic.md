---
name: Network Interface (NIC)
description: How NICs receive, filter, and transmit frames
category: Linux Core Networking
order: 20
---

## Step 1: Web Server sends a frame to Linux Host

The **Web Server** (192.168.1.20) has prepared an Ethernet frame destined for the Linux Host (192.168.1.10).

The frame travels across the network toward the Linux Host's NIC. Let's see how the NIC processes it step by step.

**Prerequisite:** This topic shows how Linux handles network interfaces at the hardware level.

## Step 2: Frame arrives at NIC (eth0) from cable

The Ethernet frame travels through the cable and arrives at the **Network Interface Controller (eth0)**.

The NIC's physical layer detects the incoming electrical/optical signals and converts them back into digital bits.

## Step 3: NIC checks destination MAC

The NIC inspects the **destination MAC address** in the Ethernet header:

`Dst MAC: AA:BB:CC:DD:EE:01`

The NIC compares this against its own MAC address. This is called **MAC filtering** — the NIC only accepts frames addressed to it (or broadcast/multicast frames).

## Step 4: NIC accepts — MAC matches eth0

The destination MAC **matches** eth0's MAC address! The NIC accepts the frame.

If the MAC didn't match, the NIC would **silently discard** the frame without interrupting the CPU. This filtering happens in hardware — it's extremely fast.

## Step 5: NIC strips Ethernet header, passes payload up

The NIC removes the **Ethernet II header and trailer** (FCS/CRC check passed).

The remaining payload — an **IPv4 packet** — is passed up to the network stack via a **DMA (Direct Memory Access)** transfer into the kernel's receive ring buffer.

## Step 6: Kernel receives IP packet

The NIC triggers a **hardware interrupt (IRQ)** to notify the Linux kernel that a packet has arrived.

The kernel's NIC driver processes the interrupt, reads the packet from the DMA ring buffer, and passes it up through the network stack:
`NIC Driver → IP Layer → TCP → Application`

## Step 7: Now Linux Host sends a reply

The Linux Host has processed the incoming data and generated a **reply**.

The application passes the response data down through the network stack toward the NIC for transmission.

## Step 8: Kernel passes data down to NIC

The kernel's network stack hands the outgoing packet to the **NIC driver**, which places it into the NIC's **TX (transmit) queue**.

The NIC is now responsible for building the Ethernet frame and transmitting it on the wire.

## Step 9: NIC builds frame, adds MAC header

The NIC constructs a new **Ethernet II frame**:
`Src MAC: AA:BB:CC:DD:EE:01 (eth0)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)`

It appends the Ethernet header and calculates the **FCS (Frame Check Sequence)** for error detection.

## Step 10: NIC transmits frame onto cable

The NIC converts the digital frame into **electrical signals** (or optical pulses) and transmits them onto the physical cable.

The frame travels through the switch and reaches the Web Server.
