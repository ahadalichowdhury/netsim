---
name: Default Gateway
description: হোস্টগুলো 0.0.0.0/0 default route ব্যবহার করে ইন্টারনেটে কীভাবে পৌঁছায়
category: Networking Fundamentals
order: 12
---

## Step 1: PC Google-এ (8.8.8.8) পৌঁছাতে চায়

**PC** (192.168.1.10) `8.8.8.8`-তে Google অ্যাক্সেস করতে চাইছে।

Destination হলো **ইন্টারনেটে** — স্থানীয় নেটওয়ার্কের অনেক বাইরে। PC-র তার নিজের subnet-এর বাইরে traffic route করার একটি উপায় দরকার।

**পূর্বশর্ত:** আপনাকে প্রথমে **ARP** (MAC address কীভাবে আবিষ্কৃত হয়) এবং **Layer 2** (switch কীভাবে frame forward করে) বোঝো।

**PC 8.8.8.8 কীভাবে জানে?** ব্যবহারকারী `ping 8.8.8.8` টাইপ করেছেন বা একটি DNS server hostname কে এই IP-তে রিজল্ভ করেছে। পুরো যাত্রার জন্য দেখুন **How Networks Start**।

**দেখুনও:** বোঝুন কেন ভিন্ন subnet-এর জন্য gateway দরকার **Subnetting** টপিক।

## Step 2: PC routing table চেক করে — 8.8.8.8-এর জন্য নির্দিষ্ট route নেই

PC 8.8.8.8-তে route-এর জন্য তার **routing table** চেক করে।

এই IP-র জন্য কোনো নির্দিষ্ট route নেই। কিন্তু একটি **default route** আছে:
`0.0.0.0/0 → 192.168.1.1 (Gateway)`

`0.0.0.0/0` এন্ট্রিটি একটি **wildcard** — এটি যেকোনো destination ম্যাচ করে যার জন্য আরও নির্দিষ্ট route নেই।

## Step 3: PC default gateway ব্যবহার করে (0.0.0.0/0 সবকিছু ম্যাচ করে)

Default route `0.0.0.0/0` হলো যেন বলা হচ্ছে "বাকি **সবকিছু** এই gateway-তে পাঠাও।"

এটি একটি **catch-all**-এর নেটওয়ার্ক সমতুল্য। যেকোনো traffic যা স্থানীয় subnet-এর জন্য নয় তা Default Gateway (192.168.1.1)-তে forward করা হয়, যে ইন্টারনেটে পৌঁছাতে জানে।

## Step 4: PC Gateway MAC-তে frame পাঠায়

PC একটি Ethernet frame তৈরি করে যা **Gateway-র MAC**-তে ঠিকানাযুক্ত:

`Src MAC: AA:BB:CC:DD:EE:01 (PC)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Gateway)`

ভিতরের IP packet `8.8.8.8`-কে লক্ষ্য করে, কিন্তু frame হলো Gateway-তে স্থানীয় delivery-র জন্য।

## Step 5: Switch Gateway-তে forward করে

Switch frame পায় এবং destination MAC খুঁজে — Default Gateway-র সাথে সংযুক্ত পোর্টে পাওয়া যায়।

এটি সরাসরি Gateway-তে frame **forward** করে।

## Step 6: Gateway পায়, routing table চেক করে

Default Gateway frame পায়, Ethernet header সরিয়ে দেয় এবং IP destination পরীক্ষা করে: `8.8.8.8`।

এটি তার **routing table** চেক করে এবং তার **eth1 interface** (WAN পাশ) দিয়ে ইন্টারনেটে একটি route খুঁজে পায়।

## Step 7: Gateway-র eth1 দিয়ে ইন্টারনেটে route আছে

Gateway-র routing table দেখায়:
`192.168.1.0/24 → eth0 (LAN পাশ)`
`0.0.0.0/0 → eth1 (WAN → ISP)`

WAN পাশের default route মানে "সব non-local traffic **ISP**-তে পাঠাও।" Gateway TTL হ্রাস করে এবং ইন্টারনেটের জন্য একটি নতুন frame তৈরি করে।

## Step 8: Gateway ইন্টারনেটে forward করে

Gateway তার **WAN interface** (eth1) দিয়ে প্যাকেট ইন্টারনেটের দিকে পাঠায়।

এটি **NAT**-ও সম্পাদন করতে পারে (ব্যক্তিগত source IP তার public IP দিয়ে প্রতিস্থাপন করে), কিন্তু মূল ধারণা হলো Gateway তার default route-র কারণে ইন্টারনেটে পৌঁছাতে জানে।

## Step 9: ইন্টারনেট উত্তর দেয় — Gateway পুনরায় রূপান্তরিত করে

Google (8.8.8.8) উত্তর দেয় এবং reply Gateway-তে পৌঁছায়।

Gateway তার **NAT table** (বা routing table) খুঁজে destination কে PC-র ব্যক্তিগত IP-তে পুনরায় রূপান্তরিত করে: `192.168.1.10`।

## Step 10: Default Gateway PC-তে reply পৌঁছায়

Gateway একটি নতুন frame তৈরি করে এবং reply Switch দিয়ে PC-তে পাঠায়।

**মূল কথা:** একটি **default gateway** হলো স্থানীয় নেটওয়ার্কের বাইরের দরজা। `0.0.0.0/0` route হলো যেকোনো হোস্টের সবচেয়ে গুরুত্বপূর্ণ route — এটি ডিভাইসকে বলে "যদি জানেন না প্যাকেট কোথায় পাঠাতে হবে, এখানে পাঠাও।"

নেটওয়ার্কের প্রতিটি ডিভাইসকে ইন্টারনেটে পৌঁছাতে একটি default gateway দরকার। এটি ছাড়া, PC শুধুমাত্র তার নিজের subnet (192.168.1.0/24)-এর ডিভাইসের সাথে যোগাযোগ করতে পারত।
