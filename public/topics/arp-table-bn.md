---
name: ARP Table
description: mapping cache — IP থেকে MAC address translation
category: Components
order: 4
---

## Step 1: ARP Table কী?

একটি **ARP table** (ARP cache নামেও পরিচিত) হলো প্রতিটি ডিভাইসে সংরক্ষিত একটি স্থানীয় mapping যা **IP address কে MAC address-তে** রূপান্তরিত করে।

যেহেতু Ethernet frame-এর জন্য MAC address দরকার (IP নয়), তাই Layer 2-তে যোগাযোগ করার জন্য প্রতিটি ডিভাইসের এই mapping দরকার। ARP table হলো স্থানীয় নেটওয়ার্কে ঘটিত ARP request এবং reply-র ফলাফল।

ARP table ছাড়া, প্রতিটি প্যাকেটের জন্য একটি নতুন ARP broadcast দরকার হতো — এটি অত্যন্ত অকার্যকর।

## Step 2: Dynamic Entries

ARP table-র বেশিরভাগ এন্ট্রি **dynamic** — এগুলো ARP request/reply প্রক্রিয়ার মাধ্যমে স্বয়ংক্রিয়ভাবে শেখা হয়।

যখন একটি ডিভাইস একই subnet-এ একটি IP-তে ডেটা পাঠাতে চায়, তখন এটি একটি ARP request broadcast করে: `"Who has 192.168.1.20?"`। target তার MAC address দিয়ে উত্তর দেয় এবং অনুরোধকারী ডিভাইস তার ARP table-এ **mapping ক্যাশ করে**।

Dynamic entries একটি **timeout** আছে (সাধারণত 300 সেকেন্ড) এবং রিফ্রেশ না হলে সরিয়ে ফেলা হয়।

## Step 3: Static Entries

আপনি `arp -s` কমান্ড ব্যবহার করে ম্যানুয়ালি **static ARP entries** তৈরি করতে পারেন:

`arp -s 192.168.1.20 AA:BB:CC:DD:EE:02`

Static entries:
• **কখনো মুছে যায় না** — ম্যানুয়ালি সরানো না হলে থেকে যায়
• **Dynamic কে ওভাররাইড করে** — উভয়ই থাকলে, static-কে অগ্রাধিকার দেওয়া হয়
• **নিরাপত্তার জন্য ব্যবহৃত হয়** — ARP spoofing attack প্রতিরোধ করে
• **নির্ভরযোগ্যতার জন্য ব্যবহৃত হয়** — গুরুত্বপূর্ণ infrastructure (gateway, DNS server)

`arp -a` দিয়ে দেখুন — static entries dynamic থেকে আলাদাভাবে চিহ্নিত থাকে।

## Step 4: ARP Cache Timeout

Dynamic ARP entries **অস্থায়ী** এবং একটি কনফিগারযোগ্য timeout-র পর মুছে যায়।

Linux-এ, ডিফল্ট timeout হলো **300 সেকেন্ড (5 মিনিট)**। এই সময়ের পর, এন্ট্রি সরিয়ে ফেলা হয় এবং পরবর্তী প্যাকেট একটি নতুন ARP request ট্রিগার করবে।

কেন timeout?
• ডিভাইসগুলো **IP পরিবর্তন করতে পারে** (DHCP পুনর্নির্ধারণ)
• ডিভাইসগুলো **নেটওয়ার্ক ছেড়ে যেতে পারে** (laptop ডিসকনেক্ট হয়)
• NIC-র **পরিবর্তন হতে পারে** (হার্ডওয়্যার প্রতিস্থাপন)
• **পুরনো এন্ট্রি** যোগাযোগ ব্যর্থতা সৃষ্টি করা থেকে প্রতিরোধ করে

Timeout কনফিগারযোগ্য: `sysctl net.ipv4.neigh.default.gc_stale_time`

## Step 5: ARP Table দেখা

ARP cache দেখতে `arp -a` কমান্ড ব্যবহার করুন:

`arp -a`
`? (192.168.1.20) at AA:BB:CC:DD:EE:02 [ether] on eth0`
`? (192.168.1.1) at AA:BB:CC:DD:EE:FF [ether] on eth0`

Linux-এ, আপনি এটিও ব্যবহার করতে পারেন:
`ip neigh show`
`ip neigh show dev eth0`

আউটপুট IP address, MAC address, interface এবং এন্ট্রির ধরন (dynamic/static) দেখায়।

## Step 6: ARP Table সারসংক্ষেপ

**মূল কথা:** ARP table হলো একটি স্থানীয় cache যা একই subnet-ে IP address কে MAC address-তে mapping করে।

**এন্ট্রির ধরন:**
• **Dynamic** — ARP request/reply-র মাধ্যমে শেখা, 300s-র পর মুছে যায়
• **Static** — ম্যানুয়ালি কনফিগার করা, কখনো মুছে যায় না

**কমান্ড:**
• `arp -a` — ARP cache দেখুন
• `arp -s <ip> <mac>` — static entry যোগ করুন
• `arp -d <ip>` — entry মুছুন

ARP table Layer 2 communication-এর জন্য অপরিহার্য। এটি ছাড়া, ডিভাইসগুলো স্থানীয় নেটওয়ার্কে ডেটা পাঠানোর জন্য প্রয়োজনীয় Ethernet frame তৈরি করতে পারে না।
