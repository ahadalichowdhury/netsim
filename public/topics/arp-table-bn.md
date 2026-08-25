---
name: ARP Table
description: The mapping cache — IP to MAC address translations
category: Components
order: 4
---

## Step 1: What is an ARP Table? [বাংলা অনুবাদ প্রয়োজন]

An **ARP table** (also called an ARP cache) is a local mapping stored on each device that translates **IP addresses to MAC addresses**.

Since Ethernet frames require MAC addresses (not IPs), every device needs this mapping to communicate at Layer 2. The ARP table is the result of ARP requests and replies that have occurred on the local network.

Without an ARP table, every single packet would require a new ARP broadcast — incredibly inefficient.

## Step 2: Dynamic Entries [বাংলা অনুবাদ প্রয়োজন]

Most ARP table entries are **dynamic** — they are learned automatically through the ARP request/reply process.

When a device needs to send data to an IP on the same subnet, it broadcasts an ARP request: `"Who has 192.168.1.20?"`. The target replies with its MAC address, and the asking device **caches the mapping** in its ARP table.

Dynamic entries have a **timeout** (typically 300 seconds) and are removed if not refreshed.

## Step 3: Static Entries [বাংলা অনুবাদ প্রয়োজন]

You can also create **static ARP entries** manually using the `arp -s` command:

`arp -s 192.168.1.20 AA:BB:CC:DD:EE:02`

Static entries:
• **Never expire** — they persist until manually removed
• **Override dynamic** — if both exist, static takes priority
• **Used for security** — prevent ARP spoofing attacks
• **Used for reliability** — critical infrastructure (gateways, DNS servers)

View with `arp -a` — static entries are marked differently from dynamic ones.

## Step 4: ARP Cache Timeout [বাংলা অনুবাদ প্রয়োজন]

Dynamic ARP entries are **temporary** and expire after a configurable timeout.

On Linux, the default timeout is **300 seconds (5 minutes)**. After this period, the entry is removed and the next packet will trigger a new ARP request.

Why the timeout?
• Devices can **change IPs** (DHCP reassignment)
• Devices can **leave the network** (laptop disconnects)
• NICs can **change** (hardware replacement)
• Prevents **stale entries** from causing communication failures

The timeout is configurable: `sysctl net.ipv4.neigh.default.gc_stale_time`

## Step 5: Viewing ARP Table [বাংলা অনুবাদ প্রয়োজন]

Use the `arp -a` command to view the ARP cache:

`arp -a`
`? (192.168.1.20) at AA:BB:CC:DD:EE:02 [ether] on eth0`
`? (192.168.1.1) at AA:BB:CC:DD:EE:FF [ether] on eth0`

On Linux, you can also use:
`ip neigh show`
`ip neigh show dev eth0`

The output shows the IP address, MAC address, interface, and entry type (dynamic/static).

## Step 6: ARP Table Summary [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** The ARP table is a local cache that maps IP addresses to MAC addresses on the same subnet.

**Entry types:**
• **Dynamic** — learned via ARP request/reply, expires after 300s
• **Static** — manually configured, never expires

**Commands:**
• `arp -a` — view ARP cache
• `arp -s &lt;ip&gt; &lt;mac&gt;` — add static entry
• `arp -d &lt;ip&gt;` — delete entry

The ARP table is essential for Layer 2 communication. Without it, devices cannot build the Ethernet frames needed to send data on the local network.
