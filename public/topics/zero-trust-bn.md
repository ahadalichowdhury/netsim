---
name: Zero Trust
description: Never trust, always verify — identity-based network security
category: Advanced Networking
order: 46
---

## Step 1: Identity Verification [বাংলা অনুবাদ প্রয়োজন]

**Identity** is the first pillar of Zero Trust.

**Who are you?**

Every access request begins with **strong identity verification**:
• **MFA (Multi-Factor Authentication)** — something you know + something you have
• **SSO (Single Sign-On)** — centralized authentication across all apps
• **Continuous authentication** — re-verify throughout the session, not just at login

**Traditional model:** "You logged in once, you’re trusted."
**Zero Trust:** "Prove who you are, every single time."

## Step 2: Device Trust [বাংলা অনুবাদ প্রয়োজন]

**Device Posture** — the second pillar.

**Is it healthy?**

Before granting access, Zero Trust verifies the **device itself**:
• **Device health checks** — is the OS patched? Is antivirus running?
• **Compliance** — does the device meet security baselines?
• **EDR (Endpoint Detection & Response)** — is there malware or suspicious activity?

**Why it matters:** Even a valid user on a compromised device is a risk. Zero Trust evaluates **both** user identity AND device health.

## Step 3: Micro-segmentation [বাংলা অনুবাদ প্রয়োজন]

**Network Access** — the third pillar.

**Micro-segmentation** means:
• **Least-privilege access** — only access what you need, nothing more
• **No implicit trust** — being on the network doesn’t mean you’re trusted
• **Per-workload segmentation** — each app/server is its own security zone

**Traditional:** Flat network — once inside, you can reach everything.
**Zero Trust:** Every connection is individually authorized and encrypted.

## Step 4: Per-Application Access [বাংলা অনুবাদ প্রয়োজন]

**Application** layer — the fourth pillar.

**ZTNA (Zero Trust Network Access)** replaces traditional VPN:
• **No VPN** — users connect directly to apps, not the network
• **Per-app access** — each application requires separate authorization
• **Direct app access** — no backhauling through corporate network

**Traditional VPN:** Full network access once connected.
**ZTNA:** Only access the specific app you’re authorized for, nothing else.

## Step 5: Policy Engine [বাংলা অনুবাদ প্রয়োজন]

**Policy Engine** — the brain of Zero Trust.

**Context-aware decisions:**

The policy engine evaluates multiple signals before granting access:
• **User identity** — who is requesting?
• **Device posture** — is the device compliant?
• **Location** — where are they connecting from?
• **Time** — is it during business hours?
• **Risk score** — how likely is this a threat?

**Result:** ALLOW or DENY — every request is individually evaluated.
