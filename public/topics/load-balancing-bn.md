---
name: Load Balancing
description: Traffic বণ্টন — L4/L7 balancer, algorithm, health check
category: Advanced Networking
order: 42
---

## Step 1: L4 Load Balancing

**L4 (Layer 4) Load Balancing** transport layer-এ কাজ করে।

এটা শুধু **IP address এবং port number**-র ভিত্তিতে traffic রাউট করে — payload পরীক্ষা করে না।

**কিভাবে কাজ করে:**
• একটা TCP/UDP connection গ্রহণ করে
• Algorithm-এর ভিত্তিতে একটা backend নির্বাচন করে
• কাঁচা packet stream ফরওয়ার্ড করে

**সুবিধা:**
• খুব দ্রুত — প্রতি packet-এ ন্যূনতম প্রসেসিং
• কম latency — payload পরীক্ষা নেই
• উচ্চ throughput — লক্ষ লক্ষ connection পরিচালনা করে

L4 content পরীক্ষার প্রয়োজন না এমন সাধারণ, উচ্চ-পরিমাণ traffic বণ্টনের জন্য আদর্শ।

## Step 2: L7 Load Balancing

**L7 (Layer 7) Load Balancing** application layer-এ কাজ করে।

এটা **HTTP header, URL, cookie এবং content** পরীক্ষা করে বুদ্ধিমানী রাউটিং সিদ্ধান্ত নিতে পারে।

**কিভাবে কাজ করে:**
• Client TCP connection শেষ করে
• HTTP request পরীক্ষা করে
• নিয়মের ভিত্তিতে উপযুক্ত backend-এ রাউট করে

**উদাহরণ নিয়ম:**
• `/api/*` → Backend API server
• `/static/*` → CDN বা file server
• `Host: shop.example.com` → Shopping cart server

L7 content-এর চেতনা সহ রাউটিং সম্ভব করে কিন্তু deep packet inspection-এর কারণে latency যোগ করে।

## Step 3: Load Balancing Algorithm

Load balancer প্রতিটি connection কোন backend পাবে তা সিদ্ধান্ত নিতে একটা **algorithm** ব্যবহার করে:

**Round Robin:**
• Backendগুলো ক্রমিকভাবে ঘুরে ঘুরে আসে
• সমান ক্ষমতার server-এর জন্য সাধারণ এবং ন্যায্য

**Least Connections:**
• সবচেয়ে কম active connection আছে এমন backend-এ রাউট করে
• পরিবর্তনশীল request duration-এর জন্য ভালো

**IP Hash:**
• Client IP hash করে backend নির্ধারণ করে
• একই client সবসময় একই server-এ যায় (session persistence)

**Weighted:**
• Backend-এর weight নির্ধারিত থাকে (যেমন 3:1)
• শক্তিশালী server বেশি traffic পায়

## Step 4: Backend Pool পরিচালনা

Backendগুলো load balancer দ্বারা পরিচালিত একটা **server pool**-এ সাজানো থাকে।

**মূল ধারণা:**
• **Weighting** — Server capacity-র ভিত্তিতে সমানুপাতিকভাবে traffic বরাদ্দ করা
• **Draining** — Active connection না ফেলে দিয়ে সুন্দরভাবে server-কে rotation থেকে সরিয়ে নেওয়া
• **Connection limits** — প্রতি backend-তে concurrent connection-এর সীমা নির্ধারণ
• **Session persistence** — Sticky session নিশ্চিত করে একই client একই backend-তে যায়

যখন একটা backend draining থাকে, নতুন connection অন্যত্র যায় যখন বিদ্যমানগুলো সম্পন্ন হয়। এটা zero-downtime maintenance সম্ভব করে।

## Step 5: Health Check

Load balancer **health check** ব্যবহার করে backend health ধারাবাহিকভাবে পর্যবেক্ষণ করে।

**সক্রিয় probes:**
• **TCP check** — আমরা কি TCP connection স্থাপন করতে পারি?
• **HTTP check** — `GET /health` কি 200 OK রিটার্ন করে?
• Custom check — নির্দিষ্ট endpoint বা response যাচাই করা

**নিষ্ক্রিয় monitoring:**
• প্রকৃত traffic থেকে error rate ট্র্যাক করা
• ধীর response বা timeout সনাক্ত করা

**Failover:**
• যদি backend check-এ ব্যর্থ হয় → **pool থেকে সরিয়ে দেওয়া হয়**
• Traffic সুস্থ backend-এ পুনর্বিতরণ করা হয়
• যখন health ফিরে আসে → **স্বয়ংক্রিয়ভাবে যোগ করা হয়**

Health check load balancer-কে ব্যর্থ বা overloaded server-তে traffic পাঠানো থেকে বিরত রাখে।
