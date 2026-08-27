---
name: NAT
description: Network Address Translation — প্রাইভেট থেকে পাবলিক IP ম্যাপিং
category: Networking Fundamentals
order: 18
---

## Step 1: PC-1 ইন্টারনেটে যেতে চাইছে

PC-1 (192.168.1.10) ইন্টারনেটে একটি Web Server `93.184.216.34` তে পৌঁছাতে চাইছে।

PC-1 একটি **প্রাইভেট IP address** (192.168.1.x) ব্যবহার করছে। প্রাইভেট IP পাবলিক ইন্টারনেটে রুট করা যায় না — **NAT Router** কে অবশ্যই address টি translate করতে হবে।

**পূর্বশর্ত:** প্রথমে **Default Gateway** (কীভাবে packet router তে পৌঁছায়) এবং **Layer 3** (কীভাবে router packet forward করে) বুঝে নাও।

## Step 2: PC-1 default gateway তে packet পাঠায়

PC-1 Web Server এর জন্য একটি packet তৈরি করে:
`Src IP: 192.168.1.10:49152`
`Dst IP: 93.184.216.34:80`

Packet টি NAT Router তে পৌঁছায় **প্রাইভেট source address** সহ অক্ষত।

## Step 3: Packet: PC-1 → Switch

Packet টি PC-1 থেকে LAN Switch এর মধ্য দিয়ে NAT Router এর দিকে যাচ্ছে।

## Step 4: Switch Router তে forward করে

LAN Switch frame টি গ্রহণ করে এবং তার LAN interface এ NAT Router তে forward করে।

## Step 5: Router NAT translation সম্পাদনা করে

NAT Router packet টি গ্রহণ করে এবং প্রাইভেট source IP কে তার public IP তে **translate** করে:
`192.168.1.10:49152 → 203.0.113.1:40001`

এটি একটি **NAT mapping entry** তৈরি করে যাতে পরে response টি PC-1 তে ফেরত পাঠানো যায়।

## Step 6: Translated: Router → Web Server

Router translated packet টি ইন্টারনেটে Web Server এর দিকে forward করে।
`Src: 203.0.113.1:40001`
`Dst: 93.184.216.34:80`

Server **পাবলিক IP** দেখবে, প্রাইভেট IP নয়।

## Step 7: Web Server পাবলিক IP তে respond করে

Web Server `203.0.113.1:40001` থেকে packet গ্রহণ করে এবং respond করে:
`Src IP: 93.184.216.34:80`
`Dst IP: 203.0.113.1:40001`

Server এর প্রাইভেট IP 192.168.1.10 সম্পর্কে **কোনো ধারণা নেই** — এটি শুধুমাত্র পাবলিক address দেখে।

## Step 8: Response: Web Server → Router

Web Server তার response NAT Router এর পাবলিক IP তে পাঠায়।

## Step 9: Router destination আবার translate করে

NAT Router response গ্রহণ করে এবং mapping খুঁজে দেখে:
`203.0.113.1:40001 → 192.168.1.10:49152`

এটি destination কে **মূল প্রাইভেট IP** দিয়ে প্রতিস্থাপন করে এবং packet টি PC-1 তে forward করে।

## Step 10: Translated: Router → Switch

Router translated response টি LAN Switch তে forward করে।
`Dst: 192.168.1.10:49152`

## Step 11: Switch PC-1 তে পৌঁছায়

LAN Switch destination MAC খুঁজে দেখে এবং response frame টি PC-1 তে পৌঁছায়।

## Step 12: NAT সম্পন্ন!

**মূল কথা:** NAT **প্রাইভেট IP কে পাবলিক IP তে** এবং বিপরীতে translate করে, যাতে অনেকগুলো device একটি পাবলিক address ভাগ করে ব্যবহার করতে পারে।

কীভাবে কাজ করেছিল:
1. PC-1 **প্রাইভেট source IP** সহ পাঠিয়েছিল
2. Switch Router তে forward করেছিল
3. Router **source কে প্রতিস্থাপন** করেছিল তার public IP + নতুন port দিয়ে
4. Router একটি **mapping লিপিবদ্ধ** করেছিল (প্রাইভেট ↔ পাবলিক)
5. Server **পাবলিক IP** তে respond করেছিল
6. Router **mapping খুঁজে** destination প্রতিস্থাপন করেছিল
7. Switch PC-1 তে পৌঁছিয়েছিল

এটি পাবলিক IPv4 address সংরক্ষণ করে — NAT এর পেছনে একটি পাবলিক IP শত শত device কে সেবা দিতে পারে।
