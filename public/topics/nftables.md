---
name: nftables
description: Modern Linux firewall — the successor to iptables
category: Linux Core Networking
order: 38
---

## Step 1: nftables Tables

nftables organizes firewall rules into **tables** by protocol family:

**ip** — IPv4 rules
**ip6** — IPv6 rules
**inet** — Both IPv4 and IPv6
**arp** — ARP rules

Tables are containers for chains. A single table can hold all your firewall rules for a given protocol family.

## Step 2: Chains

Within each table, **chains** define where rules are evaluated in the packet flow:

**input** — packets destined for the firewall itself
**forward** — packets passing through the firewall
**output** — packets originating from the firewall

Chains are attached to **hooks** (prerouting, input, forward, output, postrouting) that determine when they execute.

## Step 3: Rules & Expressions

Each chain contains an ordered list of **rules**. Each rule has **match conditions** and an **action**:

Example rule:
`tcp dport 22 accept`

This matches TCP packets on port 22 and accepts them. If no rule matches, the chain's **default policy** applies.

## Step 4: nft vs iptables

**nftables** is the modern successor to iptables with key advantages:

**Atomic ruleset changes** — replace entire rulesets without locking
**Better performance** — optimized kernel backend
**Simpler syntax** — more readable configuration
**Native set/map support** — efficient matching of IPs, ports, interfaces
**Unified framework** — replaces iptables, ip6tables, arptables, ebtables

Most modern Linux distributions now use nftables as the default firewall.
