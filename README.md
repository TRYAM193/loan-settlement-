# 🚀 TRYAM Automation — Autonomous Omnichannel Loan Settlement Operating System

> **Enterprise Debt Settlement & AI-Powered Lead Ingestion System**  
> Built for debt settlement agencies to automatically capture call recordings, transcribe Indian regional languages (Kannada, Hinglish, etc.), dynamically assign specialists, run Document OCR Vision parsing, and notify clients via channel-aware communications.

---

## 🌟 Core Features Implemented

### 0. 🎨 Apple Light Studio & Space Gray Dynamic Design System
* **🍎 Apple Light Studio Aesthetics (`globals.css`):** Light Studio neutral background (`#f5f5f7`), pure white card surfaces (`#ffffff`), and restrained Apple Blue accent (`#0071e3`). Fully adaptive to **Space Gray Dark Mode** (`#000000` / `#161617`) with a 1-click theme switcher in the Navbar.
* **🪐 3D Spatial Antigravity Cards (`AntigravityCard.tsx`):** Physics-driven 3D tilt interaction with real-time mouse specular glare reflections and weightless depth.
* **🌗 100% Theme-Adaptive Popup Modals & Drawers:** All popups (`LeadDetailDrawer`, `AuthModal`, `EmployeeClientCards`, `IngestLeadModal`, `AdminChatbot`) dynamically adapt backgrounds, headers, and text labels to `var(--bg-surface)` and `var(--text-primary)`, guaranteeing zero unreadable text in both Light and Dark themes.
* **📊 Harmonized Data Caseload Radar:** Explicitly synchronizes and distinguishes **Active Cases** (`status !== 'settled'`) from **Total Assigned Client History** across the Admin Inspector header, employee dropdown options, and KPI metric cards.
* **🛡️ Security & API Hardening:** Sanitized all raw API key references, removed client-side environment variable leaks, fixed database column name mappings (`active_caseload`), and implemented status preservation to protect settled cases during call ingestion.
* **📄 Dynamic Document Text Parsing:** Replaced static fallback figures with dynamic regex extraction of real numeric amounts from incoming document text.
* **🔤 Google Outfit & Inter Typography:** Premium font pairing (`Outfit`, `Inter`, `JetBrains Mono`) for numbers, debt values, and metrics.
* **💼 Enhanced Scannable Lead Directory (`LeadsTable.tsx`):** Interactive channel filter pills (*Google*, *WhatsApp*, *Calls*, *Email*, *Harassment Flagged*), hover elevations, and status badges.

### 1. 🖥️ Dual Role Auth & Separate Dashboards (Admin vs Employee Workspace)
* **🔐 Mandatory Launch Auth Pop-Up (`AuthModal`):**
  * Application starts unauthenticated by default, automatically popping up the TRYAM Access Portal login screen on launch.
  * Allows quick switching between **Admin Full Master Access** and individual **Employee Isolated Workspaces**.
* **👑 Admin Master Control Center (`role: 'admin'`):**
  * Displays total clients, assigned vs pending, overall debt portfolio (₹12.4M+), and settlement waivers.
  * **Live Employee Activity & Capacity Radar:** Real-time visibility into what every employee is doing, active caseloads, and status.
  * **Admin Inspector Dropdown:** Allows Admin to view the master agency dashboard or inspect what any individual employee sees.
  * **AI Admin Chatbot Assistant (`AdminChatbot` / `/api/chat`):** Built-in intelligent assistant with full master access to agency metrics.
* **💼 Employee Personal Workspace (`role: 'agent'` / `'senior_specialist'`):**
  * Displays **ONLY clients assigned to that specific employee** (Strict Data Privacy Isolation).
  * **Role-Aware AI Assistant:** Restricted to answering queries strictly regarding that employee's assigned clients.
  * **API Rate Limit (HTTP 429) & Quota Handling:** Displays a 1-2 minute busy notice if API rate limits are exceeded, with instant local DB intelligence fallback.
  * **🎉 "Client Case Finished / Settled" Action Button:**
    * Single-click completion button that updates client status to **`settled`** (Happy Customer).
    * Dispatches an automated **Celebration WhatsApp Message FROM the Main Company Master Number** directly to the client:
      ```text
      🎉 CONGRATULATIONS FROM TRYAM LOAN SETTLEMENT!

      Dear [Client Name],
      Your debt settlement case has been officially COMPLETED & SETTLED!
      We are thrilled to help you achieve full financial freedom.
      ```
    * Audits interaction in Supabase `lead_logs` with `sentiment: 'HappyCustomer'`.

### 4. 💬 Meta WhatsApp Cloud API Inbound Webhook (`/api/webhook/whatsapp`)
* **📲 Direct Company WhatsApp Number Ingestion:** Connects your official company Meta WhatsApp Business number directly to TRYAM CRM.
* **GET URL Verification:** Handles Meta Webhook verification requests (`GET /api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=tryam_whatsapp_secret_token&hub.challenge=...`).
* **POST Event Ingestion:** Automatically ingests incoming WhatsApp messages, analyzes debt liabilities via TRYAM Financial AI, sets `source: 'whatsapp'`, and places the lead into the **`NEW` Admin Approval Queue**.
* **Filter Tab Sync:** Incoming WhatsApp leads automatically render under the **`WhatsApp`** filter tab with a green **WhatsApp Inbound** badge.

### 5. 🏢 Single Company Master Phone Number Architecture
* **Centralized Communication Hub:** All client inbound calls and WhatsApp messages hit **ONE single central company master number** (`+91 98765 00000` / WhatsApp Business Cloud API).
* **Zero Employee Setup Overhead:** Individual employees do NOT require separate WhatsApp Business registrations. Outbound notifications to clients are dispatched centrally from the master company number.

### 3. ♊ Google Gemini 2.5 Flash LLM & Vision OCR Engine
* **Speech Extraction:** Reads raw Kannada / English transcripts from **Sarvam AI `saarika:v2.5`** and uses **Gemini 2.5 Flash** to extract structured JSON (Lender Names, Debt Amounts, Overdue Duration, Distress Score).
* **Document Vision OCR:** Uses **Gemini 2.5 Flash Vision** to analyze bank notices, credit card bills, and demand letters, extracting Lender Name, Account Number, Principal, Overdue Fees, and calculating Target Settlement Waiver (35% – 45%).

### 4. 🎙️ Sarvam AI Kannada & Regional Speech STT Engine (`saarika:v2.5`)
* **Indian Language Specialization:** Integrated **Sarvam AI `saarika:v2.5`** to accurately transcribe informal Kannada (`kn-IN`), Kanglish, Hindi, Hinglish, Tamil, Telugu, and other regional dialects.
* **Multi-Provider Fallback:** Auto-detects and falls back smoothly to **Groq Free Whisper-Large-v3** and **OpenAI Whisper**.

### 5. 📱 Android Background Call Listener App (`TRYAM Call Listener`)
* **Native Android App (Kotlin):** Background service that listens for `CALL_STATE_IDLE` events.
* **Android 10+ Fallback:** Queries `CallLog` provider to resolve caller numbers when telephony intent extras are null.
* **Storage Audio Scanner:** Scans device storage & MediaStore for newly generated `.m4a`/`.aac`/`.mp3` call recordings.

### 6. 📩 Channel-Aware Client Notification Engine
* **Automatic Representative Contact Card:** Sends assigned specialist details (**Specialist Name**, **Phone Number**, **Email**) directly to the client via Email or WhatsApp.

### 7. 📜 RBI Anti-Harassment Legal Notice Generator
* **Regulatory Compliance:** Automatically generates formal Cease-and-Desist Legal Representation Notices under **RBI Guidelines on Fair Practices Code for Lenders (RBI/2015-16/160)**.

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
 • Scans Device Audio                • /api/ingest/document-ocr            • Storage ('call-recordings')
 • Multipart Upload                   • /api/leads/assign                    • Realtime WebSockets
 • Diagnostic File Scanner            • /api/leads/settle                    • Dual Role Dashboards
                                      • Sarvam AI saarika:v2.5 (Kannada)       (Admin vs Employee)
                                      • Google Gemini 2.5 Flash LLM & Vision
```

---

## 📋 API Endpoints

### 1. `POST /api/ingest/android-call`
Ingests call audio from the Android app, uploads recording to Supabase Storage, transcribes via Sarvam AI, extracts debt metrics via Gemini 2.5 Flash, and assigns a specialist.

### 2. `POST /api/ingest/document-ocr`
Ingests bank notice / debt bill photos, runs Gemini 2.5 Flash Vision OCR, extracts lender & principal metrics, and creates a settlement record in Supabase.

### 3. `POST /api/documents/analyze`
WhatsApp Client Document Analyzer endpoint. Parses text excerpts or bank statement uploads, extracts lender liabilities, updates lead total debt amount, and stores audit logs in Supabase.

### 4. `POST /api/chat`
Role-aware AI Assistant endpoint with built-in HTTP 429 rate limit error handling and local DB fallback engine.

### 5. `POST /api/leads/assign`
Admin endpoint to reassign or approve an employee for a lead, triggering dual WhatsApp & Email notifications.

### 6. `POST /api/leads/settle`
Employee case completion endpoint to mark client case as **Settled (Happy Customer)**, update Supabase DB, and dispatch automated Celebration WhatsApp message from the Main Company Master Number.

---

## 🔑 Environment Variables Configuration

Add the following environment variables to your `.env.local` or **Vercel Project Settings**:

```env
# Supabase Database & Storage
NEXT_PUBLIC_SUPABASE_URL=https://asednemwscdtetqwwuts.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret

# AI Models (Gemini 2.5 Flash & Sarvam AI)
GEMINI_API_KEY=your_gemini_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
GROQ_API_KEY=gsk_your_groq_free_key
OPENAI_API_KEY=sk-proj-your_openai_key

# WhatsApp Meta Cloud API (Central Master Company Number)
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
