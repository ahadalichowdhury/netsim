---
name: ARP
description: Address Resolution Protocol - IP থেকে MAC mapping
category: Networking Fundamentals
order: 11
---

## Step 1: PC-A-র PC-B-র MAC address দরকার

PC-A PC-B-তে (192.168.1.20) ডেটা পাঠাতে চাইছে। **PC-A এই IP কীভাবে জানে?**

• ব্যবহারকারী `ping 192.168.1.20` টাইপ করেছেন (IP সরাসরি দেওয়া হয়েছে)
• অথবা ব্যবহারকারী `ping pc-b.local` টাইপ করেছেন এবং **DNS** এটিকে 192.168.1.20-তে রিজল্ভ করেছে

ব্যবহারকারীর কাজ থেকে প্রথম প্যাকেট পর্যন্ত পুরো যাত্রার জন্য দেখুন **How Networks Start** টপিক।

এখন PC-A একটি Ethernet frame পাঠাতে চাইছে, কিন্তু এর জন্য PC-B-র **MAC address** দরকার। PC-A তার ARP cache চেক করে — এটি খালি। এটিকে অবশ্যই ARP ব্যবহার করে MAC আবিষ্কার করতে হবে।

**দেখুনও:** ক্যাশ এন্ট্রি এবং টাইমআউটের জন্য **ARP Table** টপিক।

## Step 2: PC-A ARP Request তৈরি করে (broadcast)

PC-A একটি **ARP Request** তৈরি করে:
`"Who has 192.168.1.20? Tell 192.168.1.10"`

Ethernet destination হলো `FF:FF:FF:FF:FF:FF` — একটি **broadcast** address। নেটওয়ার্কের প্রতিটি ডিভাইস এই frame পাবে।

ARP payload-এ **target IP** (যা PC-A চাইছে) এবং **sender MAC** (যাতে PC-B উত্তর দিতে পারে) অন্তর্ভুক্ত থাকে।

## Step 3: ARP Request: PC-A → Switch

broadcast ARP Request **PC-A** থেকে **Switch**-এ যায়।

Switch port 1-এ frame পায় এবং যেহেতু destination broadcast address, তাই অন্য সব পোর্টে এটি flood করবে।

## Step 4: Switch broadcast কে PC-B-তে flood করে

Switch broadcast frame পায় এবং source বাদে সব পোর্টে **flood** করে।

ARP Request port 2 দিয়ে **PC-B**-তে পৌঁছায়। নেটওয়ার্কের উভয় ডিভাইসই এই broadcast প্রসেস করবে।

## Step 5: PC-B তার IP address চেনে

PC-B ARP Request পায় এবং **target IP address** (192.168.1.20) চেক করে — এটি PC-B-র নিজের IP সাথে মিলে!

PC-B এখন জানে যে কেউ তার MAC address চাইছে। এটি ARP payload থেকে PC-A-র IP এবং MAC **শিখে** এবং একটি **ARP Reply** পাঠাবে।

## Step 6: PC-B ARP Reply তৈরি করে (unicast)

PC-B একটি **ARP Reply** তৈরি করে:
`"192.168.1.10 is at AA:BB:CC:DD:EE:02"`

request-র পরিবর্তে, এটি একটি **unicast** frame — Ethernet destination হলো PC-A-র MAC address, broadcast address নয়। শুধুমাত্র PC-A এটি পাবে।

## Step 7: ARP Reply: PC-B → Switch

unicast ARP Reply **PC-B** থেকে **Switch**-এ যায়।

Switch তার টেবিলে destination MAC (PC-A) খুঁজে বের করে এবং সরাসরি forward করবে।

## Step 8: Switch unicast কে PC-A-তে forward করে

Switch ARP Reply পায় এবং destination MAC (AA:BB:CC:DD:EE:01) দেখে।

এটি তার MAC টেবিলে খুঁজে পায় — **port 1 = PC-A**। শুধুমাত্র **PC-A-তে** frame forward করে। Flood কোনোটাই নেই!

## Step 9: PC-A পায় এবং ARP cache আপডেট করে

PC-A ARP Reply পায় এবং এখন জানে:
`192.168.1.20 → AA:BB:CC:DD:EE:02`

এই এন্ট্রি PC-A-র **ARP cache**-এ ভবিষ্যতের ব্যবহারের জন্য সংরক্ষিত হয়। PC-A এখন আরেকটি ARP request ছাড়াই PC-B-তে ডেটা পাঠাতে পারে!

## Step 10: ARP resolution সম্পূর্ণ!

উভয় ডিভাইসই এখন তাদের ARP cache-এ পরস্পরের MAC address রাখে।

**ARP** IP address কে MAC address-তে রূপান্তরিত করে, যা Layer 2 communication সক্ষম করে। ARP ছাড়া, ডিভাইসগুলো স্থানীয় নেটওয়ার্কে ডেটা পাঠানোর জন্য প্রয়োজনীয় Ethernet frame তৈরি করতে পারত না।
