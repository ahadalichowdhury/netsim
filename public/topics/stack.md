---
name: Network Stack
description: TCP/IP stack layers and packet flow through the kernel
category: Linux Core Networking
order: 21
---

## Step 1: App wants to send data to remote server

A **user application** (e.g., curl, browser) wants to send data to a remote server at `10.0.0.50`.

The data must travel down through each layer of the **TCP/IP network stack** before it can be transmitted on the wire.

**Prerequisite:** Understand the **TCP Handshake** and **DNS** topics to see how applications use the stack.

**See also:** **TCP/UDP Ports** and **IP Address** topics for the headers at each layer.

## Step 2: Application calls send() — data enters Socket API

The application calls the `send()` system call. The data enters the **Socket API** layer — the boundary between user space and kernel space.

The Socket API provides a standardized interface for network communication.

## Step 3: Socket API passes data to TCP layer

The Socket API hands the data to the **TCP layer** in the kernel.

TCP will handle reliability, sequencing, flow control, and congestion management. The data is placed into a TCP segment.

## Step 4: TCP adds header: ports, seq/ack numbers

The TCP layer wraps the data with a **TCP header**:
`Source Port: 49152`
`Dest Port: 80`
`Seq: 1000`
`Ack: 0`
`Flags: SYN`

This segment is now ready to be passed to the IP layer.

## Step 5: TCP passes segment to IP layer

The TCP segment is passed down to the **IP layer**. IP will wrap it with an IP header for routing across networks.

## Step 6: IP adds header: src/dst IP, TTL, protocol

The IP layer wraps the TCP segment with an **IPv4 header**:
`Src IP: 192.168.1.10`
`Dst IP: 10.0.0.50`
`TTL: 64`
`Protocol: TCP (6)`

The IP packet is now ready for the NIC driver.

## Step 7: IP passes frame to NIC driver

The IP layer passes the packet to the **NIC driver**. The driver will hand it to the physical NIC (eth0) for transmission.

## Step 8: NIC adds MAC header, transmits on wire

The NIC adds the **Ethernet II header** with source and destination MAC addresses, calculates the FCS, and transmits the frame onto the physical wire.

`Src MAC: AA:BB:CC:DD:EE:01 (eth0)`
`Dst MAC: Default Gateway MAC`

## Step 9: Switch forwards to remote server

The **Switch** receives the frame, looks up the destination MAC in its forwarding table, and forwards the frame toward the remote server.

## Step 10: Server NIC receives frame

The **Remote Server's NIC** receives the frame, checks the destination MAC — it matches! The NIC strips the Ethernet header and passes the IP packet up to the server's network stack.

The server's NIC triggers an interrupt to notify the CPU.

## Step 11: Server processes UP the stack

The Remote Server processes the packet **upward** through its own network stack:

`NIC Driver → IP Layer → TCP Layer → Application`

Each layer strips its header and passes the payload upward — the reverse of what the sending host did.

## Step 12: Full journey complete!

**Key takeaway:** Data travels **DOWN** the sending host's stack, across the wire, then **UP** the receiving host's stack.

The journey:
1. **Application** → Socket API (`send()`)
2. **TCP** adds ports, sequence numbers
3. **IP** adds source/destination IPs, TTL
4. **NIC** adds MAC header, transmits
5. **Switch** forwards to destination
6. Server NIC receives, strips MAC header
7. **IP** strips IP header
8. **TCP** strips TCP header, delivers data
9. **Application** receives the data!

Each layer only talks to its **peer** on the other side (TCP-to-TCP, IP-to-IP, MAC-to-MAC).
