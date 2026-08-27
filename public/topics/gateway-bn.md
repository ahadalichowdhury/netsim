---
name: Gateway
description: Router কীভাবে বিভিন্ন নেটওয়ার্কের মধ্যে gateway হিসেবে কাজ করে
category: Networking Fundamentals
order: 13
---

## Step 1: PC-A Server (10.0.0.20) এ পৌঁছাতে চায়

**PC-A** (192.168.1.10) কে **Server** (10.0.0.20) তে ডেটা পাঠাতে হবে।

এই দুটি ডিভাইস **সম্পূর্ণ ভিন্ন নেটওয়ার্কে** আছে:
• PC-A: 192.168.1.0/24
• Server: 10.0.0.0/24

PC-A সরাসরি Server এ frame পাঠাতে পারে না — এর জন্য একটি **gateway** (router) এর সাহায্য প্রয়োজন।

**পূর্বশর্ত:** প্রথমে **Default Gateway** (hosts অন্য নেটওয়ার্কে কীভাবে পৌঁছায়) এবং **ARP** (MAC address কীভাবে resolve হয়) বুঝুন।

**PC-A Server এর IP কীভাবে জানে?** Application এ এটি configure করা আছে, অথবা DNS একটি hostname resolve করেছে। ব্যবহারকারীর কাজ থেকে প্রথম packet পর্যন্ত সম্পূর্ণ শৃঙ্খলের জন্য **How Networks Start** দেখুন।

**আরও দেখুন:** Routing decisions এবং নেটওয়ার্ক boundary এর জন্য **Routing Table** এবং **Subnetting** টপিক।

## Step 2: PC-A চেক করে: 10.0.0.20 আমার subnet এ নেই

PC-A destination IP কে তার নিজস্ব subnet এর সাথে তুলনা করে:

`Destination: 10.0.0.20`
`My subnet: 192.168.1.0/24`

নেটওয়ার্গুলো মিলছে না — Server **remote**। PC-A অবশ্যই frame টি তার **default gateway** (Router at 192.168.1.1) এ পাঠাতে হবে।

## Step 3: PC-A default gateway (Router) কে frame পাঠায়

PC-A **Router এর MAC**কে Layer 2 destination হিসেবে রেখে একটি Ethernet frame তৈরি করে।

ভেতরের IP packet এখনও **Server এর IP**কে চূড়ান্ত destination হিসেবে রাখে — কিন্তু frame টি স্থানীয় ডেলিভারির জন্য **Router** কে ঠিকানা করা হয়েছে।

## Step 4: Switch Router কে ফরওয়ার্ড করে

Switch frame পায় এবং destination MAC (AA:BB:CC:DD:EE:FF) খুঁজে বের করে।

এটি Router কে সংযুক্ত port এ খুঁজে পায় এবং frame টি **সরাসরি ফরওয়ার্ড** করে।

## Step 5: Router eth0 (192.168.1.1) এ গ্রহণ করে

Router তার **eth0 interface** (192.168.1.1) এ frame গ্রহণ করে — 192.168.1.0/24 নেটওয়ার্কের জন্য gateway interface।

এটি Ethernet header সরিয়ে দেয় এবং **IP destination** পরীক্ষা করে: 10.0.0.20।

## Step 6: Router 10.0.0.0/24 এর জন্য routing table চেক করে

Router তার **routing table** এ destination IP (10.0.0.20) খুঁজে বের করে।

এটি একটি মিল খুঁজে পায়:
`10.0.0.0/24 → eth1 (directly connected)`

10.0.0.0/24 নেটওয়ার্ক Router এর eth1 interface এ **সরাসরি সংযুক্ত**। কোনো next-hop router প্রয়োজন নেই।

## Step 7: Router জানে 10.0.0.0/24 eth1 এ সরাসরি সংযুক্ত

যেহেতু destination নেটওয়ার্ক **সরাসরি সংযুক্ত**, Router জানে যে এটি Server তে তার **eth1 interface** (10.0.0.1) এর মাধ্যমে পৌঁছাতে পারে।

Router TTL কমায় এবং Server এর জন্য একটি **নতুন Ethernet frame** তৈরি করার প্রস্তুতি নেয়।

## Step 8: Router Server এর জন্য নতুন frame তৈরি করে

Router দ্বিতীয় hop এর জন্য একটি **সম্পূর্ণ নতুন Ethernet frame** তৈরি করে:

`Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)`
`Dst MAC: 11:22:33:44:55:66 (Server)`

**গুরুত্বপূর্ণ:** L2 header সম্পূর্ণ নতুন, কিন্তু L3 IP address অপরিবর্তিত থাকে — `192.168.1.10 → 10.0.0.20`।

## Step 9: Frame: Router → Switch B

Router নতুন frame টি eth1 দিয়ে **Switch B** তে পাঠায়।

Frame এখন Layer 2 তে Router কে source এবং Server কে destination হিসেবে বহন করে।

## Step 10: Switch B Server কে ফরওয়ার্ড করে

Switch B frame পায়, destination MAC খুঁজে বের করে — Server এর সাথে সংযুক্ত port এ পাওয়া গেছে।

এটি frame টি **সরাসরি ফরওয়ার্ড** করে। Server এটি গ্রহণ করে, destination IP চেক করে — মিলে গেছে!

## Step 11: Server গ্রহণ করে এবং উত্তর দেয়

Server frame গ্রহণ করে — destination IP তার নিজের সাথে মিলে গেছে।

এটি ডেটা প্রক্রিয়াকরণ করে এবং একটি **উত্তর** পাঠায়:
`Src IP: 10.0.0.20 (Server)`
`Dst IP: 192.168.1.10 (PC-A)`

উত্তর Router (gateway) এর মাধ্যমে ফিরে যায় PC-A তে পৌঁছাতে।

## Step 12: Gateway routing সম্পূর্ণ!

Router Server থেকে উত্তর গ্রহণ করে, destination (192.168.1.10) খুঁজে বের করে এবং eth0 এর মাধ্যমে PC-A তে ফরওয়ার্ড করে।

**মূল কথা:** একটি **gateway** (router) বিভিন্ন নেটওয়ার্ককে সংযুক্ত করে। যখন ডিভাইসগুলোর নেটওয়ার্ক জুড়ে যোগাযোগ করতে হয়, তখন তারা gateway কে frame পাঠায়, যেটি:
1. পুরোনো L2 header সরিয়ে দেয়
2. Routing table খুঁজে বের করে
3. পরবর্তী নেটওয়ার্কের জন্য একটি **নতুন L2 header** তৈরি করে
4. Packet ফরওয়ার্ড করে

L3 IP address সম্পূর্ণ পথ জুড়ে একই থাকে, কিন্তু L2 MAC address প্রতিটি hop এ বদলে যায়।