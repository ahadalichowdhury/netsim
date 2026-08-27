---
name: OSPF
description: Link-state routing — enterprise এর মধ্যে দ্রুত convergence
category: Advanced Networking
order: 40
---

## Step 1: OSPF Areas

OSPF routing updates এর পরিসর সীমিত করতে নেটওয়ার্ক কে **areas** তে ভাগ করে।

**Area 0 (Backbone)** হলো মূল — অন্য সব area কে অবশ্যই এর সাথে সংযুক্ত হতে হবে। এই hierarchy link-state database এর আকার কমায় এবং convergence বাড়ায়।

**মূল বিষয়গুলো:**
• Area 0 বাধ্যতামূলক (backbone)
• প্রতিটি area তার নিজের LSDB বজায় রাখে
• Inter-area routing backbone এর মধ্য দিয়ে যায়

## Step 2: Area Border Routers

একটি **ABR (Area Border Router)** এক বা একাধিক area কে backbone এর সাথে সংযুক্ত করে।

ABR areas গুলোর মধ্যে routes summarize করে, LSA flooding এর পরিমাণ কমায়। এটি প্রতিটি area এর জন্য আলাদা link-state database বজায় রাখে যার সাথে এটি সংযুক্ত।

**মূল বিষয়গুলো:**
• Areas কে backbone এর সাথে সংযুক্ত করে
• Areas গুলোর মধ্যে routes summarize করে
• LSA flooding scope কমায়

## Step 3: LSA Flooding

OSPF routers **LSAs (Link-State Advertisements)** বিনিময় করে একটি সম্পূর্ণ topology map তৈরি করে।

প্রতিটি router তার সরাসরি সংযুক্ত links, costs, এবং neighbors advertise করে। LSAs একটি area র ভেতরে সব routers এ flood করা হয়, যাতে সবার কাছে নেটওয়ার্ক এর একই দৃশ্য থাকে।

**LSA Types:**
• Type 1 (Router LSA) — প্রতিটি router উৎপাদন করে
• Type 2 (Network LSA) — broadcast networks
• Type 3 (Summary LSA) — ABR routes summarize করে

## Step 4: SPF Calculation

সব LSA গ্রহণ করার পর, প্রতিটি router shortest path tree গণনা করতে **Dijkstra's SPF algorithm** চালায়।

Algorithm link costs (bandwidth-based) বিবেচনা করে প্রতিটি destination এর জন্য সেরা পথ নির্ধারণ করে। প্রতিটি router SPF tree থেকে তার নিজের routing table তৈরি করে।

**মূল বিষয়গুলো:**
• Dijkstra algorithm shortest paths খুঁজে পায়
• Cost = reference bandwidth / interface bandwidth
• Lowest cost = সেরা পথ
• শুধুমাত্র সরাসরি neighbors SPF tree তে থাকে

## Step 5: OSPF সারসংক্ষেপ

**মূল কথা:** OSPF হলো enterprise networks এর জন্য দ্রুত-converging link-state routing protocol।

**গঠন:**
• **Areas** — hierarchical design, Area 0 backbone
• **ABRs** — areas সংযুক্ত করে, routes summarize করে
• **LSAs** — link-state advertisements, সম্পূর্ণ topology map
• **SPF** — Dijkstra algorithm, shortest path tree

**ব্যবহারের ক্ষেত্র:**
• Enterprise campus networks
• Data center fabrics
• ISP internal routing
• Scalability এর জন্য multi-area designs
