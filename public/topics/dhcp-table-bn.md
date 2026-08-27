---
name: DHCP Lease Table
description: Active IP leases — কে কোন address এবং কতক্ষরা ব্যবহার করছে
category: Components
order: 6
---

## Step 1: DHCP Table কী?

**DHCP Lease Table** হলো DHCP server দ্বারা পরিচালিত একটি database।

এটি ট্র্যাক করে কোন ডিভাইসগুলোকে কোন IP address বরাদ্দ করা হয়েছে, সাথে MAC address, hostname এবং lease expiry time-এর মতু গুরুত্বপূর্ণ metadata।

এটিকে একটি **guest registry** হিসেবে ভাবুন — DHCP server প্রতিটি ডিভাইসকে "check in" করে এবং তাদের থাকার বিবরণ রেকর্ড করে।

## Step 2: Lease Entry Fields

Lease table-র প্রতিটি এন্ট্রিতে বেশিরভাগ field থাকে:

`IP Address` — বরাদ্দ IP (যেমন, 192.168.1.100)
`MAC Address` — client-র hardware address (যেমন, AA:BB:CC:01:01:01)
`Hostname` — client-র নাম (যেমন, PC-A)
`Lease Time` — lease কতক্ষরা বৈধ (যেমন, 8 ঘণ্টা)
`Expiry` — lease কখন মেয়াদোত্তীর্ণ হবে (countdown timer)

এই field-গুলো server-কে ট্র্যাক করতে সাহায্য করে কে কোন IP ব্যবহার করছে এবং কখন address pool-এ ফিরে যাবে।

## Step 3: Lease Lifecycle

DHCP leases **DORA** প্রক্রিয়া দ্বারা সংজ্ঞায়িত lifecycle অনুসরণ করে:

**1. Discover** — Client DHCP server খুঁজে broadcast করে
**2. Offer** — Server pool থেকে একটি উপলব্ধ IP offer করে
**3. Request** — Client offered IP গ্রহণ করে
**4. Acknowledge** — Server নিশ্চিত করে এবং lease রেকর্ড করে

নবীকরণ automatically ঘটে:
• **Lease time-র 50%**-তে — client মূল server-র সাথে নবীকরণ করার চেষ্টা করে
• **87.5%**-তে — মূল server পৌঁছানো না গেলে client যেকোনো উপলব্ধ server-তে broadcast করে
• **100%**-তে — lease মেয়াদোত্তীর্ণ হয়, IP pool-এ ফিরে যায়

## Step 4: IP Pool Range

DHCP server একটি **address pool** পরিচালনা করে — একটি IP range যা এটি বরাদ্দ করতে পারে।

এই উদাহরণে:
`Pool: 192.168.1.100 — 192.168.1.200`
`Total: 101 addresses`
`In use: 2 (PC-A, PC-B)`
`Available: 99`

প্রশাসকরা এটিও কনফিগার করতে পারেন:
• **Exclusions** — static ডিভাইসের জন্য সংরক্ষিত IP (printer, server)
• **Reservations** — নির্দিষ্ট MAC address-এ সবসময় একই IP বরাদ্দ করুন

## Step 5: DHCP Leases দেখা

Linux-এ, আপনি DHCP lease table দেখতে এগুলো ব্যবহার করতে পারেন:

`dhcp-lease-list` — DHCP server থেকে active leases দেখায়
`cat /var/lib/dhcp/dhclient.leases` — Client-side lease file
`journalctl -u dhcpd` — DHCP server logs

একটি router বা নির্দিষ্ট DHCP server-এ, lease table সাধারণত web interface বা CLI-এর মাধ্যমে অ্যাক্সেসযোগ্য।

## Step 6: DHCP Table সারসংক্ষেপ

**মূল কথা:** DHCP Lease Table হলো নেটওয়ার্কে IP address বরাদ্দের **master record**।

কীভাবে কাজ করে:
1. Clients **DORA** (Discover, Offer, Request, Acknowledge) এর মাধ্যমে IP অনুরোধ করে
2. Server **address pool** থেকে একটি IP বরাদ্দ করে
3. Lease entry **MAC, hostname, lease time** সহ রেকর্ড হয়
4. Clients মেয়াদোত্তীর্ণ হওয়ার আগে তাদের IP রাখতে **renew** করে
5. মেয়াদোত্তীর্ণ IP pool-এ পুনর্ব্যবহারের জন্য ফিরে যায়

**কেন গুরুত্বপূর্ণ:**
• IP conflict troubleshoot করা
• অননুমোদিত ডিভাইস শনাক্ত করা
• Address space capacity পরিকল্পনা করা
• নেটওয়ার্কে ডিভাইসের ইতিহাস ট্র্যাক করা
