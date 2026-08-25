---
name: DHCP Lease Table
description: Active IP leases — who has what address and for how long
category: Components
order: 6
---

## Step 1: What is a DHCP Table?

The **DHCP Lease Table** is a database maintained by the DHCP server.

It tracks which devices have been assigned which IP addresses, along with important metadata like MAC addresses, hostnames, and lease expiry times.

Think of it as a **guest registry** — the DHCP server "checks in" each device and records the details of their stay.

## Step 2: Lease Entry Fields

Each entry in the lease table contains several fields:

`IP Address` — The assigned IP (e.g., 192.168.1.100)
`MAC Address` — Hardware address of the client (e.g., AA:BB:CC:01:01:01)
`Hostname` — Client name (e.g., PC-A)
`Lease Time` — How long the lease is valid (e.g., 8 hours)
`Expiry` — When the lease expires (countdown timer)

These fields let the server track who is using which IP and when the address will return to the pool.

## Step 3: Lease Lifecycle

DHCP leases follow a lifecycle defined by the **DORA** process:

**1. Discover** — Client broadcasts looking for a DHCP server
**2. Offer** — Server offers an available IP from the pool
**3. Request** — Client accepts the offered IP
**4. Acknowledge** — Server confirms and records the lease

Renewal happens automatically:
• At **50% of lease time** — client tries to renew with the original server
• At **87.5%** — client broadcasts to any available server if the original is unreachable
• At **100%** — lease expires, IP returns to the pool

## Step 4: IP Pool Range

The DHCP server manages an **address pool** — a range of IPs it can assign.

In this example:
`Pool: 192.168.1.100 — 192.168.1.200`
`Total: 101 addresses`
`In use: 2 (PC-A, PC-B)`
`Available: 99`

Administrators can also configure:
• **Exclusions** — IPs reserved for static devices (printers, servers)
• **Reservations** — Always assign the same IP to a specific MAC address

## Step 5: Viewing DHCP Leases

On Linux, you can view the DHCP lease table using:

`dhcp-lease-list` — Shows active leases from the DHCP server
`cat /var/lib/dhcp/dhclient.leases` — Client-side lease file
`journalctl -u dhcpd` — DHCP server logs

On a router or dedicated DHCP server, the lease table is typically accessible via the web interface or CLI.

## Step 6: DHCP Table Summary

**Key takeaway:** The DHCP Lease Table is the **master record** of IP address assignments on a network.

How it works:
1. Clients request IPs via **DORA** (Discover, Offer, Request, Acknowledge)
2. Server assigns an IP from the **address pool**
3. Lease entry is recorded with **MAC, hostname, lease time**
4. Clients **renew** before expiry to keep their IP
5. Expired IPs return to the pool for reuse

**Why it matters:**
• Troubleshooting IP conflicts
• Identifying unauthorized devices
• Planning address space capacity
• Tracking device history on the network
