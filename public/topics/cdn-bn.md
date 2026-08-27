---
name: CDN
description: Content Delivery Networks — বৈশ্বিক পারফরম্যান্সের জন্য edge caching
category: Advanced Networking
order: 43
---

## Step 1: Edge Locations — POPs বিশ্বব্যাপী

একটি **CDN (Content Delivery Network)** বিশ্বব্যাপী **Points of Presence (POPs)** জুড়ে content বিতরণ করে।

প্রতিটি POP-এ **edge server** থাকে যা origin content-র কপি cache করে।

**কীভাবে সাহায্য করে:**
• **Latency কমে** — content নিকটতম edge থেকে পরিবেশিত হয়, origin থেকে নয়
• **Bandwidth কমে** — origin শুধুমাত্র cache miss পরিবেশন করে
• **উচ্চ সহজলভ্যতা** — একটি edge ব্যর্থ হলে, অন্যগুলো content পরিবেশন করে
• **DDoS সুরক্ষা** — traffic অনেকগুলো edge server-এ বিতরিত হয়

জনপ্রিয় CDNs-এর মধ্যে আছে Cloudflare, AWS CloudFront, Akamai এবং Fastly।

## Step 2: DNS-Based Routing

CDN ব্যবহারকারীদের নিকটতম edge server-এ পরিচালিত করতে **DNS routing** ব্যবহার করে।

**GeoDNS:**
• DNS resolver ব্যবহারকারীর ভৌগোলিক অবস্থানের ভিত্তিতে সবচেয়ে কাছের edge-র IP ফেরত দেয়
• ইউরোপীয় ব্যবহারকারী → London POP, এশীয় ব্যবহারকারী → Tokyo POP

**Anycast:**
• একাধিক edge server একই IP address বিজ্ঞাপন দেয়
• BGP routing স্বাভাবিকভাবে traffic নিকটতম server-এ পরিচালিত করে
• একই IP, ভিন্ন ভৌতিক অবস্থান

ব্যবহারকারী জানে না কোন edge-তে পৌঁছাচ্ছে — CDN transparently routing পরিচালনা করে।

## Step 3: Cache Strategy — HIT বনাম MISS

যখন একটি ব্যবহারকারী content অনুরোধ করে, edge server তার **cache** চেক করে:

**Cache HIT:**
• Content edge cache-এ আছে এবং এখনো fresh (TTL-র মধ্যে)
• Edge সাথে সাথে পরিবেশন করে — দ্রুত!
• Origin server-এ কোনো অনুরোধ নেই

**Cache MISS:**
• Content cache করা নেই বা মেয়াদোত্তীর্ণ হয়েছে
• Edge origin server থেকে fetch করে
• ভবিষ্যতের অনুরোধের জন্য একটি কপি সংরক্ষণ করে
• ব্যবহারকারীকে response পরিবেশন করে

**TTL (Time To Live):**
• কন্ট্রোল করে কতক্ষরা cached content fresh থাকে
• ছোট TTL → বেশি origin fetch, কিন্তু fresher content
• লম্বা TTL → কম origin fetch, কিন্তু stale content-র ঝুঁকি

## Step 4: CDN সারসংক্ষেপ

**CDN মডেল:**

**Pull CDN:**
• Edge প্রথম অনুরোধে origin থেকে fetch করে (cache miss)
• প্রয়োজন অনুযায়ী content automatically pulled হয়
• ভালো: গতিশীল বা ঘন ঘন আপডেট করা content-এর জন্য

**Push CDN:**
• Content আগে থেকে edge-তে push করা হয়
• Origin নিয়ন্ত্রণ করে কখন এবং কী বিতরণ করতে হবে
• ভালো: পূর্বাভাসযোগ্য প্রবেশ প্যাটার্ন সহ static content-এর জন্য

**Cache Invalidation:**
• TTL মেয়াদোত্তীর্ণ হওয়ার আগে cached content মুছুন
• URL, tag, বা সম্পূর্ণ cache দিয়ে purge করুন
• Content update বা জরুরি সংশোধনের জন্য অপরিহার্য

**Protocols:**
• HTTP/HTTPS — web content, APIs
• Video streaming — HLS, DASH segments
• Software updates — OS patches, app downloads

CDNs অপরিহার্য infrastructure — তারা বিশ্বব্যাপী সমস্ত web traffic-এর 50% এর বেশি পরিবেশন করে।
