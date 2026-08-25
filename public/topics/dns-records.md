---
name: DNS Records
description: The phonebook entries — A, AAAA, CNAME, MX, TXT and more
category: Networking Fundamentals
order: 33
---

## Step 1: A Record (IPv4)

An **A Record** maps a hostname to an **IPv4 address**.

`example.com → 93.184.216.34`

This is the most fundamental DNS record. When you type a URL in your browser, the first step is resolving the domain name to an IP address via A records.

**Key facts:**
• Returns a 32-bit IPv4 address
• Multiple A records can exist for load balancing
• TTL (Time To Live) controls caching duration

**Query:** `dig example.com A`

## Step 2: AAAA Record (IPv6)

An **AAAA Record** (quad-A) maps a hostname to an **IPv6 address**.

`example.com → 2606:2800:220:1::248`

As IPv4 addresses run out, AAAA records become essential for modern websites. A domain can have both A and AAAA records — clients try IPv6 first if available.

**Key facts:**
• Returns a 128-bit IPv6 address
• Named "AAAA" because IPv6 addresses are 4x longer than IPv4
• Dual-stack: most sites run both A and AAAA

**Query:** `dig example.com AAAA`

## Step 3: CNAME (Alias)

A **CNAME Record** (Canonical Name) points one hostname to another hostname.

`www.example.com → example.com`

CNAMEs are used for aliases. Instead of duplicating IP addresses, you point an alias to the canonical domain. The resolver then looks up the A/AAAA record of the target.

**Key facts:**
• Must point to a hostname, not an IP
• Cannot coexist with other records on the same name
• Common use: www → naked domain
• chain lookups add latency

**Query:** `dig www.example.com CNAME`

## Step 4: MX (Mail Exchange)

An **MX Record** specifies the mail server responsible for receiving email.

`example.com → mail.example.com (priority 10)`

MX records include a **priority number** — lower values are tried first. If the primary server is down, mail is routed to the next priority.

**Key facts:**
• Must point to a hostname (not IP)
• Priority determines delivery order
• Multiple MX records for redundancy
• Required for receiving email

**Query:** `dig example.com MX`

## Step 5: TXT (Text)

**TXT Records** store arbitrary text. Originally for human-readable notes, they now serve critical security and verification purposes.

**Common uses:**
• **SPF** — Authorizes mail servers to send on behalf of your domain
• **DKIM** — Cryptographic email signing
• **DMARC** — Email authentication policy
• **Domain verification** — Prove ownership to services (Google, Cloudflare)
• **SSL verification** — Let's Encrypt DNS-01 challenge

**Example SPF:**
`v=spf1 include:_spf.google.com ~all`

**Query:** `dig example.com TXT`

## Step 6: DNS Records Summary

**DNS Record Types Overview:**

• **A** — Maps hostname to IPv4 address
• **AAAA** — Maps hostname to IPv6 address
• **CNAME** — Alias pointing to another hostname
• **MX** — Mail server with priority
• **TXT** — Text data (SPF, DKIM, verification)
• **NS** — Authoritative name servers for the zone
• **SOA** — Start of Authority — zone metadata (serial, refresh, retry, expire)
• **PTR** — Reverse DNS — maps IP to hostname

**Commands:**
`dig example.com` — Full query
`dig +short example.com` — IP only
`nslookup example.com` — Simple lookup
`host example.com` — Quick check
