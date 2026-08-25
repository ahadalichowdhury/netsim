---
name: DNS
description: Domain Name System — how names become IP addresses
category: Networking Fundamentals
order: 16
---

## Step 1: User types google.com in browser [বাংলা অনুবাদ প্রয়োজন]

The user opens a browser and types **google.com** in the address bar.

The computer needs to convert this human-readable **domain name** into an IP address. It starts by checking its **local DNS cache** to see if it already knows the answer.

**Note:** DNS resolution happens before most network connections. After DNS, the **TCP Handshake** establishes the connection to the resolved IP.

**See also:** **TCP/UDP Ports** topic — DNS uses port 53.

## Step 2: PC checks local DNS cache — miss [বাংলা অনুবাদ প্রয়োজন]

The PC checks its **local DNS cache** for "google.com".

The cache is **empty** — this is the first time visiting this site. The PC must now send a **DNS query** to a recursive DNS resolver to look up the IP address.

## Step 3: PC builds DNS Query (UDP port 53) [বাংলা অনুবাদ প্রয়োজন]

The PC creates a **DNS query** packet:
`Type: A (IPv4 address request)`
`Name: google.com`

The query will travel from PC → Switch → DNS Server (8.8.8.8) using UDP port 53.

## Step 4: DNS Query: PC → Switch [বাংলা অনুবাদ প্রয়োজন]

The PC sends the DNS query frame to the Switch.
`Src MAC: AA:BB:CC:DD:EE:01 (PC)`
`Dst MAC: AA:BB:CC:DD:EE:FF (DNS Server)`

The Switch receives the frame and will forward it toward the DNS Server.

## Step 5: Switch forwards to DNS Server [বাংলা অনুবাদ প্রয়োজন]

The Switch receives the frame and looks up the destination MAC in its forwarding table.

The DNS Server (AA:BB:CC:DD:EE:FF) is reachable on the port connected to it. The Switch **forwards** the frame directly to the DNS Server.

## Step 6: DNS Server looks up A record [বাংলা অনুবাদ প্রয়োজন]

The DNS Server receives the query for **google.com**.

It looks up the **A record** in its zone files and finds the IP address: `142.250.80.46`

The DNS Server builds a response with the resolved IP address.

## Step 7: DNS Reply: Server → Switch [বাংলা অনুবাদ প্রয়োজন]

The DNS Server sends back a **DNS response**:
`Type: A`
`Name: google.com`
`IP: 142.250.80.46`
`TTL: 300 seconds`

The reply travels from DNS Server → Switch.

## Step 8: Switch forwards Reply to PC [বাংলা অনুবাদ প্রয়োজন]

The Switch receives the DNS reply and looks up the destination MAC (AA:BB:CC:DD:EE:01 — PC).

It forwards the frame out the port connected to the PC.

## Step 9: PC caches IP address [বাংলা অনুবাদ প্রয়োজন]

The PC receives the DNS reply and **caches** the result:
`google.com → 142.250.80.46`

This entry will stay in the cache for **300 seconds** (the TTL). Future visits to this domain won't need another DNS lookup!

## Step 10: DNS Resolution complete! [বাংলা অনুবাদ প্রয়োজন]

**Key takeaway:** DNS translates human-readable domain names into IP addresses that computers can use.

The process involved:
1. Checking the **local cache** — miss!
2. Building a **DNS Query** (UDP port 53)
3. Query travels PC → Switch → DNS Server
4. DNS Server looks up the **A record**
5. Reply travels DNS Server → Switch → PC
6. PC **caches** the result with a TTL

Without DNS, you'd have to remember IP addresses like `142.250.80.46` instead of typing `google.com`!
