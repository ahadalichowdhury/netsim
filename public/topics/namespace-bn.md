---
name: Network Namespaces - Linux আইসোলেশন
description: Linux-এ Network Namespaces কীভাবে কাজ করে — আলাদা নেটওয়ার্ক স্ট্যাক, veth pairs, bridge — সব বাংলায়
---

# Network Namespaces — Linux আইসোলেশন

আজ দেখবো Linux-এ Network Namespaces কী এবং এটা দিয়ে কীভাবে আলাদা আলাদা নেটওয়ার্ক তৈরি করা যায়।

## Step 1: দুটো আলাদা Namespace

ধরো তোমার Linux machine-এ দুটো আলাদা Network Namespace আছে:

- **ns-app1:** app1 চলছে এখানে (IP: `10.0.0.2`)
- **ns-app2:** app2 চলছে এখানে (IP: `10.0.1.2`)

প্রতিটা namespace সম্পূর্ণ আলাদা — একটার নেটওয়ার্ক আরেকটা দেখতে পায় না।

## Step 2: প্রতিটার নিজের Network Stack

প্রতিটা namespace-র নিজের আলাদা network stack আছে:

- নিজের IP address
- নিজের routing table
- নিজের firewall rules
- নিজের network interfaces

মনে করো দুটো আলাদা মেশিন — শুধু একটাই Linux kernel।

## Step 3: Veth Pairs দিয়ে সংযোগ

দুটো namespace-কে সংযুক্ত করতে **veth pairs** ব্যবহার হয়। Veth pair মানে হলো ভার্চুয়াল Ethernet ক্যাবল — এক পাশে একটা interface, অন্য পাশে আরেকটা।

```bash
# ns-app1-এর জন্য
ip link add veth-a type veth peer name veth-b
ip link set veth-b netns ns-app1

# ns-app2-এর জন্য
ip link add veth-c type veth peer name veth-d
ip link set veth-d netns ns-app2
```

`veth-a` এবং `veth-c` host-এ থাকে, `veth-b` এবং `veth-d` নিজের namespace-তে চলে যায়।

## Step 4: app1 প্যাকেট পাঠায়

app1 (ns-app1, `10.0.0.2`) app2 (`10.0.1.2`)-তে প্যাকেট পাঠাতে চায়। app1 routing table-এ লেখা `10.0.1.0/24`-র জন্য gateway `10.0.0.1`। app1 প্যাকেটটা `veth-b` দিয়ে পাঠায়।

## Step 5: Veth-a-তে পৌঁছায়

veth pair দিয়ে যা ns-app1-তে `veth-b`, সেটা host-তে `veth-a`। প্যাকেটটা `veth-a`-তে পৌঁছায়।

## Step 6: Bridge-এ পৌঁছায়

Host-এ একটা **bridge** (যেমন `br0`) আছে যেটা দুটো namespace-কে সংযুক্ত করে। `veth-a` bridge-এর সাথে সংযুক্ত। bridge প্যাকেটটা গ্রহণ করে।

```bash
# Bridge তৈরি
brctl addbr br0
brctl addif br0 veth-a
brctl addif br0 veth-c
```

## Step 7: Bridge Forward করে

Bridge দেখে ডেস্টিনেশন IP `10.0.1.2` — এটা `veth-c`-র পাশে। তাই bridge প্যাকেটটা `veth-c`-র দিকে forward করে।

## Step 8: app2 প্যাকেট পায়

app2 (ns-app2) `veth-d`-তে প্যাকেট পায়। ডেস্টিনেশন IP মেলে — `10.0.1.2`। গ্রহণ করে।

## Step 9: Reply ফিরে যায়

app2 reply তৈরি করে:

- **Source IP:** `10.0.1.2`
- **Destination IP:** `10.0.0.2`

Reply প্যাকেটটা ঠিক উল্টো দিকে যায়:
`veth-d` → `veth-c` → bridge → `veth-a` → `veth-b` → app1

## Step 10: সারসংক্ষেপ

Network Namespaces দিয়ে যা করা যায়:

- **আলাদা Namespace:** প্রতিটা সম্পূর্ণ আলাদা নেটওয়ার্ক স্ট্যাক পায়
- **Veth Pairs:** দুটো namespace-কে ভার্চুয়াল ক্যাবল দিয়ে সংযুক্ত করে
- **Bridge:** একাধিক namespace-কে একসাথে সংযুক্ত করে (ভার্চুয়াল switch)
- **Routing:** Kernel routing table দিয়ে প্যাকেট সঠিক namespace-তে পৌঁছায়

Docker, Kubernetes, Podman — সবই এই network namespace ব্যবহার করে কন্টেইনারদের আলাদা নেটওয়ার্ক দিতে!
