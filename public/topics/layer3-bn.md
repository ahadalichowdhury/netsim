---
name: Layer 3
description: রাউটারের মাধ্যমে বিভিন্ন নেটওয়ার্কের মধ্যে রাউটিং
category: নেটওয়ার্কিং বেসিক
order: 15
---

## Step 1: PC-A PC-C-র কাছে পৌঁছাতে চায় (ভিন্ন সাবনেট)

PC-A (192.168.1.10) PC-C (192.168.2.10) কে ডেটা পাঠাতে চায়।

PC-A তার সাবনেট মাস্ক চেক করে: `255.255.255.0`। ডেস্টিনেশন 192.168.2.10 192.168.1.0/24 নেটওয়ার্কে **নেই**।

**মূল নিয়ম:** যখন ডেস্টিনেশন ভিন্ন সাবনেটে থাকে, তখন frameটা অবশ্যই **ডিফল্ট গেটওয়ে** (Router)-র দিকে যেতে হবে — সরাসরি ডেস্টিনেশনের দিকে যায় না।

**পূর্বশর্ত:** আগে **ARP** (MAC address কিভাবে আবিষ্কার করা হয়) এবং **Gateway** (রাউটার কিভাবে নেটওয়ার্ক সংযুক্ত করে) বোঝা প্রয়োজন।

**আরও দেখুন:** **Routing Table** এবং **IP Address** টপিক — রাউটিং সিদ্ধান্ত এবং ঠিকানা কাঠামো জানতে।

## Step 2: PC-A চেক করে: ডেস্টিনেশন আমার সাবনেটে নেই

PC-A সাবনেট চেক করে:

`Destination: 192.168.2.10`
`My subnet: 192.168.1.0/24`

প্রথম তিনটি অক্টেট মেলে না — ডেস্টিনেশনটা **দূরবর্তী**। PC-A কে তার **ডিফল্ট গেটওয়ে** (Router at 192.168.1.1)-র দিকে ফরওয়ার্ড করতে হবে।

কিন্তু PC-A-র কাছে Ethernet frame তৈরি করার জন্য Router-এর **MAC address** লাগবে। শুধু IP আছে — এখন ARP করার সময়!

## Step 3: PC-A ডিফল্ট গেটওয়ের (192.168.1.1) জন্য ARP করে

PC-A একটা **ARP Request** broadcast পাঠায়:
`"192.168.1.1 কার? 192.168.1.10 কে বলো"`

broadcastটা Switch 1-তে পৌঁছায়, যেটা এটাকে সব পোর্টে ফ্লাড করে — Router-এর eth0 ইন্টারফেস সহ।

## Step 4: Router তার MAC দিয়ে উত্তর দেয়

Router তার eth0 IP (192.168.1.1)-এর জন্য ARP query চিনতে পারে এবং একটা **ARP Reply** পাঠায়:
`"192.168.1.1 AA:BB:CC:DD:EE:FF-তে আছে"`

PC-A-র কাছে এখন Router-এর MAC address আছে এবং সে সঠিক frame তৈরি করতে পারে।

## Step 5: PC-A frame তৈরি করে (dst MAC = Router)

PC-A Ethernet frame তৈরি করে **Router-এর MAC** কে Layer 2 destination হিসেবে রেখে — যদিও চূড়ান্ত ডেস্টিনেশন PC-C।

**Layer 2:** PC-A → Router (স্থানীয় ডেলিভারি)
**Layer 3:** PC-A → PC-C (এন্ড-টু-এন্ড)

## Step 6: Frame: PC-A → Switch 1

frame PC-A থেকে **link-a-sw1** দিয়ে Switch 1-এ যায়।

frame header:
`Src MAC: AA:BB:CC:DD:EE:01 (PC-A)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Router)`

ভেতরের IP packet:
`Src IP: 192.168.1.10 (PC-A)`
`Dst IP: 192.168.2.10 (PC-C)`

## Step 7: Switch 1 PC-A শেখে, Router-কে ফরওয়ার্ড করে

Switch 1 frame গ্রহণ করে এবং:
1. সোর্স ঠিকানা থেকে পোর্ট ১-তে PC-A-র MAC **শেখে**
2. ডেস্টিনেশন MAC (AA:BB:CC:DD:EE:FF) খুঁজে দেখে — পোর্ট ২-তে **পায়**
3. সরাসরি Router-কে frame **ফরওয়ার্ড করে** — ফ্লাডিংয়ের প্রয়োজন নেই

## Step 8: Router L2 header সরিয়ে দেয়, routing table চেক করে

Router eth0-তে frame গ্রহণ করে এবং Layer 3 প্রসেসিং করে:

**1.** Ethernet header সরিয়ে দেয় (Hop 1 L2 বাদ দেওয়া হয়)
**2.** IP ডেস্টিনেশন পড়ে: `192.168.2.10`
**3.** তার **routing table** চেক করে: 192.168.2.0/24 → eth1
**4.** **TTL** কমায় (64 → 63)
**5.** eth1-এর জন্য একটা **নতুন** L2 frame তৈরি করতে হবে

## Step 9: Router eth1-তে PC-C-র জন্য ARP করে

Router-কে 192.168.2.0/24 নেটওয়ার্কে frame পাঠানোর জন্য PC-C-র MAC address লাগবে।

সে তার eth1 ইন্টারফেস থেকে একটা **ARP Request** broadcast পাঠায়:
`"192.168.2.10 কার? 192.168.2.1 কে বলো"`

## Step 10: PC-C তার MAC দিয়ে উত্তর দেয়

PC-C ARP Request গ্রহণ করে এবং একটা **ARP Reply** পাঠায়:
`"192.168.2.10 AA:BB:CC:DD:EE:02-তে আছে"`

Router-এর কাছে এখন PC-C-র MAC address ARP cache-তে আছে।

## Step 11: Router নতুন frame তৈরি করে (dst MAC = PC-C)

Router দ্বিতীয় hop-এর জন্য একটা **সম্পূর্ণ নতুন** Ethernet frame তৈরি করে:

`Src MAC: AA:BB:CC:DD:EE:FF (Router eth1)`
`Dst MAC: AA:BB:CC:DD:EE:02 (PC-C)`

**গুরুত্বপূর্ণ:** L2 header সম্পূর্ণ নতুন, কিন্তু L3 IP ঠিকানা অপরিবর্তিত থাকে — `192.168.1.10 → 192.168.2.10`।

## Step 12: Frame: Router → Switch 2

Router নতুন frameটা eth1 দিয়ে **link-r-sw2** মাধ্যমে Switch 2-তে পাঠায়।

frameটায় এখন Layer 2-তে Router সোর্স এবং PC-C ডেস্টিনেশন হিসেবে আছে।

## Step 13: Switch 2 PC-C-র দিকে ফরওয়ার্ড করে

Switch 2 frame গ্রহণ করে, ডেস্টিনেশন MAC (AA:BB:CC:DD:EE:02) খুঁজে দেখে — PC-C-র সাথে সংযুক্ত পোর্টে পায়।

সে সরাসরি frame **ফরওয়ার্ড করে**। PC-C এটা গ্রহণ করে, ডেস্টিনেশন IP চেক করে — মিলে গেছে! packet গ্রহণ করা হয়।

## Step 14: Layer 3 routing সম্পূর্ণ!

PC-C frame গ্রহণ করে — ডেস্টিনেশন IP তার নিজের সাথে মিলে গেছে।

**মূল কথা:** প্রতিটি Layer 3 hop-তে, **Layer 2 frame সরিয়ে দেওয়া হয় এবং নতুন MAC address দিয়ে পুনর্গঠন করা হয়**, কিন্তু **Layer 3 IP ঠিকানা** সোর্স থেকে ডেস্টিনেশন পর্যন্ত **অপরিবর্তিত থাকে**।

Hop 1: PC-A → Router (MAC বদলায়, IP একই)
Hop 2: Router → PC-C (MAC আবার বদলায়, IP তবুও একই)

এটাই Layer 2 (MAC দিয়ে স্থানীয় ডেলিভারি) এবং Layer 3 (IP দিয়ে এন্ড-টু-এন্ড ডেলিভারি)-র মধ্যে মৌলিক পার্থক্য।
