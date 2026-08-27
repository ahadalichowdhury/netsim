---
name: Network Interface (NIC)
description: NIC কীভাবে frame গ্রহণ করে, filter করে, এবং প্রেরণ করে
category: Linux Core Networking
order: 20
---

## Step 1: Web Server Linux Host কে একটি frame পাঠায়

**Web Server** (192.168.1.20) Linux Host (192.168.1.10) এর দিকে একটি Ethernet frame প্রস্তুত করেছে।

Frame টি নেটওয়ার্ক ধরে Linux Host এর NIC এর দিকে যাচ্ছে। দেখি NIC এটি কীভাবে step by step process করে।

**পূর্বশর্ত:** এই topic দেখায় Linux কীভাবে hardware level তে network interface handle করে।

## Step 2: Frame NIC (eth0) তে cable থেকে আসে

Ethernet frame cable দিয়ে যায় এবং **Network Interface Controller (eth0)** তে পৌঁছায়।

NIC এর physical layer আসা বৈদ্যুতিক/অপটিক্যাল signal টি শনাক্ত করে এবং সেগুলোকে আবার digital bits এ রূপান্তরিত করে।

## Step 3: NIC destination MAC চেক করে

NIC Ethernet header এ **destination MAC address** পরীক্ষা করে:

`Dst MAC: AA:BB:CC:DD:EE:01`

NIC এটি তার নিজের MAC address এর সাথে তুলনা করে। এটিকে **MAC filtering** বলা হয় — NIC শুধুমাত্র তার দিকে ঠিকানাভুক্ত frames গ্রহণ করে (অথবা broadcast/multicast frames)।

## Step 4: NIC গ্রহণ করে — MAC eth0 এর সাথে match করে

Destination MAC eth0 এর MAC address এর **সাথে match** করে! NIC frame টি গ্রহণ করে।

MAC match না করলে, NIC CPU কে interrupt না করেই frame টি **নীরবে বর্জন** করত। এই filtering hardware level তে ঘটে — এটি অত্যন্ত দ্রুত।

## Step 5: NIC Ethernet header সরিয়ে দেয়, payload উপরে পাঠায়

NIC **Ethernet II header এবং trailer** (FCS/CRC check passed) সরিয়ে দেয়।

বাকি payload — একটি **IPv4 packet** — kernel এর receive ring buffer তে **DMA (Direct Memory Access)** transfer এর মাধ্যমে network stack তে পাঠানো হয়।

## Step 6: Kernel IP packet গ্রহণ করে

NIC Linux kernel কে অবহিত করতে একটি **hardware interrupt (IRQ)** ট্রিগার করে যে একটি packet এসেছে।

Kernel এর NIC driver interrupt process করে, DMA ring buffer থেকে packet টি পড়ে, এবং এটিকে network stack দিয়ে উপরে পাঠায়:
`NIC Driver → IP Layer → TCP → Application`

## Step 7: এখন Linux Host একটি reply পাঠায়

Linux Host আসা data process করেছে এবং একটি **reply** তৈরি করেছে।

Application response data টিকে NIC এর দিকে network stack দিয়ে নিচে পাঠায় প্রেরণের জন্য।

## Step 8: Kernel data টি NIC তে নিচে পাঠায়

Kernel এর network stack বহির্গামী packet টি **NIC driver** কে দেয়, যা এটিকে NIC এর **TX (transmit) queue** তে রাখে।

এখন NIC এর দায়িত্ব Ethernet frame তৈরি করা এবং তারে তে প্রেরণ করা।

## Step 9: NIC frame তৈরি করে, MAC header যোগ করে

NIC একটি নতুন **Ethernet II frame** তৈরি করে:
`Src MAC: AA:BB:CC:DD:EE:01 (eth0)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)`

এটি Ethernet header যোগ করে এবং ত্রুটি সনাক্তকরণের জন্য **FCS (Frame Check Sequence)** গণনা করে।

## Step 10: NIC frame টি cable তে প্রেরণ করে

NIC digital frame টিকে **বৈদ্যুতিক signal** (অথবা অপটিক্যাল pulse) এ রূপান্তরিত করে এবং ভৌিক cable তে প্রেরণ করে।

Frame টি switch ধরে যায় এবং Web Server তে পৌঁছায়।
