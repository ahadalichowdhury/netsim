---
name: WireGuard
description: Modern VPN — fast, simple, secure tunnel protocol
category: Advanced Networking
order: 48
---

## Step 1: Peer-to-Peer

**WireGuard** operates as a **mesh VPN** — peers connect directly to each other.

**No central server needed** (though one can be used for coordination):
• Each peer has a pair of cryptographic keys
• Peers communicate directly when possible
• NAT traversal is handled automatically

**Traditional VPN:** All traffic routes through a central server.
**WireGuard:** Peers establish direct encrypted tunnels when they can reach each other.

## Step 2: Noise Protocol

**Noise Protocol Framework** — the foundation of WireGuard.

The **IK (Init with known responder)** handshake pattern:
1. Initiator sends: ephemeral key + encrypted static key + encrypted payload
2. Responder replies: ephemeral key + encrypted payload + MAC

**Encryption:**
• **ChaCha20** — stream cipher for data encryption
• **Poly1305** — MAC for message authentication
• **Curve25519** — elliptic curve for key exchange

**Result:** Complete handshake in just **1 round trip** — 1-RTT.

## Step 3: Key Management

**Static + ephemeral keys** provide both identity and forward secrecy.

**Static keys:**
• Long-term public/private key pair per peer
• Used for peer identification
• Distributed out-of-band (config files)

**Ephemeral keys:**
• Generated fresh for each session
• Used for key derivation during handshake
• Destroyed after use

**Result:** Even if a static key is compromised, past sessions remain secure (forward secrecy).

## Step 4: Roaming & Mobility

**Auto peer discovery** and seamless IP changes.

WireGuard handles network changes automatically:
• **Auto peer discovery** — peers find each other without static configuration
• **IP changes handled seamlessly** — if a peer’s IP changes (e.g., switching WiFi to cellular), the tunnel continues uninterrupted
• **NAT traversal** — built-in hole punching for peers behind NAT

**Why it works:** WireGuard identifies peers by their public key, not their IP address. As long as the key is the same, the peer can appear from any IP.
