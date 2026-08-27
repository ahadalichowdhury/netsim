---
name: Load Balancing - L4/L7
description: L4 এবং L7 Load Balancing কীভাবে কাজ করে — অ্যালগরিদম, backend pool, health check সব বাংলায়
---

# Load Balancing — L4 এবং L7

আজ দেখবো Load Balancing কী, কেন দরকার, এবং L4 আর L7 কীভাবে আলাদা।

## Step 1: L4 Load Balancing

L4 Load Balancer কাজ করে **Transport Layer**-তে — মানে TCP/UDP লেভেলে। সে IP এড্রেস এবং Port Number দেখে সিদ্ধান্ত নেয়।

উদাহরণ: তুমি `example.com:80`-তে request পাঠাও। L4 LB শুধু দেখে "ও, এটা port 80 — এটা HTTP traffic" এবং একটা backend server-এ forward করে দেয়।

**বৈশিষ্ট্য:**
- দ্রুত — প্যাকেটের মধ্যে তাকায় না, শুধু header দেখে
- Connection-oriented — একটা connection একটাই backend-তে যায়
- কম রিসোর্স খরচ হয়

## Step 2: L7 Load Balancing

L7 Load Balancer কাজ করে **Application Layer**-তে — মানে HTTP, HTTPS, gRPC লেভেলে। সে request-এর **content** দেখে সিদ্ধান্ত নেয়।

উদাহরণ: তুমি `example.com/api/users` এবং `example.com/images/logo.png` — দুটোই same domain, কিন্তু L7 LB দেখে:

- `/api/users` → API Server Pool-এ পাঠায়
- `/images/logo.png` → CDN/Static Server Pool-এ পাঠায়

**বৈশিষ্ট্য:**
- বুদ্ধিমান — URL, header, cookie দেখে
- SSL termination করতে পারে
- বেশি রিসোর্স লাগে কিন্তু বেশি flexibility দেয়

## Step 3: Load Balancing Algorithms

Load Balancer কীভাবে বেছে নেয় কোন backend-তে request পাঠাবে:

- **Round Robin:** একটার পর একটা — প্রথমে Server 1, তারপর Server 2, তারপর Server 3, আবার Server 1
- **Least Connections:** যেটাতে কম connection আছে, সেটায় পাঠায়
- **IP Hash:** Client IP-এর hash দিয়ে সিদ্ধান্ত নেয় — একই client সবসময় একই backend-তে যায়
- **Weighted:** বড় server-কে বেশি load দেয়

## Step 4: Backend Pool Management

Load Balancer রাখে একটা **backend pool** — মানে একগুচ্ছ backend server। উদাহরণ:

```
Backend Pool:
├── Server 1: 10.0.0.10:8080
├── Server 2: 10.0.0.11:8080
└── Server 3: 10.0.0.12:8080
```

Load Balancer জানে এই তিনটা server আছে এবং প্রত্যেকের health চেক করে। নতুন server যোগ করতে পারো, পুরোনো বাদ দিতে পারো — traffic ব্যাহত হয় না।

## Step 5: Health Checks

Load Balancer নিয়মিতভাবে backend serverদের **health check** করে:

- প্রতি কিছু সেকেন্ডে ping বা HTTP request পাঠায়
- যদি server respond না করে → **unhealthy** চিহ্নিত করে
- Unhealthy server-তে traffic পাঠায় না
- Server আবার respond করলে → **healthy** হয়ে যায়, আবার traffic পায়

এটা automatic — মানুষের কোনো intervention লাগে না।

**সারসংক্ষেপ:** L4 দ্রুত ও সহজ, L7 বুদ্ধিমান ও flexible। দুটোই backend serverদের মধ্যে load ভাগ করে এবং নিশ্চিত করে যে কোনো একটা server down হলে সব বন্ধ হয়ে যায় না।
