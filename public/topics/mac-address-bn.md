---
name: MAC Address
description: ভৌতিক ঠিকানা — প্রতিটি NIC-তে পোড়ানো অনন্য ID
category: Components
order: 0
---

## Step 1: MAC Address কী?

**MAC (Media Access Control)** address হলো প্রতিটি Network Interface Card (NIC)-তে প্রস্তোতক দ্বারা পোড়ানো একটি **ভৌতিক ঠিকানা**।

এটা OSI model-এর **Layer 2** (Data Link layer)-তে কাজ করে এবং স্থানীয় নেটওয়ার্ক segment-এ ডিভাইস সনাক্ত করতে ব্যবহৃত হয়।

IP address-এর বিপরীতে (যেগুলো যুক্তিসঙ্গত এবং পরিবর্তন হতে পারে), MAC address একটি **স্থায়ী হার্ডওয়্যার পরিচয়ক** — যদিও সফটওয়্যারে এটা স্পুফ করা যেতে পারে।

## Step 2: MAC Address ফরম্যাট

MAC address একটি **48-bit (6-byte)** সংখ্যা যেটা hexadecimal-এ লেখা হয়:

`AA:BB:CC:DD:EE:FF`

প্রতিটি hex সংখ্যার জোড়া একটি byte নির্দেশ করে। প্রথম 3 byte **ভেন্ডর (OUI)** নির্দেশ করে, এবং শেষ 3 byte **নির্দিষ্ট ডিভাইস** নির্দেশ করে।

## Step 3: OUI — ভেন্ডর পরিচয়ক

MAC address-এর প্রথম **3 byte (24 bit)** **OUI (Organizationally Unique Identifier)** গঠন করে।

`AA:BB:CC` ← OUI প্রস্তোতককে চেনায়

IEEE (Institute of Electrical and Electronics Engineers) কোম্পানিগুলোকে OUI বরাদ্দ করে। উদাহরণস্বরূপ:
• Intel: `00:1B:21`
• Cisco: `00:1A:A0`
• Apple: `3C:22:FB`

## Step 4: NIC ID — ডিভাইস পরিচয়ক

শেষ **3 byte (24 bit)** **NIC ID** গঠন করে — প্রস্তোতক দ্বারা নির্ধারিত একটি অনন্য পরিচয়ক।

`DD:EE:FF` ← NIC ID (ডিভাইস-নির্দিষ্ট)

OUI-র সাথে মিলিয়ে, এটা একটি বিশ্বব্যাপী অনন্য ঠিকানা তৈরি করে। প্রতি OUI-তে 2²⁴ (16.7 মিলিয়ন) সম্ভাব্য NIC ID থাকায়, প্রস্তোতকদের কখনো শেষ হয়ে যায় না।

## Step 5: Unicast MAC

**Unicast** MAC address নেটওয়ার্কে একটি **একক ডিভাইস** নির্দেশ করে।

প্রথম byte-এর **সবচেয়ে কম গুরুত্বপূর্ণ bit** **জোড়া (0)**:
`AA:BB:CC:DD:EE:02` → Unicast

যখন একটি frame unicast address-তে পাঠানো হয়, শুধু সেই MAC-ওয়ালা ডিভাইসটাই এটা গ্রহণ করবে। এটাই সবচেয়ে সাধারণ MAC address ধরন।

## Step 6: Broadcast MAC

**Broadcast** MAC address হলো `FF:FF:FF:FF:FF:FF` — সব bit 1 সেট করা।

যখন একটি frame এই address-তে পাঠানো হয়, স্থানীয় নেটওয়ার্ক segment-ের **প্রতিটি ডিভাইস** এটা প্রসেস করবে।

Broadcast MAC ব্যবহৃত হয়:
• ARP request ("এই IP কার?")
• DHCP discovery ("আমাকে একটা IP লাগবে!")
• নেটওয়ার্ক ঘোষণা

## Step 7: Multicast MAC

**Multicast** MAC address একটি **ডিভাইস গ্রুপ** নির্দেশ করে।

প্রথম byte-এর **সবচেয়ে কম গুরুত্বপূর্ণ bit** **বিজোড়া (1)**:
`01:00:5E:xx:xx:xx` → IPv4 Multicast
`33:33:xx:xx:xx:xx` → IPv6 Multicast

Multicast একজন প্রেরককে সকলকে ব্রডকাস্ট না করেই একাধিক গ্রাহকের কাছে দক্ষতার সাথে পৌঁছাতে দেয়।

## Step 8: MAC Address সারসংক্ষেপ

**মূল কথা:** MAC address Layer 2 যোগাযোগের ভিত্তি।

• **48-bit** hexadecimal address (যেমন, AA:BB:CC:DD:EE:FF)
• **OUI** (প্রথম 3 byte) = ভেন্ডর পরিচয়ক
• **NIC ID** (শেষ 3 byte) = ডিভাইস পরিচয়ক
• **Unicast** = একক ডিভাইস (প্রথম byte জোড়া)
• **Broadcast** = সব ডিভাইস (FF:FF:FF:FF:FF:FF)
• **Multicast** = ডিভাইস গ্রুপ (প্রথম byte বিজোড়া)

সুইচ MAC address ব্যবহার করে frame ফরওয়ার্ড করে। ARP IP address কে MAC address-তে ম্যাপ করে।
