---
name: Routing Table
description: The kernel's road map — how packets find their destination
category: Components
order: 7
---

## Step 1: What is a Routing Table? [বাংলা অনুবাদ প্রয়োজন]

The **routing table** is the kernel's forwarding decision database.

Every time a packet arrives, the kernel consults this table to determine:
• Is the destination **local** (deliver directly)?
• Is the destination **remote** (forward to a gateway)?
• Which **interface** should the packet go out on?

Think of it as a **road map** — the kernel looks up the destination and picks the best route.

## Step 2: Connected Routes [বাংলা অনুবাদ প্রয়োজন]

When you configure an IP address on an interface, the kernel **automatically** adds a connected route.

`192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10`

This means: "I can reach any device on 192.168.1.0/24 directly through eth0 — no gateway needed."

Connected routes have the **lowest metric** (highest priority) because they are directly attached.

## Step 3: Static Routes [বাংলা অনুবাদ প্রয়োজন]

Administrators can manually add routes using:

`ip route add 10.0.0.0/8 via 192.168.1.1`

This tells the kernel: "To reach anything in the 10.0.0.0/8 network, send packets to the gateway at 192.168.1.1."

Static routes are useful when:
• You need to reach a **specific remote network**
• There are **multiple paths** and you want to control which one is used
• You're building a **lab or small network** without dynamic routing protocols

## Step 4: Default Route [বাংলা অনুবাদ প্রয়োজন]

The **default route** (0.0.0.0/0) is the catch-all entry:

`default via 192.168.1.1 dev eth0`

When no specific route matches the destination, the kernel uses the default route. It's like saying "send everything else to this gateway."

Every internet-connected host needs a default route — without it, you can only reach directly connected networks.

## Step 5: Route Lookup Order [বাংলা অনুবাদ প্রয়োজন]

The kernel uses **longest prefix match** to find the best route:

1. Compare the destination IP against all routes
2. The route with the **longest matching prefix** wins
3. If multiple routes have the same prefix length, use the one with the **lowest metric**
4. If still tied, the kernel may use round-robin (equal-cost multipath)

**Example:**
`Destination: 10.5.5.5`
`10.0.0.0/8 (matches) → via 192.168.1.1`
`0.0.0.0/0 (matches) → via 192.168.1.1`
**Winner: 10.0.0.0/8** (8-bit prefix > 0-bit prefix)

## Step 6: Viewing Routes [বাংলা অনুবাদ প্রয়োজন]

Display the routing table using:

`ip route show` — Modern Linux command
`route -n` — Legacy command (same output)

**Output format:**
`192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10`
`10.0.0.0/8 via 192.168.1.1 dev eth0`
`default via 192.168.1.1 dev eth0`

Each line shows: destination, gateway (if remote), interface, and optional parameters like metric and protocol.

## Step 7: Routing Table Summary [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** The routing table is the kernel's **road map** for forwarding packets.

How it works:
1. **Connected routes** — auto-added when you configure an IP
2. **Static routes** — manually added by administrators
3. **Default route** — catch-all for unmatched destinations
4. **Longest prefix match** — selects the most specific route

**Why it matters:**
• Troubleshooting connectivity issues
• Understanding why packets take a certain path
• Configuring multi-homed systems (multiple NICs)
• Setting up firewalls and network security

**Commands:**
`ip route show` — view routes
`ip route add` — add a route
`ip route del` — remove a route
`ip route get 8.8.8.8` — test which route is used
