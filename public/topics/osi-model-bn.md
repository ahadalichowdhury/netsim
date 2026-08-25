---
name: OSI & TCP-IP Model
description: The layered architecture — why networking is split into layers
category: Networking Fundamentals
order: 28
---

## Step 1: Why Layers? [বাংলা অনুবাদ প্রয়োজন]

Networking is complex — from physical cables to application protocols. To manage this complexity, the industry split networking into **layers**.

Each layer has **one specific job** and communicates with the layers directly above and below it. This is called **modularity**.

Benefits:
• **Simpler design** — each layer only handles its own concerns
• **Easier troubleshooting** — isolate problems to a specific layer
• **Interoperability** — vendors can build products for one layer without worrying about others
• **Flexibility** — swap one layer without changing the others

## Step 2: Physical Layer (Layer 1) [বাংলা অনুবাদ প্রয়োজন]

The **Physical Layer** deals with the raw transmission of **bits** over a physical medium.

This includes:
• **Cables** — copper (Cat5e/Cat6), fiber optic, coaxial
• **Signals** — electrical voltage, light pulses, radio waves
• **Connectors** — RJ-45, LC, SC
• **Data rate** — 100 Mbps, 1 Gbps, 10 Gbps

At this layer, there are no addresses, no frames — just **1s and 0s** on the wire.

## Step 3: Data Link Layer (Layer 2) [বাংলা অনুবাদ প্রয়োজন]

The **Data Link Layer** provides **reliable node-to-node** delivery on the same network.

Key concepts:
• **MAC addresses** — physical hardware identifiers (AA:BB:CC:DD:EE:FF)
• **Ethernet frames** — the data unit at this layer
• **Switches** — forward frames using MAC address tables
• **Error detection** — CRC/FCS checks

Layer 2 handles communication within a **single local network**. To reach a different network, you need Layer 3.

## Step 4: Network Layer (Layer 3) [বাংলা অনুবাদ প্রয়োজন]

The **Network Layer** handles **routing across different networks**.

Key concepts:
• **IP addresses** — logical addresses (192.168.1.10)
• **Routers** — forward packets between networks
• **Packets** — the data unit at this layer
• **Routing tables** — determine the best path

Layer 3 enables communication across the internet by finding the best path from source to destination.

## Step 5: Transport Layer (Layer 4) [বাংলা অনুবাদ প্রয়োজন]

The **Transport Layer** provides **end-to-end communication** between applications.

Two main protocols:
• **TCP** — reliable, ordered delivery with acknowledgments
• **UDP** — fast, connectionless, no guarantees

Key concepts:
• **Port numbers** — identify specific services (80 = HTTP, 443 = HTTPS)
• **Segments** — the data unit at this layer
• **Flow control** — prevent overwhelming the receiver

## Step 6: Session/Presentation/Application (Layers 5-7) [বাংলা অনুবাদ প্রয়োজন]

The upper three layers handle **application-level concerns**:

**Layer 5 — Session:**
• Manages sessions between applications
• Authentication and reconnection

**Layer 6 — Presentation:**
• Data formatting, encryption, compression
• SSL/TLS encryption happens here

**Layer 7 — Application:**
• The protocols users interact with directly
• HTTP, DNS, SMTP, FTP, SSH

In practice, the TCP/IP model merges these three into a single **Application layer**.

## Step 7: TCP/IP Model (4 Layers) [বাংলা অনুবাদ প্রয়োজন]

The **TCP/IP model** is the practical, real-world model used on the internet today. It simplifies the OSI model into **4 layers**:

• **Application** — HTTP, DNS, SMTP (combines OSI layers 5-7)
• **Transport** — TCP, UDP (same as OSI layer 4)
• **Internet** — IP, ICMP (same as OSI layer 3)
• **Network Access** — Ethernet, WiFi (combines OSI layers 1-2)

**Key takeaway:** Both models describe the same concepts — TCP/IP is just more practical. When people refer to "layers" in networking, they usually mean the TCP/IP model.
