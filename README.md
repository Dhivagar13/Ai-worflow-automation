# 🤖 Agentic AI Workflow Automation Engine

A production-ready multi-agent system built with **LangGraph** that demonstrates intelligent task planning, tool selection, execution, and automated review — all orchestrated through a dynamic workflow pipeline.

![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent-blue)
![Backend](https://img.shields.io/badge/Backend-Python%20%7C%20FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-purple)
![AI](https://img.shields.io/badge/AI-LangGraph%20%7C%20OpenAI-orange)

---

## 🏗️ Architecture Overview

```
User Input (Natural Language Task)
         │
         ▼
┌─────────────────┐
│  Planner Agent   │ ──→ Decomposes task into structured plan (3-7 steps)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tool Selector    │ ──→ Maps each step to simulated tools
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Executor Agent   │ ──→ Runs tools and synthesizes results
└────────┬────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────────┐
│ Monitor Agent    │──rejected──→│  Re-execute       │
│ (Reviewer)       │        │ (up to 2 retries) │
└────────┬────────┘        └──────────────────┘
         │
      approved
         │
         ▼
   ✅ Final Output
```

### Agents

| Agent | Role | Color |
|-------|------|-------|
| **Planner** | Decomposes natural language into structured steps with dependencies | 🟣 Indigo |
| **Tool Selector** | Maps each step to appropriate simulated tools | 🟢 Emerald |
| **Executor** | Runs simulated tools and synthesizes results | 🟡 Amber |
| **Monitor** | Reviews quality, approves or rejects with feedback | 🩷 Pink |

### Simulated Tools (10 Tools)

- `send_email` — Email simulation
- `fetch_api_data` — API data retrieval
- `process_data` — Data aggregation/transformation
- `generate_report` — Report generation
- `schedule_task` — Task scheduling
- `store_data` — Data persistence
- `send_notification` — Push/SMS notifications
- `validate_data` — Data validation
- `search_records` — Record search
- `transform_format` — Format conversion

---

## 📁 Project Structure

```
Ai-Automation/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── planner.py          # Planner Agent
│   │   ├── tool_selector.py    # Tool Selector Agent
│   │   ├── executor.py         # Executor Agent
│   │   └── monitor.py          # Monitor/Reviewer Agent
│   ├── graph/
│   │   ├── __init__.py
│   │   └── workflow.py         # LangGraph workflow with conditional edges
│   ├── tools/
│   │   ├── __init__.py
│   │   └── simulated_tools.py  # 10 simulated tool implementations
│   ├── __init__.py
│   ├── state.py                # Shared state TypedDict
│   ├── server.py               # FastAPI server
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputSection.jsx      # Task input + example chips
│   │   │   ├── PlanDisplay.jsx       # Structured plan view
│   │   │   ├── ToolSelections.jsx    # Tool mapping view
│   │   │   ├── ExecutionTrace.jsx    # Execution results
│   │   │   ├── AgentLogs.jsx         # Real-time agent reasoning logs
│   │   │   ├── MonitorReview.jsx     # Quality review results
│   │   │   ├── FinalOutput.jsx       # Approved final output
│   │   │   └── PipelineIndicator.jsx # Visual pipeline stage
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Setup & Run Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **OpenAI API Key** (uses `gpt-4o-mini`)

### 1. Clone & Setup Backend

```bash
# Navigate to project
cd Ai-Automation

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Create .env file with your API key
copy backend\.env.example backend\.env
# Edit backend/.env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-actual-key-here
```

### 2. Start Backend Server

```bash
# From the project root (Ai-Automation/)
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

The API server will start at `http://localhost:8000`.

### 3. Setup & Start Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

### 4. Run a Workflow

1. Open `http://localhost:5173` in your browser
2. Enter a task (or click an example chip)
3. Click "Run Workflow" and watch the agents work!

---

## 🧪 Example Workflow: "Send a weekly report email"

### Input:
> "Send a weekly report email to the team with this week's sales data"

### What happens:

1. **Planner Agent** breaks it into steps:
   - Fetch sales data from API
   - Process and aggregate the data
   - Generate a formatted report
   - Compose email with report
   - Send email to team
   - Schedule for weekly recurrence

2. **Tool Selector** maps tools:
   - Step 1 → `fetch_api_data`
   - Step 2 → `process_data`
   - Step 3 → `generate_report`
   - Step 4 → `send_email`
   - Step 5 → `schedule_task`

3. **Executor** runs each tool and synthesizes results

4. **Monitor** reviews quality:
   - Checks each step completed successfully
   - Assigns quality score
   - Approves or sends back for retry

---

## 🔧 API Reference

### `POST /api/run`

Execute the full agentic workflow.

**Request:**
```json
{
  "task": "Send a weekly report email to the team with sales data"
}
```

**Response:**
```json
{
  "success": true,
  "user_input": "...",
  "plan": { "task_summary": "...", "steps": [...] },
  "tool_selections": { "tool_selections": [...] },
  "execution_results": { "execution_summary": [...] },
  "monitor_decision": "approved",
  "monitor_feedback": null,
  "final_output": "...",
  "retry_count": 0,
  "agent_logs": [...],
  "execution_time_seconds": 15.42
}
```

### `GET /api/health`

Health check endpoint.

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |

Create a `backend/.env` file:
```
OPENAI_API_KEY=sk-your-key-here
```

---

## 📋 Key Design Decisions

1. **LangGraph for orchestration** — Not RAG. This is about agentic behavior, not retrieval.
2. **Simulated tools** — All 10 tools produce realistic responses without external dependencies.
3. **Shared state** — Single `AgentState` TypedDict flows through all nodes.
4. **Conditional edges** — Monitor's decision drives the retry loop via LangGraph conditional routing.
5. **Max 2 retries** — Prevents infinite loops; Monitor auto-approves after 2 cycles.
6. **Full logging** — Every LLM call, decision, and tool result is captured in `agent_logs`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent Framework | LangGraph + LangChain |
| LLM | OpenAI GPT-4o-mini |
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| Styling | Plain CSS (no frameworks) |
| State | LangGraph TypedDict |

---

## License

MIT
