# AgentOS: The Ambient AI Chief of Staff for Your Career and Wellbeing
### A multi-agent concierge that quietly protects your health while you chase your next job — designed to live in the background of your actual workday, not compete for your attention.

**Track: Concierge Agents**

---

## The Problem

Job searching is one of the few life events that actively works against the habits you need most to survive it. You need sleep, but interview prep eats your evenings. You need to eat well, but you're triaging recruiter emails through lunch. You need focus time to sharpen your skills, but your calendar is a warzone of interview slots, follow-ups, and "quick syncs" that fragment every open hour into nothing.

Most productivity tools make this worse, not better. They're another tab, another notification, another thing demanding your attention on top of the thing that's already draining it. What a job-seeker actually needs isn't a smarter to-do list — it's a quiet second brain that watches the calendar, understands what matters, and defends your health without being asked.

That's the gap AgentOS fills.

## The Vision: Ambient, Not Another App to Check

AgentOS was designed from the start to be a **desktop-resident, ambient companion** — something that installs once, runs quietly, and surfaces only when it has something useful to do: a wellness break it just protected, a conflict it just resolved, a recruiter email it just triaged. The goal is a tool you *stop noticing*, the way you stop noticing a good HVAC system, because it's just handling things.

That intention shows up directly in the interface design. The dashboard's background is a stylized VS Code scene — not a decorative choice, but a deliberate one. It's meant to visually merge AgentOS into the environment where knowledge workers and job-seekers already spend their day: an editor, a terminal, a stack of tabs. The HUD-style glassmorphic panels float over that backdrop the way a well-designed widget should — present, legible, and never in the way.

For this capstone, AgentOS is packaged and demonstrated as a web application, since that's the format judges can actually open and interact with without an installer. But the architecture — a persistent Express backend orchestrating agents, a React frontend that's really just a control surface — was built with a native desktop wrapper (Electron/Tauri) as the obvious next step, discussed further in Future Work.

## What AgentOS Actually Does

At its core, AgentOS is five cooperating agents wrapped in one dashboard:

- **Calendar Planner Agent** — syncs bidirectionally with Google Calendar, understands your real commitments, and automatically schedules wellness blocks (deep-focus work, meals, a digestive walk, a workout) into whatever gaps are actually free, respecting your wake/sleep window and your diet and exercise preferences.
- **Intelligent Rescheduler Agent** — the centerpiece. When a new "hard" event lands on top of a wellness block, this agent doesn't just delete the wellness task — it reasons about *where else it could go*, given real free time, and moves it there. Every Saturday, it also runs proactively for the entire upcoming week, and it catches up immediately on login if the week hasn't been scheduled yet.
- **Job Search Agent** — scans job boards concurrently, scores matches against your resume and stated seniority using a weighted algorithm, and tracks every application through to follow-up.
- **Email Triage Agent** — reads your Gmail inbox and classifies incoming mail (recruiter outreach, interview requests, offers, rejections, noise) so you see what matters first.
- **Wellness & Habit Layer** — turns hydration, exercise minutes, and sleep targets into an interactive habit loop, reflected live in an animated avatar whose mood responds to what you've actually done that day.

All of it lives behind a single Google sign-in, with a mandatory first-login onboarding step that captures diet and exercise preferences before anything gets scheduled — so the very first week of suggestions is personalized, not generic.

## The Agents Beneath the Hood — Course Concepts Demonstrated

### 1. Multi-Agent System (ADK)
AgentOS implements its own lightweight ADK-style runtime (`adk.js`) — `FunctionTool`, `LlmAgent`, and `Workflow` primitives that mirror the Agent Development Kit's core abstractions. On top of it sit distinct agents (`RootOrchestrator`, `IntelligentReschedulerAgent`, `ReschedulingDecisionAgent`, job-search and email-triage agents) that each own a domain and communicate through a shared workflow layer rather than through tangled direct calls.

### 2. Real Reasoning, Not an If/Else Tree Wearing an Agent Costume
This is the part I'm proudest of. Early in development, the "intelligent" reschedule logic was exactly what it sounds like it might be: a distance-minimizing heuristic — find the nearest free gap to the original time and move the task there. It worked, but it wasn't intelligent, and it produced genuinely odd results (a workout bumped *backward* in time to make room for an interview, because the nearest gap happened to be earlier in the day).

The fix was to actually hand the decision to Gemini: the server computes the *real* available gaps (that part is just arithmetic — you can't skip knowing what's actually free), then asks a `ReschedulingDecisionAgent` — deliberately configured with zero tools, so it can't defer to a hardcoded function — to reason about the specific task, its duration, and the conflict, and decide where it should go and why. The deterministic nearest-gap logic still exists, but only as a resilience fallback for when the model is unreachable, never as the primary decision-maker. Every reschedule now comes back with a one-sentence, model-generated justification ("moved your workout to 5pm since it fits right after your interview and still leaves the evening open") instead of silently reshuffling your day.

### 3. Security Features
Job applications (cover letters, personal notes, salary expectations) and wellness records are encrypted at rest with AES-256-GCM before they ever touch disk. Google OAuth tokens are never persisted to disk at all. Getting the key-management story right was a real lesson mid-build: an earlier version of the encryption module fell back to a hardcoded default key if the environment variable wasn't set — harmless-looking, but exactly the kind of embedded secret that should never exist in committed source. It's since been removed entirely; the app now refuses to start without a real key supplied through the environment.

### 4. Deployability
AgentOS ships with a multi-stage Docker build (Vite frontend build → lean Express runtime image) and a GitHub Actions workflow that deploys straight to Google Cloud Run on every push to `main`. Getting this genuinely production-ready surfaced a subtlety worth mentioning honestly: Cloud Run's default autoscaling (scale-to-zero, up to 20 concurrent instances) is fundamentally at odds with any app that keeps state in memory or writes to local disk — a fresh instance has no idea what an old one did. The fix, pinning the service to a single warm instance, is a stopgap; the real fix is the database migration described below.

## How It Actually Changes a Day

Before AgentOS, a job search means: block out "gym time" that interview requests quietly cannibalize, forget lunch because you were deep in a coding challenge, and end the day not knowing whether that 2pm email was a recruiter or a newsletter. With it running: the calendar already has your focus block, your walk, and your dinner in it before you've thought about the day — and if a real interview lands on top of one of them, the app moves it somewhere sensible and tells you why, instead of just vanishing the habit you were trying to build.

## The Build Journey

AgentOS was built iteratively, feature by feature, with a strong bias toward *actually running it* rather than assuming code was correct. That habit caught real problems a code review alone would have missed: a demo-login reset that quietly re-seeded stale mock data instead of truly resetting state; a race between "auto-schedule the week" firing before onboarding preferences were saved, which meant the very first week's meals ignored a freshly chosen diet; a Gemini model ID (`gemini-2.0-flash`) that Google deprecated mid-project, silently degrading every "intelligent" reschedule to its math fallback until the actual API error was traced down and the model swapped; and the Cloud Run timezone bug above, which only ever showed up in the deployed environment because local testing never touches the real Google Calendar API's stricter validation.

None of these were exotic bugs. They were the ordinary cost of building something real, and fixing them — rather than shipping around them — is most of what "technical implementation quality" means in practice.

## What's Next

- **A real database.** File-based JSON storage and in-memory token maps were fine for a fast-moving prototype, but they're the root cause of every "state disappeared" bug in this writeup. Firestore is the natural next step, especially deploying on GCP already.
- **A true desktop build.** Wrapping the existing Express + React stack in Electron or Tauri would deliver on the original ambient-background vision directly, with a system-tray presence instead of a browser tab.
- **MCP server integration**, so AgentOS's calendar, job-search, and email tools can be called by *other* agents and IDEs, not just its own dashboard.
- **Multi-user support**, since the architecture already separates a user's data by email — the missing piece is real per-user persistence rather than a single shared demo store.

## Closing

AgentOS isn't trying to be a flashier to-do list. It's an attempt at the thing agentic AI is actually good for: a system that notices what a stressed, distracted person forgets to protect, and quietly protects it anyway.
