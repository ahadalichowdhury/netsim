---
name: DNS
description: Domain Name System — নাম কীভাবে IP address হয়ে যায়
category: Networking Fundamentals
order: 16
---

## Step 1: ব্যবহারকারী browser-এ google.com টাইপ করে

ব্যবহারকারী একটি browser খুলে address bar-এ **google.com** টাইপ করে।

কম্পিউটারকে এই মানুষের পাঠযোগ্য **domain name** কে একটি IP address-তে রূপান্তরিত করতে হবে। এটি প্রথমে তার **স্থানীয় DNS cache** চেক করে দেখে যে উত্তর ইতিমধ্যে জানা আছে কিনা।

**দ্রষ্টব্য:** DNS resolution বেশিরভাগ network connection-এর আগে ঘটে। DNS-র পর, **TCP Handshake** resolved IP-তে connection স্থাপন করে।

**দেখুনও:** **TCP/UDP Ports** টপিক — DNS port 53 ব্যবহার করে।

## Step 2: PC স্থানীয় DNS cache চেক করে — miss

PC "google.com"-এর জন্য তার **স্থানীয় DNS cache** চেক করে।

Cache **খালি** — এটি এই সাইটে প্রথম সফর। PC-কে এখন IP address খুঁজে বের করতে একটি recursive DNS resolver-কে **DNS query** পাঠাতে হবে।

## Step 3: PC DNS Query তৈরি করে (UDP port 53)

PC একটি **DNS query** packet তৈরি করে:
`Type: A (IPv4 address request)`
`Name: google.com`

Queryটি PC → Switch → DNS Server (8.8.8.8) যাবে UDP port 53 ব্যবহার করে।

## Step 4: DNS Query: PC → Switch

PC DNS query frame Switch-এ পাঠায়।
`Src MAC: AA:BB:CC:DD:EE:01 (PC)`
`Dst MAC: AA:BB:CC:DD:EE:FF (DNS Server)`

Switch frame পায় এবং DNS Server-এর দিকে forward করবে।

## Step 5: Switch DNS Server-তে forward করে

Switch frame পায় এবং forwarding table-তে destination MAC খুঁজে।

DNS Server (AA:BB:CC:DD:EE:FF) এর সাথে সংযুক্ত পোর্টে পৌঁছানো যায়। Switch সরাসরি frame DNS Server-তে **forward** করে।

## Step 6: DNS Server A record খুঁজে

DNS Server **google.com**-এর query পায়।

এটি তার zone files-এ **A record** খুঁজে এবং IP address খুঁজে পায়: `142.250.80.46`

DNS Server resolved IP address সহ একটি response তৈরি করে।

## Step 7: DNS Reply: Server → Switch

DNS Server একটি **DNS response** ফেরত পাঠায়:
`Type: A`
`Name: google.com`
`IP: 142.250.80.46`
`TTL: 300 seconds`

Reply DNS Server → Switch যায়।

## Step 8: Switch Reply PC-তে forward করে

Switch DNS reply পায় এবং destination MAC (AA:BB:CC:DD:EE:01 — PC) খুঁজে।

এটি PC-র সাথে সংযুক্ত পোর্টে frame forward করে।

## Step 9: PC IP address cache করে

PC DNS reply পায় এবং ফলাফল **cache** করে:
`google.com → 142.250.80.46`

এই এন্ট্রি **300 সেকেন্ড** (TTL) জন্য cache-তে থাকবে। এই domain-এ ভবিষ্যতের সফরে আরেকটি DNS lookup দরকার হবে না!

## Step 10: DNS Resolution সম্পূর্ণ!

**মূল কথা:** DNS মানুষের পাঠযোগ্য domain name কে কম্পিউটার ব্যবহার করতে পারে এমন IP address-তে রূপান্তরিত করে।

প্রক্রিয়ায় অন্তর্ভুক্ত ছিল:
1. **স্থানীয় cache** চেক করা — miss!
2. একটি **DNS Query** (UDP port 53) তৈরি করা
3. Query PC → Switch → DNS Server যায়
4. DNS Server **A record** খুঁজে
5. Reply DNS Server → Switch → PC যায়
6. PC ফলাফলের সাথে একটি TTL দিয়ে **cache** করে

DNS ছাড়া, আপনাকে `google.com` টাইপ করার পরিবর্তে `142.250.80.46`-এর মতো IP address মনে রাখতে হতো!
