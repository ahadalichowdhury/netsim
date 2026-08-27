---
name: "ICMP"
description: "ICMP প্রোটোকল — ping, traceroute এবং নেটওয়ার্ক ডায়াগনস্টিক।"
---

## Step 1: ICMP কী?

**ICMP (Internet Control Message Protocol)** হলো একটা নেটওয়ার্ক লেয়ার প্রোটোকল — যেটা দিয়ে নেটওয়ার্ক সমস্যা ডায়াগনস করা হয়।

ICMP ট্রান্সপোর্ট লেয়ারের (TCP/UDP) উপরে কাজ করে না — সরাসরি IP প্যাকেটের ভেতরে থাকে। তবে এটাকে বলা হয় ট্রান্সপোর্ট লেয়ারেরও নয়, নেটওয়ার্ক লেয়ারেরও নয় — একটু আলাদাভাবে কাজ করে।

সবচেয়ে পরিচিত ব্যবহার হলো **ping** এবং **traceroute**।

## Step 2: ICMP হেডার

ICMP প্যাকেটের গঠন খুব সিম্পল:

```
| Type (1B) | Code (1B) | Checksum (2B) | ডেটা |
```

- **Type**: কোন ধরনের ICMP মেসেজ (8 = Echo Request, 0 = Echo Reply)
- **Code**: Type-এর ভেতরে আরো স্পেসিফিক তথ্য
- **Checksum**: এরর চেক করার জন্য
- **ডেটা**: অতিরিক্ত তথ্য

## Step 3: Echo Request (Ping)

তুমি যখন `ping google.com` চালাও, তখন ICMP **Echo Request** (Type 8) প্যাকেট পাঠাও:

```
ping google.com

Pinging google.com [142.250.190.46] with 32 bytes of data:
Reply from 142.250.190.46: bytes=32 time=12ms TTL=116
Reply from 142.250.190.46: bytes=32 time=11ms TTL=116
```

প্রতিটা রিকোয়েস্টের সাথে একটা **সিকোয়েন্স নম্বর** থাকে যাতে বোঝা যায় কোন রিপ্লাই কোন রিকোয়েস্টের।

## Step 4: Echo Reply

সার্ভার যখন Echo Request পায়, সে **Echo Reply** (Type 0) পাঠায়। রিপ্লাইতে আগের ডেটা ফিরিয়ে দেয় এবং কিছু এক্সট্রা তথ্য যোগ করে:

- **TTL (Time to Live)**: প্যাকেট আরো কতগুলো হপ যেতে পারে
- **RTT (Round Trip Time)**: প্যাকেট যেতে-আসতে কত সময় লাগলো

TTL কমে যায় প্রতিটা রাউটার পাস করার সাথে সাথে। শূন্য হলে প্যাকেট ড্রপ হয়ে যায়।

## Step 5: এরর মেসেজ

ICMP শুধু ping-এর জন্য নয় — এটা বিভিন্ন নেটওয়ার্ক এরর রিপোর্ট করে:

- **Type 3 (Destination Unreachable)**: ডেস্টিনেশন পৌঁছানো সম্ভব হচ্ছে না
  - Code 0: Network Unreachable
  - Code 1: Host Unreachable
  - Code 3: Port Unreachable
- **Type 11 (Time Exceeded)**: TTL শূন্য হয়ে গেছে — এটাই traceroute কাজ করার মূল ভিত্তি
- **Type 5 (Redirect)**: রাউটার বলছে "আরো ভালো পথ আছে"

## Step 6: সারসংক্ষেপ

ICMP হলো ইন্টারনেটের সমস্যা সমাধানকারী। Ping দিয়ে চেক করো কানেকশন আছে কিনা, traceroute দিয়ে দেখো প্যাকেট কোন পথ দিয়ে যাচ্ছে। নেটওয়ার্ক প্রবলেম হলে সবার আগে ping চালাও — অনেক সময় সমস্যার সমাধান হয়ে যায়।
