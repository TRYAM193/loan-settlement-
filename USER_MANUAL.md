# 📖 TRYAM Enterprise AI Loan Settlement CRM — Complete User Manual & System Guide

Welcome to the **TRYAM Enterprise AI Loan Settlement CRM User Manual**. This document provides an exhaustive, step-by-step guide to operating, managing, and navigating every feature within the TRYAM Platform.

---

## 📑 Table of Contents
1. [Platform Overview & Role-Based Access](#1-platform-overview--role-based-access)
2. [Dashboard Navigation & Key Performance Indicators (KPIs)](#2-dashboard-navigation--key-performance-indicators-kpis)
3. [Lead Ingestion & Multilingual AI Processing](#3-lead-ingestion--multilingual-ai-processing)
4. [Client Directory, Search & Filtering](#4-client-directory-search--filtering)
5. [Admin Workload & Employee Specialist Reassignment](#5-admin-workload--employee-specialist-reassignment)
6. [Client Settlement & Automated Legal Communications](#6-client-settlement--automated-legal-communications)
7. [TRYAM AI Operational Copilot](#7-tryam-ai-operational-copilot)
8. [Troubleshooting & Data Safety Standards](#8-troubleshooting--data-safety-standards)

---

## 1. Platform Overview & Role-Based Access

The **TRYAM Enterprise AI Platform** is an intelligent, automation-first Debt Restructuring & Settlement CRM designed for legal agencies, debt managers, and customer support specialists.

### 👥 User Roles:
1. **Agency Admin Manager (`Master Admin`)**:
   - **Access Level**: Full agency visibility.
   - **Capabilities**: Monitor overall debt portfolio, approve & route inbound leads, reassign cases among specialists, monitor team capacity utilization, and query full agency metrics via TRYAM AI Copilot.
2. **Employee Specialist (`Rahul Verma`, `Ananya Sharma`, `Vijay Kumar`)**:
   - **Access Level**: Strictly isolated personal portfolio.
   - **Capabilities**: View assigned client cases, generate legal cease-and-desist notices under RBI Fair Practices Code, and execute 1-Click Client Case Settlement.

---

## 2. Dashboard Navigation & Key Performance Indicators (KPIs)

Upon opening the CRM at `http://localhost:3000` or your deployed Vercel URL, the top header presents four real-time KPI cards:

| KPI Card | Metric Displayed | Operational Meaning |
| :--- | :--- | :--- |
| **Active Debt Portfolio** | `₹100.79 Cr` | Total combined debt volume currently managed across all active client cases. |
| **Active Ingested Clients** | `24` (8 Settled) | Total count of active, non-settled debt cases vs. fully resolved cases. |
| **Team Capacity Utilization** | `129%` | Real-time workload percentage across specialist staff (Max 15 cases/specialist). |
| **Anti-Harassment Notices** | `Active` | Count of critical cases flagged for recovery agent harassment requiring RBI legal protection. |

---

## 3. Lead Ingestion & Multilingual AI Processing

Click the **`+ Ingest Lead`** button in the top right navbar to open the Lead Ingestion Modal.

### 🎙️ Option A: Simulate Customer Audio Call (AI Demo)
1. Select a scenario preset:
   - **Scenario A (Ramesh Kumar - Bengaluru)**: Regional Kannada call audio detailing HDFC Bank (₹2.8L) & ICICI Credit Card (₹1.7L) debt with critical workplace harassment.
   - **Scenario B (Anjali Sharma - Mumbai)**: High distress merchant debt across SBI (₹5.2L) & Bajaj Finance (₹3.0L).
2. The **TRYAM Enterprise Regional Speech Engine** automatically transcribes the audio, extracts lenders, calculates debt liabilities, and sets distress scores.

### 📁 Option B: Upload Audio File
1. Upload any `.m4a`, `.mp3`, or `.wav` customer call recording file.
2. The engine transcribes the audio file and stores the record securely in the **Enterprise Cloud Vault**.

### 📝 Option C: Manual Form Ingestion
1. Enter the client's full name, phone number (`+91 ...`), and total debt amount.
2. Click **`Log Client & Send to Admin Approval Queue`**.
3. **Database Security Note**: Duplicate phone numbers automatically update existing records via database upsert without causing error crashes.
4. **Workflow Note**: Newly ingested leads enter with status **`NEW`**, making them immediately available in the Admin Approval Queue.

### 💬 Option D: Meta WhatsApp Cloud API Inbound Ingestion
1. Clients message your official company WhatsApp number.
2. The incoming message hits `POST /api/webhook/whatsapp`, auto-transcribes financial metrics via **TRYAM Proprietary Financial AI**, sets `source: 'whatsapp'`, and places the lead into the **`NEW` Admin Approval Queue**.
3. All incoming WhatsApp leads immediately appear under the **`WhatsApp`** channel filter tab with a green **WhatsApp Inbound** badge.

---

## 4. Client Directory, Search & Filtering

### 🔍 Real-Time Search Bar
Located in the main top navbar. Type any client name (e.g. *Sathish*), phone number, lender bank (e.g. *HDFC*), or specialist name (e.g. *Vijay*). Results filter instantly without reloading the page.

### 🏷️ Source Channel Tabs
Filter your directory by lead acquisition source:
- **All Channels** | **Google** | **WhatsApp** | **Calls** | **Email** | **Harassment Flagged**

### 👤 Specialist Inspection Filter
Admins can filter the entire CRM dashboard by specific specialists:
- **Master Agency View**: Displays all client records across all specialists.
- **Vijay Kumar's View**: Filters and displays only Vijay Kumar's active cases.
- **Rahul Verma's View**: Filters and displays only Rahul Verma's active cases.
- **Ananya Sharma's View**: Filters and displays only Ananya Sharma's active cases.

---

## 5. Admin Workload & Employee Specialist Reassignment

### ⚡ Approve & Assign (New Leads)
When a lead is in **`NEW`** status:
1. Click **`Approve & Assign`** directly on the lead row in the directory table.
2. The system checks specialist capacity, assigns the lead, transitions status to **`ASSIGNED`**, and dispatches an automated notification alert.

### 🔄 Reassigning Cases Between Specialists
To transfer a case from one specialist to another (e.g., from *Vijay Kumar* to *Rahul Verma*):
1. Click **`View File >`** on the target client row to open the **Client Case Drawer**.
2. Scroll to **Admin Workload & Employee Reassignment Control**.
3. Select the new specialist from the dropdown menu (e.g., *Rahul Verma*).
4. Click **`Approve & Notify Client`**.

> [!IMPORTANT]
> **Real-Time Transfer Behavior**: If you are currently inspecting Vijay Kumar's Dashboard and reassign a client to Rahul Verma, the client case will **instantly disappear** from Vijay Kumar's view and immediately appear under Rahul Verma's view.

---

## 6. Client Settlement & Automated Legal Communications

### 📄 Generating Legal Cease-and-Desist Notices
Inside the **Client Case Drawer**:
1. View auto-generated cease-and-desist notices formatted under RBI Guidelines on Fair Practices Code.
2. Click **`Copy Legal Notice`** to copy the formal legal text to your clipboard.

### 💬 Automated Client & Employee Notifications
- Click **`Notify Employee (WhatsApp)`** to send an instant assignment dispatch to the specialist's phone.
- Click **`Send Client Assignment Notice`** to send the client their dedicated specialist details via WhatsApp or Email.

### 🎉 1-Click Client Case Settlement
When loan negotiations complete and the client pays their settled amount:
1. Open the **Client Case Drawer**.
2. Click **`Client Case Finished`**.
3. Status transitions to **`SETTLED`**, the specialist's active workload capacity is freed up, and a celebration message is dispatched.

---

## 7. TRYAM AI Operational Copilot

Click the blue **`TRYAM AI Copilot`** floating button in the bottom right corner to interact with your operational intelligence assistant.

### 💡 Example Prompt Queries:
- *"Show me Vijay's active cases"*
- *"Which leads are flagged for workplace harassment?"*
- *"Calculate total portfolio debt across all agents"*
- *"List all settled cases from this month"*

> [!NOTE]
> **Data Privacy Guarantee**: When logged in as an Employee Specialist, the AI Copilot operates in Strict Data Privacy Mode and responds *only* with data belonging to that specific specialist's assigned clients.

---

## 8. Troubleshooting & Data Safety Standards

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| **Lead doesn't show in list** | Active search query filter | Clear text in top search bar to show all leads. |
| **Reassigned lead disappeared** | Inspecting previous agent's view | Switch the Inspector Filter to the newly assigned agent's name. |
| **Duplicate phone number** | Phone already exists in database | Form automatically performs an upsert, updating existing client data cleanly. |

---

*TRYAM Enterprise AI System Guide — Confidential & Proprietary*
