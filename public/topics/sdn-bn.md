---
name: SDN
description: Software Defined Networking — separating control and data planes
category: Advanced Networking
order: 45
---

## Step 1: Application Layer — Network Apps [বাংলা অনুবাদ প্রয়োজন]

The **Application Layer** contains network applications that define **what** the network should do.

**Examples:**
• **Routing apps** — compute optimal paths for traffic
• **Monitoring apps** — track traffic flows and anomalies
• **Security apps** — detect and block threats
• **Load balancing apps** — distribute traffic across servers

These applications communicate with the controller via the **Northbound API**. They don't directly configure switches — they express intent, and the controller translates that into forwarding rules.

## Step 2: Control Plane — The SDN Controller [বাংলা অনুবাদ প্রয়োজন]

The **SDN Controller** is the centralized brain of the network.

**What it does:**
• Maintains a **global view** of the entire network topology
• Makes **forwarding decisions** based on application requirements
• Pushes **flow rules** to switches via the Southbound API
• Responds to **network events** (link failures, new devices)

**Popular controllers:**
• **ONOS** — open-source, carrier-grade
• **OpenDaylight (ODL)** — modular, extensible
• **Ryu** — lightweight, Python-based

The controller is the single point of intelligence — it knows the entire network state and makes optimal decisions.

## Step 3: Data Plane — OpenFlow Switches [বাংলা অনুবাদ প্রয়োজন]

The **Data Plane** consists of **programmable switches** that follow controller instructions.

**How they work:**
• Switches have **flow tables** (not MAC tables)
• Each flow table entry matches packets and defines actions
• Switches forward packets based on these entries
• If no match → send to controller (packet-in)

**Flow table entry structure:**
`Match fields → Priority → Counters → Actions`

**Match fields:** src/dst IP, ports, VLAN, protocol
**Actions:** forward, drop, modify headers, send to controller

Unlike traditional switches, OpenFlow switches are **dumb forwarding engines** — the controller tells them exactly what to do.

## Step 4: Northbound API — Apps ↔ Controller [বাংলা অনুবাদ প্রয়োজন]

The **Northbound API** enables applications to communicate with the SDN controller.

**Primary interface: REST API**
• Apps send HTTP requests to the controller
• Query topology, push rules, get statistics
• Language-agnostic — any app in any language can use it

**Example API calls:**
`GET /topology` — get network topology
`POST /flows` — install new flow rules
`GET /stats/flow` — get flow statistics

The Northbound API is what makes SDN **programmable** — developers can write network applications without understanding hardware-specific CLI commands.

## Step 5: Southbound API — Controller ↔ Switches [বাংলা অনুবাদ প্রয়োজন]

The **Southbound API** enables the controller to communicate with network devices.

**Primary protocols:**
• **OpenFlow** — the standard SDN protocol for switch control
• **NETCONF/YANG** — configuration management for routers/switches
• **gRPC/gNMI** — modern, high-performance device management

**How it works:**
• Controller pushes flow entries to switches via OpenFlow
• Switches report events (packet-in, link changes) back to controller
• Controller maintains real-time view of all device states

**OpenFlow message types:**
• `FlowMod` — add/modify/delete flow entries
• `PacketOut` — send a packet out a switch port
• `PacketIn` — switch sends unknown packet to controller
• `Barrier` — ensure ordering of operations

The Southbound API is what **decouples** the control plane from the data plane — the defining characteristic of SDN.
