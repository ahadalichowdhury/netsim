---
name: MPLS - লেবেল সুইচিং
description: MPLS কীভাবে কাজ করে — FEC, Label Push, Swap, Pop সব বাংলায় সহজে বোঝানো হয়েছে
---

# MPLS — লেবেল সুইচিং

আজ দেখবো MPLS (Multi-Protocol Label Switching) কী এবং এটা কীভাবে কাজ করে।

## Step 1: FEC — প্যাকেট গ্রুপ করো

MPLS শুরু হয় **FEC (Forwarding Equivalence Class)** দিয়ে। FEC মানে হলো একই ধরনের প্যাকেটকে একসাথে গ্রুপ করা।

উদাহরণ:
- সব HTTP traffic → FEC 1
- সব Video traffic → FEC 2
- সব Database traffic → FEC 3

MPLS router জানে যে FEC 1-এর প্যাকেটগুলো একই পথে যাবে, FEC 2-এর আরেকটা পথে। এটাই MPLS-এর efficiency।

## Step 2: Label Push — লেবেল জুড়ে দাও

যখন প্যাকেট MPLS network-এ প্রবেশ করে, তখন **Ingress LSR** (Label Switch Router) প্যাকেটের আগে একটা **MPLS Label** জুড়ে দেয়।

লেবেল দেখতে এরকম:

```
+-------------------+-------------------+
| MPLS Label (20b)  | TC (3b) | S | TTL |
+-------------------+-------------------+
|  32                |  0     | 1 |  64  |
+-------------------+-------------------+
```

- **Label:** 20-bit — শনাক্তকারী নম্বর
- **TC:** Traffic Class — priority নির্দেশ করে
- **S:** Stack bit — একাধিক লেবেল থাকতে পারে
- **TTL:** Time to Live — পুরোনো IP TTL-ের মতো

এখন প্যাকেট IP header-এর আগে MPLS header বহন করে।

## Step 3: Label Swap — লেবেল বদলাও

MPLS network-এর ভেতরে **Transit LSR** রাউটারগুলো শুধু লেবেল দেখে কাজ করে — IP header দেখে না।

প্রতিটা Transit LSR:
1. ইনকামিং লেবেল দেখে
2. তার নিজের forwarding table-এ চেক করে
3. পুরোনো লেবেল বাদ দেয়
4. নতুন লেবেল জুড়ে দেয়
5. নতুন পোর্টে পাঠায়

উদাহরণ:
- Router A: Label 32 পায় → Label 50 দিয়ে Router B-তে পাঠায়
- Router B: Label 50 পায় → Label 18 দিয়ে Router C-তে পাঠায়

এটাই **Label Swap** — প্রতিটা hop-এ লেবেল বদলায়, কিন্তু প্যাকেট একই পথে চলতে থাকে।

## Step 4: Label Pop — লেবেল সরাও

যখন প্যাকেট MPLS network-এর শেষে পৌঁছায়, তখন **Egress LSR** শেষ MPLS label সরিয়ে দেয়। এটাকে **Label Pop** বলে।

এরপর প্যাকেট আবার সাধারণ IP packet হিসেবে বাইরের নেটওয়ার্কে যায়।

কিছু ক্ষেত্রে **PHP (Penultimate Hop Popping)** হয় — মানে শেষ আগের router-ই label সরিয়ে দেয়, শেষ router-কে আর কাজ করতে হয় না।

## Step 5: সারসংক্ষেপ

MPLS কীভাবে কাজ করে:

- **FEC:** প্যাকেটকে গ্রুপ করো — কোন traffic কোন পথে যাবে
- **Label Push:** MPLS network-এ ঢোকার সময় লেবেল জুড়ে দাও
- **Label Swap:** ভেতরে routerগুলো শুধু লেবেল দেখে ফরোয়ার্ড করে — দ্রুত!
- **Label Pop:** MPLS network থেকে বের হওয়ার সময় লেবেল সরাও

MPLS-এর সুন্দরতা হলো — প্যাকেট প্রবেশ করার পর IP header আর দেখতে হয় না। শুধু লেবেল দেখে কাজ করে, তাই অনেক দ্রুত!
