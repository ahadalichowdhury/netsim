---
name: Subnetting & CIDR
description: How networks are divided — subnet masks, CIDR notation, IP ranges
category: Components
order: 2
---

## Step 1: What is Subnetting? [বাংলা অনুবাদ প্রয়োজন]

**Subnetting** is the process of dividing a large network into smaller, more manageable **sub-networks (subnets)**.

Each subnet is a separate broadcast domain. Subnetting improves:
• **Security** — isolate traffic between groups
• **Performance** — reduce broadcast domain size
• **Management** — organize devices logically

The key tool for subnetting is the **subnet mask**.

## Step 2: Subnet Mask [বাংলা অনুবাদ প্রয়োজন]

A **subnet mask** determines which part of an IP address is the **network** and which is the **host**.

`IP: 192.168.1.100`
`Mask: 255.255.255.0`

The mask performs a **bitwise AND** operation with the IP to extract the network address:

`192.168.1.100 AND 255.255.255.0 = 192.168.1.0`

## Step 3: CIDR Notation [বাংলা অনুবাদ প্রয়োজন]

**CIDR (Classless Inter-Domain Routing)** notation uses a slash followed by the number of network bits:

`/24 = 255.255.255.0` (24 network bits)
`/16 = 255.255.0.0` (16 network bits)
`/8 = 255.0.0.0` (8 network bits)

CIDR replaced the old classful system, allowing **flexible** subnet sizes. A /20 network, for example, gives 4,094 hosts — between a /16 and a /24.

## Step 4: Network Address [বাংলা অনুবাদ প্রয়োজন]

The **network address** is the **first address** in a subnet — where all host bits are set to 0.

`192.168.1.0` (for /24)

This address **cannot** be assigned to a host. It identifies the network itself and is used in routing tables.

## Step 5: Broadcast Address [বাংলা অনুবাদ প্রয়োজন]

The **broadcast address** is the **last address** in a subnet — where all host bits are set to 1.

`192.168.1.255` (for /24)

When a frame is sent to this address, **every host** in the subnet receives it. This address also **cannot** be assigned to a host.

## Step 6: Usable Host Range [বাংলা অনুবাদ প্রয়োজন]

The **usable host range** includes all addresses between the network and broadcast addresses:

`First usable: 192.168.1.1`
`Last usable: 192.168.1.254`

These are the addresses that **can** be assigned to devices. For a /24 subnet, that gives 254 usable addresses.

## Step 7: Calculating Hosts [বাংলা অনুবাদ প্রয়োজন]

The number of usable hosts in a subnet is calculated with:

`2^(32 - prefix) - 2`

For /24: 2^(32-24) - 2 = 2⁸ - 2 = **254 hosts**

The **-2** accounts for the network and broadcast addresses (which can't be assigned).

Common subnets:
`/24 → 254 hosts`
`/16 → 65,534 hosts`
`/20 → 4,094 hosts`

## Step 8: Subnetting Summary [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** Subnetting divides networks into manageable segments.

• **Subnet mask** separates network bits from host bits
• **CIDR notation** (/24, /16, etc.) is shorthand for the mask
• **Network address** = first address (all host bits 0) — unusable
• **Broadcast address** = last address (all host bits 1) — unusable
• **Usable hosts** = 2^(host bits) - 2

Understanding subnetting is essential for network design, IP allocation, and troubleshooting.
