---
name: QUIC
description: UDP-based transport — HTTP/3, 0-RTT, multiplexing
category: Advanced Networking
order: 50
---

## Step 1: TCP + TLS Overhead

Traditional **TCP + TLS 1.3** requires **2-3 round trips** before any application data can be sent:

1. TCP SYN → SYN-ACK (1 RTT)
2. TLS ClientHello → ServerHello + Finished (1 RTT)
3. TLS Finished → ACK (1 RTT)

Only after these handshakes can the HTTP request begin. Each RTT adds latency — especially painful on high-latency connections.

## Step 2: QUIC Speed

**QUIC** runs over **UDP** and integrates TLS 1.3 directly into the protocol.

First connection: **1 RTT** (QUIC combines transport + crypto handshake)
Resuming: **0-RTT** (client can send data immediately using cached crypto params)

QUIC eliminates the TCP+TLS layering overhead by building both into a single protocol.

## Step 3: Stream Multiplexing

**QUIC** supports **multiple independent streams** within a single connection.

Unlike TCP (where one lost packet blocks all data), QUIC streams are **independently multiplexed**. A loss on one stream doesn't affect others.

This eliminates **head-of-line blocking** — a major performance problem in HTTP/2 over TCP.

## Step 4: Per-Stream Recovery

Each QUIC stream has **independent loss detection and recovery**.

If a packet carrying Stream 1 data is lost, only Stream 1 waits for retransmission. Streams 2 and 3 continue uninterrupted.

TCP, by contrast, treats all data as one byte stream — a single lost packet blocks delivery to the application for *all* data.
