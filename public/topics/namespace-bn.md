---
name: Network Namespaces
description: namespace এবং veth pair দিয়ে Linux নেটওয়ার্ক বিচ্ছিন্নতা
category: Linux Core Networking
order: 26
---

## Step 1: দুটি বিচ্ছিন্ন network namespace: app1 এবং app2

**Linux network namespace** সম্পূর্ণ network stack বিচ্ছিন্নতা প্রদান করে। প্রতিটি namespace-এর নিজের ইন্টারফেস, route এবং iptables rule থাকে।

আমরা দুটি namespace তৈরি করেছি:
`ip netns add app1`
`ip netns add app2`

তারা একে অপরের জন্য সম্পূর্ণ অদৃশ্য — যেন দুটি আলাদা মেশিন।

**পূর্বশর্ত:** আগে **Network Interface (NIC)** এবং **Network Stack** বোঝা প্রয়োজন।

## Step 2: প্রতিটি namespace-এর নিজের network stack আছে

প্রতিটি namespace তার নিজের স্বাধীন **network stack** চালায়:
• নিজের **loopback** (lo) ইন্টারফেস
• নিজের **routing table**
• নিজের **iptables/nftables** rule
• নিজের **socket** সেট

যদি আপনি `ip netns exec app1 ip addr` চালান, আপনি শুধু lo ইন্টারফেস দেখবেন — eth0 নেই, bridge নেই, আর কিছুই নেই।

## Step 3: Veth pair namespace কে bridge-এর সাথে সংযুক্ত করে

**Veth pair** হলো ভার্চুয়াল Ethernet কেবল — যেটা এক প্রান্তে ঢোকে সেটা অন্য প্রান্তে বের হয়।

আমরা দুটি veth pair তৈরি করি:
`ip link add veth-a type veth peer name veth-a-br`
`ip link add veth-b type veth peer name veth-b-br`

তারপর এক প্রান্ত প্রতিটি namespace-এ সরিয়ে অন্য প্রান্তটি bridge-এ সংযুক্ত করি:
`ip link set veth-a netns app1`
`ip link set veth-b netns app2`
`brctl addif br0 veth-a-br`
`brctl addif br0 veth-b-br`

## Step 4: app1 বাইরের জগতে packet পাঠায়

Namespace **app1** ইন্টারনেটের দিকে একটি packet পাঠায়।

Namespace-এর ভেতরে, packet **veth-a** দিয়ে যায় — veth pair একটি ভার্চুয়াল কেবলের মতো কাজ করে, frameটাকে bridge-এর বাইরে বহন করে।

## Step 5: Veth-a bridge br0-তে ফরওয়ার্ড করে

veth pair-এর অন্য প্রান্ত frameটাকে **bridge br0**-তে পৌঁছায়।

Bridge veth-a-র সাথে সংযুক্ত পোর্টে frame গ্রহণ করে এবং সাধারণ bridge প্রসেসিং শুরু করে: সোর্স MAC শেখে এবং destination খুঁজে দেখে।

## Step 6: Bridge ইন্টারনেটের দিকে ফরওয়ার্ড করে

Bridge destination খুঁজে দেখে — এটা স্থানীয় নয়, তাই frameটা তার **আপলিঙ্ক পোর্ট** দিয়ে ইন্টারনেটের দিকে ফরওয়ার্ড করে।

Packetটি সফলভাবে app1-এর namespace ছেড়ে, veth pair পার করে, bridge করে, এবং বাইরের জগতে পৌঁছেছে।

## Step 7: এখন app2 পাঠাতে চায় — কিন্তু namespace বিচ্ছিন্ন

Namespace **app2**-ও packet পাঠাতে চায়। কিন্তু এখানে মূল কথা: app2 এবং app1 **সম্পূর্ণ আলাদা network namespace**-তে আছে।

App2, app1-এর ইন্টারফেস, ARP table বা routing table দেখতে পায় না। তারা কার্নেল স্তরে বিচ্ছিন্ন।

তবুও, app2 *করতে পারে* তার নিজের veth pair (veth-b) দিয়ে bridge-এ পৌঁছাতে, কারণ bridge দুটো namespace-এরই বাইরে একটি ভাগাভাগি সম্পদ।

## Step 8: App2-র packet bridge-তে পৌঁছায়

App2 **veth-b** দিয়ে packet পাঠায়, যেটা bridge-তে পৌঁছায়।

Bridge এখন **দ্বিতীয় namespace** থেকে traffic দেখতে পায়। সে app2-র MAC veth-b-br পোর্টে শেখে। দুটি namespace একই bridge ভাগ করে কিন্তু একে অপর থেকে বিচ্ছিন্ন থাকে।

## Step 9: Bridge ফরওয়ার্ড করতে পারে — namespace bridge ভাগ করে

Bridge app2-র packet ইন্টারনেটে ফরওয়ার্ড করে, ঠিক app1-এর মতো।

**মূল ধারণা:** দুটি namespace একে অপর থেকে বিচ্ছিন্ন, কিন্তু তারা দুটোই **ভাগাভাগি bridge**-তে পৌঁছাতে পারে এবং বাইরের জগতের সাথে যোগাযোগ করতে পারে।

এটাই container (Docker, Podman) কিভাবে ইন্টারনেট অ্যাক্সেস দেওয়ার পাশাপাশি নেটওয়ার্ক বিচ্ছিন্নতা প্রদান করে।

## Step 10: Network namespace সারসংক্ষেপ

**মূল কথা:** Linux network namespace কার্নেল স্তরে **সম্পূর্ণ নেটওয়ার্ক বিচ্ছিন্নতা** প্রদান করে।

কিভাবে কাজ করে:
1. প্রতিটি namespace-এর নিজের **network stack** আছে (ইন্টারফেস, route, iptables)
2. **Veth pair** namespace কে বাইরের সাথে সংযুক্ত করে (যেমন ভার্চুয়াল Ethernet কেবল)
3. একটি **bridge** একাধিক namespace সংযুক্ত করতে পারে এবং ইন্টারনেট অ্যাক্সেস প্রদান করে
4. Namespace একে অপর থেকে **বিচ্ছিন্ন** — তারা একে অপরের traffic দেখতে পায় না

ব্যবহৃত হয়: Docker, Podman, Kubernetes, LXC/LXD, network function virtualization (NFV) দ্বারা।
