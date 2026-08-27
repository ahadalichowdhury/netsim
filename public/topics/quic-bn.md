---
name: QUIC
description: UDP-ভিত্তিক transport — HTTP/3, 0-RTT, multiplexing
category: Advanced Networking
order: 50
---

## Step 1: TCP + TLS Overhead

ঐতিহ্যবাহী **TCP + TLS 1.3** প্রয়োগ data পাঠানোর আগে **2-3 round trip** প্রয়োজন করে:

1. TCP SYN → SYN-ACK (1 RTT)
2. TLS ClientHello → ServerHello + Finished (1 RTT)
3. TLS Finished → ACK (1 RTT)

এই handshakes এর পরেই HTTP request শুরু হতে পারে। প্রতিটি RTT latency যোগ করে — বিশেষত high-latency connections এ কষ্টকর।

## Step 2: QUIC গতি

**QUIC** **UDP** এর উপর চলে এবং TLS 1.3 কে সরাসরি protocol তে একত্রিত করে।

প্রথম connection: **1 RTT** (QUIC transport + crypto handshake একত্রিত করে)
পুনরায় শুরু: **0-RTT** (client cached crypto params ব্যবহার করে সরাসরি data পাঠাতে পারে)

QUIC TCP+TLS layering overhead বাদ দেয় দুটোকেই একটি single protocol এ build করে।

## Step 3: Stream Multiplexing

**QUIC** একটি single connection এর ভেতরে **একাধিক independent streams** সমর্থন করে।

TCP এর বিপরীতে (যেখানে একটি হারানো packet সব data থামিয়ে দেয়), QUIC streams **স্বাধীনভাবে multiplexed** থাকে। একটি stream এ ক্ষতি অন্যগুলোকে প্রভাবিত করে না।

এটি **head-of-line blocking** বাদ দেয় — TCP এ HTTP/2 এর একটি বড় পারফরম্যান্স সমস্যা।

## Step 4: Per-Stream Recovery

প্রতিটি QUIC stream এ **স্বাধীন loss detection এবং recovery** আছে।

যদি Stream 1 data বহনকারী একটি packet হারিয়ে যায়, শুধুমাত্র Stream 1 retransmission এর জন্য অপেক্ষা করে। Streams 2 এবং 3 অব্যাহতভাবে চলতে থাকে।

TCP, এর বিপরীতে, সব data কে একটি byte stream হিসাবে দেখে — একটি মাত্র হারানো packet *সব* data এর জন্য application কে প্রেরণা ব্লক করে।।
