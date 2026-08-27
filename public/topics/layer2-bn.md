---
name: Layer 2
description: সুইচ কিভাবে MAC address ব্যবহার করে frame ফরওয়ার্ড করে
category: নেটওয়ার্কিং বেসিক
order: 10
---

## Step 1: PC-A PC-B কে ডেটা পাঠাতে চায়

**PC-A**-এর কাছে **PC-B** (192.168.1.20) কে পাঠানোর জন্য ডেটা আছে। দুটোই একই সাবনেটে (192.168.1.0/24), তাই PC-A Layer 2 এর মাধ্যমে সরাসরি পাঠাতে পারে।

কিন্তু আগে, PC-A কে PC-B-র MAC address কে destination হিসেবে রেখে একটা **Ethernet frame** তৈরি করতে হবে।

**PC-A কিভাবে PC-B-র MAC জানে?**
PC-A **ARP** (Address Resolution Protocol) ব্যবহার করে এটা আবিষ্কার করে। এই ধাপের আগে, PC-A একটা ARP broadcast পাঠিয়েছিল: "192.168.1.20 কার?" এবং PC-B তার MAC দিয়ে উত্তর দিয়েছিল। সম্পূর্ণ প্রক্রিয়া জানতে **ARP topic** দেখুন।

**PC-A কিভাবে PC-B-র IP জানে?** ব্যবহারকারী বা অ্যাপ্লিকেশন এটা দিয়েছে — হয় সরাসরি (ping 192.168.1.20) অথবা DNS resolution এর মাধ্যমে (ping pc-b.local)। সম্পূর্ণ চেইন জানতে **How Networks Start** দেখুন।

**আরও দেখুন:** **MAC Address** এবং **MAC Table** টপিক — সুইচ কিভাবে শেখে এবং ফরওয়ার্ড করে।

## Step 2: PC-A Ethernet frame তৈরি করে

PC-A একটা **Ethernet II frame** তৈরি করে:
`Src MAC: AA:BB:CC:DD:EE:01`
`Dst MAC: AA:BB:CC:DD:EE:02`

Ethernet payload-এর ভেতরে একটা **IPv4 packet** আছে যেটা ডেটা বহন করে। এখন frameটা সুইচে পাঠানোর জন্য প্রস্তুত।

## Step 3: Frame যাচ্ছে: PC-A → Switch

Ethernet frame ভৌতিক কেবলের মাধ্যমে **PC-A** থেকে **Switch**-এ যাচ্ছে।

সুইচ **পোর্ট ১**-তে frame গ্রহণ করে এবং এটা প্রসেস করা শুরু করে।

## Step 4: সুইচ PC-A-র MAC address শেখে

সুইচ frame-এর **সোর্স MAC address** (AA:BB:CC:DD:EE:01) পরীক্ষা করে।

এটা তার **MAC address table**-তে একটি এন্ট্রি তৈরি করে:
`AA:BB:CC:DD:EE:01 → Port 1 (PC-A)`

এটাই **লার্নিং** ফেজ — সুইচ এখন জানে PC-A কোথায় খুঁজে পাওয়া যায়।

## Step 5: সুইচ MAC table চেক করে — PC-B অজানা

সুইচ frame-এর **ডেস্টিনেশন MAC** (AA:BB:CC:DD:EE:02) দেখে এবং তার MAC table খুঁজে দেখে।

**PC-B table-তে নেই।** সুইচ জানে না কোন পোর্ট PC-B-র দিকে যায়।

একমাত্র উপায়: frameটা সোর্স বাদ দিয়ে **সব পোর্টে ফ্লাড** করা।

## Step 6: সুইচ PC-B-র দিকে frame ফ্লাড করে

সুইচ **পোর্ট ১ বাদ দিয়ে সব পোর্টে** frame ফ্লাড করে।

প্রথম কপি পোর্ট ২ দিয়ে **PC-B**-র কাছে পৌঁছায়। এটাকে **unknown unicast flooding** বলে।

## Step 7: সুইচ PC-C-র দিকেও ফ্লাড করে

সুইচ একই সাথে frame-এর একটি কপি পোর্ট ৩ দিয়ে **PC-C**-র কাছে পাঠায়।

PC-C destination MAC পরীক্ষা করবে এবং সিদ্ধান্ত নেবে frame গ্রহণ করবে নাকি ফেলে দেবে।

## Step 8: PC-C ফেলে দেয় — ভুল destination MAC

**PC-C** ফ্লাড করা frame গ্রহণ করে এবং destination MAC চেক করে।

`Dst MAC: AA:BB:CC:DD:EE:02`
`PC-C MAC: AA:BB:CC:DD:EE:03`

দুটো ঠিক মেলে না — **PC-C নীরবে frameটা ফেলে দেয়।** এটা আসলে PC-C-র জন্যই ছিল না।

## Step 9: PC-B গ্রহণ করে এবং উত্তর পাঠায়

**PC-B** frame গ্রহণ করে এবং দেখে destination MAC তার নিজের সাথে মেলে — এটা frame **গ্রহণ করে**।

PC-B ডেটা প্রসেস করে এবং একটা **রিপ্লাই frame** পাঠায়:
`Src MAC: AA:BB:CC:DD:EE:02 (PC-B)`
`Dst MAC: AA:BB:CC:DD:EE:01 (PC-A)`

## Step 10: সুইচ PC-B-র MAC শেখে

সুইচ রিপ্লাই গ্রহণ করে এবং **সোর্স MAC** (AA:BB:CC:DD:EE:02) পরীক্ষা করে।

এটা একটি নতুন এন্ট্রি তৈরি করে:
`AA:BB:CC:DD:EE:02 → Port 2 (PC-B)`

MAC table-তে এখন **দুটোই** PC-A এবং PC-B-র জন্য এন্ট্রি আছে।

## Step 11: সুইচ PC-A-র দিকে unicast ফরওয়ার্ড করে

সুইচ তার table-তে destination MAC (AA:BB:CC:DD:EE:01) চেক করে — **পেয়েছে! পোর্ট ১ = PC-A।**

কোনো ফ্লাডিংয়ের প্রয়োজন নেই — সুইচ frameটা **শুধু PC-A-র** দিকে ফরওয়ার্ড করে। এটাই কার্যকর **unicast forwarding**।

## Step 12: Layer 2 switching সম্পূর্ণ!

সুইচ এখন PC-A এবং PC-B — দুটোরই MAC address **শিখে গেছে**।

ভবিষ্যতে PC-A এবং PC-B-র মধ্যে আসা frameগুলো unicast দিয়ে **সরাসরি ফরওয়ার্ড হবে** — আর কোনো ফ্লাডিং নেই!

**মূল ধারণা:** সুইচ প্রতিটি frame-এর **সোর্স MAC** পরীক্ষা করে শেখে। তারপর MAC address table-তে **ডেস্টিনেশন MAC** খুঁজে ফরওয়ার্ড করে।
