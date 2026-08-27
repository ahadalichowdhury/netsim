---
name: MAC Address Table - সুইচ লার্নিং
description: MAC Address Table কী, সুইচ কীভাবে শেখে, forward করে, timeout করে — সব বাংলায়
---

# MAC Address Table — সুইচ লার্নিং

আজ দেখবো সুইচ কীভাবে MAC Address Table তৈরি করে এবং ব্যবহার করে।

## Step 1: MAC Address Table কী

MAC Address Table হলো সুইচের ডায়েরি — সে এখানে লেখে কোন MAC address কোন পোর্টে আছে। এটা ছাড়া সুইচ ফরোয়ার্ড করতে পারবে না।

উদাহরণ:

| MAC Address | Port |
|---|---|
| `AA:AA:AA:AA:AA:01` | Port 1 |
| `BB:BB:BB:BB:BB:01` | Port 2 |
| `CC:CC:CC:CC:CC:01` | Port 3 |

## Step 2: সুইচ কীভাবে শেখে (Learning)

সুইচ প্রতিটা ইনকামিং ফ্রেমের **সোর্স MAC** দেখে। ধরো Port 1-এ `AA:AA:AA:AA:AA:01` থেকে ফ্রেম এলো। সুইচ তার MAC Table-ে এন্ট্রি বানায়:

```
AA:AA:AA:AA:AA:01 → Port 1
```

এটাই **self-learning** — সুইচ নিজে থেকে শেখে, কেউ শেখায় না।

## Step 3: Forwarding সিদ্ধান্ত (Forwarding Decision)

সুইচ ফ্রেম পায়, সোর্স MAC শেখে, এবং এখন **ডেস্টিনেশন MAC** দেখে:

- **MAC Table-এ আছে:** শুধু সঠিক পোর্টে পাঠায় (unicast)
- **MAC Table-এ নেই:** সব পোর্টে (ইনকামিং বাদ) ছড়িয়ে দেয় (flood)
- **Broadcast (`FF:FF:FF:FF:FF:FF`):** সব পোর্টে পাঠায়

## Step 4: Aging এবং Timeout

সুইচের MAC Table-এর প্রতিটা এন্ট্রির একটা **timer** থাকে। ধরো timer 300 সেকেন্ড (5 মিনিট)।

- যদি 300 সেকেন্ডের মধ্যে সেই MAC থেকে আবার ফ্রেম না আসে → এন্ট্রি **মুয়ে ফেলা** হয়
- যদি আসে → timer **রিসেট** হয়ে যায়

কেন এটা দরকার? যদি একটা PC সুইচ থেকে সরিয়ে নেওয়া হয়, তাহলে সুইচ আর সেই পোর্টে পাঠাবে না।

## Step 5: MAC Table দেখো

তুমি `show mac address-table` কমান্ড দিয়ে সুইচের MAC Table দেখতে পারো:

```bash
# Cisco Switch-এ
show mac address-table
```

আউটপুট:

```
MAC Address Table
-------------------------------------------
VLAN    MAC Address       Ports
----    -----------       -----
1       AA:AA:AA:AA:AA:01  Fa0/1
1       BB:BB:BB:BB:BB:01  Fa0/2
1       CC:CC:CC:CC:CC:01  Fa0/3
```

এখানে দেখতে পাচ্ছো কোন MAC কোন পোর্টে আছে।

## Step 6: সারসংক্ষেপ

MAC Address Table-এর মূল কথা:

- **শেখে (Learn):** সোর্স MAC থেকে এন্ট্রি তৈরি করে
- **মনে রাখে (Remember):** সব এন্ট্রি table-এ থাকে
- **ফরোয়ার্ড করে (Forward):** MAC জানলে unicast, না জানলে flood
- **পুরোনো মুয়ে দেয় (Age):** Timer শেষ হলে এন্ট্রি মুয়ে যায়

এটাই সুইচের আসল জাদু — নিজে থেকে শেখে, মনে রাখে, এবং সঠিক পথে পাঠায়!
