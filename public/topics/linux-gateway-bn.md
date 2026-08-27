---
name: Linux Gateway - ip forwarding
description: Linux-এ ip forwarding দিয়ে দুটো নেটওয়ার্ক কীভাবে সংযুক্ত হয় — ধাপে ধাপে বাংলায়
---

# Linux Gateway — `ip forwarding`

আজ দেখবো একটা Linux box কীভাবে দুটো আলাদা নেটওয়ার্ককে সংযুক্ত করতে পারে — `ip forwarding` ব্যবহার করে।

## Step 1: Linux Box দুটো নেটওয়ার্কে সংযুক্ত

ধরো তোমার Linux box-এ দুটো নেটওয়ার্ক আছে:

- **br0:** `10.0.0.1/24` — এখানে Web Namespace (app1)
- **br1:** `10.0.1.1/24` — এখানে DB Namespace (app2)

Linux box দুটো bridge-এর মাঝখানে আছে — যেন একটা রাউটার।

## Step 2: ip_forward এনাবল আছে

Linux-এ `ip_forward` কি এনাবল আছে চেক করো:

```bash
cat /proc/sys/net/ipv4/ip_forward
```

যদি `1` দেখায়, তাহলে Linux box প্যাকেট forward করতে পারবে। যদি `0` দেখায়, তাহলে দরকার:

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
```

এটা ছাড়া Linux box প্যাকেট forward করবে না।

## Step 3: Web Namespace থেকে প্যাকেট বের হয়

Web Namespace (app1, IP: `10.0.0.2`) থেকে DB Namespace (`10.0.1.2`)-তে প্যাকেট পাঠাতে হবে। app1 প্যাকেটটা তৈরি করে:

- **Source IP:** `10.0.0.2`
- **Destination IP:** `10.0.1.2`
- **Next Hop:** `10.0.0.1` (gateway — যেটা Linux box-র br0)

## Step 4: প্যাকেট br0-তে পৌঁছায়

app1 প্যাকেটটা veth-a (যেটা br0-র সাথে সংযুক্ত) দিয়ে পাঠায়। প্যাকেটটা bridge `br0`-তে পৌঁছায়।

## Step 5: Routing Table চেক হয়

Linux kernel `br0`-তে প্যাকেট পেয়ে routing table চেক করে। Destination IP `10.0.1.2` — এটা `10.0.1.0/24` সাবনেটে। Kernel জানে যে `10.0.1.0/24` `br1` ইন্টারফেসের সাথে সংযুক্ত। তাই kernel প্যাকেটটা `br1`-এর দিকে forward করবে।

## Step 6: Kernel প্যাকেটটা br1-এ forward করে

Kernel `ip_forward` এনাবল থাকায় প্যাকেটটা `br0` থেকে `br1`-এ forward করে। এটাই আসল কাজ — Linux box একটা নেটওয়ার্ক থেকে আরেকটা নেটওয়ার্কে প্যাকেট পাঠাচ্ছে।

## Step 7: প্যাকেট veth2-তে পৌঁছায়

`br1` প্যাকেটটা গ্রহণ করে এবং DB Namespace-এর সাথে সংযুক্ত veth2 ইন্টারফেস দিয়ে পাঠায়। প্যাকেটটা DB Namespace-এ পৌঁছায়।

## Step 8: DB Namespace প্যাকেট গ্রহণ করে

DB Namespace (app2, IP: `10.0.1.2`) প্যাকেটটা পায়। ডেস্টিনেশন IP মেলে — `10.0.1.2`। গ্রহণ করে এবং reply তৈরি করে।

## Step 9: Reply ফিরে যায়

app2 reply প্যাকেট তৈরি করে:

- **Source IP:** `10.0.1.2`
- **Destination IP:** `10.0.0.2`

Reply প্যাকেটটা ঠিক উল্টো দিকে যায় — veth2 → br1 → Linux kernel → br0 → veth-a → app1।

## Step 10: সারসংক্ষেপ

Linux Gateway কীভাবে কাজ করে:

- **ip_forward এনাবল:** Linux kernel-কে permission দেয় প্যাকেট forward করার
- **bridge (br0, br1):** নেটওয়ার্ককে virtual switch হিসেবে কাজ করে
- **Routing Table:** Kernel জানে কোন নেটওয়ার্ক কোন ইন্টারফেসে আছে
- **Forward:** Kernel প্যাকেটটা একটা bridge থেকে আরেকটায় পাঠায়

একটা Linux box-কে সহজেই রাউটার বানানো যায় — শুধু `ip_forward` এনাবল করো এবং সঠিক routes সেট করো!
