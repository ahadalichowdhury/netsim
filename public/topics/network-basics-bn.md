---
name: নেটওয়ার্ক কীভাবে শুরু হয়
description: ব্যবহারকারীর কাজ থেকে প্রথম packet পর্যন্ত — সম্পূর্ণ যাত্রা
category: Networking Fundamentals
order: 8
---

## Step 1: ব্যবহারকারী একটি নেটওয়ার্ক কাজ শুরু করে

সবকিছু শুরু হয় একটি **ব্যবহারকারীর কাজ** দিয়ে:

• ব্যবহারকারী `ping google.com` টাইপ করে
• ব্যবহারকারী ওয়েব ব্রাউজার খুলে URL লিখে
• ব্যবহারকারী `ssh server.example.com` চালায়

Application এখন একটি দূরবর্তী server এর সাথে যোগাযোগ করতে চাইছে। কিন্তু এটি কীভাবে জানে ডেটা **কোথায়** পাঠাতে হবে?

## Step 2: Application এর server এর IP address লাগবে

Application এর কাছে একটি **hostname** (যেমন google.com) আছে কিন্তু packet রুট করার জন্য একটি **IP address** লাগবে।

**দুটি পরিস্থিতি:**

1. **Hostname দেওয়া আছে** (যেমন, google.com) → **DNS** দরকার IP তে resolve করতে
2. **সরাসরি IP দেওয়া আছে** (যেমন, ping 192.168.1.20) → DNS ছাড়াই যাও

resolution কীভাবে কাজ করে তা জানতে **DNS topic** দেখো।

## Step 3: DNS hostname কে IP তে resolve করে (প্রয়োজন হলে)

যদি ব্যবহারকারী একটি **hostname** টাইপ করে, তাহলে application একটি **DNS query** পাঠায়:

`DNS Query: google.com → ?`
`DNS Reply: google.com → 142.250.80.46`

এখন application এর কাছে **destination IP** আছে। সম্পূর্ণ প্রক্রিয়া জানতে **DNS topic** দেখো।

## Step 4: Application এর destination MAC address লাগবে

এখন application এর কাছে **IP address** আছে, কিন্তু একটি **Ethernet frame** পাঠাতে গেলে **MAC address** লাগবে।

**প্রশ্ন:** প্রেরক কীভাবে destination MAC জানে?

**উত্তর:** **ARP** (Address Resolution Protocol) এটি আবিষ্কার করে।

কিন্তু প্রথমে — destination **একই নেটওয়ার্কে** আছে নাকি **আলাদা নেটওয়ার্কে**?

## Step 5: একই নেটওয়ার্ক? সরাসরি ARP ব্যবহার করো। আলাদা নেটওয়ার্ক? Gateway ব্যবহার করো।

**একই subnet হলে** (যেমন, দুটোই 192.168.1.x):
• destination MAC সরাসরি খুঁজে পেতে **ARP** ব্যবহার করো
• **ARP topic** দেখো

**আলাদা subnet হলে** (যেমন, 192.168.1.x → 8.8.8.8):
• frame **default gateway** (router) তে পাঠাও
• gateway এর MAC খুঁজে পেতে **ARP** ব্যবহার করো
• **Default Gateway** এবং **Gateway** topics দেখো

কোন পথ বেছে নেবে তা **routing table** সিদ্ধান্ত নেয়।

## Step 6: ARP MAC address আবিষ্কার করে

Application (অথবা OS kernel) একটি **ARP broadcast** পাঠায়:

`ARP Request: "Who has 192.168.1.20?"`
`ARP Reply: "192.168.1.20 is at AA:BB:CC:DD:EE:02"`

এখন আমাদের **IP address** এবং **MAC address** দুটোই আছে। সম্পূর্ণ প্রক্রিয়া জানতে **ARP topic** দেখো।

## Step 7: Application Ethernet frame তৈরি করে

এখন application এর সবকিছু আছে যা দরকার:

`Source MAC: AA:BB:CC:DD:EE:01 (আমাদের NIC)`
`Destination MAC: AA:BB:CC:DD:EE:02 (লক্ষ্য)`
`Source IP: 192.168.1.10`
`Destination IP: 192.168.1.20`

**Ethernet frame** তৈরি হয়েছে ভেতরে IP packet সহ।

## Step 8: NIC frame টি তারে প্রেরণ করে

**NIC** (Network Interface Card) frame টি নিয়ে cable তে বৈদ্যুতিক/অপটিক্যাল signal হিসাবে **প্রেরণ** করে।

**Switch** frame টি গ্রহণ করে এবং destination তে forward করে। Switch কীভাবে কাজ করে তা জানতে **Layer 2 topic** দেখো।

## Step 9: সম্পূর্ণ যাত্রা

**ব্যবহারকারীর কাজ থেকে নেটওয়ার্ক packet পর্যন্ত সম্পূর্ণ শৃঙ্খল:**

1. **ব্যবহারকারী** command টাইপ করে অথবা URL খুলে
2. **Application** এর destination IP লাগে
3. **DNS** hostname → IP তে resolve করে (প্রয়োজন হলে)
4. **Routing table** সিদ্ধান্ত নেয়: একই নেটওয়ার্ক নাকি gateway?
5. **ARP** MAC address আবিষ্কার করে
6. **Frame** MAC + IP header সহ তৈরি হয়
7. **NIC** তারে প্রেরণ করে
8. **Switch** destination তে forward করে

প্রতিটি step অন্যান্য topics এ বিস্তারিত আলোচিত!
