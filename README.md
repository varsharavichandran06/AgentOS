# AgentOS: Glassmorphic Career & Wellness Workspace

AgentOS is a high-performance, single-workspace cockpit designed to supercharge daily productivity, streamline career development, and maintain high-efficiency wellness habits. Featuring a high-tech HUD-style glassmorphic user interface, it unifies career hunting, schedule optimization, and healthy lifestyle monitoring into one cohesive screen.

---

## 🚀 How AgentOS Optimizes Your Day

Finding a new job is a demanding process that easily leads to burnout. AgentOS acts as your personal digital chief of staff, balancing professional goals with daily wellness:
*   **Preventing Burnout**: Instead of letting you grind endlessly, the scheduler automatically parses your daily commitments and reserves mandatory spaces for recovery (digestion walks, hydration windows, and active exercise breaks).
*   **Context-Aware Deep Work**: It schedules dedicated, uninterrupted cognitive focus blocks around your active interviews to keep your system design and coding skills sharp.
*   **Habit Automation**: Tracks critical wellness signals (water intake, active workout minutes, target sleep windows) on the dashboard header, turning healthy routines into an interactive habit game.

---

## 🛠️ Core Workspace Features

### 📅 Smart Calendar & Wellness Orchestration
*   **Bi-directional Google Calendar Sync**: Connects securely to Google APIs to view, update, and manage your live schedule in real-time.
*   **Wellness Scheduler Engine**: Automatically analyzes your daily schedule to identify open slots and schedules wellness tasks (Post-Lunch Digestive Walks, Diet Windows, Deep Work blocks) respecting your target wake and sleep settings.
*   **Dynamic Day-of-Event Focus**: Clicking any event shifts the workspace calendar to a 3-day view, allowing you to examine the day before, the day of, and the day after for comprehensive preparation.
*   **One-Click Meetings**: Automatically creates Google Meet details when scheduling syncs or follow-ups.

### 💼 Intelligent Job Search & Application Tracker
*   **Multi-Engine Scraper & Ranker**: Searches multiple job boards concurrently based on your target titles, skills, and geographic preferences.
*   **Custom Match Scoring**: Ranks search results using a seniority-aware algorithm that grades jobs from 40% to 99% based on matching keywords, resume details, and years of experience.
*   **Zero-friction Auto-Apply**: Prompts application workflows, logs submissions to a history database, and sends the applicant a styled confirmation email automatically via SMTP.
*   **Intelligent Email Inbox**: Syncs your Gmail inbox to triage incoming mail, marking high-value recruiter updates, interview requests, and offers with high-priority tags.

### 📊 Habits & Lifestyle Widgets
*   **Hydration Tracker**: Log your water intake with one-click cup updates to stay hydrated throughout the day.
*   **Active Minutes Logger**: Record physical workout durations to meet daily health targets.
*   **Rest Indicators**: Set wake and sleep targets to help the schedule generator structure your day healthily.

### 💰 Financial Runway Controller
*   **Target Savings Slider**: Allocate income dynamically using interactive percentage sliders to divide budgets into savings, core bills, and discretionary spending.
*   **Expense Register**: Log daily outgoings to keep your operational runway updated and visualised in real-time.

---

## 🎨 Premium HUD Visual Experience
AgentOS is designed to look like a premium control deck:
*   **Cybernetic Aesthetics**: Utilizes Harmony-curated dark HSL color palettes, subtle glowing neon indicators, and glassmorphic panels.
*   **Micro-Animations**: Custom laser scans on uploader screens, pulse rates for active indicators, and smooth state changes that keep the interface feeling responsive and alive.

---

## 🔐 Security & Privacy (Course Concept: Security Features)

AgentOS protects your sensitive personal data at rest using **AES-256-GCM encryption**:

*   **Encrypted Job Applications**: Cover letters, personal notes, salary expectations, and contact info are encrypted before storage.
*   **Protected Wellness Data**: Health metrics, heart rate, blood pressure, and fitness logs are encrypted.
*   **Secure Credential Handling**: Google OAuth tokens persist in Firestore (Google-managed encryption at rest), reached only through server-side Application Default Credentials, never exposed to the client. API keys are kept in `.env` locally and GitHub Secrets in production, never in source.
*   **Zero-Knowledge Architecture**: All encryption happens client-side and on the server; encrypted data is never transmitted in plaintext.

**Setup**:
```bash
# ENCRYPTION_KEY is required, not optional — the app refuses to start without it.
# Generate one with: openssl rand -hex 32
ENCRYPTION_KEY=<your-256-bit-hex-key>
```

---

## 🤖 Multi-Agent Architecture (Course Concept: ADK Multi-Agent System)

AgentOS implements a **coordinated multi-agent system** with its own lightweight runtime (`adk.js`) that mirrors the official Google Agent Development Kit's core abstractions (`FunctionTool`, `LlmAgent`, `Workflow`):

### Agent Layer
1. **Job Search Agent** (`job_search`): Autonomously scans job boards, filters by seniority and skills, and surfaces matches.
2. **Application Tracker Agent** (`app_tracker`): Monitors interview pipelines, follow-up timelines, and response rates.
3. **Email Triage Agent** (`email_triage`): Filters Gmail inbox, identifies recruiter outreach, and prioritizes opportunities.
4. **Calendar Planner Agent** (`calendar_planner`): Orchestrates wellness breaks, deep work blocks, and interview prep time around your schedule.
5. **Wellness Coach Agent** (`wellness_coach`): Recommends hydration, exercise, and sleep targets based on your calendar.

### Agent Skills (Course Concept: Agent Skills/Tools)
*   `ResumeMatchingSkill`: Seniority-aware job-to-resume scoring engine (40-99% match).
*   `CalendarOptimizationSkill`: Identifies calendar gaps and proposes wellness/focus blocks.
*   `EmailAnalysisSkill`: Classifies Gmail messages (recruiter, offer, reject, spam).
*   `JobRankingSkill`: Ranks opportunities by alignment with career goals.

### Workflow Orchestration
Agents communicate via a shared `Workflow` layer:
```
User Action → Trigger → Agent(s) Process → Tools Execute → Result → UI Update
```

---

## 🚀 Deployment (Course Concept: Deployability)

AgentOS is **production-ready** with full CI/CD:

*   **Docker**: Multi-stage build optimizes frontend assets + backend runtime.
*   **Cloud Run**: Deployed to Google Cloud Run in `us-central1` region.
*   **CI/CD Pipeline**: GitHub Actions automatically builds and deploys on push to `main`.
*   **Environment Management**: Secrets stored in GitHub Actions with no hardcoded credentials.

**Deploy**:
```bash
# Automated via GitHub Actions on push to main
# Or manual deployment:
gcloud run deploy agentos-app --source . --region us-central1
```

---

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- Google OAuth credentials (Google Cloud Console)
- Optional: Gemini API key for advanced function calling

### Installation

1. **Clone and install**:
```bash
git clone <repo>
cd AgentOS
npm install
```

2. **Set up environment**:
```bash
cp .env.example .env
```

Fill in `.env` with:
```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/callback
GEMINI_API_KEY=<optional-gemini-key>
ENCRYPTION_KEY=<auto-generated or your 256-bit hex key>
PORT=5000
```

3. **Run locally**:
```bash
npm run dev          # Frontend (Vite, http://localhost:5173)
npm run server       # Backend (Express, http://localhost:5000)
```

4. **Build for production**:
```bash
npm run build        # Outputs to /dist
npm run preview      # Test production build locally
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTOS Frontend (React)                  │
│  Dashboard | Calendar | Job Tracker | Email Triage | Habits │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   Express Backend Server    │
        │  /api/jobs, /api/calendar   │
        │  /api/wellness, /api/email  │
        └──────────┬──────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌────────────┐
│ ADK     │  │Encryption│  │Google APIs │
│ Agents  │  │ Layer    │  │(Calendar,  │
│ System  │  │(AES-256) │  │Gmail)      │
└─────────┘  └──────────┘  └────────────┘
```

---

## 📊 Course Concepts Demonstrated

| Concept | Implementation | File(s) |
|---------|----------------|---------|
| **Agent / Multi-Agent System (ADK)** | 5 autonomous agents with coordinated workflow | `adk.js`, `agents.js` |
| **Agent Skills** | 4 specialized tools (Resume Matching, Calendar Opt., Email Analysis, Job Ranking) | `agents.js` |
| **Security Features** | AES-256-GCM encryption at rest for personal data | `encryption.js`, `secureDataStore.js` |
| **Deployability** | Docker + Cloud Run + GitHub Actions CI/CD | `Dockerfile`, `.github/workflows/deploy.yml` |

---

## 🛡️ Privacy & Security Notes

*   **Personal Data**: Job applications, wellness metrics, and financial data are encrypted before storage.
*   **OAuth Tokens**: Persisted in Firestore (Google-managed encryption at rest), never exposed to the client; refreshed automatically per session.
*   **API Keys**: Stored in `.env` locally and GitHub Secrets in production.
*   **Google APIs**: Data flows directly between your browser and Google (no middleman).
*   **User Consent**: Calendar and Gmail access requires explicit OAuth consent.

---

## 📝 License & Contributions

Built as a capstone project for Google's AI Agents: Intensive Vibe Coding Course (2026).

Questions? Open an issue or reach out!
