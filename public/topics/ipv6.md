---
name: IPv6
description: The next generation — 128-bit addresses for the future
category: Networking Fundamentals
order: 32
---

## Step 1: Why IPv6?

IPv4 provides only **4.3 billion** addresses (2^32). With the explosion of devices — smartphones, IoT, servers — the world is **running out of IPv4 addresses**.

Workarounds like **NAT** and **private IP ranges** have extended IPv4's life, but they add complexity and break the end-to-end principle.

**IPv6** solves this with **128-bit addresses** — providing 3.4×10^38 addresses. That's enough to give every atom on Earth its own IP address.

## Step 2: IPv4 vs IPv6

**IPv4:**
• 32-bit address (4 octets)
• Dotted decimal: `192.168.1.10`
• ~4.3 billion addresses
• Header: 20-60 bytes (variable)
• Checksum required

**IPv6:**
• 128-bit address (8 groups of 16 bits)
• Colon-hex: `2001:0db8:85a3::8a2e:0370:7334`
• 3.4×10^38 addresses
• Header: fixed 40 bytes
• No checksum (relying on link-layer CRC)

## Step 3: IPv6 Address Format

An IPv6 address is written as **8 groups of 4 hexadecimal digits**, separated by colons:

`2001:0db8:85a3:0000:0000:8a2e:0370:7334`

**Compression rules:**
• Leading zeros in a group can be omitted: `0db8` → `db8`
• One consecutive group of all zeros can be replaced with `::`
• `2001:0db8:85a3::8a2e:0370:7334`

**Special addresses:**
• `::1` — loopback (like 127.0.0.1)
• `::` — unspecified (like 0.0.0.0)
• `fe80::/10` — link-local range

## Step 4: IPv6 Features

IPv6 introduces several improvements over IPv4:

**No NAT needed:**
• Every device can have a globally unique address
• Restores end-to-end connectivity

**SLAAC (Stateless Address Auto-configuration):**
• Devices automatically configure their own IPv6 address
• No DHCP server required (though DHCPv6 exists)

**Built-in IPSec:**
• Originally mandatory in IPv6 (now recommended)
• Provides authentication and encryption at the network layer

**Simplified header:**
• Fixed 40-byte header (faster processing)
• No checksum (rely on link-layer and upper-layer checksums)

## Step 5: Dual Stack

The transition from IPv4 to IPv6 is happening **gradually** through **dual stack** operation.

During the transition period:
• Devices run **both IPv4 and IPv6** simultaneously
• Applications try IPv6 first, fall back to IPv4
• Networks carry both protocol types on the same infrastructure

**Transition mechanisms:**
• **Dual Stack** — run both protocols (most common)
• **Tunneling** — encapsulate IPv6 in IPv4 packets (6to4, Teredo)
• **NAT64/DNS64** — translate between IPv4 and IPv6

IPv6 adoption is growing — over 40% of Google traffic now comes over IPv6.
