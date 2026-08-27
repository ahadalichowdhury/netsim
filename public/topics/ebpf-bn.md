---
name: eBPF নেটওয়ার্কিং
description: Programmable kernel — kernel module ছাড়াই packet processing
category: Advanced Networking
order: 53
---

## Step 1: eBPF প্রোগ্রাম

**eBPF** (extended Berkeley Packet Filter) Linux kernel এর মধ্যে **নিরাপদ, যাচাইকৃত প্রোগ্রাম** চালানোর অনুমতি দেয়।

কীভাবে কাজ করে:
1. C বা restricted BPF এ একটি প্রোগ্রাম লিখুন
2. **Verifier** যাচাই করে যে এটি নিরাপদ (কোনো crash নেই, কোনো loop নেই)
3. **JIT compiler** এটিকে native machine code তে রূপান্তরিত করে
4. প্রোগ্রামটি একটি kernel hook এ সংযুক্ত করা হয়

eBPF প্রোগ্রাম **kernel speed** এ চলে — userspace এ context switch হয় না।

## Step 2: Hook Points

eBPF প্রোগ্রাম নির্দিষ্ট **kernel hook points** এ সংযুক্ত হয়:

• **XDP (eXpress Data Path)** — প্রাথমিক hook, kernel network stack এর আগে চলে। Filtering/routing এর জন্য সর্বোচ্চ পারফরম্যান্স।
• **TC (Traffic Control)** — traffic control layer এ চলে, XDP এর পরে কিন্তু socket layer এর আগে।
• **Socket hooks** — application-aware processing এর জন্য socket level এ চলে।

যত আগে hook, তত কম kernel code traverse হয় — XDP সবচেয়ে দ্রুত।

## Step 3: eBPF Maps

**eBPF Maps** হলো eBPF প্রোগ্রাম এবং userspace এর মধ্যে শেয়ার করা **key-value store**।

এগুলো সক্ষম করে:
• **Stateful processing** — connection, counter, statistics ট্র্যাক করা
• **Communication** — প্রোগ্রামগুলো একে অপরের সাথে ডেটা শেয়ার করতে পারে
• **Userspace access** — userspace tool থেকে map পড়া/আপডেট করা

সাধারণ map টাইপ: **HashMap**, **ArrayMap**, **LPM Trie** (longest prefix match), **Ring Buffer**।

## Step 4: ব্যবহারের ক্ষেত্র

eBPF বেশ কয়েকটি প্রধান নেটওয়ার্কিং প্রজেক্টকে চালিত করে:

• **Cilium** — Kubernetes CNI (Container Network Interface) যা eBPF ব্যবহার করে উচ্চ-কার্যক্ষম নেটওয়ার্কিং, load balancing এবং security policy এর জন্য
• **Falco** — runtime security threat detection যা eBPF ব্যবহার করে syscall activity মনিটর করে
• **bcc** — BPF Compiler Collection tracing এবং observability এর জন্য (tcpdump, network statistics)

eBPF kernel module এর প্রয়োজনীয়তা দূর করে — প্রোগ্রাম kernel দ্বারা যাচাইকৃত এবং sandboxed থাকে।