---
name: MTU
description: Maximum Transmission Unit — নেটওয়ার্ক যে সর্বোচ্চ packet আকার অনুমোদন করে
category: Components
order: 10
---

## Step 1: MTU কী?

**MTU (Maximum Transmission Unit)** হলো বিভাজন ছাড়াই সর্বোচ্চ Layer 2 payload আকার যেটি প্রেরণ করা যায়।

সাধারণ MTU মান:
• **Ethernet:** 1500 bytes (স্ট্যান্ডার্ড)
• **Jumbo frame:** 9000 bytes (ডেটা সেন্টার)
• **Loopback:** 65535 bytes (Linux)
• **PPP over Ethernet (PPPoE):** 1492 bytes (2 bytes সংরক্ষিত)

যদি একটি packet MTU অতিক্রম করে, এটাকে অবশ্যই বিভাজন করতে হবে বা ফেলে দিতে হবে।

## Step 2: সাধারণ MTU

বিভিন্ন নেটওয়ার্ক প্রযুক্তির বিভিন্ন MTU সীমা আছে:

`Ethernet:     1500 bytes`
`Jumbo Frame:  9000 bytes`
`PPPoE:        1492 bytes`
`Wi-Fi:        2304 bytes (802.11)`
`Loopback:     65535 bytes (Linux)`

1500 bytes-এর স্ট্যান্ডার্ড Ethernet MTU হলো সবচেয়ে বেশি দেখা যাওয়া সীমা। Jumbo frame high-throughput storage এবং clustering traffic-এর জন্য ডেটা সেন্টারে ব্যবহৃত হয়।

## Step 3: বিভাজন

যখন একটি packet MTU অতিক্রম করে, এটাকে ছোট অংশে **বিভাজন** করতে হয়।

একটি 4000-byte packet 1500-byte Ethernet MTU-তে ফিট করার জন্য ভাগ করতে হবে:
• **Fragment 1:** 1500 bytes (offset 0)
• **Fragment 2:** 1500 bytes (offset 1500)
• **Fragment 3:** 1000 bytes (offset 3000)

প্রতিটি fragment নিজের IP header সহ একটি স্বাধীন packet। গ্রাহক **Identification**, **Fragment Offset**, এবং **More Fragments (MF)** flag ব্যবহার করে সেগুলো পুনর্গঠন করে।

বিভাজন overhead যোগ করে এবং কর্মদক্ষতার সমস্যা সৃষ্টি করতে পারে।

## Step 4: Path MTU Discovery

**Path MTU Discovery (PMTUD)** সম্পূর্ণ পথে বিভাজন ছাড়াই বৃহত্তম MTU খুঁজে বের করে।

কিভাবে কাজ করে:
1. প্রেরক IP header-এ **DF (Don't Fragment)** bit সেট করে
2. যদি একটি router packet ফরওয়ার্ড করতে না পারে (খুব বড়, DF=1), সে এটা ফেলে দেয় এবং একটি **ICMP Fragmentation Needed** message (Type 3, Code 4) পাঠায়
3. প্রেরক packet-এর আকার কমায় এবং আবার চেষ্টা করে
4. এটা চলতে থাকে packet ডেস্টিনেশনে পৌঁছানো পর্যন্ত

PMTUD সম্পূর্ণভাবে বিভাজন এড়িয়ে যায়, যার ফলে কর্মদক্ষতা বৃদ্ধি পায়। এটা TCP অ্যাপ্লিকেশনের জন্য পছন্দের পদ্ধতি।
