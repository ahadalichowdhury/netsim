---
name: DHCP
description: Dynamic Host Configuration Protocol - DORA process
category: Networking Fundamentals
order: 14
---

## Step 1: New PC boots up — no IP address! [বাংলা অনুবাদ প্রয়োজন]

A brand-new PC powers on with a **burned-in MAC address** (AA:BB:CC:DD:EE:10) but **no IP configuration** at all.

Without an IP, it cannot communicate on the network. It must run **DHCP DORA** to obtain one automatically.

**Note:** DHCP also provides the **default gateway** and **DNS server** addresses. See those topics for details.

**See also:** **DHCP Table** topic for lease database details.

## Step 2: PC builds DHCP Discover (broadcast) [বাংলা অনুবাদ প্রয়োজন]

The PC constructs a **DHCP Discover** message — the very first step of the DORA process.

Since it has no IP yet, the source address is `0.0.0.0:68`. The destination is the broadcast address `255.255.255.255:67`, so any DHCP server on the LAN can hear the request.

The Ethernet frame is also broadcast (`FF:FF:FF:FF:FF:FF`).

## Step 3: DHCP Discover: PC → Switch [বাংলা অনুবাদ প্রয়োজন]

The DHCP Discover frame leaves PC-A and reaches the Switch on **link-new**.

The frame is a **broadcast** — the switch will flood it to every other port.

## Step 4: Switch floods to DHCP Server [বাংলা অনুবাদ প্রয়োজন]

The Switch receives the broadcast Discover and **floods** it out all ports except the source.

The DHCP Server receives the message on **link-dhcp** and begins processing the request.

## Step 5: DHCP Server checks IP pool [বাংলা অনুবাদ প্রয়োজন]

The DHCP Server examines its **address pool** and selects an available IP: `192.168.1.100`.

It reserves this address for the new PC's MAC address and marks the lease as **"offered"** — pending the client's confirmation.

## Step 6: Server builds DHCP Offer [বাংলা অনুবাদ প্রয়োজন]

The Server builds a **DHCP Offer** reply containing:
• Offered IP: `192.168.1.100`
• Subnet Mask: `255.255.255.0`
• Default Gateway: `192.168.1.1`
• DNS Server: `8.8.8.8`
• Lease Time: `86400 sec (24h)`

The Offer is addressed as a broadcast so the PC (which still has no IP) can receive it.

## Step 7: DHCP Offer: Server → Switch [বাংলা অনুবাদ প্রয়োজন]

The DHCP Server sends the Offer frame to the Switch via **link-dhcp**.

The frame is broadcast so the IP-less PC can pick it up.

## Step 8: Switch forwards Offer to PC [বাংলা অনুবাদ প্রয়োজন]

The Switch forwards the broadcast Offer out all ports. The New PC receives it and now knows an IP is available.

The PC records the offered IP and prepares its response.

## Step 9: PC sends DHCP Request (broadcast) [বাংলা অনুবাদ প্রয়োজন]

The PC sends a **DHCP Request** — still a broadcast — accepting the offered IP `192.168.1.100`.

This broadcast serves two purposes:
1. Tells the chosen Server: "I accept your offer"
2. Tells any other DHCP Servers: "Release your offers — I chose someone else"

## Step 10: Server sends DHCP Ack [বাংলা অনুবাদ প্রয়োজন]

The DHCP Server receives the Request and sends a **DHCP Acknowledge** — the final step of DORA.

The ACK confirms the lease is **officially granted**. The Server marks the IP as "leased" in its table.

## Step 11: PC configures network interface [বাংলা অনুবাদ প্রয়োজন]

The PC receives the ACK and **applies the configuration** to its NIC:
• IP Address: `192.168.1.100`
• Subnet Mask: `255.255.255.0`
• Default Gateway: `192.168.1.1`
• DNS Server: `8.8.8.8`
• Lease Duration: `24 hours`

The interface comes up — the PC is now fully configured.

## Step 12: DORA process complete! [বাংলা অনুবাদ প্রয়োজন]

The full **DORA** cycle is finished:

**D**iscover → **O**ffer → **R**equest → **A**cknowledge

The PC now has a valid IP address, subnet mask, gateway, and DNS server. It can communicate on the network.

The DHCP Server's lease table shows the active lease with a running timer. When the lease expires, the PC must renew — or the IP returns to the pool.
