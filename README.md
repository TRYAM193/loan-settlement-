# 🚀 TRYAM Automation — Autonomous Omnichannel Loan Settlement Operating System

> **Enterprise Debt Settlement & AI-Powered Lead Ingestion System**  
> Built for debt settlement agencies to automatically capture call recordings, transcribe Indian regional languages (Kannada, Hinglish, etc.), dynamically assign specialists, and notify clients via channel-aware communications.

---

## 🌟 Core Features Implemented

### 1. 🎙️ Sarvam AI Kannada & Regional Speech STT Engine (`saarika:v2.5`)
* **Indian Language Specialization:** Integrated **Sarvam AI `saarika:v2.5`** to accurately transcribe informal Kannada (`kn-IN`), Kanglish, Hindi, Hinglish, Tamil, Telugu, and other regional dialects.
* **Multi-Provider Fallback:** Auto-detects and falls back smoothly to **Groq Free Whisper-Large-v3** and **OpenAI Whisper**.
* **Zero Socket-Reset Stream Encoding:** Built using Web-Native `fetch` & `Blob` multipart streaming to eliminate Vercel serverless `ECONNRESET` connection errors.

### 2. 📱 Android Background Call Listener App (`TRYAM Call Listener`)
* **Native Android App (Kotlin):** Background service that listens for `CALL_STATE_IDLE` events.
* **Android 10+ Fallback:** Queries `CallLog` provider to resolve caller numbers when telephony intent extras are null.
* **Storage Audio Scanner:** Scans device storage & MediaStore for newly generated `.m4a`/`.aac`/`.mp3` call recordings.
* **Direct Ingestion:** Transmits multipart audio recordings directly to the backend ingestion API (`/api/ingest/android-call`).

### 3. 👑 Admin Workload & Reassignment Control
* **Admin Approval Drawer:** Allows agency admins to inspect incoming leads, view total debt portfolio, and reassign specialists from an interactive capacity dropdown.
* **One-Click Approval:** Single-click **"Approve & Notify Client"** button updates Supabase PostgreSQL and dispatches automated alerts to both the assigned specialist and the client.

### 4. 📩 Channel-Aware Client Notification Engine
* **Automatic Representative Contact Card:** Sends assigned specialist details (**Specialist Name**, **Phone Number**, **Email**) directly to the client.
* **Channel Routing Logic:**
  * **Email Leads (`source: 'email'`):** Dispatches email notification to client's email address with direct `mailto:` action buttons.
  * **Call & WhatsApp Leads (`source: 'call'`, `'whatsapp'`):** Dispatches WhatsApp message to client's phone number with direct `wa.me` action links.

### 5. 📜 RBI Anti-Harassment Legal Notice Generator
* **Regulatory Compliance:** Automatically generates formal Cease-and-Desist Legal Representation Notices under **RBI Guidelines on Fair Practices Code for Lenders (RBI/2015-16/160)**.
* **Workplace Protection:** Instructs recovery agents to cease direct workplace contact and direct all settlement proposals strictly to TRYAM assigned legal specialists.

### 6. 📊 Supabase Realtime WebSocket Dashboard
* **Live Dashboard Sync:** Next.js 16 + React 19 interface subscribed to Supabase PostgreSQL Realtime channels (`supabase_realtime`).
* **KPI Metrics:** Displays Total Debt Portfolio, Active Settlements, Employee Caseload Radar, and Audio Call Player.

---

## 🛠️ System Architecture

```
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │                                  TRYAM AUTOMATION OS                                   │
   └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                               │
        ┌──────────────────────────────────────┼──────────────────────────────────────┐
        ▼                                      ▼                                      ▼
[Android Listener App]                [Vercel Backend & Ingestion API]      [Supabase DB & Storage]
 • Intercepts Ended Calls             • /api/ingest/android-call             • 4 Relational Tables
 • Scans Device Audio                • Sarvam AI saarika:v2.5 (Kannada)     • Storage ('call-recordings')
 • Multipart Upload                   • Dynamic Lead Router                  • Realtime WebSockets
 • Diagnostic File Scanner            • Channel-Aware Client Alerts          • Live Web Client Dashboard
```

---

## 📋 API Endpoints

### 1. `POST /api/ingest/android-call`
Ingests call audio from the Android app, uploads recording to Supabase Storage, transcribes via Sarvam AI, extracts debt metrics via GPT-4o-mini, and assigns a specialist.

* **Form Fields:** `caller_phone`, `agent_phone`, `duration`, `audio` (file)

### 2. `POST /api/leads/assign`
Admin endpoint to reassign or approve an employee for a lead, triggering dual WhatsApp & Email notifications.

* **Body JSON:** `{ "leadId": "string", "employeeId": "string", "adminApproved": true }`

---

## 🔑 Environment Variables Configuration

Add the following environment variables to your `.env.local` or **Vercel Project Settings**:

```env
# Supabase Database & Storage
NEXT_PUBLIC_SUPABASE_URL=https://asednemwscdtetqwwuts.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret

# Speech-to-Text Providers
SARVAM_API_KEY=sk_i12x685v_m1rPvpsQgdEvi1nGvg8nw1IY
GROQ_API_KEY=gsk_your_groq_free_key
OPENAI_API_KEY=sk-proj-your_openai_key

# WhatsApp Meta Cloud API (Optional for Direct WhatsApp Messaging)
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
```

---

## 🚀 Getting Started

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/TRYAM193/loan-settlement-.git
   cd loan-settlement
   npm install
   ```

2. **Run Local Development Server:**
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel:**
   ```bash
   git push origin main
   ```
