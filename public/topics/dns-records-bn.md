---
name: DNS রেকর্ড
description: ফোনবুকের এন্ট্রি — A, AAAA, CNAME, MX, TXT এবং আরও অনেক কিছু
category: Networking Fundamentals
order: 33
---

## Step 1: A রেকর্ড (IPv4)

একটি **A রেকর্ড** একটি hostname কে একটি **IPv4 address** এর সাথে ম্যাপ করে।

`example.com → 93.184.216.34`

এটি সবচেয়ে মৌলিক DNS রেকর্ড। যখন আপনি আপনার ব্রাউজারে একটি URL টাইপ করেন, তখন প্রথম কাজ হলো A রেকর্ডের মাধ্যমে domain name কে একটি IP address এ রূপান্তরিত করা।

**মূল তথ্য:**
• 32-bit IPv4 address রিটার্ন করে
• Load balancing এর জন্য একটি hostname এ একাধিক A রেকর্ড থাকতে পারে
• TTL (Time To Live) caching সময়কাল নিয়ন্ত্রণ করে

**কুয়েরি:** `dig example.com A`

## Step 2: AAAA রেকর্ড (IPv6)

একটি **AAAA রেকর্ড** (কোয়াড-A) একটি hostname কে একটি **IPv6 address** এর সাথে ম্যাপ করে।

`example.com → 2606:2800:220:1::248`

IPv4 address শেষ হয়ে যাওয়ার সাথে সাথে, AAAA রেকর্ড আধুনিক ওয়েবসাইটের জন্য অপরিহার্য হয়ে পড়ে। একটি domain এ A এবং AAAA উভয় রেকর্ডই থাকতে পারে — যদি IPv6 পাওয়া যায়, তাহলে clients প্রথমে IPv6 ব্যবহার করার চেষ্টা করে।

**মূল তথ্য:**
• 128-bit IPv6 address রিটার্ন করে
• "AAAA" নামকরণ করা হয়েছে কারণ IPv6 address, IPv4 চেয়ে ৪ গুণ বড়
• Dual-stack: বেশিরভাগ সাইটই A এবং AAAA উভয়ই চালায়

**কুয়েরি:** `dig example.com AAAA`

## Step 3: CNAME (Alias)

একটি **CNAME রেকর্ড** (Canonical Name) একটি hostname কে অন্য একটি hostname এর দিকে নির্দেশ করে।

`www.example.com → example.com`

CNAME ব্যবহার করা হয় alias এর জন্য। IP address ডুপ্লিকেট করার পরিবর্তে, আপনি একটি alias কে canonical domain এর দিকে নির্দেশ করেন। তারপর resolver target এর A/AAAA রেকর্ড খুঁজে বের করে।

**মূল তথ্য:**
• অবশ্যই একটি hostname এর দিকে নির্দেশ করতে হবে, IP এর দিকে নয়
• একই নামে অন্য রেকর্ডের সাথে সহাবস্থান করতে পারে না
• সাধারণ ব্যবহার: www → naked domain
• chain lookup latency বাড়ায়

**কুয়েরি:** `dig www.example.com CNAME`

## Step 4: MX (Mail Exchange)

একটি **MX রেকর্ড** ইমেইল গ্রহণের দায়িত্বপ্রাপ্ত mail server নির্ধারণ করে।

`example.com → mail.example.com (priority 10)`

MX রেকর্ডে একটি **priority number** থাকে — কম মান আগে চেষ্টা করা হয়। যদি প্রাথমিক server ডাউন থাকে, তাহলে ইমেইল পরবর্তী priority তে পাঠানো হয়।

**মূল তথ্য:**
• অবশ্যই একটি hostname এর দিকে নির্দেশ করতে হবে (IP নয়)
• Priority ডেলিভারি অর্ডার নির্ধারণ করে
• Redundancy এর জন্য একাধিক MX রেকর্ড থাকে
• ইমেইল গ্রহণের জন্য আবশ্যক

**কুয়েরি:** `dig example.com MX`

## Step 5: TXT (Text)

**TXT রেকর্ড** যেকোনো টেক্সট সংরক্ষণ করে। প্রাথমিকভাবে মানুষের পড়ার জন্য নোট হিসেবে ব্যবহৃত হলেও, এখন এগুলো গুরুত্বপূর্ণ security এবং verification উদ্দেশ্যে ব্যবহৃত হয়।

**সাধারণ ব্যবহার:**
• **SPF** — আপনার domain এর পক্ষ থেকে ইমেইল পাঠানোর জন্য mail server কে অনুমোদন দেয়
• **DKIM** — ক্রিপ্টোগ্রাফিক ইমেইল সাইনিং
• **DMARC** — ইমেইল authentication নীতি
• **Domain verification** — সার্ভিসগুলোকে (Google, Cloudflare) ownership প্রমাণ করে
• **SSL verification** — Let's Encrypt DNS-01 challenge

**উদাহরণ SPF:**
`v=spf1 include:_spf.google.com ~all`

**কুয়েরি:** `dig example.com TXT`

## Step 6: DNS রেকর্ড সারসংক্ষেপ

**DNS রেকর্ড টাইপের সারসংক্ষেপ:**

• **A** — hostname কে IPv4 address এ ম্যাপ করে
• **AAAA** — hostname কে IPv6 address এ ম্যাপ করে
• **CNAME** — অন্য একটি hostname এর দিকে নির্দেশকারী alias
• **MX** — priority সহ mail server
• **TXT** — টেক্সট ডেটা (SPF, DKIM, verification)
• **NS** — zone এর জন্য authoritative name server
• **SOA** — Start of Authority — zone এর metadata (serial, refresh, retry, expire)
• **PTR** — Reverse DNS — IP কে hostname এ ম্যাপ করে

**কমান্ড:**
`dig example.com` — সম্পূর্ণ কুয়েরি
`dig +short example.com` — শুধু IP
`nslookup example.com` — সাধারণ lookup
`host example.com` — দ্রুত চেক