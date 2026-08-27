---
name: TLS 1.3
description: আধুনিক এনক্রিপশন — HTTPS কীভাবে সুরক্ষিত থাকে
---

## Step 1: 1-RTT হ্যান্ডশেক

TLS 1.3 একটা বড় উন্নতি এনেছে — **1-RTT Handshake**। মানে শুধু একটা রাউন্ড-ট্রিপে কনেকশন স্থাপিত হয়।

TLS 1.2-তে 2-RTT লাগত। TLS 1.3-এ ক্লায়েন্ট একটা প্যাকেটেই সব কিছু পাঠায় — `ClientHello` এর সাথে key share। এতে একটা RTT বাঁচে!

## Step 2: Key Exchange

TLS 1.3-এ **Diffie-Hellman** (বা ECDH) দিয়ে key exchange হয়। ক্লায়েন্ট ও সার্ভার দুজনেই নিজেরদের key pair তৈরি করে, একে অপরকে public key পাঠায়, এবং দুজনেই একই **shared secret** তৈরি করে।

গুরুত্বপূর্ণ: TLS 1.3-এ **RSA key exchange নেই**। শুধু DHE/ECDHE ব্যবহার হয়, যা **Forward Secrecy** দেয় — মানে ভবিষ্যতে প্রাইভেট কী হ্যাক হলেও পুরাতন ট্রাফিক ডিক্রিপ্ট করা যাবে না।

## Step 3: Cipher Suites

TLS 1.3-এ cipher suite গুলো সিম্পল হয়ে গেছে। শুধু 5টা cipher suite মান্য:

- `TLS_AES_256_GCM_SHA384`
- `TLS_AES_128_GCM_SHA256`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_CCM_SHA256`
- `TLS_AES_128_CCM_8_SHA256`

আগের অনেক পুরাতন ও দুর্বল cipher suite বাদ দেওয়া হয়েছে (RC4, 3DES, CBC মোড ইত্যাদি)।

## Step 4: 0-RTT Resumption

যদি তুমি আগেও একই সার্ভারের সাথে কথা বলে থাকো, TLS 1.3 **0-RTT** সাপোর্ট করে। মানে কোনো handshake ছাড়াই সরাসরি ডেটা পাঠানো যায়!

কিন্তু সতর্ক হতে হবে — 0-RTT data **replay attack**-এর ঝুঁকি রাখে। তাই সব অপারেশনে 0-RTT ব্যবহার করা উচিত না (যেমন, GET request ঠিক আছে, কিন্তু payment request নয়)।

## Step 5: TLS 1.3 বনাম 1.2

TLS 1.3, 1.2-র তুলনায়:

- **দ্রুত** — 1-RTT (আগে 2-RTT)
- **সুরক্ষিত** — পুরাতন cipher suite বাদ
- **Forward Secrecy** — সব সময়
- **সিম্পল** — কম cipher suite, কম কনফিগ

TLS 1.2 এখনো কাজ করে, কিন্তু TLS 1.3 এখন স্ট্যান্ডার্ড। বেশিরভাগ ব্রাউজার ও সার্ভার TLS 1.3 সাপোর্ট করে।
