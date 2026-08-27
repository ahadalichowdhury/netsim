---
name: iptables Firewall
description: iptables chain দিয়ে Linux packet filtering
category: Linux Core Networking
order: 25
---

## Step 1: Firewall এ 3 টি chain এ iptables rule আছে

Linux firewall **iptables** ব্যবহার করে তিনটি built-in chain সহ:

**INPUT** — firewall নিজের দিকে প্রেরিত packet
**OUTPUT** — firewall থেকে উৎপন্ন packet
**FORWARD** — firewall এর মধ্য দিয়ে যাওয়া packet (এর দিকে প্রেরিত নয়)

ইন্টারনেট থেকে আসা incoming packet সবের আগে **PREROUTING** chain এ প্রবেশ করে, তারপর INPUT বা FORWARD এ রুট করা হয়।

**পূর্বশর্ত:** প্রথমে **Linux Gateway** (ip forwarding) এবং **Route Table** বুঝুন।

## Step 2: ইন্টারনেট থেকে incoming packet PREROUTING এ প্রবেশ করে

ইন্টারনেট থেকে একটি বৈধ HTTP request (port 80) আসে।

Packet **PREROUTING** chain এ প্রবেশ করে — সমস্ত incoming packet এর প্রথম স্টপ। PREROUTING routing decision এর আগে DNAT (Destination NAT) rule পরিচালনা করে।

## Step 3: PREROUTING: কোনো DNAT rule নেই — চালিয়ে যান

PREROUTING chain packet প্রক্রিয়াকরণ করে।

**কোনো DNAT rule মিলেনি** — destination IP অপরিবর্তিত থাকে। কার্নেল এখন routing decision সম্পাদনা করে নির্ধারণ করতে যে packet টি এই host এর জন্য (INPUT) নাকি forward করতে হবে (FORWARD)।

## Step 4: Server এর দিকে প্রেরিত — FORWARD chain ব্যবহার করুন

Routing decision নির্ধারণ করে যে packet টি **firewall নিজের দিকে প্রেরিত নয়** (destination 10.0.0.100 ≠ firewall IP)।

Packet টি **FORWARD chain** এ প্রক্রিয়াকরণের জন্য পাঠানো হয়।

## Step 5: FORWARD chain: Rule চেক করুন — port 80 হলে ACCEPT

FORWARD chain packet এর বিরুদ্ধে তার rule মূল্যায়ন করে:

**Rule 1:** `-p tcp --dport 80 -j ACCEPT`
মিলেছে? **হ্যাঁ** — destination port 80।

Target: **ACCEPT** — packet firewall এর মধ্য দিয়ে যেতে অনুমোদিত।

## Step 6: Rule মিলে গেছে! Firewall এর মধ্য দিয়ে ALLOW

ACCEPT target এ পৌঁছেছে — firewall packet কে FORWARD chain এর মধ্য দিয়ে **যেতে দেয়**।

আর কোনো rule মূল্যায়ন করা হয় না। Packet POSTROUTING এ এগিয়ে যায়।

## Step 7: POSTROUTING: কোনো MASQUERADE নেই — চালিয়ে যান

Packet **POSTROUTING** chain এ পৌঁছায় — firewall ছাড়ার আগে শেষ স্টপ।

**কোনো MASQUERADE বা SNAT rule মিলেনি** — packet তার আসল source IP সহ বের হয়।

## Step 8: Packet: Firewall → Switch

Firewall অনুমোদিত packet টি Switch কে পাঠায়।

Packet টি এখন Server এর দিকে যাচ্ছে — firewall এ filtering এর কাজ সম্পন্ন করেছে।

## Step 9: Switch Server কে ফরওয়ার্ড করে

Switch packet গ্রহণ করে এবং Server (10.0.0.100) তে ফরওয়ার্ড করে। HTTP request সফলভাবে পৌঁছেছে।

## Step 10: এখন একটি ক্ষতিকর packet আসে (port 22)

ইন্টারনেট থেকে একটি নতুন packet আসে — এবার সার্ভারে **SSH connection** (port 22) চেষ্টা করছে।

এটি একটি সাধারণ attack vector। Firewall আবার তার rule মূল্যায়ন করতে হবে।

## Step 11: FORWARD chain: port 22 মিলে DROP rule

FORWARD chain তার rule মূল্যায়ন করে:

**Rule 1:** `--dport 80 -j ACCEPT`
মিলেছে? না — port 22, 80 নয়।

**Rule 2:** `--dport 22 -j DROP`
মিলেছে? **হ্যাঁ** — destination port 22।

Target: **DROP** — packet চুপচাপ বর্জিত হয়।

## Step 12: Packet DROPPED! Server তে কখনও পৌঁছায় না

Firewall ক্ষতিকর SSH packet **ড্রপ** করে। এটি চুপচাপ বর্জিত হয় — attacker কে কোনো উত্তর পাঠানো হয় না।

Server কখনও packet গ্রহণ করে না। Attack ব্লক করা হয়েছে।

**মূল কথা:** iptables rule ক্রমানুসারে মূল্যায়ন করে। প্রথম মিলে এমন rule action (ACCEPT বা DROP) নির্ধারণ করে। কোনো rule না মিললে packet chain এর **default policy** (প্রায়ই FORWARD এর জন্য DROP) তে পড়ে যায়।

`iptables -L -v` hit counter সহ rule দেখায়।