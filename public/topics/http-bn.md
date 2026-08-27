---
name: HTTP এবং HTTPS
description: ওয়েব প্রোটোকল — request, response, status code, TLS
category: Networking Fundamentals
order: 35
---

## Step 1: HTTP Request

একটি **HTTP Request** client দ্বারা server কে পাঠানো হয়।

`GET /index.html HTTP/1.1`
`Host: example.com`
`User-Agent: Mozilla/5.0`
`Accept: text/html`

**Request এর উপাদান:**
• **Method** — কোন কাজটি করতে হবে (GET, POST, ইত্যাদি)
• **Path** — resource URL (/index.html)
• **Version** — HTTP version (HTTP/1.1, HTTP/2)
• **Headers** — metadata (Host, Accept, Authorization)
• **Body** — data payload (POST/PUT এর জন্য)

**উদাহরণ curl দিয়ে:**
`curl -v https://example.com/index.html`

## Step 2: HTTP Methods

**HTTP Methods** resource এর উপর কোন কাজটি করতে হবে তা নির্ধারণ করে:

**GET** — একটি resource পড়ুন (idempotent)
**POST** — একটি নতুন resource তৈরি করুন
**PUT** — একটি resource প্রতিস্থাপন/আপডেট করুন (idempotent)
**PATCH** — আংশিকভাবে একটি resource আপডেট করুন
**DELETE** — একটি resource মুছুন (idempotent)
**HEAD** — GET এর মতো কিন্তু body নেই (শুধু headers)
**OPTIONS** — কোন methods অনুমোদিত (CORS preflight)

**Idempotent** মানে এটি একাধিকবার কল করলে একবার কল করার সমান ফলাফল হয়।

**REST API উদাহরণ:**
`GET /api/users` — ব্যবহারকারীদের তালিকা
`POST /api/users` — ব্যবহারকারী তৈরি করুন
`PUT /api/users/1` — ব্যবহারকারী 1 আপডেট করুন
`DELETE /api/users/1` — ব্যবহারকারী 1 মুছুন

## Step 3: HTTP Response

Server একটি **HTTP Response** ফিরিয়ে পাঠায়:

`HTTP/1.1 200 OK`
`Content-Type: text/html`
`Content-Length: 1234`

`&lt;!DOCTYPE html&gt;`
`&lt;html&gt;...&lt;/html&gt;`

**Response এর উপাদান:**
• **Status Line** — version + status code + reason phrase
• **Headers** — metadata (Content-Type, Cache-Control, Set-Cookie)
• **Body** — আসল কন্টেন্ট (HTML, JSON, image)

**সাধারণ headers:**
• `Content-Type` — body এর MIME type
• `Cache-Control` — caching directive
• `Set-Cookie` — browser cookie সেট করুন
• `Location** — redirect URL (3xx)

## Step 4: HTTPS এবং TLS

**HTTPS** হলো **TLS (Transport Layer Security)** encryption দিয়ে wrap করা HTTP।

**TLS Handshake:**
1. Client **ClientHello** পাঠায় (supported cipher, TLS version)
2. Server **ServerHello** পাঠায় (নির্বাচিত cipher, certificate)
3. Client trusted CA এর সাথে certificate যাচাই করে
4. Key exchange — উভয় পক্ষ shared secret তৈরি করে
5. Encrypted communication শুরু হয়

**TLS কী রক্ষা করে:**
• **Confidentiality** — encryption eavesdropping প্রতিরোধ করে
• **Integrity** — MAC tampering প্রতিরোধ করে
• **Authentication** — certificate server এর পরিচয় যাচাই করে

**TLS চেক করুন:**
`openssl s_client -connect example.com:443`
`curl -vI https://example.com`

## Step 5: Status Codes

**HTTP Status Codes** request এর ফলাফল নির্দেশ করে:

**2xx Success:**
• `200 OK` — Request সফল হয়েছে
• `201 Created** — Resource তৈরি হয়েছে (POST)
• `204 No Content` — সফল, body নেই (DELETE)

**3xx Redirection:**
• `301 Moved Permanently` — স্থায়ী redirect
• `302 Found` — অস্থায়ী redirect
• `304 Not Modified` — cached version ব্যবহার করুন

**4xx Client Error:**
• `400 Bad Request` — ভুল syntax
• `401 Unauthorized` — authentication প্রয়োজন
• `403 Forbidden` — অনুমতি নেই
• `404 Not Found` — Resource বিদ্যমান নেই

**5xx Server Error:**
• `500 Internal Server Error` — সাধারণ server ব্যর্থতা
• `502 Bad Gateway` — upstream server ত্রুটি
• `503 Service Unavailable` — server overloaded
• `504 Gateway Timeout` — upstream timeout