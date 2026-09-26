# JurisAI — Legal Intelligence & Contract Risk Assessment Platform

JurisAI is an AI-powered legal intelligence engine designed to provide rapid contract risk assessment, clause-by-clause statutory analysis, interactive follow-up legal consultation, and executive summary exports for individuals, legal professionals, and business operators.

---

## Key Features

### 1. Automated Document Analysis & Ingestion
- Upload legal contracts, lease agreements, non-disclosure agreements (NDAs), terms of service, or legal petitions in **PDF, DOCX, TXT, PNG, and JPG** formats.
- Native DOCX XML text extraction and base64 multi-modal parsing for binary PDF documents and scans.
- Optional user context prompts to focus analysis on specific clauses or concerns.

### 2. Executive Risk Assessment & Threat Index
- **0–100 Critical Threat Index**: AI-calculated overall legal risk score categorized into High, Moderate, and Low risk thresholds.
- **Severity Breakdown**: Categorizes contract liabilities into **Critical Threats**, **Warnings**, and **Informational Notes**.
- **Interactive Vibe Check**: Dynamic contextual threat indicator tailored to contract terms.

### 3. Statutory Risk Clause Flagging
- **Verbatim Excerpts**: Exact clause quotes extracted directly from uploaded documents.
- **Statutory Law References**: Cites applicable statutes, legal standards, or regulatory precedents.
- **Plain-English Explanations**: Clear statutory breakdown of why a clause poses legal risk or liability.

### 4. Interactive AI Follow-Up Chat (RAG Engine)
- Ask document-specific questions (e.g., *"Draft a counter-proposal for Section 4"*, *"Is this termination clause standard?"*).
- Retains full case context (extracted document text, flagged risks, original user prompt, and conversation history).
- Generates structured answers with key takeaways, confidence ratings, and referenced clause tags.



### 6. Enterprise-Grade Security & Performance
- **XSS & HTML Sanitization**: Multi-layer HTML escaping across client components and PDF rendering pipelines.
- **HTTP Security Headers**: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and restrictive `Permissions-Policy`.
- **Database Optimization**: Mongoose connection pooling, compound indexing (`userId + createdAt`), and projected lean queries reducing API payload size by >95%.

---

## AI Techniques & Machine Learning Architecture

### 1. Schema-Guided Generative Inference
JurisAI utilizes Google Gemini's **Structured Output Schema (`GEMINI_RESPONSE_SCHEMA`)** to enforce strict JSON output schemas. This eliminates free-form hallucination and guarantees that document titles, risk scores, clause arrays, and statutory references match application data types.

### 2. Multi-Model Resiliency & Auto-Fallback Cascade
To maintain high availability during peak traffic or Gemini API rate limits, JurisAI implements an automated fallback cascade loop:
```
Primary Model (gemini-2.5-flash) -> Fallback 1 (gemini-2.0-flash) -> Fallback 2 (gemini-2.0-flash-lite) -> Fallback 3 (gemini-1.5-flash)
```
If an API request fails on the primary model, the engine instantly transitions to the next available Flash model without interrupting the user experience.

### 3. Contextual Retrieval-Augmented Generation (RAG)
For follow-up questions, JurisAI constructs a multi-layered context buffer combining:
1. Formatted Executive Analysis & Risk Matrix
2. High-Density Document Text Excerpt (up to 50,000 characters)
3. Historical User-AI Conversation Memory (sliding window)
4. System Prompting (`FOLLOWUP_SYSTEM_INSTRUCTION`) designed for precise legal interpretation.

### 4. Multi-Modal Document Vision & Parsing
- **Text & DOCX**: Decompressed via `jszip` and stripped of XML tags into clean plain text.
- **PDFs & Images**: Processed inline as Base64 data streams via Gemini's multi-modal vision capabilities for OCR and contextual understanding.

---

## Technology Stack

| Tier | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS / Vanilla CSS |
| **AI Engine** | `@google/genai` (Google Gemini 2.5 / 2.0 / 1.5 Flash) |
| **Backend & API** | Next.js Server Routes, Node.js Buffer Stream Processing |
| **Database** | MongoDB with Mongoose (Lean Queries, Compound Indexing) |
| **Authentication** | NextAuth.js (Google OAuth 2.0) |
| **Document Export** | Puppeteer / `@sparticuz/chromium` (Serverless Headless PDF Generation) |
| **Security** | HTML Sanitization, Input Clamping, HSTS, CSP, X-Frame-Options |

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance (Local or MongoDB Atlas cluster)
- Google OAuth Client ID & Secret
- Google Gemini API Key

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/jurisai"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Installation
Install dependencies:

```bash
npm install
```

### 4. Run Development Server
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Security Best Practices Implemented

- **XSS Defense**: Sanitized input strings (`escapeHtml`) on all user input and PDF generation paths.
- **Path Traversal Protection**: File name sanitization preventing relative path manipulation (`..`, slashes).
- **HTTP Hardening**: Configured security headers (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`).
- **Input Clamping**: Clamped prompt sizes to prevent token exhaustion and denial-of-service vectors.
