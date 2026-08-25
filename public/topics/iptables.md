---
name: iptables Firewall
description: Linux packet filtering with iptables chains
category: Linux Core Networking
order: 25
---

## Step 1: Firewall has iptables rules on 3 chains

The Linux firewall uses **iptables** with three built-in chains:

**INPUT** — packets destined for the firewall itself
**OUTPUT** — packets originating from the firewall
**FORWARD** — packets passing through the firewall (not destined for it)

Incoming packets from the internet first hit the **PREROUTING** chain, then are routed to INPUT or FORWARD.

**Prerequisite:** Understand **Linux Gateway** (ip forwarding) and **Route Table** first.

## Step 2: Incoming packet from internet hits PREROUTING

A legitimate HTTP request (port 80) arrives from the internet.

The packet enters the **PREROUTING** chain — the first stop for all incoming packets. PREROUTING handles DNAT (Destination NAT) rules before routing decisions are made.

## Step 3: PREROUTING: No DNAT rule — continue

The PREROUTING chain processes the packet.

**No DNAT rules match** — the destination IP remains unchanged. The kernel now performs a routing decision to determine whether the packet is for this host (INPUT) or needs to be forwarded (FORWARD).

## Step 4: Packet destined for server — use FORWARD chain

The routing decision determines the packet is **not destined for the firewall itself** (destination 10.0.0.100 ≠ firewall IP).

The packet is sent to the **FORWARD chain** for processing.

## Step 5: FORWARD chain: Check rule — ACCEPT if port 80

The FORWARD chain evaluates its rules against the packet:

**Rule 1:** `-p tcp --dport 80 -j ACCEPT`
Match? **YES** — destination port is 80.

Target: **ACCEPT** — the packet is allowed through the firewall.

## Step 6: Rule matched! ALLOW through firewall

The ACCEPT target is reached — the firewall **allows** the packet to continue through the FORWARD chain.

No further rules are evaluated. The packet proceeds to POSTROUTING.

## Step 7: POSTROUTING: No MASQUERADE — continue

The packet reaches the **POSTROUTING** chain — the last stop before leaving the firewall.

**No MASQUERADE or SNAT rules match** — the packet exits with its original source IP intact.

## Step 8: Packet: Firewall → Switch

The firewall forwards the allowed packet to the Switch.

The packet is now on its way to the server — the firewall has done its job of filtering.

## Step 9: Switch forwards to server

The Switch receives the packet and forwards it to the Server (10.0.0.100). The HTTP request is delivered successfully.

## Step 10: Now a MALICIOUS packet arrives (port 22)

A new packet arrives from the internet — this time attempting an **SSH connection** (port 22) to the server.

This is a common attack vector. The firewall must evaluate its rules again.

## Step 11: FORWARD chain: DROP rule matches port 22

The FORWARD chain evaluates its rules:

**Rule 1:** `--dport 80 -j ACCEPT`
Match? NO — port is 22, not 80.

**Rule 2:** `--dport 22 -j DROP`
Match? **YES** — destination port is 22.

Target: **DROP** — the packet is silently discarded.

## Step 12: Packet DROPPED! Never reaches server

The firewall **drops** the malicious SSH packet. It is silently discarded — no response is sent to the attacker.

The server never receives the packet. The attack is blocked.

**Key takeaway:** iptables evaluates rules in order. The first matching rule determines the action (ACCEPT or DROP). Packets that match no rules fall through to the chain's **default policy** (often DROP for FORWARD).

`iptables -L -v` shows the rules with hit counters.
