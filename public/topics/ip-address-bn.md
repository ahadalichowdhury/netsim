---
name: IP Address
description: Logical address — ডিভাইসগুলো নেটওয়ার্ক জুড়ে কীভাবে চিহ্নিত হয়
category: Components
order: 1
---

## Step 1: IP Address কী?

একটি **IP (Internet Protocol)** address হলো নেটওয়ার্ক জুড়ে routing এর জন্য ডিভাইসগুলোকে দেওয়া একটি **logical address**।

MAC address এর বিপরীতে (যা hardware তে burned থাকে), IP address **software দ্বারা configure** করা হয় — DHCP বা manual assignment এর মাধ্যমে।

IP address **Layer 3** (Network layer) এ কাজ করে এবং বিভিন্ন নেটওয়ার্ক জুড়ে যোগাযোগ সক্ষম করে।

## Step 2: IPv4 Format

একটি **IPv4 address** হলো **32-bit** সংখ্যা যা **dotted decimal** notation এ লেখা হয়:

`192.168.1.10`

প্রতিটি সংখ্যা (octet) 8 বিট প্রতিনিধিত্ব করে, 0 থেকে 255 পর্যন্ত। 32 বিট দিয়ে, IPv4 প্রায় **4.3 বিলিয়ন** অনন্য address প্রদান করে।

## Step 3: Class A নেটওয়ার্ক

**Class A** নেটওয়ার্ক network এর জন্য প্রথম octet এবং host এর জন্য বাকি তিনটি ব্যবহার করে:

`Network.Host.Host.Host`
`1.0.0.0 — 126.255.255.255`

Prefix: `/8` (subnet mask 255.0.0.0)
প্রতি network এ host: **16.7 মিলিয়ন** (2²⁴)

Class A **অত্যন্ত বড় নেটওয়ার্ক** এর জন্য ডিজাইন করা হয়েছে — মূলত বৃহৎ কর্পোরেশন এবং সরকারি প্রতিষ্ঠানকে বরাদ্দ করা হতো।

## Step 4: Class B নেটওয়ার্ক

**Class B** নেটওয়ার্ক network এর জন্য প্রথম দুটি octet এবং host এর জন্য দুটি ব্যবহার করে:

`Network.Network.Host.Host`
`128.0.0.0 — 191.255.255.255`

Prefix: `/16` (subnet mask 255.255.0.0)
প্রতি network এ host: **65,536** (2¹⁶)

Class B **মাঝারি থেকে বৃহৎ প্রতিষ্ঠান** এর জন্য উপযুক্ত — বিশ্ববিদ্যালয়, বড় কোম্পানি।

## Step 5: Class C নেটওয়ার্ক

**Class C** নেটওয়ার্ক network এর জন্য প্রথম তিনটি octet এবং host এর জন্য একটি ব্যবহার করে:

`Network.Network.Network.Host`
`192.0.0.0 — 223.255.255.255`

Prefix: `/24` (subnet mask 255.255.255.0)
প্রতি network এ host: **254** (2⁸ - 2)

Class C **ছোট নেটওয়ার্ক** এর জন্য ব্যবহৃত হয় — ছোট ব্যবসা, বাড়ির নেটওয়ার্ক।

## Step 6: Private IP Range

**Private IP address** (RFC 1918 এ সংজ্ঞায়িত) public internet এ routable নয়:

`Class A: 10.0.0.0 — 10.255.255.255` (10.0.0.0/8)
`Class B: 172.16.0.0 — 172.31.255.255` (172.16.0.0/12)
`Class C: 192.168.0.0 — 192.168.255.255` (192.168.0.0/16)

এই address গুলো private নেটওয়ার্কে স্বাধীনভাবে ব্যবহার করা যায় কিন্তু internet তে পৌঁছানোর আগে অবশ্যই **translated (NAT)** করতে হবে।

## Step 7: Public vs Private

**Public IP** গুলো বিশ্বব্যাপী অনন্য এবং internet এ routable — ISP দ্বারা বরাদ্দ করা হয়।

**Private IP** গুলো স্থানীয় নেটওয়ার্কে ব্যবহৃত হয় এবং বহিঃস্থ routable নয়।

**NAT (Network Address Translation)** অনেকগুলো private IP সহ ডিভাইসকে একটি মাত্র public IP শেয়ার করতে দেয়:

`192.168.1.10 → NAT → 203.0.113.1 (public)`

এটিই বেশিরভাগ বাড়ি এবং অফিসের নেটওয়ার্ক internet অ্যাক্সেস করার পদ্ধতি।

## Step 8: IP Address সারসংক্ষেপ

**মূল কথা:** IP address Layer 3 routing এর ভিত্তি।

• **32-bit** dotted decimal (যেমন, 192.168.1.10)
• **Class A:** /8 prefix, 16.7M host (বড় নেটওয়ার্ক)
• **Class B:** /16 prefix, 65K host (মাঝারি নেটওয়ার্ক)
• **Class C:** /24 prefix, 254 host (ছোট নেটওয়ার্ক)
• **Private range:** 10.x / 172.16-31.x / 192.168.x
• **Public IP** গুলো internet এ routable; **Private IP** গুলোর NAT প্রয়োজন

IP address বিভিন্ন নেটওয়ার্ক জুড়ে routing সক্ষম করে — Layer 3 এর মূল কাজ।