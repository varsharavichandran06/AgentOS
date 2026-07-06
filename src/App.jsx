import React, { useState, useEffect } from "react";
import log from "./logger.js";

import { 
  Plus, 
  X, 
  Settings, 
  Cpu, 
  Activity, 
  RefreshCw, 
  Sliders, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  LogOut,
  Power,
  Globe,
  Briefcase,
  User,
  FileText,
  Mail,
  Star,
  Search,
  Inbox,
  Download,
  Archive,
  Phone,
  Link2,
  ExternalLink,
  Check,
  Send,
  Loader,
  UploadCloud,
  File,
  Terminal,
  AlertCircle,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Video,
  Trash2,
  Trash,
  ChevronLeft,
  ChevronRight
} from "lucide-react";


// Inline Github and Linkedin SVGs to bypass lucide-react brand icon deprecations
const Github = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const COMMON_ROLES = [
  "Frontend Engineer",
  "React Developer",
  "Fullstack Engineer",
  "Backend Engineer",
  "Software Engineer",
  "Python Developer"
];

const COMMON_LOCATIONS = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA"
];

const defaultSuggestions = [
  { id: "def-water", name: "Hydration Check", type: "walking", startTime: "10:00", endTime: "10:15", details: "Drink 2 cups of water and do a quick standing stretch.", startISO: new Date().toISOString(), endISO: new Date().toISOString() },
  { id: "def-stretch", name: "Active Stretching", type: "exercise", startTime: "11:30", endTime: "11:45", details: "Stretching and mobility for neck, shoulders, and hips.", startISO: new Date().toISOString(), endISO: new Date().toISOString() },
  { id: "def-walk", name: "Digestive Walk Break", type: "walking", startTime: "13:30", endTime: "14:00", details: "A light 15-20 min walk after lunch to boost metabolism.", startISO: new Date().toISOString(), endISO: new Date().toISOString() },
  { id: "def-dinner", name: "Healthy Dinner Prep", type: "cooking", startTime: "19:00", endTime: "19:45", details: "Prepare a high-protein, nutrient-dense home-cooked dinner.", startISO: new Date().toISOString(), endISO: new Date().toISOString() }
];


// Agent module catalog metadata
const AGENT_CATALOG = [
  { 
    id: "job_search", 
    name: "Job Search", 
    emoji: "💼", 
    colorName: "indigo",
    glowClass: "hover:border-indigo-500/35 hover:shadow-indigo-500/10",
    textClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10",
    borderClass: "border-indigo-500/20",
    glowColor: "rgba(99, 102, 241, 0.15)",
    description: "Autonomously scans tech boards and compiles relevant positions."
  },
  { 
    id: "app_tracker", 
    name: "Application Tracker", 
    emoji: "📊", 
    colorName: "blue",
    glowClass: "hover:border-blue-500/35 hover:shadow-blue-500/10",
    textClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    glowColor: "rgba(59, 130, 246, 0.15)",
    description: "Monitors interview pipelines, timelines, and response rates."
  },
  { 
    id: "email_triage", 
    name: "Email Triage", 
    emoji: "📥", 
    colorName: "teal",
    glowClass: "hover:border-teal-500/35 hover:shadow-teal-500/10",
    textClass: "text-teal-400",
    bgClass: "bg-teal-500/10",
    borderClass: "border-teal-500/20",
    glowColor: "rgba(20, 184, 166, 0.15)",
    description: "Filters inbound noise and drafts intelligent responses."
  },
  { 
    id: "calendar_planner", 
    name: "Calendar Planner", 
    emoji: "📅", 
    colorName: "amber",
    glowClass: "hover:border-amber-500/35 hover:shadow-amber-500/10",
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.15)",
    description: "Schedules focus blocks, buffers, and syncs external meets."
  },
  { 
    id: "resume_coach", 
    name: "Resume Coach", 
    emoji: "📝", 
    colorName: "rose",
    glowClass: "hover:border-rose-500/35 hover:shadow-rose-500/10",
    textClass: "text-rose-400",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
    glowColor: "rgba(244, 63, 94, 0.15)",
    description: "Analyzes skills match and adapts bullet points in real-time."
  },
  { 
    id: "market_pulse", 
    name: "Market Pulse", 
    emoji: "📈", 
    colorName: "cyan",
    glowClass: "hover:border-cyan-500/35 hover:shadow-cyan-500/10",
    textClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
    glowColor: "rgba(6, 182, 212, 0.15)",
    description: "Tracks trends, tech stacks demand, and salary benchmarks."
  },
  { 
    id: "daily_focus", 
    name: "Daily Focus", 
    emoji: "🎯", 
    colorName: "emerald",
    glowClass: "hover:border-emerald-500/35 hover:shadow-emerald-500/10",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.15)",
    description: "Aligns tasks, micro-habits, and silences notifications."
  },
  { 
    id: "interview_prep", 
    name: "Interview Prep", 
    emoji: "🤝", 
    colorName: "violet",
    glowClass: "hover:border-violet-500/35 hover:shadow-violet-500/10",
    textClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/20",
    glowColor: "rgba(139, 92, 246, 0.15)",
    description: "Assembles cheat sheets, company briefs, and mock Q&As."
  },
  { 
    id: "news_feed", 
    name: "News Feed", 
    emoji: "📰", 
    colorName: "sky",
    glowClass: "hover:border-sky-500/35 hover:shadow-sky-500/10",
    textClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/20",
    glowColor: "rgba(14, 165, 233, 0.15)",
    description: "Aggregates tech breakthroughs and global news vectors."
  },
  { 
    id: "win_log", 
    name: "Win Log", 
    emoji: "🏆", 
    colorName: "yellow",
    glowClass: "hover:border-yellow-400/35 hover:shadow-yellow-400/10",
    textClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/20",
    glowColor: "rgba(234, 179, 8, 0.15)",
    description: "Chronicles achievements, updates, and feedback reviews."
  },
  { 
    id: "financial_runway", 
    name: "Financial Runway", 
    emoji: "💰", 
    colorName: "green",
    glowClass: "hover:border-green-500/35 hover:shadow-green-500/10",
    textClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
    glowColor: "rgba(34, 197, 94, 0.15)",
    description: "Tracks monthly budget runway, category spend, and savings projections."
  }
];

const AvatarFigure = ({ state, healthScore = 50, mascotReaction = null, isNavbar = false }) => {
  // Skin, hair, outfit colors per state
  const skinTone = "#FFCBA4";
  const skinShadow = "#F4A46A";
  const hairColor = "#3D2314";
  const hairHighlight = "#6B3A1F";

  const outfitMap = {
    sleep:    { shirt: "#4a90d9", pants: "#2563ab", shoes: "#e2e8f0", accent: "#93c5fd" },
    focus:    { shirt: "#6366f1", pants: "#3730a3", shoes: "#e2e8f0", accent: "#a5b4fc" },
    exercise: { shirt: "#ef4444", pants: "#991b1b", shoes: "#fde68a", accent: "#fca5a5" },
    stressed: { shirt: "#f43f5e", pants: "#9f1239", shoes: "#e2e8f0", accent: "#fda4af" },
    happy:    { shirt: "#f59e0b", pants: "#b45309", shoes: "#e2e8f0", accent: "#fde68a" },
    leisure:  { shirt: "#10b981", pants: "#065f46", shoes: "#e2e8f0", accent: "#6ee7b7" },
  };
  const outfit = outfitMap[state] || outfitMap.leisure;

  // Animation class dynamically determined by state & healthScore & reaction
  let bodyClass = "";
  if (mascotReaction) {
    if (mascotReaction === "water" || mascotReaction === "success") {
      bodyClass = "animate-bounce";
    } else if (mascotReaction === "exercise") {
      bodyClass = "animate-bounce";
    }
  } else if (state === "sleep") {
    bodyClass = "animate-pulse";
  } else if (state === "exercise" || state === "happy") {
    bodyClass = "animate-bounce";
  } else if (state === "stressed") {
    bodyClass = "animate-pulse";
  } else {
    if (healthScore === 0) {
      bodyClass = "animate-pulse";
    } else if (healthScore > 75 && healthScore <= 90) {
      bodyClass = "animate-bounce-light";
    } else if (healthScore > 90) {
      bodyClass = "animate-bounce";
    }
  }

  // --- Faces ---
  const faceMap = {
    sleep: (
      <>
        {/* Drooping closed eyes */}
        <path d="M 37.5 37.5 Q 41 41 44.5 37.5" stroke="#5b3a1a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M 55.5 37.5 Q 59 41 62.5 37.5" stroke="#5b3a1a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Long lashes */}
        <line x1="38" y1="37.5" x2="37" y2="35.5" stroke="#5b3a1a" strokeWidth="1.2"/>
        <line x1="62" y1="37.5" x2="63" y2="35.5" stroke="#5b3a1a" strokeWidth="1.2"/>
        {/* Tiny gentle smile */}
        <path d="M 46 45 Q 50 47.5 54 45" stroke="#c07850" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </>
    ),
    focus: (
      <>
        {/* Intense eyes with irises */}
        <ellipse cx="41" cy="38" rx="4" ry="4.2" fill="white" stroke="#333" strokeWidth="1"/>
        <ellipse cx="59" cy="38" rx="4" ry="4.2" fill="white" stroke="#333" strokeWidth="1"/>
        <circle cx="41" cy="38.5" r="2.3" fill="#4338ca"/>
        <circle cx="59" cy="38.5" r="2.3" fill="#4338ca"/>
        <circle cx="42.2" cy="37.2" r="0.9" fill="white"/>
        <circle cx="60.2" cy="37.2" r="0.9" fill="white"/>
        {/* Brows furrowed toward center */}
        <path d="M 35.5 31.5 C 39 30 43 31 44 32" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M 64.5 31.5 C 61 30 57 31 56 32" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Thin determined mouth */}
        <path d="M 45.5 46 L 54.5 46" stroke="#c07850" strokeWidth="1.8" strokeLinecap="round"/>
      </>
    ),
    exercise: (
      <>
        {/* Squinting effort eyes */}
        <path d="M 37 36 L 45 39.5 L 37 43" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M 63 36 L 55 39.5 L 63 43" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Puffed-cheek open mouth */}
        <ellipse cx="50" cy="46.5" rx="3.5" ry="2.5" fill="white" stroke="#c07850" strokeWidth="1.2"/>
        <ellipse cx="50" cy="47.5" rx="2" ry="1.3" fill="#f87171"/>
        {/* Sweat on brow */}
        <ellipse cx="46" cy="41" rx="2.8" ry="1.5" fill={skinShadow} opacity="0.5"/>
      </>
    ),
    stressed: (
      <>
        {/* Wide worried eyes */}
        <ellipse cx="41" cy="38" rx="4.5" ry="4.8" fill="white" stroke="#be123c" strokeWidth="1.2"/>
        <ellipse cx="59" cy="38" rx="4.5" ry="4.8" fill="white" stroke="#be123c" strokeWidth="1.2"/>
        <circle cx="41" cy="38.5" r="2.2" fill="#374151"/>
        <circle cx="59" cy="38.5" r="2.2" fill="#374151"/>
        <circle cx="42" cy="37.2" r="0.8" fill="white"/>
        <circle cx="60" cy="37.2" r="0.8" fill="white"/>
        {/* Worried arched brows */}
        <path d="M 35 31 C 38.5 27.5 43 30.5 44 32" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M 65 31 C 61.5 27.5 57 30.5 56 32" stroke="#5b3a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Wavy nervous mouth */}
        <path d="M 44.5 47 Q 47.5 44.5 50 47 T 55.5 47" stroke="#c07850" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </>
    ),
    happy: (
      <>
        {/* Crescent moon happy eyes */}
        <path d="M 36 37 Q 41 31.5 46 37" stroke="#5b3a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M 54 37 Q 59 31.5 64 37" stroke="#5b3a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Big open laughing mouth */}
        <path d="M 43.5 44 Q 50 53 56.5 44 Z" fill="#b91c1c" stroke="#5b3a1a" strokeWidth="1.5"/>
        <ellipse cx="50" cy="49" rx="3.5" ry="2" fill="#fca5a5"/>
        {/* Rosy cheeks */}
        <ellipse cx="37.5" cy="43" rx="3.5" ry="2" fill="#f43f5e" opacity="0.3"/>
        <ellipse cx="62.5" cy="43" rx="3.5" ry="2" fill="#f43f5e" opacity="0.3"/>
      </>
    ),
    exhaust: (
      <>
        {/* Dizzy curved eyes */}
        <path d="M 36.5 41.5 Q 40.5 38 44.5 41.5" stroke="#3d2314" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M 55.5 41.5 Q 59.5 38 63.5 41.5" stroke="#3d2314" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Dizzy circles underneath */}
        <ellipse cx="40.5" cy="43.5" rx="3" ry="1.5" fill="none" stroke="#c07850" strokeWidth="0.8" opacity="0.5"/>
        <ellipse cx="59.5" cy="43.5" rx="3" ry="1.5" fill="none" stroke="#c07850" strokeWidth="0.8" opacity="0.5"/>
        {/* Little tired open mouth */}
        <ellipse cx="50" cy="48" rx="2" ry="3.2" fill="#fca5a5" stroke="#3d2314" strokeWidth="1.2"/>
        {/* Sweat drop on side */}
        <path d="M 31 43 C 31 45 30 47 30 49 C 30 50.5 31 51.5 32.5 51.5 C 34 51.5 35 50.5 35 49 Q 35 47 31 43 Z" fill="#22d3ee" opacity="0.8"/>
      </>
    ),
    pout: (
      <>
        {/* Cute chibi eyes slightly closed/sad */}
        <path d="M 37.5 39.5 C 39.5 41.5 42.5 41.5 44.5 39.5" stroke="#3d2314" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M 55.5 39.5 C 57.5 41.5 60.5 41.5 62.5 39.5" stroke="#3d2314" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Cute :3 pouty mouth */}
        <path d="M 46.5 47 Q 48.5 49 50 47.5 Q 51.5 49 53.5 47" stroke="#c07850" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        {/* Blush cheeks */}
        <ellipse cx="36" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.25"/>
        <ellipse cx="64" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.25"/>
      </>
    ),
    neutral: (
      <>
        {/* Large chibi eyes with reflections */}
        <circle cx="41" cy="38" r="3.2" fill="#3d2314" />
        <circle cx="42.2" cy="36.8" r="1.1" fill="white" />
        <circle cx="59" cy="38" r="3.2" fill="#3d2314" />
        <circle cx="60.2" cy="36.8" r="1.1" fill="white" />
        {/* Small flat line mouth */}
        <line x1="47" y1="46.5" x2="53" y2="46.5" stroke="#c07850" strokeWidth="2.2" strokeLinecap="round"/>
        {/* Subtle blush */}
        <ellipse cx="36" cy="43" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.18"/>
        <ellipse cx="64" cy="43" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.18"/>
      </>
    ),
    smile: (
      <>
        {/* Large chibi eyes with sparkles */}
        <circle cx="41" cy="38" r="3.2" fill="#3d2314" />
        <circle cx="42.2" cy="36.8" r="1.1" fill="white" />
        <circle cx="59" cy="38" r="3.2" fill="#3d2314" />
        <circle cx="60.2" cy="36.8" r="1.1" fill="white" />
        {/* Cute smiling mouth */}
        <path d="M 46 45.5 Q 50 49.5 54 45.5" stroke="#c07850" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        {/* Blush cheeks */}
        <ellipse cx="36" cy="43.5" rx="3.5" ry="2" fill="#f43f5e" opacity="0.25"/>
        <ellipse cx="64" cy="43.5" rx="3.5" ry="2" fill="#f43f5e" opacity="0.25"/>
      </>
    ),
    wideSmile: (
      <>
        {/* Arched crescent moon joy eyes */}
        <path d="M 36.5 38.5 Q 41 33 45.5 38.5" stroke="#3d2314" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        <path d="M 54.5 38.5 Q 59 33 63.5 38.5" stroke="#3d2314" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        {/* Open happy mouth */}
        <path d="M 45 45 Q 50 53 55 45 Z" fill="#f87171" stroke="#3d2314" strokeWidth="1.5"/>
        <ellipse cx="50" cy="45" rx="3.2" ry="1.2" fill="#fecdd3"/>
        {/* Cute blush cheeks */}
        <ellipse cx="35" cy="43" rx="4" ry="2.2" fill="#f43f5e" opacity="0.35"/>
        <ellipse cx="65" cy="43" rx="4" ry="2.2" fill="#f43f5e" opacity="0.35"/>
      </>
    ),
    leisure: (
      <>
        {/* Cool shades */}
        <rect x="33" y="34.5" width="14" height="8" rx="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <rect x="53" y="34.5" width="14" height="8" rx="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <line x1="47" y1="38.5" x2="53" y2="38.5" stroke="#334155" strokeWidth="2.2"/>
        <line x1="33" y1="38.5" x2="33.5" y2="38.5" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
        {/* Lens sheen */}
        <ellipse cx="38" cy="36.5" rx="2.5" ry="1.2" fill="white" opacity="0.18"/>
        <ellipse cx="58" cy="36.5" rx="2.5" ry="1.2" fill="white" opacity="0.18"/>
        {/* Relaxed half-smile */}
        <path d="M 44.5 47 Q 50 51 55.5 47" stroke="#c07850" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </>
    ),
  };

  let face = faceMap[state] || faceMap.leisure;
  if (mascotReaction) {
    if (mascotReaction === "water" || mascotReaction === "success") {
      face = faceMap.wideSmile;
    } else if (mascotReaction === "exercise") {
      face = faceMap.exercise;
    }
  } else if (state !== "sleep" && state !== "exercise" && state !== "focus" && state !== "stressed") {
    if (healthScore === 0) {
      face = faceMap.exhaust;
    } else if (healthScore > 0 && healthScore <= 25) {
      face = faceMap.pout;
    } else if (healthScore > 25 && healthScore <= 50) {
      face = faceMap.neutral;
    } else if (healthScore > 50 && healthScore <= 75) {
      face = faceMap.smile;
    } else if (healthScore > 75 && healthScore <= 90) {
      face = faceMap.smile;
    } else {
      face = faceMap.wideSmile;
    }
  }

  // --- Arm poses ---
  const armMap = {
    sleep:    { L: "M 37 65 Q 30 78 36 82", R: "M 63 65 Q 70 78 64 82" },
    focus:    { L: "M 37 65 Q 28 72 34 80", R: "M 63 65 Q 72 72 66 80" },
    exercise: { L: "M 37 65 L 24 76 L 32 86", R: "M 63 65 L 76 52 L 68 40" },
    stressed: { L: "M 37 65 Q 24 50 40 40", R: "M 63 65 Q 76 50 60 40" },
    happy:    { L: "M 37 65 Q 22 48 20 32", R: "M 63 65 Q 78 48 80 32" },
    leisure:  { L: "M 37 65 Q 26 72 30 84", R: "M 63 65 Q 76 62 78 50" },
  };
  const arms = armMap[state] || armMap.leisure;

  // --- Hair per state ---
  const hairMap = {
    sleep:    <path d="M 35 34 Q 32 22 50 18 Q 68 22 65 34 Q 60 27 50 26 Q 40 27 35 34 Z" fill={hairColor}/>,
    focus:    <path d="M 34 33 Q 30 18 50 15 Q 70 18 66 33 Q 60 22 50 21 Q 40 22 34 33 Z" fill={hairColor}/>,
    exercise: <path d="M 35 34 Q 34 20 50 17 Q 66 20 65 34 Q 58 25 50 24 Q 42 25 35 34 Z" fill={hairColor}/>,
    stressed: <path d="M 34 33 Q 30 17 50 14 Q 70 17 66 33 Q 60 21 50 20 Q 40 21 34 33 Z" fill={hairColor}/>,
    happy:    <path d="M 35 33 Q 32 18 50 15 Q 68 18 65 33 Q 59 22 50 21 Q 41 22 35 33 Z" fill={hairColor}/>,
    leisure:  <path d="M 35 34 Q 33 19 50 17 Q 67 19 65 34 Q 60 25 55 23 Q 50 21 45 23 Q 40 25 35 34 Z" fill={hairColor}/>,
  };
  const hair = hairMap[state] || hairMap.leisure;

  // --- Legs per state ---
  const legsMap = {
    sleep: (
      <>
        <path d="M 36 88 C 36 98, 50 98, 50 90" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 64 88 C 64 98, 50 98, 50 90" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <ellipse cx="44" cy="95" rx="5" ry="3" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
        <ellipse cx="56" cy="95" rx="5" ry="3" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
      </>
    ),
    exercise: (
      <>
        <path d="M 42 88 L 32 100 L 42 104" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 58 88 L 68 100 L 58 104" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="28" y="102" width="11" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
        <rect x="61" y="102" width="11" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
      </>
    ),
    happy: (
      <>
        <path d="M 42 88 L 33 98 L 43 103" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 58 88 L 67 98 L 57 103" stroke={outfit.pants} strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="30" y="101" width="11" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
        <rect x="59" y="101" width="11" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
      </>
    ),
    default: (
      <>
        <rect x="40" y="88" width="8" height="16" rx="2" fill={outfit.pants}/>
        <rect x="52" y="88" width="8" height="16" rx="2" fill={outfit.pants}/>
        <rect x="36" y="102" width="12" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
        <rect x="52" y="102" width="12" height="5" rx="2" fill={outfit.shoes} stroke="#94a3b8" strokeWidth="1"/>
      </>
    ),
  };
  const legs = legsMap[state] || legsMap.default;

  return (
    <svg
      viewBox={isNavbar ? "22 12 56 60" : "0 0 100 120"}
      className={`w-full h-full transition-all duration-500 ${bodyClass}`}
    >
      {/* Drop shadow under feet */}
      <ellipse cx="50" cy="113" rx="24" ry="4" fill="#020617" opacity="0.55"/>

      <g id="character">

        {/* === LEGS === */}
        {legs}

        {/* === ARMS (drawn before torso so torso overlaps at shoulders) === */}
        {/* Left arm - skin then sleeve */}
        <path d={arms.L} stroke={skinTone} strokeWidth="9" strokeLinecap="round" fill="none"/>
        <path d={arms.L} stroke={outfit.shirt} strokeWidth="7" strokeLinecap="round" fill="none"/>
        {/* Left hand */}
        <circle
          cx={arms.L.endsWith("82") ? 30 : arms.L.includes("86") ? 32 : arms.L.includes("84") ? 30 : arms.L.includes("32") ? 20 : 20}
          cy={arms.L.endsWith("82") ? 84 : arms.L.includes("86") ? 86 : arms.L.includes("84") ? 84 : arms.L.includes("32") ? 32 : 32}
          r="4" fill={skinTone} stroke={skinShadow} strokeWidth="0.8"
        />

        {/* Right arm */}
        <path d={arms.R} stroke={skinTone} strokeWidth="9" strokeLinecap="round" fill="none"/>
        <path d={arms.R} stroke={outfit.shirt} strokeWidth="7" strokeLinecap="round" fill="none"/>

        {/* === TORSO === */}
        {/* T-shirt body */}
        <path
          d="M 32 61 C 32 57, 68 57, 68 61 L 64 90 C 64 92, 36 92, 36 90 Z"
          fill={outfit.shirt}
          stroke="#1f2937"
          strokeWidth="1.2"
        />
        {/* Collar / neck opening */}
        <path
          d="M 44 61 Q 50 65 56 61"
          fill="none"
          stroke="#1f2937"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Shirt crease lines for realism */}
        <line x1="46" y1="65" x2="44" y2="80" stroke="#1f2937" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
        <line x1="54" y1="65" x2="56" y2="80" stroke="#1f2937" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>

        {/* === NECK === */}
        <rect x="44" y="52" width="12" height="10" rx="4" fill={skinTone} stroke={skinShadow} strokeWidth="0.7"/>

        {/* === HEAD === */}
        {/* Skull/Cranium */}
        <ellipse cx="50" cy="36" rx="18" ry="19" fill={skinTone} stroke={skinShadow} strokeWidth="1"/>
        {/* Jaw shaping */}
        <path
          d="M 33 40 Q 32 52 50 56 Q 68 52 67 40"
          fill={skinTone}
          stroke={skinShadow}
          strokeWidth="0.8"
        />

        {/* === HAIR === */}
        {hair}
        {/* Hair highlight */}
        <path
          d="M 43 19 Q 50 17 57 19"
          fill="none"
          stroke={hairHighlight}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* === EAR === */}
        <ellipse cx="32.5" cy="37" rx="3.5" ry="4.5" fill={skinTone} stroke={skinShadow} strokeWidth="0.8"/>
        <ellipse cx="67.5" cy="37" rx="3.5" ry="4.5" fill={skinTone} stroke={skinShadow} strokeWidth="0.8"/>
        {/* Inner ear detail */}
        <ellipse cx="32.5" cy="37" rx="1.8" ry="2.5" fill={skinShadow} opacity="0.35"/>
        <ellipse cx="67.5" cy="37" rx="1.8" ry="2.5" fill={skinShadow} opacity="0.35"/>

        {/* === NOSE === */}
        <path
          d="M 48.5 38 Q 47 42 50 43.5 Q 53 42 51.5 38"
          fill="none"
          stroke={skinShadow}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* === CHEEK BLUSH === */}
        <ellipse cx="37" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.22"/>
        <ellipse cx="63" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.22"/>

        {/* === FACE EXPRESSION === */}
        {face}

      </g>
    </svg>
  );

  // Fallback return (never reached but satisfies linter):
  return null;
};

const AvatarWidget = ({ state, healthScore = 50, mascotReaction = null, isNavbar = false }) => {
  const brightnessStyle = 
    healthScore === 0
      ? { filter: "grayscale(55%) brightness(65%) opacity(0.65)", transition: "all 0.5s ease" }
      : healthScore > 0 && healthScore <= 25
        ? { filter: "grayscale(35%) brightness(78%) opacity(0.78)", transition: "all 0.5s ease" }
        : healthScore > 25 && healthScore <= 50
          ? { filter: "grayscale(12%) brightness(88%) opacity(0.88)", transition: "all 0.5s ease" }
          : healthScore > 50 && healthScore <= 75
            ? { filter: "brightness(100%) saturate(100%)", transition: "all 0.5s ease" }
            : healthScore > 75 && healthScore <= 90
              ? { filter: "brightness(106%) saturate(106%)", transition: "all 0.5s ease" }
              : { filter: "brightness(112%) saturate(112%)", transition: "all 0.5s ease" };

  let animClass = "";
  if (state === "sleep") {
    animClass = "scale-[0.93] translate-y-[3px] opacity-85";
  } else if (state === "stressed") {
    animClass = "animate-pulse";
  } else if (state === "happy" || state === "exercise") {
    animClass = "animate-bounce";
  } else {
    if (healthScore === 0) {
      animClass = "animate-pulse";
    } else if (healthScore > 75 && healthScore <= 90) {
      animClass = "animate-bounce-light";
    } else if (healthScore > 90) {
      animClass = "animate-bounce";
    }
  }

  return (
    <div
      className={`relative rounded-xl flex items-center justify-center border bg-slate-950/70 overflow-hidden transition-all duration-500 ${
        isNavbar ? "w-full h-full" : "w-[84px] h-[100px]"
      } ${
        state === "sleep"    ? "border-blue-500/30 shadow-[0_0_18px_rgba(59,130,246,0.25)]" :
        state === "focus"   ? "border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.35)]" :
        state === "exercise"? "border-red-500/35 shadow-[0_0_22px_rgba(239,68,68,0.35)]" :
        state === "stressed"? "border-rose-500/40 shadow-[0_0_22px_rgba(244,63,94,0.4)]" :
        state === "happy"   ? "border-amber-400/90 shadow-[0_0_28px_rgba(245,158,11,0.55)] border-[2px]" :
                              "border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      }`}
    >
      {/* State-tinted background */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          state === "sleep"    ? "bg-blue-950/25" :
          state === "focus"   ? "bg-indigo-950/25" :
          state === "exercise"? "bg-red-950/25" :
          state === "stressed"? "bg-rose-950/25" :
          state === "happy"   ? "bg-amber-950/20" :
                                "bg-emerald-950/15"
        }`}
      />

      {/* The human figure */}
      <div
        className={`relative w-full h-full p-1 ${animClass}`}
        style={brightnessStyle}
      >
        <AvatarFigure state={state} healthScore={healthScore} mascotReaction={mascotReaction} isNavbar={isNavbar} />
      </div>

      {/* ---- State Overlays ---- */}
      {!isNavbar && state === "sleep" && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-2 left-2 text-[9px] font-bold text-blue-300 animate-pulse font-mono">zZz</span>
          <span className="absolute top-1 right-2 text-[7px] text-blue-200 animate-pulse delay-500 font-mono">zZ</span>
          {/* Sleep mask across eyes */}
          <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-11 h-3 bg-blue-500/90 rounded-full border border-blue-300/60 flex items-center justify-between px-2 shadow">
            <span className="text-[5px] text-white font-bold">—</span>
            <span className="text-[5px] text-white font-bold">—</span>
          </div>
        </div>
      )}
      {!isNavbar && state === "focus" && (
        <div className="absolute inset-0 pointer-events-none flex items-start justify-between px-1 pt-1">
          {/* Headphone arc */}
          <svg className="absolute top-1 left-1/2 -translate-x-1/2 w-[72px] h-[72px] text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 14.5c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeLinecap="round"/>
          </svg>
          <div className="absolute left-[4px] top-[30px] w-2.5 h-5 rounded bg-indigo-500 border border-indigo-300 shadow"/>
          <div className="absolute right-[4px] top-[30px] w-2.5 h-5 rounded bg-indigo-500 border border-indigo-300 shadow"/>
          {/* Sound bars */}
          <div className="absolute -left-1 top-9 flex gap-0.5">
            <span className="w-0.5 h-2 bg-indigo-400 rounded animate-pulse"/>
            <span className="w-0.5 h-3.5 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_0.2s]"/>
          </div>
          <div className="absolute -right-1 top-9 flex gap-0.5">
            <span className="w-0.5 h-3.5 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_0.2s]"/>
            <span className="w-0.5 h-2 bg-indigo-400 rounded animate-pulse"/>
          </div>
        </div>
      )}
      {!isNavbar && state === "exercise" && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-3 right-2 text-[9px] animate-pulse">💦</span>
          <span className="absolute top-7 left-2 text-[7px] animate-pulse delay-300">💦</span>
          <div className="absolute bottom-1.5 right-1.5 bg-slate-900 border border-red-500/40 p-0.5 rounded-full shadow text-[9px]">🏋️</div>
        </div>
      )}
      {!isNavbar && state === "stressed" && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-3 right-2 text-[8px] animate-bounce">💧</span>
          <span className="absolute top-7 left-2 text-[7px] animate-[bounce_1s_infinite_0.4s]">💧</span>
          <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-black rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] border border-slate-950">!</div>
        </div>
      )}
      {!isNavbar && state === "happy" && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[14px]">👑</span>
        </div>
      )}
      {!isNavbar && state === "leisure" && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-[28px] left-1/2 -translate-x-1/2 text-[10px]">🕶️</span>
        </div>
      )}
    </div>
  );
};


const CenterHUD = ({ 
  showEmailSettings, 
  showNewsSettings, 
  showFinSettings, 
  showJobSettings, 
  showCalSettings, 
  healthScore,
  jobSearchMode,
  emailMode,
  calendarMode,
  newsKeyword
}) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // System stats - realistic slight fluctuations
  const [cpu, setCpu] = useState(12);
  const [ram, setRam] = useState(38);
  useEffect(() => {
    const statTimer = setInterval(() => {
      setCpu(Math.floor(10 + Math.random() * 8));
      setRam(Math.floor(37 + Math.random() * 2));
    }, 4000);
    return () => clearInterval(statTimer);
  }, []);

  const isJobActive = jobSearchMode !== null;
  const isMailActive = emailMode !== null;
  const isCalActive = calendarMode !== null;
  const isNewsActive = newsKeyword !== "";

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative select-none w-full h-full min-h-[580px] text-center px-4 md:px-8">
      {/* High-tech grid background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#1e1b4b_1.5px,transparent_1.5px)] [background-size:16px_16px] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070a13] via-transparent to-[#070a13] z-0" />

      {/* Cybernetic glowing scanning radar */}
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center z-10">
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-[ping_4s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-cyan-500/10 animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="absolute inset-8 rounded-full border border-emerald-500/5" />
        
        {/* Sweeper arm */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-indigo-500/80 to-transparent origin-left animate-[spin_8s_linear_infinite]" />
        </div>

        {/* HUD Text Display */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase animate-pulse">AgentOS Core</span>
          <span className="text-3xl font-display font-black text-white tracking-widest font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] mt-1">
            {timeString}
          </span>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-2">{dateString}</span>
        </div>
      </div>

      {/* Telemetry Panel */}
      <div className="w-full max-w-md p-4 rounded-xl border border-white/5 bg-slate-950/45 backdrop-blur-md shadow-2xl z-10 text-left flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">SYSTEM STATUS PROTOCOL</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">ONLINE</span>
          </span>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">SYS LOAD</span>
            <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">{cpu}%</span>
          </div>
          <div className="flex flex-col border-l border-white/5">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">RAM ALLOC</span>
            <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">{ram}%</span>
          </div>
          <div className="flex flex-col border-l border-white/5">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">VITALITY</span>
            <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{healthScore}%</span>
          </div>
        </div>

        {/* Agent Channels Status */}
        <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5">
          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">ACTIVE INTERFACE PIPELINES</span>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${isJobActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>Job Hunter: <span className={isJobActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}>{isJobActive ? 'active' : 'offline'}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${isMailActive ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>Email Triage: <span className={isMailActive ? 'text-teal-400 font-bold' : 'text-slate-500'}>{isMailActive ? 'listening' : 'offline'}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${isNewsActive ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>News Monitor: <span className={isNewsActive ? 'text-sky-400 font-bold' : 'text-slate-500'}>{isNewsActive ? 'active' : 'standby'}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${isCalActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>Planner: <span className={isCalActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{isCalActive ? 'active' : 'offline'}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Hints */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[8px] md:text-[10px] font-mono text-slate-600 font-bold uppercase pointer-events-none tracking-widest z-10">
        <span className="animate-pulse">← HOVER LEFT EDGE FOR PLANNER</span>
        <span className="animate-pulse">HOVER RIGHT EDGE FOR COMMUNICATIONS →</span>
      </div>
    </div>
  );
};


function App() {
  // Tile Layout Grid - 6 panels
  const [tiles, setTiles] = useState([
    { id: 1, gridClass: "col-span-1 md:col-span-2 h-[220px]", status: "empty", agent: null },
    { id: 2, gridClass: "col-span-1 md:row-span-2 h-full min-h-[220px] md:min-h-0", status: "empty", agent: null },
    { id: 3, gridClass: "col-span-1 h-[220px]", status: "empty", agent: null },
    { id: 4, gridClass: "col-span-1 h-[220px]", status: "empty", agent: null },
    { id: 5, gridClass: "col-span-1 md:col-span-2 h-[220px]", status: "empty", agent: null },
    { id: 6, gridClass: "col-span-1 h-[220px]", status: "empty", agent: null }
  ]);

  // Main UI States
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(60); 
  const [systemOnline, setSystemOnline] = useState(true);
  const [activeUser, setActiveUser] = useState(null);

  // Email Follow-up Editor popup states
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpTo, setFollowUpTo] = useState("");
  const [followUpSubject, setFollowUpSubject] = useState("");
  const [followUpBody, setFollowUpBody] = useState("");
  const [followUpCompany, setFollowUpCompany] = useState("");

  // System Notification Toast
  const [systemNotification, setSystemNotification] = useState("");

  // Setup Wizard State (Job Search Agent specific)
  const [wizardStep, setWizardStep] = useState(0); 
  const [wizardPrefTitles, setWizardPrefTitles] = useState(() => localStorage.getItem("agentos_pref_titles") || "");
  const [wizardPrefLocation, setWizardPrefLocation] = useState(() => localStorage.getItem("agentos_pref_location") || "");
  const [wizardPrefHours, setWizardPrefHours] = useState(() => parseInt(localStorage.getItem("agentos_pref_hours")) || 72);
  const [wizardSkills, setWizardSkills] = useState(() => localStorage.getItem("agentos_pref_skills") || "");
  const [wizardYOE, setWizardYOE] = useState(() => parseInt(localStorage.getItem("agentos_pref_yoe")) || 0);
  const [wizardSeniorityPref, setWizardSeniorityPref] = useState(() => localStorage.getItem("agentos_pref_seniority") || "");
  const [wizardResumeText, setWizardResumeText] = useState(() => localStorage.getItem("agentos_pref_resume_text") || "");
  const [wizardResumeSkills, setWizardResumeSkills] = useState(() => {
    try {
      const saved = localStorage.getItem("agentos_pref_resume_skills");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wizardResumeExperiences, setWizardResumeExperiences] = useState(() => {
    try {
      const saved = localStorage.getItem("agentos_pref_resume_experiences");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  
  // PDF upload specific states
  const [wizardResumeFile, setWizardResumeFile] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parserStatusText, setParserStatusText] = useState("Vectorizing PDF structure...");
  
  // Load details from localStorage if previously configured
  const [wizardPersonalInfo, setWizardPersonalInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("agentos_personal_info");
      return saved ? JSON.parse(saved) : {
        name: "",
        email: "",
        phone: "",
        github: "",
        linkedin: "",
        portfolio: ""
      };
    } catch (e) {
      return {
        name: "",
        email: "",
        phone: "",
        github: "",
        linkedin: "",
        portfolio: ""
      };
    }
  });

  // Active Job Board States
  const [activeJobs, setActiveJobs] = useState([]);
  const [secondsToSync, setSecondsToSync] = useState(60); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [isJobBoardOpen, setIsJobBoardOpen] = useState(false);
  const [highMatchAlert, setHighMatchAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Apply Modal Flow States
  const [selectedApplyJob, setSelectedApplyJob] = useState(null);
  const [applyPersonalInfo, setApplyPersonalInfo] = useState({});
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  
  // Submission receipt & terminal logs
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmissionSuccess, setAppSubmissionSuccess] = useState(false);
  const [appTerminalLogs, setAppTerminalLogs] = useState([]);
  const [appReceiptData, setAppReceiptData] = useState(null);
  const [showReceiptAccordion, setShowReceiptAccordion] = useState(false);

  // Calendar Agent States
  const [calendarMode, setCalendarMode] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const [wellnessDiet, setWellnessDiet] = useState("none");
  const [wellnessExercise, setWellnessExercise] = useState("stretching");
  const [wellnessWakeTime, setWellnessWakeTime] = useState("07:00");
  const [wellnessSleepTime, setWellnessSleepTime] = useState("22:00");
  const [wellnessPlan, setWellnessPlan] = useState(null);
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAvatarSettingsOpen, setIsAvatarSettingsOpen] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const getLocalYMD = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [wellnessDate, setWellnessDate] = useState(() => getLocalYMD(new Date()));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [nextEvent, setNextEvent] = useState(null);
  const [countdownText, setCountdownText] = useState("");
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Google OAuth wizard state
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [googleRedirectUri, setGoogleRedirectUri] = useState("http://localhost:5000/api/auth/google/callback");
  const [isConfiguringGoogle, setIsConfiguringGoogle] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCreateMeet, setEventCreateMeet] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState(null);

  // News Agent States
  const [newsKeyword, setNewsKeyword] = useState("");
  const [newsItems, setNewsItems] = useState([]);
  const [newsSecondsToSync, setNewsSecondsToSync] = useState(3600);
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  const [isEditingNewsKeyword, setIsEditingNewsKeyword] = useState(false);
  const [tempNewsKeyword, setTempNewsKeyword] = useState("");

  // Email Triage Agent States
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeEmailFolder, setActiveEmailFolder] = useState("priority");
  const [emailMode, setEmailMode] = useState(null);
  const [emailConnectedTile, setEmailConnectedTile] = useState(null);

  // Job Search Agent States
  const [jobSearchMode, setJobSearchMode] = useState(null);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [jobBoardTab, setJobBoardTab] = useState("feed"); // "feed" | "history"

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [wellnessLastResetDate, setWellnessLastResetDate] = useState(() => localStorage.getItem("agentos_wellness_last_reset_date") || getLocalDateString());

  // Motivational & Habit Tracker States
  const [waterCups, setWaterCups] = useState(() => {
    const today = getLocalDateString();
    const lastReset = localStorage.getItem("agentos_wellness_last_reset_date") || "";
    if (lastReset === today) {
      const saved = localStorage.getItem("agentos_water_cups");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [exerciseMinutes, setExerciseMinutes] = useState(() => {
    const today = getLocalDateString();
    const lastReset = localStorage.getItem("agentos_wellness_last_reset_date") || "";
    if (lastReset === today) {
      const saved = localStorage.getItem("agentos_exercise_minutes");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWinLog, setShowWinLog] = useState(() => localStorage.getItem("agentos_show_win_log") === "true");
  const [winLogEntries, setWinLogEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("agentos_win_log");
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "Deploying AgentOS framework complete 🚀", date: new Date().toISOString() },
        { id: 2, text: "Savings goal achieved (+35% projected savings on track) 💎", date: new Date().toISOString() }
      ];
    } catch {
      return [
        { id: 1, text: "Deploying AgentOS framework complete 🚀", date: new Date().toISOString() },
        { id: 2, text: "Savings goal achieved (+35% projected savings on track) 💎", date: new Date().toISOString() }
      ];
    }
  });
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showNewsSettings, setShowNewsSettings] = useState(false);
  const [showFinSettings, setShowFinSettings] = useState(false);
  const [showJobSettings, setShowJobSettings] = useState(false);
  const [showCalSettings, setShowCalSettings] = useState(false);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const [leftSidebarForceOpen, setLeftSidebarForceOpen] = useState(false);
  const [rightSidebarForceOpen, setRightSidebarForceOpen] = useState(false);
  const [loadedProfileEmail, setLoadedProfileEmail] = useState("");
  const isLeftOpen = leftHovered || showNewsSettings || showFinSettings || showCalSettings || leftSidebarForceOpen;
  const isRightOpen = rightHovered || showJobSettings || showEmailSettings || rightSidebarForceOpen;

  const [calendarViewOption, setCalendarViewOption] = useState(() => localStorage.getItem("agentos_calendar_view_option") || "3day");
  const [completedEvents, setCompletedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("agentos_completed_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mascotReaction, setMascotReaction] = useState(null);

  useEffect(() => {
    if (mascotReaction) {
      const timer = setTimeout(() => {
        setMascotReaction(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mascotReaction]);


  const getHealthScore = () => {
    const waterPart = Math.min(25, (waterCups / 8) * 25);
    const exercisePart = Math.min(25, (exerciseMinutes / 30) * 25);
    const hasLunch = completedEvents.some(id => {
      const idStr = String(id).toLowerCase();
      return idStr.includes("lunch") || idStr.includes("cook");
    });
    const lunchPart = hasLunch ? 25 : 0;
    const hasDinner = completedEvents.some(id => String(id).toLowerCase().includes("dinner"));
    const dinnerPart = hasDinner ? 25 : 0;
    return Math.round(waterPart + exercisePart + lunchPart + dinnerPart);
  };
  const healthScore = getHealthScore();


  useEffect(() => {
    localStorage.setItem("agentos_show_win_log", showWinLog.toString());
  }, [showWinLog]);

  const [newWinText, setNewWinText] = useState("");

  useEffect(() => {
    localStorage.setItem("agentos_win_log", JSON.stringify(winLogEntries));
  }, [winLogEntries]);

  // ── Financial Runway Agent States ─────────────────────────────────────────
  const finLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const FIN_CATS = ["groceries","dining","entertainment","transport","misc","savings"];
  const FIN_CAT_META = {
    groceries:     { label: "Groceries",     emoji: "🛒", color: "emerald" },
    dining:        { label: "Dining",         emoji: "🍽️", color: "orange"  },
    entertainment: { label: "Entertainment", emoji: "🎬", color: "violet"  },
    transport:     { label: "Transport",      emoji: "🚗", color: "blue"    },
    misc:          { label: "Misc",           emoji: "📦", color: "slate"   },
    savings:       { label: "Savings",        emoji: "💎", color: "cyan"    },
  };
  const [finSetup, setFinSetup] = useState(null);
  // { income, deductions, allocations: { groceries:%, dining:%,... } }
  const [finCurrentMonth, setFinCurrentMonth] = useState(() => localStorage.getItem("agentos_fin_current_month") || new Date().toISOString().slice(0, 7));
  const [finExpenses, setFinExpenses] = useState(() => finLS("agentos_fin_expenses_" + finCurrentMonth, []));
  // [{ id, amount, category, note, date, recurring }]
  const [finHistory, setFinHistory] = useState(() => finLS("agentos_fin_history", []));
  const [finLogRecurring, setFinLogRecurring] = useState(false);
  const [finActiveTab, setFinActiveTab] = useState("dashboard"); // "dashboard" or "history"
  const [finExpandedHistoryMonth, setFinExpandedHistoryMonth] = useState(null);

  const [isFinExpanded, setIsFinExpanded] = useState(false);
  const [finInlineStep, setFinInlineStep] = useState(50);
  // Wizard temps
  const [finWizardIncome, setFinWizardIncome] = useState("");
  const [finWizardDeductions, setFinWizardDeductions] = useState("");
  const [finWizardAllocs, setFinWizardAllocs] = useState({ groceries:20, dining:15, entertainment:10, transport:10, misc:10, savings:35 });
  // Inline log form
  const [finLogAmount, setFinLogAmount] = useState("");
  const [finLogCategory, setFinLogCategory] = useState("groceries");
  const [finLogNote, setFinLogNote] = useState("");
  const [finShowLogForm, setFinShowLogForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("agentos_water_cups", waterCups.toString());
  }, [waterCups]);

  useEffect(() => {
    localStorage.setItem("agentos_exercise_minutes", exerciseMinutes.toString());
  }, [exerciseMinutes]);

  useEffect(() => {
    localStorage.setItem("agentos_wellness_last_reset_date", wellnessLastResetDate);
  }, [wellnessLastResetDate]);

  useEffect(() => {
    const checkDay = () => {
      const today = getLocalDateString();
      if (today !== wellnessLastResetDate) {
        setWellnessLastResetDate(today);
        setWaterCups(0);
        setExerciseMinutes(0);
        localStorage.setItem("agentos_water_cups", "0");
        localStorage.setItem("agentos_exercise_minutes", "0");
        localStorage.setItem("agentos_wellness_last_reset_date", today);
        showSystemToast("🌅 A new day has started. Trackers reset to 0!");
      }
    };
    checkDay();
    const interval = setInterval(checkDay, 60000);
    return () => clearInterval(interval);
  }, [wellnessLastResetDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Check time every 30s
    return () => clearInterval(timer);
  }, []);

  // Financial Runway — persist setup, expenses, current month & history
  useEffect(() => {
    if (finSetup) localStorage.setItem("agentos_fin_setup", JSON.stringify(finSetup));
  }, [finSetup]);

  useEffect(() => {
    localStorage.setItem("agentos_fin_expenses_" + finCurrentMonth, JSON.stringify(finExpenses));
  }, [finExpenses, finCurrentMonth]);

  useEffect(() => {
    localStorage.setItem("agentos_fin_current_month", finCurrentMonth);
  }, [finCurrentMonth]);

  useEffect(() => {
    localStorage.setItem("agentos_fin_history", JSON.stringify(finHistory));
  }, [finHistory]);

  // Financial Runway — month auto-reset check
  useEffect(() => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    if (nowMonth !== finCurrentMonth) {
      // Transition logic
      const totalBudget = finSetup?.spendable || 0;
      const totalSpent = finExpenses.reduce((s, e) => s + e.amount, 0);
      
      const historyEntry = {
        month: finCurrentMonth,
        totalBudget,
        totalSpent,
        income: finSetup?.income || 0,
        expenses: finExpenses
      };
      
      // Update history
      setFinHistory(prev => {
        const filtered = prev.filter(h => h.month !== finCurrentMonth);
        return [...filtered, historyEntry];
      });
      
      // Keep only recurring ones, updating their date to the current date of the new month
      const recurringOnly = finExpenses.filter(e => e.recurring).map(e => ({
        ...e,
        date: new Date().toISOString()
      }));
      
      // Save the new month's expenses list directly to localStorage so it is initialized on refresh too
      localStorage.setItem("agentos_fin_expenses_" + nowMonth, JSON.stringify(recurringOnly));
      
      setFinExpenses(recurringOnly);
      setFinCurrentMonth(nowMonth);
      setFinShowLogForm(false);
      showSystemToast("🌱 Transitioned to new month. Recurring expenses kept!");
    } else {
      // Even if finCurrentMonth matches nowMonth, check if there are any stale expenses from previous months in finExpenses
      const staleExpenses = finExpenses.filter(e => e.date && e.date.slice(0, 7) !== nowMonth);
      if (staleExpenses.length > 0) {
        // Group stale expenses by month and archive them
        const staleMonths = [...new Set(staleExpenses.map(e => e.date.slice(0, 7)))];
        
        setFinHistory(prev => {
          let updated = [...prev];
          staleMonths.forEach(m => {
            const mExpenses = staleExpenses.filter(e => e.date.slice(0, 7) === m);
            if (!updated.some(h => h.month === m)) {
              updated.push({
                month: m,
                totalBudget: finSetup?.spendable || 0,
                totalSpent: mExpenses.reduce((s, e) => s + e.amount, 0),
                income: finSetup?.income || 0,
                expenses: mExpenses
              });
            }
          });
          return updated;
        });

        // Carry forward recurring stale expenses (updating their date to now)
        // One-time stale expenses are removed from active finExpenses
        const recurringStaleCarried = staleExpenses.filter(e => e.recurring).map(e => ({
          ...e,
          date: new Date().toISOString()
        }));

        const currentMonthExpenses = finExpenses.filter(e => e.date && e.date.slice(0, 7) === nowMonth);
        const mergedExpenses = [...currentMonthExpenses, ...recurringStaleCarried];
        
        localStorage.setItem("agentos_fin_expenses_" + nowMonth, JSON.stringify(mergedExpenses));
        setFinExpenses(mergedExpenses);
        showSystemToast("🧹 Cleaned up stale expenses from previous month.");
      }
    }
  }, [finCurrentMonth, finExpenses, finSetup]);

  // Fetch emails helper
  const fetchEmails = async (silent = false) => {
    if (!silent) setEmailsLoading(true);
    log.info("App.jsx", "fetchEmails", "Fetching emails inbox...");
    try {
      const res = await fetch(`/api/email/inbox${activeUser ? `?email=${encodeURIComponent(activeUser.email)}` : ""}`);
      log.info("App.jsx", "fetchEmails", `Server responded status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEmails(data);
          log.info("App.jsx", "fetchEmails", `Successfully retrieved and set ${data.length} emails.`);
        } else {
          log.error("App.jsx", "fetchEmails", `Server response is not an array: ${JSON.stringify(data)}`);
          setEmails([]);
          showSystemToast("⚠️ Failed to retrieve emails (type mismatch).");
        }
      } else {
        const text = await res.text();
        log.warn("App.jsx", "fetchEmails", `Failed status payload: ${text}`);
        showSystemToast("⚠️ Failed to retrieve emails.");
      }
    } catch (err) {
      log.error("App.jsx", "fetchEmails", "Connection/Fetch exception", err);
      console.error(err);
      showSystemToast("⚠️ Email server connection offline.");
    } finally {
      if (!silent) setEmailsLoading(false);
    }
  };

  // Fetch calendar events helper
  const fetchCalendarEvents = async () => {
    setCalendarLoading(true);
    log.info("App.jsx", "fetchCalendarEvents", "Fetching calendar events...");
    try {
      const res = await fetch(`/api/calendar/events${activeUser ? `?email=${encodeURIComponent(activeUser.email)}` : ""}`);
      log.info("App.jsx", "fetchCalendarEvents", `Server responded status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        const apiError = res.headers.get("X-Calendar-Error");
        if (apiError) {
          log.warn("App.jsx", "fetchCalendarEvents", `Calendar api warning: ${apiError}`);
          setCalendarError(apiError);
        } else {
          setCalendarError(null);
        }
        if (Array.isArray(data)) {
          setCalendarEvents(data);
          log.info("App.jsx", "fetchCalendarEvents", `Successfully retrieved and set ${data.length} calendar events.`);
        } else {
          log.error("App.jsx", "fetchCalendarEvents", `Server response is not an array: ${JSON.stringify(data)}`);
          setCalendarEvents([]);
          showSystemToast("⚠️ Failed to retrieve calendar events (type mismatch).");
        }
      } else {
        const text = await res.text();
        log.warn("App.jsx", "fetchCalendarEvents", `Failed status payload: ${text}`);
        showSystemToast("⚠️ Failed to retrieve calendar events.");
      }
    } catch (err) {
      log.error("App.jsx", "fetchCalendarEvents", "Connection/Fetch exception", err);
      console.error(err);
      showSystemToast("⚠️ Calendar server connection offline.");
    } finally {
      setCalendarLoading(false);
    }
  };



  // Fetch optimization suggestions from Daily Focus agent
  // Shared by the first-login onboarding modal and the avatar's "Health Agent Settings"
  // panel — both just collect diet/exercise/wake/sleep and persist them the same way.
  const handleSavePreferences = async ({ diet, exercise, wakeTime, sleepTime }) => {
    if (!activeUser?.email) return false;
    setIsSavingPreferences(true);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(activeUser.email)}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietPreference: diet,
          exerciseStyle: exercise,
          wellnessWakeTime: wakeTime,
          wellnessSleepTime: sleepTime
        })
      });
      if (res.ok) {
        setWellnessDiet(diet);
        setWellnessExercise(exercise);
        setWellnessWakeTime(wakeTime);
        setWellnessSleepTime(sleepTime);
        return true;
      }
      showSystemToast("⚠️ Failed to save health preferences.");
      return false;
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Connection error saving preferences.");
      return false;
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const fetchWellnessPlan = async (targetDate = wellnessDate) => {
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/daily-focus/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diet: wellnessDiet,
          exercise: wellnessExercise,
          wakeTime: wellnessWakeTime,
          sleepTime: wellnessSleepTime,
          localDate: targetDate,
          email: activeUser?.email,
          completedEvents: completedEvents
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWellnessPlan(data);
        showSystemToast("🎯 Daily plan optimized successfully!");
      } else {
        showSystemToast("⚠️ Failed to generate schedule optimization plan.");
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Wellness API connection offline.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLogSuggestionDirectly = (sug) => {
    const sugId = sug.id || `direct-${sug.name.toLowerCase().replace(/\s+/g, '-')}`;
    const isCompleted = completedEvents.includes(sugId);
    
    let nextCompleted;
    if (isCompleted) {
      nextCompleted = completedEvents.filter(id => id !== sugId);
      showSystemToast(`Reopened task: "${sug.name}"`);
    } else {
      nextCompleted = [...completedEvents, sugId];
      
      const type = sug.type || "walking";
      if (type === "walking" || type === "exercise" || sug.name.toLowerCase().match(/(walk|exercise|workout|stretch|yoga|run)/)) {
        const mins = sug.name.toLowerCase().includes("stretch") ? 15 : 20;
        setExerciseMinutes(prev => prev + mins);
        showSystemToast(`🏃 Logged direct ${mins}m exercise for "${sug.name}"!`);
        setMascotReaction("exercise");
      } else if (sug.name.toLowerCase().includes("water") || sug.name.toLowerCase().includes("hydrate") || sug.name.toLowerCase().includes("hydration")) {
        setWaterCups(prev => Math.min(8, prev + 2));
        showSystemToast(`💧 Logged 2 cups of water directly for "${sug.name}"!`);
        setMascotReaction("water");
      } else {
        showSystemToast(`✓ Logged directly: "${sug.name}"`);
        setMascotReaction("success");
      }
    }
    setCompletedEvents(nextCompleted);
    localStorage.setItem("agentos_completed_events", JSON.stringify(nextCompleted));
  };


  const handleScheduleSuggestion = async (suggestion) => {
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.name,
          description: suggestion.details,
          start: suggestion.startISO,
          end: suggestion.endISO,
          location: suggestion.type === "walking" ? "Outdoors" : suggestion.type === "cooking" ? "Kitchen" : "Home",
          createMeet: false,
          email: activeUser?.email,
          completedEvents: completedEvents
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.skipped) {
          showSystemToast(`Already scheduled: ${suggestion.name}`);
        } else {
          showSystemToast(`📅 Scheduled: ${suggestion.name}`);
          setMascotReaction("success");
        }
        await fetchCalendarEvents();
        await fetchWellnessPlan();
      } else {
        showSystemToast("⚠️ Failed to schedule wellness break.");
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Connection error scheduling block.");
    }
  };

  const handleToggleCompleteEvent = (event) => {
    const isCompleted = completedEvents.includes(event.id);
    let nextCompleted;
    if (isCompleted) {
      nextCompleted = completedEvents.filter(id => id !== event.id);
      showSystemToast(`Reopened task: "${event.title}"`);
    } else {
      nextCompleted = [...completedEvents, event.id];
      const title = event.title.toLowerCase();
      if (title.includes("workout") || title.includes("exercise") || title.includes("walk") || title.includes("jog") || title.includes("run") || title.includes("gym")) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const duration = Math.round((end - start) / (1000 * 60)) || 15;
        setExerciseMinutes(prev => prev + duration);
        showSystemToast(`🏋️ Logged ${duration}m workout from "${event.title}"!`);
        setMascotReaction("exercise");
      } else {
        showSystemToast(`✓ Marked done: "${event.title}"`);
        setMascotReaction("success");
      }
    }
    setCompletedEvents(nextCompleted);
    localStorage.setItem("agentos_completed_events", JSON.stringify(nextCompleted));
  };

  const handleScheduleAllSuggestions = async () => {
    if (!wellnessPlan || !wellnessPlan.suggestions.length) return;
    
    showSystemToast("⚙️ Scheduling focus and wellness breaks...");
    let successCount = 0;
    let skippedCount = 0;
    let needsGoogleReconnect = false;
    let lastError = null;

    for (const sug of wellnessPlan.suggestions) {
      try {
        const res = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sug.name,
            description: sug.details,
            start: sug.startISO,
            end: sug.endISO,
            location: sug.type === "walking" ? "Outdoors" : sug.type === "cooking" ? "Kitchen" : "Home",
            createMeet: false,
            email: activeUser?.email,
            completedEvents: completedEvents
          })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.skipped) {
            skippedCount++;
          } else {
            successCount++;
          }
        } else if (data.requiresGoogleReconnect) {
          needsGoogleReconnect = true;
        } else {
          lastError = data.error;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (successCount > 0 || skippedCount > 0) {
      const parts = [];
      if (successCount > 0) parts.push(`scheduled ${successCount} new event${successCount === 1 ? '' : 's'}`);
      if (skippedCount > 0) parts.push(`${skippedCount} already scheduled`);
      showSystemToast(`📅 ${parts.join(', ')}`);
      if (needsGoogleReconnect || lastError) {
        showSystemToast(needsGoogleReconnect
          ? "⚠️ Some events failed: Google Calendar isn't connected (or your session expired)."
          : `⚠️ Some events failed: ${lastError}`);
      }
      await fetchCalendarEvents();
      await fetchWellnessPlan();
    } else if (needsGoogleReconnect) {
      showSystemToast("⚠️ Google Calendar isn't connected (or your session expired) — reconnect it and try again.");
    } else if (lastError) {
      showSystemToast(`⚠️ ${lastError}`);
    } else {
      showSystemToast("⚠️ Failed to auto-schedule wellness breaks.");
    }
  };

  const isAlreadyScheduled = (sug) => {
    return calendarEvents.some(event => {
      const eventDate = new Date(event.start).toDateString();
      const sugDate = new Date(sug.startISO).toDateString();
      return event.title === sug.name && eventDate === sugDate;
    });
  };

  const isTargetScheduled = (targetKey) => {
    return calendarEvents.some(event => {
      const eventDate = new Date(event.start).toDateString();
      const selectedDateString = new Date(`${wellnessDate}T00:00:00`).toDateString();
      if (eventDate !== selectedDateString) return false;
      
      if (targetKey === "cooking-lunch") {
        return event.title.startsWith("🍳 Cook & Dine") || event.title.toLowerCase().includes("lunch");
      }
      if (targetKey === "cooking-dinner") {
        return event.title.startsWith("🥗 Healthy Dinner") || event.title.toLowerCase().includes("dinner");
      }
      if (targetKey === "productivity") {
        return event.title.includes("Focus Work") || event.title.includes("Deep Focus");
      }
      if (targetKey === "walking") {
        return event.title.includes("Walk");
      }
      if (targetKey === "exercise") {
        return event.title.includes("Workout") || event.title.toLowerCase().includes("exercise") || event.title.includes("Active Workout");
      }
      return false;
    });
  };

  // Google Calendar & Email Auth verification and initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Check for Login Success redirect parameter
    if (urlParams.get("login_success") === "true") {
      const email = urlParams.get("email");
      const name = urlParams.get("name") || "";
      const picture = urlParams.get("picture") || "";
      
      if (email) {
        const userObj = { email, name, picture };
        setActiveUser(userObj);
        showSystemToast(`👋 Welcome, ${name || email}! Scoped user profile loaded.`);
      }
      
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // 2. Check for Calendar/Gmail connection redirect parameter
    if (urlParams.get("calendar_connected") === "true") {
      const pendingTileId = parseInt(localStorage.getItem("agentos_calendar_pending_tile"));
      const pendingEmailTileId = parseInt(localStorage.getItem("agentos_email_pending_tile"));
      
      localStorage.removeItem("agentos_calendar_pending_tile");
      localStorage.removeItem("agentos_email_pending_tile");
      
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (pendingTileId) {
        handleFinishCalendarWizard("google", pendingTileId);
        showSystemToast("📅 Google Calendar sync activated successfully!");
      }
      if (pendingEmailTileId) {
        handleFinishEmailWizard("google", pendingEmailTileId);
        showSystemToast("📥 Gmail sync activated successfully!");
      }
    }
  }, []);

  // 3. Load user-specific profile details if activeUser is logged in
  useEffect(() => {
    if (!activeUser) {
      log.info("App.jsx", "useEffect:profileLoad", "No activeUser found, resetting loaded profile email.");
      setLoadedProfileEmail("");
      return;
    }
    
    log.info("App.jsx", "useEffect:profileLoad", `Fetching profile for: ${activeUser.email}...`);
    fetch(`/api/profile/load?email=${encodeURIComponent(activeUser.email)}`)
      .then(res => {
        log.info("App.jsx", "useEffect:profileLoad", `Received profile status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        log.info("App.jsx", "useEffect:profileLoad", `Profile data parsed: ${JSON.stringify(data ? { email: data.email, isGoogleConnected: data.isGoogleConnected } : null)}`);
        if (data) {

          const p = data.preferences || {};
          
          // Load text/numeric preferences
          if (p.prefTitles !== undefined) setWizardPrefTitles(p.prefTitles);
          if (p.prefLocation !== undefined) setWizardPrefLocation(p.prefLocation);
          if (p.prefHours !== undefined) setWizardPrefHours(p.prefHours);
          if (p.prefSkills !== undefined) setWizardSkills(p.prefSkills);
          if (p.prefYOE !== undefined) setWizardYOE(p.prefYOE);
          if (p.prefSeniority !== undefined) setWizardSeniorityPref(p.prefSeniority);
           if (p.resumeText !== undefined) setWizardResumeText(p.resumeText);
          if (p.resumeSkills !== undefined) setWizardResumeSkills(p.resumeSkills);
          if (p.resumeExperiences !== undefined) setWizardResumeExperiences(p.resumeExperiences);
          if (p.resumeFile !== undefined) {
            setWizardResumeFile(p.resumeFile);
          } else if (p.resumeText) {
            setWizardResumeFile({ name: "Uploaded_Resume.pdf", size: "Saved in Profile" });
          }
          if (p.personalInfo !== undefined) setWizardPersonalInfo(p.personalInfo);
          if (p.newsKeyword !== undefined) setNewsKeyword(p.newsKeyword);
          if (p.finSetup !== undefined) setFinSetup(p.finSetup);
          if (p.finExpenses !== undefined) setFinExpenses(p.finExpenses);
          if (p.finHistory !== undefined) setFinHistory(p.finHistory);
          if (p.finCurrentMonth !== undefined) setFinCurrentMonth(p.finCurrentMonth);
          if (p.activeJobs !== undefined) setActiveJobs(p.activeJobs);
          if (p.completedEvents !== undefined) {
            setCompletedEvents(p.completedEvents);
          } else {
            const cached = localStorage.getItem("agentos_completed_events");
            if (cached) setCompletedEvents(JSON.parse(cached));
          }
          
          // Wellness & Habit trackers
          setWellnessWakeTime(p.wellnessWakeTime || "07:00");
          setWellnessSleepTime(p.wellnessSleepTime || "22:00");
          setWellnessDiet(p.dietPreference || "none");
          setWellnessExercise(p.exerciseStyle || "stretching");

          // A profile with no diet preference set yet has never completed onboarding.
          setIsOnboardingOpen(!p.dietPreference);


          const today = getLocalDateString();
          const pResetDate = p.wellnessLastResetDate || "";
          
          if (pResetDate === today) {
            setWaterCups(p.waterCups !== undefined ? p.waterCups : 0);
            setExerciseMinutes(p.exerciseMinutes !== undefined ? p.exerciseMinutes : 0);
            setWellnessLastResetDate(today);
          } else {
            setWaterCups(0);
            setExerciseMinutes(0);
            setWellnessLastResetDate(today);
          }
          
          // Connect active agent states
          const isGoogleConnected = !!data.isGoogleConnected;
          const finalCalendarMode = isGoogleConnected ? 'google' : (activeUser.email && activeUser.email.toLowerCase().startsWith('demouser@gmail') ? 'demo' : null);
          const finalEmailMode = isGoogleConnected ? 'google' : (activeUser.email && activeUser.email.toLowerCase().startsWith('demouser@gmail') ? 'demo' : null);
          
          setCalendarMode(finalCalendarMode);
          setEmailMode(finalEmailMode);
          
          if (finalCalendarMode) {
            const loadCalendarEvents = () => {
              fetch(`/api/calendar/events?email=${encodeURIComponent(activeUser.email)}`)
                .then(res => res.json())
                .then(evs => {
                  if (Array.isArray(evs)) {
                    setCalendarEvents(evs);
                  } else {
                    log.error("App.jsx", "useEffect:profileLoad", `Calendar fetch returned non-array: ${JSON.stringify(evs)}`);
                    setCalendarEvents([]);
                  }
                })
                .catch(err => {
                  log.error("App.jsx", "useEffect:profileLoad:calendar", "Error loading calendar events", err);
                  console.error("Initial calendar load error", err);
                });
            };
            loadCalendarEvents();

            // Auto-schedule the health planner for the rest of this work week (or the
            // upcoming one, if today is a weekend) right on login — otherwise a user would
            // only ever see it appear after the Saturday cron runs, which could be days away
            // or never fire at all if the server wasn't running at 9am that Saturday.
            //
            // Only do this for users who have already completed onboarding (dietPreference
            // is set). Otherwise this fires before the user picks their real preferences,
            // scheduling a week of meals with the "none" default — and since scheduling is
            // dedupe-guarded per day/category, those wrong defaults would then permanently
            // block the correct ones from ever being created once onboarding finishes.
            // First-time users get this triggered right after they submit onboarding instead
            // (see the onboarding modal's submit handler).
            if (p.dietPreference) {
              fetch("/api/schedule/current-week", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: activeUser.email })
              })
                .then(res => res.json())
                .then(result => {
                  if (result?.totalScheduled > 0) {
                    showSystemToast(`🎯 Health planner auto-scheduled: ${result.totalScheduled} wellness task(s) added for this week!`);
                    loadCalendarEvents();
                  }
                  if (result?.requiresGoogleReconnect) {
                    showSystemToast("⚠️ Google Calendar isn't connected (or your session expired) — reconnect it to auto-schedule your health planner.");
                  } else if (result?.totalFailed > 0) {
                    showSystemToast(`⚠️ ${result.totalFailed} health planner task(s) failed to schedule: ${result.lastError}`);
                  }
                })
                .catch(err => {
                  log.error("App.jsx", "useEffect:profileLoad:currentWeek", "Error auto-scheduling current week", err);
                });
            }
          } else {
            setCalendarEvents([]);
          }
          
          if (finalEmailMode) {
            setEmailConnectedTile(2);
            fetch(`/api/email/inbox?email=${encodeURIComponent(activeUser.email)}`)
              .then(res => res.json())
              .then(mails => {
                if (Array.isArray(mails)) {
                  setEmails(mails);
                } else {
                  log.error("App.jsx", "useEffect:profileLoad", `Email fetch returned non-array: ${JSON.stringify(mails)}`);
                  setEmails([]);
                }
              })
              .catch(err => {
                log.error("App.jsx", "useEffect:profileLoad:email", "Error loading inbox emails", err);
                console.error("Initial email load error", err);
              });
          } else {
            setEmails([]);
            setEmailConnectedTile(null);
          }

          
          if (p.jobSearchMode) {
            setJobSearchMode(p.jobSearchMode);
          } else {
            setJobSearchMode(null);
          }
          
          // Connect active tiles dynamically
          setTiles(prev => prev.map(tile => {
            if (tile.id === 1 && finalCalendarMode) {
              const calendarAgent = AGENT_CATALOG.find(a => a.id === "calendar_planner");
              return { ...tile, status: "connected", agent: calendarAgent, gridClass: "col-span-1 md:row-span-2 h-full min-h-[460px]" };
            }
            if (tile.id === 2 && finalEmailMode) {
              const emailAgent = AGENT_CATALOG.find(a => a.id === "email_triage");
              return { ...tile, status: "connected", agent: emailAgent, gridClass: "col-span-1 md:row-span-2 h-full min-h-[460px]" };
            }
            if (tile.id === 3 && p.jobSearchMode) {
              const jobAgent = AGENT_CATALOG.find(a => a.id === "job_search");
              return { ...tile, status: "connected", agent: jobAgent };
            }
            if (tile.id === 4 && p.newsKeyword) {
              const newsAgent = AGENT_CATALOG.find(a => a.id === "news_monitor");
              return { ...tile, status: "connected", agent: newsAgent };
            }
            if (tile.id === 5 && p.finSetup) {
              const finAgent = AGENT_CATALOG.find(a => a.id === "financial_runway");
              return { ...tile, status: "connected", agent: finAgent };
            }
            return tile;
          }));
          
          setLoadedProfileEmail(activeUser.email);
          fetchApplicationHistory(activeUser.email);
        }
      })
      .catch(err => {
        log.error("App.jsx", "useEffect:profileLoad", "Error fetching/loading user profile", err);
        console.error("Error loading user profile:", err);
      });
  }, [activeUser]);


  // Real-time Countdown timer for next meeting
  useEffect(() => {
    const updateCountdown = () => {
      if (calendarEvents.length === 0) {
        setNextEvent(null);
        setCountdownText("No upcoming events");
        return;
      }
      const now = new Date();
      const futureEvents = calendarEvents
        .filter(e => new Date(e.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));

      if (futureEvents.length > 0) {
        const next = futureEvents[0];
        setNextEvent(next);
        const diffMs = new Date(next.start) - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (diffHrs > 0) {
          setCountdownText(`in ${diffHrs}h ${diffMins}m`);
        } else if (diffMins > 0) {
          setCountdownText(`in ${diffMins}m ${diffSecs}s`);
        } else {
          setCountdownText(`in ${diffSecs}s`);
        }
      } else {
        setNextEvent(null);
        setCountdownText("No upcoming events");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [calendarEvents]);

  // Fetch optimization plan when preferences, selected date, or connected agents change
  useEffect(() => {
    const isFocusConnected = calendarMode !== null;
    if (isFocusConnected) {
      fetchWellnessPlan(wellnessDate);
    }
  }, [wellnessDiet, wellnessExercise, wellnessWakeTime, wellnessSleepTime, wellnessDate, calendarMode]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }
    return days;
  };

  const getDaysInWeek = (date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day; // adjust when day is sunday
    const sunday = new Date(current.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const get3Days = (date) => {
    const current = new Date(date);
    
    const dayBefore = new Date(current);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    const dayAfter = new Date(current);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    return [dayBefore, new Date(current), dayAfter];
  };


  const handleFinishCalendarWizard = (mode, tileId) => {
    const calendarAgent = AGENT_CATALOG.find(a => a.id === "calendar_planner");
    localStorage.setItem("agentos_calendar_mode", mode);
    localStorage.setItem("agentos_calendar_connected_tile", tileId.toString());
    setCalendarMode(mode);

    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId) {
        return { 
          ...tile, 
          status: "connecting", 
          agent: calendarAgent
        };
      }
      return tile;
    }));

    handleCloseModal();

    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === tileId) {
          return { ...tile, status: "connected" };
        }
        return tile;
      }));
      fetchCalendarEvents();
    }, 1500);
  };

  const handleFinishEmailWizard = (mode, tileId) => {
    const emailAgent = AGENT_CATALOG.find(a => a.id === "email_triage");
    localStorage.setItem("agentos_email_mode", mode);
    localStorage.setItem("agentos_email_connected_tile", tileId.toString());
    setEmailMode(mode);
    setEmailConnectedTile(tileId);

    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId) {
        return { 
          ...tile, 
          status: "connecting", 
          agent: emailAgent
        };
      }
      return tile;
    }));

    handleCloseModal();

    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === tileId) {
          return { ...tile, status: "connected" };
        }
        return tile;
      }));
      fetchEmails();
    }, 1500);
  };


  const handleConnectGoogleEmail = async (e) => {
    if (e) e.preventDefault();
    if (!googleClientId || !googleClientSecret) {
      showSystemToast("⚠️ Client ID and Client Secret are required.");
      return;
    }
    setIsConfiguringGoogle(true);
    try {
      const configRes = await fetch("/api/auth/google/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          redirectUri: googleRedirectUri
        })
      });
      
      if (!configRes.ok) {
        throw new Error("Failed to save credentials on backend.");
      }

      const authRes = await fetch(`/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`);
      const authData = await authRes.json();
      
      if (authRes.ok && authData.url) {
        localStorage.setItem("agentos_email_pending_tile", selectedTileId.toString());
        showSystemToast("🔌 Redirecting to Google Authentication...");
        window.location.href = authData.url;
      } else {
        showSystemToast("⚠️ " + (authData.error || "Failed to generate Google Login URL."));
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Failed to configure Google Gmail. Connection error.");
    } finally {
      setIsConfiguringGoogle(false);
    }
  };

  const handleConnectGoogleCalendar = async (e) => {
    if (e) e.preventDefault();
    if (!googleClientId || !googleClientSecret) {
      showSystemToast("⚠️ Client ID and Client Secret are required.");
      return;
    }
    setIsConfiguringGoogle(true);
    try {
      const configRes = await fetch("/api/auth/google/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          redirectUri: googleRedirectUri
        })
      });
      
      if (!configRes.ok) {
        throw new Error("Failed to save credentials on backend.");
      }

      const authRes = await fetch(`/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`);
      const authData = await authRes.json();
      
      if (authRes.ok && authData.url) {
        localStorage.setItem("agentos_calendar_pending_tile", selectedTileId.toString());
        showSystemToast("🔌 Redirecting to Google Authentication...");
        window.location.href = authData.url;
      } else {
        showSystemToast("⚠️ " + (authData.error || "Failed to generate Google Login URL."));
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Failed to configure Google Calendar. Connection error.");
    } finally {
      setIsConfiguringGoogle(false);
    }
  };

  const handleSelectEventForEdit = (event) => {
    setIsCalendarOpen(true);
    
    // Center the calendar view on the clicked event's date in a 3-day view
    const eventDate = new Date(event.startISO || event.start);
    if (!isNaN(eventDate.getTime())) {
      setMiniCalendarDate(eventDate);
    }
    setCalendarViewOption("3day");

    if (event.startISO || event.isSuggestion) {
      // It is a suggested/intelligent scheduled event
      setEditingEvent({
        id: event.id,
        isSuggestion: true,
        title: event.name || event.title,
        description: event.details || event.description || "",
        location: event.location || (event.type === "walking" ? "Outdoors" : event.type === "cooking" ? "Kitchen" : "Home"),
        meetLink: event.meetLink || "",
        start: event.startISO || event.start,
        end: event.endISO || event.end
      });
      setEventTitle(event.name || event.title);
      setEventDescription(event.details || event.description || "");
      setEventLocation(event.location || (event.type === "walking" ? "Outdoors" : event.type === "cooking" ? "Kitchen" : "Home"));
      setEventCreateMeet(!!event.meetLink);
      
      const formatToLocalInput = (isoStr) => {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      
      setEventStart(formatToLocalInput(event.startISO || event.start));
      setEventEnd(formatToLocalInput(event.endISO || event.end));
      return;
    }

    // Normal event
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || "");
    setEventLocation(event.location || "");
    setEventCreateMeet(!!event.meetLink);
    
    const formatToLocalInput = (isoStr) => {
      if (!isoStr) return "";
      const d = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    setEventStart(formatToLocalInput(event.start));
    setEventEnd(formatToLocalInput(event.end));
  };

  const handleCreateCalendarEvent = async (e) => {
    if (e) e.preventDefault();
    if (!eventTitle || !eventStart || !eventEnd) {
      showSystemToast("⚠️ Title, Start time, and End time are required.");
      return;
    }
    
    setIsAddingEvent(true);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          start: new Date(eventStart).toISOString(),
          end: new Date(eventEnd).toISOString(),
          location: eventLocation,
          createMeet: eventCreateMeet,
          email: activeUser?.email,
          completedEvents: completedEvents
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        showSystemToast("📅 Event created successfully!");
        if (data.rescheduled && data.rescheduled.length > 0) {
          data.rescheduled.forEach(log => {
            showSystemToast(`🤖 Rescheduled "${log.title}" to ${log.newStartStr} – ${log.newEndStr}`);
          });
        }
        setEventTitle("");
        setEventStart("");
        setEventEnd("");
        setEventLocation("");
        setEventDescription("");
        setEventCreateMeet(false);
        setEditingEvent(null);
        fetchCalendarEvents();
        fetchWellnessPlan();
        setIsCalendarOpen(false);
      } else {
        const data = await res.json();
        showSystemToast("⚠️ " + (data.error || "Failed to create event."));
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Connection error creating event.");
    } finally {
      setIsAddingEvent(false);
    }
  };

  const handleDeleteCalendarEvent = async (eventId, e) => {
    if (e) e.stopPropagation();
    
    // If not yet confirmed via in-app dialog, set state to trigger the modal and abort direct deletion
    if (deleteConfirmEventId !== eventId) {
      setDeleteConfirmEventId(eventId);
      return;
    }
    
    try {
      const targetEvent = calendarEvents.find(e => e.id === eventId);
      const eventDateStr = targetEvent ? getLocalYMD(new Date(targetEvent.start)) : "";
      const dateParam = eventDateStr ? `&localDate=${eventDateStr}` : "";
      const completedQuery = completedEvents ? `&completedEvents=${encodeURIComponent(JSON.stringify(completedEvents))}` : "";
      const res = await fetch(`/api/calendar/events/${eventId}${activeUser ? `?email=${encodeURIComponent(activeUser.email)}` : ""}${dateParam}${completedQuery}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        showSystemToast("🗑️ Event deleted/cancelled.");
        if (data.rescheduled && data.rescheduled.length > 0) {
          data.rescheduled.forEach(log => {
            showSystemToast(`🤖 Rescheduled "${log.title}" to ${log.newStartStr} – ${log.newEndStr}`);
          });
        }
        setEditingEvent(null);
        setEventTitle("");
        setEventStart("");
        setEventEnd("");
        setEventLocation("");
        setEventDescription("");
        setEventCreateMeet(false);
        setDeleteConfirmEventId(null); // Clear confirmation
        fetchCalendarEvents();
        fetchWellnessPlan();
        setIsCalendarOpen(false);
      } else {
        showSystemToast("⚠️ Failed to delete event.");
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Connection error deleting event.");
    }
  };

  const handleUpdateCalendarEvent = async (e) => {
    if (e) e.preventDefault();
    if (!editingEvent) return;

    setIsAddingEvent(true);
    try {
      // A "suggestion" (from the wellness optimizer or a daySuggestions preview) only
      // exists as a preview — it was never actually saved as a calendar event, so its id
      // (e.g. "suggest-cooking-...") doesn't exist in the registry. PUT-ing it 404s;
      // it needs to be created (POST) instead. This also runs it through the same
      // overlap-rescheduling that every other new event gets.
      const isNewFromSuggestion = !!editingEvent.isSuggestion;
      const res = await fetch(
        isNewFromSuggestion ? "/api/calendar/events" : `/api/calendar/events/${editingEvent.id}`,
        {
          method: isNewFromSuggestion ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: eventTitle,
            description: eventDescription,
            start: new Date(eventStart).toISOString(),
            end: new Date(eventEnd).toISOString(),
            location: eventLocation,
            createMeet: eventCreateMeet,
            email: activeUser?.email,
            completedEvents: completedEvents
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        showSystemToast(isNewFromSuggestion ? "📅 Event scheduled successfully!" : "📅 Event updated successfully!");
        if (data.rescheduled && data.rescheduled.length > 0) {
          data.rescheduled.forEach(log => {
            showSystemToast(`🤖 Rescheduled "${log.title}" to ${log.newStartStr} – ${log.newEndStr}`);
          });
        }
        setEditingEvent(null);
        setEventTitle("");
        setEventStart("");
        setEventEnd("");
        setEventLocation("");
        setEventDescription("");
        setEventCreateMeet(false);
        fetchCalendarEvents();
        fetchWellnessPlan();
        setIsCalendarOpen(false);
      } else {
        const data = await res.json();
        showSystemToast("⚠️ " + (data.error || (isNewFromSuggestion ? "Failed to schedule event." : "Failed to update event.")));
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Connection error while saving event.");
    } finally {
      setIsAddingEvent(false);
    }
  };

  // Compute active count

  const activeCount = tiles.filter(t => t.status === "connected" || t.status === "connecting").length;

  // Persist form configurations automatically to localStorage
  useEffect(() => {
    localStorage.setItem("agentos_pref_titles", wizardPrefTitles);
  }, [wizardPrefTitles]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_location", wizardPrefLocation);
  }, [wizardPrefLocation]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_hours", wizardPrefHours.toString());
  }, [wizardPrefHours]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_skills", wizardSkills);
  }, [wizardSkills]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_yoe", wizardYOE.toString());
  }, [wizardYOE]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_seniority", wizardSeniorityPref);
  }, [wizardSeniorityPref]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_resume_text", wizardResumeText);
  }, [wizardResumeText]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_resume_skills", JSON.stringify(wizardResumeSkills));
  }, [wizardResumeSkills]);

  useEffect(() => {
    localStorage.setItem("agentos_pref_resume_experiences", JSON.stringify(wizardResumeExperiences));
  }, [wizardResumeExperiences]);


  useEffect(() => {
    localStorage.setItem("agentos_personal_info", JSON.stringify(wizardPersonalInfo));
  }, [wizardPersonalInfo]);

  // Background sync countdown timer
  useEffect(() => {
    let interval = null;
    const isJobSearchConnected = jobSearchMode !== null;
    
    if (isJobSearchConnected && systemOnline && !isSyncing) {
      interval = setInterval(() => {
        setSecondsToSync(prev => {
          if (prev <= 1) {
            triggerSyncRefresh();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [jobSearchMode, systemOnline, isSyncing, wizardPrefTitles, wizardPrefLocation, wizardSkills]);

  const fetchApplicationHistory = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/applications?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setApplicationHistory(data || []);
      }
    } catch (err) {
      console.error("[Fetch Application History Fail]", err);
    }
  };

  const handleDownloadHistoryCSV = () => {
    if (applicationHistory.length === 0) {
      showSystemToast("⚠️ No application history to export.");
      return;
    }
    const headers = ["Application ID", "Job Title", "Company", "Location", "Job URL", "Resume Used", "Date Applied", "Applicant Email"];
    const rows = applicationHistory.map(app => [
      app.applicationId || "",
      app.job?.title || "",
      app.job?.company || "",
      app.job?.location || "",
      app.job?.url || "",
      app.resumeUsed || "Default Resume",
      app.timestamp ? new Date(app.timestamp).toLocaleString() : "",
      app.applicant?.email || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgentOS_Job_Application_History_${activeUser?.email?.replace(/[@.]/g, '_') || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSystemToast("📥 CSV download started!");
  };


  // Connects to /api/search to trigger real-time scraping via python-jobspy
  const triggerSyncRefresh = async () => {
    if (!wizardResumeText) {
      showSystemToast("⚠️ No resume found. Please upload your resume to start job searching!");
      const jobTile = tiles.find(t => t.agent?.id === "job_search");
      setSelectedTileId(jobTile ? jobTile.id : 3);
      setWizardStep(1);
      setIsModalOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: activeUser?.email,
          titles: wizardPrefTitles, 
          location: wizardPrefLocation,
          skills: wizardSkills,
          yoe: wizardYOE,
          seniority: wizardSeniorityPref,
          resumeText: wizardResumeText,
          resumeSkills: wizardResumeSkills,
          resumeExperiences: wizardResumeExperiences
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveJobs(data);
        showSystemToast("💼 Job board sync completed. Live listings indexed.");
        
        // Match percentage alert if score > 95
        const highMatch = data.find(job => job.score > 95);
        if (highMatch) {
          setHighMatchAlert({
            title: highMatch.title,
            company: highMatch.company,
            score: highMatch.score
          });
        }
      } else {
        console.error("Scrape failed:", data.error);
        showSystemToast("⚠️ Scrape sync failed: " + (data.error || "Internal error"));
      }
    } catch (err) {
      console.error("Scrape network error:", err);
      showSystemToast("⚠️ Connection timeout while scraping listings.");
    } finally {
      setIsSyncing(false);
      setSecondsToSync(60);
    }
  };

  const triggerNewsSync = async (forceKeyword = null) => {
    const activeKeyword = forceKeyword !== null ? forceKeyword : newsKeyword;
    if (!activeKeyword) return;
    setIsSyncingNews(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: activeKeyword })
      });
      if (res.ok) {
        const data = await res.json();
        setNewsItems(data.news || []);
        showSystemToast("📰 News feed updated successfully!");
      } else {
        let errMsg = "Server error";
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch (e) {}
        showSystemToast("⚠️ News fetch failed: " + errMsg);
      }
    } catch (err) {
      console.error("News sync error:", err);
      showSystemToast("⚠️ Connection error fetching news.");
    } finally {
      setIsSyncingNews(false);
      setNewsSecondsToSync(3600);
    }
  };

  const handleFinishNewsWizard = (keyword, tileId) => {
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) return;
    setNewsKeyword(cleanKeyword);
    setNewsSecondsToSync(3600);
    setNewsItems([]);
    
    const agent = AGENT_CATALOG.find(a => a.id === "news_feed");
    
    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId) {
        return { 
          ...tile, 
          status: "connecting", 
          agent
        };
      }
      return tile;
    }));
    handleCloseModal();
    
    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === tileId) {
          return { ...tile, status: "connected" };
        }
        return tile;
      }));
      triggerNewsSync(cleanKeyword);
    }, 1500);
  };

  // News Agent Persistence Effects
  useEffect(() => {
    localStorage.setItem("agentos_news_keyword", newsKeyword);
  }, [newsKeyword]);

  useEffect(() => {
    localStorage.setItem("agentos_news_items", JSON.stringify(newsItems));
  }, [newsItems]);

  // News Agent sync countdown timer
  useEffect(() => {
    let interval = null;
    const isNewsFeedConnected = newsKeyword !== "";
    
    if (isNewsFeedConnected && systemOnline && !isSyncingNews && newsKeyword) {
      interval = setInterval(() => {
        setNewsSecondsToSync(prev => {
          if (prev <= 1) {
            triggerNewsSync();
            return 3600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [newsKeyword, systemOnline, isSyncingNews]);

  // News auto-fetch on connect/reload
  useEffect(() => {
    const isNewsFeedConnected = newsKeyword !== "";
    if (isNewsFeedConnected && newsItems.length === 0 && newsKeyword && !isSyncingNews) {
      triggerNewsSync();
    }
  }, [newsKeyword]);


  const showSystemToast = (msg) => {
    setSystemNotification(msg);
    setTimeout(() => {
      setSystemNotification("");
    }, 5000);
  };

  const handleGoogleLogin = async () => {
    try {
      const authRes = await fetch(`/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`);
      const authData = await authRes.json();
      
      if (authRes.ok && authData.url) {
        showSystemToast("🔌 Redirecting to Google Login Portal...");
        window.location.href = authData.url;
      } else {
        showSystemToast("⚠️ Google OAuth credentials not set. Please configure Google settings first.");
        setSelectedTileId(1); // open Calendar setup which has credential configuration inputs
        setIsConfigOpen(true);
      }
    } catch (err) {
      console.error(err);
      showSystemToast("⚠️ Failed to reach login gateway.");
    }
  };

  const handleDemoLogin = async () => {
    log.info("App.jsx", "handleDemoLogin", "Initiating demo login fetch request...");
    try {
      showSystemToast("⚡ Initializing fresh demo profile...");
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      log.info("App.jsx", "handleDemoLogin", `Response received. Status: ${res.status}, success: ${data?.success}`);
      if (res.ok && data.success) {
        showSystemToast("🚀 Demo Login active. Welcome to AgentOS!");
        const userObj = {
          email: data.profile.email,
          name: data.profile.name,
          picture: data.profile.picture
        };
        log.info("App.jsx", "handleDemoLogin", `Setting activeUser: ${JSON.stringify(userObj)}`);
        setActiveUser(userObj);
      } else {
        log.warn("App.jsx", "handleDemoLogin", `Demo session initiation failed. Payload: ${JSON.stringify(data)}`);
        showSystemToast("❌ Failed to initiate demo session.");
      }
    } catch (err) {
      log.error("App.jsx", "handleDemoLogin", "Network/Exception during demo login", err);
      console.error(err);
      showSystemToast("⚠️ Failed to contact demo auth server.");
    }
  };


  const handleSignOut = () => {
    if (activeUser) {
      fetch(`/api/auth/google/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeUser.email })
      }).catch(err => console.error("Sign out API error:", err));
    }
    
    // Clear session details
    setActiveUser(null);
    
    // Reset agent modes
    setCalendarMode(null);
    setCalendarEvents([]);
    setCalendarError(null);
    
    setEmailMode(null);
    setEmailConnectedTile(null);
    setEmails([]);
    
    setJobSearchMode(null);
    setActiveJobs([]);
    setApplicationHistory([]);
    setJobBoardTab("feed");
    
    setFinSetup(null);
    setFinExpenses([]);
    
    setNewsKeyword("");
    setNewsItems([]);

    setWellnessWakeTime("07:00");
    setWellnessSleepTime("22:00");
    setWaterCups(0);
    setExerciseMinutes(0);
    localStorage.removeItem("agentos_water_cups");
    localStorage.removeItem("agentos_exercise_minutes");
    
    // Reset tiles back to default disconnected empty states
    setTiles(prev => prev.map(tile => {
      return {
        ...tile,
        status: "empty",
        agent: null,
        gridClass: (tile.id === 1 || tile.id === 2) ? "col-span-1 md:col-span-2 h-[220px]" : tile.gridClass
      };
    }));

    showSystemToast("🔒 Signed out successfully. Local workspace cleared.");
  };

  // Debounced auto-sync preferences to backend server profiles
  useEffect(() => {
    if (!activeUser || loadedProfileEmail !== activeUser.email) return;
    
    const prefs = {
      prefTitles: wizardPrefTitles,
      prefLocation: wizardPrefLocation,
      prefHours: wizardPrefHours,
      prefSkills: wizardSkills,
      prefYOE: wizardYOE,
      prefSeniority: wizardSeniorityPref,
      resumeText: wizardResumeText,
      resumeSkills: wizardResumeSkills,
      resumeExperiences: wizardResumeExperiences,
      resumeFile: wizardResumeFile,
      personalInfo: wizardPersonalInfo,
      newsKeyword,
      finSetup,
      finExpenses,
      finHistory,
      finCurrentMonth,
      calendarMode,
      emailMode,
      jobSearchMode,
      wellnessWakeTime,
      wellnessSleepTime,
      waterCups,
      exerciseMinutes,
      wellnessLastResetDate,
      activeJobs,
      completedEvents
    };

    const delayDebounce = setTimeout(() => {
      fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeUser.email,
          name: activeUser.name,
          picture: activeUser.picture,
          preferences: prefs
        })
      }).catch(err => console.error("Error auto-syncing preferences:", err));
    }, 1000); // 1-second debounce to prevent spamming server on fast typing

    return () => clearTimeout(delayDebounce);
  }, [
    activeUser,
    wizardPrefTitles,
    wizardPrefLocation,
    wizardPrefHours,
    wizardSkills,
    wizardYOE,
    wizardSeniorityPref,
    wizardResumeText,
    wizardResumeSkills,
    wizardResumeExperiences,
    wizardResumeFile,
    wizardPersonalInfo,
    newsKeyword,
    finSetup,
    finExpenses,
    finHistory,
    finCurrentMonth,
    calendarMode,
    emailMode,
    jobSearchMode,
    wellnessWakeTime,
    wellnessSleepTime,
    waterCups,
    exerciseMinutes,
    wellnessLastResetDate,
    activeJobs,
    completedEvents,
    loadedProfileEmail
  ]);

  // Poll for multi-agent orchestrator notifications
  useEffect(() => {
    if (!activeUser) {
      setNotifications([]);
      return;
    }

    const pollOrchestrator = async () => {
      try {
        const res = await fetch(`/api/orchestrator/notifications?email=${encodeURIComponent(activeUser.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.notifications) {
            setNotifications(data.notifications);
          }
        }
        // Background sync emails
        fetchEmails(true);
      } catch (err) {
        console.error("Failed to fetch orchestrator alerts:", err);
      }
    };

    // Run immediately and then every 8 seconds
    pollOrchestrator();
    const timer = setInterval(pollOrchestrator, 8000);
    return () => clearInterval(timer);
  }, [activeUser, activeJobs, finExpenses, emails, newsItems, calendarEvents]);

  const handleNotificationAction = async (notif) => {
    // Check if stagnant follow-up email alert
    if (notif.actionText === "Draft Follow-up Email" || notif.id.startsWith("coord-tracker-followup-")) {
      const companyMatch = notif.message.match(/from\s+([^\s]+(?: [^\s]+)?)\s+for/);
      const titleMatch = notif.message.match(/for\s+"([^"]+)"/);
      const company = companyMatch ? companyMatch[1] : "Hiring Manager";
      const title = titleMatch ? titleMatch[1] : "Software Engineer";
      
      setFollowUpCompany(company);
      setFollowUpTo("recruiter@" + company.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com");
      setFollowUpSubject(`Follow-up: Job Application for ${title} at ${company}`);
      setFollowUpBody(`Dear Hiring Team at ${company},\n\nI hope you are having a great week.\n\nI wanted to follow up on my application for the ${title} position that I submitted recently. I remain very interested in the role and the work you do at ${company}.\n\nPlease let me know if there are any updates or if you need any additional information from my end.\n\nThank you for your time and consideration!\n\nBest regards,\n${wizardPersonalInfo.name || activeUser?.name || "Applicant"}`);
      
      setShowFollowUpModal(true);
      handleDismissNotification(notif.id);
      return;
    }

    // 1. If notif points to a target tile, open it!
    if (notif.actionTile === 1) {
      setIsCalendarOpen(true);
      setCalendarViewOption("3day");
    } else if (notif.actionTile && !notif.payload?.job && !notif.payload?.suggestedEvent) {
      handleOpenModal(notif.actionTile);
    }
    // 2. If it is an external link, open it!
    if (notif.actionUrl) {
      window.open(notif.actionUrl, '_blank');
    }
    // 3. If payload contains data, e.g. auto-filling a job application or event:
    if (notif.payload?.suggestedEvent) {
      const sug = notif.payload.suggestedEvent;
      setEventTitle(sug.title);
      setEventDescription(sug.description);
      setEventLocation(sug.location || "");
      
      const formatToLocalInput = (isoStr) => {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      if (sug.start) {
        setEventStart(formatToLocalInput(sug.start));
      } else {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        tom.setHours(9, 30, 0, 0);
        setEventStart(formatToLocalInput(tom));
      }

      if (sug.end) {
        setEventEnd(formatToLocalInput(sug.end));
      } else {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        tom.setHours(10, 30, 0, 0);
        setEventEnd(formatToLocalInput(tom));
      }
      
      setEventCreateMeet(!!sug.meetLink);
      // Open the Calendar dashboard modal directly!
      setIsCalendarOpen(true);
      setCalendarViewOption("3day");
    }

    if (notif.payload?.job) {
      handleOpenApplyPortal(notif.payload.job);
      setApplyCoverLetter(`Dear Hiring Team,\n\nI am writing to express my strong interest in the "${notif.payload.job.title}" position at ${notif.payload.job.company}.\n\nMy profile matches your technical requirements: ${wizardSkills}.\n\nBest regards,\n${wizardPersonalInfo.name || activeUser?.name || "Applicant"}`);
    }

    handleDismissNotification(notif.id);
  };

  const handleDismissNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch('/api/orchestrator/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email: activeUser?.email || null })
      });
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    if (!text) {
      showSystemToast(`⚠️ Cannot copy empty ${label} value.`);
      return;
    }
    navigator.clipboard.writeText(text);
    showSystemToast(`📋 Copied ${label} to clipboard!`);
  };


  const handleOpenModal = (tileId) => {
    setSelectedTileId(tileId);
    if (tileId === 1) {
      setWizardStep(10);
    } else if (tileId === 2) {
      setWizardStep(31);
    } else if (tileId === 3) {
      setWizardStep(1);
    } else if (tileId === 4) {
      setWizardStep(20);
    } else if (tileId === 5) {
      setWizardStep(50);
    } else {
      setWizardStep(0);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTileId(null);
  };

  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  const handleSendFollowUp = async () => {
    if (!activeUser) {
      showSystemToast("⚠️ Please sign in to send emails.");
      return;
    }
    
    setIsSendingFollowUp(true);
    try {
      const res = await fetch('/api/email/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeUser.email,
          to: followUpTo,
          subject: followUpSubject,
          body: followUpBody,
          company: followUpCompany
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSystemToast(`🚀 Follow-up email sent successfully to ${followUpTo}!`);
        
        // Update local activeJobs state immediately so it reflects "followed_up"
        setActiveJobs(prev => prev.map(job => {
          if (job.company && followUpCompany && job.company.toLowerCase() === followUpCompany.toLowerCase()) {
            return { ...job, status: "followed_up" };
          }
          return job;
        }));
        
        setShowFollowUpModal(false);
      } else {
        let errMsg = data.error || "Google API auth rejected";
        if (errMsg.toLowerCase().includes("scopes") || errMsg.toLowerCase().includes("authentication") || errMsg.toLowerCase().includes("insufficient")) {
          errMsg += " Please disconnect and reconnect your Google account to grant email sending permissions.";
        }
        showSystemToast(`❌ Send failed: ${errMsg}`);
      }
    } catch (err) {
      console.error(err);
      showSystemToast("❌ Failed to contact Gmail relay bridge.");
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const handleSelectAgentFromCatalog = (agent) => {
    if (agent.id === "job_search") {
      setWizardStep(1);
    } else if (agent.id === "calendar_planner") {
      setWizardStep(10);
    } else if (agent.id === "news_feed") {
      setTempNewsKeyword(newsKeyword || "AI breakthroughs");
      setWizardStep(20);
    } else if (agent.id === "email_triage") {
      setWizardStep(31);
    } else if (agent.id === "financial_runway") {
      // If already configured, connect directly
      if (finSetup) {
        connectGenericAgent(agent);
      } else {
        setFinWizardIncome("");
        setFinWizardDeductions("");
        setFinWizardAllocs({ groceries:20, dining:15, entertainment:10, transport:10, misc:10, savings:35 });
        setWizardStep(50);
      }
    } else {
      connectGenericAgent(agent);
    }
  };


  const connectGenericAgent = (agent) => {
    setTiles(prev => prev.map(tile => {
      if (tile.id === selectedTileId) {
        return { 
          ...tile, 
          status: "connecting", 
          agent
        };
      }
      return tile;
    }));
    handleCloseModal();
    const currentTileId = selectedTileId;
    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === currentTileId) {
          return { ...tile, status: "connected" };
        }
        return tile;
      }));
    }, 1500);
  };

  const handleFinishFinancialWizard = (tileId) => {
    const finAgent = AGENT_CATALOG.find(a => a.id === "financial_runway");
    const income = parseFloat(finWizardIncome) || 0;
    const deductions = parseFloat(finWizardDeductions) || 0;
    const spendable = Math.max(0, income - deductions);
    // Compute dollar amounts from percentages
    const allocs = {};
    FIN_CATS.forEach(cat => {
      allocs[cat] = Math.round((finWizardAllocs[cat] / 100) * spendable * 100) / 100;
    });
    const setup = { income, deductions, spendable, allocations: allocs, percentages: { ...finWizardAllocs } };
    setFinSetup(setup);
    localStorage.setItem("agentos_fin_setup", JSON.stringify(setup));
    setFinExpenses([]);

    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId) return { ...tile, status: "connecting", agent: finAgent };
      return tile;
    }));
    handleCloseModal();
    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === tileId) return { ...tile, status: "connected" };
        return tile;
      }));
      showSystemToast("💰 Financial Runway active. Start tracking!");
    }, 1200);
  };

  // PDF Uploader - Leaves fields blank for user typing as requested
  const processExtractedResume = (text) => {
    try {
      const skillsList = [
        "javascript", "typescript", "react", "angular", "vue", "next.js", "node.js", "express", 
        "python", "django", "flask", "fastapi", "java", "spring", "c++", "c#", "ruby", "rails", 
        "php", "laravel", "go", "golang", "rust", "aws", "azure", "gcp", "docker", "kubernetes", 
        "html", "css", "tailwind", "sass", "sql", "mysql", "postgresql", "mongodb", "graphql", 
        "redux", "webpack", "vite", "git", "ci/cd", "testing", "jest", "cypress"
      ];
      
      const foundSkills = [];
      const lowerText = text.toLowerCase();
      skillsList.forEach(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const startBoundary = /^[a-zA-Z0-9]/.test(skill) ? '\\b' : '';
        const endBoundary = /[a-zA-Z0-9]$/.test(skill) ? '\\b' : '';
        const regex = new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
        if (regex.test(lowerText)) {
          foundSkills.push(skill);
        }
      });

      const titlesList = [
        "software engineer", "frontend engineer", "frontend developer", "backend engineer", 
        "backend developer", "full stack engineer", "full stack developer", "web developer", 
        "mobile developer", "devops engineer", "systems engineer", "qa engineer", "data scientist", 
        "data engineer", "ui/ux designer", "product manager", "project manager", "scrum master",
        "tech lead", "technical lead", "engineering manager", "principal engineer", "staff engineer",
        "architect", "junior engineer", "associate engineer", "senior engineer", "senior software engineer"
      ];
      
      const experiences = [];
      const lines = text.split(/[\n\r]+/);
      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        
        titlesList.forEach(title => {
          const regex = new RegExp(`\\b${title}\\b`, 'i');
          if (regex.test(cleanLine)) {
            if (!experiences.includes(cleanLine) && experiences.length < 5) {
              experiences.push(cleanLine);
            }
          }
        });
      });

      let inferredYOE = 0;
      const yoeRegexes = [
        /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i,
        /(\d+)\+?\s*yrs?\s+(?:of\s+)?exp/i,
        /experience\s*:\s*(\d+)\+?\s*years?/i
      ];
      for (const regex of yoeRegexes) {
        const match = text.match(regex);
        if (match) {
          inferredYOE = parseInt(match[1]) || 0;
          break;
        }
      }
      
      if (inferredYOE === 0) {
        const dateRegex = /\b(19\d{2}|20\d{2})\s*[-–—]\s*(20\d{2}|present|current)\b/gi;
        let match;
        let minYear = new Date().getFullYear();
        let maxYear = minYear;
        while ((match = dateRegex.exec(text)) !== null) {
          const start = parseInt(match[1]);
          const endStr = match[2].toLowerCase();
          const end = (endStr === "present" || endStr === "current") ? new Date().getFullYear() : parseInt(match[2]);
          if (start < minYear) minYear = start;
          if (end > maxYear) maxYear = end;
        }
        if (minYear < new Date().getFullYear()) {
          inferredYOE = Math.max(0, maxYear - minYear);
        }
      }
      
      if (inferredYOE === 0) {
        inferredYOE = 2; // Default to 2 YOE if not found
      }

      let inferredSeniority = "mid";
      if (inferredYOE > 0 && inferredYOE <= 2) {
        inferredSeniority = "junior";
      } else if (inferredYOE >= 6) {
        inferredSeniority = "senior";
      } else {
        const seniorCount = (text.match(/\b(senior|lead|principal|staff|manager)\b/gi) || []).length;
        const juniorCount = (text.match(/\b(junior|associate|intern|entry)\b/gi) || []).length;
        if (seniorCount > juniorCount + 2) {
          inferredSeniority = "senior";
        } else if (juniorCount > seniorCount + 1) {
          inferredSeniority = "junior";
        }
      }

      const headerText = text.slice(0, 1000);
      const emailMatch = headerText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const phoneMatch = headerText.match(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
      const nameMatch = headerText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);

      setWizardResumeText(text);
      setWizardResumeSkills(foundSkills);
      setWizardResumeExperiences(experiences);
      setWizardYOE(inferredYOE);
      setWizardSeniorityPref(inferredSeniority);
      
      if (foundSkills.length > 0) {
        setWizardSkills(foundSkills.join(", "));
      }
      if (nameMatch) {
        setWizardPersonalInfo(prev => ({ ...prev, name: nameMatch[1] }));
      }
      if (emailMatch) {
        setWizardPersonalInfo(prev => ({ ...prev, email: emailMatch[0] }));
      }
      if (phoneMatch) {
        setWizardPersonalInfo(prev => ({ ...prev, phone: phoneMatch[0] }));
      }

      setAppTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Resume parsed successfully!`,
        `[${new Date().toLocaleTimeString()}] Extracted YOE: ${inferredYOE} | Seniority: ${inferredSeniority.toUpperCase()}`,
        `[${new Date().toLocaleTimeString()}] Skills identified: [${foundSkills.slice(0, 8).join(", ")}]`,
        `[${new Date().toLocaleTimeString()}] Previous Experiences indexed: ${experiences.length} roles found.`
      ]);

      setIsParsingResume(false);
      showSystemToast(`📄 Resume parsed: ${inferredYOE} YOE, ${inferredSeniority} tier inferred.`);
    } catch (err) {
      console.error("Resume analysis failed:", err);
      setIsParsingResume(false);
      showSystemToast("⚠️ PDF parsed but metadata extraction failed. Using defaults.");
      setWizardYOE(2);
      setWizardSeniorityPref("junior");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setWizardResumeFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    });
    setIsParsingResume(true);
    setParserStatusText("Extracting PDF text streams...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        
        if (!window.pdfjsLib && !window['pdfjs-dist/build/pdf']) {
          setParserStatusText("Loading PDF.js engine...");
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          document.head.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = () => {
              const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
              if (lib) {
                try {
                  // Bypass CORS issues by creating a Blob URL for the worker script
                  const workerCode = `importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js');`;
                  const blob = new Blob([workerCode], { type: 'application/javascript' });
                  lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
                } catch (e) {
                  console.warn("Could not create Blob worker, using direct CDN URL:", e);
                  lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                }
                resolve();
              } else {
                reject(new Error("pdfjsLib not found on window"));
              }
            };
            script.onerror = () => reject(new Error("Failed to load PDF.js script"));
          });
        }

        setParserStatusText("Parsing text layers...");
        const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        let extractedText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          extractedText += pageText + "\n";
        }
        
        setParserStatusText("Running semantic analyzer...");
        processExtractedResume(extractedText);
        
      } catch (err) {
        console.error("PDF.js parsing failed, using fallback:", err);
        setParserStatusText("Running fallback text parser...");
        
        const fallbackText = await new Promise((resolve) => {
          const textReader = new FileReader();
          textReader.onload = (txtEvent) => resolve(txtEvent.target.result || "");
          textReader.onerror = () => resolve("");
          textReader.readAsText(file);
        });
        
        // Construct smart fallback text based on filename details
        let simulatedText = `Resume for Developer: ${file.name}.\n`;
        const fileNameLower = file.name.toLowerCase();
        
        let fileYOE = 2;
        const yoeMatch = fileNameLower.match(/(\d+)\+?\s*(?:yrs|years)/);
        if (yoeMatch) {
          fileYOE = parseInt(yoeMatch[1]);
        } else if (fileNameLower.includes("senior") || fileNameLower.includes("lead") || fileNameLower.includes("architect")) {
          fileYOE = 8;
        } else if (fileNameLower.includes("mid")) {
          fileYOE = 4;
        } else if (fileNameLower.includes("junior") || fileNameLower.includes("intern")) {
          fileYOE = 1;
        }
        simulatedText += `Experience: ${fileYOE} years of professional experience.\n`;

        let skillsFound = ["react", "typescript", "javascript", "css"];
        const potentialSkills = [
          "python", "django", "node", "express", "aws", "docker", "kubernetes", "java", "sql", 
          "go", "golang", "rust", "next.js", "angular", "vue", "tailwind", "graphql"
        ];
        potentialSkills.forEach(skill => {
          if (fileNameLower.includes(skill)) {
            skillsFound.push(skill);
          }
        });
        simulatedText += `Skills: ${skillsFound.join(", ")}.\n`;

        let titleFound = "Software Engineer";
        if (fileNameLower.includes("frontend")) {
          titleFound = "Frontend Engineer";
        } else if (fileNameLower.includes("backend")) {
          titleFound = "Backend Engineer";
        } else if (fileNameLower.includes("fullstack") || fileNameLower.includes("full stack")) {
          titleFound = "Full Stack Engineer";
        } else if (fileNameLower.includes("lead")) {
          titleFound = "Lead Software Engineer";
        } else if (fileNameLower.includes("senior")) {
          titleFound = "Senior Software Engineer";
        }
        simulatedText += `Previous Experiences: ${titleFound} at TechCorp, Developer at WebInc.\n`;
        simulatedText += `Name: Alex Rivera\nEmail: demouser@gmail.com\nPhone: (555) 123-4567\n`;

        const asciiText = fallbackText ? fallbackText.replace(/[^\x20-\x7E\n\r]/g, " ") : "";
        const cleanText = simulatedText + "\n" + asciiText;
        processExtractedResume(cleanText);
      }
    };
    reader.onerror = (err) => {
      console.error("File reading error:", err);
      setIsParsingResume(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // Provisions job search agent and initiates backend scrape sync
  const handleFinishJobSearchWizard = () => {
    const jobAgent = AGENT_CATALOG.find(a => a.id === "job_search");
    
    // Auto-deploy the agent directly!
    localStorage.setItem("agentos_job_search_mode", "active");
    setJobSearchMode("active");

    setTiles(prev => prev.map(tile => {
      if (tile.id === 3 || tile.id === selectedTileId) {
        return { 
          ...tile, 
          status: "connecting", 
          agent: jobAgent
        };
      }
      return tile;
    }));

    handleCloseModal();

    const currentTileId = selectedTileId;
    setTimeout(() => {
      setTiles(prev => prev.map(tile => {
        if (tile.id === 3 || tile.id === currentTileId) {
          return { ...tile, status: "connected" };
        }
        return tile;
      }));
      // Trigger initial real scraping call
      triggerSyncRefresh();
      showSystemToast("💼 Job search agent deployed successfully!");
    }, 1500);
  };

  const handleDisconnectAgent = async (tileId, e) => {
    e.stopPropagation();
    
    const targetTile = tiles.find(t => t.id === tileId);
    if (targetTile?.agent?.id === "calendar_planner") {
      try {
        await fetch("/api/auth/google/disconnect", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: activeUser?.email })
        });
      } catch (err) {
        console.error("Disconnect error:", err);
      }
      localStorage.removeItem("agentos_calendar_mode");
      localStorage.removeItem("agentos_calendar_connected_tile");
      setCalendarEvents([]);
      setCalendarMode(null);
    }

    if (targetTile?.agent?.id === "email_triage") {
      localStorage.removeItem("agentos_email_mode");
      localStorage.removeItem("agentos_email_connected_tile");
      setEmails([]);
      setEmailMode(null);
      setEmailConnectedTile(null);
      setSelectedEmail(null);
    }

    if (targetTile?.agent?.id === "financial_runway") {
      localStorage.removeItem("agentos_fin_setup");
      localStorage.removeItem("agentos_fin_expenses_" + finCurrentMonth);
      setFinSetup(null);
      setFinExpenses([]);
      setFinShowLogForm(false);
      setIsFinExpanded(false);
    }

    const defaultGridClasses = {
      1: "col-span-1 md:col-span-2 h-[220px]",
      2: "col-span-1 md:row-span-2 h-full min-h-[220px] md:min-h-0",
      3: "col-span-1 h-[220px]",
      4: "col-span-1 h-[220px]",
      5: "col-span-1 md:col-span-2 h-[220px]",
      6: "col-span-1 h-[220px]"
    };

    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId) {
        return { 
          ...tile, 
          status: "empty", 
          agent: null,
          gridClass: defaultGridClasses[tileId] // Reset grid size
        };
      }
      return tile;
    }));
    
    if (targetTile?.agent?.id === "job_search") {
      setActiveJobs([]);
    }
  };


  const getAvatarState = () => {
    const hour = currentTime.getHours();
    const isSleepTime = hour < 7 || hour >= 22;
    
    const nowTime = currentTime.getTime();
    let currentEvent = null;
    
    for (const e of calendarEvents) {
      const start = new Date(e.start).getTime();
      const end = new Date(e.end).getTime();
      if (nowTime >= start && nowTime <= end) {
        currentEvent = e;
        break;
      }
    }

    if (isSleepTime || (currentEvent && currentEvent.title.toLowerCase().includes("sleep"))) {
      return {
        id: "sleep",
        label: "Resting / Sleeping",
        emoji: "💤",
        filter: "grayscale opacity-75 contrast-90",
        aura: "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/20",
        bg: "bg-blue-950/20"
      };
    }

    const isExerciseScheduled = currentEvent && (
      currentEvent.title.toLowerCase().includes("workout") || 
      currentEvent.title.toLowerCase().includes("exercise") || 
      currentEvent.title.toLowerCase().includes("walk") ||
      currentEvent.title.toLowerCase().includes("jog")
    );
    if (isExerciseScheduled) {
      return {
        id: "exercise",
        label: "Exercising",
        emoji: "🏃‍♂️",
        filter: "saturate-125 contrast-105",
        aura: "shadow-[0_0_25px_rgba(239,68,68,0.5)] border-red-500/40",
        bg: "bg-red-950/20"
      };
    }

    const isFocusScheduled = currentEvent && (
      currentEvent.title.toLowerCase().includes("focus") || 
      currentEvent.title.toLowerCase().includes("deep work") || 
      currentEvent.title.toLowerCase().includes("study") || 
      currentEvent.title.toLowerCase().includes("coding") ||
      currentEvent.title.toLowerCase().includes("programming")
    );
    if (isFocusScheduled) {
      return {
        id: "focus",
        label: "Deep Focus",
        emoji: "🎧",
        filter: "saturate-110",
        aura: "shadow-[0_0_25px_rgba(99,102,241,0.5)] border-indigo-500/40",
        bg: "bg-indigo-950/20"
      };
    }

    const isStressScheduled = currentEvent && (
      currentEvent.title.toLowerCase().includes("interview") || 
      currentEvent.title.toLowerCase().includes("exam") || 
      currentEvent.title.toLowerCase().includes("test") || 
      currentEvent.title.toLowerCase().includes("presentation") || 
      currentEvent.title.toLowerCase().includes("deadline")
    );
    
    let isMeetingSoon = false;
    for (const e of calendarEvents) {
      const start = new Date(e.start).getTime();
      const diffMins = (start - nowTime) / (60 * 1000);
      if (diffMins > 0 && diffMins <= 15) {
        isMeetingSoon = true;
        break;
      }
    }

    if (isStressScheduled || isMeetingSoon) {
      return {
        id: "stressed",
        label: "Under Pressure",
        emoji: "😰",
        filter: "brightness-95 contrast-105",
        aura: "shadow-[0_0_25px_rgba(244,63,94,0.6)] border-rose-500/40 animate-pulse",
        bg: "bg-rose-950/20"
      };
    }

    // Either healthy habit alone is enough to reach "happy" — previously this required
    // both water AND exercise together, so exercising without also hitting 6 cups of
    // water never moved the needle, making it look like only water mattered.
    if (waterCups >= 6 || exerciseMinutes >= 15) {
      return {
        id: "happy",
        label: "Peak Performance",
        emoji: "🏆",
        filter: "saturate-150 brightness-110",
        aura: "shadow-[0_0_35px_rgba(245,158,11,0.7)] border-amber-400/80 border-[2px]",
        bg: "bg-amber-950/20"
      };
    }

    return {
      id: "leisure",
      label: "Steady & Chill",
      emoji: "🙂",
      filter: "contrast-100",
      aura: "shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/20",
      bg: "bg-[#0f172a]"
    };
  };

  const getDayProgress = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    const startOfDay = 7 * 60; // 7:00 AM
    const endOfDay = 22 * 60;  // 10:00 PM
    
    if (totalMinutes < startOfDay) return 0;
    if (totalMinutes > endOfDay) return 100;
    
    const progress = ((totalMinutes - startOfDay) / (endOfDay - startOfDay)) * 100;
    return Math.round(progress);
  };

  const getDynamicQuote = () => {
    const day = currentTime.getDay(); 
    const hour = currentTime.getHours();
    
    // Monday morning (Monday, 6 AM to 12 PM)
    if (day === 1 && hour >= 6 && hour < 12) {
      return {
        quote: "Beat the Monday blues! Start your week strong with focused blocks. You can do this!",
        tag: "Monday Blues Breaker"
      };
    }
    
    // General Morning (6 AM to 11 AM)
    if (hour >= 6 && hour < 11) {
      return {
        quote: "Rise and shine! Design your priorities early and set the tone for a productive day.",
        tag: "Morning Focus"
      };
    }
    
    // Mid-day / Lunch (11 AM to 1:30 PM)
    if (hour >= 11 && hour < 13.5) {
      return {
        quote: "Time to hydrate and nourish! Take a step back, recharge, and step away from the desk.",
        tag: "Recharge Block"
      };
    }
    
    // Afternoon slump (1:30 PM to 4:30 PM)
    if (hour >= 13.5 && hour < 16.5) {
      return {
        quote: "Stay alert, stay hydrated! Log a quick cup of water or stand up and stretch to keep the momentum going.",
        tag: "Energy Boost"
      };
    }
    
    // End of day push (4:30 PM to 7:00 PM)
    if (hour >= 16.5 && hour < 19) {
      return {
        quote: "Final stretch! Push through your remaining tasks and prep your calendar for tomorrow.",
        tag: "End of Day Push"
      };
    }
    
    // Evening / Wind down (7 PM to 10 PM)
    if (hour >= 19 && hour < 22) {
      return {
        quote: "Excellent work today. Clear your checklist, relax, and give your mind space to recharge.",
        tag: "Evening Wind Down"
      };
    }
    
    // Night rest (10 PM to 6 AM)
    return {
      quote: "Sleep is the ultimate productivity hack. Rest up, you've earned a good night's sleep.",
      tag: "Deep Sleep & Rest"
    };
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const handleOpenApplyPortal = (job, e) => {
    if (e) e.stopPropagation();
    setSelectedApplyJob(job);
    setApplyPersonalInfo({ ...wizardPersonalInfo });
    setShowReceiptAccordion(false);
    setAppSubmissionSuccess(false);
    setIsSubmittingApp(false);
  };


  const companyDescriptionSelector = (companyName) => {
    const compObj = AGENT_CATALOG.find(c => c.name === companyName) || {};
    return compObj.desc || `${companyName}'s scaling software engineering division`;
  };

  // Submits application data payload to backend /api/apply
  const handleSubmitApplication = async (e) => {
    if (e) e.preventDefault();
    setIsSubmittingApp(true);
    
    // Set scrolling terminal logs
    setAppTerminalLogs([
      `[${new Date().toLocaleTimeString()}] Connecting to AgentOS secure gateway...`,
    ]);

    setTimeout(() => {
      setAppTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Packaging resume payload (Base64) & autofill fields...`]);
    }, 250);

    setTimeout(() => {
      setAppTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Resolving SMTP transporter endpoint route...`]);
    }, 550);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: selectedApplyJob,
          applicant: applyPersonalInfo,
          resumeUsed: wizardResumeFile ? wizardResumeFile.name : "Default Resume"
        })
      });
      const data = await res.json();

      setTimeout(() => {
        if (res.ok) {
          setAppTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] SUCCESS: Application written to local registry.`,
            `[${new Date().toLocaleTimeString()}] Transmission Code: 201 Created`,
            `[${new Date().toLocaleTimeString()}] Receipt ID: ${data.application.applicationId}`,
            `[${new Date().toLocaleTimeString()}] Email Sent: Confirmation dispatched to ${data.recipient}`,
            data.emailPreviewUrl ? `[${new Date().toLocaleTimeString()}] Ethereal Preview URL: ${data.emailPreviewUrl}` : null
          ].filter(Boolean));
          setAppReceiptData(data.application);
          setAppSubmissionSuccess(true);
          
          // Fetch updated application history from backend
          if (activeUser?.email) {
            fetchApplicationHistory(activeUser.email);
          }
          
          // Mark this job status as 'applied' in state
          setActiveJobs(prev => prev.map(job => {
            if (job.id === selectedApplyJob.id) {
              return { ...job, status: "applied" };
            }
            return job;
          }));

          // Trigger top-right email confirmation notification toast
          showSystemToast(`✉ Confirmation email generated! Preview link logged in console.`);
        } else {
          setAppTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] HTTP POST /api/apply - Error ${res.status}`,
            `[${new Date().toLocaleTimeString()}] Error Details: ${data.error || 'Autofill packet rejected'}`
          ]);
        }
        setIsSubmittingApp(false);
      }, 1200);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setAppTerminalLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Fatal: Failed to connect to server backend.`
        ]);
        setIsSubmittingApp(false);
      }, 1200);
    }
  };


  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 flex flex-col select-none overflow-x-hidden pb-10">
      
      {/* High Match Job Alert Banner */}
      {highMatchAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xl px-4 animate-[bounce_1s_1] transition-all">
          <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/90 via-slate-950/95 to-red-950/90 p-3.5 shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            {/* Cyber Scan Lines effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 animate-pulse" />
            
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base shrink-0 animate-ping">🚨</span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-red-400 uppercase tracking-widest font-mono text-[9px] flex items-center gap-1.5">
                  !!! NEW JOB MATCH ALERT !!!
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                </span>
                <span className="text-white font-medium leading-tight truncate">
                  New Match: <span className="text-amber-400 font-semibold">{highMatchAlert.title}</span> at <span className="text-slate-200">{highMatchAlert.company}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Verified Relevancy Index: <span className="text-emerald-400 font-bold">{highMatchAlert.score}%</span>
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setHighMatchAlert(null)}
              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-slate-300 hover:text-white transition-all text-[9px] font-mono tracking-wider shrink-0 uppercase"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Ambient Multi-Agent Notification Feed Banner */}
      {!highMatchAlert && notifications.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xl px-4 animate-[slideDown_0.4s_ease-out] transition-all">
          {(() => {
            const currentNotif = notifications[0];
            const isWarning = currentNotif.type === 'warning';
            const isSuccess = currentNotif.type === 'success';
            
            let borderColor = 'border-blue-500/30';
            let bgGradients = 'from-blue-950/80 via-slate-950/95 to-blue-950/80';
            let glowColor = 'shadow-[0_0_30px_rgba(59,130,246,0.15)]';
            let leftBar = 'bg-blue-500';
            let tagColor = 'text-blue-400';
            let actionBtnStyle = 'bg-blue-950/60 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/60 text-blue-300';
            
            if (isWarning) {
              borderColor = 'border-amber-500/30';
              bgGradients = 'from-amber-950/80 via-slate-950/95 to-amber-950/80';
              glowColor = 'shadow-[0_0_30px_rgba(245,158,11,0.15)]';
              leftBar = 'bg-amber-500';
              tagColor = 'text-amber-400';
              actionBtnStyle = 'bg-amber-950/60 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/60 text-amber-300';
            } else if (isSuccess) {
              borderColor = 'border-emerald-500/30';
              bgGradients = 'from-emerald-950/80 via-slate-950/95 to-emerald-950/80';
              glowColor = 'shadow-[0_0_30px_rgba(16,185,129,0.15)]';
              leftBar = 'bg-emerald-500';
              tagColor = 'text-emerald-400';
              actionBtnStyle = 'bg-emerald-950/60 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300';
            }
            
            return (
              <div className={`relative overflow-hidden rounded-xl border ${borderColor} bg-gradient-to-r ${bgGradients} p-3.5 ${glowColor} backdrop-blur-md flex items-center justify-between gap-3 text-xs`}>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftBar} animate-pulse`} />
                
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0 animate-pulse">🤖</span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`font-bold ${tagColor} uppercase tracking-widest font-mono text-[9px] flex items-center gap-1.5`}>
                      {currentNotif.title}
                      <span className={`h-1.5 w-1.5 rounded-full ${leftBar} animate-ping`} />
                      {notifications.length > 1 && (
                        <span className="text-slate-500 font-normal">({notifications.length} alerts pending)</span>
                      )}
                    </span>
                    {currentNotif.payload?.job ? (
                      <div className="flex flex-col gap-1.5 mt-1 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 min-w-[280px]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-slate-200 text-[11px] truncate max-w-[180px]">{currentNotif.payload.job.title}</span>
                          <span className="font-mono text-[9px] text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/25">{currentNotif.payload.job.score}% Match</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                          <span className="truncate max-w-[130px]">{currentNotif.payload.job.company}</span>
                          <span className="truncate max-w-[130px]">{currentNotif.payload.job.location}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-white font-medium leading-tight">
                        {currentNotif.message}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {currentNotif.payload?.job?.url && (
                    <a
                      href={currentNotif.payload.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded border border-white/5 hover:border-white/20 bg-slate-900/60 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-[9px] font-mono tracking-wider uppercase active:scale-95 flex items-center"
                    >
                      Link ↗
                    </a>
                  )}
                  {currentNotif.actionText && (
                    <button
                      onClick={() => handleNotificationAction(currentNotif)}
                      className={`px-2.5 py-1.5 rounded border ${actionBtnStyle} transition-all text-[9px] font-mono font-bold tracking-wider uppercase active:scale-95`}
                    >
                      {currentNotif.actionText}
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissNotification(currentNotif.id)}
                    className="px-2 py-1.5 rounded bg-slate-900/60 hover:bg-white/5 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all text-[9px] font-mono tracking-wider uppercase"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Dynamic Slide-in System Notification Toast */}
      <div 
        className={`fixed top-6 right-6 z-50 glass-modal border-emerald-500/20 bg-emerald-950/80 text-emerald-400 p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm transition-all duration-500 ease-out transform ${
          systemNotification ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <Mail className="w-5 h-5 text-emerald-400 animate-[bounce_1.5s_infinite] shrink-0" />
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">OS SYSTEM NOTIFICATION</span>
          <span>{systemNotification}</span>
        </div>
        <button 
          onClick={() => setSystemNotification("")}
          className="text-emerald-500 hover:text-white ml-2 p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Navbar: Unified Quotes, Progress, Avatar, Water Grid, Workout, and Settings */}
      <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between font-sans">
        
        {/* Left Side: Quotes & Day Progress */}
        <div className="flex-1 flex flex-col gap-1 min-w-0 max-w-3xl pr-6">
          {(() => {
            const { quote, tag } = getDynamicQuote();
            const progress = getDayProgress();
            return (
              <>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="text-[8px] uppercase font-mono font-bold text-indigo-400 tracking-wider shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                  <p className="text-slate-300 text-[11px] italic leading-snug">
                    "{quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[8px] font-mono text-slate-500 shrink-0 uppercase tracking-widest">Day Progress</span>
                  <div className="flex-1 h-1 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 shrink-0">{progress}%</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Right Side: Avatar, Water Grid, Workout, and Configure Gear */}
        <div className="flex items-center gap-5 shrink-0 ml-auto select-none">
          
          {/* Avatar widget */}
          {(() => {
            const avatarState = getAvatarState();
            return (
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={(e) => { e.stopPropagation(); setIsAvatarSettingsOpen(true); }}
              >
                {/* Speech Bubble / Tooltip on hover */}
                <div className="absolute bottom-full right-0 mb-2 w-52 p-3 rounded-xl bg-slate-950/95 border border-indigo-500/30 shadow-[0_4px_16px_rgba(99,102,241,0.2)] text-[10px] text-slate-200 leading-normal pointer-events-none opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 origin-bottom-right z-50">
                  <div className="relative flex flex-col gap-1">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="font-bold text-indigo-400 font-mono text-[9px] uppercase">State: {avatarState.label}</span>
                      <span className="font-bold text-emerald-400 font-mono text-[9px]">{healthScore}%</span>
                    </div>
                    <span className="text-slate-300 italic text-[9.5px] mt-0.5 leading-snug">
                      {(() => {
                        const mantras = {
                          sleep: "Sweet dreams! Resting is when your mind consolidates wins. Sleep well, you've earned it! 🌙",
                          stressed: "Breathe in, breathe out. You are capable, strong, and will get through this! Take a deep breath. 🌸",
                          focus: "You are in the zone! Distractions are temporary, but your achievements are permanent. Keep going! 🎯",
                          exercise: "Movement is medicine! Every step and stretch makes you stronger and happier. Keep active! 🏃‍♂️",
                          happy: "You are absolutely glowing! Celebrating your momentum today. Keep shining bright! 🏆",
                          leisure: "Enjoy the present moment. Balance is key to long-term success. Take it easy! 🍀"
                        };
                        return mantras[avatarState.id] || mantras.leisure;
                      })()}
                    </span>
                    {/* Tiny arrow pointing down */}
                    <div className="absolute -bottom-[16px] right-3.5 w-2 h-2 bg-[#0a0a0f] border-r border-b border-indigo-500/30 transform rotate-45" />
                  </div>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:border-indigo-400/40">
                  <AvatarWidget state={avatarState.id} healthScore={healthScore} mascotReaction={mascotReaction} isNavbar={true} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[9px] shadow-sm">
                  {avatarState.emoji}
                </span>
              </div>
            );
          })()}

          {/* Water Grid */}
          {activeUser && (
            <div className="flex flex-col gap-0.5 shrink-0 border-l border-white/5 pl-5 pr-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono tracking-wider uppercase">
                <span>Water</span>
                <span className="text-cyan-400 font-bold ml-2 font-mono">{waterCups}/8 Cups</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const isFilled = waterCups >= idx + 1;
                  const isNext = idx === waterCups;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!activeUser) {
                          showSystemToast("🔒 Sign in with Google to log habits!");
                          return;
                        }
                        setWaterCups(isFilled ? idx : idx + 1);
                        if (!isFilled) setMascotReaction("water");
                      }}
                      title={isFilled ? `Undo Cup ${idx + 1}` : `Log Cup ${idx + 1}`}
                      className={`relative transition-all duration-300 hover:scale-125 active:scale-90 ${isNext ? "animate-pulse" : ""}`}
                    >
                      <svg viewBox="0 0 20 26" className="w-3.5 h-4.5" fill="none">
                        <path
                          d="M3 5 L4.5 23 Q4.5 24 5.5 24 L14.5 24 Q15.5 24 15.5 23 L17 5 Z"
                          fill={isFilled ? "url(#cupFill)" : "transparent"}
                          stroke={isFilled ? "#22d3ee" : "#334155"}
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path d="M2 5 L18 5" stroke={isFilled ? "#22d3ee" : "#475569"} strokeWidth="1.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="cupFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0e7490" stopOpacity="0.95"/>
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      {isFilled && <span className="absolute inset-0 rounded blur-sm bg-cyan-400/20 pointer-events-none" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workout Log */}
          {activeUser && (
            <div className="flex items-center gap-2 border-l border-white/5 pl-5 shrink-0 animate-fadeIn">
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">Workout</span>
                <span className="text-[10px] text-slate-200 font-bold font-mono">🏃 {exerciseMinutes}m</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    if (!activeUser) {
                      showSystemToast("🔒 Sign in with Google to log workouts!");
                      return;
                    }
                    setExerciseMinutes(prev => Math.max(0, prev - 15));
                  }}
                  className="w-4.5 h-4.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[9px] font-bold text-slate-400 hover:text-white flex items-center justify-center active:scale-95"
                >
                  -
                </button>
                <button
                  onClick={() => {
                    if (!activeUser) {
                      showSystemToast("🔒 Sign in with Google to log workouts!");
                      return;
                    }
                    setExerciseMinutes(prev => prev + 15);
                    showSystemToast("⚡ Logged 15m exercise!");
                  }}
                  className="px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[9px] font-bold text-white shadow-md shadow-indigo-600/10"
                >
                  +15m
                </button>
              </div>
            </div>
          )}

          {/* Scoped User Authentication Session control */}
          <div className="shrink-0 flex items-center pl-5 border-l border-white/5">
            {!activeUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoogleLogin}
                  className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/60 text-indigo-300 hover:text-white transition-all duration-300 text-[10px] font-mono tracking-wider font-semibold uppercase flex items-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  SIGN IN WITH GOOGLE
                </button>
                <button
                  onClick={handleDemoLogin}
                  className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/60 text-emerald-300 hover:text-white transition-all duration-300 text-[10px] font-mono tracking-wider font-semibold uppercase flex items-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0"
                >
                  <span>⚡</span>
                  DEMO LOGIN
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] font-bold text-white font-mono">{activeUser.name || "Agent User"}</span>
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5 max-w-[120px] truncate">{activeUser.email}</span>
                </div>
                
                <div className="relative shrink-0">
                  {activeUser.picture ? (
                    <img 
                      src={activeUser.picture} 
                      alt={activeUser.name} 
                      className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-indigo-500/40 bg-indigo-950 flex items-center justify-center text-[11px] font-bold text-indigo-400 font-mono uppercase">
                      {activeUser.name ? activeUser.name.slice(0, 2) : "US"}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-[#0a0a0f] shadow-sm animate-pulse" />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="p-1 px-2 rounded border border-red-500/20 bg-red-950/20 hover:bg-red-500/20 text-red-400 hover:text-white transition-all text-[8px] font-mono tracking-wider font-semibold uppercase active:scale-95"
                  title="Sign Out of Session Profile"
                >
                  SIGN OUT
                </button>
              </div>
            )}
          </div>

          {/* Configure Gear */}
          <div className="shrink-0 flex items-center justify-end pl-5 border-l border-white/5">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 text-slate-400 hover:text-white transition-all duration-300 active:scale-95 shrink-0"
              title="Configure Agents"
            >
              <Settings className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
            </button>
          </div>


        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow w-full relative overflow-hidden select-none">
        
        {/* Left Sidebar */}
        <div 
          onMouseEnter={() => setLeftHovered(true)}
          onMouseLeave={() => setLeftHovered(false)}
          className={`fixed left-0 top-16 bottom-0 w-[450px] bg-[#070a13]/95 border-r border-indigo-500/20 backdrop-blur-lg z-30 transition-transform duration-300 ease-out flex flex-col p-4 pb-6 gap-3 overflow-y-auto ${
            isLeftOpen ? 'translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.85)]' : '-translate-x-[434px]'
          }`}
        >
            {/* 5. Calendar Planner Card (with Daily Focus suggestions embedded) */}
            <div className={`flex-[2] ${calendarMode === null ? 'min-h-[220px]' : 'min-h-[420px]'} bg-slate-950/65 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]`}>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    📅
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight">Calendar Planner</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${calendarMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                        {calendarMode ? 'Google Calendar' : 'Disconnected'}
                      </span>
                    </div>
                    </div>
                  </div>
                  {calendarMode && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center bg-slate-900/80 border border-white/5 rounded-lg p-0.5 text-[8px] font-mono shrink-0 select-none">
                        {[
                          { id: "3day", label: "3-Day" },
                          { id: "week", label: "Week" },
                          { id: "list", label: "List" }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setCalendarViewOption(opt.id);
                              localStorage.setItem("agentos_calendar_view_option", opt.id);
                            }}
                            className={`px-1.5 py-0.5 rounded transition-all ${calendarViewOption === opt.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Expand Calendar"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowCalSettings(!showCalSettings)}
                        className={`p-1.5 rounded-lg border transition-all duration-200 ${showCalSettings ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                        title="Calendar Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await fetch("/api/auth/google/disconnect", { 
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: activeUser?.email })
                            });
                          } catch (err) {
                            console.error("Disconnect error:", err);
                          }
                          localStorage.removeItem("agentos_calendar_mode");
                          localStorage.removeItem("agentos_calendar_connected_tile");
                          setCalendarEvents([]);
                          setCalendarMode(null);
                          setShowCalSettings(false);
                          showSystemToast("📅 Calendar disconnected.");
                        }}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200"
                        title="Disconnect Calendar"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                {showCalSettings ? (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden pt-2 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-2.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Calendar Config</h4>
                      
                      {/* Wellness profile inputs inline */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-2">
                          <div className="flex-1 flex flex-col gap-0.5">
                            <label className="text-[9px] uppercase font-mono text-slate-500">Wake Time</label>
                            <input
                              type="text"
                              value={wellnessWakeTime}
                              onChange={(e) => setWellnessWakeTime(e.target.value)}
                              placeholder="e.g. 07:00"
                              className="w-full px-2 py-0.5 rounded bg-slate-950 border border-white/10 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5">
                            <label className="text-[9px] uppercase font-mono text-slate-500">Sleep Time</label>
                            <input
                              type="text"
                              value={wellnessSleepTime}
                              onChange={(e) => setWellnessSleepTime(e.target.value)}
                              placeholder="e.g. 22:00"
                              className="w-full px-2 py-0.5 rounded bg-slate-950 border border-white/10 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500">Diet Goal</label>
                          <input
                            type="text"
                            value={wellnessDiet}
                            onChange={(e) => setWellnessDiet(e.target.value)}
                            placeholder="e.g. Keto, high-protein"
                            className="w-full px-2 py-0.5 rounded bg-slate-950 border border-white/10 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500">Exercise Goal</label>
                          <input
                            type="text"
                            value={wellnessExercise}
                            onChange={(e) => setWellnessExercise(e.target.value)}
                            placeholder="e.g. 30 min cardio daily"
                            className="w-full px-2 py-0.5 rounded bg-slate-950 border border-white/10 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 border-t border-white/5 pt-2 mt-2">
                      <button
                        onClick={() => {
                          setShowCalSettings(false);
                          fetchWellnessPlan();
                          showSystemToast("📅 Focus schedule goals updated!");
                        }}
                        className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-all"
                      >
                        Save & Re-Optimize ✓
                      </button>
                    </div>
                  </div>
                ) : calendarMode === null ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-center py-4 px-2 select-none">
                    <span className="text-2xl opacity-75">📅</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-300">Schedule Gaps Optimizer</span>
                      <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">
                        Please sign in with Google from the top navbar to sync your calendar events and optimize focus routines.
                      </p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const displayDays = [];
                    const count = calendarViewOption === "week" ? 7 : 3;
                    for (let i = 0; i < count; i++) {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      displayDays.push(d);
                    }
                    const gridWidthClass = calendarViewOption === "week" ? "w-[560px]" : "w-full";
                    
                    if (calendarViewOption === "list") {
                      return (
                        <div className="flex-1 flex flex-col overflow-hidden text-xs h-full text-slate-300 mt-2 pr-1">
                          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2.5 scrollbar-thin">
                            {/* Events list */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1 px-1">Upcoming Events</span>
                              {calendarEvents.length === 0 ? (
                                <div className="text-center py-2 text-[9px] text-slate-500 italic">No events on schedule.</div>
                              ) : (
                                calendarEvents.slice(0, 4).map((event) => {
                                  const dateObj = new Date(event.start);
                                  const isDone = completedEvents.includes(event.id);
                                  const isExercise = event.title.toLowerCase().match(/(workout|exercise|walk|jog|run|gym)/);
                                  return (
                                    <div 
                                      key={event.id} 
                                      onClick={() => handleSelectEventForEdit(event)}
                                      className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                                        isDone 
                                          ? "border-emerald-500/10 bg-emerald-950/10 text-slate-500 line-through opacity-70" 
                                          : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-amber-500/30"
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <span className={`text-[10px] font-semibold block truncate ${isDone ? "text-slate-500" : "text-slate-200"}`}>{event.title}</span>
                                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleCompleteEvent(event); }}
                                        className={`p-1.5 rounded-lg border transition-all ${
                                          isDone 
                                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                                            : "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent"
                                        }`}
                                        title={isDone ? "Mark Uncompleted" : isExercise ? "Log workout done!" : "Mark Completed"}
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* AI Focus Gaps / suggestions */}
                            <div className="border-t border-white/5 pt-2 flex flex-col gap-1 font-sans">
                              <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1 px-1">
                                <span>AI Focus Recommendations</span>
                                {wellnessPlan?.suggestions?.length > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleScheduleAllSuggestions(); }}
                                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                                  >
                                    Accept All
                                  </button>
                                )}
                              </div>

                              {!wellnessPlan || !wellnessPlan.suggestions || wellnessPlan.suggestions.length === 0 ? (
                                <div className="text-center py-3 text-[9px] text-slate-500 italic font-mono flex flex-col items-center gap-1.5">
                                  <span>No suggestions computed yet.</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); fetchWellnessPlan(); }}
                                    className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold rounded transition-all active:scale-95"
                                  >
                                    🎯 Optimize Gaps
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {wellnessPlan.suggestions.slice(0, 3).map((sug) => (
                                    <div 
                                      key={sug.id} 
                                      onClick={() => handleSelectEventForEdit({ ...sug, isSuggestion: true })}
                                      className="flex items-center justify-between p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-emerald-500/20 cursor-pointer transition-all"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-semibold text-slate-200 block truncate">{sug.name}</span>
                                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{sug.startTime} – {sug.endTime}</span>
                                      </div>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleSelectEventForEdit({ ...sug, isSuggestion: true }); }}
                                        className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 transition-all shrink-0 ml-2 active:scale-90"
                                        title="Edit/Accept Suggestion"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-1 font-sans">
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                          {/* Horizontally scrollable container */}
                          <div className="flex-1 flex flex-col min-h-0 overflow-x-auto scrollbar-thin">
                            {/* Content Wrapper */}
                            <div className={`flex-1 flex flex-col min-h-0 ${gridWidthClass}`}>
                              {/* Day Headers row */}
                              <div className="flex items-center border-b border-white/5 pb-1 shrink-0 select-none">
                                {/* Left Hour Spacer */}
                                <div className="w-9 shrink-0" />
                                
                                {/* Columns headers */}
                                <div className={`flex-1 grid gap-1 pl-1 ${calendarViewOption === "week" ? "grid-cols-7" : "grid-cols-3"}`}>
                                  {displayDays.map((dayDate, idx) => {
                                    const isToday = dayDate.toDateString() === new Date().toDateString();
                                    return (
                                      <div key={idx} className="flex flex-col items-center py-1">
                                        <span className="text-[7px] font-bold text-slate-500 uppercase font-mono">
                                          {dayDate.toLocaleDateString([], { weekday: 'short' })}
                                        </span>
                                        <span className={`text-[9px] font-mono font-semibold ${isToday ? "text-amber-400 bg-amber-500/10 px-1 rounded" : "text-slate-400"}`}>
                                          {dayDate.getDate()}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Hourly scrollable body */}
                              <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 relative">
                                <div className="flex h-[384px] relative">
                                  {/* Sticky Hour Labels */}
                                  <div className="sticky left-0 z-20 bg-[#0d0d15]/95 border-r border-white/10 w-9 shrink-0 flex flex-col justify-between text-[7px] font-mono text-slate-500 pr-1 py-1 select-none">
                                    {Array.from({ length: 13 }).map((_, i) => (
                                      <span key={i} className="h-0 flex items-center justify-end pr-0.5">
                                        {String(8 + i).padStart(2, '0')}:00
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {/* Grid Columns container */}
                                  <div className={`flex-1 grid gap-1 relative h-full pl-1 ${calendarViewOption === "week" ? "grid-cols-7" : "grid-cols-3"}`}>
                                    {/* Horizontal hour separator lines */}
                                    {Array.from({ length: 13 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className="absolute left-0 right-0 border-t border-white/[0.03] pointer-events-none" 
                                        style={{ top: `${i * 32}px` }} 
                                      />
                                    ))}
                                    
                                    {/* Columns */}
                                    {displayDays.map((dayDate, colIdx) => {
                                      const dayEvents = calendarEvents.filter(event => {
                                        const d = new Date(event.start);
                                        return d.toDateString() === dayDate.toDateString();
                                      });
                                      
                                      const daySuggestions = (wellnessPlan?.suggestions || []).filter(sug => {
                                        const d = new Date(sug.startISO);
                                        return d.toDateString() === dayDate.toDateString();
                                      });
                                      
                                      return (
                                        <div key={colIdx} className="relative h-full border-r border-white/[0.02] last:border-0">
                                          {/* Scheduled Events */}
                                          {dayEvents.map(event => {
                                            const startDate = new Date(event.start);
                                            const endDate = new Date(event.end);
                                            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                                            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                                            
                                            if (endHour <= 8 || startHour >= 20) return null;
                                            
                                            const top = Math.max(0, (startHour - 8) * 32);
                                            const height = Math.max(16, (Math.min(20, endHour) - Math.max(8, startHour)) * 32);
                                            const isDone = completedEvents.includes(event.id);
                                            
                                            const isExercise = event.title.toLowerCase().match(/(workout|exercise|walk|jog|run|gym)/);
                                            const isFocus = event.title.toLowerCase().match(/(focus|deep work|study|coding|programming)/);
                                            const isStressed = event.title.toLowerCase().match(/(interview|exam|test|presentation|deadline)/);
                                            
                                            let cardColor = "bg-slate-900/80 text-slate-300 border-white/5";
                                            if (isDone) {
                                              cardColor = "bg-emerald-950/20 text-slate-500 border-emerald-500/10 line-through opacity-60";
                                            } else if (isExercise) {
                                              cardColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";
                                            } else if (isFocus) {
                                              cardColor = "bg-indigo-950/60 text-indigo-300 border-indigo-500/30";
                                            } else if (isStressed) {
                                              cardColor = "bg-rose-950/60 text-rose-300 border-rose-500/30";
                                            }
                                            
                                            return (
                                              <div
                                                key={event.id}
                                                onClick={() => handleSelectEventForEdit(event)}
                                                className={`absolute left-0.5 right-0.5 rounded p-0.5 border flex flex-col justify-between overflow-hidden text-[7px] leading-tight select-none transition-all group/ev hover:z-30 cursor-pointer hover:border-amber-500/50 hover:shadow-[0_0_8px_rgba(255,255,255,0.05)] ${cardColor}`}
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                title={`${event.title} (${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                                              >
                                                <div className="min-w-0 flex-1 relative pr-3">
                                                  <span className="font-semibold block truncate leading-none">{event.title}</span>
                                                  {height >= 24 && (
                                                    <span className="text-[6px] text-slate-500 block truncate font-mono mt-0.5">
                                                      {startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(' ', '')}
                                                    </span>
                                                  )}
                                                </div>
                                                
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); handleToggleCompleteEvent(event); }}
                                                  className={`absolute top-0.5 right-0.5 p-0.5 rounded transition-all shrink-0 active:scale-75 ${
                                                    isDone 
                                                      ? "text-emerald-400 bg-emerald-500/10" 
                                                      : "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                  }`}
                                                  title={isDone ? "Mark Uncompleted" : isExercise ? "Log workout done!" : "Mark Completed"}
                                                >
                                                  <Check className="w-2 h-2" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                          
                                          {/* Daily Focus Suggestions (ghost blocks) */}
                                      {/* Daily Focus Suggestions (ghost blocks) */}
                                          {daySuggestions.map(sug => {
                                            const startDate = new Date(sug.startISO);
                                            const endDate = new Date(sug.endISO);
                                            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                                            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                                            
                                            if (endHour <= 8 || startHour >= 20) return null;
                                            
                                            const top = Math.max(0, (startHour - 8) * 32);
                                            const height = Math.max(16, (Math.min(20, endHour) - Math.max(8, startHour)) * 32);
                                            
                                            return (
                                              <div
                                                key={sug.id}
                                                onClick={(e) => { e.stopPropagation(); handleSelectEventForEdit({ ...sug, isSuggestion: true }); }}
                                                className="absolute left-0.5 right-0.5 rounded p-0.5 border border-dashed border-emerald-500/35 bg-emerald-500/[0.02] hover:bg-emerald-500/15 text-emerald-400/90 cursor-pointer flex flex-col justify-between overflow-hidden text-[7px] leading-none transition-all z-10 hover:border-amber-500/50 hover:shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                title={`Click to edit and schedule: ${sug.name} (${sug.startTime} - ${sug.endTime})`}
                                              >
                                                <span className="font-bold block truncate">✨ {sug.name}</span>
                                                {height >= 24 && (
                                                  <span className="text-[6px] text-emerald-500/70 block font-mono mt-0.5 truncate">Accept/Edit?</span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

                      {/* 2. News Feed Card */}
            <div className="flex-1 min-h-[220px] bg-slate-950/65 border border-sky-500/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.05)]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    📰
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight">News Feed</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${!newsKeyword ? 'bg-slate-600' : isSyncingNews ? 'bg-sky-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="text-[9px] text-slate-400 font-mono tracking-tight">
                        {!newsKeyword ? 'Disconnected' : isSyncingNews ? "Syncing..." : `Next sync in ${formatTime(newsSecondsToSync)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {newsKeyword && (
                    <>
                      <button
                        onClick={() => triggerNewsSync()}
                        disabled={isSyncingNews}
                        className={`text-slate-400 hover:text-white p-1 rounded-lg transition-all ${isSyncingNews ? 'animate-spin opacity-50' : ''}`}
                        title="Force News Sync"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setNewsKeyword("");
                          setNewsItems([]);
                          setTiles(prev => prev.map(t => t.id === 4 ? { ...t, status: "empty", agent: null } : t));
                          showSystemToast("📰 News Monitor deactivated.");
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-all"
                        title="Disconnect News Agent"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowNewsSettings(!showNewsSettings)}
                    className={`p-1 rounded-lg border transition-all duration-200 ${showNewsSettings ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                    title="News Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              {showNewsSettings ? (
                <div className="flex-1 flex flex-col justify-between overflow-hidden pt-2 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">News Config</h4>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.elements.newsKeyword.value.trim();
                        if (val) {
                          setNewsKeyword(val);
                          triggerNewsSync(val);
                          setShowNewsSettings(false);
                          showSystemToast(`📰 Syncing topic: "${val}"`);
                        }
                      }}
                      className="flex flex-col gap-2"
                    >
                      <label className="text-[10px] text-slate-400 font-mono">Sync Keyword / Topic:</label>
                      <div className="flex gap-2">
                        <input
                          name="newsKeyword"
                          type="text"
                          defaultValue={newsKeyword}
                          className="flex-1 px-2.5 py-1 rounded bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="flex gap-2 border-t border-white/5 pt-2 mt-2">
                    <button
                      onClick={() => setShowNewsSettings(false)}
                      className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition-all"
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              ) : !newsKeyword ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4 px-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-2xl animate-pulse">📰</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-300">Autonomous News Monitor</span>
                    <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">Configure your target news topic to autonomously index articles every hour.</p>
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = e.target.elements.setupNewsKeyword.value.trim();
                      if (val) {
                        setNewsKeyword(val);
                        triggerNewsSync(val);
                        showSystemToast(`📰 Syncing topic: "${val}"`);
                        setTiles(prev => prev.map(t => {
                          if (t.id === 4) {
                            const newsAgent = AGENT_CATALOG.find(a => a.id === "news_monitor");
                            return { ...t, status: "connected", agent: newsAgent };
                          }
                          return t;
                        }));
                      }
                    }}
                    className="flex flex-col w-full gap-2 mt-1 px-4"
                  >
                    <input
                      name="setupNewsKeyword"
                      type="text"
                      placeholder="e.g. AI Technology, Space"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500 text-center"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                    >
                      Activate News Monitor Agent
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden text-xs h-full text-slate-300 mt-2">
                  <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-1.5">
                  {isSyncingNews ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500 font-mono italic gap-2 py-8">
                      <Loader className="w-4 h-4 animate-spin text-sky-400" />
                      <span>Syncing articles...</span>
                    </div>
                  ) : newsItems.length === 0 ? (
                    <div className="text-center py-8 text-[10px] text-slate-500 italic font-mono">
                      No news indexed. Set a keyword in settings to sync.
                    </div>
                  ) : (
                    newsItems.slice(0, 4).map((item, index) => (
                      <a
                        key={index} href={item.link} target="_blank" rel="noopener noreferrer"
                        className="group/news-item flex items-start justify-between gap-3 p-2 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all min-w-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-slate-200 group-hover/news-item:text-sky-300 transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500 font-mono">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover/news-item:text-sky-400 transition-colors shrink-0 mt-0.5" />
                      </a>
                    ))
                  )}
                </div>
                <div className="text-[8px] text-slate-500 border-t border-white/5 pt-1.5 font-mono">
                  Active Keyword: <span className="text-sky-400 font-semibold">{newsKeyword || "AI breakthroughs"}</span>
                </div>
              </div>
            )}
          </div>
            

                      {/* 3. Budget Planner Card */}
            <div className="flex-1 min-h-[260px] bg-slate-950/65 border border-green-500/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-green-500/10 border border-green-500/20 text-green-400">
                    💰
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight">Financial Runway</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${finSetup ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={`text-[9px] font-mono tracking-wider uppercase font-semibold ${finSetup ? 'text-green-400' : 'text-slate-400'}`}>
                        {finSetup ? 'Active' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                {finSetup && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setIsFinExpanded(true)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Expand Tracker"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (finSetup) {
                          setFinWizardIncome(finSetup.income.toString());
                          setFinWizardDeductions(finSetup.deductions.toString());
                          setFinWizardAllocs(finSetup.percentages || { groceries: 20, dining: 15, entertainment: 10, transport: 10, misc: 10, savings: 35 });
                        } else {
                          setFinWizardIncome("");
                          setFinWizardDeductions("");
                          setFinWizardAllocs({ groceries: 20, dining: 15, entertainment: 10, transport: 10, misc: 10, savings: 35 });
                        }
                        setSelectedTileId(5);
                        setWizardStep(50);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
                      title="Budget Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.removeItem("agentos_fin_setup");
                        localStorage.removeItem("agentos_fin_expenses_" + finCurrentMonth);
                        setFinSetup(null);
                        setFinExpenses([]);
                        setFinShowLogForm(false);
                        setIsFinExpanded(false);
                        setShowFinSettings(false);
                        setTiles(prev => prev.map(t => t.id === 5 ? { ...t, status: "empty", agent: null } : t));
                        showSystemToast("💰 Budget setup disconnected.");
                      }}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200"
                      title="Disconnect Budget"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              {finSetup === null ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4 px-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-2xl animate-pulse">💰</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-300">Financial Runway Agent</span>
                    <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">Setup your monthly income, standard deductions, and budget allocations to projection savings runway.</p>
                  </div>
                  <div className="flex justify-center w-full mt-1">
                    <button
                      onClick={() => {
                        setFinWizardIncome("");
                        setFinWizardDeductions("");
                        setFinWizardAllocs({ groceries: 20, dining: 15, entertainment: 10, transport: 10, misc: 10, savings: 35 });
                        setSelectedTileId(5);
                        setWizardStep(50);
                        setIsModalOpen(true);
                      }}
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-slate-950 text-[10px] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-green-500/20 uppercase tracking-wider font-mono"
                    >
                      Start Financial Agent
                    </button>
                  </div>
                </div>
              ) : (() => {
                const monthExpenses = finExpenses;
                const totalBudget = finSetup.spendable;
                const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
                const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

                // Status message
                const statusMsg =
                  totalSpent > totalBudget ? { text: "Over budget — reset and go again 💙", color: "text-blue-400" } :
                  pct >= 95 ? { text: "Almost tapped out. Essentials only 🫡", color: "text-rose-400" } :
                  pct >= 85 ? { text: "Borderline. Time to get a little boring 🧘", color: "text-orange-400" } :
                  pct >= 75 ? { text: "Getting close — maybe skip that extra takeout 😅", color: "text-amber-400" } :
                  pct >= 60 ? { text: "More than halfway. Stay mindful 👀", color: "text-yellow-400" } :
                  pct >= 40 ? { text: "Solid. Right on track — keep that energy 💪", color: "text-emerald-400" } :
                              { text: "You're killing it. Plenty of runway left 🚀", color: "text-green-400" };

                // Over-budget category cheeky message
                const overCat = FIN_CATS.find(cat => {
                  const spent = monthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  return spent > (finSetup.allocations[cat] || 0);
                });

                const catBarColor = (catPct) =>
                  catPct >= 100 ? "bg-rose-500" : catPct >= 80 ? "bg-amber-500" : catPct >= 60 ? "bg-yellow-400" : "bg-emerald-500";

                const overallBarColor = pct >= 100 ? "bg-rose-500" : pct >= 85 ? "bg-orange-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500";

                return (
                  <div className="flex-1 flex flex-col gap-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {/* Status message */}
                    <div className="shrink-0">
                      <p className={`text-[11px] font-semibold leading-tight ${statusMsg.color}`}>{statusMsg.text}</p>
                      {overCat && (
                        <p className="text-[9px] text-slate-400 mt-0.5 italic">
                          {FIN_CAT_META[overCat].label} is a little overspent this month {FIN_CAT_META[overCat].emoji} — ${(monthExpenses.filter(e=>e.category===overCat).reduce((s,e)=>s+e.amount,0) - finSetup.allocations[overCat]).toFixed(0)} over
                        </p>
                      )}
                    </div>

                    {/* Overall progress bar */}
                    <div className="shrink-0">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                        <span>TOTAL BUDGET</span>
                        <span>${totalSpent.toFixed(0)} / ${totalBudget.toFixed(0)} <span className="text-slate-500">({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${overallBarColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Category cards */}
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-1.5 content-start">
                      {FIN_CATS.map(cat => {
                        const meta = FIN_CAT_META[cat];
                        const budget = finSetup.allocations[cat] || 0;
                        const spent = monthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                        const cp = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
                        const isOver = spent > budget;
                        const remaining = budget - spent;
                        return (
                          <div key={cat} className="bg-white/[0.02] border border-white/5 rounded-xl p-2 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                {meta.emoji} {meta.label}
                              </span>
                              {isOver && <span className="text-[8px] text-rose-400 font-mono font-bold">OVER</span>}
                            </div>
                            <div className="flex justify-between items-baseline text-[9px] font-mono">
                              <span className="text-[8px] text-slate-500 uppercase tracking-wider">Remaining</span>
                              <span className={isOver ? "text-rose-400 font-bold text-xs" : "text-emerald-400 font-bold text-xs"}>
                                {isOver ? `-$${Math.abs(remaining).toFixed(0)}` : `$${remaining.toFixed(0)}`}
                              </span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-white/5">
                              <div className={`h-full rounded-full transition-all duration-500 ${catBarColor(cp)}`} style={{ width: `${cp}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => setFinShowLogForm(true)}
                        className="flex-1 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 text-green-400 hover:text-green-300 text-[11px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span className="text-base leading-none">＋</span> Log Expense
                      </button>
                      <button
                        onClick={() => setIsFinExpanded(true)}
                        className="py-1.5 px-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-slate-400 hover:text-white text-[10px] font-mono transition-all"
                        title="View full history & chart"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>


          {/* Left Handle Indicator (visible when closed) */}
          <div className={`absolute top-0 right-0 bottom-0 w-4 bg-slate-900 border-l border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200 hover:bg-slate-800/80 ${isLeftOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <span className="text-[8px] font-mono tracking-widest font-bold text-slate-500 uppercase select-none [writing-mode:vertical-lr] my-2">PLANNER & HABITS</span>
            <span className="text-[8px] text-slate-400">▶</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div 
          onMouseEnter={() => setRightHovered(true)}
          onMouseLeave={() => setRightHovered(false)}
          className={`fixed right-0 top-16 bottom-0 w-[450px] bg-[#070a13]/95 border-l border-indigo-500/20 backdrop-blur-lg z-30 transition-transform duration-300 ease-out flex flex-col p-4 pb-6 gap-3 overflow-y-auto ${
            isRightOpen ? 'translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.85)]' : 'translate-x-[434px]'
          }`}
        >
                      {/* 1. Email Triage Card */}
            <div className={`flex-1 ${emailMode === null ? 'min-h-[220px]' : 'min-h-[320px]'} bg-slate-950/65 border border-teal-500/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.05)]`}>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight">Email Triage</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${emailMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                        {emailMode ? 'Google Live' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                 {emailMode && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowEmailSettings(!showEmailSettings)}
                      className={`p-1 rounded-lg border transition-all duration-200 ${showEmailSettings ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                      title="Email Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.removeItem("agentos_email_mode");
                        localStorage.removeItem("agentos_email_connected_tile");
                        setEmails([]);
                        setEmailMode(null);
                        setEmailConnectedTile(null);
                        setSelectedEmail(null);
                        setShowEmailSettings(false);
                        showSystemToast("✉️ Email Triage disconnected.");
                      }}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200"
                      title="Disconnect Triage"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              {showEmailSettings ? (
                <div className="flex-1 flex flex-col justify-between overflow-hidden pt-2 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Email Config</h4>
                    <div className="flex flex-col gap-2 p-3 rounded-xl border border-teal-500/10 bg-teal-500/[0.02] text-slate-300">
                      <span className="font-bold text-teal-400 uppercase tracking-wider font-mono text-[9px]">Connection Status</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Linked securely via Google API. Triaging priority threads and incoming recruiter updates in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-white/5 pt-2 mt-2">
                    <button
                      onClick={() => setShowEmailSettings(false)}
                      className="flex-1 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg transition-all"
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              ) : emailMode === null ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-center py-4 px-2 select-none">
                  <span className="text-2xl opacity-75">✉️</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-300">Triage Sync Portal</span>
                    <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">
                      Please sign in with Google from the top navbar to automatically connect your Gmail triage agent.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden text-xs h-full text-slate-300 mt-2">
                  {/* Gmail Top Bar */}
                  <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-white/5 rounded-xl px-3 py-1.5 shrink-0 mb-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={emailSearch}
                        onChange={(e) => {
                          setEmailSearch(e.target.value);
                          setSelectedEmail(null);
                        }}
                        placeholder="Search sender, subject..."
                        className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] focus:outline-none focus:border-teal-500 transition-colors text-slate-200 font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => fetchEmails()}
                        disabled={emailsLoading}
                        className={`text-slate-400 hover:text-white p-1 rounded-lg transition-all ${emailsLoading ? 'animate-spin opacity-50' : ''}`}
                        title="Scan Inbox"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="https://mail.google.com" target="_blank" rel="noopener noreferrer"
                        className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded text-[9px] uppercase font-mono shadow transition-all"
                      >
                        Gmail
                      </a>
                    </div>
                  </div>

                  {/* Gmail Layout Container */}
                  <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
                    {/* Sidebar Folder Toggle */}
                    <div className="w-28 flex flex-col gap-1 shrink-0 select-none border-r border-white/5 pr-1.5">
                      {[
                        { id: "priority", label: "Urgent", icon: AlertCircle, count: emails.filter(e => e.isUrgent && !e.read).length, badgeColor: "text-red-400 bg-red-500/10" },
                        { id: "inbox", label: "Inbox", icon: Inbox, count: emails.filter(e => !e.isUrgent && !e.read).length }
                      ].map((folder) => {
                        const isActive = activeEmailFolder === folder.id;
                        const FolderIcon = folder.icon;
                        return (
                          <button
                            key={folder.id}
                            onClick={() => {
                              setActiveEmailFolder(folder.id);
                              setSelectedEmail(null);
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all ${
                              isActive 
                                ? "bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/15" 
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FolderIcon className={`w-3 h-3 shrink-0 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                              <span className="truncate text-[10px] font-sans">{folder.label}</span>
                            </div>
                            {folder.count > 0 && (
                              <span className={`text-[8px] font-mono font-bold px-1 rounded-full ${folder.badgeColor || "bg-white/5 text-slate-400"}`}>
                                {folder.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <div className="mt-auto p-1.5 bg-slate-900/40 border border-white/5 rounded-lg text-[8px] text-slate-500 leading-snug font-mono">
                        Heuristics Triaging active.
                      </div>
                    </div>

                    {/* Content list or detail */}
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden">
                      {emailsLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono italic gap-2 py-10">
                          <Loader className="w-4 h-4 animate-spin text-teal-400" />
                          <span>Scanning inbox...</span>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                          {(() => {
                            const filtered = emails.filter(email => {
                              if (activeEmailFolder === "priority" && !email.isUrgent) return false;
                              if (activeEmailFolder === "inbox" && email.isUrgent) return false;
                              if (emailSearch) {
                                const q = emailSearch.toLowerCase();
                                return email.subject.toLowerCase().includes(q) || email.from.toLowerCase().includes(q);
                              }
                              return true;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="flex-1 flex items-center justify-center text-slate-500 italic text-[10px] font-mono py-10">
                                  Empty folder.
                                </div>
                              );
                            }

                            return (
                              <table className="w-full border-collapse text-left text-[10px]">
                                <tbody>
                                  {filtered.map((email) => (
                                    <tr
                                      key={email.id}
                                      onClick={() => {
                                        setEmails(prev => prev.map(em => em.id === email.id ? { ...em, read: true } : em));
                                        setSelectedEmail(email);
                                      }}
                                      className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-all duration-150 ${!email.read ? "bg-white/[0.01]" : ""}`}
                                    >
                                      <td className="py-2 pl-2 w-5" onClick={(e) => {
                                        e.stopPropagation();
                                        setEmails(prev => prev.map(em => em.id === email.id ? { ...em, starred: !em.starred } : em));
                                      }}>
                                        <Star className={`w-3 h-3 mx-auto ${email.starred ? "text-amber-400 fill-amber-400" : "text-slate-600 hover:text-slate-400"}`} />
                                      </td>
                                      <td className={`py-2 px-1 w-20 truncate font-semibold ${!email.read ? "text-white font-bold" : "text-slate-400"}`}>
                                        {email.fromName.slice(0, 12)}
                                      </td>
                                      <td className="py-2 px-1 truncate max-w-[90px]">
                                        <span className={!email.read ? "text-white font-semibold" : "text-slate-300"}>{email.subject}</span>
                                      </td>
                                      <td className="py-2 pr-2 text-right w-16 shrink-0 font-mono text-[8px] text-slate-500">
                                        {email.isUrgent ? "⏳ URGENT" : email.date.slice(0,6)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>


                        {/* 4. Job Search Card */}
            <div className={`flex-[1.2] ${jobSearchMode === null ? 'min-h-[220px]' : 'min-h-[300px]'} bg-slate-950/65 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]`}>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    💼
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight">Job Search Board</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${jobSearchMode ? (isSyncing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-slate-600'}`} />
                      <span className="text-[9px] text-slate-400 font-mono tracking-tight">
                        {jobSearchMode ? (isSyncing ? "Scraping..." : `Next sync in ${formatTime(secondsToSync)}`) : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {jobSearchMode && (
                    <>
                      <button
                        onClick={() => triggerSyncRefresh()}
                        disabled={isSyncing}
                        className={`text-slate-400 hover:text-white p-1 rounded-lg transition-all ${isSyncing ? 'animate-spin opacity-50' : ''}`}
                        title="Force Scrape Search"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsJobBoardOpen(true)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Expand Job Board"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowJobSettings(!showJobSettings)}
                    className={`p-1.5 rounded-lg border transition-all duration-200 ${showJobSettings ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                    title="Job Search Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  {jobSearchMode && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("agentos_job_search_mode");
                        setJobSearchMode(null);
                        setActiveJobs([]);
                        setShowJobSettings(false);
                        showSystemToast("💼 Job search agent deactivated.");
                      }}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200"
                      title="Deactivate Job Search Agent"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

                {/* Body */}
                {showJobSettings ? (() => {
                  const canDeploy = wizardPrefTitles.trim() && wizardPrefLocation.trim() && wizardYOE > 0 && wizardSeniorityPref;
                  const missingFields = [];
                  if (!wizardPrefTitles.trim()) missingFields.push("Target Role");
                  if (!wizardPrefLocation.trim()) missingFields.push("Location");
                  if (!wizardYOE || wizardYOE <= 0) missingFields.push("Years of Experience");
                  if (!wizardSeniorityPref) missingFields.push("Seniority Level");
                  if (!wizardResumeFile) missingFields.push("Resume");

                  return (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden pt-2 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Job Agent Config</h4>
                      <div className="flex flex-col gap-2.5">

                        {/* Target Role */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
                            Target Role(s) {!wizardPrefTitles.trim() && <span className="text-red-400 text-[8px]">● required</span>}
                          </label>
                          <input
                            type="text"
                            value={wizardPrefTitles}
                            onChange={e => {
                              setWizardPrefTitles(e.target.value);
                              localStorage.setItem("agentos_pref_titles", e.target.value);
                            }}
                            placeholder="e.g. Software Engineer, React Dev"
                            className={`w-full px-2 py-1 rounded bg-slate-950 border text-xs text-slate-200 focus:outline-none transition-colors ${!wizardPrefTitles.trim() ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                          />
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
                            Location {!wizardPrefLocation.trim() && <span className="text-red-400 text-[8px]">● required</span>}
                          </label>
                          <input
                            type="text"
                            value={wizardPrefLocation}
                            onChange={e => {
                              setWizardPrefLocation(e.target.value);
                              localStorage.setItem("agentos_pref_location", e.target.value);
                            }}
                            placeholder="e.g. Remote, Hybrid, New York"
                            className={`w-full px-2 py-1 rounded bg-slate-950 border text-xs text-slate-200 focus:outline-none transition-colors ${!wizardPrefLocation.trim() ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                          />
                        </div>

                        {/* YOE */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
                            Years of Experience {(!wizardYOE || wizardYOE <= 0) && <span className="text-red-400 text-[8px]">● required</span>}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={wizardYOE || ""}
                            onChange={e => setWizardYOE(parseInt(e.target.value) || 0)}
                            placeholder="e.g. 2"
                            className={`w-full px-2 py-1 rounded bg-slate-950 border text-xs text-slate-200 focus:outline-none transition-colors ${(!wizardYOE || wizardYOE <= 0) ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                          />
                        </div>

                        {/* Seniority Tier */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
                            Seniority Level {!wizardSeniorityPref && <span className="text-red-400 text-[8px]">● required</span>}
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: "junior", label: "Junior", yoe: "0–2 yrs" },
                              { id: "mid", label: "Mid", yoe: "3–5 yrs" },
                              { id: "senior", label: "Senior", yoe: "6+ yrs" }
                            ].map(tier => (
                              <button
                                key={tier.id}
                                onClick={() => setWizardSeniorityPref(tier.id)}
                                className={`py-1.5 rounded-lg border text-[10px] font-semibold font-mono transition-all flex flex-col items-center gap-0 ${wizardSeniorityPref === tier.id ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300' : 'bg-transparent border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'}`}
                              >
                                <span>{tier.label}</span>
                                <span className="text-[8px] opacity-60">{tier.yoe}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Resume */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
                            Resume {!wizardResumeFile && <span className="text-amber-400 text-[8px]">● recommended</span>}
                          </label>
                          {wizardResumeFile ? (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-indigo-300 font-mono block truncate">{wizardResumeFile.name}</span>
                                <span className="text-[8px] text-slate-500">{wizardResumeFile.size}</span>
                              </div>
                              <button onClick={() => setWizardResumeFile(null)} className="text-slate-500 hover:text-red-400 ml-2 text-[10px]">✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setSelectedTileId(0); setWizardStep(1); setIsModalOpen(true); setShowJobSettings(false); }}
                              className="w-full py-1.5 px-2 rounded-lg border border-dashed border-white/10 text-[10px] text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-left"
                            >
                              📄 Upload resume PDF via wizard →
                            </button>
                          )}
                        </div>

                        {/* Missing fields warning */}
                        {missingFields.length > 0 && (
                          <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                            <p className="text-[9px] text-red-400 font-mono leading-relaxed">
                              Missing: {missingFields.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 border-t border-white/5 pt-2 mt-2">
                      <button
                        disabled={!canDeploy}
                        onClick={() => {
                          if (!canDeploy) return;
                          localStorage.setItem("agentos_job_search_mode", "active");
                          setJobSearchMode("active");
                          setShowJobSettings(false);
                          triggerSyncRefresh();
                          showSystemToast("💼 Job search agent activated!");
                        }}
                        className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${canDeploy ? 'bg-indigo-500 hover:bg-indigo-600 text-slate-950 cursor-pointer' : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                      >
                        {canDeploy ? "Save & Sync ✓" : `Fill ${missingFields.length} field${missingFields.length > 1 ? 's' : ''} first`}
                      </button>
                    </div>
                  </div>
                  );
                })() : jobSearchMode === null ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4 px-2 min-h-[160px]">
                    <span className="text-2xl">💼</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-300">Job Hunter Agent</span>
                      <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">
                        Deploys autonomous scrape workers to track matching roles on tech boards.
                      </p>
                    </div>
                    <div className="flex justify-center w-full mt-1">
                      <button 
                        onClick={() => {
                          setShowJobSettings(true);
                        }}
                        className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-[10px] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                      >
                        Configure & Deploy Agent
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden text-xs h-full text-slate-300 mt-2">
                    <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-1.5">
                    {activeJobs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono italic gap-2 py-10">
                        {isSyncing ? (
                          <div className="flex items-center gap-1.5">
                            <Loader className="w-4 h-4 animate-spin text-indigo-400" />
                            <span>Scraping index...</span>
                          </div>
                        ) : (
                          "No jobs loaded yet. Click Force Scrape above or edit preferences."
                        )}
                      </div>
                    ) : (
                      activeJobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          onClick={(e) => handleOpenApplyPortal(job, e)}
                          className="group/job flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer min-w-0"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-semibold text-slate-200 truncate group-hover/job:text-indigo-400 transition-colors block">{job.title}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-mono block truncate">{job.company} · {job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              {job.salary || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-[8px] text-slate-500 border-t border-white/5 pt-1.5 font-mono flex justify-between font-sans">
                    <span>Target: {wizardPrefTitles || "Frontend Developer"}</span>
                    <span>Location: {wizardPrefLocation || "Remote"}</span>
                  </div>
                </div>
              )}
            </div>



          {/* Right Handle Indicator (visible when closed) */}
          <div className={`absolute top-0 left-0 bottom-0 w-4 bg-slate-900 border-r border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200 hover:bg-slate-800/80 ${isRightOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <span className="text-[8px] font-mono tracking-widest font-bold text-slate-500 uppercase select-none [writing-mode:vertical-lr] my-2">COMMUNICATIONS & JOBS</span>
            <span className="text-[8px] text-slate-400">◀</span>
          </div>
        </div>

        {/* Center Workspace Area */}
        <div className="w-full h-full min-h-[calc(100vh-120px)] flex items-center justify-center p-6 pl-12 pr-12">
        </div>

      </main>

      {/* --- CONNECT AGENT PICKER & SETUP WIZARD MODAL --- */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isModalOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => !isParsingResume && handleCloseModal()}
          className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Window */}
        <div 
          className={`
            relative w-full max-w-2xl glass-modal rounded-2xl overflow-hidden p-6 transition-all duration-300 transform
            ${isModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}
          `}
        >
          {/* Close Button */}
          {!isParsingResume && (
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* STEP 0: AGENT SELECTION CATALOG - REMOVED */}

          {/* STEP 1: JOB PREFERENCES WIZARD */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono">
                  <span>STEP 1 OF 3</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>PREFERENCES</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  Job Search Parameters
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define your preferred target roles, locations, and search filters.
                </p>
              </div>

              <div className="flex flex-col gap-4 py-2">
                {/* Target Job Titles */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Target Job Titles
                  </label>
                  <input
                    type="text"
                    value={wizardPrefTitles}
                    onChange={(e) => setWizardPrefTitles(e.target.value)}
                    placeholder="e.g. Frontend Engineer, React Developer, UI Architect"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-200"
                  />
                  
                  {/* Pill Checkbox Selectors */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {COMMON_ROLES.map(role => {
                      const isSelected = wizardPrefTitles.split(',').map(t => t.trim().toLowerCase()).includes(role.toLowerCase());
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            const parts = wizardPrefTitles.split(',').map(t => t.trim()).filter(Boolean);
                            const idx = parts.findIndex(p => p.toLowerCase() === role.toLowerCase());
                            if (idx >= 0) {
                              parts.splice(idx, 1);
                            } else {
                              parts.push(role);
                            }
                            setWizardPrefTitles(parts.join(", "));
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1.5 ${
                            isSelected 
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/5" 
                              : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span>{role}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[9px] text-slate-500 italic mt-0.5">Separate multiple titles with commas or toggle checkboxes above.</span>
                </div>

                {/* Preferred Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={wizardPrefLocation}
                    onChange={(e) => setWizardPrefLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, CA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-200"
                  />

                  {/* Pill Checkbox Selectors */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {COMMON_LOCATIONS.map(loc => {
                      const isSelected = wizardPrefLocation.split(',').map(l => l.trim().toLowerCase()).includes(loc.toLowerCase());
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            const parts = wizardPrefLocation.split(',').map(l => l.trim()).filter(Boolean);
                            const idx = parts.findIndex(p => p.toLowerCase() === loc.toLowerCase());
                            if (idx >= 0) {
                              parts.splice(idx, 1);
                            } else {
                              parts.push(loc);
                            }
                            setWizardPrefLocation(parts.join(", "));
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1.5 ${
                            isSelected 
                              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/5" 
                              : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Job Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Filter: Maximum Job Listing Age
                  </label>
                  <select
                    value={wizardPrefHours}
                    onChange={(e) => setWizardPrefHours(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer text-slate-200"
                  >
                    <option value={24}>Last 24 Hours</option>
                    <option value={72}>Last 3 Days (Recommended)</option>
                    <option value={168}>Last 7 Days</option>
                    <option value={720}>Last 30 Days</option>
                  </select>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setWizardStep(2)}
                  disabled={!wizardPrefTitles.trim() || !wizardPrefLocation.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Resume
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONSOLIDATED CREDENTIALS & RESUME PDF */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono">
                  <span>STEP 2 OF 2</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>CREDENTIALS & RESUME</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  Autofill Credentials & Resume
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide your contact information, keywords, and upload your resume PDF to configure the search crawler.
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2 max-h-[380px] overflow-y-auto pr-1">
                {/* Left Column: Personal info inputs */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Applicant Info</span>
                  
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={wizardPersonalInfo.name}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={wizardPersonalInfo.email}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. demouser@gmail.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={wizardPersonalInfo.phone}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      required
                      value={wizardPersonalInfo.linkedin}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="e.g. linkedin.com/in/alexrivera"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      GitHub Link
                    </label>
                    <input
                      type="text"
                      value={wizardPersonalInfo.github}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="e.g. github.com/alexrivera"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>

                  {/* Portfolio */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      Portfolio URL
                    </label>
                    <input
                      type="text"
                      value={wizardPersonalInfo.portfolio}
                      onChange={(e) => setWizardPersonalInfo(prev => ({ ...prev, portfolio: e.target.value }))}
                      placeholder="e.g. alexrivera.dev"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>
                </div>

                {/* Right Column: Skills & PDF Uploader */}
                <div className="flex flex-col gap-4">
                  {/* Skills/Keywords input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Search Relevancy Filter</span>
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Target Skills / Keywords
                    </label>
                    <input
                      type="text"
                      value={wizardSkills}
                      onChange={(e) => setWizardSkills(e.target.value)}
                      placeholder="e.g. react, typescript, tailwind, node"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                    />
                    <span className="text-[9px] text-slate-500 italic">Used to calculate and sort matching score. Comma-separated.</span>
                  </div>

                  {/* PDF Upload */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Resume File</span>
                    
                    {isParsingResume ? (
                      <div className="relative border border-emerald-500/30 rounded-xl h-[170px] bg-emerald-500/[0.02] flex flex-col items-center justify-center gap-2.5 overflow-hidden">
                        <div className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#10b981] animate-scan-laser pointer-events-none" />
                        <Loader className="w-6 h-6 text-emerald-400 animate-spin shrink-0" />
                        <div className="flex flex-col items-center gap-0.5 text-center px-4">
                          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">PARSING RESUME</span>
                          <span className="text-[11px] text-slate-200 truncate max-w-[200px]">{parserStatusText}</span>
                        </div>
                      </div>
                    ) : wizardResumeFile ? (
                      <div className="border border-indigo-500/20 rounded-xl h-[170px] bg-indigo-500/[0.02] flex flex-col items-center justify-center gap-2.5 p-4">
                        <File className="w-8 h-8 text-indigo-400 shrink-0" />
                        <div className="flex flex-col items-center text-center overflow-hidden">
                          <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                            {wizardResumeFile.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Loaded ({wizardResumeFile.size})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizardResumeFile(null)}
                          className="px-2.5 py-1 border border-white/5 hover:border-red-500/25 bg-white/[0.01] hover:bg-red-500/10 rounded-lg text-[10px] text-slate-400 hover:text-red-400 transition-all active:scale-95"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl h-[170px] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center p-4">
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">Upload Resume PDF</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Drag/click local PDF</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishJobSearchWizard}
                  disabled={
                    !wizardPersonalInfo.name.trim() || 
                    !wizardPersonalInfo.email.trim() || 
                    !wizardPersonalInfo.phone.trim() ||
                    !wizardPersonalInfo.linkedin.trim() ||
                    !wizardSkills.trim() ||
                    !wizardResumeFile ||
                    isParsingResume
                  }
                  className="px-6 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Deploy Job Search Agent
                </button>
              </div>
            </div>
          )}

          {/* STEP 10: CALENDAR CONNECTION METHOD SELECTOR */}
          {wizardStep === 10 && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                  <span>STEP 1 OF 2</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>CONNECTION METHOD</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  Google Calendar Activation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose between syncing with your real Google account or activating an interactive mock demo workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Method 1: Mock Sync */}
                <button
                  type="button"
                  onClick={() => handleFinishCalendarWizard("demo", selectedTileId)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-amber-500/20 group/opt text-center transition-all h-[200px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover/opt:scale-110 transition-transform">
                    🎯
                  </div>
                  <span className="text-sm font-semibold text-white group-hover/opt:text-amber-400 transition-colors">
                    Demo Mode (Mock Sync)
                  </span>
                  <span className="text-xs text-slate-500 mt-1 leading-normal max-w-[200px]">
                    Instantly load mock scheduler data. No credentials or OAuth configurations needed.
                  </span>
                </button>

                {/* Method 2: Real Google OAuth2 Sync */}
                <button
                  type="button"
                  onClick={() => setWizardStep(11)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-amber-500/20 group/opt text-center transition-all h-[200px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover/opt:scale-110 transition-transform">
                    🔌
                  </div>
                  <span className="text-sm font-semibold text-white group-hover/opt:text-amber-400 transition-colors">
                    Real Google Sync
                  </span>
                  <span className="text-xs text-slate-500 mt-1 leading-normal max-w-[200px]">
                    Connect to your actual Google Calendar account using secure OAuth2 credentials.
                  </span>
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 11: GOOGLE CALENDAR CONFIGURATION CREDENTIALS */}
          {wizardStep === 11 && (
            <form onSubmit={handleConnectGoogleCalendar} className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                  <span>STEP 2 OF 2</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>GOOGLE CLIENT CONFIG</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  Google API Access Credentials
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Retrieve OAuth credentials from the Google Cloud Console to establish the sync bridge.
                </p>
              </div>

              <div className="flex flex-col gap-3 py-2 text-xs max-h-[350px] overflow-y-auto pr-1">
                {/* Steps Help guide */}
                <div className="p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] text-slate-300 leading-relaxed flex flex-col gap-2 mb-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider font-mono text-[9px]">Google Cloud Console Instructions</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-1.5">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Google Cloud Credentials Console</a>.</li>
                    <li>Create or select a project, then click <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                    <li>Set application type to <strong>Web application</strong>.</li>
                    <li>Under <strong>Authorized redirect URIs</strong>, add the exact callback URL below.</li>
                    <li>Copy and paste the Client ID and Client Secret into the fields below.</li>
                  </ol>
                </div>

                {/* Redirect URI copy element */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Authorized Redirect URI</span>
                    <span className="text-[10px] text-slate-500 font-mono">Required in Cloud Console</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={googleRedirectUri}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] font-mono text-slate-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(googleRedirectUri, "Redirect URI")}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white border border-white/5 transition-colors shrink-0"
                      title="Copy Redirect URI"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Client ID */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-medium text-slate-300">Google Client ID</label>
                  <input
                    type="text"
                    required
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="e.g. 123456789-abc123xyz.apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-amber-500 transition-colors text-slate-200 font-mono"
                  />
                </div>

                {/* Client Secret */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-medium text-slate-300">Google Client Secret</label>
                  <input
                    type="password"
                    required
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    placeholder="e.g. GOCSPX-abc123xyz_def456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-amber-500 transition-colors text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(10)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!googleClientId.trim() || !googleClientSecret.trim() || isConfiguringGoogle}
                  className="px-6 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isConfiguringGoogle ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving config...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Authenticate & Sync</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 20: NEWS FEED AGENT CONFIGURATION */}
          {wizardStep === 20 && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-mono">
                  <span>STEP 1 OF 1</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>NEWS CONFIGURATION</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  News Feed Agent Setup
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure the news feed keyword to autonomously index articles every hour.
                </p>
              </div>

              <div className="flex flex-col gap-4 py-2">
                {/* News Keyword / Topic Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    Target Topic / Keyword
                  </label>
                  <input
                    type="text"
                    value={tempNewsKeyword || ""}
                    onChange={(e) => setTempNewsKeyword(e.target.value)}
                    placeholder="e.g. AI breakthroughs, tech funding, quantum computing"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-200"
                  />
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      "AI breakthroughs",
                      "Tech Startup Funding",
                      "Machine Learning",
                      "Cybersecurity",
                      "Quantum Computing",
                      "Web Development"
                    ].map(preset => {
                      const isSelected = tempNewsKeyword.toLowerCase() === preset.toLowerCase();
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTempNewsKeyword(preset)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1.5 ${
                            isSelected 
                              ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-md shadow-sky-500/5" 
                              : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation / Actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!tempNewsKeyword.trim()}
                  onClick={() => handleFinishNewsWizard(tempNewsKeyword, selectedTileId)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Provision News Agent
                </button>
              </div>
            </div>
          )}

          {/* STEP 31: GOOGLE GMAIL CONFIGURATION CREDENTIALS */}
          {wizardStep === 31 && (
            <form onSubmit={handleConnectGoogleEmail} className="flex flex-col gap-4">
              <div className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-mono">
                  <span>GOOGLE GMAIL BRIDGE</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>CLIENT CONFIG</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
                  Google API Access Credentials
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Retrieve OAuth credentials from the Google Cloud Console to establish the email sync bridge.
                </p>
              </div>

              <div className="flex flex-col gap-3 py-2 text-xs max-h-[350px] overflow-y-auto pr-1">
                {/* Steps Help guide */}
                <div className="p-3.5 rounded-xl border border-teal-500/10 bg-teal-500/[0.02] text-slate-300 leading-relaxed flex flex-col gap-2 mb-2">
                  <span className="font-bold text-teal-400 uppercase tracking-wider font-mono text-[9px]">Google Cloud Console Instructions</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-1.5">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Google API Library</a>, search for <strong>Gmail API</strong> and click <strong>Enable</strong>.</li>
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Google Cloud Credentials Console</a>.</li>
                    <li>Create or select your project, then click <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                    <li>Set application type to <strong>Web application</strong>.</li>
                    <li>Under <strong>Authorized redirect URIs</strong>, add the exact callback URL below.</li>
                    <li>Copy and paste the Client ID and Client Secret into the fields below.</li>
                  </ol>
                </div>

                {/* Redirect URI copy element */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Authorized Redirect URI</label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <span className="font-mono text-slate-400 text-[11px] truncate flex-1">{googleRedirectUri}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(googleRedirectUri, "Redirect URI")}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Copy URI"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Input fields */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Client ID</label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Enter your Google Client ID"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-teal-500 transition-colors text-slate-200 font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Client Secret</label>
                  <input
                    type="password"
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    placeholder="Enter your Google Client Secret"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs focus:outline-none focus:border-teal-500 transition-colors text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!googleClientId.trim() || !googleClientSecret.trim() || isConfiguringGoogle}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {isConfiguringGoogle ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Authenticate Google Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>


      {/* --- FINANCIAL RUNWAY WIZARD (steps 50/51) --- */}
      {(wizardStep === 50 || wizardStep === 51) && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 opacity-100 visible">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md" />
          <div className="relative w-full max-w-2xl glass-modal rounded-2xl overflow-hidden p-6">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200 z-10">
              <X className="w-4 h-4" />
            </button>

          {wizardStep === 50 && (
            <div className="flex flex-col gap-4">
              <div className="pb-4 border-b border-white/5">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/25 text-green-400 font-semibold tracking-wider">FINANCIAL SETUP — STEP 1 OF 2</span>
                <h2 className="text-xl md:text-2xl font-bold font-display text-white mt-2">Your Monthly Numbers</h2>
                <p className="text-xs text-slate-400 mt-1">Just two numbers and we'll take care of the rest. You only need to do this once.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Monthly Take-Home Income ($)</label>
                  <input
                    type="number" min="0" step="1"
                    value={finWizardIncome}
                    onChange={e => setFinWizardIncome(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-green-500 transition-colors text-slate-200 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Your after-tax take-home for the month.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Fixed Monthly Deductions ($)</label>
                  <input
                    type="number" min="0" step="1"
                    value={finWizardDeductions}
                    onChange={e => setFinWizardDeductions(e.target.value)}
                    placeholder="e.g. 1800"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-sm focus:outline-none focus:border-green-500 transition-colors text-slate-200 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Rent, subscriptions, utilities — things that come out automatically.</p>
                </div>
                {finWizardIncome && finWizardDeductions && (
                  <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Spendable budget this month</span>
                    <span className="text-lg font-bold text-green-400 font-mono">
                      ${Math.max(0, parseFloat(finWizardIncome || 0) - parseFloat(finWizardDeductions || 0)).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">Cancel</button>
                <button
                  onClick={() => {
                    const inc = parseFloat(finWizardIncome) || 0;
                    const ded = parseFloat(finWizardDeductions) || 0;
                    if (inc <= 0) { showSystemToast("⚠️ Please enter your income."); return; }
                    setWizardStep(51);
                  }}
                  disabled={!finWizardIncome || parseFloat(finWizardIncome) <= 0}
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Calculate Allocations →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 51 && (() => {
            const income = parseFloat(finWizardIncome) || 0;
            const deductions = parseFloat(finWizardDeductions) || 0;
            const spendable = Math.max(0, income - deductions);
            const totalPct = Object.values(finWizardAllocs).reduce((s, v) => s + v, 0);
            const isValid = Math.abs(totalPct - 100) < 0.5;
            return (
              <div className="flex flex-col gap-4">
                <div className="pb-4 border-b border-white/5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/25 text-green-400 font-semibold tracking-wider">FINANCIAL SETUP — STEP 2 OF 2</span>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white mt-2">Tweak Your Allocations</h2>
                  <p className="text-xs text-slate-400 mt-1">Smart defaults based on your ${spendable.toFixed(0)} spendable. Adjust until they add up to 100%.</p>
                </div>
                <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {FIN_CATS.map(cat => {
                    const meta = FIN_CAT_META[cat];
                    const dollarAmt = Math.round((finWizardAllocs[cat] / 100) * spendable);
                    return (
                      <div key={cat} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                        <span className="text-lg w-6 shrink-0">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-200">{meta.label}</span>
                            <span className="text-[11px] text-green-400 font-mono font-bold">${dollarAmt}/mo</span>
                          </div>
                          <input
                            type="range" min="0" max="100" step="1"
                            value={finWizardAllocs[cat]}
                            onChange={e => setFinWizardAllocs(prev => ({ ...prev, [cat]: parseInt(e.target.value) }))}
                            className="w-full accent-green-500 h-1"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number" min="0" max="100"
                            value={finWizardAllocs[cat]}
                            onChange={e => setFinWizardAllocs(prev => ({ ...prev, [cat]: Math.min(100, parseInt(e.target.value) || 0) }))}
                            className="w-12 text-center px-1 py-0.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-green-500"
                          />
                          <span className="text-[10px] text-slate-500">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${isValid ? "border-green-500/20 bg-green-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                  <span className="text-xs text-slate-300">Total allocation</span>
                  <span className={`text-sm font-bold font-mono ${isValid ? "text-green-400" : "text-rose-400"}`}>
                    {totalPct}% {!isValid && `(need ${100 - totalPct > 0 ? `+${100 - totalPct}` : 100 - totalPct}%)`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <button onClick={() => setWizardStep(50)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">Back</button>
                  <button
                    onClick={() => handleFinishFinancialWizard(selectedTileId)}
                    disabled={!isValid}
                    className="px-5 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>🚀</span> Launch Tracker
                  </button>
                </div>
              </div>
            );
          })()}

          </div>
        </div>
      )}


      {/* --- EXPANDED JOB BOARD CONTROL MODAL --- */}
      <div 
        className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
          isJobBoardOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => setIsJobBoardOpen(false)}
          className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Window */}
        <div 
          className={`
            relative w-full max-w-5xl h-[85vh] glass-modal rounded-2xl overflow-hidden flex flex-col transition-all duration-300 transform
            ${isJobBoardOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">Job Search Board Control</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently indexing jobs matching your custom resume keywords and location filter.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-white/5 bg-white/[0.01] px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-slate-300">
                  {isSyncing ? "Refreshing board..." : `Next Sync: ${formatTime(secondsToSync)}`}
                </span>
                <button
                  onClick={triggerSyncRefresh}
                  disabled={isSyncing}
                  className={`ml-2 text-slate-400 hover:text-white p-0.5 rounded transition-colors ${isSyncing ? 'animate-spin opacity-50' : ''}`}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <button 
                onClick={() => setIsJobBoardOpen(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job Board Tabs */}
          <div className="flex px-6 border-b border-white/5 bg-slate-950/20 shrink-0">
            <button
              onClick={() => setJobBoardTab("feed")}
              className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                jobBoardTab === "feed"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              🔍 Live Listings
            </button>
            <button
              onClick={() => setJobBoardTab("history")}
              className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                jobBoardTab === "history"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              📜 Job History ({applicationHistory.length})
            </button>
          </div>

          {/* Modal Grid Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar Profile Summary */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-6 bg-slate-950/20 overflow-y-auto flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-5">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">Active Profile</span>
                
                {/* Search tags */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 uppercase font-mono">Preferences</span>
                    <span className="text-xs font-medium text-slate-200">
                      Roles: {wizardPrefTitles}
                    </span>
                    <span className="text-xs text-slate-400">
                      Location: {wizardPrefLocation} ({wizardPrefHours}h limit)
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-500 uppercase font-mono">Autofill Profile</span>
                    <span className="text-xs font-semibold text-slate-200">{wizardPersonalInfo.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">{wizardPersonalInfo.email}</span>
                    <span className="text-[11px] text-slate-400">{wizardPersonalInfo.phone}</span>
                    
                    {/* Social/Profile Icons & links */}
                    <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{wizardPersonalInfo.linkedin}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Github className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">{wizardPersonalInfo.github}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{wizardPersonalInfo.portfolio}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume Source PDF */}
                {wizardResumeFile && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 uppercase font-mono">Resume Source Document</span>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-slate-950/60 text-xs">
                      <File className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-slate-200 truncate">{wizardResumeFile.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{wizardResumeFile.size}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Redraw Profile */}
              <div>
                <button
                  onClick={() => {
                    setIsJobBoardOpen(false);
                    setWizardStep(1);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white transition-all text-center"
                >
                  Edit Search Parameters
                </button>
              </div>
            </div>

            {/* Tab content conditional rendering */}
            {jobBoardTab === "feed" ? (
              /* Right Job Board Feed */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Scraped Listings Ordered by Relevance
                </span>

                {activeJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono italic text-sm">
                    <span>No live listings matches currently found.</span>
                    <button 
                      onClick={triggerSyncRefresh} 
                      className="mt-4 px-4 py-2 border border-white/10 hover:border-white/20 bg-white/[0.02] text-xs text-slate-300 hover:text-white rounded-xl transition-all"
                    >
                      Force Scrape Sync
                    </button>
                  </div>
                ) : (
                  activeJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className={`p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        job.status === "applied" 
                          ? "bg-emerald-500/[0.01] border-emerald-500/10" 
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Left Column Job Meta */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-slate-300 flex items-center justify-center text-lg shrink-0">
                          {job.companyEmoji}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-200 text-sm">{job.title}</span>
                            <span className="text-xs text-slate-500">at {job.company}</span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-mono">
                              {job.location}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic font-light mt-0.5">
                            <span className="text-indigo-400 font-semibold uppercase text-[9px] font-mono tracking-wider mr-1.5">MATCH DETAILS:</span>
                            "{job.standsOut}"
                          </p>
                        </div>
                      </div>

                      {/* Right Column Score & Apply Actions */}
                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-500 uppercase font-mono">Match Score</span>
                          <span className={`text-base font-bold font-mono ${
                            job.score >= 95 ? 'text-emerald-400' : 'text-indigo-400'
                          }`}>
                            {job.score}% Match
                          </span>
                        </div>

                        <div>
                          {job.status === "applied" ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold font-mono">
                              <CheckCircle className="w-4 h-4" />
                              <span>Applied</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenApplyPortal(job)}
                              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <Send className="w-3 h-3" />
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Job History Tab */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Past Submissions & History
                  </span>
                  
                  <button
                    onClick={handleDownloadHistoryCSV}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {applicationHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono italic text-sm">
                    <span>No application records logged yet.</span>
                  </div>
                ) : (
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/20">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-mono">
                            <th className="p-3">Job Applied To</th>
                            <th className="p-3">Resume Used</th>
                            <th className="p-3">Date Applied</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {applicationHistory.map((app) => (
                            <tr key={app.applicationId} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-3">
                                <div className="font-semibold text-slate-200">{app.job?.title}</div>
                                <div className="text-[10px] text-slate-500">{app.job?.company} · {app.job?.location}</div>
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">
                                {app.resumeUsed || "Default Resume"}
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">
                                {app.timestamp ? new Date(app.timestamp).toLocaleString() : "Unknown"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FINANCIAL RUNWAY EXPANDED MODAL --- */}
      {isFinExpanded && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-300 opacity-100 visible">
          <div onClick={() => setIsFinExpanded(false)} className="absolute inset-0 bg-[#020204]/85 backdrop-blur-md" />
          <div className="relative w-full max-w-3xl h-[88vh] glass-modal rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl">💰</div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Financial Runway</h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {finActiveTab === "dashboard"
                      ? `${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · Budget Overview`
                      : "Archived Monthly Statements & History"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsFinExpanded(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-white/5 bg-slate-950/20 shrink-0">
              <button
                onClick={() => setFinActiveTab("dashboard")}
                className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                  finActiveTab === "dashboard"
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                📊 Current Overview
              </button>
              <button
                onClick={() => setFinActiveTab("history")}
                className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                  finActiveTab === "history"
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                📜 History Logs ({finHistory.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {finSetup && (() => {
                if (finActiveTab === "dashboard") {
                  const totalBudget = finSetup.spendable;
                  const totalSpent = finExpenses.reduce((s, e) => s + e.amount, 0);
                  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

                  // Savings projection
                  const now = new Date();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const dayOfMonth = now.getDate();
                  const projectedSpend = dayOfMonth > 0 ? (totalSpent / dayOfMonth) * daysInMonth : 0;
                  const projectedSavings = finSetup.allocations.savings + Math.max(0, totalBudget - projectedSpend - finSetup.allocations.savings);
                  const savingsOnTrack = projectedSpend <= totalBudget;

                  const catBarColorHex = (catPct) =>
                    catPct >= 100 ? "#f43f5e" : catPct >= 80 ? "#f59e0b" : catPct >= 60 ? "#facc15" : "#22c55e";

                  return (
                    <>
                      {/* ── Bar Chart ── */}
                      <section>
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3">Budget vs Spent</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {FIN_CATS.map(cat => {
                            const meta = FIN_CAT_META[cat];
                            const budget = finSetup.allocations[cat] || 0;
                            const spent = finExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                            const cp = budget > 0 ? Math.min((spent / budget), 1) : 0;
                            return (
                              <div key={cat} className="flex flex-col items-center gap-1.5">
                                <div className="relative w-12 h-24 flex items-end gap-0.5">
                                  {/* Budget bar (outline) */}
                                  <div className="w-5 h-full rounded-t-md border border-white/10 bg-white/[0.02] flex items-end overflow-hidden">
                                    <div className="w-full rounded-t-sm bg-white/10" style={{ height: '100%' }} />
                                  </div>
                                  {/* Spent bar (filled) */}
                                  <div className="w-5 h-full flex items-end">
                                    <div
                                      className="w-full rounded-t-sm transition-all duration-700"
                                      style={{ height: `${Math.min(cp * 100, 100)}%`, backgroundColor: catBarColorHex(cp * 100) }}
                                    />
                                  </div>
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono text-center">{meta.emoji}</span>
                                <span className="text-[8px] text-slate-500 font-mono text-center">{meta.label.slice(0,5)}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-white/10 inline-block" /> Budget</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-emerald-500 inline-block" /> Spent</span>
                        </div>
                      </section>

                      {/* ── Savings Projection ── */}
                      <section className="p-4 rounded-2xl border border-green-500/20 bg-green-500/5">
                        <h3 className="text-xs font-mono font-bold uppercase text-green-400 mb-1">Savings Projection</h3>
                        {savingsOnTrack ? (
                          <>
                            <p className="text-sm font-bold text-white">
                              At this pace you'll save <span className="text-green-400">${Math.max(0, totalBudget - projectedSpend).toFixed(0)}</span> this month 🔥
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {(() => {
                                const cats = FIN_CATS.filter(c => c !== "savings");
                                const underCount = cats.filter(c => finExpenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0) <= finSetup.allocations[c]).length;
                                return `You've stayed under budget in ${underCount} out of ${cats.length} categories. That's genuinely good.`;
                              })()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-orange-400">Spending is trending over budget. Pull back where you can 🧘</p>
                        )}
                      </section>

                      {/* ── Expense History ── */}
                      <section>
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3">All Expenses — {finExpenses.length} entries</h3>
                        {finExpenses.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-sm italic">No expenses logged yet. Start tracking!</div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {FIN_CATS.map(cat => {
                              const catEntries = finExpenses.filter(e => e.category === cat);
                              if (catEntries.length === 0) return null;
                              const meta = FIN_CAT_META[cat];
                              return (
                                <div key={cat}>
                                  <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-xs">{meta.emoji}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">· ${catEntries.reduce((s,e)=>s+e.amount,0).toFixed(2)} total</span>
                                  </div>
                                  {catEntries.map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all mb-1">
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-semibold text-slate-200">${entry.amount.toFixed(2)}</span>
                                          {entry.recurring && (
                                            <span className="px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-semibold border border-emerald-500/15 flex items-center gap-0.5">
                                              🔄 Standard
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-mono">
                                          {new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                          {entry.note && ` · ${entry.note}`}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => setFinExpenses(prev => prev.filter(e => e.id !== entry.id))}
                                        className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-3 shrink-0"
                                        title="Delete and refund"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    </>
                  );
                } else {
                  // History logs view
                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Archived Monthly Statements</h3>
                        {finHistory.length > 0 && (
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to clear all financial history logs? This cannot be undone.")) {
                                setFinHistory([]);
                                showSystemToast("🗑️ Financial history cleared.");
                              }
                            }}
                            className="text-[10px] font-mono text-rose-400 hover:text-rose-300 font-semibold uppercase tracking-wider transition-colors"
                          >
                            🗑️ Clear History
                          </button>
                        )}
                      </div>

                      {finHistory.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-sm italic border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                          No archived statements. Statements will appear here at the beginning of each new month.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {[...finHistory].reverse().map(item => {
                            const isExpanded = finExpandedHistoryMonth === item.month;
                            const spentPct = item.totalBudget > 0 ? Math.round((item.totalSpent / item.totalBudget) * 100) : 0;
                            const remaining = item.totalBudget - item.totalSpent;
                            const isOver = item.totalSpent > item.totalBudget;

                            // Parse month (e.g. "2026-06" -> "June 2026")
                            const [yr, mn] = item.month.split("-");
                            const dateObj = new Date(parseInt(yr), parseInt(mn) - 1);
                            const formattedMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

                            return (
                              <div key={item.month} className="border border-white/5 bg-slate-950/40 rounded-xl overflow-hidden transition-all duration-300">
                                {/* Summary Header row */}
                                <div
                                  onClick={() => setFinExpandedHistoryMonth(isExpanded ? null : item.month)}
                                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 select-none"
                                >
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-slate-200">{formattedMonth}</span>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                      Income: ${item.income.toFixed(0)} · Budget: ${item.totalBudget.toFixed(0)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase">Spent</span>
                                      <span className={`text-xs font-bold font-mono ${isOver ? "text-rose-400" : "text-emerald-400"}`}>
                                        ${item.totalSpent.toFixed(2)} ({spentPct}%)
                                      </span>
                                    </div>
                                    <div className="h-6 w-[1px] bg-white/5" />
                                    <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                                      {isExpanded ? "▲ Hide" : "▼ Details"}
                                    </span>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div className="px-4 pb-4">
                                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isOver ? "bg-rose-500" : spentPct >= 85 ? "bg-orange-500" : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${Math.min(spentPct, 100)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Accordion log list */}
                                {isExpanded && (
                                  <div className="border-t border-white/5 bg-black/25 p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                      <h4 className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                                        Expense Log Entries — {item.expenses.length} total
                                      </h4>
                                      <span className={`text-[10px] font-mono font-bold ${remaining >= 0 ? "text-green-400" : "text-rose-400"}`}>
                                        {remaining >= 0 ? `Saved: $${remaining.toFixed(2)}` : `Overspent: $${Math.abs(remaining).toFixed(2)}`}
                                      </span>
                                    </div>
                                    
                                    {item.expenses.length === 0 ? (
                                      <p className="text-xs text-slate-500 italic py-2">No expenses logged in this month.</p>
                                    ) : (
                                      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                                        {item.expenses.map(entry => {
                                          const meta = FIN_CAT_META[entry.category] || { emoji: "📦", label: entry.category };
                                          return (
                                            <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-xs shrink-0">{meta.emoji}</span>
                                                <div className="flex flex-col min-w-0">
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs font-semibold text-slate-300">${entry.amount.toFixed(2)}</span>
                                                    {entry.recurring && (
                                                      <span className="px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[7.5px] font-semibold border border-emerald-500/15 flex items-center gap-0.5">
                                                        🔄 Standard
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="text-[9px] text-slate-500 font-mono">
                                                    {new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    {entry.note && ` · ${entry.note}`}
                                                  </span>
                                                </div>
                                              </div>
                                              <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase">{meta.label.slice(0,6)}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- EXPANDED CALENDAR BOARD CONTROL MODAL --- */}
      <div 
        className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
          isCalendarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => setIsCalendarOpen(false)}
          className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Window */}
        <div 
          className={`
            relative w-full max-w-5xl h-[85vh] glass-modal rounded-2xl overflow-hidden flex flex-col transition-all duration-300 transform
            ${isCalendarOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                📅
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">Calendar Planner Control</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage schedule blocks, sync meetings, and coordinate product focus routines.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-white/5 bg-white/[0.01] px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${calendarError ? 'bg-red-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-slate-300">
                  {calendarMode === "google" ? (calendarError ? "Google Sync Error" : "Google Calendar Synced") : "Workstation Demo Mode"}
                </span>
                <button
                  onClick={fetchCalendarEvents}
                  disabled={calendarLoading}
                  className={`ml-2 text-slate-400 hover:text-white p-0.5 rounded transition-colors ${calendarLoading ? 'animate-spin opacity-50' : ''}`}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <button 
                onClick={() => setIsCalendarOpen(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Grid Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Sidebar Profile Summary / Schedule Form */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-6 bg-slate-950/20 overflow-y-auto flex flex-col justify-between gap-6 shrink-0">
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold truncate max-w-[150px]">
                    {editingEvent ? `Edit: ${editingEvent.title}` : "Quick Scheduler"}
                  </span>
                  {editingEvent && (
                    <button
                      onClick={() => {
                        setEditingEvent(null);
                        setEventTitle("");
                        setEventStart("");
                        setEventEnd("");
                        setEventLocation("");
                        setEventDescription("");
                        setEventCreateMeet(false);
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all font-mono"
                    >
                      New Event
                    </button>
                  )}
                </div>
                
                {/* Event Scheduler Form */}
                <form 
                  onSubmit={editingEvent ? handleUpdateCalendarEvent : handleCreateCalendarEvent} 
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400 font-medium">Event Title</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Focus work session"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-amber-500 text-xs text-slate-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400 font-medium">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-amber-500 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400 font-medium">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-amber-500 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400 font-medium">Location (Optional)</label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="e.g. Google Meet / Room 3"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-amber-500 text-xs text-slate-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400 font-medium">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Notes for sync block..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-amber-500 text-xs text-slate-200 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] border border-white/5 mt-1">
                    <span className="text-[10px] text-slate-300 font-semibold flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                      Create Meet Link
                    </span>
                    <button
                      type="button"
                      onClick={() => setEventCreateMeet(!eventCreateMeet)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        eventCreateMeet ? "bg-amber-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          eventCreateMeet ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={isAddingEvent}
                      className={`w-full py-2 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 ${
                        editingEvent 
                          ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10" 
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10"
                      }`}
                    >
                      {isAddingEvent ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>{editingEvent ? "Saving..." : "Provisioning..."}</span>
                        </>
                      ) : (
                        <>
                          {editingEvent ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{editingEvent ? "Save Changes" : "Create Schedule Event"}</span>
                        </>
                      )}
                    </button>

                    {editingEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          // A suggestion was never actually saved as an event — nothing to
                          // delete on the server, just dismiss the preview locally.
                          if (editingEvent.isSuggestion) {
                            setEditingEvent(null);
                            setEventTitle("");
                            setEventStart("");
                            setEventEnd("");
                            setEventLocation("");
                            setEventDescription("");
                            setEventCreateMeet(false);
                            setIsCalendarOpen(false);
                          } else {
                            handleDeleteCalendarEvent(editingEvent.id);
                          }
                        }}
                        disabled={isAddingEvent}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs rounded-xl transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>{editingEvent.isSuggestion ? "Dismiss Suggestion" : "Delete Event"}</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Next Event Section */}
              <div className="border-t border-white/5 pt-4 mt-auto">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Upcoming Sync Ticker</span>
                <div className="mt-2 p-3 rounded-xl border border-white/5 bg-slate-950/40 text-xs">
                  {nextEvent ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-slate-200 truncate">{nextEvent.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-pulse" />
                        {countdownText}
                      </span>
                      {nextEvent.meetLink && (
                        <button
                          type="button"
                          onClick={() => window.open(nextEvent.meetLink, "_blank")}
                          className="w-full mt-1.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 transition-colors hover:bg-amber-600"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join Google Meet</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic font-mono text-[10px]">No upcoming scheduled focus blocks.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Calendar View Weekly Feed */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Header Selector */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    {calendarViewOption === "week" ? "Weekly Schedule" : "3-Day Schedule"}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {(() => {
                      if (calendarViewOption === "3day" || calendarViewOption === "list") {
                        const days = get3Days(miniCalendarDate);
                        const startStr = days[0].toLocaleDateString([], { month: 'short', day: 'numeric' });
                        const endStr = days[2].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                        return `3 Days: ${startStr} – ${endStr}`;
                      } else {
                        const daysOfWeek = getDaysInWeek(miniCalendarDate);
                        const startOfWeekStr = daysOfWeek[0].toLocaleDateString([], { month: 'short', day: 'numeric' });
                        const endOfWeekStr = daysOfWeek[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                        return `Week of ${startOfWeekStr} – ${endOfWeekStr}`;
                      }
                    })()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const offset = calendarViewOption === "week" ? 7 : 3;
                      setMiniCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - offset));
                    }}
                    className="px-3 py-1.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                  >
                    {calendarViewOption === "week" ? "Previous Week" : "Previous 3 Days"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMiniCalendarDate(new Date())}
                    className="px-3 py-1.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const offset = calendarViewOption === "week" ? 7 : 3;
                      setMiniCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + offset));
                    }}
                    className="px-3 py-1.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                  >
                    {calendarViewOption === "week" ? "Next Week" : "Next 3 Days"}
                  </button>
                </div>
              </div>

              {calendarError && calendarMode === "google" && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs leading-relaxed animate-pulse shadow-lg shadow-red-500/5 shrink-0">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-sm block mb-1">Google Calendar API Fetch Error</span>
                    <p className="text-slate-300 mb-2">
                      The calendar fallback has defaulted to local workstation demo events because the Google Calendar API has not been enabled in your Google Cloud Platform (GCP) project.
                    </p>
                    <div className="flex items-center gap-4">
                      <a 
                        href="https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=317546564195" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Enable Calendar API in Google Cloud</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Day Columns Grid */}
              <div className={`flex-1 grid grid-cols-1 ${calendarViewOption === "3day" || calendarViewOption === "list" ? "sm:grid-cols-3" : "sm:grid-cols-7"} gap-3 select-none min-h-[300px] overflow-x-auto`}>
                {((calendarViewOption === "3day" || calendarViewOption === "list") ? get3Days(miniCalendarDate) : getDaysInWeek(miniCalendarDate)).map((dayDate, index) => {
                  const isTodayObj = dayDate.toDateString() === new Date().toDateString();
                  const dayEvents = calendarEvents
                    .filter(event => {
                      const eventDate = new Date(event.start);
                      return eventDate.toDateString() === dayDate.toDateString();
                    })
                    .sort((a, b) => new Date(a.start) - new Date(b.start));

                  return (
                    <div 
                      key={index} 
                      onClick={() => {
                        // Prefill start and end date
                        const formattedMonth = (dayDate.getMonth() + 1).toString().padStart(2, "0");
                        const formattedDay = dayDate.getDate().toString().padStart(2, "0");
                        const formattedYear = dayDate.getFullYear();
                        setEventStart(`${formattedYear}-${formattedMonth}-${formattedDay}T09:00`);
                        setEventEnd(`${formattedYear}-${formattedMonth}-${formattedDay}T10:00`);
                      }}
                      className={`
                        flex flex-col gap-3 p-3 rounded-2xl border transition-all hover:bg-white/[0.02] cursor-pointer min-h-[400px] sm:min-h-0
                        ${isTodayObj 
                          ? "bg-amber-500/[0.02] border-amber-500/25" 
                          : "bg-white/[0.01] border-white/5"
                        }
                      `}
                    >
                      {/* Day Header */}
                      <div className={`p-2 rounded-xl text-center flex flex-col gap-0.5 border shrink-0 ${
                        isTodayObj ? "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold" : "bg-white/[0.02] border-white/5 text-slate-300"
                      }`}>
                        <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                          {dayDate.toLocaleDateString([], { weekday: 'short' })}
                        </span>
                        <span className="text-base font-extrabold font-mono">
                          {dayDate.getDate()}
                        </span>
                      </div>

                      {/* Day Event List - Displaying entire day's events */}
                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-0.5 scrollbar-thin">
                        {dayEvents.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center py-10 text-[9px] text-slate-600 font-mono italic text-center">
                            Free
                          </div>
                        ) : (
                          dayEvents.map(event => {
                            const eventStartLocal = new Date(event.start);
                            const eventEndLocal = new Date(event.end);
                            const startTimeStr = eventStartLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const endTimeStr = eventEndLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            return (
                              <div 
                                key={event.id}
                                onClick={(e) => { e.stopPropagation(); handleSelectEventForEdit(event); }} // Edit event when clicked
                                className="group/item flex flex-col gap-1.5 p-2 rounded-xl border border-white/5 bg-[#09090e]/80 hover:bg-white/[0.03] hover:border-amber-500/25 transition-all text-[10px] min-w-0 cursor-pointer"
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-semibold text-slate-200 truncate leading-tight group-hover/item:text-amber-400 transition-colors" title={event.title}>
                                    {event.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteCalendarEvent(event.id, e)}
                                    className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-red-400 p-0.5 transition-opacity shrink-0"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                
                                <div className="flex flex-col gap-1 text-[8px] text-slate-400 font-mono">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2 h-2 text-slate-500" />
                                    {startTimeStr} – {endTimeStr}
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center gap-1 truncate text-slate-500" title={event.location}>
                                      <MapPin className="w-2 h-2 text-slate-500" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>

                                {event.meetLink && (
                                  <button
                                    type="button"
                                    onClick={() => window.open(event.meetLink, "_blank")}
                                    className="w-full mt-1 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[9px] rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95"
                                  >
                                    <Video className="w-2.5 h-2.5" />
                                    <span>Join Meet</span>
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MANDATORY FIRST-LOGIN ONBOARDING MODAL ---
          Intentionally has no backdrop-close and no X button: preferences must be
          submitted once before the rest of the dashboard is usable. */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020204]/90 backdrop-blur-md" />
          <div className="relative w-full max-w-md glass-modal rounded-2xl overflow-hidden flex flex-col p-6 gap-5">
            <div>
              <h2 className="text-lg font-bold font-display text-white">Welcome to AgentOS 👋</h2>
              <p className="text-xs text-slate-400 mt-1">
                Set up your health agent preferences so it can plan meals, workouts, and focus time around your calendar.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Dietary Preference</label>
                <select
                  value={wellnessDiet}
                  onChange={(e) => setWellnessDiet(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                >
                  <option value="none">No Restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto (Low Carb)</option>
                  <option value="high-protein">High Protein</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Exercise Style</label>
                <select
                  value={wellnessExercise}
                  onChange={(e) => setWellnessExercise(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                >
                  <option value="stretching">Stretching & Mobility</option>
                  <option value="yoga">Yoga Vinyasa/Yin</option>
                  <option value="cardio">Cardio & HIIT</option>
                  <option value="strength">Bodyweight / Strength</option>
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Wake Time</label>
                  <input
                    type="time"
                    value={wellnessWakeTime}
                    onChange={(e) => setWellnessWakeTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Sleep Time</label>
                  <input
                    type="time"
                    value={wellnessSleepTime}
                    onChange={(e) => setWellnessSleepTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSavingPreferences}
              onClick={async () => {
                const ok = await handleSavePreferences({
                  diet: wellnessDiet,
                  exercise: wellnessExercise,
                  wakeTime: wellnessWakeTime,
                  sleepTime: wellnessSleepTime
                });
                if (ok) {
                  setIsOnboardingOpen(false);
                  showSystemToast("🎯 Health preferences saved — your agent is ready!");

                  // This is a first-time user, so the login-time auto-schedule was
                  // deliberately skipped (it would have used the "none"/default prefs
                  // instead of what was just picked here). Trigger it now, with the
                  // real preferences in place.
                  if (activeUser?.email) {
                    try {
                      const res = await fetch("/api/schedule/current-week", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: activeUser.email })
                      });
                      const result = await res.json();
                      if (result?.totalScheduled > 0) {
                        showSystemToast(`🎯 Health planner auto-scheduled: ${result.totalScheduled} wellness task(s) added for this week!`);
                        await fetchCalendarEvents();
                      }
                      if (result?.requiresGoogleReconnect) {
                        showSystemToast("⚠️ Google Calendar isn't connected (or your session expired) — reconnect it to auto-schedule your health planner.");
                      } else if (result?.totalFailed > 0) {
                        showSystemToast(`⚠️ ${result.totalFailed} health planner task(s) failed to schedule: ${result.lastError}`);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isSavingPreferences ? <Loader className="w-4 h-4 animate-spin" /> : "Get Started"}
            </button>
          </div>
        </div>
      )}

      {/* --- SIMPLE HEALTH AGENT SETTINGS PANEL (opened from avatar click) --- */}
      {isAvatarSettingsOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            onClick={() => setIsAvatarSettingsOpen(false)}
            className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-md glass-modal rounded-2xl overflow-hidden flex flex-col p-6 gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white">Health Agent Settings</h2>
              <button
                onClick={() => setIsAvatarSettingsOpen(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Dietary Preference</label>
                <select
                  value={wellnessDiet}
                  onChange={(e) => setWellnessDiet(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                >
                  <option value="none">No Restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto (Low Carb)</option>
                  <option value="high-protein">High Protein</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400">Exercise Style</label>
                <select
                  value={wellnessExercise}
                  onChange={(e) => setWellnessExercise(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                >
                  <option value="stretching">Stretching & Mobility</option>
                  <option value="yoga">Yoga Vinyasa/Yin</option>
                  <option value="cardio">Cardio & HIIT</option>
                  <option value="strength">Bodyweight / Strength</option>
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Wake Time</label>
                  <input
                    type="time"
                    value={wellnessWakeTime}
                    onChange={(e) => setWellnessWakeTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400">Sleep Time</label>
                  <input
                    type="time"
                    value={wellnessSleepTime}
                    onChange={(e) => setWellnessSleepTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={isSavingPreferences}
                onClick={async () => {
                  const ok = await handleSavePreferences({
                    diet: wellnessDiet,
                    exercise: wellnessExercise,
                    wakeTime: wellnessWakeTime,
                    sleepTime: wellnessSleepTime
                  });
                  if (ok) showSystemToast("✅ Health preferences updated!");
                }}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSavingPreferences ? <Loader className="w-3.5 h-3.5 animate-spin" /> : "Save Preferences"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAvatarSettingsOpen(false);
                  setIsWellnessModalOpen(true);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 font-semibold text-xs rounded-xl transition-all active:scale-95"
              >
                Open Full Wellness Optimizer →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EXPANDED DAILY FOCUS CONTROL CENTER MODAL --- */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
          isWellnessModalOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => setIsWellnessModalOpen(false)}
          className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Window */}
        <div 
          className={`
            relative w-full max-w-5xl h-[85vh] glass-modal rounded-2xl overflow-hidden flex flex-col transition-all duration-300 transform
            ${isWellnessModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">Daily Focus & Wellness Optimizer</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomously plan breaks, meal preparation, exercise, and focus routines based on calendar gaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {wellnessPlan && wellnessPlan.suggestions?.length > 0 && (
                <button
                  onClick={handleScheduleAllSuggestions}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Schedule All Gaps</span>
                </button>
              )}

              <button 
                onClick={() => setIsWellnessModalOpen(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7-Day Date Selector Strip */}
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/30 border-b border-white/5 overflow-x-auto shrink-0 scrollbar-thin">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-2 shrink-0">Selected Day:</span>
            <div className="flex items-center gap-1.5">
              {(() => {
                const days = [];
                const start = new Date();
                for (let i = 0; i < 7; i++) {
                  const d = new Date(start);
                  d.setDate(start.getDate() + i);
                  days.push(d);
                }
                return days;
              })().map((dayDate) => {
                const dateStr = getLocalYMD(dayDate);
                const isSelected = dateStr === wellnessDate;
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const hasEventsOnDay = calendarEvents.some(e => new Date(e.start).toDateString() === dayDate.toDateString());
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setWellnessDate(dateStr);
                      fetchWellnessPlan(dateStr);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all duration-200 ${
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5" 
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    <span>
                      {isToday ? "Today" : dayDate.toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <span className="text-[9px] opacity-75 font-mono">
                      {dayDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {hasEventsOnDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Grid Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Sidebar Preferences Panel */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-6 bg-slate-950/20 overflow-y-auto flex flex-col gap-6 shrink-0">
              <div className="flex flex-col gap-5">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Wellness Profile</span>
                
                {/* Diet selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 font-medium">Dietary Preference</label>
                  <select
                    value={wellnessDiet}
                    onChange={(e) => setWellnessDiet(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                  >
                    <option value="none">No Restrictions</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto (Low Carb)</option>
                    <option value="high-protein">High Protein</option>
                  </select>
                </div>

                {/* Workout type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 font-medium">Exercise Style</label>
                  <select
                    value={wellnessExercise}
                    onChange={(e) => setWellnessExercise(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
                  >
                    <option value="stretching">Stretching & Mobility</option>
                    <option value="yoga">Yoga Vinyasa/Yin</option>
                    <option value="cardio">Cardio & HIIT</option>
                    <option value="strength">Bodyweight / Strength</option>
                  </select>
                </div>

                {/* Wake Hour */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 font-medium">Target Wake Time</label>
                  <input
                    type="time"
                    value={wellnessWakeTime}
                    onChange={(e) => setWellnessWakeTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>

                {/* Sleep Hour */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 font-medium">Target Sleep Time</label>
                  <input
                    type="time"
                    value={wellnessSleepTime}
                    onChange={(e) => setWellnessSleepTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchWellnessPlan}
                  disabled={isOptimizing}
                  className="w-full mt-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  {isOptimizing ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Optimize Day Plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sidebar Score Card */}
              <div className="border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Plan Efficiency</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    Live Score
                  </span>
                </div>
                <div className="mt-2 p-3.5 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-300">Schedule Health Score</span>
                      <span className="text-[9px] text-slate-500">Goal: Add blocks to hit 100%</span>
                    </div>
                    <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/25 shadow-inner">
                      {healthScore}%
                    </div>
                  </div>
                  
                  {/* Optimization Checklist */}
                  <div className="flex flex-col gap-1.5 text-left border-t border-white/5 pt-2">
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Target Checklist:</span>
                    {[
                      { key: "productivity", label: "Deep Focus Block", emoji: "🎯", met: calendarEvents.some(e => e.title.toLowerCase().match(/(focus|deep work|coding)/) && completedEvents.includes(e.id)) },
                      { key: "cooking-lunch", label: "Cook Healthy Lunch", emoji: "🍳", met: completedEvents.some(id => String(id).toLowerCase().includes("lunch") || String(id).toLowerCase().includes("cook")) },
                      { key: "walking", label: "Digestive Walk Break", emoji: "🚶", met: completedEvents.some(id => String(id).toLowerCase().includes("walk") || String(id).toLowerCase().includes("jog") || String(id).toLowerCase().includes("run") || String(id).toLowerCase().includes("stretch")) },
                      { key: "exercise", label: "Active Workout", emoji: "💪", met: exerciseMinutes >= 15 },
                      { key: "cooking-dinner", label: "Cook Healthy Dinner", emoji: "🥗", met: completedEvents.some(id => String(id).toLowerCase().includes("dinner")) }
                    ].map(target => {
                      const met = target.met;
                      return (
                        <div key={target.key} className="flex items-center justify-between text-[10px] py-0.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span>{target.emoji}</span>
                            <span className={met ? "line-through text-slate-500" : ""}>{target.label}</span>
                          </div>
                          <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded leading-none ${
                            met ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500"
                          }`}>
                            {met ? "MET" : "PEND"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Suggestions & Activity Log Dashboard List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Activities & Wellness Log</span>
                  <span className="text-xs text-slate-300">
                    Track and check off your healthy habits for {new Date(wellnessDate).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}.
                  </span>
                </div>
              </div>

              {/* SECTION 1: Scheduled Today */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-sm">📅</span>
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Scheduled Today</h3>
                </div>
                {(() => {
                  const todayEvents = calendarEvents.filter(e => new Date(e.start).toDateString() === new Date(wellnessDate).toDateString());
                  if (todayEvents.length === 0) {
                    return (
                      <div className="text-center py-4 text-[10px] text-slate-500 italic bg-white/[0.01] border border-white/5 rounded-xl">
                        No activities scheduled for today. Sync calendar or schedule recommendations below!
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {todayEvents.map(event => {
                        const isDone = completedEvents.includes(event.id);
                        const isExercise = event.title.toLowerCase().match(/(workout|exercise|walk|jog|run|gym)/);
                        const startDate = new Date(event.start);
                        return (
                          <div 
                            key={event.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                              isDone 
                                ? "bg-emerald-950/10 border-emerald-500/10 text-slate-500 opacity-60" 
                                : "bg-white/[0.01] border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <span className={`text-xs font-semibold block truncate ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                                {event.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                                ⏰ {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleCompleteEvent(event)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isDone 
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                                  : "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent"
                              }`}
                              title={isDone ? "Mark Uncompleted" : isExercise ? "Log workout done!" : "Mark Completed"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2: Wellness Recommendations (Unscheduled/Direct Log) */}
              <div className="flex flex-col gap-2.5 border-t border-white/5 pt-5">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✨</span>
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Unscheduled Habits / Gaps</h3>
                  </div>
                  {wellnessPlan?.suggestions?.length > 0 && (
                    <button
                      onClick={handleScheduleAllSuggestions}
                      className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 font-mono animate-pulse"
                    >
                      Accept & Schedule All
                    </button>
                  )}
                </div>

                {isOptimizing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 font-mono text-xs gap-3">
                    <Loader className="w-8 h-8 animate-spin text-emerald-400" />
                    <span>Analyzing schedule gaps...</span>
                  </div>
                ) : (() => {
                  const isAlreadyScheduled = (sug) => {
                    return calendarEvents.some(e => 
                      new Date(e.start).toDateString() === new Date(wellnessDate).toDateString() &&
                      e.title.toLowerCase().trim() === sug.name.toLowerCase().trim()
                    );
                  };
                  const activeSuggestions = wellnessPlan?.suggestions && wellnessPlan.suggestions.length > 0
                    ? wellnessPlan.suggestions
                    : defaultSuggestions;

                  const unscheduledSuggestions = activeSuggestions.filter(sug => !isAlreadyScheduled(sug));

                  if (unscheduledSuggestions.length === 0) {
                    return (
                      <div className="text-center py-5 text-[10px] text-slate-500 italic bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
                        All recommended activities have been scheduled! Check them in your schedule above.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unscheduledSuggestions.map(sug => {
                        const sugId = sug.id || `direct-${sug.name.toLowerCase().replace(/\s+/g, '-')}`;
                        const isDone = completedEvents.includes(sugId);

                        const configMap = {
                          exercise: { icon: "💪", border: "border-rose-500/20 bg-rose-500/[0.01]" },
                          cooking: { icon: "🍳", border: "border-amber-500/20 bg-amber-500/[0.01]" },
                          walking: { icon: "🚶", border: "border-emerald-500/20 bg-emerald-500/[0.01]" },
                          productivity: { icon: "🎯", border: "border-indigo-500/20 bg-indigo-500/[0.01]" }
                        };
                        const config = configMap[sug.type] || { icon: "💡", border: "border-white/5 bg-white/[0.01]" };

                        return (
                          <div 
                            key={sugId}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                              isDone 
                                ? "bg-emerald-950/10 border-emerald-500/10 text-slate-500 opacity-60"
                                : `hover:border-white/10 ${config.border}`
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                                  sug.type === "exercise" ? "bg-rose-500/10 text-rose-400 border border-rose-500/15" :
                                  sug.type === "cooking" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                                  sug.type === "walking" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                                  "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                                }`}>
                                  {sug.type || "habit"}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono font-bold">
                                  Rec: {sug.startTime} – {sug.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-sm">{config.icon}</span>
                                <span className={`text-xs font-semibold ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                                  {sug.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 font-light leading-normal">
                                {sug.details}
                              </p>
                            </div>

                            <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-end gap-2 shrink-0">
                              {/* Option 1: Schedule Gaps */}
                              {!isDone && (
                                <button
                                  onClick={() => handleScheduleSuggestion(sug)}
                                  className="px-2.5 py-1.5 text-[9px] font-bold rounded-lg bg-slate-900 border border-white/5 hover:border-white/10 text-slate-300 transition-all flex items-center gap-1 active:scale-95"
                                  title="Add to Calendar"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Schedule</span>
                                </button>
                              )}

                              {/* Option 2: Log done directly */}
                              <button
                                onClick={() => handleLogSuggestionDirectly(sug)}
                                className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 active:scale-95 border ${
                                  isDone
                                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    : "text-slate-950 bg-emerald-500 border-transparent hover:bg-emerald-600"
                                }`}
                                title={isDone ? "Mark Uncompleted" : "Log direct done!"}
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>{isDone ? "Logged" : "Log Done"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- AUTOFILL APPLICATION REVIEW PORTAL MODAL --- */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          selectedApplyJob ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => !isSubmittingApp && setSelectedApplyJob(null)}
          className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Window */}
        <div 
          className={`
            relative w-full max-w-6xl h-[85vh] glass-modal rounded-2xl overflow-hidden flex flex-col transition-all duration-300 transform
            ${selectedApplyJob ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="text-xl">
                {selectedApplyJob?.companyEmoji}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-semibold tracking-wider">
                  LIVE TELEMETRY AUTOFILL HUB
                </span>
                <h2 className="text-base font-bold font-display text-white mt-1">
                  Applying for {selectedApplyJob?.title} at {selectedApplyJob?.company}
                </h2>
              </div>
            </div>
            {!isSubmittingApp && (
              <button 
                onClick={() => setSelectedApplyJob(null)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Portal Split-Screen Body */}
          {selectedApplyJob && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Applicant Profile Copy-Paste Fallback & Logging */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-5 bg-slate-950/20 overflow-y-auto flex flex-col justify-between gap-5 shrink-0">
                
                {appSubmissionSuccess ? (
                  /* Success & Submission Verification Log Panel */
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white leading-tight">Registry Logged</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Application recorded. Dispatching SMTP receipt...
                        </p>
                      </div>
                    </div>

                    {/* Scrolling terminal logger */}
                    <div className="flex-1 p-3 rounded-xl bg-black border border-white/10 font-mono text-[10px] text-slate-300 leading-relaxed overflow-y-auto max-h-[180px] flex flex-col gap-1">
                      <div className="text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-white/5 mb-1">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>OPERATIONS CONSOLE LOGS</span>
                      </div>
                      {appTerminalLogs.map((log, index) => (
                        <div key={index} className={log.includes("SUCCESS") ? "text-emerald-400" : log.includes("Error") ? "text-red-400" : ""}>
                          {log}
                        </div>
                      ))}
                    </div>

                    {/* Expandable JSON payload receipt */}
                    {appReceiptData && (
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowReceiptAccordion(!showReceiptAccordion)}
                          className="w-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[10px] font-semibold text-slate-300 flex items-center justify-between transition-colors border-b border-white/5"
                        >
                          <span>{showReceiptAccordion ? "Hide" : "View"} Submission Receipt</span>
                          <span className="text-[9px] font-mono text-indigo-400 uppercase">
                            {showReceiptAccordion ? "Collapse" : "Expand"}
                          </span>
                        </button>
                        
                        {showReceiptAccordion && (
                          <div className="p-3 bg-black/60 max-h-[140px] overflow-y-auto text-[9px] font-mono text-slate-400 leading-relaxed">
                            <pre>{JSON.stringify(appReceiptData, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 mt-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedApplyJob(null)}
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all active:scale-95 text-center"
                      >
                        Close Portal
                      </button>
                    </div>
                  </div>
                ) : isSubmittingApp ? (
                  /* Loading Spinner */
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-6">
                    <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">TRANSMITTING TELEMETRY</span>
                      <span className="text-xs font-semibold text-white">Logging application registry details...</span>
                    </div>
                    <div className="w-full p-2.5 rounded-lg bg-black border border-white/10 font-mono text-[9px] text-left text-slate-400 overflow-y-auto max-h-[120px] flex flex-col gap-1">
                      {appTerminalLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Credentials details with Copy triggers */
                  <div className="flex flex-col gap-4 h-full">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Autofill Credentials</span>
                    
                    <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                      {[
                        { label: "Full Name", value: applyPersonalInfo.name, field: "name" },
                        { label: "Email Address", value: applyPersonalInfo.email, field: "email" },
                        { label: "Phone Number", value: applyPersonalInfo.phone, field: "phone" },
                        { label: "LinkedIn Profile", value: applyPersonalInfo.linkedin, field: "linkedin" },
                        { label: "GitHub Profile", value: applyPersonalInfo.github, field: "github" },
                        { label: "Portfolio URL", value: applyPersonalInfo.portfolio, field: "portfolio" }
                      ].map((item) => (
                        <div key={item.field} className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-400">{item.label}</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.value || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setApplyPersonalInfo(prev => ({ ...prev, [item.field]: val }));
                                setWizardPersonalInfo(prev => ({ ...prev, [item.field]: val }));
                              }}
                              className="flex-1 min-w-0 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/5 focus:outline-none focus:border-indigo-500 text-xs text-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(item.value, item.label)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-white/5 transition-colors shrink-0"
                              title={`Copy ${item.label}`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-auto flex flex-col gap-2.5">
                      <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>
                          Submit application directly on the company page, then click **Log Application** below to record it.
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleSubmitApplication()}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Log Application</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Target Portal Iframe & Proxy */}
              <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden bg-slate-950/10">
                <div className="flex items-center justify-between shrink-0 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-300 font-mono text-[10px] truncate max-w-[280px] md:max-w-md">
                      Tunneling to: {selectedApplyJob.url}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(selectedApplyJob.url, "_blank")}
                      className="px-2.5 py-1 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] text-[10px] text-slate-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open External Page</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-[#07070a]">
                  <iframe
                    src={`http://localhost:5000/api/proxy?url=${encodeURIComponent(selectedApplyJob.url)}#${encodeURIComponent(JSON.stringify(applyPersonalInfo))}`}
                    className="w-full h-full border-0 bg-white"
                    title="Autofill Application Portal"
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* --- CONFIGURATION SETTINGS DRAWER --- */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-modal border-l border-white/10 p-6 flex flex-col justify-between transition-transform duration-500 ease-out transform ${
          isConfigOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold font-display text-white">System Settings</h2>
          </div>
          <button 
            onClick={() => setIsConfigOpen(false)}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-1.5 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 flex flex-col gap-5 text-sm">

            
            {/* Setting: Power Toggle */}
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">Main Power Grid</span>
                <button
                  onClick={() => setSystemOnline(!systemOnline)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemOnline ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      systemOnline ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Toggles background telemetry simulation and live dashboard status reporting.
              </p>
            </div>

            {/* Setting: Additional Agents */}
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">Enable Win Log Agent</span>
                <button
                  onClick={() => setShowWinLog(!showWinLog)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showWinLog ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showWinLog ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Adds the Win Log agent tile to track your achievements on the dashboard.
              </p>
            </div>

            {/* Agent Configurations */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Agent Configurations</span>

              {/* Job Search Config */}
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">💼 Job Search Preferences</span>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={wizardPrefTitles}
                    onChange={(e) => {
                      setWizardPrefTitles(e.target.value);
                      localStorage.setItem("agentos_pref_titles", e.target.value);
                    }}
                    placeholder="Job Titles (e.g. Frontend Engineer)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={wizardPrefLocation}
                    onChange={(e) => {
                      setWizardPrefLocation(e.target.value);
                      localStorage.setItem("agentos_pref_location", e.target.value);
                    }}
                    placeholder="Location (e.g. Remote)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* News Feed Config */}
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                <span className="text-[11px] font-mono font-bold text-sky-400 uppercase">📰 News Feed Keyword</span>
                <input
                  type="text"
                  value={newsKeyword}
                  onChange={(e) => {
                    setNewsKeyword(e.target.value);
                    localStorage.setItem("agentos_news_keyword", e.target.value);
                  }}
                  placeholder="Keyword (e.g. AI breakthroughs)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Budget Settings */}
              {finSetup && (
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                  <span className="text-[11px] font-mono font-bold text-green-400 uppercase">💰 Budget Setup</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Income ($)</span>
                      <input
                        type="number"
                        value={finSetup.income}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFinSetup(prev => {
                            const newSetup = { ...prev, income: val, spendable: Math.max(0, val - prev.deductions) };
                            const newAllocations = {};
                            FIN_CATS.forEach(c => {
                              newAllocations[c] = Math.round(((prev.percentages?.[c] || 0) / 100) * newSetup.spendable * 100) / 100;
                            });
                            newSetup.allocations = newAllocations;
                            return newSetup;
                          });
                        }}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-green-500 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Deductions ($)</span>
                      <input
                        type="number"
                        value={finSetup.deductions}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFinSetup(prev => {
                            const newSetup = { ...prev, deductions: val, spendable: Math.max(0, prev.income - val) };
                            const newAllocations = {};
                            FIN_CATS.forEach(c => {
                              newAllocations[c] = Math.round(((prev.percentages?.[c] || 0) / 100) * newSetup.spendable * 100) / 100;
                            });
                            newSetup.allocations = newAllocations;
                            return newSetup;
                          });
                        }}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-green-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Setting: Glow Intensity */}
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">Glow Intensity</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                  {glowIntensity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Adjusts the ambient lighting glow density for active grid tile nodes.
              </p>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Node Details</span>
              
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Core Version</span>
                  <span className="text-slate-300">v1.2-alpha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Node Location</span>
                  <span className="text-slate-300">USA_EAST_NET</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Protocol</span>
                  <span className="text-slate-300 text-indigo-400 font-semibold">VITE_HMR_ACTIVE</span>
                </div>
              </div>
            </div>

          </div>

        {/* Footer actions */}
        <div className="border-t border-white/5 pt-4">
          <button 
            onClick={() => {
              localStorage.clear();
              setFinSetup(null);
              setFinExpenses([]);
              setFinHistory([]);
              setCalendarMode(null);
              setCalendarEvents([]);
              setEmails([]);
              setEmailMode(null);
              setNewsKeyword("");
              setWizardPrefTitles("Frontend Engineer");
              setWizardPrefLocation("Remote");
              setShowWinLog(false);
              setWaterCups(0);
              setExerciseMinutes(0);
              setIsConfigOpen(false);
              showSystemToast("🔄 System cleared and reset successfully!");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-xs font-semibold text-red-400 transition-all duration-300 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Reset Grid Node</span>
          </button>
        </div>
      </div>
      
      {/* --- EVENT DELETE CONFIRMATION POPUP --- */}
      {deleteConfirmEventId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200">
          <div onClick={() => setDeleteConfirmEventId(null)} className="absolute inset-0 bg-[#020204]/90 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-modal rounded-2xl overflow-hidden flex flex-col p-6 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-xl text-red-400 animate-pulse shadow-inner">
                🗑️
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Cancel Event</h3>
                {(() => {
                  const targetEvent = calendarEvents.find(e => e.id === deleteConfirmEventId);
                  const targetTitle = targetEvent ? targetEvent.title : "this event";
                  return (
                    <p className="text-xs text-slate-400 leading-normal">
                      Are you sure you want to cancel and delete <span className="text-red-400 font-bold">"{targetTitle}"</span> from your schedule? This action cannot be undone.
                    </p>
                  );
                })()}
              </div>
              
              <div className="w-full flex flex-col gap-2 mt-2">
                <button
                  onClick={() => handleDeleteCalendarEvent(deleteConfirmEventId)}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/10 transition-all active:scale-95"
                >
                  Yes, Cancel Event
                </button>
                <button
                  onClick={() => setDeleteConfirmEventId(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 font-semibold text-xs rounded-xl transition-all active:scale-95"
                >
                  No, Keep Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EMAIL FOLLOW-UP POPUP EDITOR --- */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-350 opacity-100 visible">
          <div onClick={() => setShowFollowUpModal(false)} className="absolute inset-0 bg-[#020204]/85 backdrop-blur-md" />
          <div className="relative w-full max-w-xl glass-modal rounded-2xl overflow-hidden flex flex-col p-6 border border-indigo-500/20">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Draft Follow-up Email</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Edit and send follow-up for {followUpCompany}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFollowUpModal(false)} 
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">From</label>
                <input 
                  type="text" 
                  value={activeUser?.email || ""}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">To</label>
                <input 
                  type="email" 
                  value={followUpTo}
                  onChange={e => setFollowUpTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={followUpSubject}
                  onChange={e => setFollowUpSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Message Body</label>
                <textarea 
                  rows="10"
                  value={followUpBody}
                  onChange={e => setFollowUpBody(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSendingFollowUp || !followUpTo.trim() || !followUpSubject.trim() || !followUpBody.trim()}
                onClick={handleSendFollowUp}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isSendingFollowUp ? (
                  <>
                    <Loader className="w-3 animate-spin text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LOG EXPENSE POPUP MODAL --- */}
      {finShowLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-350 opacity-100 visible">
          <div onClick={() => setFinShowLogForm(false)} className="absolute inset-0 bg-[#020204]/85 backdrop-blur-md" />
          <div className="relative w-full max-w-md glass-modal rounded-2xl overflow-hidden flex flex-col p-6 border border-green-500/20">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Log New Expense</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Record a transaction to current month's budget</p>
                </div>
              </div>
              <button 
                onClick={() => setFinShowLogForm(false)} 
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(finLogAmount);
                if (!amt || amt <= 0) return;
                const entry = {
                  id: Date.now(),
                  amount: amt,
                  category: finLogCategory,
                  note: finLogNote.trim(),
                  date: new Date().toISOString(),
                  recurring: finLogRecurring
                };
                setFinExpenses(prev => [entry, ...prev]);
                setFinLogAmount("");
                setFinLogNote("");
                setFinLogRecurring(false);
                setFinShowLogForm(false);
                showSystemToast(`✅ $${amt.toFixed(2)} logged to ${FIN_CAT_META[finLogCategory].label}`);
              }}
              className="flex flex-col gap-4 text-xs font-sans"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number" min="0.01" step="0.01" required
                  value={finLogAmount}
                  onChange={e => setFinLogAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-green-500 font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Category</label>
                <select
                  value={finLogCategory}
                  onChange={e => setFinLogCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-green-500 text-xs"
                >
                  {FIN_CATS.map(c => <option key={c} value={c}>{FIN_CAT_META[c].emoji} {FIN_CAT_META[c].label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Note (Optional)</label>
                <input
                  type="text"
                  value={finLogNote}
                  onChange={e => setFinLogNote(e.target.value)}
                  placeholder="e.g. Weekly grocery shopping"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-green-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2.5 px-1 py-1">
                <input
                  type="checkbox"
                  id="finLogRecurringModal"
                  checked={finLogRecurring}
                  onChange={e => setFinLogRecurring(e.target.checked)}
                  className="rounded border-white/10 bg-slate-950 text-green-500 focus:ring-green-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="finLogRecurringModal" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  Standard / Recurring Monthly Expense
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setFinShowLogForm(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EMAIL DETAIL VIEW POPUP MODAL --- */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-350 opacity-100 visible">
          <div onClick={() => setSelectedEmail(null)} className="absolute inset-0 bg-[#020204]/85 backdrop-blur-md" />
          <div className="relative w-full max-w-2xl h-[70vh] glass-modal rounded-2xl overflow-hidden flex flex-col p-6 border border-teal-500/20">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0">
                  ✉️
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate leading-snug">{selectedEmail.subject}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="text-white font-semibold">{selectedEmail.fromName}</span>
                    <span className="text-slate-600">|</span>
                    <span className="truncate max-w-[200px]">{selectedEmail.from}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono">{selectedEmail.date}</span>
                <button 
                  onClick={() => setSelectedEmail(null)} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 whitespace-pre-line text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5 leading-relaxed font-sans overflow-y-auto mb-4">
              {selectedEmail.body}
            </div>

            {/* Quick Options Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                {/* Reply Option */}
                <button
                  onClick={() => {
                    setFollowUpTo(selectedEmail.from);
                    setFollowUpSubject(`Re: ${selectedEmail.subject}`);
                    setFollowUpCompany(selectedEmail.fromName);
                    setFollowUpBody(`\n\n\n--- Original Message ---\nFrom: ${selectedEmail.fromName} <${selectedEmail.from}>\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`);
                    setSelectedEmail(null);
                    setShowFollowUpModal(true);
                  }}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>

                {/* Schedule in Calendar Option */}
                <button
                  onClick={() => {
                    setEventTitle(`Follow-up: ${selectedEmail.subject}`);
                    setEventDescription(`Regarding email from ${selectedEmail.fromName} (${selectedEmail.from})\n\nEmail Content Snippet: ${selectedEmail.snippet}`);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    const pad = num => String(num).padStart(2, '0');
                    const localISO = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
                    setEventStart(localISO);
                    
                    const tomorrowEnd = new Date(tomorrow);
                    tomorrowEnd.setHours(9, 30, 0, 0);
                    const localISOEnd = `${tomorrowEnd.getFullYear()}-${pad(tomorrowEnd.getMonth() + 1)}-${pad(tomorrowEnd.getDate())}T${pad(tomorrowEnd.getHours())}:${pad(tomorrowEnd.getMinutes())}`;
                    setEventEnd(localISOEnd);
                    
                    setSelectedEmail(null);
                    setIsCalendarOpen(true);
                    showSystemToast("📅 Schedule form opened with email details pre-filled.");
                  }}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-semibold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>📅</span>
                  <span>Schedule in Calendar</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );

  // Cover Letter formatter callback
  function coverLetterDraftFormatter(company, title, standsOut) {
    if (applyCoverLetter) return applyCoverLetter;
    const draft = `Dear Hiring Team at ${company},\n\nI am writing to express my strong interest in the ${title} role. Having reviewed the qualifications, I believe my skills are a direct match. In particular, ${standsOut.toLowerCase().replace("your ", "my ")}\n\nWith my background in software engineering, I am excited about the opportunity to contribute to ${companyDescriptionSelector(company)}. My LinkedIn (${wizardPersonalInfo.linkedin}) and GitHub (${wizardPersonalInfo.github}) are verified below.\n\nThank you for your time and consideration.\n\nSincerely,\n${wizardPersonalInfo.name}`;
    return draft;
  }
}

export default App;
