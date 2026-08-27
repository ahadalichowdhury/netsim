---
name: Network Interface (NIC)
description: NIC কিভাবে ফ্রেম গ্রহণ করে, ফিল্টার করে এবং প্রেরণ করে
category: Linux Core Networking
order: 20
---

## Step 1: Web Server Linux Host এ একটা ফ্রেম পাঠায়

**Web Server** (192.168.1.20) Linux Host (192.168.1.10) এর জন্য একটা Ethernet frame তৈরি করেছে।

ফ্রেমটা নেটওয়ার্ক দিয়ে Linux Host এর NIC এর দিকে যাচ্ছে। দেখি NIC কিভাবে ধাপে ধাপে এটাকে প্রসেস করে।

**আগে জানুন:** এই টপিকে দেখানো হয়েছে Linux কিভাবে হার্ডওয়্যার লেভেলে নেটওয়ার্ক interface হ্যান্ডেল করে।

## Step 2: ফ্রেম কেবল দিয়ে NIC (eth0) তে পৌঁছায়

Ethernet frame কেবল দিয়ে যায় এবং **Network Interface Controller (eth0)** তে পৌঁছায়।

NIC এর ফিজিক্যাল লেয়ার আসা ইলেকট্রিক্যাল/অপটিক্যাল সিগনাল ডিটেক্ট করে এবং সেগুলোকে আবার ডিজিটাল বিটে রূপান্তর করে।

## Step 3: NIC ডেস্টিনেশন MAC যাচাই করে

NIC Ethernet header এর **ডেস্টিনেশন MAC address** যাচাই করে:

`Dst MAC: AA:BB:CC:DD:EE:01`

NIC এটাকে তার নিজের MAC address এর সাথে তুলনা করে। একে **MAC filtering** বলে — NIC শুধু তার নিজের দিকে ঠিক করা ফ্রেম (বা broadcast/multicast ফ্রেম) গ্রহণ করে।

## Step 4: NIC গ্রহণ করে — MAC eth0 এর সাথে মিলে গেছে

ডেস্টিনেশন MAC eth0 এর MAC address এর সাথে **মিলে গেছে**! NIC ফ্রেমটা গ্রহণ করে।

MAC মিলত না হলে, NIC CPU কে বাধা না দিয়েই ফ্রেমটা **চুপচাপ বর্জন** করত। এই ফিল্টারিং হার্ডওয়্যারে হয় — অত্যন্ত দ্রুত।

## Step 5: NIC Ethernet header সরিয়ে পেলোড উপরে পাঠায়

NIC **Ethernet II header এবং trailer** (FCS/CRC চেক পাস হয়েছে) সরিয়ে দেয়।

বাকি পেলোডটা — একটা **IPv4 packet** — DMA (Direct Memory Access) ট্রান্সফার দিয়ে kernel এর receive ring buffer তে পাঠানো হয়।

## Step 6: Kernel IP packet গ্রহণ করে

NIC একটা **হার্ডওয়্যার ইন্টারাপ্ট (IRQ)** ট্রিগার করে Linux kernel কে জানাতে যে একটা প্যাকেট এসেছে।

kernel এর NIC driver ইন্টারাপ্ট প্রসেস করে, DMA ring buffer থেকে প্যাকেটটা পড়ে এবং নেটওয়ার্ক স্ট্যাক দিয়ে উপরে পাঠায়:
`NIC Driver → IP Layer → TCP → Application`

## Step 7: এবার Linux Host একটা রিপ্লাই পাঠায়

Linux Host ইনকামিং ডাটা প্রসেস করে এবং একটা **রিপ্লাই** তৈরি করেছে।

অ্যাপ্লিকেশন রেসপন্স ডাটাকে নেটওয়ার্ক স্ট্যাক দিয়ে NIC এর দিকে প্রেরণ করে।

## Step 8: Kernel ডাটাকে NIC এর দিকে পাঠায়

kernel এর নেটওয়ার্ক স্ট্যাক আউটগোয়িং প্যাকেটটা **NIC driver** কে দেয়, যে সেটাকে NIC এর **TX (transmit) queue** তে রাখে।

এবার NIC এর দায়িত্ব Ethernet frame তৈরি করা এবং তারে প্রেরণ করা।

## Step 9: NIC ফ্রেম তৈরি করে, MAC header যোগ করে

NIC একটা নতুন **Ethernet II frame** তৈরি করে:
`Src MAC: AA:BB:CC:DD:EE:01 (eth0)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)`

সে Ethernet header যোগ করে এবং এরর ডিটেকশনের জন্য **FCS (Frame Check Sequence)** হিসাব করে।

## Step 10: NIC ফ্রেমটা কেবলে প্রেরণ করে

NIC ডিজিটাল ফ্রেমকে **ইলেকট্রিক্যাল সিগনালে** (বা অপটিক্যাল পালসে) রূপান্তর করে এবং ফিজিক্যাল কেবলে প্রেরণ করে।

ফ্রেমটা Switch দিয়ে যায় এবং Web Server এ পৌঁছায়।
