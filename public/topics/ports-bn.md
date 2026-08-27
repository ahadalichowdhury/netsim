---
name: TCP/UDP Ports
description: একটি IP তে কীভাবে একাধিক service কাজ করে — port numbers ব্যাখ্যা
category: Components
order: 3
---

## Step 1: Ports কী?

একটি single server এ একটি IP address (192.168.1.20) দিয়ে **একাধিক service একই সাথে** চালানো যায় — একটি web server, SSH daemon, DNS resolver, এবং আরও অনেক কিছু।

**Ports** হলো এই সম্ভাবনার প্রক্রিয়া। একটি port হলো একটি 16-bit সংখ্যা (0–65535) যা একটি host এর একটি নির্দিষ্ট service বা application শনাক্ত করে।

IP address কে একটি **বাড়ির address** এবং port numbers কে **অ্যাপার্টমেন্ট নম্বর** হিসাবে ভাবো — বাড়ি (IP) আপনাকে সঠিক জায়গায় নিয়ে যায়, কিন্তু অ্যাপার্টমেন্ট নম্বর (port) আপনাকে সঠিক service এ নিয়ে যায়।

## Step 2: TCP vs UDP Ports

**TCP** এবং **UDP** উভয়ই port numbers ব্যবহার করে, কিন্তু এগুলো ভিন্নভাবে কাজ করে:

**TCP (Transmission Control Protocol)**:
• Connection-oriented — data পাঠানোর আগে connection প্রতিষ্ঠা করে
• Acknowledgement সহ নির্ভরযোগ্য প্রেরণা
• ব্যবহার: HTTP, HTTPS, SSH, SMTP, FTP

**UDP (User Datagram Protocol)**:
• Connectionless — connection প্রতিষ্ঠা না করেই data পাঠায়
• কোনো acknowledgement নেই, কোনো guarantee নেই
• ব্যবহার: DNS queries, streaming, gaming, VoIP

দুটোই protocol একই port number range ব্যবহার করে — port 80 TCP হোক বা UDP, HTTP।

## Step 3: Well-Known Ports (0-1023)

**0–1023** range এর ports IANA দ্বারা সংজ্ঞায়িত **standardized services** এর জন্য সংরক্ষিত। এগুলো bind করতে root/admin privileges লাগে।

সাধারণ well-known ports:
`:80 — HTTP (Web traffic)`
`:443 — HTTPS (Encrypted web)`
`:22 — SSH (Secure Shell)`
`:53 — DNS (Domain Name System)`
`:25 — SMTP (Email sending)`
`:21 — FTP (File Transfer)`
`:3389 — RDP (Remote Desktop)`

## Step 4: Registered Ports (1024-49151)

**1024–49151** range এর ports IANA তে নির্দিষ্ট applications এর জন্য registered কিন্তু উন্নত privileges লাগে না।

সাধারণ registered ports:
`:3306 — MySQL Database`
`:5432 — PostgreSQL Database`
`:6379 — Redis Cache`
`:8080 — HTTP Alternate`
`:8443 — HTTPS Alternate`
`:27017 — MongoDB`

এগুলো প্রায়ই development servers এবং databases এ ব্যবহার হয় যাদের root access লাগে না।

## Step 5: Dynamic/Ephemeral Ports (49152-65535)

**49152–65535** range এর ports dynamic বা ephemeral — এগুলো client-side applications এর জন্য **অস্থায়ীভাবে** নির্ধারিত হয়।

আপনার browser যখন port 80 এ একটি web server এর সাথে connect করে, এটি একটি random ephemeral port (যেমন, 49152) তার source port হিসাবে বাছাই করে। এটি সম্ভব করে:

• একটি client থেকে একই server তে **একাধিক connection**
• **Response routing** — server জানে reply কোথায় পাঠাতে হবে
• **Connection tracking** — OS জানে কোন socket packet টির মালিক

## Step 6: যোগাযোগে Ports কীভাবে কাজ করে

যখন একটি client server এর সাথে connect করে, **source এবং destination ports** দুটোই ব্যবহার হয়:

`Client (192.168.1.10:49152) → Server (192.168.1.20:80)`

TCP/UDP header এ দুটো port number থাকে:
• **Source port** (49152) — client এর অস্থায়ী port
• **Destination port** (80) — server এর well-known port

Server **উল্টো** port pair ব্যবহার করে respond করে:
`Server (192.168.1.20:80) → Client (192.168.1.10:49152)`

## Step 7: Ports সারসংক্ষেপ

**মূল কথা:** Ports প্রতিটিকে অদ্বিতীয় সংখ্যা নির্ধারণ করে একটি IP address তে একাধিক service চালানোর সম্ভব করে।

**Range breakdown:**
• 0–1023: Well-known (root প্রয়োজন)
• 1024–49151: Registered (application-specific)
• 49152–65535: Dynamic (client অস্থায়ী)

**Protocol distinction:**
• TCP: নির্ভরযোগ্য, connection-oriented
• UDP: দ্রুত, connectionless

Ports বোঝা **firewall rules**, **port forwarding**, **NAT**, এবং **service troubleshooting** এর জন্য অপরিহার্য।
