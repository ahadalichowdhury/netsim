---
name: OSI এবং TCP-IP Model
description: স্তরিক স্থাপত্য — নেটওয়ার্কিং কেন স্তরে ভাগ করা হয়েছে
category: Networking Fundamentals
order: 28
---

## Step 1: কেন স্তর?

নেটওয়ার্কিং জটিল — ভৌিক cable থেকে application protocol পর্যন্ত। এই জটিলতা পরিচালনা করতে, শিল্পে নেটওয়ার্কিং কে **স্তরে** ভাগ করা হয়েছে।

প্রতিটি স্তরের একটি **নির্দিষ্ট কাজ** আছে এবং এটি সরাসরি উপরের এবং নিচের স্তরগুলোর সাথে যোগাযোগ করে। এটিকে **modularity** বলা হয়।

সুবিধাগুলো:
• **সহজ ডিজাইন** — প্রতিটি স্তর শুধু নিজের বিষয়গুলো handle করে
• **সহজ troubleshooting** — সমস্যা একটি নির্দিষ্ট স্তরে বিচ্ছিন্ন করা যায়
• **Interoperability** — vendor রা অন্য স্তরগুলো না ভেবেই একটি স্তরের জন্য product তৈরি করতে পারে
• **নমনীয়তা** — অন্য স্তরগুলো না পরিবর্তন করেই একটি স্তর বদলানো যায়

## Step 2: Physical Layer (Layer 1)

**Physical Layer** একটি ভৌিক medium এর উপর **bits** এর অবাধ প্রেরণা নিয়ে কাজ করে।

এতে অন্তর্ভুক্ত:
• **Cable** — তামা (Cat5e/Cat6), fiber optic, coaxial
• **Signal** — বৈদ্যুতিক voltage, আলোর pulse, রেডিও wave
• **Connector** — RJ-45, LC, SC
• **Data rate** — 100 Mbps, 1 Gbps, 10 Gbps

এই স্তরে, কোনো address নেই, কোনো frame নেই — শুধুমাত্র তারে **1s এবং 0s**।

## Step 3: Data Link Layer (Layer 2)

**Data Link Layer** একই নেটওয়ার্কে **নির্ভরযোগ্য node-to-node** প্রেরণা প্রদান করে।

মূল ধারণাগুলো:
• **MAC addresses** — ভৌিক hardware identifiers (AA:BB:CC:DD:EE:FF)
• **Ethernet frames** — এই স্তরের data unit
• **Switches** — MAC address table ব্যবহার করে frame forward করে
• **ত্রুটি সনাক্তকরণ** — CRC/FCS checks

Layer 2 একটি **একক local network** এর মধ্যে যোগাযোগ handle করে। ভিন্ন নেটওয়ার্কে পৌঁছাতে গেলে Layer 3 দরকার।

## Step 4: Network Layer (Layer 3)

**Network Layer** বিভিন্ন নেটওয়ার্কের মধ্যে **রুটিং** handle করে।

মূল ধারণাগুলো:
• **IP addresses** — যৌক্তিক addresses (192.168.1.10)
• **Routers** — নেটওয়ার্কগুলোর মধ্যে packet forward করে
• **Packets** — এই স্তরের data unit
• **Routing tables** — সেরা পথ নির্ধারণ করে

Layer 3 source থেকে destination পর্যন্ত সেরা প� খুঁজে বের করে ইন্টারনেট জুড়ে যোগাযোগ সক্ষম করে।

## Step 5: Transport Layer (Layer 4)

**Transport Layer** application গুলোর মধ্যে **end-to-end যোগাযোগ** প্রদান করে।

দুটি মূল protocol:
• **TCP** — নির্ভরযোগ্য, ক্রমিক প্রেরণা acknowledgement সহ
• **UDP** — দ্রুত, connectionless, কোনো guarantee নেই

মূল ধারণাগুলো:
• **Port numbers** — নির্দিষ্ট services শনাক্ত করে (80 = HTTP, 443 = HTTPS)
• **Segments** — এই স্তরের data unit
• **Flow control** — receiver কে ভারাক্রান্ত হওয়া থেকে বিরত রাখে

## Step 6: Session/Presentation/Application (Layers 5-7)

উপরের তিনটি স্তর **application-level** বিষয়গুলো handle করে:

**Layer 5 — Session:**
• Application গুলোর মধ্যে session পরিচালনা করে
• Authentication এবং পুনরায় সংযোগ

**Layer 6 — Presentation:**
• Data formatting, encryption, compression
• SSL/TLS encryption এখানে ঘটে

**Layer 7 — Application:**
• যে protocols ব্যবহারকারীরা সরাসরি ব্যবহার করে
• HTTP, DNS, SMTP, FTP, SSH

প্রকৃত ব্যবহারে, TCP/IP model এই তিনটিকে একটি single **Application layer** এ একত্রিত করে।

## Step 7: TCP/IP Model (4 Layers)

**TCP/IP model** হলো প্রকৃত, বাস্তব জগতের model যা আজ ইন্টারনেটে ব্যবহার হয়। এটি OSI model কে **4 layers** এ সরল করে:

• **Application** — HTTP, DNS, SMTP (OSI layers 5-7 একত্রিত করে)
• **Transport** — TCP, UDP (OSI layer 4 এর মতোই)
• **Internet** — IP, ICMP (OSI layer 3 এর মতোই)
• **Network Access** — Ethernet, WiFi (OSI layers 1-2 একত্রিত করে)

**মূল কথা:** দুটো model একই ধারণা বর্ণনা করে — TCP/IP শুধু বেশি ব্যবহারিক। যখন মানুষ নেটওয়ার্কিং এ "layers" বলে, তারা সাধারণত TCP/IP model বোঝে।
