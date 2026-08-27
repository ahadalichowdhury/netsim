---
name: Linux Gateway
description: Linux-কে ip forwarding সক্রিয় করে গেটওয়ে হিসেবে ব্যবহার
category: Linux Core Networking
order: 24
---

## Step 1: Linux box দুটি নেটওয়ার্ক সংযুক্ত করে

একটা Linux box দুটি নেটওয়ার্কের মাঝখানে বসে আছে:
`Network 1 (br0): 192.168.1.0/24`
`Network 2 (br1): 10.0.0.0/24`

Linux box-এর দুটি bridge (br0, br1) আছে এবং **ip forwarding সক্রিয়**, যার ফলে এটা দুটো নেটওয়ার্কের মাঝখানে একটা গেটওয়ে হিসেবে কাজ করে।

**পূর্বশর্ত:** আগে **Default Gateway (Linux)** এবং **Network Namespaces** বোঝা প্রয়োজন।

## Step 2: কার্নেলে ip_forward সক্রিয়

IP forwarding চেক করা হয়:
`cat /proc/sys/net/ipv4/ip_forward`

আউটপুট: `1` (সক্রিয়)

যখন সক্রিয় থাকে, Linux কার্নেল ইন্টারফেসের মধ্যে **packet ফরওয়ার্ড করতে পারে** ফেলে দেওয়ার বদলে। এটা Linux box-কে একটা router/gateway-তে পরিণত করে।

## Step 3: Web namespace 10.0.0.20-তে packet পাঠায়

web namespace (NS: web) ভিন্ন সাবনেটে DB namespace (10.0.0.20)-কে পৌঁছাতে চায়।

packetটা **veth1** দিয়ে br0 (192.168.1.1)-র দিকে পাঠানো হয়।

## Step 4: Packet br0 (192.168.1.1)-তে পৌঁছায়

packet veth1 থেকে **bridge br0**-তে যায়।

br0 192.168.1.0/24 নেটওয়ার্কের গেটওয়ে। কার্নেল packet প্রসেস করে এবং routing table চেক করে।

## Step 5: কার্নেল routing table: 10.0.0.0/24 via br1

কার্নেল তার routing table চেক করে:
`192.168.1.0/24 dev br0`
`10.0.0.0/24 dev br1`

ডেস্টিনেশন 10.0.0.20 10.0.0.0/24 রুটের সাথে মিলে যায় — **br1**-এ ফরওয়ার্ড করুন।

## Step 6: কার্নেল br1-এ packet ফরওয়ার্ড করে

যেহেতু ip_forward সক্রিয়, কার্নেল br0 থেকে br1-এ **packet ফরওয়ার্ড করে**।

packetটা গেটওয়ে পার করে — একটি নেটওয়ার্ক থেকে অন্যটিতে যাচ্ছে।

## Step 7: Packet veth2-ns-তে পৌঁছায়

packet **br1 (10.0.0.1)**-তে পৌঁছায় এবং 10.0.0.0/24 নেটওয়ার্কে **veth2-ns**-তে ফরওয়ার্ড করা হয়।

## Step 8: DB namespace packet গ্রহণ করে

DB namespace (NS: db) **veth2-ns**-তে packet গ্রহণ করে।

ডেস্টিনেশন IP 10.0.0.20 মিলে যায় — packet গ্রহণ করা হয়।

## Step 9: উত্তর গেটওয়ে দিয়ে ফিরে যায়

DB namespace web namespace-এর দিকে উত্তর পাঠায়। উত্তরটা Linux gateway দিয়ে বিপরীত পথে ফিরে যায়।

## Step 10: Linux Gateway সারসংক্ষেপ!

**মূল কথা:** Linux IP forwarding ব্যবহার করে একটা **নেটওয়ার্ক গেটওয়ে** হিসেবে কাজ করতে পারে।

কিভাবে কাজ করেছে:
1. **ip_forward=1** ইন্টারফেসের মধ্যে packet ফরওয়ার্ডিং সক্রিয় করে
2. Web namespace 10.0.0.20-তে (দূরবর্তী সাবনেট) পাঠায়
3. কার্নেল **routing table** চেক করে → br1 দিয়ে রুট
4. কার্নেল br0 থেকে br1-এ **packet ফরওয়ার্ড করে**
5. DB namespace packet গ্রহণ করে
6. উত্তর গেটওয়ে দিয়ে ফিরে যায়

সক্রিয় করুন:
`echo 1 > /proc/sys/net/ipv4/ip_forward`
`sysctl -w net.ipv4.ip_forward=1`
