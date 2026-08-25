---
name: How Networks Start
description: From user action to first packet — the complete journey
category: Networking Fundamentals
order: 8
---

## Step 1: User initiates a network action [বাংলা অনুবাদ প্রয়োজন]

Everything starts with a **user action**:

• User types `ping google.com`
• User opens a web browser and enters a URL
• User runs `ssh server.example.com`

The application now needs to communicate with a remote server. But how does it know **where** to send the data?

## Step 2: Application needs the server's IP address [বাংলা অনুবাদ প্রয়োজন]

The application has a **hostname** (like google.com) but needs an **IP address** to route packets.

**Two scenarios:**

1. **Hostname given** (e.g., google.com) → Need **DNS** to resolve to IP
2. **IP given directly** (e.g., ping 192.168.1.20) → Skip DNS

See the **DNS topic** for how resolution works.

## Step 3: DNS resolves hostname to IP (if needed) [বাংলা অনুবাদ প্রয়োজন]

If the user typed a **hostname**, the application sends a **DNS query**:

`DNS Query: google.com → ?`
`DNS Reply: google.com → 142.250.80.46`

Now the application has the **destination IP**. See the **DNS topic** for the full process.

## Step 4: Application needs the destination MAC address [বাংলা অনুবাদ প্রয়োজন]

Now the application has the **IP address**, but to send an **Ethernet frame**, it needs the **MAC address**.

**Question:** How does the sender know the destination MAC?

**Answer:** **ARP** (Address Resolution Protocol) discovers it.

But first — is the destination on the **same network** or a **different network**?

## Step 5: Same network? Use ARP directly. Different network? Use Gateway. [বাংলা অনুবাদ প্রয়োজন]

**If same subnet** (e.g., both 192.168.1.x):
• Use **ARP** to find the destination MAC directly
• See the **ARP topic**

**If different subnet** (e.g., 192.168.1.x → 8.8.8.8):
• Send frame to the **default gateway** (router)
• Use **ARP** to find the gateway's MAC
• See **Default Gateway** and **Gateway** topics

The **routing table** decides which path to take.

## Step 6: ARP discovers the MAC address [বাংলা অনুবাদ প্রয়োজন]

The application (or OS kernel) sends an **ARP broadcast**:

`ARP Request: "Who has 192.168.1.20?"`
`ARP Reply: "192.168.1.20 is at AA:BB:CC:DD:EE:02"`

Now we have both the **IP address** and the **MAC address**. See the **ARP topic** for the full process.

## Step 7: Application builds the Ethernet frame [বাংলা অনুবাদ প্রয়োজন]

Now the application has everything it needs:

`Source MAC: AA:BB:CC:DD:EE:01 (our NIC)`
`Destination MAC: AA:BB:CC:DD:EE:02 (target)`
`Source IP: 192.168.1.10`
`Destination IP: 192.168.1.20`

The **Ethernet frame** is constructed with the IP packet inside.

## Step 8: NIC transmits the frame onto the wire [বাংলা অনুবাদ প্রয়োজন]

The **NIC** (Network Interface Card) takes the frame and **transmits it** as electrical/optical signals on the cable.

The **switch** receives the frame and forwards it to the destination. See the **Layer 2 topic** for how switches work.

## Step 9: The complete journey [বাংলা অনুবাদ প্রয়োজন]

**Full chain from user action to network packet:**

1. **User** types command or opens URL
2. **Application** needs destination IP
3. **DNS** resolves hostname → IP (if needed)
4. **Routing table** decides: same network or gateway?
5. **ARP** discovers MAC address
6. **Frame** is built with MAC + IP headers
7. **NIC** transmits onto the wire
8. **Switch** forwards to destination

Each step is covered in detail in the other topics!
