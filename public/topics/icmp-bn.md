---
name: ICMP
description: নেটওয়ার্ক বার্তাবাহক — ping, traceroute, error reporting
category: Networking Fundamentals
order: 29
---

## Step 1: ICMP কী?

**ICMP (Internet Control Message Protocol)** হলো **error reporting** এবং **diagnostics** এর জন্য ব্যবহৃত একটি network-layer protocol।

TCP বা UDP এর বিপরীতে, ICMP application data পরিবহনের জন্য ব্যবহার করা হয় না। বরং, এটি নেটওয়ার্কের অবস্থা সম্পর্কে প্রতিক্রিয়া প্রদান করে:
• Destination পৌঁছানো সম্ভব কিনা?
• কোনো packet বর্জিত হয়েছে কিনা?
• নেটওয়ার্ক congested কিনা?

ICMP **Layer 3** এ কাজ করে (সরাসরি IP তে encapsulate) এবং ডেলিভারির জন্য IP ব্যবহার করে — কিন্তু এটি একটি transport protocol নয়।

## Step 2: ICMP Header

ICMP মেসেজের একটি সহজ header structure আছে:

`Type (8 bits)` — মেসেজের টাইপ চিহ্নিত করে (যেমন, 8 = Echo Request)
`Code (8 bits)` — টাইপের জন্য অতিরিক্ত বিবরণ প্রদান করে
`Checksum (16 bits)` — error detection
`Data` — variable payload (প্রায়ই আসল packet header)

Type এবং Code ফিল্ড একসাথে ICMP মেসেজের উদ্দেশ্য নির্ধারণ করে।

## Step 3: Echo Request (ping)

**ping** কমান্ড ICMP **Echo Request** মেসেজ (Type 8, Code 0) পাঠায় connectivity পরীক্ষা করতে।

যখন আপনি `ping 8.8.8.8` টাইপ করেন:
• আপনার host destination কে একটি ICMP Echo Request পাঠায়
• Destination ICMP Echo Reply (Type 0) দিয়ে উত্তর দেয়
• Round-trip time পরিমাপ করা হয়

Ping হলো সবচেয়ে সাধারণ ICMP ব্যবহারের ক্ষেত্র — এটি "তুমি কি সেখানে আছো?" এর নেটওয়ার্ক সমতুল্য।

## Step 4: Echo Reply

Destination Echo Request গ্রহণ করে এবং একটি **Echo Reply** (Type 0, Code 0) দিয়ে উত্তর দেয়।

উত্তরে request এ পাঠানো একই ডেটা থাকে, যা source কে যাচাই করতে দেয় যে ডেটা অক্ষত ভাবে প্রাপ্ত হয়েছে।

**Traceroute** এটির উপর ভিত্তি করে incrementing TTL মান সহ packet পাঠায়। প্রতিটি router যেটি TTL 0 এ কমায় সে একটি ICMP **Time Exceeded** মেসেজ (Type 11) পাঠায়, পথ প্রকাশ করে।

## Step 5: Error Message

যখন packet ডেলিভার করা যায় না, তখন ICMP **error message** তৈরি করে:

**Type 3 — Destination Unreachable:**
• Code 0: Network unreachable
• Code 1: Host unreachable
• Code 2: Protocol unreachable
• Code 3: Port unreachable

**Type 11 — Time Exceeded:**
• Code 0: TTL transit এ expired (traceroute দ্বারা ব্যবহৃত)
• Code 1: Fragment reassembly timeout

এই মেসেজগুলো destination এ প্রবেশ ছাড়াই **নেটওয়ার্ক সমস্যা নির্ণয়** করতে সাহায্য করে।

## Step 6: ICMP সারসংক্ষেপ

**মূল ICMP মেসেজ টাইপ:**

`Type 0` — Echo Reply (ping এর উত্তর)
`Type 8` — Echo Request (ping)
`Type 3` — Destination Unreachable
`Type 5` — Redirect (ভালো পথ ব্যবহার করুন)
`Type 11` — Time Exceeded (TTL expired)
`Type 13` — Timestamp Request

**ICMP ব্যবহারকারী সাধারণ টুল:**
• **ping** — Echo Request/Reply (Types 8/0)
• **traceroute** — Time Exceeded (Type 11) + Echo Reply (Type 0)
• **path MTU discovery** — "DF set" সহ Unreachable (Type 3, Code 4)