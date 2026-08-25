---
name: CDN
description: Content Delivery Networks — edge caching for global performance
category: Advanced Networking
order: 43
---

## Step 1: Edge Locations — POPs Worldwide

A **CDN (Content Delivery Network)** distributes content across **Points of Presence (POPs)** worldwide.

Each POP contains **edge servers** that cache copies of the origin content.

**How it helps:**
• **Reduced latency** — content served from the nearest edge, not the origin
• **Reduced bandwidth** — origin only serves cache misses
• **High availability** — if one edge fails, others serve the content
• **DDoS protection** — traffic is distributed across many edge servers

Popular CDNs include Cloudflare, AWS CloudFront, Akamai, and Fastly.

## Step 2: DNS-Based Routing

The CDN uses **DNS routing** to direct users to the nearest edge server.

**GeoDNS:**
• DNS resolver returns the IP of the closest edge based on the user's geographic location
• European users → London POP, Asian users → Tokyo POP

**Anycast:**
• Multiple edge servers announce the same IP address
• BGP routing naturally directs traffic to the nearest server
• Same IP, different physical locations

The user doesn't know which edge they're hitting — the CDN handles the routing transparently.

## Step 3: Cache Strategy — HIT vs MISS

When a user requests content, the edge server checks its **cache**:

**Cache HIT:**
• Content is in the edge cache and still fresh (within TTL)
• Edge serves it immediately — fast!
• No request to the origin server

**Cache MISS:**
• Content is not cached or has expired
• Edge fetches from the origin server
• Stores a copy for future requests
• Serves the response to the user

**TTL (Time To Live):**
• Controls how long cached content stays fresh
• Short TTL → more origin fetches, but fresher content
• Long TTL → fewer origin fetches, but stale content risk

## Step 4: CDN Summary

**CDN Models:**

**Pull CDN:**
• Edge fetches from origin on first request (cache miss)
• Content pulled automatically as needed
• Good for: dynamic or frequently updated content

**Push CDN:**
• Content pushed to edges ahead of time
• Origin controls when and what to distribute
• Good for: static content with predictable access patterns

**Cache Invalidation:**
• Purge cached content before TTL expires
• Purge by URL, tag, or entire cache
• Essential for content updates or emergency fixes

**Protocols:**
• HTTP/HTTPS — web content, APIs
• Video streaming — HLS, DASH segments
• Software updates — OS patches, app downloads

CDNs are critical infrastructure — they serve over 50% of all web traffic globally.
