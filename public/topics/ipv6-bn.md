---
name: IPv6
description: পরবর্তী প্রজন্ম — ভবিষ্যতের জন্য 128-bit address
category: Networking Fundamentals
order: 32
---

## Step 1: IPv6 কেন?

IPv4 মাত্র **4.3 বিলিয়ন** address (2^32) প্রদান করে। ডিভাইসের বিস্ফোরণের সাথে — স্মার্টফোন, IoT, সার্ভার — বিশ্ব **IPv4 address শেষ হয়ে যাচ্ছে**।

**NAT** এবং **private IP range** এর মতো workround IPv4 এর জীবনকাল বাড়িয়েছে, কিন্তু এগুলো জটিলতা যোগ করে এবং end-to-end principle ভেঙে দেয়।

**IPv6** **128-bit address** দিয়ে এটি সমাধান করে — 3.4×10^38 address প্রদান করে। এটি পৃথিবীর প্রতিটি atom কে তার নিজস্ব IP address দেওয়ার জন্য যথেষ্ট।

## Step 2: IPv4 vs IPv6

**IPv4:**
• 32-bit address (4 octets)
• Dotted decimal: `192.168.1.10`
• ~4.3 বিলিয়ন address
• Header: 20-60 বাইট (variable)
• Checksum আবশ্যক

**IPv6:**
• 128-bit address (8 গোষ্ঠী, প্রতিটি 16 বিট)
• Colon-hex: `2001:0db8:85a3::8a2e:0370:7334`
• 3.4×10^38 address
• Header: নির্ধারিত 40 বাইট
• Checksum নেই (link-layer CRC এর উপর নির্ভরশীল)

## Step 3: IPv6 Address Format

একটি IPv6 address **8 গোষ্ঠীর 4 ডিজিট hexadecimal**, কোলন দিয়ে আলাদা করে লেখা হয়:

`2001:0db8:85a3:0000:0000:8a2e:0370:7334`

**সংকোচনের নিয়ম:**
• গোষ্ঠীতে leading zero বাদ দেওয়া যায়: `0db8` → `db8`
• একটি ধারাবাহিক সকল শূন্যের গোষ্ঠী `::` দিয়ে প্রতিস্থাপন করা যায়
• `2001:0db8:85a3::8a2e:0370:7334`

**বিশেষ address:**
• `::1` — loopback (127.0.0.1 এর মতো)
• `::` — unspecified (0.0.0.0 এর মতো)
• `fe80::/10` — link-local range

## Step 4: IPv6 বৈশিষ্ট্য

IPv6, IPv4 এর তুলনায় বেশ কয়েকটি উন্নতি প্রবর্তন করে:

**NAT প্রয়োজন নেই:**
• প্রতিটি ডিভাইসের একটি বিশ্বব্যাপী অনন্য address থাকতে পারে
• End-to-end connectivity পুনরুদ্ধার করে

**SLAAC (Stateless Address Auto-configuration):**
• ডিভাইসগুলো স্বয়ংক্রিয়ভাবে তাদের নিজস্ব IPv6 address configure করে
• DHCP server প্রয়োজন নেই (যদিও DHCPv6 বিদ্যমান)

**Built-in IPSec:**
• মূলত IPv6 তে বাধ্যতামূলক ছিল (এখন recommend করা হয়)
• Network layer এ authentication এবং encryption প্রদান করে

**সরলীকৃত header:**
• নির্ধারিত 40-বাইট header (দ্রুত প্রক্রিয়াকরণ)
• Checksum নেই (link-layer এবং upper-layer checksum এর উপর নির্ভরশীল)

## Step 5: Dual Stack

IPv4 থেকে IPv6 এ রূপান্তর **ধীরে ধীরে** **dual stack** operation এর মাধ্যমে ঘটছে।

রূপান্তরকালে:
• ডিভাইসগুলো **IPv4 এবং IPv6 উভয়ই** একই সাথে চালায়
• Application গুলো প্রথমে IPv6 চেষ্টা করে, IPv4 এ ফিরে যায়
• নেটওয়ার্কগুলো একই infrastructure এ উভয় protocol type বহন করে

**রূপান্তর পদ্ধতি:**
• **Dual Stack** — উভয় protocol চালানো (সবচেয়ে সাধারণ)
• **Tunneling** — IPv6 কে IPv4 packet তে encapsulate করা (6to4, Teredo)
• **NAT64/DNS64** — IPv4 এবং IPv6 এর মধ্যে translate করা

IPv6 গ্রহণ বাড়ছে — Google traffic এর 40% এর বেশি এখন IPv6 এর মাধ্যমে আসছে।