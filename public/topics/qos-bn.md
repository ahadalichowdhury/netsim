---
name: QoS
description: Quality of Service — traffic shaping, prioritization, DSCP
category: Advanced Networking
order: 51
---

## Step 1: Classification

**Classification** QoS এর প্রথম step — traffic শনাক্ত করা এবং চিহ্নিত করা।

Packets classify করা হয়:
• **DSCP** (Differentiated Services Code Point) — IP header এ 6-bit field
• **802.1p CoS** (Class of Service) — VLAN tag এ 3-bit field

Classifier এই bits পড়ে এবং প্রতিটি packet কে একটি traffic class এ নির্ধারণ করে।

## Step 2: Queuing

Classification এর পর, packets **priority queues** তে স্থাপন করা হয়:

• **Voice Queue (EF, DSCP 46)** — strict priority, ন্যূনতম latency
• **Video Queue (AF41, DSCP 34)** — weighted fair queuing
• **Data Queue (BE, DSCP 0)** — best effort, ন্যূনতম priority

Queuing algorithms এর মধ্যে আছে **WFQ** (Weighted Fair Queuing), **CBWFQ** (Class-Based WFQ), এবং **LLQ** (Low Latency Queuing)।

## Step 3: Traffic Shaping

**Traffic Shaping** congestion রোধ করতে বহির্গামী traffic এর rate নিয়ন্ত্রণ করে।

মূল mechanisms:
• **Token Bucket** — bucket size পর্যন্ত burst অনুমোদন করে
• **Leaky Bucket** — traffic কে একটি নির্ধারিত rate তে মসৃণ করে
• **WRED** (Weighted Random Early Detection) — queues পূর্ণ হওয়ার আগেই proactive ভাবে packets drop করে, কম priority traffic drop করাকে পছন্দ করে

## Step 4: QoS সারসংক্ষেপ

**QoS** নিশ্চিত করে congestion এর সময় critical traffic priority পায়।

**মূল steps:**
1. **Classify** — DSCP/CoS দিয়ে packets চিহ্নিত করো
2. **Queue** — priority queues (EF, AF, BE) তে স্থাপন করো
3. **Shape** — rates নিয়ন্ত্রণ করো, congestion রোধ করো
4. **Schedule** — voice এর জন্য strict priority, অন্যদের জন্য weighted

QoS ছাড়া, সব traffic সমানভাবে আচরণ করা হয় — file transfers এর সময় voice calls ক্ষতিগ্রস্ত হত।।
