---
name: MPLS
description: Label switching — IP lookup ছাড়াই দ্রুত ফরওয়ার্ডিং
category: Advanced Networking
order: 41
---

## Step 1: FEC — Forwarding Equivalence Class

**FEC (Forwarding Equivalence Class)** একইভাবে ফরওয়ার্ড হওয়া packetগুলোকে একসাথে গ্রুপ করে — একই পথ, একই সেবা, একই QoS।

FEC-র সব packet ingress LSR-তে **একই label** পায়। এটা traffic-কে destination prefix, VPN, বা traffic engineering নীতি অনুযায়ী গ্রুপ করে।

**মূল পয়েন্ট:**
• একই FEC-র packet = একই label = একই পথ
• FEC destination IP, QoS, বা VPN-এর ভিত্তিতে হতে পারে
• ফরওয়ার্ডিং সিদ্ধান্ত সরল করে

## Step 2: Label Push (Ingress)

**Ingress LSR (Label Switch Router)** একটি IP packet গ্রহণ করে এবং একটি **label push** সম্পন্ন করে — packet-এ একটি MPLS label যোগ করে।

Labelটি 20-bit মান যেটা FEC নির্ধারণ করে। Packetটি এখন একটি MPLS frame এবং IP lookup-এর বদলে label switching দ্বারা ফরওয়ার্ড হবে।

**MPLS Label ফরম্যাট:**
• Label (20 bit) — FEC নির্ধারণ করে
• TC (3 bit) — Traffic Class (QoS)
• S (1 bit) — Stack-এর তলা
• TTL (8 bit) — Hop সীমা

## Step 3: Label Swap (Transit)

**Mid LSR** লেবেলযুক্ত packet গ্রহণ করে এবং একটি **label swap** সম্পন্ন করে — আগমনকারী label কে পরবর্তী hop-এর জন্য বহিঃগামী label দিয়ে প্রতিস্থাপন করে।

এটাই MPLS switching-এর মূলক: LSR তার **LFIB (Label Forwarding Information Base)**-তে আগমনকারী label খুঁজে দেখে এবং পরবর্তী label-তে swap করে।

**মূল পয়েন্ট:**
• আগমনকারী label দিয়ে LFIB lookup
• পরবর্তী hop-এর জন্য label swap
• কোনো IP header পরীক্ষার প্রয়োজন নেই — দ্রুত!

## Step 4: Label Pop (Egress)

**Egress LSR** লেবেলযুক্ত packet গ্রহণ করে এবং একটি **label pop** সম্পন্ন করে — MPLS label সরিয়ে দেয় এবং মূল IP packet ফরওয়ার্ড করে।

যখন দ্বিতীয়-শেষ LSR label pop করে, তাকে **PHP (Penultimate Hop Popping)** বলে — egress LSR-কে তারপর শুধু সাধারণ IP lookup করতে হয়।

**মূল পয়েন্ট:**
• MPLS label সরিয়ে দিন
• IP lookup দিয়ে ফরওয়ার্ড করুন (সাধারণ রাউটিং)
• PHP শেষ hop-টি অপ্টিমাইজ করে

## Step 5: MPLS সারসংক্ষেপ

**মূল কথা:** MPLS প্রতিটি hop-তে IP header পরীক্ষা ছাড়াই দ্রুত label-ভিত্তিক ফরওয়ার্ডিং প্রদান করে।

**Label অপারেশন:**
• **Push** — Ingress label যোগ করে
• **Swap** — Transit router label পরিবর্তন করে
• **Pop** — Egress label সরিয়ে দেয়

**LSR ধরন:**
• **Ingress LER** — IP packet-এ label push করে
• **Transit LSR** — Label swap করে (দ্রুত switching)
• **Egress LER** — Label pop করে, IP দিয়ে ফরওয়ার্ড করে

**ব্যবহারের ক্ষেত্র:**
• MPLS VPN (L3VPN, L2VPN)
• Traffic engineering
• Fast reroute (FRR)
• QoS differentiation
