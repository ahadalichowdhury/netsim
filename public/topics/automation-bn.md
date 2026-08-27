---
name: Network Automation
description: NetDevOps — Ansible, Terraform, programmable infrastructure
category: Advanced Networking
order: 52
---

## Step 1: Config as Code

**Configuration as Code** সব নেটওয়ার্ক ডিভাইসের config একটি **Git repository**-তে সংরক্ষণ করে।

ম্যানুয়ালি ডিভাইসে লগইন করে কমান্ড টাইপ করার পরিবর্তে:
• প্রতিটি config পরিবর্তন একটি **Git commit**
• পরিবর্তনগুলো pull request-এর মাধ্যমে **পর্যালোচিত** হয়
• ইতিহাস **versioned** — সহজ rollback
• Configs **auditable** — কে কী পরিবর্তন করেছে, কখন

এটিই **NetDevOps**-র ভিত্তি।

## Step 2: CI/CD for Networks

**CI/CD pipeline** নেটওয়ার্ক config-র টেস্টিং এবং deployment স্বয়ংক্রিয় করে:

1. ইঞ্জিনিয়ার config পরিবর্তন Git-এ push করে
2. **CI pipeline** চলে:
   - Syntax validation (linting)
   - Compliance checks
   - Test environment-এ dry-run
3. **CD pipeline** অনুমোদনের পর production-এ deploy করে

এটি ভুলগুলো **ধরে** production ডিভাইসে পৌঁছানোর আগে।

## Step 3: Ansible

**Ansible** হলো **YAML playbook** ব্যবহার করে একটি push-based automation tool।

মূল বৈশিষ্ট্য:
• **Idempotent** — একই playbook দুইবার চালালে একই ফলাফল হয়
• **Agentless** — SSH/NETCONF ব্যবহার করে, ডিভাইসে কোনো সফটওয়্যার নেই
• **Push-based** — controller ডিভাইসে config push করে
• **Declarative** — যে অবস্থা চান তা বর্ণনা করুন, Ansible তা বাস্তবায়ন করে

Ansible **configuration management**-এর জন্য আদর্শ — ডিভাইসগুলো যেন কাঙ্ক্ষিত অবস্থায় থাকে তা নিশ্চিত করে।

## Step 4: Terraform

**Terraform** হলো একটি declarative Infrastructure as Code (IaC) tool।

Ansible থেকে মূল পার্থক্য:
• **Declarative** — কী চান তা বর্ণনা করুন, কীভাবে পাবেন তা নয়
• **State management** — কী আছে বনাম কী কাঙ্ক্ষিত তা ট্র্যাক করে
• **Multi-vendor** — AWS, Azure, VMware এবং নেটওয়ার্ক ডিভাইসের সাথে কাজ করে
• **Plan/Apply** — প্রয়োগের আগে পরিবর্তন প্রিভিউ করুন

Terraform **infrastructure provisioning**-এ দক্ষ — রিসোর্স তৈরি এবং ধ্বংস করায়।
