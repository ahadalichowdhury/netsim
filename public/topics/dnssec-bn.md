---
name: DNSSEC
description: DNS Security Extensions — cache poisoning এবং spoofing প্রতিরোধ
category: Advanced Networking
order: 49
---

## Step 1: বিশ্বাসের শৃঙ্খল (Chain of Trust)

**DNSSEC** মূল zone থেকে নিচে পর্যন্ত একটি **বিশ্বাসের শৃঙ্খল (chain of trust)** তৈরি করে।

**Root zone** (.) — অ্যাঙ্কর:
• একটি পরিচিত Key Signing Key (KSK) দিয়ে সাইন করা
• IANA root key signing ceremony এ প্রকাশিত
• Resolvers এই কীকে শুরুর পয়েন্ট হিসেবে বিশ্বাস করে

**কীভাবে কাজ করে:**
1. Root zone, TLD zones কে সাইন করে
2. TLD zones তাদের অধীনের domains কে সাইন করে
3. Domains তাদের নিজস্ব রেকর্ড সাইন করে
4. Resolver root পর্যন্ত প্রতিটি সিগনেচার যাচাই করে

**ফলাফল:** যদি কোনো রেকর্ডে হেরফের করা হয়, তাহলে সিগনেচারের শৃঙ্খল ভেঙে যায়।

## Step 2: DS রেকর্ড

**DS (Delegation Signer)** রেকর্ড — বাবা সন্তানকে সাইন করে।

বাবা zone (যেমন, .com) এ সন্তান zone এর DNSKEY কে hash করে একটি **DS রেকর্ড** থাকে:

`.com → DS: SHA-256 hash of example.com DNSKEY`

**কীভাবে কাজ করে:**
1. বাবা zone নিজস্ব কী দিয়ে DS রেকর্ড সাইন করে
2. Resolver বাবা zone থেকে DS রেকর্ড আনে
3. Resolver hash যাচাই করে যে এটি সন্তান zone এর DNSKEY এর সাথে মিলে

**ফলাফল:** বাবা zone সন্তান zone এর কীকে প্রমাণ দেয় — বিশ্বাসের শৃঙ্খলকে প্রসারিত করে।

## Step 3: RRSIG + DNSKEY

**Resource record**গুলো **RRSIG** দিয়ে সাইন করা হয়।

প্রতিটি DNS রেকর্ড টাইপের সাথে security রেকর্ড সংযুক্ত থাকে:

**DNSKEY:**
• সিগনেচার যাচাই করার জন্য ব্যবহৃত public key ধারণ করে
• Zone Signing Key (ZSK) — পৃথক রেকর্ড সাইন করে
• Key Signing Key (KSK) — DNSKEY রেকর্ডকে নিজেই সাইন করে

**RRSIG:**
• Resource record এর উপর ক্রিপ্টোগ্রাফিক সিগনেচার
• অন্তর্ভুক্ত: signature algorithm, expiration, original TTL
• Zone এর private key ব্যবহার করে তৈরি করা হয়

**কুয়েরি:** `dig example.com +dnssec`

## Step 4: যাচাইকরণ (Validation)

**Resolver** বিশ্বাসের সম্পূর্ণ শৃঙ্খল যাচাই করে।

**যাচাইকরণ প্রক্রিয়া:**
1. Resolver RRSIG সহ একটি DNS response পায়
2. Zone এর DNSKEY আনে
3. DNSKEY এর বিরুদ্ধে RRSIG যাচাই করে
4. বাবা zone থেকে DS রেকর্ড চেক করে
5. বাবা zone এর DS, সন্তান zone এর DNSKEY hash এর সাথে মিলছে কিনা যাচাই করে
6. Root zone পর্যন্ত চালিয়ে যায় (যাকে ইতিমধ্যে বিশ্বাস করে)

**যদি যেকোনো ধাপ ব্যর্থ হয়:**
• সিগনেচার মিলছে না → **SERVFAIL**
• মেয়াদোত্তীর্ণ সিগনেচার → **SERVFAIL**
• অনুপস্থিত সিগনেচার → **SERVFAIL**

**ফলাফল:** DNSSEC-যাচাইকৃত response ক্রিপ্টোগ্রাফিকভাবে প্রমাণিত যে এগুলো প্রকৃত।