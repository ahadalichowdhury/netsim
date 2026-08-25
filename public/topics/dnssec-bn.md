---
name: DNSSEC
description: DNS Security Extensions — preventing cache poisoning and spoofing
category: Advanced Networking
order: 49
---

## Step 1: Chain of Trust [বাংলা অনুবাদ প্রয়োজন]

**DNSSEC** builds a **chain of trust** from the root zone down.

**Root zone** (.) — the anchor:
• Signed with a well-known Key Signing Key (KSK)
• Published in IANA root key signing ceremony
• Resolvers trust this key as the starting point

**How it works:**
1. Root zone signs the TLD zones
2. TLD zones sign the domains under them
3. Domains sign their own records
4. Resolver verifies each signature up to the root

**Result:** If any record is tampered with, the signature chain breaks.

## Step 2: DS Records [বাংলা অনুবাদ প্রয়োজন]

**DS (Delegation Signer)** records — parent signs child.

The parent zone (e.g., .com) contains a **DS record** that hashes the child zone's DNSKEY:

`.com → DS: SHA-256 hash of example.com DNSKEY`

**How it works:**
1. Parent zone signs the DS record with its own key
2. Resolver fetches the DS record from the parent
3. Resolver verifies the hash matches the child's DNSKEY

**Result:** The parent zone vouches for the child zone's key — extending the chain of trust.

## Step 3: RRSIG + DNSKEY [বাংলা অনুবাদ প্রয়োজন]

**Resource records** are signed with **RRSIG**.

Each DNS record type has associated security records:

**DNSKEY:**
• Contains the public key used to verify signatures
• Zone Signing Key (ZSK) — signs individual records
• Key Signing Key (KSK) — signs the DNSKEY record itself

**RRSIG:**
• The cryptographic signature over the resource records
• Contains: signature algorithm, expiration, original TTL
• Generated using the zone's private key

**Query:** `dig example.com +dnssec`

## Step 4: Validation [বাংলা অনুবাদ প্রয়োজন]

**Resolver verifies** the entire chain of trust.

**Validation process:**
1. Resolver receives a DNS response with RRSIG
2. Fetches the zone's DNSKEY
3. Verifies the RRSIG against the DNSKEY
4. Checks the DS record from the parent zone
5. Verifies the parent's DS matches the child's DNSKEY hash
6. Continues up to the root zone (which it already trusts)

**If any step fails:**
• Signature mismatch → **SERVFAIL**
• Expired signature → **SERVFAIL**
• Missing signature → **SERVFAIL**

**Result:** DNSSEC-validated responses are cryptographically proven authentic.
