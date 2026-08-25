---
name: HTTP & HTTPS
description: The web protocol — requests, responses, status codes, TLS
category: Networking Fundamentals
order: 35
---

## Step 1: HTTP Request [বাংলা অনুবাদ প্রয়োজন]

An **HTTP Request** is sent by the client to the server.

`GET /index.html HTTP/1.1`
`Host: example.com`
`User-Agent: Mozilla/5.0`
`Accept: text/html`

**Request components:**
• **Method** — What action to perform (GET, POST, etc.)
• **Path** — The resource URL (/index.html)
• **Version** — HTTP version (HTTP/1.1, HTTP/2)
• **Headers** — Metadata (Host, Accept, Authorization)
• **Body** — Data payload (for POST/PUT)

**Example with curl:**
`curl -v https://example.com/index.html`

## Step 2: HTTP Methods [বাংলা অনুবাদ প্রয়োজন]

**HTTP Methods** define the action to perform on a resource:

**GET** — Read a resource (idempotent)
**POST** — Create a new resource
**PUT** — Replace/update a resource (idempotent)
**PATCH** — Partially update a resource
**DELETE** — Remove a resource (idempotent)
**HEAD** — Same as GET but no body (headers only)
**OPTIONS** — What methods are allowed (CORS preflight)

**Idempotent** means calling it multiple times has the same effect as calling it once.

**REST API example:**
`GET /api/users` — List users
`POST /api/users` — Create user
`PUT /api/users/1` — Update user 1
`DELETE /api/users/1` — Delete user 1

## Step 3: HTTP Response [বাংলা অনুবাদ প্রয়োজন]

The server sends back an **HTTP Response**:

`HTTP/1.1 200 OK`
`Content-Type: text/html`
`Content-Length: 1234`

`&lt;!DOCTYPE html&gt;`
`&lt;html&gt;...&lt;/html&gt;`

**Response components:**
• **Status Line** — Version + status code + reason phrase
• **Headers** — Metadata (Content-Type, Cache-Control, Set-Cookie)
• **Body** — The actual content (HTML, JSON, images)

**Common headers:**
• `Content-Type` — MIME type of the body
• `Cache-Control` — Caching directives
• `Set-Cookie` — Set browser cookies
• `Location` — Redirect URL (3xx)

## Step 4: HTTPS & TLS [বাংলা অনুবাদ প্রয়োজন]

**HTTPS** is HTTP wrapped in **TLS (Transport Layer Security)** encryption.

**TLS Handshake:**
1. Client sends **ClientHello** (supported ciphers, TLS version)
2. Server sends **ServerHello** (chosen cipher, certificate)
3. Client verifies certificate against trusted CAs
4. Key exchange — both sides generate shared secret
5. Encrypted communication begins

**What TLS protects:**
• **Confidentiality** — Encryption prevents eavesdropping
• **Integrity** — MAC prevents tampering
• **Authentication** — Certificates verify server identity

**Check TLS:**
`openssl s_client -connect example.com:443`
`curl -vI https://example.com`

## Step 5: Status Codes [বাংলা অনুবাদ প্রয়োজন]

**HTTP Status Codes** indicate the result of the request:

**2xx Success:**
• `200 OK` — Request succeeded
• `201 Created` — Resource created (POST)
• `204 No Content` — Success, no body (DELETE)

**3xx Redirection:**
• `301 Moved Permanently` — Permanent redirect
• `302 Found` — Temporary redirect
• `304 Not Modified` — Use cached version

**4xx Client Error:**
• `400 Bad Request` — Malformed syntax
• `401 Unauthorized` — Authentication required
• `403 Forbidden` — No permission
• `404 Not Found` — Resource doesn't exist

**5xx Server Error:**
• `500 Internal Server Error` — Generic server failure
• `502 Bad Gateway` — Upstream server error
• `503 Service Unavailable` — Server overloaded
• `504 Gateway Timeout` — Upstream timeout
