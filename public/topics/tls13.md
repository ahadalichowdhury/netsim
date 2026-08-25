---
name: TLS 1.3
description: Modern encryption — faster, simpler, more secure handshake
category: Advanced Networking
order: 47
---

## Step 1: 1-RTT Handshake

**TLS 1.3** completes the handshake in **1 round trip (1-RTT)**.

Compare to TLS 1.2 which needed **2 round trips**:

**TLS 1.2:**
1. ClientHello → ServerHello
2. Certificate + ServerKeyExchange → ClientKeyExchange
3. ChangeCipherSpec + Finished (both sides)

**TLS 1.3:**
1. ClientHello (with key share) → ServerHello (with key share)
2. Finished (encrypted)

**Result:** Faster connection establishment, especially on high-latency networks.

## Step 2: Key Exchange

**DH key shares** are included in the **first message**.

In TLS 1.3, the client includes its **Diffie-Hellman key share** in the ClientHello. The server responds with its key share in ServerHello.

**Forward secrecy is mandatory** — every connection uses ephemeral keys that are destroyed after use. Even if the server’s private key is compromised later, past sessions cannot be decrypted.

**Removed:** RSA key exchange (no forward secrecy) is no longer allowed.

## Step 3: Cipher Suites

TLS 1.3 **drastically reduces** the number of cipher suites.

**TLS 1.3 only allows 5 cipher suites:**
• `TLS_AES_256_GCM_SHA384`
• `TLS_AES_128_GCM_SHA256`
• `TLS_CHACHA20_POLY1305_SHA256`
• `TLS_AES_128_CCM_SHA256`
• `TLS_AES_128_CCM_8_SHA256`

**Removed insecure ciphers:**
• RSA key exchange
• CBC mode ciphers
• RC4, 3DES, DES
• SHA-1

**Result:** Smaller attack surface, fewer configuration mistakes.

## Step 4: 0-RTT Resumption

**0-RTT (Zero Round Trip)** allows instant reconnection.

When a client reconnects to a server it has visited before:
• The server provides a **Pre-Shared Key (PSK)** during the first connection
• On reconnect, the client sends the PSK + encrypted data **immediately**
• No handshake needed — data flows instantly

**Trade-off:** 0-RTT data is **not replay-protected**. An attacker could capture and replay the 0-RTT data. Use for idempotent requests only.

## Step 5: TLS 1.3 vs 1.2

**Key differences between TLS 1.3 and 1.2:**

**Removed in TLS 1.3:**
• RSA key exchange (no forward secrecy)
• CBC mode ciphers (BEAST, Lucky13 attacks)
• SHA-1 (collision attacks)
• RC4, 3DES, DES (weak encryption)
• Compression (CRIME attack)
• Renegotiation (security issues)

**Added in TLS 1.3:**
• 0-RTT resumption
• 1-RTT handshake (vs 2-RTT)
• Mandatory forward secrecy
• Encrypted handshake (most of ServerHello is now encrypted)
• Simplified cipher suites (5 vs dozens)

**Result:** Faster, simpler, and significantly more secure.
