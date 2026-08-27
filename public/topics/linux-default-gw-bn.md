---
name: Default Gateway Linux - ip route
description: Linux-এ ip route দিয়ে Default Gateway কীভাবে কাজ করে — ধাপে ধাপে বাংলায়
---

# Default Gateway Linux — `ip route`

আজ দেখবো Linux-এ `ip route` কমান্ড দিয়ে default gateway কীভাবে কাজ করে। যখন একটা Linux host বাইরের নেটওয়ার্কে প্যাকেট পাঠায়, তখন কী হয়।

## Step 1: Linux Host 8.8.8.8-তে প্যাকেট পাঠাতে চায়

ধরো তোমার Linux machine থেকে Google DNS `8.8.8.8`-তে ping করতে চাও। কমান্ড:

```bash
ping 8.8.8.8
```

এখন Linux kernel-কে বুঝতে হবে এই প্যাকেটটা কোথায় পাঠাতে হবে।

## Step 2: Routing Table চেক করো

Kernel তার routing table দেখে। `ip route show` দিয়ে দেখতে পারো:

```bash
ip route show
```

আউটপুটে কিছু এরকম দেখবে:

```
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100
```

## Step 3: নির্দিষ্ট রুট নেই — Default Route ব্যবহার হয়

Kernel দেখে `8.8.8.8`-এর জন্য কোনো নির্দিষ্ট রুট আছে কিনা। `192.168.1.0/24`-র জন্য রুট আছে, কিন্তু `8.8.8.8` সেই সাবনেটে পড়ে না। তাই kernel `default` রুট ব্যবহার করবে — যেটা বলছে "সবকিছু `192.168.1.1`-এর মাধ্যমে পাঠাও, `eth0` ইন্টারফেস দিয়ে।"

## Step 4: Default Route হলো Gateway

Default route মানে হলো সেই রাউটার বা gateway যার কাছে সব অজানা প্যাকেট পাঠাতে হয়। এখন আমাদের case-এ default gateway হলো `192.168.1.1`, এবং ইন্টারফেস হলো `eth0`।

## Step 5: প্যাকেট eth0-তে পাঠাও

Kernel `eth0` ইন্টারফেসের মাধ্যমে প্যাকেটটা পাঠায়। `eth0`-র IP হলো `192.168.1.100`। প্যাকেটের সোর্স IP `192.168.1.100`, ডেস্টিনেশন IP `8.8.8.8`। কিন্তু Layer 2-তে destination MAC হবে `192.168.1.1`-র — যেটা রাউটারের।

## Step 6: eth0 প্যাকেটটা রাউটারে পাঠায়

`eth0` ইন্টারফেস প্যাকেটটাকে Ethernet ফ্রেমে জড়িয়ে রাউটার (`192.168.1.1`)-এর দিকে পাঠায়। রাউটার প্যাকেটটা গ্রহণ করে।

## Step 7: রাউটার ফরোয়ার্ড করে

রাউটার দেখে ডেস্টিনেশন IP `8.8.8.8`। রাউটারের নিজের routing table-এ `8.8.8.8`-এর জন্য রুট আছে — হয়তো ISP-র দিকে। রাউটার প্যাকেটটা আরেকটা hop-এ পাঠায়।

## Step 8: Reply ফিরে আসে

`8.8.8.8` (Google DNS) থেকে reply প্যাকেট আসে। Destination IP হলো `192.168.1.100` (তোমার machine)। রাউটার প্যাকেটটা `eth0`-র দিকে পাঠায়।

## Step 9: NAT ট্রান্সলেট করে

তোমার machine হয়তো private IP `192.168.1.100` ব্যবহার করছে। রাউটার NAT (Network Address Translation) করে — মানে প্যাকেটের সোর্স IP বদলে তার public IP করে দেয়। Reply এলে সেটা আবার বদলিয়ে `192.168.1.100`-তে পাঠায়।

## Step 10: সারসংক্ষেপ

পুরো প্রসেস:

- **Routing Table:** Kernel দেখে `8.8.8.8`-র জন্য নির্দিষ্ট রুট নেই
- **Default Route:** `via 192.168.1.1 dev eth0` — সব অজানা প্যাকেট gateway-তে যায়
- **Gateway:** রাউটার প্যাকেটটা বাইরের দিকে forward করে
- **Reply:** ফিরে এসে NAT দিয়ে তোমার machine-এ পৌঁছায়

`ip route` দিয়ে তুমি routing table দেখতে এবং default gateway পরিবর্তন করতে পারো। Default gateway ছাড়া তোমার machine শুধু local network-এই থাকবে!
