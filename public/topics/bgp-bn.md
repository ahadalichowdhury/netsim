---
name: BGP
description: ইন্টারনেটের routing protocol — autonomous system কীভাবে route exchange করে
category: Advanced Networking
order: 39
---

## Step 1: eBGP — ASes-এর মধ্যে

**eBGP (External BGP)** হলো সেই protocol যা **বিভিন্ন Autonomous System-এর মধ্যে** routing তথ্য exchange করতে ব্যবহৃত হয়।

প্রতিটি AS হলো একটি একক administrative domain (ISP, enterprise, cloud provider) অধীনে একটি নেটওয়ার্ক। eBGP peers সরাসরি সংযুক্ত link-এ বসে এবং তাদের prefix বিজ্ঞাপন দেয়।

**মূল কথা:**
• উভয় পাশে ভিন্ন AS number
• সরাসরি সংযুক্ত interface (ডিফল্টে TTL=1)
• ISP boundary-র মধ্যে route শেয়ার করতে ব্যবহৃত হয়

## Step 2: iBGP — AS-এর ভেতরে

**iBGP (Internal BGP)** eBGP-এর মাধ্যমে শেখা route **একটি একক Autonomous System-এর ভেতরে** বিতরণ করে।

যখন AS 100 eBGP-এর মাধ্যমে AS 300 থেকে একটি route শেখে, iBGP সেই route AS 100-এর ভেতরে সব router-এ ছড়িয়ে দেয় (AS 200 সহ)।

**মূল কথা:**
• উভয় পাশে একই AS number
• Route reflector full-mesh প্রয়োজনীয়তা কমায়
• নিশ্চিত করে যে অভ্যন্তরীণ routerগুলো বাইরের route জানে

## Step 3: AS_PATH Attribute

**AS_PATH** হলো একটি বাধ্যতামূলক BGP attribute যা একটি route যেসব AS দিয়ে গেছে তার তালিকা দেয়।

`AS_PATH: [AS300, AS100, AS200]`

এটি দুটি উদ্দেশ্য পূরণ করে:
**1. Loop prevention** — যদি একটি router তার নিজের AS path-এ দেখে, তাহলে route প্রত্যাখ্যান করে।
**2. Path selection** — ছোট AS_PATH বেশি পছন্দযোগ্য (কম hop count)।

BGP একটি **path-vector** protocol — এটি পুরো AS path বহন করে, শুধুমাত্র একটি distance metric নয়।

## Step 4: BGP Path Selection

BGP একটি **decision process** ব্যবহার করে সেরা route নির্বাচন করে যাতে একাধিক attribute থাকে, ক্রমানুসারে মূল্যায়ন করা হয়:

**1. Weight** (Cisco) — স্থানীয় পছন্দ, সর্বোচ্চ জিতে
**2. Local Preference** — সর্বোচ্চ জিতে
**3. AS_PATH length** — সবচেয়ে ছোট জিতে
**4. Origin** — IGP < EGP < Incomplete
**5. MED (Multi-Exit Discriminator)** — সবচেয়ে কম জিতে

শুধুমাত্র **best path** routing table-এ স্থাপিত হয় এবং peers-কে বিজ্ঞাপিত হয়।

## Step 5: BGP সারসংক্ষেপ

**মূল কথা:** BGP হলো সেই protocol যা ইন্টারনেটকে কাজ করায়।

**দুই ধরন:**
• **eBGP** — ভিন্ন ASes-এর মধ্যে (ISP peering, customer/provider)
• **iBGP** — একটি একক AS-এর ভেতরে (route distribution)

**Path attributes:**
• AS_PATH — loop prevention এবং path length
• Local Pref — বহিঃগামী path selection
• MED — প্রবেশ path suggestion
• Weight — শুধুমাত্র স্থানীয় পছন্দ

**ব্যবহার:**
• ISP peering এবং transit
• Enterprise multi-homing
• Cloud provider connectivity
• VPN এবং traffic engineering
