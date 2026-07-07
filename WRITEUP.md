# AgentOS: The Ambient AI Agent for Your Career and Wellbeing
### A multi-agent concierge that quietly protects your health while you chase your next job, designed to live in the background of your actual workday, not compete for your attention.

**Track: Concierge Agents**

---

## Links

- **Live Demo (no login required, click "Try Demo"):** https://agentos-app-317546564195.us-central1.run.app
- **Source Code:** https://github.com/varsharavichandran06/AgentOS
- **Demo Video (YouTube, ≤5 min):** https://youtu.be/m66irfW4M8I

---

## The Problem

Job searching is one of the few life events that actively works against the habits you need most to survive it. You need sleep, but interview prep eats your evenings. You need to eat well, but you're triaging recruiter emails through lunch. You need focus time to sharpen your skills, but your calendar is a warzone of interview slots, follow-ups, and "quick syncs" that fragment every open hour into nothing.

Most productivity tools make this worse, not better. They're another tab, another notification, another thing demanding your attention on top of the thing that's already draining it. What a job-seeker actually needs isn't a smarter to-do list. It's a quiet second brain that watches the calendar, understands what matters, and defends your health without being asked.

That's the gap AgentOS fills.

## The Vision: Ambient, Not Another App to Check

AgentOS was designed from the start to be a **desktop-resident, ambient companion**, something that installs once, runs quietly, and surfaces only when it has something useful to do: a wellness break it just protected, a conflict it just resolved, a recruiter email it just triaged. The goal is a tool you *stop noticing*, the way you stop noticing a good HVAC system, because it's just handling things.

That intention shows up directly in the interface design. The dashboard's background is a stylized VS Code scene, not a decorative choice, but a deliberate one. It's meant to visually merge AgentOS into the environment where knowledge workers and job-seekers already spend their day: an editor, a terminal, a stack of tabs. The HUD-style glassmorphic panels float over that backdrop the way a well-designed widget should, that is, present, legible, and never in the way.

For this capstone, AgentOS is packaged and demonstrated as a web application, since that's the format judges can actually open and interact with without an installer. No desktop wrapper exists yet, but the architecture is already split the way one would need to be: a persistent Express backend that does all the agent orchestration, and a React frontend that's really just a thin control surface over it. That separation is what makes wrapping it in a native shell like Electron or Tauri later a straightforward next step rather than a rewrite, discussed further in What's Next.

## What AgentOS Actually Does

At its core, AgentOS is five cooperating agents wrapped in one dashboard:

- **Calendar Planner Agent**, syncs bidirectionally with Google Calendar, understands your real commitments, and automatically schedules wellness blocks (deep-focus work, meals, a digestive walk, a workout) into whatever gaps are actually free, respecting your wake/sleep window and your diet and exercise preferences.
- **Intelligent Rescheduler Agent**, the centerpiece. When a new "hard" event lands on top of a wellness block, this agent doesn't just delete the wellness task, it reasons about *where else it could go*, given real free time, and moves it there. Every Saturday, it also runs proactively for the entire upcoming week, and it catches up immediately on login if the week hasn't been scheduled yet.
- **Job Search Agent**, scans job boards concurrently, scores matches against your resume and stated seniority using a weighted algorithm, and tracks every application through to follow-up.
- **Email Triage Agent**, reads your Gmail inbox and classifies incoming mail (recruiter outreach, interview requests, offers, rejections, noise) so you see what matters first.
- **Wellness & Habit Layer**, turns hydration, exercise minutes, and sleep targets into an interactive habit loop, reflected live in an animated avatar whose mood responds to what you've actually done that day.

All of it lives behind a single Google sign-in, with a mandatory first-login onboarding step that captures job, diet and exercise preferences before anything gets scheduled, so the very first week of suggestions is personalized, not generic.

## The Agents Beneath the Hood, Course Concepts Demonstrated

This submission demonstrates 4 of the 6 key course concepts:

| Concept | Demonstrated In |
|---|---|
| Agent / Multi-Agent System (ADK) | Code, `adk.js`, `agents.js`, `intelligentRescheduler.js` |
| Security Features | Code, `encryption.js`, `secureDataStore.js`, `tokenStore.js` |
| Deployability | Code (`Dockerfile`, `.github/workflows/deploy.yml`) and Video, CI/CD pipeline deploying to Cloud Run shown live |
| Antigravity | Video, shown building with it directly |

### 1. Multi-Agent System (ADK)
AgentOS implements its own lightweight ADK-style runtime (`adk.js`), `FunctionTool`, `LlmAgent`, and `Workflow` primitives that mirror the Agent Development Kit's core abstractions. On top of it sit distinct agents (`RootOrchestrator`, `IntelligentReschedulerAgent`, `ReschedulingDecisionAgent`, job-search and email-triage agents) that each own a domain and communicate through a shared workflow layer rather than through tangled direct calls.

### 2. Real Reasoning, Not an If/Else Tree Wearing an Agent Costume
This is the part I'm proudest of. Early in development, the "intelligent" reschedule logic was exactly what it sounds like it might be: a distance-minimizing heuristic that found the nearest free gap to the original time and moved the task there. It worked, but it wasn't intelligent, and it produced genuinely odd results (a workout bumped *backward* in time to make room for an interview, because the nearest gap happened to be earlier in the day).

The fix was to actually hand the decision to Gemini: the server computes the *real* available gaps (that part is just arithmetic, since you can't skip knowing what's actually free), then asks a `ReschedulingDecisionAgent`, deliberately configured with zero tools, so it can't defer to a hardcoded function, to reason about the specific task, its duration, and the conflict, and decide where it should go and why. The deterministic nearest-gap logic still exists, but only as a resilience fallback for when the model is unreachable, never as the primary decision-maker. Every reschedule now comes back with a one-sentence, model-generated justification ("moved your workout to 5pm since it fits right after your interview and still leaves the evening open") instead of silently reshuffling your day.

### 3. Security Features
Job applications (cover letters, personal notes, salary expectations) and wellness records are encrypted at rest with AES-256-GCM, using a key supplied only through the environment at runtime, never hardcoded or committed to source; the app refuses to start without it.

Google OAuth tokens get their own treatment: they now persist in Firestore (Google-managed encryption at rest), reached only through server-side Application Default Credentials and never exposed to the client, so a signed-in session survives restarts and redeploys instead of living only in a single process's memory.

### 4. Deployability & CI/CD
AgentOS ships with a multi-stage Docker build (Vite frontend build → lean Express runtime image) behind a full CI/CD pipeline: every push to `main` triggers a GitHub Actions workflow that builds the image and deploys it straight to Google Cloud Run, with no manual deploy step ever required. Cloud Run's autoscaling (scale-to-zero, multiple concurrent instances) meant a fresh instance had no way to know what an earlier one did in memory, so persistent state, most importantly a signed-in Google session, needed a real backing store rather than living in one process. That's what the Firestore integration solves: OAuth sessions now live outside any single instance, so the app scales and redeploys the way a production service should, without users ever noticing a restart happened. The demo video shows this pipeline running end-to-end: a push to `main` triggering GitHub Actions, and the new revision going live on Cloud Run.

### 5. Antigravity
Parts of AgentOS, including the job-search agent's tooling, were built directly inside Google's Antigravity IDE rather than a conventional editor, shown briefly in the demo video.

## How It Actually Changes a Day

Before AgentOS, a job search means: block out "gym time" that interview requests quietly cannibalize, forget lunch because you were deep in a coding challenge, and end the day not knowing whether that 2pm email was a recruiter or a newsletter. With it running: the calendar already has your focus block, your walk, and your dinner in it before you've thought about the day, and if a real interview lands on top of one of them, the app moves it somewhere sensible and tells you why, instead of just vanishing the habit you were trying to build.

## The Build Journey

AgentOS was built iteratively, feature by feature, with a strong bias toward *actually running it* rather than assuming code was correct. That habit caught a few small things a code review alone would have missed, a demo-login reset that quietly re-seeded stale mock data instead of truly resetting state, a race between "auto-schedule the week" firing before onboarding preferences were saved, and an outdated Gemini model ID that needed swapping for the current one. Small, ordinary bugs, and fixing them as they surfaced is part of what "technical implementation quality" means in practice.

The single biggest architectural change during the build was moving Google OAuth session storage into Firestore. The app originally kept each user's Google session in memory, which is simple and fast, but meant a session only ever existed on one running instance. The moment Cloud Run scaled to a second instance, redeployed, or spun down and back up, that session was gone and the user was silently signed out of Calendar and Gmail sync. Moving that state into Firestore fixed this at the root: sessions are now looked up from a shared, persistent store instead of a single process's memory, so calendar sync, rescheduling, and email triage all keep working through restarts, redeploys, and horizontal scaling the way a real production service needs to. It's the clearest example in this project of a decision driven by actually deploying the thing, not just running it locally, since a single long-lived process hides this entire class of problem.

## What's Next

- **Autonomous application agent.** Right now the Job Search Agent finds and scores matches, but applying is still a manual step. The natural next step is closing that loop end-to-end: the agent finds the hiring manager's or recruiter's email for a matched role, drafts a tailored application/outreach email, and sends it automatically, so applying becomes something AgentOS does for you, not something it just prepares.
- **Finish the database migration.** OAuth tokens now live in Firestore, but job/profile data is still file-based JSON, moving the rest over is the natural next step, especially deploying on GCP already.
- **A true desktop build.** Wrapping the existing Express + React stack in Electron or Tauri would deliver on the original ambient-background vision directly, with a system-tray presence instead of a browser tab.
- **MCP server integration**, so AgentOS's calendar, job-search, and email tools can be called by *other* agents and IDEs, not just its own dashboard.
- **Multi-user support**, since the architecture already separates a user's data by email, the missing piece is real per-user persistence rather than a single shared demo store.

## Closing

AgentOS isn't trying to be a flashier to-do list. It's an attempt at the thing agentic AI is actually good for: a system that notices what a stressed, distracted person forgets to protect, and quietly protects it anyway.
