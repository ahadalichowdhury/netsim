---
name: QoS
description: Quality of Service — traffic shaping, prioritization, DSCP
category: Advanced Networking
order: 51
---

## Step 1: Classification

**Classification** is the first step of QoS — identifying and marking traffic.

Packets are classified using:
• **DSCP** (Differentiated Services Code Point) — 6-bit field in the IP header
• **802.1p CoS** (Class of Service) — 3-bit field in the VLAN tag

The classifier reads these bits and assigns each packet to a traffic class.

## Step 2: Queuing

After classification, packets are placed into **priority queues**:

• **Voice Queue (EF, DSCP 46)** — strict priority, lowest latency
• **Video Queue (AF41, DSCP 34)** — weighted fair queuing
• **Data Queue (BE, DSCP 0)** — best effort, lowest priority

Queuing algorithms include **WFQ** (Weighted Fair Queuing), **CBWFQ** (Class-Based WFQ), and **LLQ** (Low Latency Queuing).

## Step 3: Traffic Shaping

**Traffic Shaping** controls the rate of outgoing traffic to prevent congestion.

Key mechanisms:
• **Token Bucket** — allows bursts up to bucket size
• **Leaky Bucket** — smooths traffic to a fixed rate
• **WRED** (Weighted Random Early Detection) — proactively drops packets before queues fill up, preferring to drop low-priority traffic

## Step 4: QoS Summary

**QoS** ensures critical traffic gets priority during congestion.

**Key steps:**
1. **Classify** — mark packets with DSCP/CoS
2. **Queue** — place into priority queues (EF, AF, BE)
3. **Shape** — control rates, prevent congestion
4. **Schedule** — strict priority for voice, weighted for others

Without QoS, all traffic is treated equally — voice calls would suffer during file transfers.
