---
name: TCP Handshake
description: TCP 3-Way Handshake — how connections are established
category: Networking Fundamentals
order: 17
---

## Step 1: Client wants to connect to Web Server [বাংলা অনুবাদ প্রয়োজন]

The Client wants to fetch a web page from the **Web Server** (192.168.1.20).

Before any data can be exchanged, TCP requires a **3-way handshake** to establish a reliable connection. Both sides must agree on initial sequence numbers.

**Prerequisite:** DNS resolution must happen first to get the server's IP address. See the **DNS** topic.

**See also:** **TCP/UDP Ports** topic for port numbers used in the handshake.

## Step 2: Client builds SYN (Seq=1000) [বাংলা অনুবাদ প্রয়োজন]

The Client initiates the handshake by building a **SYN** (Synchronize) segment:
`SYN=1, Seq=1000`

This tells the server: "I want to connect, and my starting sequence number is **1000**."

## Step 3: SYN: Client → Switch [বাংলা অনুবাদ প্রয়োজন]

The Client sends the SYN segment to the Switch.
`Src MAC: AA:BB:CC:DD:EE:01 (Client)`
`Dst MAC: AA:BB:CC:DD:EE:FF (Web Server)`

The Switch receives the frame and will forward it toward the Server.

## Step 4: Switch forwards SYN to Server [বাংলা অনুবাদ প্রয়োজন]

The Switch looks up the destination MAC and forwards the SYN frame to the Web Server.

## Step 5: Server receives SYN, builds SYN-ACK [বাংলা অনুবাদ প্রয়োজন]

The Web Server receives the SYN and builds a **SYN-ACK**:
`SYN=1, ACK=1, Seq=5000, Ack=1001`

This means: "I acknowledge your SYN (Ack=**1001** = your Seq + 1), and my starting sequence number is **5000**."

## Step 6: SYN-ACK: Server → Switch [বাংলা অনুবাদ প্রয়োজন]

The Web Server sends the SYN-ACK segment to the Switch.
`Src MAC: AA:BB:CC:DD:EE:FF (Server)`
`Dst MAC: AA:BB:CC:DD:EE:01 (Client)`

## Step 7: Switch forwards SYN-ACK to Client [বাংলা অনুবাদ প্রয়োজন]

The Switch looks up the destination MAC (Client) and forwards the SYN-ACK frame.

## Step 8: Client builds final ACK (Ack=5001) [বাংলা অনুবাদ প্রয়োজন]

The Client receives the SYN-ACK and builds the final **ACK**:
`ACK=1, Ack=5001`

This means: "I acknowledge your SYN (Ack=**5001** = your Seq + 1)." The 3-way handshake is complete!

## Step 9: ACK: Client → Switch [বাংলা অনুবাদ প্রয়োজন]

The Client sends the final ACK to the Switch. The TCP 3-way handshake is now complete — a reliable connection is established!

## Step 10: Switch forwards ACK to Server [বাংলা অনুবাদ প্রয়োজন]

The Switch forwards the ACK frame to the Web Server. Both sides have agreed on sequence numbers — the connection is established!

## Step 11: Connection established! HTTP GET sent [বাংলা অনুবাদ প্রয়োজন]

Now that the TCP connection is established, the Client sends an **HTTP GET** request:
`GET / HTTP/1.1`
`Host: web-server`

TCP ensures this data arrives reliably and in order.

## Step 12: Server responds HTTP 200 OK [বাংলা অনুবাদ প্রয়োজন]

The Web Server processes the request and sends back an **HTTP response**:
`HTTP/1.1 200 OK`
`Content-Type: text/html`

TCP guarantees the response data arrives intact and in order.
