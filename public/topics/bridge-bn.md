---
name: Linux Bridges
description: Linux bridge (brctl) দিয়ে VMs/container সংযুক্ত করা
category: Linux Core Networking
order: 27
---

## Step 1: Linux bridge একটি virtual switch হিসেবে কাজ করে

একটি **Linux bridge** হলো একটি kernel-level virtual switch। এটি একটি ভৌতিক switch-এর মতোই কাজ করে — এটি MAC address শিখে frame forward করে।

তৈরি করা হয়:
`ip link add br0 type bridge`
`brctl show br0`

Bridge-এ পোর্ট আছে যেখানে VMs/container সংযুক্ত হয় এবং বাইরের নেটওয়ার্কের সাথে একটি uplink আছে।

**পূর্বশর্ত:** প্রথমে **Network Namespaces** এবং **Layer 2** (MAC learning) বোঝুন।

## Step 2: VM-1 এবং VM-2 উভয়ই br0-তে সংযুক্ত

দুটি VMই তাদের virtual NIC-এর মাধ্যমে bridge br0-তে সংযুক্ত:
`brctl addif br0 tap-vm1`
`brctl addif br0 tap-vm2`

Bridge-র **Forwarding Database (FDB)** বর্তমানে খালি — এটি এখনো কোনো MAC address শিখেনি।

## Step 3: VM-1 ARP broadcast পাঠায়

VM-1 VM-2-র সাথে যোগাযোগ করতে চায় কিন্তু তার MAC address জানে না। এটি একটি **ARP broadcast** পাঠায়:
`"Who has VM-2? Tell VM-1"`

Broadcast frame vm-1 পোর্ট দিয়ে bridge-এ প্রবেশ করে।

## Step 4: Bridge VM-2-তে flood করে

Bridge broadcast পায় এবং source বাদে সব পোর্টে **flood** করে — VM-2-র সাথে সংযুক্ত পোর্ট সহ।

VM-2 ARP request পায় এবং নিজের IP চেনে।

## Step 5: VM-2 উত্তর দেয় (unicast)

VM-2 একটি **ARP Reply** পাঠায় — এবার এটি একটি **unicast** frame যা VM-1-র MAC-এ ঠিকানাযুক্ত।

Bridge reply পায় এবং source field থেকে VM-2-র MAC address **শিখে** তার FDB-তে একটি এন্ট্রি যোগ করে।

## Step 6: Bridge VM-1 MAC শিখে, FDB-তে যোগ করে

Bridge এখন ARP reply VM-1-র দিকে forward করে। যখন VM-1-র frame আসে, bridge source থেকে **VM-1-র MACও শিখে**।

FDB-তে এখন **দুটি VM**-রই এন্ট্রি আছে। ভবিষ্যতের unicast frame-এর জন্য flood দরকার হবে না।

## Step 7: VM-1 VM-2-তে ডেটা পাঠায় (unicast)

ARP resolution সম্পূর্ণ হয়েছে, এখন VM-1 VM-2-তে একটি **data frame** পাঠায়।

Frame bridge-এ প্রবেশ করে যেখানে source হলো VM-1 (ইতিমধ্যে শেখা) এবং destination হলো VM-2।

## Step 8: Bridge FDB খুঁজে — VM-2-তে forward করে

Bridge তার FDB-তে VM-2-র MAC চেক করে — **vm-2 পোর্টে পাওয়া গেছে**।

এটি সরাসরি VM-2-তে frame forward করে। Flood দরকার নেই — bridge আগেই MAC address শিখেছে।

## Step 9: VM-1 ইন্টারনেটে পাঠায় (স্থানীয় নয়)

VM-1 এখন একটি প্যাকেট **ইন্টারনেটে** (স্থানীয় bridge network-এর বাইরে) পাঠায়।

Bridge frame পায়, কিন্তু destination MAC হলো **Router**-র (next hop), স্থানীয় VM-র নয়।

## Step 10: Bridge router-এ forward করে (uplink)

Bridge destination MAC খুঁজে — এটি **Router**-র, যা uplink পোর্টে সংযুক্ত।

Frame Router-এ forward করা হয়, যা এটিকে ইন্টারনেটে route করবে।

**মূল কথা:** Linux bridge একটি ভৌতিক switch-এর ঠিক মতোই কাজ করে — এটি তার FDB-তে MAC address শিখে এবং unicast frame সরাসরি forward করে। এটি broadcast এবং অজানা unicast flood করে। Uplink-এ একটি router-এর সাথে একত্রিত, এটি VMs এবং container-এর জন্য সম্পূর্ণ network connectivity প্রদান করে।
