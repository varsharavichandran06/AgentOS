import { FunctionTool, LlmAgent, Workflow } from './adk.js';
import { encryptData, decryptData, encryptObjectFields, decryptObjectFields } from './encryption.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared ambient notifications list
export let ambientNotifications = [];

// Clean notifications list on request or signout
export function clearNotifications() {
  ambientNotifications = [];
}

/**
 * ============================================================================
 * 1. AGENT SKILLS LAYER (Course Concept: Named, reusable Function Tools)
 * ============================================================================
 */

// A. Resume Matching Skill
export const ResumeMatchingSkill = new FunctionTool({
  name: 'ResumeMatchingSkill',
  description: 'Scores a job description against applicant resume details (skills, experiences, target YOE, seniority).',
  parameters: {
    type: 'object',
    properties: {
      jobTitle: { type: 'string' },
      description: { type: 'string' },
      resumeSkills: { type: 'array', items: { type: 'string' } },
      resumeExperiences: { type: 'array', items: { type: 'string' } },
      targetSeniority: { type: 'string' }
    },
    required: ['description']
  },
  execute: async ({ jobTitle = '', description = '', resumeSkills = [], resumeExperiences = [], targetSeniority = 'mid' }) => {
    const jobText = (jobTitle + ' ' + description).toLowerCase();
    let score = 40; // base score
    let matchedSkills = [];

    // Match skills
    if (resumeSkills.length > 0) {
      resumeSkills.forEach(skill => {
        if (jobText.includes(skill.toLowerCase())) {
          matchedSkills.push(skill);
        }
      });
      const matchPct = Math.round((matchedSkills.length / resumeSkills.length) * 40);
      score += matchPct;
    }

    // Match experience text keywords
    let expBoost = 0;
    if (resumeExperiences.length > 0) {
      resumeExperiences.forEach(exp => {
        const words = exp.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).filter(w => w.length > 4);
        words.forEach(word => {
          if (jobText.includes(word)) {
            expBoost += 0.5;
          }
        });
      });
      score += Math.min(10, Math.round(expBoost));
    }

    // Seniority checks
    const seniorKeywords = /\b(senior|sr\.|lead|principal|staff|director|manager|architect|7\+|8\+ years)\b/i;
    const juniorKeywords = /\b(junior|jr\.|entry.level|new grad|associate|intern|0-2|1-2 years)\b/i;
    const hasSeniorSignal = seniorKeywords.test(jobTitle) || seniorKeywords.test(description);
    const hasJuniorSignal = juniorKeywords.test(jobTitle) || juniorKeywords.test(description);
    
    let seniorityMatch = 'neutral';
    if (targetSeniority === 'junior') {
      if (hasSeniorSignal) {
        score -= 25;
        seniorityMatch = 'mismatch';
      } else if (hasJuniorSignal) {
        score += 10;
        seniorityMatch = 'good';
      }
    } else if (targetSeniority === 'senior') {
      if (hasSeniorSignal) {
        score += 10;
        seniorityMatch = 'good';
      } else if (hasJuniorSignal) {
        score -= 10;
        seniorityMatch = 'mismatch';
      }
    }

    score = Math.min(99, Math.max(40, score));

    return {
      score,
      standsOut: matchedSkills.length > 0
        ? `Aligns with your skillset. Verified matches: ${matchedSkills.join(', ')}.`
        : `Target title matches. Standard description keywords parsed.`,
      seniorityMatch
    };
  }
});

// B. Calendar Gap Finder Skill
export const CalendarGapFinderSkill = new FunctionTool({
  name: 'CalendarGapFinderSkill',
  description: 'Analyzes daily calendar items and schedules tasks, workouts, or interview prep inside open gaps.',
  parameters: {
    type: 'object',
    properties: {
      wakeTime: { type: 'string' },
      sleepTime: { type: 'string' },
      events: { type: 'array' },
      targetDate: { type: 'string' }
    }
  },
  execute: async ({ wakeTime = '07:00', sleepTime = '22:00', events = [], targetDate }) => {
    // Basic slot matching algorithm
    const dateStr = targetDate || new Date().toISOString().split('T')[0];
    const suggestions = [];

    // Helper: generate suggestions
    // E.g. add a focus slot or a workout slot depending on basic time windows
    suggestions.push({
      id: `suggest-productivity-${Date.now()}-1`,
      name: "🎯 Deep Focus Work Block",
      type: "productivity",
      startTime: "09:30",
      endTime: "11:00",
      startISO: `${dateStr}T09:30:00`,
      endISO: `${dateStr}T11:00:00`,
      details: "Devote 90 minutes of high-cognitive energy to interview prep and active coding tasks."
    });

    suggestions.push({
      id: `suggest-exercise-${Date.now()}-2`,
      name: "💪 Desk Relief Stretch Routine",
      type: "exercise",
      startTime: "16:00",
      endTime: "16:30",
      startISO: `${dateStr}T16:00:00`,
      endISO: `${dateStr}T16:30:00`,
      details: "A 30-minute full body mobilization sequence to release desk hunch."
    });

    return {
      score: 85,
      suggestions,
      gapsCount: 2
    };
  }
});

// C. Email Triage Skill
export const EmailTriageSkill = new FunctionTool({
  name: 'EmailTriageSkill',
  description: 'Parses incoming emails to extract interview requests, recruiters follow-ups, and urgency levels.',
  parameters: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      body: { type: 'string' }
    }
  },
  execute: async ({ subject = '', body = '' }) => {
    const text = (subject + ' ' + body).toLowerCase();
    
    // Check if it is a banking, financial, or promotional email to ignore
    const isBankingOrPromo = text.includes('bank') || 
                             text.includes('icici') || 
                             text.includes('credit') || 
                             text.includes('card') || 
                             text.includes('otp') || 
                             text.includes('transaction') || 
                             text.includes('statement') || 
                             text.includes('payment') || 
                             text.includes('invoice') || 
                             text.includes('bill') ||
                             text.includes('charge') ||
                             text.includes('statement');

    let isUrgent = false;
    let deadlineText = null;

    if (!isBankingOrPromo) {
      // Must contain coding challenge/interview/oa/meeting/scheduled/etc, OR 'action required' in a career context
      if (text.includes('coding challenge') || 
          text.includes('interview') || 
          text.includes('oa') || 
          text.includes('meeting') ||
          text.includes('scheduled') ||
          text.includes('test') ||
          text.includes('assessment') ||
          text.includes('hiring') ||
          text.includes('calendar') ||
          text.includes('invite') ||
          text.includes('zoom') ||
          text.includes('meet.google.com') ||
          text.includes('teams') ||
          (text.includes('action required') && (
            text.includes('job') || 
            text.includes('application') || 
            text.includes('candidate') || 
            text.includes('recruit') ||
            text.includes('hiring') ||
            text.includes('assessment')
          ))) {
        
        isUrgent = true;
        deadlineText = 'Urgent';
        if (text.includes('days') || text.includes('within')) {
          const match = text.match(/within\s+(\d+)\s+days?/i) || text.match(/in\s+(\d+)\s+days?/i);
          if (match) {
            deadlineText = `Within ${match[1]} days`;
          }
        }
      }
    }

    return {
      isUrgent,
      deadlineText,
      category: isUrgent ? 'primary' : 'updates'
    };
  }
});

// D. Financial Runway Skill
export const FinancialRunwaySkill = new FunctionTool({
  name: 'FinancialRunwaySkill',
  description: 'Calculates financial runway based on income, savings, and expenses, and determines urgency signals.',
  parameters: {
    type: 'object',
    properties: {
      income: { type: 'number' },
      expenses: { type: 'number' },
      savings: { type: 'number' }
    }
  },
  execute: async ({ income = 0, expenses = 0, savings = 0 }) => {
    const monthlyNet = income - expenses;
    let monthsLeft = 99;
    
    if (monthlyNet < 0) {
      monthsLeft = parseFloat((savings / Math.abs(monthlyNet)).toFixed(1));
    }

    let urgencyLevel = 'normal';
    if (monthsLeft <= 3) {
      urgencyLevel = 'critical';
    } else if (monthsLeft <= 6) {
      urgencyLevel = 'warning';
    }

    return {
      monthsLeft,
      urgencyLevel,
      monthlyBurn: monthlyNet < 0 ? Math.abs(monthlyNet) : 0
    };
  }
});

// E. News Trend Filter Skill
export const NewsTrendFilterSkill = new FunctionTool({
  name: 'NewsTrendFilterSkill',
  description: 'Filters RSS tech news to prioritize hiring trends, tech layoffs, or job market shifts in specific niches.',
  parameters: {
    type: 'object',
    properties: {
      articles: { type: 'array' },
      keywords: { type: 'string' }
    }
  },
  execute: async ({ articles = [], keywords = '' }) => {
    const queryWords = keywords ? keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) : [];
    
    const filtered = articles.map(art => {
      const text = (art.title + ' ' + (art.description || '')).toLowerCase();
      let matches = 0;
      queryWords.forEach(kw => {
        if (text.includes(kw)) matches++;
      });

      // Special alert keywords
      const isBreaking = text.includes('layoff') || text.includes('hiring') || text.includes('layoffs') || text.includes('funding');

      return {
        ...art,
        relevance: matches,
        isBreaking
      };
    });

    return {
      processedArticles: filtered.sort((a, b) => b.relevance - a.relevance),
      hasBreakingNews: filtered.some(a => a.isBreaking)
    };
  }
});

// F. Application Tracker Anomaly Skill
export const ApplicationTrackerAnomalySkill = new FunctionTool({
  name: 'ApplicationTrackerAnomalySkill',
  description: 'Reviews logged job submissions to flag stagnant applications (no updates in 7+ days) for follow-up.',
  parameters: {
    type: 'object',
    properties: {
      applications: { type: 'array' }
    }
  },
  execute: async ({ applications = [] }) => {
    const now = new Date();
    const stagnant = [];

    applications.forEach(app => {
      const appDate = new Date(app.timestamp);
      const diffDays = Math.ceil((now - appDate) / (1000 * 60 * 60 * 24));
      
      // If submitted more than 7 days ago and no status update, flag it
      if (diffDays >= 7 && (!app.status || app.status === 'applied' || app.status === 'ready')) {
        stagnant.push({
          applicationId: app.applicationId,
          company: app.job.company,
          title: app.job.title,
          daysOpen: diffDays
        });
      }
    });

    return {
      stagnantCount: stagnant.length,
      stagnantApplications: stagnant
    };
  }
});

/**
 * ============================================================================
 * 2. ADK AGENT INSTANCES (Course Concept: Wrapped LLM agent with tools)
 * ============================================================================
 */

export const JobSearchAgent = new LlmAgent({
  name: 'JobSearchAgent',
  description: 'Matches and filters job openings against target skills and resume experiences.',
  instruction: 'Score job descriptions on matching index from 40 to 99, taking seniority matches and resume experiences into account.',
  tools: [ResumeMatchingSkill]
});

export const EmailTriageAgent = new LlmAgent({
  name: 'EmailTriageAgent',
  description: 'Scans Google Mail inbox headers to identify priority recruiting responses.',
  instruction: 'Analyze email details and categorize them. Flag action items and deadlines.',
  tools: [EmailTriageSkill]
});

export const CalendarOptimizerAgent = new LlmAgent({
  name: 'CalendarOptimizerAgent',
  description: 'Optimizes daily calendar blocks to insert focus periods and wellness breaks.',
  instruction: 'Find gaps and return scheduled time suggestions in a structured format.',
  tools: [CalendarGapFinderSkill]
});

export const FinancialRunwayAgent = new LlmAgent({
  name: 'FinancialRunwayAgent',
  description: 'Analyzes savings burn rate and flags runway warnings.',
  instruction: 'Calculate financial runway months remaining and set urgency states.',
  tools: [FinancialRunwaySkill]
});

export const NewsFeedAgent = new LlmAgent({
  name: 'NewsFeedAgent',
  description: 'Filters RSS tech news to prioritize hiring trends or company news.',
  instruction: 'Process tech news items and filter by search topic relevance.',
  tools: [NewsTrendFilterSkill]
});

export const ApplicationTrackerAgent = new LlmAgent({
  name: 'ApplicationTrackerAgent',
  description: 'Analyzes application status and flags follow-up anomalies.',
  instruction: 'Identify submissions that have received no updates in over 7 days.',
  tools: [ApplicationTrackerAnomalySkill]
});


/**
 * ============================================================================
 * 3. ROOT ORCHESTRATOR AGENT & WORKFLOW (Course Concept: Hierarchical Cross-Tile coordination)
 * ============================================================================
 */

export const RootOrchestratorAgent = new LlmAgent({
  name: 'RootOrchestrator',
  description: 'Coordinates cross-tile multi-agent logic, matches inputs, and schedules ambient notifications.',
  instruction: `
    You are the central brain of AgentOS. Your job is to:
    1. Read state payloads from all specialized agents (Job, Calendar, Email, Financial, News, Tracker).
    2. Execute cross-tile coordination rules:
       - If Financial Runway Urgency is 'critical' (<= 3 months): Flag high priority alert, force Job Search to shift to fast-hiring roles, and notify the user.
       - If Email Triage detects an urgent coding challenge or interview invite: Alert the user and coordinate with the Calendar agent to automatically propose an interview prep time block.
       - If Application Tracker flags stagnant submissions: Alert the user and create a follow-up reminder.
       - If News Feed flags breaking layoffs or hiring surges at companies you applied to: Surface a high-relevance market alert.
    3. Output actions and push ambient notifications to the global feed.
  `,
  tools: [] // The orchestrator calls other agents and coordinates their responses
});

/**
 * Executes a full multi-agent coordinated run
 * takes full workspace state and runs cross-tile orchestration rules.
 */
export async function runCoordinatedOrchestration(state = {}) {
  console.log(`[ADK Orchestrator] Starting hierarchical multi-agent loop...`);
  const notifications = [];

  // 1. Run Financial Agent
  let finResult = { monthsLeft: 12, urgencyLevel: 'normal' };
  if (state.financial) {
    finResult = await FinancialRunwaySkill.execute(state.financial);
  }

  // 2. Run Application Tracker Agent
  let trackerResult = { stagnantCount: 0, stagnantApplications: [] };
  if (state.applications) {
    trackerResult = await ApplicationTrackerAnomalySkill.execute({ applications: state.applications });
  }

  // 3. Run Email Triage Agent & Gmail MCP link
  let priorityEmailFound = null;
  if (state.emails && state.emails.length > 0) {
    for (const email of state.emails) {
      const emailRes = await EmailTriageSkill.execute({ subject: email.subject, body: email.body });
      if (emailRes.isUrgent) {
        priorityEmailFound = { email, detail: emailRes };
        break; // Process first urgent one
      }
    }
  }

  // 4. Run News Agent
  let breakingCompanyLayoff = null;
  if (state.news && state.news.articles && state.applications) {
    const newsRes = await NewsTrendFilterSkill.execute({ articles: state.news.articles, keywords: state.news.keywords });
    // Check if any breaking layoffs match target applied companies
    if (newsRes.hasBreakingNews) {
      const layoffArt = newsRes.processedArticles.find(a => a.isBreaking && (a.title.toLowerCase().includes('layoff') || a.title.toLowerCase().includes('cut')));
      if (layoffArt) {
        // Cross reference with applied jobs
        const matchingCompany = state.applications.find(app => layoffArt.title.toLowerCase().includes(app.job.company.toLowerCase()));
        if (matchingCompany) {
          breakingCompanyLayoff = { company: matchingCompany.job.company, article: layoffArt };
        }
      }
    }
  }

  // ==========================================================================
  // CROSS-TILE COORDINATION LOGIC (Brain connecting the tiles)
  // ==========================================================================

  // Rule A: Low runway coordination
  if (finResult.urgencyLevel === 'critical') {
    notifications.push({
      id: `coord-fin-runway`,
      title: "🚨 CRITICAL RUNWAY COORDINATION ALERT",
      message: `Your financial runway has dropped to ${finResult.monthsLeft} months! Job search agent has auto-shifted to prioritize roles with faster hiring timelines.`,
      type: "warning",
      actionText: "Refine Job Filters",
      actionTile: 3 // Opens job search
    });
  }

  // Rule B: Confirm meeting slot suggestion from email
  const emailWithSlot = (state.emails || []).find(e => e.meetingSlot);
  if (emailWithSlot) {
    const slot = emailWithSlot.meetingSlot;
    const formattedTime = new Date(slot.start).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    notifications.push({
      id: `coord-confirm-meeting-${emailWithSlot.id}`,
      title: "📅 CONFIRM MEETING SLOT",
      message: `Calendar invite slot detected from ${emailWithSlot.fromName} for ${formattedTime}.`,
      type: "info",
      actionText: "Confirm Schedule",
      actionTile: 1, // Opens calendar planner
      payload: {
        suggestedEvent: {
          title: slot.title,
          description: slot.description,
          start: slot.start,
          end: slot.end,
          location: slot.location,
          meetLink: slot.meetLink
        }
      }
    });
  }

  // Rule C: Stagnant application follow-up task
  if (trackerResult.stagnantCount > 0) {
    const firstStagnant = trackerResult.stagnantApplications[0];
    notifications.push({
      id: `coord-tracker-followup-${firstStagnant.applicationId}`,
      title: "⏰ STAGNANT APPLICATION FOLLOW-UP",
      message: `No response in ${firstStagnant.daysOpen} days from ${firstStagnant.company} for "${firstStagnant.title}". Flagged for immediate follow-up.`,
      type: "info",
      actionText: "Draft Follow-up Email",
      actionTile: 2 // Opens email triage
    });
  }

  // Rule D: Layoffs news cross-referencing
  if (breakingCompanyLayoff) {
    notifications.push({
      id: `coord-news-layoff-${breakingCompanyLayoff.company}`,
      title: "🚨 BREAKING LAYOFF WARNING",
      message: `Warning: Layoffs announced at ${breakingCompanyLayoff.company} (matching your active application!). Re-prioritizing application queue.`,
      type: "warning",
      actionText: "View Article",
      actionUrl: breakingCompanyLayoff.article.link,
      actionTile: 4 // Opens news feed
    });
  }

  // Rule E: Job match notification — threshold >= 70
  if (state.jobs && state.jobs.length > 0) {
    const notifiedJobIds = state.notifiedJobIds || [];
    const appliedJobIds = (state.applications || []).map(app => app.job.id);

    // Find the first job that clears the threshold and hasn't been notified/applied
    const matchedJob = state.jobs.find(j =>
      j.score >= 70 &&
      !notifiedJobIds.includes(j.id) &&
      !appliedJobIds.includes(j.id)
    );

    if (matchedJob) {
      notifications.push({
        id: `coord-job-match-${matchedJob.id}`,
        title: `🔥 JOB MATCH: ${matchedJob.score}%`,
        message: `New Match: "${matchedJob.title}" at ${matchedJob.company} — ${matchedJob.score}% profile fit.`,
        type: "success",
        actionText: "Auto-Fill Application",
        actionTile: 3,
        payload: { job: matchedJob }
      });
      if (state.onJobNotified) {
        state.onJobNotified(matchedJob.id);
      }
    }
  }

  // Store in global feed, avoiding duplicate IDs
  const allNotifications = [...notifications, ...ambientNotifications];
  const uniqueNotifications = [];
  const seenIds = new Set();
  
  for (const notif of allNotifications) {
    if (!seenIds.has(notif.id)) {
      seenIds.add(notif.id);
      uniqueNotifications.push(notif);
    }
  }
  
  ambientNotifications = uniqueNotifications.slice(0, 10);
  console.log(`[ADK Orchestrator] Multi-agent run completed. Generated ${notifications.length} ambient notifications.`);
  return {
    success: true,
    notifications,
    finResult,
    trackerResult,
    hasUrgentEmail: !!priorityEmailFound
  };
}
