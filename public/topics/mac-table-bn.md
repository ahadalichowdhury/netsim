---
name: MAC Address Table
description: সুইচ কিভাবে মনে রাখে কোন পোর্ট কোন ডিভাইসের সাথে সংযুক্ত
category: Components
order: 5
---

## Step 1: MAC Table কী?

**MAC address table** (যাকে forwarding database বা FDBও বলে) হলো সুইচের অভ্যন্তরীণ database যেটা **MAC address কে ভৌতিক পোর্টের** সাথে ম্যাপ করে।

যখন সুইচ একটি Ethernet frame গ্রহণ করে, সে **সোর্স MAC address** দেখে কোন ডিভাইস কোন পোর্টে আছে তা শেখে। তারপর সে সঠিক পোর্টে frame **ফরওয়ার্ড করতে** এই table ব্যবহার করে — সব পোর্টে ফ্লাড করার বদলে।

এটাই সুইচকে hub-এর চেয়ে স্মার্ট করে এমন মৌলিক প্রক্রিয়া।

## Step 2: সুইচ কিভাবে শেখে

সুইচ প্রতিটি আগমনকারী frame-এর **সোর্স MAC address** পরীক্ষা করে শেখে:

1. Frame পোর্ট ১-তে `AA:BB:CC:DD:EE:01` MAC থেকে আসে
2. সুইচ রেকর্ড করে: `AA:BB:CC:DD:EE:01 → Port 1`
3. Frame পোর্ট ২-তে `AA:BB:CC:DD:EE:02` MAC থেকে আসে
4. সুইচ রেকর্ড করে: `AA:BB:CC:DD:EE:02 → Port 2`

এই প্রক্রিয়াকে **MAC learning** বলে — এটা প্রতিটি frame-তে স্বয়ংক্রিয়ভাবে ঘটে। সুইচকে তার table তৈরি করতে কোনো কনফিগারেশনের প্রয়োজন নেই।

## Step 3: ফরওয়ার্ডিং সিদ্ধান্ত

যখন সুইচ একটি frame গ্রহণ করে, সে **ফরওয়ার্ডিং সিদ্ধান্ত** নিতে তার MAC table ব্যবহার করে:

**জানা destination MAC:**
• MAC table-তে destination খুঁজে দেখুন
• সংশ্লিষ্ট পোর্ট খুঁজুন
• Frame **শুধু সেই পোর্টে** ফরওয়ার্ড করুন (unicast)

**অজানা destination MAC:**
• MAC table-তে নেই
• Frameটা সোর্স বাদ দিয়ে **সব পোর্টে ফ্লাড** করুন
• এটাকে **unknown unicast flooding** বলে

**Broadcast (FF:FF:FF:FF:FF:FF):**
• সবসময় সোর্স বাদ দিয়ে সব পোর্টে ফ্লাড করুন

## Step 4: Aging এবং Timeout

MAC table এন্ট্রিগুলো **অস্থায়ী** এবং একটি **aging time** (সাধারণত 300 সেকেন্ড)-পরে মারা যায়।

যদি কোনো ডিভাইস frame পাঠানো বন্ধ করে (যেমন, বন্ধ বা সংযোগ বিচ্ছিন্ন), তার MAC entry **বয়সে যাবে** এবং table থেকে সরিয়ে দেওয়া হবে।

কেন aging গুরুত্বপূর্ণ:
• ডিভাইসগুলো **পোর্টের মধ্যে স্থানান্তরিত** হতে পারে (ল্যাপটপ অন্য jack-এ সরে যায়)
• **পুরনো এন্ট্রি** দ্বারা ভুল ফরওয়ার্ডিং রোধ করে
• MAC table-কে **সংক্ষিপ্ত এবং সঠিক** রাখে

Managed switch-এ aging time কনফিগারযোগ্য:
`switch(config)# mac address-table aging-time 600`

## Step 5: MAC Table দেখুন

**Cisco IOS** switch-এ:
`show mac address-table`

`MAC Address Table`
`-------------------------------------------`
`Vlan    MAC Address       Type    Ports`
`----    -----------------  ------  ------`
`1       AA:BB:CC:DD:EE:01  DYNAMIC  Fa0/1`
`1       AA:BB:CC:DD:EE:02  DYNAMIC  Fa0/2`

**Linux bridge**-তে:
`bridge fdb show`

**Linux**-তে `brctl` দিয়ে:
`brctl showmacs br0`

## Step 6: MAC Table সারসংক্ষেপ

**মূল কথা:** MAC address table হলো সুইচের forwarding database যেটা MAC address কে ভৌতিক পোর্টের সাথে ম্যাপ করে।

**কিভাবে কাজ করে:**
• সুইচ আগমনকারী frame-এর সোর্স MAC পরীক্ষা করে **শেখে**
• সুইচ table-তে destination MAC খুঁজে **ফরওয়ার্ড করে**
• রিফ্রেশ না হলে 300 সেকেন্ড-পরে এন্ট্রিগুলো **বয়সে যায়**

**কমান্ড:**
• Cisco: `show mac address-table`
• Linux bridge: `bridge fdb show`
• স্ট্যাটিক যোগ করুন: `mac address-table static AA:BB:CC:DD:EE:01 vlan 1 interface Fa0/1`

MAC table-ই সুইচকে কার্যকর করে — এটা না থাকলে, প্রতিটি frame hub-এর মতো ফ্লাড হতো।
