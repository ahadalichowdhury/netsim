---
name: DHCP
description: Dynamic Host Configuration Protocol - DORA প্রক্রিয়া
category: Networking Fundamentals
order: 14
---

## Step 1: নতুন PC বুট হয় — IP address নেই!

একটি একদম নতুন PC একটি **burned-in MAC address** (AA:BB:CC:DD:EE:10) দিয়ে চালু হয় কিন্তো সম্পূর্ণরূপে **কোনো IP configuration নেই**।

IP ছাড়া, এটি নেটওয়ার্কে যোগাযোগ করতে পারে না। এটিকে অবশ্যই স্বয়ংক্রিয়ভাবে একটি পেতে **DHCP DORA** চালাতে হবে।

**দ্রষ্টব্য:** DHCP **default gateway** এবং **DNS server** addressও প্রদান করে। বিস্তারিতের জন্য সেগুলো দেখুন।

**দেখুনও:** Lease database-র বিস্তারিতের জন্য **DHCP Table** টপিক।

## Step 2: PC DHCP Discover তৈরি করে (broadcast)

PC একটি **DHCP Discover** বার্তা গঠন করে — DORA প্রক্রিয়ার সবচেয়ে প্রথম ধাপ।

যেহেতু এখনো কোনো IP নেই, source address হলো `0.0.0.0:68`। Destination হলো broadcast address `255.255.255.255:67`, যাতে LAN-এ যেকোনো DHCP server অনুরোধ শুনতে পারে।

Ethernet frame-ও broadcast (`FF:FF:FF:FF:FF:FF`)।

## Step 3: DHCP Discover: PC → Switch

DHCP Discover frame PC-A থেকে বের হয়ে **link-new**-তে Switch-এ পৌঁছায়।

Frameটি একটি **broadcast** — switch এটিকে অন্য সব পোর্টে flood করবে।

## Step 4: Switch DHCP Server-তে flood করে

Switch broadcast Discover পায় এবং source বাদে সব পোর্টে **flood** করে।

DHCP Server **link-dhcp**-তে বার্তা পায় এবং অনুরোধ প্রসেস করতে শুরু করে।

## Step 5: DHCP Server IP pool চেক করে

DHCP Server তার **address pool** পরীক্ষা করে এবং একটি উপলব্ধ IP নির্বাচন করে: `192.168.1.100`।

এটি নতুন PC-র MAC address-এর জন্য এই address সংরক্ষণ করে এবং lease-কে **"offered"** হিসেবে চিহ্নিত করে — client-র নিশ্চিতকরণের অপেক্ষায়।

## Step 6: Server DHCP Offer তৈরি করে

Server একটি **DHCP Offer** উত্তর তৈরি করে যাতে অন্তর্ভুক্ত:
• Offered IP: `192.168.1.100`
• Subnet Mask: `255.255.255.0`
• Default Gateway: `192.168.1.1`
• DNS Server: `8.8.8.8`
• Lease Time: `86400 sec (24h)`

Offer broadcast হিসেবে ঠিকানাযুক্ত যাতে PC (যার এখনো IP নেই) এটি পেতে পারে।

## Step 7: DHCP Offer: Server → Switch

DHCP Server Offer frame **link-dhcp** দিয়ে Switch-এ পাঠায়।

Frame broadcast যাতে IP-হীন PC এটি নিতে পারে।

## Step 8: Switch Offer PC-তে forward করে

Switch broadcast Offer সব পোর্টে forward করে। নতুন PC এটি পায় এবং এখন জানে একটি IP উপলব্ধ।

PC offered IP নোট করে এবং তার উত্তর প্রস্তুত করে।

## Step 9: PC DHCP Request পাঠায় (broadcast)

PC একটি **DHCP Request** পাঠায় — এখনো broadcast — offered IP `192.168.1.100` গ্রহণ করে।

এই broadcast দুটি উদ্দেশ্য পূরণ করে:
1. নির্বাচিত Server-কে বলে: "আমি আপনার offer গ্রহণ করি"
2. অন্য যেকোনো DHCP Server-কে বলে: "আপনার offer মুছুন — আমি অন্যকে বেছে নিলাম"

## Step 10: Server DHCP Ack পাঠায়

DHCP Server Request পায় এবং একটি **DHCP Acknowledge** পাঠায় — DORA-র চূড়ান্ত ধাপ।

ACK নিশ্চিত করে যে lease **আনুষ্ঠানিকভাবে প্রদান করা হয়েছে**। Server তার টেবিলে IP-কে "leased" হিসেবে চিহ্নিত করে।

## Step 11: PC network interface কনফিগার করে

PC ACK পায় এবং তার NIC-তে **configuration প্রয়োগ করে**:
• IP Address: `192.168.1.100`
• Subnet Mask: `255.255.255.0`
• Default Gateway: `192.168.1.1`
• DNS Server: `8.8.8.8`
• Lease Duration: `24 hours`

Interface চালু হয় — PC এখন সম্পূর্ণরূপে কনফিগার করা।

## Step 12: DORA প্রক্রিয়া সম্পূর্ণ!

সম্পূর্ণ **DORA** cycle সমাপ্ত:

**D**iscover → **O**ffer → **R**equest → **A**cknowledge

PC-র এখন একটি বৈধ IP address, subnet mask, gateway এবং DNS server আছে। এটি নেটওয়ার্কে যোগাযোগ করতে পারে।

DHCP Server-র lease table active lease দেখায় যার সাথে একটি running timer আছে। যখন lease মেয়াদোত্তীর্ণ হয়, PC-কে নবীকরণ করতে হবে — নাহলে IP pool-এ ফিরে যায়।
