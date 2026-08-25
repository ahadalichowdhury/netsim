---
name: eBPF Networking
description: Programmable kernel — packet processing without kernel modules
category: Advanced Networking
order: 53
---

## Step 1: eBPF Programs [বাংলা অনুবাদ প্রয়োজন]

**eBPF** (extended Berkeley Packet Filter) allows **safe, verified programs** to run inside the Linux kernel.

How it works:
1. Write a program in C or restricted BPF
2. **Verifier** checks it's safe (no crashes, no loops)
3. **JIT compiler** converts to native machine code
4. Program is attached to a kernel hook

eBPF programs run at **kernel speed** — no context switches to userspace.

## Step 2: Hook Points [বাংলা অনুবাদ প্রয়োজন]

eBPF programs attach to specific **kernel hook points**:

• **XDP (eXpress Data Path)** — earliest hook, runs before the kernel network stack. Maximum performance for filtering/routing.
• **TC (Traffic Control)** — runs at the traffic control layer, after XDP but before the socket layer.
• **Socket hooks** — run at the socket level for application-aware processing.

The earlier the hook, the less kernel code is traversed — XDP is the fastest.

## Step 3: eBPF Maps [বাংলা অনুবাদ প্রয়োজন]

**eBPF Maps** are **key-value stores** shared between eBPF programs and userspace.

They enable:
• **Stateful processing** — track connections, counters, statistics
• **Communication** — programs can share data with each other
• **Userspace access** — read/update maps from userspace tools

Common map types: **HashMap**, **ArrayMap**, **LPM Trie** (longest prefix match), **Ring Buffer**.

## Step 4: Use Cases [বাংলা অনুবাদ প্রয়োজন]

eBPF powers several major networking projects:

• **Cilium** — Kubernetes CNI (Container Network Interface) using eBPF for high-performance networking, load balancing, and security policies
• **Falco** — runtime security threat detection using eBPF to monitor syscall activity
• **bcc** — BPF Compiler Collection for tracing and observability (tcpdump, network statistics)

eBPF eliminates the need for kernel modules — programs are verified and sandboxed by the kernel.
