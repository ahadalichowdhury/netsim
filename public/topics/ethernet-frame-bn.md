---
name: Ethernet Frame
description: ডেটা কন্টেইনার — তারের জন্য বিট কীভাবে প্যাকেজ করা হয়
category: Components
order: 8
---

## Step 1: Preamble

**Preamble** হলো Ethernet frame এর প্রথম ফিল্ড — 7 বাইটের alternating 1s এবং 0s (10101010 pattern)।

এর উদ্দেশ্য হলো **সমন্বয় (synchronization)**। এটি প্রাপক NIC কে আসল frame শুরু হওয়ার আগে সিগনালের timing এ লক করার সময় দেয়।

Preamble এর পরে থাকে **SFD (Start Frame Delimiter)**, একটি 1-বাইট ফিল্ড যা "আসল frame এখন শুরু হচ্ছে" সংকেত দেয়।

## Step 2: Destination MAC

**Destination MAC address** নির্ধারণ করে frame টি কার জন্য — 6 বাইট (48 বিট)।

বিশেষ মান:
• `FF:FF:FF:FF:FF:FF` — broadcast, সব ডিভাইস দ্বারা গৃহীত
• Multicast address — একটি ডিভাইসের গোষ্ঠী দ্বারা গৃহীত
• Unicast — একটি নির্দিষ্ট NIC এর ঠিকানা

যদি destination একই নেটওয়ার্কে থাকে, তাহলে frame সরাসরি যায়। যদি ভিন্ন নেটওয়ার্কে থাকে, তাহলে এটি default gateway (router) এ যায়।

## Step 3: Source MAC

**Source MAC address** নির্ধারণ করে frame টি কে পাঠিয়েছে — 6 বাইট (48 বিট)।

Switches source MAC ব্যবহার করে **শিখে** যে কোন ডিভাইস কোন port এ আছে। যখন একটি switch একটি frame পায়, তখন এটি source MAC এবং ইনকামিং port কে নিজস্ব MAC address table এ রেকর্ড করে।

Source MAC **সবসময়** unicast address হয় (কখনও broadcast বা multicast হয় না)।

## Step 4: EtherType

**EtherType** ফিল্ড নির্ধারণ করে payload এ কোন protocol encapsulate করা হয়েছে — 2 বাইট।

সাধারণ মান:
• `0x0800` — IPv4
• `0x0806` — ARP
• `0x86DD` — IPv6

এই ফিল্ড প্রাপক ডিভাইসকে বলে payload কীভাবে বুঝতে হবে। যদি payload একটি IPv4 packet হয়, তাহলে NIC এটিকে IPv4 stack এর দিকে পাঠায়।

## Step 5: Payload

**Payload** আসল ডেটা ধারণ করে যা প্রেরিত হচ্ছে — 46 থেকে 1500 বাইট।

এটি সাধারণত একটি **IP packet**, কিন্তু EtherType ফিল্ড দ্বারা নির্দেশিত হিসেবে ARP, IPv6 বা অন্য protocol ও হতে পারে।

যদি ডেটা 46 বাইটের চেয়ে ছোট হয়, তাহলে ন্যূনতম Ethernet frame সাইজ (মোট 64 বাইট) পূরণ করার জন্য এটিকে padded করা হয়। 1500 বাইটের সর্বোচ্চ হলো **MTU** (Maximum Transmission Unit)।

## Step 6: Frame Check Sequence

**FCS (Frame Check Sequence)** হলো error detection এর জন্য ব্যবহৃত 4-বাইটের CRC (Cyclic Redundancy Check)।

প্রেরক সম্পূর্ণ frame এর (preamble এবং SFD বাদ দিয়ে) উপর একটি CRC মান গণনা করে এবং এটিকে সংযুক্ত করে। প্রাপক CRC পুনরায় গণনা করে এবং তুলনা করে — যদি মিল না হয়, frame টি **চুপচাপ বর্জিত** হয়।

FCS সনাক্ত করে:
• বৈদ্যুতিক noise থেকে bit flip
• Truncated frame
• প্রেরণাকালীন ত্রুটিপূর্ণ ডেটা

FCS সব ত্রুটি সনাক্ত বা সংশোধন করে না — এটি একটি best-effort check।