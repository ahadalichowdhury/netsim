---
name: VPN Basics
description: Encrypted tunnel — private communication over public networks
category: Networking Fundamentals
order: 36
---

## Step 1: What is a VPN?

A **VPN (Virtual Private Network)** creates an **encrypted tunnel** over a public network.

It allows a remote worker to securely access a private corporate network through the untrusted public internet. All traffic is encrypted end-to-end, so eavesdroppers on the public network cannot read the data.

## Step 2: How VPN Works

The VPN client on the remote worker's machine establishes an **encrypted tunnel** to the VPN server.

Traffic destined for the corporate network (10.0.0.0/8) is **encapsulated** inside an encrypted outer packet. This encrypted packet travels safely over the public internet.

The VPN server on the corporate side **decrypts** the packet and forwards it into the internal network.

## Step 3: VPN Protocols

Two major VPN protocols:

**IPSec** (traditional) — operates at Layer 3, uses IKE for key exchange, provides strong encryption but can be complex to configure.

**WireGuard** (modern) — simpler, faster, and uses state-of-the-art cryptography. Growing rapidly in popularity due to its performance and ease of use.

## Step 4: VPN Use Cases

**Remote Access:** Employees working from home connect securely to the corporate network.

**Site-to-Site:** Two office networks connected via VPN over the internet.

**Privacy:** Encrypting traffic on public WiFi to prevent eavesdropping.

**Bypass Geo-Restrictions:** Accessing content available in other regions by routing through a VPN server in that location.

## Step 5: VPN Summary

**Key takeaway:** VPNs provide encrypted, private communication over public networks.

**Pros:**
• Security — encrypted traffic even on untrusted networks
• Privacy — hides your real IP address from destination servers
• Remote access — securely reach internal resources from anywhere

**Cons:**
• Latency — encryption/decryption adds overhead
• Complexity — requires proper configuration and maintenance
• Not bulletproof — VPN providers can still log traffic
