---
name: Route Table
description: ip route দিয়ে Linux routing decisions
category: Linux Core Networking
order: 22
---

## Step 1: Linux box এ 2 interfaces, 2 route table entries

Linux box এর দুটি network interfaces আছে:
`eth0: 192.168.1.1/24`
`eth1: 10.0.0.1/24`

Kernel একটি **routing table** বজায় রাখে যা destination IP এর উপর ভিত্তি করে packets কোথায় পাঠাতে হবে তা নির্ধারণ করে।

**পূর্বশর্ত:** প্রথমে **Layer 3** (routing decisions) এবং **Gateway** (কীভাবে routers networks সংযুক্ত করে) বুঝে নাও।

**আরও দেখো:** **Routing Table** topic তে conceptual overview।

## Step 2: Packet PC-A (192.168.1.10) থেকে আসে

PC-A (192.168.1.10) Server (8.8.8.8) এর দিকে একটি packet পাঠায়।

Packet টি PC-A থেকে Switch A তে যায়, যা এটিকে Linux box এর eth0 তে forward করবে।

## Step 3: Packet eth0 তে আসে

Switch A packet টি Linux box এর eth0 তে forward করে।

Kernel এখন packet টির মালিক এবং destination IP (8.8.8.8) এর উপর ভিত্তি করে এটি পরবর্তীতে কোথায় পাঠাতে হবে তা সিদ্ধান্ত নিতে হবে।

## Step 4: Kernel destination 8.8.8.8 এর জন্য routing table check করে

Linux kernel তার **routing table** পরামর্শ করে destination 8.8.8.8 এর জন্য একটি match খুঁজে দেখে।

এটি প্রতিটি entry check করে:
• `192.168.1.0/24` → কোনো match নেই (8.8.8.8 এই subnet তে নেই)
• `10.0.0.0/24` → কোনো match নেই (8.8.8.8 এই subnet তে নেই)

কোনো specific route match করে নি — kernel একটি **default route** খুঁজে দেখে।

## Step 5: Match: 0.0.0.0/0 via 10.0.0.1 (default route)

Kernel **default route** (0.0.0.0/0) খুঁজে পায় — একটি catch-all entry যা যেকোনো destination match করে।

Default gateway হলো `10.0.0.1`, যা Linux box এর নিজের eth1 interface। Packet টি **eth1** দিয়ে বের হতে হবে।

## Step 6: Kernel packet টি eth1 তে forward করে

Routing decision এর উপর ভিত্তি করে, kernel packet টি eth0 থেকে eth1 তে **forward** করে।

Packet টি এখন দুটি interface এর মধ্যে রুট হচ্ছে — Linux box একটি **router** হিসাবে কাজ করছে।

## Step 7: Packet: eth1 → Switch B

Packet টি eth1 (10.0.0.1) থেকে বের হয় এবং Switch B তে যায়।

Packet টি এখন 10.0.0.0/24 network তে আছে, destination 8.8.8.8 এর দিকে যাচ্ছে।

## Step 8: Switch B server তে forward করে

Switch B packet টি গ্রহণ করে এবং তার forwarding table এর উপর ভিত্তি করে Server (8.8.8.8) তে forward করে।

## Step 9: Routing decision সারসংক্ষেপ

Packet টি 192.168.1.0/24 network থেকে 10.0.0.0/24 network তে সফলভাবে রুট হয়েছে।

**মূল steps:**
1. Packet PC-A থেকে eth0 তে এসেছে
2. Kernel destination 8.8.8.8 এর জন্য routing table check করেছে
3. কোনো specific route match করেনি — **default route** ব্যবহার হয়েছে
4. Packet eth1 তে forward হয়ে এবং server তে পৌঁছেছে

`ip route` command kernel এর routing table দেখায়।

## Step 10: ip route kernel এর routing table দেখায়

`ip route` command routing table প্রদর্শন করে:

`192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.1`
`10.0.0.0/24 dev eth1 proto kernel scope link src 10.0.0.1`
`default via 10.0.0.1 dev eth1`

**মূল কথা:** Linux forwarding decisions করতে তার routing table ব্যবহার করে। Default route (0.0.0.0/0) হলো fallback যখন কোনো specific route destination match করে না।
