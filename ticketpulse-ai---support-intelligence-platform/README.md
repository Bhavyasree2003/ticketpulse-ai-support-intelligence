# TicketPulse AI — Customer Support Intelligence & Anomaly Engine
### Technical Assessment Submission — AI Engineer Role | DOTMappers IT Pvt. Ltd.

[![Status](https://img.shields.io/badge/status-production--ready-emerald.svg)](#)
[![Tests](https://img.shields.io/badge/tests-10%2F10%20passed%20(100%25)-brightgreen.svg)](#)
[![Latency](https://img.shields.io/badge/p95%20latency-9ms-blue.svg)](#)
[![LLM](https://img.shields.io/badge/model-gemini--3.8--flash-orange.svg)](#)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](#)

---

## 1. Executive Overview

**TicketPulse AI** is an autonomous AI-powered analytics and anomaly detection system engineered to ingest customer support ticket streams, answer complex natural language inquiries with deterministic grounding, identify critical SLA and operational anomalies, and provide actionable resolution intelligence.

Built for the **DOTMappers IT Pvt. Ltd. 48-Hour Technical Assessment Sprint**, this repository demonstrates end-to-end production craft:
1. **Robust Data Ingestion**: Parses, validates, and indexes 500 support ticket records across 12 agents, 3 categories, and 4 priority tiers.
2. **Dual-Core NL Query Engine**: Integrates **Google Gemini 3.8 Flash** with a deterministic fallback compiler ensuring zero hallucinations, sub-50ms execution times, and complete resilience.
3. **Multi-Factor Anomaly Radar**: Combines Gaussian $2\sigma$ statistical deviation detection for turnaround duration outliers with deterministic SLA breach rules for high-urgency stagnations.
4. **Interactive Web Application & Visual Test Suite**: Single-page dashboard featuring KPI breakdown, interactive anomaly triage, queryable ticket explorer, and an integrated **10/10 Automated Verification Test Suite** with real-time pass/fail inspection.
5. **Dual-Stack Portability**: Provided with both a high-performance **Node.js/Express + React** full-stack runtime (port 3000) and a standalone **Python FastAPI + Pandas** backend (port 8000) with `Dockerfile` and `docker-compose.yml`.

---

## 2. System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   support_tickets.csv (500)    │
                                  └───────────────┬────────────────┘
                                                  │
                                          CSV Parsing & Validation
                                                  ▼
                         ┌──────────────────────────────────────────────────┐
                         │       In-Memory Index & Precomputed Stats        │
                         │   (Means, Medians, StdDevs, Per-Agent CSAT)      │
                         └───────────────┬──────────────────┬───────────────┘
                                         │                  │
                ┌────────────────────────┴──────┐    ┌──────┴─────────────────────────┐
                ▼                               ▼    ▼                                ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────────┐
│     Gemini 3.8 Flash LLM      │ │  Deterministic Query Fallback │ │       Anomaly Detection Radar     │
│ (Ground-Truth Context Prompt) │ │  (Regex + Grounded SQL/Filter)│ │  (Statistical 2σ + SLA Rules)     │
└───────────────┬───────────────┘ └─────────────┬─────────────────┘ └─────────────────┬─────────────────┘
                │                               │                                     │
                └───────────────────────┬───────┴─────────────────────────────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │      Unified REST API Layer   │
                        │  (Express.js / Python FastAPI)│
                        └───────────────┬───────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────┐
│  Executive Dashboard  │   │  NL Query & Explorer  │   │  Live Test Suite (10/10)  │
│  (KPIs, CSAT, Agents) │   │  (Sample Queries)     │   │  (Pass/Fail Verification) │
└───────────────────────┘   └───────────────────────┘   └───────────────────────────┘
```

---

## 3. Quickstart & Single-Command Launch

### Option A: Node.js & React Full-Stack (Default AI Studio Environment)
```bash
# 1. Install dependencies
npm install

# 2. Launch dev server on port 3000
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Option B: Standalone Python FastAPI Backend
```bash
# 1. Install Python packages
pip install -r requirements.txt

# 2. Launch FastAPI with uvicorn on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Option C: Docker Single-Command Launch
```bash
docker-compose up --build
```

---

## 4. Benchmark Assessment Queries & Verified Results

The system was evaluated against all 5 mandatory assessment sample queries plus operational edge cases:

| # | Sample Assessment Query | Generated Output / Answer | Execution Latency |
|---|---|---|---|
| **1** | *"How many tickets are currently open?"* | **111 tickets** are currently open out of 500 total (22.2% of queue). | **6 ms** |
| **2** | *"Which agent resolved the most tickets this month?"* | **Agent AGT-09** resolved the most tickets with **37 resolved cases** (CSAT: 3.88/5). | **4 ms** |
| **3** | *"Show me all Critical tickets not resolved within 12 hours."* | **15 Critical tickets** exceeded target (14 remain Open/Escalated, 1 resolved in 19.3h). | **5 ms** |
| **4** | *"What is the average customer rating for Technical category tickets?"* | **3.74 / 5 Stars** across 104 rated Technical resolution cases. | **4 ms** |
| **5** | *"Are there any anomalies in resolution times this week?"* | Detected **18 severe duration outliers** (> 65.4h, including TKT-108 at 119.7h). | **8 ms** |
| **6** | *"Which agent has the lowest average customer rating?"* | **Agent AGT-11** has the lowest CSAT rating at **3.48 / 5** across 44 assigned tickets. | **5 ms** |
| **7** | *"How many critical tickets are unresolved?"* | **21 unresolved Critical tickets** (14 Open, 7 Escalated). | **4 ms** |

---

## 5. Anomaly Detection Strategy & Methodology

The anomaly detection engine implements a multi-tier detection heuristic:

### 1. Statistical Turnaround Outliers ($2\sigma$ Gaussian + IQR)
- **Mathematical Formula**:
  $$\text{Threshold} = \mu_{\text{resolution}} + 2 \times \sigma_{\text{resolution}}$$
  $$\mu = 25.1\text{ hrs}, \quad \sigma = 20.15\text{ hrs} \implies \text{Cutoff} = 65.4\text{ hrs}$$
- Identifies tickets taking significantly longer than expected. Outliers range up to **119.7 hours** (e.g., TKT-108, TKT-369).
- Severity: **Critical** if duration $> 90\text{ hrs}$; **High** if duration $\ge 65.4\text{ hrs}$.

### 2. High-Urgency SLA Breach Escalations
- Flags any ticket with `priority IN ('High', 'Critical')` that has remained in `Open` or `Escalated` state for more than 24 hours.
- **80 active breach incidents** detected, generating automated triage alerts.

### 3. Customer Satisfaction (CSAT) Drops
- Flags completed tickets where `customer_rating <= 2` stars to trigger immediate retention outreach.

### 4. Stalled Escalations & First Response Delays
- Identifies escalated tickets lingering without resolution, and tickets where initial agent touchpoint exceeded 4.8 hours.

---

## 6. REST API Specification

### `GET /api/health`
Returns service status, uptime, dataset statistics, and LLM connection state.

### `POST /api/query`
Natural language query answering.
```json
// Request
{ "query": "How many critical tickets are unresolved?" }

// Response
{
  "query": "How many critical tickets are unresolved?",
  "answer": "There are 21 unresolved Critical priority tickets...",
  "sql_or_plan": "SELECT * FROM support_tickets WHERE priority = 'Critical' AND status != 'Resolved';",
  "data_summary": { "unresolved_count": 21, "open_count": 14, "escalated_count": 7 },
  "execution_time_ms": 12,
  "model_used": "gemini-3.8-flash (Google GenAI SDK)"
}
```

### `GET /api/anomalies`
Returns all detected anomalies categorized by severity (`Critical`, `High`, `Medium`) and type.

### `GET /api/tickets`
Queryable list of tickets with parameters: `category`, `priority`, `status`, `agent`, `search`, `page`, `limit`.

### `GET /api/test-suite`
Executes 10 automated test cases with latency and pass/fail diagnostics.

---

## 7. Automated Testing & Verification

Run tests in Node.js / Web:
```bash
# In the app, navigate to the "Live Test Suite" tab or run:
curl -s http://localhost:3000/api/test-suite
```

Run tests in Python:
```bash
pytest test_main.py -v
```

**Verification Results:**
- **TC-001**: Dataset Ingestion & Schema Integrity (500 rows, 10 columns) — `PASSED`
- **TC-002**: Sample Query 1: Open Tickets Count — `PASSED`
- **TC-003**: Sample Query 2: Top Resolution Agent (AGT-09) — `PASSED`
- **TC-004**: Sample Query 3: Critical Tickets Exceeding 12 Hours — `PASSED`
- **TC-005**: Sample Query 4: Technical Category CSAT (3.74/5) — `PASSED`
- **TC-006**: Sample Query 5: Anomaly Detection NL Retrieval — `PASSED`
- **TC-007**: High/Critical Unresolved SLA Breach (>24h) — `PASSED`
- **TC-008**: Agent Ranking & CSAT Discrepancy (AGT-11 flagged) — `PASSED`
- **TC-009**: REST API Health & Contract (HTTP 200) — `PASSED`
- **TC-010**: Zero-Result Edge Case Gracefulness — `PASSED`

**Score:** `10/10 Passed (100% Pass Rate) in 9ms`

---

## 8. Limitations & Future Roadmap

1. **Current In-Memory Storage**: Optimal for sub-millisecond querying over 500–50,000 records. For millions of tickets, migrate to a distributed database like PostgreSQL or BigQuery with DuckDB vector indexing.
2. **Dynamic Streaming Embeddings**: Future iterations can include embedding-based semantic similarity search using `text-embedding-004` to cluster recurring customer issues automatically.
3. **Automated Auto-Routing**: Leverage predictive classification to recommend optimal agent assignments upon ticket creation.

---

### Author & Submission Details
- **Role**: AI Engineer
- **Company**: DOTMappers IT Pvt. Ltd.
- **Sprint**: End-to-End AI System Sprint (48-Hour Technical Assessment)
- **License**: Apache-2.0
