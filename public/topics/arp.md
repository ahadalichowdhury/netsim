---
name: ARP
description: Address Resolution Protocol - IP to MAC mapping
category: Networking Fundamentals
order: 11
---

## Step 1: PC-A needs PC-B's MAC address

PC-A wants to send data to PC-B (192.168.1.20). **How does PC-A know this IP?**

• The user typed `ping 192.168.1.20` (IP given directly)
• Or the user typed `ping pc-b.local` and **DNS** resolved it to 192.168.1.20

See the **How Networks Start** topic for the full journey from user action to first packet.

Now PC-A needs to send an Ethernet frame, but it needs PC-B's **MAC address**. PC-A checks its ARP cache — it's empty. It must use ARP to discover the MAC.

**See also:** **ARP Table** topic for cache entries and timeouts.

## Step 2: PC-A builds ARP Request (broadcast)

PC-A creates an **ARP Request**:
`"Who has 192.168.1.20? Tell 192.168.1.10"`

The Ethernet destination is `FF:FF:FF:FF:FF:FF` — a **broadcast** address. Every device on the network will receive this frame.

The ARP payload includes the **target IP** (what PC-A wants) and the **sender MAC** (so PC-B can reply).

## Step 3: ARP Request: PC-A → Switch

The broadcast ARP Request travels from **PC-A** to the **Switch**.

The Switch receives the frame on port 1 and will flood it out all other ports because the destination is the broadcast address.

## Step 4: Switch floods broadcast to PC-B

The Switch receives the broadcast frame and **floods** it out all ports except the source.

The ARP Request reaches **PC-B** via port 2. Both devices on the network will process this broadcast.

## Step 5: PC-B recognizes its IP address

PC-B receives the ARP Request and checks the **target IP address** (192.168.1.20) — it matches PC-B's own IP!

PC-B now knows someone wants its MAC address. It **learns** PC-A's IP and MAC from the ARP payload and will send an **ARP Reply**.

## Step 6: PC-B builds ARP Reply (unicast)

PC-B creates an **ARP Reply**:
`"192.168.1.10 is at AA:BB:CC:DD:EE:02"`

Unlike the request, this is a **unicast** frame — the Ethernet destination is PC-A's MAC address, not the broadcast address. Only PC-A will receive it.

## Step 7: ARP Reply: PC-B → Switch

The unicast ARP Reply travels from **PC-B** to the **Switch**.

The Switch will look up the destination MAC (PC-A) in its table and forward directly.

## Step 8: Switch forwards unicast to PC-A

The Switch receives the ARP Reply and looks at the destination MAC (AA:BB:CC:DD:EE:01).

It finds it in its MAC table — **port 1 = PC-A**. It forwards the frame **only to PC-A**. No flooding!

## Step 9: PC-A receives and updates ARP cache

PC-A receives the ARP Reply and now knows:
`192.168.1.20 → AA:BB:CC:DD:EE:02`

This entry is stored in PC-A's **ARP cache** for future use. PC-A can now send data to PC-B without another ARP request!

## Step 10: ARP resolution complete!

Both devices now have each other's MAC addresses in their ARP caches.

**ARP** maps IP addresses to MAC addresses, enabling Layer 2 communication. Without ARP, devices couldn't build the Ethernet frames needed to send data on a local network.
