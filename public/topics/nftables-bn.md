---
name: nftables
description: আধুনিক Linux firewall — iptables এর উত্তরাধিকারী
category: Linux Core Networking
order: 38
---

## Step 1: nftables Tables

nftables firewall rules কে প্রোটোকল family অনুযায়ী **tables** এ সাজায়:

**ip** — IPv4 rules
**ip6** — IPv6 rules
**inet** — IPv4 এবং IPv6 উভয়ই
**arp** — ARP rules

Tables হলো chains এর container। একটি single table প্রদত্ত প্রোটোকল family এর জন্য আপনার সব firewall rules ধারণ করতে পারে।

## Step 2: Chains

প্রতিটি table এর মধ্যে, **chains** নির্ধারণ করে packet flow এ rules কোথায় evaluate করা হবে:

**input** — firewall নিজের দিকে আসা packets
**forward** — firewall এর মধ্য দিয়ে যাওয়া packets
**output** — firewall থেকে শুরু হওয়া packets

Chains **hooks** (prerouting, input, forward, output, postrouting) এ সংযুক্ত থাকে যা নির্ধারণ করে কখন এগুলো execute হবে।

## Step 3: Rules এবং Expressions

প্রতিটি chain এ একটি ক্রমিক **rules** এর তালিকা থাকে। প্রতিটি rule এ **match conditions** এবং একটি **action** থাকে:

উদাহরণ rule:
`tcp dport 22 accept`

এটি port 22 এর TCP packets match করে এবং গ্রহণ করে। কোনো rule match না হলে, chain এর **default policy** প্রয়োগ হয়।

## Step 4: nft vs iptables

**nftables** হলো iptables এর আধুনিক উত্তরাধিকারী যার মূল সুবিধাগুলো হলো:

**Atomic ruleset পরিবর্তন** — লকিং ছাড়াই সম্পূর্ণ ruleset প্রতিস্থাপন করা যায়
**ভালো পারফরম্যান্স** — optimized kernel backend
**সহজ সিনট্যাক্স** — পড়ার জন্য সহজ configuration
**Native set/map সমর্থন** — IP, port, interface এর efficient matching
**Unified framework** — iptables, ip6tables, arptables, ebtables কে প্রতিস্থাপন করে

বেশিরভাগ আধুনিক Linux distribution এখন nftables কে default firewall হিসাবে ব্যবহার করে।
