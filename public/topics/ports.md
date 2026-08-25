---
name: TCP/UDP Ports
description: How multiple services share one IP — port numbers explained
category: Components
order: 3
---

## Step 1: What are Ports?

A single server with one IP address (192.168.1.20) can run **multiple services simultaneously** — a web server, an SSH daemon, a DNS resolver, and more.

**Ports** are the mechanism that makes this possible. A port is a 16-bit number (0–65535) that identifies a specific service or application on a host.

Think of an IP address as a **building address** and port numbers as **apartment numbers** — the building (IP) gets you to the right place, but the apartment number (port) gets you to the right service.

## Step 2: TCP vs UDP Ports

Both **TCP** and **UDP** use port numbers, but they work differently:

**TCP (Transmission Control Protocol)**:
• Connection-oriented — establishes a connection before sending data
• Reliable delivery with acknowledgments
• Used for: HTTP, HTTPS, SSH, SMTP, FTP

**UDP (User Datagram Protocol)**:
• Connectionless — sends data without establishing a connection
• No acknowledgments, no guaranteed delivery
• Used for: DNS queries, streaming, gaming, VoIP

Both protocols use the same port number ranges — port 80 is HTTP whether TCP or UDP carries it.

## Step 3: Well-Known Ports (0-1023)

Ports in the range **0–1023** are reserved for **standardized services** defined by IANA. These require root/admin privileges to bind.

Common well-known ports:
`:80 — HTTP (Web traffic)`
`:443 — HTTPS (Encrypted web)`
`:22 — SSH (Secure Shell)`
`:53 — DNS (Domain Name System)`
`:25 — SMTP (Email sending)`
`:21 — FTP (File Transfer)`
`:3389 — RDP (Remote Desktop)`

## Step 4: Registered Ports (1024-49151)

Ports in the range **1024–49151** are registered with IANA for specific applications but don't require elevated privileges.

Common registered ports:
`:3306 — MySQL Database`
`:5432 — PostgreSQL Database`
`:6379 — Redis Cache`
`:8080 — HTTP Alternate`
`:8443 — HTTPS Alternate`
`:27017 — MongoDB`

These are often used for development servers and databases that shouldn't need root access.

## Step 5: Dynamic/Ephemeral Ports (49152-65535)

Ports in the range **49152–65535** are dynamic or ephemeral — they're assigned **temporarily** to client-side applications.

When your browser connects to a web server on port 80, it picks a random ephemeral port (e.g., 49152) as its source port. This allows:

• **Multiple connections** to the same server from one client
• **Response routing** — the server knows where to send the reply
• **Connection tracking** — the OS knows which socket owns the packet

## Step 6: How Ports Work in Communication

When a client connects to a server, both **source and destination ports** are used:

`Client (192.168.1.10:49152) → Server (192.168.1.20:80)`

The TCP/UDP header contains both port numbers:
• **Source port** (49152) — the client's temporary port
• **Destination port** (80) — the server's well-known port

The server responds using the **reversed** port pair:
`Server (192.168.1.20:80) → Client (192.168.1.10:49152)`

## Step 7: Ports Summary

**Key takeaway:** Ports enable a single IP address to host multiple services by assigning unique numbers to each.

**Range breakdown:**
• 0–1023: Well-known (root required)
• 1024–49151: Registered (application-specific)
• 49152–65535: Dynamic (client temporary)

**Protocol distinction:**
• TCP: Reliable, connection-oriented
• UDP: Fast, connectionless

Understanding ports is essential for **firewall rules**, **port forwarding**, **NAT**, and **service troubleshooting**.
