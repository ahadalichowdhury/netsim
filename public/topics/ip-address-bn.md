---
name: IP Address
description: Logical address — how devices are identified across networks
category: Components
order: 1
---

## Step 1: What is an IP Address? [বাংলা অনুবাদ প্রয়োজন]

An **IP (Internet Protocol)** address is a **logical address** assigned to devices for routing across networks.

Unlike MAC addresses (which are burned into hardware), IP addresses are **configured by software** — via DHCP or manual assignment.

IP addresses operate at **Layer 3** (Network layer) and enable communication across different networks.

## Step 2: IPv4 Format [বাংলা অনুবাদ প্রয়োজন]

An **IPv4 address** is a **32-bit** number written in **dotted decimal** notation:

`192.168.1.10`

Each number (octet) represents 8 bits, ranging from 0 to 255. With 32 bits, IPv4 provides approximately **4.3 billion** unique addresses.

## Step 3: Class A Networks [বাংলা অনুবাদ প্রয়োজন]

**Class A** networks use the first octet for the network and the remaining three for hosts:

`Network.Host.Host.Host`
`1.0.0.0 — 126.255.255.255`

Prefix: `/8` (subnet mask 255.0.0.0)
Hosts per network: **16.7 million** (2²⁴)

Class A is designed for **very large networks** — originally assigned to major corporations and governments.

## Step 4: Class B Networks [বাংলা অনুবাদ প্রয়োজন]

**Class B** networks use the first two octets for the network and two for hosts:

`Network.Network.Host.Host`
`128.0.0.0 — 191.255.255.255`

Prefix: `/16` (subnet mask 255.255.0.0)
Hosts per network: **65,536** (2¹⁶)

Class B is suitable for **medium to large organizations** — universities, large companies.

## Step 5: Class C Networks [বাংলা অনুবাদ প্রয়োজন]

**Class C** networks use the first three octets for the network and one for hosts:

`Network.Network.Network.Host`
`192.0.0.0 — 223.255.255.255`

Prefix: `/24` (subnet mask 255.255.255.0)
Hosts per network: **254** (2⁸ - 2)

Class C is used for **small networks** — small businesses, home networks.

## Step 6: Private IP Ranges [বাংলা অনুবাদ প্রয়োজন]

**Private IP addresses** (defined in RFC 1918) are not routable on the public internet:

`Class A: 10.0.0.0 — 10.255.255.255` (10.0.0.0/8)
`Class B: 172.16.0.0 — 172.31.255.255` (172.16.0.0/12)
`Class C: 192.168.0.0 — 192.168.255.255` (192.168.0.0/16)

These addresses can be used freely within private networks but must be **translated (NAT)** before reaching the internet.

## Step 7: Public vs Private [বাংলা অনুবাদ প্রয়োজন]

**Public IPs** are globally unique and routable on the internet — assigned by ISPs.

**Private IPs** are used within local networks and are not routable externally.

**NAT (Network Address Translation)** allows many devices with private IPs to share a single public IP:

`192.168.1.10 → NAT → 203.0.113.1 (public)`

This is how most home and office networks access the internet.

## Step 8: IP Address Summary [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** IP addresses are the foundation of Layer 3 routing.

• **32-bit** dotted decimal (e.g., 192.168.1.10)
• **Class A:** /8 prefix, 16.7M hosts (large networks)
• **Class B:** /16 prefix, 65K hosts (medium networks)
• **Class C:** /24 prefix, 254 hosts (small networks)
• **Private ranges:** 10.x / 172.16-31.x / 192.168.x
• **Public IPs** are routable on the internet; **private IPs** need NAT

IP addresses enable routing between different networks — the core function of Layer 3.
