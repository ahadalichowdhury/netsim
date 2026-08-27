---
name: MAC Address - ভৌত ঠিকানা
description: MAC Address কী, কেমন তৈরি হয়, Unicast/Broadcast/Multicast কী — সব বাংলায় সহজ করে বোঝানো হয়েছে
---

# MAC Address — ভৌত ঠিকানা

আজ দেখবো MAC Address কী এবং এটা নেটওয়ার্কিং-এ কেন এত গুরুত্বপূর্ণ।

## Step 1: MAC Address কী

MAC (Media Access Control) Address হলো তোমার Network Interface Card (NIC)-র ভৌত ঠিকানা। এটা তৈরি হয় ফ্যাক্টরিতে — এবং সাধারণত পরিবর্তন হয় না। যদি তোমার laptop-এ WiFi adapter এবং Ethernet port দুটো আছে, তাহলে দুটোরই আলাদা MAC address আছে।

## Step 2: MAC Address-এর Format

MAC address দেখতে এরকম হয়:

```
AA:BB:CC:DD:EE:FF
```

- ৬টা হেক্সাডেসিমাল গ্রুপ (মোট ১২ অক্ষর)
- প্রতিটা গ্রুপ ২ বাইট (৮ বিট)
- মোট ৪৮ বিট — 281 ট্রিলিয়ন+ সম্ভাব্য এড্রেস!

## Step 3: OUI — কোম্পানির চিহ্ন

MAC address-এর প্রথম ৩টা গ্রুপ (৬ অক্ষর) হলো **OUI (Organizationally Unique Identifier)**। এটা বলে দেয় কোন কোম্পানি এই NIC তৈরি করেছে।

উদাহরণ:
- `00:50:56` → VMware
- `08:00:27` → Oracle (VirtualBox)
- `B8:27:EB` → Raspberry Pi

তুমি যদি MAC `08:00:27:AA:BB:CC` দেখো, তাহলে জানো এটা VirtualBox-এর VM।

## Step 4: NIC ID — শেষ ৩টা গ্রুপ

MAC address-এর শেষ ৩টা গ্রুপ (৬ অক্ষর) হলো **NIC Identifier** — এটা নির্দিষ্ট NIC-র জন্য বিশেষ। কোম্পানি প্রতিটা NIC-কে একটা অনন্য ID দেয়। দুটো NIC-র একই MAC address হওয়ার সম্ভাবনা অনেক কম।

## Step 5: Unicast MAC

**Unicast** মানে একটা source থেকে একটা destination-এ প্যাকেট যায়। MAC address-এর প্রথম বিট 0 হলে এটা unicast।

উদাহরণ: `AA:BB:CC:DD:EE:01` → শেষ বিট `01` — binary `00000001`, প্রথম বিট 0 = Unicast।

সুইচ যখন জানে MAC address কোন পোর্টে আছে, তখন শুধু সেই পোর্টে প্যাকেট পাঠায় — এটাই unicast।

## Step 6: Broadcast MAC

**Broadcast** মানে প্যাকেটটা নেটওয়ার্কের সবাই পাবে। Broadcast MAC address হলো:

```
FF:FF:FF:FF:FF:FF
```

সব বিট 1। সুইচ broadcast ফ্রেমটাকে সব পোর্টে পাঠায়। ARP Request, DHCP Discover — এগুলো broadcast হয়।

## Step 7: Multicast MAC

**Multicast** হলো একটা গ্রুপ অফ ডিভাইসকে প্যাকেট পাঠানো — সবাইকে নয়, শুধু নির্দিষ্ট গ্রুপকে। MAC address-এর প্রথম বিট 1 এবং শেষ বিট 1 হলে multicast।

উদাহরণ: `01:00:5E:00:00:01` — এটা IPv4 multicast এড্রেস।

Multicast ব্যবহার হয় ভিডিও স্ট্রিমিং, অনলাইন গেমিং — যেখানে একটা source থেকে অনেকে একসাথে ডেটা পায়।

## Step 8: সারসংক্ষেপ

MAC Address-এর মূল কথা:

- **ভৌত ঠিকানা:** NIC-র ফ্যাক্টরি-সেট এড্রেস
- **Format:** ১২ হেক্সাডেসিমাল অক্ষর (`AA:BB:CC:DD:EE:FF`)
- **OUI:** প্রথম ৩ গ্রুপ — কোম্পানির চিহ্ন
- **Unicast:** একটা ↔ একটা (সবচেয়ে সাধারণ)
- **Broadcast:** সবাইকে (`FF:FF:FF:FF:FF:FF`)
- **Multicast:** একটা গ্রুপকে

Layer 2-তে ডেটা পাঠানোর জন্য MAC address ছাড়া চলে না!
