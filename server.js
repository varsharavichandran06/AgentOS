import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { runCoordinatedOrchestration, ambientNotifications, clearNotifications } from './agents.js';
import { saveJobApplication, getApplicationById, saveWellnessEntry, getWellnessHistory } from './secureDataStore.js';
import { IntelligentReschedulerAgent, ConflictAnalysisSkill, decideRescheduleWithLLM } from './intelligentRescheduler.js';
import { getTokens, setTokens, deleteTokens, hasTokens } from './tokenStore.js';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Every dateTime we send to the Google Calendar API must carry a timezone (either an
// explicit offset in the string, or this field) or Google rejects the request outright
// with "Missing time zone definition for start time." Our own generated event times
// (from the optimizer/scheduler) are local wall-clock strings with no offset, so this is
// required for those; it's a harmless no-op alongside the full UTC timestamps the manual
// add-event form sends.
const SERVER_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Global Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[HTTP] [${timestamp}] ${req.method} ${req.originalUrl} - processing...`);
  
  // Hook res.end to log response details
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const levelStr = status >= 400 ? 'FAILURE' : 'SUCCESS';
    const logMsg = `[HTTP] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${levelStr} (${status}) in ${duration}ms`;
    
    if (status >= 500) {
      console.error(logMsg);
    } else if (status >= 400) {
      console.warn(logMsg);
    } else {
      console.log(logMsg);
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
});


// Catch-all middleware to proxy relative asset requests of the target careers site
app.use(async (req, res, next) => {
  // Ignore /api routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Get active target origin from referer or cookie
  const referer = req.headers.referer || '';
  let targetOrigin = '';

  if (referer.includes('/api/proxy')) {
    try {
      const refererUrl = new URL(referer);
      const urlParam = refererUrl.searchParams.get('url');
      if (urlParam) {
        targetOrigin = new URL(urlParam).origin;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!targetOrigin) {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/agentos_target_origin=([^;]+)/);
    if (match) {
      targetOrigin = decodeURIComponent(match[1]);
    }
  }

  if (targetOrigin) {
    const targetUrl = `${targetOrigin}${req.originalUrl}`;
    console.log(`[Proxy Asset] Forwarding: ${req.method} ${req.originalUrl} -> ${targetUrl}`);

    try {
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.referer;
      
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...headers,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: hasBody ? req : undefined,
        duplex: hasBody ? 'half' : undefined
      });

      // Transfer headers, stripping any x-frame-options or content-security-policy
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['content-security-policy', 'x-frame-options', 'access-control-allow-origin', 'x-content-type-options'].includes(lowerKey)) {
          res.setHeader(key, value);
        }
      });

      res.status(response.status);
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error(`[Proxy Asset Error] Failed to forward ${req.originalUrl}: ${err.message}`);
      res.status(500).send(`Proxy Asset Error: ${err.message}`);
    }
  } else {
    next();
  }
});

// Helper function to send real confirmation email using Nodemailer (Ethereal SMTP by default)
async function sendConfirmationEmail(applicant, job) {
  try {
    // Generate test SMTP service account from ethereal.email if no environment variables
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || testAccount.smtp.host,
      port: parseInt(process.env.SMTP_PORT || testAccount.smtp.port),
      secure: process.env.SMTP_SECURE === 'true' || testAccount.smtp.secure,
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass
      }
    });

    const mailOptions = {
      from: '"AgentOS Operations" <noreply@agentos.net>',
      to: applicant.email,
      subject: `[AgentOS] Job Application Logged - ${job.title} at ${job.company}`,
      html: `
        <div style="background-color:#0a0a0f; color:#cbd5e1; font-family:sans-serif; padding:30px; border-radius:12px; border:1px solid #1f1f2e; max-width:600px; margin:auto;">
          <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#6366f1; margin:0; font-family:sans-serif;">AgentOS Command Center</h2>
            <span style="font-size:10px; color:#475569; font-family:monospace; text-transform:uppercase; letter-spacing:2px;">Secure Telemetry Dispatch</span>
          </div>
          
          <p>Hello <strong>${applicant.name}</strong>,</p>
          <p>This email confirms that your application for the <strong>${job.title}</strong> position has been successfully recorded in the AgentOS local workstation and submitted to the company's job gateway.</p>
          
          <div style="background:#13131c; padding:20px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin:20px 0;">
            <h3 style="margin-top:0; color:#fff; font-size:16px;">Application Metadata</h3>
            <table style="width:100%; border-collapse:collapse; font-size:14px; line-height:1.6;">
              <tr>
                <td style="color:#64748b; width:120px;">Position:</td>
                <td style="color:#e2e8f0;"><strong>${job.title}</strong></td>
              </tr>
              <tr>
                <td style="color:#64748b;">Company:</td>
                <td style="color:#e2e8f0;">${job.company}</td>
              </tr>
              <tr>
                <td style="color:#64748b;">Location:</td>
                <td style="color:#e2e8f0;">${job.location}</td>
              </tr>
              <tr>
                <td style="color:#64748b;">Applicant:</td>
                <td style="color:#e2e8f0;">${applicant.name} (${applicant.email})</td>
              </tr>
              <tr>
                <td style="color:#64748b;">Phone:</td>
                <td style="color:#e2e8f0;">${applicant.phone}</td>
              </tr>
              <tr>
                <td style="color:#64748b;">LinkedIn:</td>
                <td style="color:#e2e8f0; font-size:12px;">${applicant.linkedin || 'N/A'}</td>
              </tr>
              <tr>
                <td style="color:#64748b;">GitHub:</td>
                <td style="color:#e2e8f0; font-size:12px;">${applicant.github || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background:rgba(16, 185, 129, 0.05); padding:12px; border-radius:8px; border:1px solid rgba(16, 185, 129, 0.15); font-size:12px; color:#34d399; margin:20px 0;">
            <strong>Workstation Registry Log:</strong> Local database payload updated successfully. Secure transmission confirmed.
          </div>
          
          <p style="font-size:11px; color:#475569; margin-top:25px; border-top:1px solid #1f1f2e; padding-top:15px; font-family:monospace; text-align:center;">
            AgentOS Distributed Operations Center // SYSTEM_PORT_5000_OK
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { success: true, previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Error] ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Target job portal HTML proxy with scripts injection
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing target URL parameter (?url=...)");
  }

  try {
    console.log(`[Proxy] Fetching application page: ${targetUrl}`);
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Target responded with HTTP status ${response.status}`);
    }

    let html = await response.text();
    const targetOrigin = new URL(targetUrl).origin;

    // Set cookie to keep track of target origin for relative resource proxying
    res.cookie('agentos_target_origin', targetOrigin, { maxAge: 900000, path: '/' });

    // Rewrite relative URLs to absolute links
    html = html.replace(/(href|src)="\/([^"]+)"/g, `$1="${targetOrigin}/$2"`);
    html = html.replace(/(href|src)="\.\/([^"]+)"/g, `$1="${targetOrigin}/$2"`);

    // Inject JS that reads data from window hash and autofills input fields
    const injectScript = `
      <script>
        (function() {
          console.log("[AgentOS Proxy] Embedded script listening for Hash change.");
          
          function autofillInputs() {
            const hash = window.location.hash;
            if (!hash || hash.length < 2) return;
            
            try {
              const data = JSON.parse(decodeURIComponent(hash.substring(1)));
              console.log("[AgentOS Proxy] Found applicant credentials:", data);
              
              const formInputs = document.querySelectorAll("input, textarea, select");
              formInputs.forEach(el => {
                const name = (el.name || "").toLowerCase();
                const id = (el.id || "").toLowerCase();
                const placeholder = (el.placeholder || "").toLowerCase();
                const type = (el.type || "").toLowerCase();
                const combineLabel = (name + " " + id + " " + placeholder).trim();
                
                let valueToSet = "";
                
                if (combineLabel.includes("name") || combineLabel.includes("fullname") || combineLabel.includes("first_name") || combineLabel.includes("last_name")) {
                  valueToSet = data.name;
                } else if (type === "email" || combineLabel.includes("email") || combineLabel.includes("mail")) {
                  valueToSet = data.email;
                } else if (type === "tel" || combineLabel.includes("phone") || combineLabel.includes("mobile") || combineLabel.includes("tel") || combineLabel.includes("contact")) {
                  valueToSet = data.phone;
                } else if (combineLabel.includes("linkedin")) {
                  valueToSet = data.linkedin;
                } else if (combineLabel.includes("github")) {
                  valueToSet = data.github;
                } else if (combineLabel.includes("portfolio") || combineLabel.includes("website") || combineLabel.includes("site") || combineLabel.includes("personal")) {
                  valueToSet = data.portfolio;
                }
                
                if (valueToSet && !el.value) {
                  el.value = valueToSet;
                  // Trigger events for reactive form states (e.g. React/Vue apps)
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                  el.dispatchEvent(new Event("change", { bubbles: true }));
                }
              });
            } catch (e) {
              console.error("[AgentOS Proxy] Error parsing hash credentials:", e);
            }
          }
          
          window.addEventListener("load", () => {
            autofillInputs();
            // Periodically check for dynamically generated DOM forms
            setInterval(autofillInputs, 1000);
          });
          window.addEventListener("hashchange", autofillInputs);
        })();
      </script>
    `;

    // Inject right before closing body tag
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${injectScript}</body>`);
    } else {
      html += injectScript;
    }

    // Set header content type
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error(`[Proxy Connection Error] ${err.message}`);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(`
      <div style="background-color:#0d0d15; color:#ef4444; font-family:monospace; padding:30px; border-radius:12px; border:1px solid rgba(239,68,68,0.2); max-width:600px; margin:40px auto; text-align:center;">
        <h3 style="margin-top:0; color:#ef4444; font-size:18px;">Application Proxy Blocked</h3>
        <p style="color:#cbd5e1; font-size:13px; line-height:1.6; text-align:left;">
          The employer's career site rejected the proxy connection: <strong>${err.message}</strong>.
          <br/><br/>
          This occurs if their server is protected by cloudflare/antibot vectors.
          Please use the copy fields on the left column of AgentOS to easily fill this application, and click the <strong>Open External Job Page</strong> button.
        </p>
      </div>
    `);
  }
});

// Fetch latest news on a topic using Google News RSS
app.post('/api/news', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword parameter is required." });
  }

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=en-US&gl=US&ceid=US:en`;
    console.log(`[API News] Fetching RSS feed from: ${url}`);

    // Google News rate-limits by IP reputation as much as by request headers — a
    // realistic User-Agent doesn't fully fix requests from a shared datacenter IP
    // (like Cloud Run's), but it's free to send and does help some of the time.
    // One short retry absorbs the transient 503s seen in practice; if it still
    // fails, degrade gracefully (empty list) rather than 500 the whole endpoint
    // for what's a supplementary widget, not a core feature.
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    };

    let response = await fetch(url, { headers: fetchHeaders });
    if (!response.ok) {
      console.warn(`[API News] First attempt returned ${response.status}, retrying once...`);
      await new Promise(r => setTimeout(r, 1000));
      response = await fetch(url, { headers: fetchHeaders });
    }

    if (!response.ok) {
      console.warn(`[API News] Google News RSS unavailable (status ${response.status}) after retry — returning empty result.`);
      return res.json({ news: [] });
    }

    const xmlText = await response.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 5) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      
      let title = titleMatch ? titleMatch[1] : '';
      let link = linkMatch ? linkMatch[1] : '';
      let pubDate = pubDateMatch ? pubDateMatch[1] : '';
      let source = sourceMatch ? sourceMatch[1] : 'Google News';

      // Clean CDATA and decode HTML entities
      title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
      title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      
      link = link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
      pubDate = pubDate.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
      source = source.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');

      items.push({
        title,
        link,
        pubDate,
        source
      });
    }

    res.json({ news: items });
  } catch (err) {
    console.error(`[API News Error] ${err.message}`);
    res.status(500).json({ error: "Failed to fetch news feed: " + err.message });
  }
});

// Main scrape & keyword relevance rank endpoint
app.post('/api/search', async (req, res) => {
  const { email, titles, location, skills, yoe, seniority, resumeText, resumeSkills, resumeExperiences } = req.body;
  
  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    demoJobSearchTriggered = true;
    const cleanTitles = titles ? titles.split(',').map(t => t.trim()).filter(Boolean) : ["Frontend Engineer"];
    const cleanLocations = location ? location.split(',').map(l => l.trim()).filter(Boolean) : ["Remote"];
    
    const oneMinutePassed = demoSessionStartTime && (Date.now() - demoSessionStartTime >= 45000);
    const mockJobs = [];

    // IBM is always present (score 94%, <= 95%) - returned on first sync
    mockJobs.push({
      id: "demo-job-ibm",
      company: "IBM",
      companyEmoji: "█",
      companyDesc: "IBM Hybrid Cloud UX Innovation team developing state-of-the-art developer consoles.",
      title: cleanTitles[0] || "Senior Frontend Developer",
      score: 94,
      standsOut: "Strong experience match. Aligns with your target seniority level.",
      seniorityMatch: "perfect",
      location: cleanLocations[0] || "Remote",
      url: "https://ibm.com/careers",
      status: "ready"
    });

    if (oneMinutePassed) {
      // Add Google on second sync (score 87%, <= 95%) - notifies on second sync
      mockJobs.push({
        id: "demo-job-1",
        company: "Google",
        companyEmoji: "▲",
        companyDesc: "Google's Core Dev team working on next-gen productivity and scheduling tools.",
        title: cleanTitles[0] || "Frontend Engineer",
        score: 87,
        standsOut: "Aligns perfectly with your skillset. Aligns with your target title.",
        seniorityMatch: "perfect",
        location: cleanLocations[0] || "Remote",
        url: "https://google.com/careers",
        status: "ready"
      });

      // Add Meta (score 82%, <= 95%)
      mockJobs.push({
        id: "demo-job-2",
        company: "Meta",
        companyEmoji: "❖",
        companyDesc: "Meta Product Experience group focusing on layout optimizations and agent integrations.",
        title: cleanTitles[0] || "Frontend Engineer",
        score: 82,
        standsOut: "Aligns with your skillset. Aligns with your target title.",
        seniorityMatch: "perfect",
        location: cleanLocations[0] || "Remote",
        url: "https://meta.com/careers",
        status: "ready"
      });

      // Add Stripe (score 91%, <= 95%)
      mockJobs.push({
        id: "demo-job-3",
        company: "Stripe",
        companyEmoji: "⚡",
        companyDesc: "Stripe Dashboard Core infrastructure group building sleek premium interfaces.",
        title: cleanTitles.length > 1 ? cleanTitles[1] : "Software Developer",
        score: 91,
        standsOut: "Aligns with your skillset. Aligns with your target title.",
        seniorityMatch: "perfect",
        location: cleanLocations.length > 1 ? cleanLocations[1] : "Remote",
        url: "https://stripe.com/careers",
        status: "ready"
      });
    }

    console.log(`[API Demo Scrape] Returning ${mockJobs.length} mock search results for demouser@gmail (1 min elapsed: ${!!oneMinutePassed}).`);
    return res.json(mockJobs);
  }
  
  const cleanTitles = titles ? titles.split(',').map(t => t.trim()).filter(Boolean) : ["Frontend Engineer"];
  const cleanLocations = location ? location.split(',').map(l => l.trim()).filter(Boolean) : ["Remote"];
  const userYOE = parseInt(yoe) || 0;
  const userSeniority = (seniority || "").toLowerCase(); // "junior", "mid", "senior"

  // Seniority keyword patterns
  const seniorKeywords = /\b(senior|sr\.|lead|principal|staff|director|vp|head of|manager|architect|10\+|8\+|7\+ years)\b/i;
  const juniorKeywords = /\b(junior|jr\.|entry.level|new grad|graduate|intern|associate|0-2|1-2 years|no experience)\b/i;

  console.log(`[API Multi-Scrape] Starting concurrent search for Titles: [${cleanTitles.join(', ')}] in Locations: [${cleanLocations.join(', ')}]. Filter: "${skills || 'None'}" | YOE: ${userYOE} | Seniority: ${userSeniority || 'unset'}`);

  // Generate unique query combinations (cap at 4 combos to prevent CPU spike)
  const combos = [];
  for (const t of cleanTitles) {
    for (const l of cleanLocations) {
      combos.push({ title: t, location: l });
    }
  }
  const activeCombos = combos.slice(0, 4);
  // Bundled with the repo at jobscraper/main.py (a thin CLI wrapper around the
  // python-jobspy PyPI package) so this works in any environment, not just this
  // machine. PYTHON_BIN lets the binary name be overridden; it otherwise defaults
  // to what each OS actually ships (Windows: `python`, Linux containers: `python3`).
  const scriptPath = path.join(__dirname, 'jobscraper', 'main.py');
  const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');

  const scrapePromises = activeCombos.map(combo => {
    return new Promise((resolve) => {
      const cleanSearchTitle = combo.title.replace(/"/g, '\\"');
      const cleanSearchLocation = combo.location.replace(/"/g, '\\"');
      const cmd = `${pythonBin} "${scriptPath}" --site_name indeed,zip_recruiter --search_term "${cleanSearchTitle}" --location "${cleanSearchLocation}" --results_wanted 10 --format json`;
      
      console.log(`[API Multi-Scrape] Spawning sub-process: ${cmd}`);
      exec(cmd, { maxBuffer: 1024 * 1024 * 5, timeout: 45000 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`[API Multi-Scrape Fail] "${combo.title}" / "${combo.location}": ${error.message}`);
          return resolve([]);
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed || []);
        } catch (e) {
          console.error(`[API Multi-Scrape JSON Error] "${combo.title}" / "${combo.location}": ${e.message}`);
          resolve([]);
        }
      });
    });
  });

  try {
    const results = await Promise.all(scrapePromises);
    const allJobsRaw = results.flat();
    
    // Deduplicate jobs by id or title+company
    const parsedJobs = [];
    const seenKeys = new Set();
    for (const job of allJobsRaw) {
      const key = job.id || `${job.title || ''}-${job.company || ''}`.trim().toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        parsedJobs.push(job);
      }
    }

    const searchTitle = cleanTitles[0] || "Frontend Engineer";
    const searchLocation = cleanLocations[0] || "Remote";
    const searchTerms = skills ? skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
      
      // Map raw python-jobspy output fields and calculate real relevance match score
      const mappedJobs = parsedJobs.map((job, idx) => {
        const jobTitleText = (job.title || '').toLowerCase();
        const descriptionText = ((job.description || '') + ' ' + jobTitleText + ' ' + (job.company || '')).toLowerCase();
        
        // Calculate real matching percentage based on keyword search hits
        let score = 65; // base score
        let matchesFound = [];
        
        if (searchTerms.length > 0) {
          searchTerms.forEach(term => {
            if (descriptionText.includes(term)) {
              matchesFound.push(term);
            }
          });
          const matchPercentage = Math.round((matchesFound.length / searchTerms.length) * 30);
          score += matchPercentage;
        }
        
        // Add title boost
        if (jobTitleText.includes(searchTitle.toLowerCase())) {
          score += 4;
        }

        // ── Resume matching (Skills, Titles & Experiences) ──────────────────
        let resumeSkillsMatches = [];
        if (resumeSkills && resumeSkills.length > 0) {
          resumeSkills.forEach(skill => {
            if (descriptionText.includes(skill.toLowerCase())) {
              resumeSkillsMatches.push(skill);
            }
          });
          const resumeMatchPct = Math.round((resumeSkillsMatches.length / resumeSkills.length) * 15);
          score += resumeMatchPct;
        }

        let experienceBoost = 0;
        if (resumeExperiences && resumeExperiences.length > 0) {
          resumeExperiences.forEach(exp => {
            const words = exp.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).filter(w => w.length > 4);
            words.forEach(word => {
              if (descriptionText.includes(word)) {
                experienceBoost += 0.5;
              }
            });
          });
          score += Math.min(10, Math.round(experienceBoost));
        }

        // ── Seniority-aware scoring ──────────────────────────────────────────
        const jobHasSeniorSignal  = seniorKeywords.test(job.title || '') || seniorKeywords.test(job.description || '');
        const jobHasJuniorSignal  = juniorKeywords.test(job.title || '') || juniorKeywords.test(job.description || '');
        const resumeHasSeniorExperience = resumeExperiences && resumeExperiences.some(exp => /\b(senior|lead|principal|staff|manager)\b/i.test(exp));

        let seniorityMatch = "neutral"; // "good" | "neutral" | "mismatch"

        if (userSeniority === "junior") {
          if (jobHasSeniorSignal) {
            if (resumeHasSeniorExperience) {
              score -= 10; // reduce penalty because resume has senior leadership roles
              seniorityMatch = "neutral";
            } else {
              score -= 25; // heavily penalise over-levelled roles
              seniorityMatch = "mismatch";
            }
          } else if (jobHasJuniorSignal) {
            score += 10; // boost entry-level signals
            seniorityMatch = "good";
          }
        } else if (userSeniority === "mid") {
          if (/\b(director|vp|head of|principal|10\+)\b/i.test(job.title || '')) {
            if (resumeHasSeniorExperience) {
              score -= 10;
              seniorityMatch = "neutral";
            } else {
              score -= 20;
              seniorityMatch = "mismatch";
            }
          } else if (jobHasSeniorSignal && !jobHasJuniorSignal) {
            score -= 8; // slight penalty for pure senior roles
            seniorityMatch = "neutral";
          } else if (!jobHasSeniorSignal) {
            score += 5;
            seniorityMatch = "good";
          }
        } else if (userSeniority === "senior") {
          if (jobHasSeniorSignal) {
            score += 10;
            seniorityMatch = "good";
          } else if (jobHasJuniorSignal) {
            score -= 10;
            seniorityMatch = "mismatch";
          }
        }

        // Clamp score
        score = Math.min(99, Math.max(40, score));

        // Format a dynamic standsOut summary listing the matched skills
        let standsOut = `Demonstrates experience matching key search profile criteria.`;
        let combinedMatches = [...new Set([...matchesFound, ...resumeSkillsMatches])];
        if (combinedMatches.length > 0) {
          const capitalizedMatches = combinedMatches.map(m => m.charAt(0).toUpperCase() + m.slice(1));
          standsOut = `Aligns with your skillset. Verified matches: ${capitalizedMatches.join(", ")}.`;
        } else if (searchTerms.length > 0) {
          standsOut = `Aligns with your target title "${searchTitle}". Core skills are missing from description.`;
        }
        if (seniorityMatch === "mismatch") {
          standsOut += ` ⚠️ Seniority mismatch — role may require more experience than your ${userYOE} YOE.`;
        } else if (resumeHasSeniorExperience && jobHasSeniorSignal && userSeniority === "junior") {
          standsOut += ` 🚀 Resume indicates leadership experience despite target YOE.`;
        }

        const companyEmojis = ["▲", "⧉", "🜔", "⚡", "⚙", "❖", "✉", "⬡", "💨", "⬟"];
        const randomEmoji = companyEmojis[idx % companyEmojis.length];

        return {
          id: job.id || `scraped-job-${idx}`,
          company: job.company || "Direct Employer",
          companyEmoji: randomEmoji,
          companyDesc: job.company_description || "Leading software engineering division looking for new team members.",
          title: job.title || searchTitle,
          score,
          standsOut,
          seniorityMatch,
          location: job.location || searchLocation,
          url: job.job_url_direct || job.job_url || "https://indeed.com",
          status: "ready"
        };
      });

      // Sort mapped jobs by score (highest match score first)
      mappedJobs.sort((a, b) => b.score - a.score);

      console.log(`[API] Scraped and relevance-sorted ${mappedJobs.length} jobs (YOE: ${userYOE}, seniority: ${userSeniority || 'unset'}).`);
      return res.json(mappedJobs);

    } catch (parseError) {
      console.error(`[API] Failed to parse stdout JSON: ${parseError.message}`);
      return res.status(500).json({ 
        error: "Failed to parse scraper results output", 
        details: parseError.message 
      });
    }
  });

// Main apply portal confirmation logger and nodemailer dispatcher
app.post('/api/apply', async (req, res) => {
  const { job, applicant } = req.body;

  if (!job || !applicant) {
    return res.status(400).json({ error: "Missing job or applicant parameters" });
  }

  const dbPath = path.join(__dirname, 'applied_jobs.json');
  console.log(`[API] Logging job application to database...`);

  let applications = [];
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      applications = JSON.parse(data);
    }
  } catch (err) {
    console.error(`[API] Failed to read application database: ${err.message}`);
  }

  const newApplication = {
    applicationId: `APP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url
    },
    applicant,
    resumeUsed: req.body.resumeUsed || "Default Resume"
  };

  applications.push(newApplication);

  try {
    fs.writeFileSync(dbPath, JSON.stringify(applications, null, 4), 'utf8');
    
    // Dispatch real nodemailer SMTP email confirmation
    console.log(`[API] Dispatching confirmation email to: ${applicant.email}`);
    const emailResult = await sendConfirmationEmail(applicant, job);

    return res.json({ 
      success: true, 
      application: newApplication,
      emailSent: emailResult.success,
      emailPreviewUrl: emailResult.previewUrl,
      recipient: applicant.email
    });
  } catch (err) {
    console.error(`[API] Failed to write to database: ${err.message}`);
    return res.status(500).json({ error: "Failed to record application payload" });
  }
});

// Retrieve application history for scoped user
app.get('/api/applications', (req, res) => {
  const { email } = req.query;
  const dbPath = path.join(__dirname, 'applied_jobs.json');
  let applications = [];
  if (fs.existsSync(dbPath)) {
    try {
      applications = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error("[Applications DB read fail]", e.message);
      return res.status(500).json({ error: "Failed to read application database" });
    }
  }
  if (email) {
    if (email.toLowerCase().startsWith('demouser@gmail')) {
      applications = applications.filter(app => 
        (app.applicant?.email && app.applicant.email.toLowerCase().startsWith('demouser@gmail')) || 
        app.applicant?.email === 'demo@agentos.dev' || 
        app.applicant?.email === 'mockuser@gmail.com' || 
        app.applicant?.email === 'alex@rivera.com'
      );
    } else {
      applications = applications.filter(app => app.applicant?.email === email);
    }
  }
  return res.json(applications);
});


// Google Calendar integration configurations
const CONFIG_PATH = path.join(__dirname, 'google_config.json');
const TOKENS_PATH = path.join(__dirname, 'google_tokens.json');
const MOCK_EVENTS_PATH = path.join(__dirname, 'mock_calendar_events.json');
const DEMO_EVENTS_PATH = path.join(__dirname, 'demo_calendar_events.json');
let lastFetchError = null;


// Initialize mock events file with default data if not present
// Initialize mock events file with default data if not present
function initializeMockEvents(force = false) {
  if (force || !fs.existsSync(MOCK_EVENTS_PATH)) {
    const now = new Date();
    const relativeDate = (daysOffset, hour, minute) => {
      const d = new Date(now);
      d.setDate(now.getDate() + daysOffset);
      d.setHours(hour, minute, 0, 0);
      return d.toISOString();
    };

    const defaultMocks = [
      {
        id: 'mock-1',
        title: '🚀 Product Roadmap Sync',
        description: 'Review Q3 tech stack dependencies and coordinate the AgentOS dashboard release pipeline.',
        start: relativeDate(0, 10, 0),
        end: relativeDate(0, 11, 0),
        location: 'Virtual / Google Meet',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        isGoogle: false
      },
      {
        id: 'mock-lunch-walk',
        title: '🚶 Post-Lunch Digestive Walk',
        description: 'Brisk 15-minute digestive walk to stabilize blood sugar and clear cognitive fatigue.',
        start: relativeDate(0, 13, 0),
        end: relativeDate(0, 13, 15),
        location: 'Outdoors',
        meetLink: '',
        isGoogle: false
      },
      {
        id: 'mock-2',
        title: '💻 Deep Work Focus Block',
        description: 'Undistracted feature development for Calendar Planner agent connection and layout testing.',
        start: relativeDate(0, 14, 0),
        end: relativeDate(0, 16, 0),
        location: 'Workspace',
        meetLink: '',
        isGoogle: false
      },
      {
        id: 'mock-workout',
        title: '💪 Daily Active Exercise / Workout',
        description: 'Stretching & strength routine for active habits.',
        start: relativeDate(0, 17, 0),
        end: relativeDate(0, 17, 30),
        location: 'Home Gym / Living Room',
        meetLink: '',
        isGoogle: false
      },
      {
        id: 'mock-3',
        title: '🎨 AgentOS Design Review',
        description: 'Review glassmorphic aesthetic feedback, dashboard grid margins, and responsive layouts.',
        start: relativeDate(1, 11, 30),
        end: relativeDate(1, 12, 30),
        location: 'Design Portal Room',
        meetLink: 'https://meet.google.com/xyz-uvwx-123',
        isGoogle: false
      },
      {
        id: 'mock-4',
        title: '📝 Technical Interview Practice',
        description: 'Solve target algorithms and practice mock dynamic system design questions.',
        start: relativeDate(2, 15, 0),
        end: relativeDate(2, 16, 30),
        location: 'Workstation',
        meetLink: '',
        isGoogle: false
      },
      {
        id: 'mock-5',
        title: '☕ 1:1 Engineering Director Sync',
        description: 'Discuss Q3 deliverables, carrier scrape portal benchmarks, and future agent architectures.',
        start: relativeDate(3, 10, 0),
        end: relativeDate(3, 10, 30),
        location: 'Hangouts Space',
        meetLink: 'https://meet.google.com/mno-pqrst-uvw',
        isGoogle: false
      }
    ];

    fs.writeFileSync(MOCK_EVENTS_PATH, JSON.stringify(defaultMocks, null, 2), 'utf8');
  }
}

initializeMockEvents();

// Scoped user token paths helper
function getUserTokensPath(email) {
  if (!email) return null;
  const sanitized = email.replace(/[@.]/g, '_');
  return path.join(__dirname, `google_tokens_${sanitized}.enc`);
}

// AES-256-GCM Encryption Key from Env
const ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY 
  ? Buffer.from(process.env.SESSION_ENCRYPTION_KEY, 'hex') 
  : crypto.randomBytes(32); // Fallback to random on startup

function encryptTokens(tokensObj) {
  const text = JSON.stringify(tokensObj);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    tag: tag
  });
}

function decryptTokens(encryptedJsonStr) {
  try {
    const { iv, encryptedData, tag } = JSON.parse(encryptedJsonStr);
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('[Token Decryption Error]', err.message);
    throw new Error('Failed to decrypt user session tokens.');
  }
}

// User Profile JSON Registry helpers
const PROFILES_PATH = path.join(__dirname, 'user_profiles.json');

// In-memory demo profile — avoids any disk write that would trigger Vite's file watcher
// Declared here (before loadProfiles) so the function can reference it safely
let inMemoryDemoProfile = null;
let inMemoryDemoCalendarEvents = [];

function loadProfiles() {
  const result = {};
  // Inject in-memory demo profile if it exists (no disk access for demo)
  if (inMemoryDemoProfile) {
    result['demouser@gmail.com'] = inMemoryDemoProfile;
    result['demouser@gmail'] = inMemoryDemoProfile;
  }
  if (!fs.existsSync(PROFILES_PATH)) {
    return result;
  }
  try {
    const diskProfiles = JSON.parse(fs.readFileSync(PROFILES_PATH, 'utf8'));
    // Merge disk profiles, but in-memory demo profile takes precedence
    return { ...diskProfiles, ...result };
  } catch (err) {
    console.error('[Profiles Load Error]', err.message);
    return result;
  }
}

function saveProfile(email, profileData) {
  // Demo user is purely in-memory — no disk writes to avoid triggering Vite watcher
  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    const existing = inMemoryDemoProfile || { email, name: '', picture: '', preferences: {} };
    inMemoryDemoProfile = {
      email,
      name: profileData.name || existing.name || '',
      picture: profileData.picture || existing.picture || '',
      preferences: {
        ...existing.preferences,
        ...profileData.preferences
      }
    };
    return inMemoryDemoProfile;
  }
  try {
    const profiles = loadProfiles();
    profiles[email] = {
      email,
      name: profileData.name || (profiles[email] && profiles[email].name) || '',
      picture: profileData.picture || (profiles[email] && profiles[email].picture) || '',
      preferences: {
        ...(profiles[email] && profiles[email].preferences),
        ...profileData.preferences
      }
    };
    fs.writeFileSync(PROFILES_PATH, JSON.stringify(profiles, null, 2), 'utf8');
    return profiles[email];
  } catch (err) {
    console.error('[Profiles Save Error]', err.message);
    throw err;
  }
}

const DEFAULT_WELLNESS_PREFERENCES = {
  dietPreference: 'none',
  exerciseStyle: 'stretching',
  wellnessWakeTime: '07:00',
  wellnessSleepTime: '22:00'
};

// Reads a user's stored wellness preferences, filling in defaults for anything unset.
function getUserPreferences(email) {
  const profiles = loadProfiles();
  const stored = (profiles[email] && profiles[email].preferences) || {};
  return { ...DEFAULT_WELLNESS_PREFERENCES, ...stored };
}

async function getOAuth2Client(email) {
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    if (!fs.existsSync(CONFIG_PATH)) {
      return null;
    }
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      clientId = config.clientId;
      clientSecret = config.clientSecret;
      redirectUri = config.redirectUri || redirectUri;
    } catch (err) {
      console.error('[OAuth Client Config Read Error]', err.message);
      return null;
    }
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    
    const tokens = await getTokens(email);
    if (tokens) {
      oauth2Client.setCredentials(tokens);
    }

    return oauth2Client;
  } catch (err) {
    console.error('[OAuth Client Creation Error]', err.message);
    return null;
  }
}

// The demo user is the only one with a shared in-memory mock calendar to fall back to —
// every other email is expected to have a real, working Google Calendar connection.
function isDemoEmail(email) {
  return !!(email && email.toLowerCase().startsWith('demouser@gmail'));
}

// Distinguishes "your Google session is actually invalid" from other Google API failures
// (rate limiting, quota, malformed request, Calendar API not enabled, etc). Telling a user
// to reconnect Google when the real problem is a rate limit sends them on a pointless
// errand and hides the actual cause.
function isGoogleAuthError(err) {
  const code = err?.code || err?.response?.status;
  if (code === 401) return true;
  const reason = err?.errors?.[0]?.reason || err?.response?.data?.error?.status || '';
  return ['invalid_grant', 'unauthorized', 'authError', 'UNAUTHENTICATED'].includes(reason);
}

// Helper to get authenticated client, automatically handle token refresh notifications
async function getAuthenticatedClient(email) {
  const client = await getOAuth2Client(email);
  if (!client) return null;

  if (!client.credentials || !client.credentials.refresh_token) {
    return null;
  }

  client.on('tokens', async (tokens) => {
    try {
      const existingTokens = (await getTokens(email)) || {};
      const updatedTokens = { ...existingTokens, ...tokens };
      await setTokens(email, updatedTokens);
    } catch (err) {
      console.error('[Token Refresh Callback Error]', err.message);
    }
  });

  return client;
}

// Check Google Calendar connection status for scoped email
app.get('/api/auth/google/status', async (req, res) => {
  const { email } = req.query;
  const hasConfig = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) || fs.existsSync(CONFIG_PATH);
  const isAuthenticated = await hasTokens(email);
  res.json({
    configured: hasConfig,
    authenticated: isAuthenticated
  });
});

// Configure Google OAuth Client credentials
app.post('/api/auth/google/config', (req, res) => {
  const { clientId, clientSecret, redirectUri } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: "Missing Client ID or Client Secret" });
  }
  try {
    const config = {
      clientId,
      clientSecret,
      redirectUri: redirectUri || 'http://localhost:5000/api/auth/google/callback'
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, message: "Credentials stored successfully on workstation." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save configuration: " + err.message });
  }
});

// Disconnect/Revoke Google credentials for scoped email
app.post('/api/auth/google/disconnect', async (req, res) => {
  const { email } = req.body;
  try {
    await deleteTokens(email);
    clearNotifications();
    res.json({ success: true, message: "Google Credentials cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear credentials: " + err.message });
  }
});

// Generate authorization url with scopes for Calendar, Gmail, and Profile details
app.get('/api/auth/google', async (req, res) => {
  const oauth2Client = await getOAuth2Client();
  if (!oauth2Client) {
    return res.status(400).json({ error: "Google OAuth is not configured on this server yet. Submit client credentials first." });
  }
  const clientOrigin = req.query.origin || 'http://localhost:5173';
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: clientOrigin // pass the client origin in the state parameter
  });
  res.json({ url });
});

// Google OAuth callback endpoint
app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const clientOrigin = state || 'http://localhost:5173';
  if (!code) {
    return res.status(400).send("Authorization code missing in request.");
  }
  try {
    const oauth2Client = await getOAuth2Client();
    if (!oauth2Client) {
      return res.status(400).send("Google OAuth Client config file not found.");
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Retrieve user email and profile details
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    const name = userInfo.data.name || '';
    const picture = userInfo.data.picture || '';
    
    if (!email) {
      throw new Error("Could not retrieve user email from Google Profile.");
    }

    // Persist tokens (Firestore, backed by an in-memory cache)
    await setTokens(email, tokens);
    console.log(`[Google Auth] Tokens stored for ${email}`);
    
    // Ensure profile entry exists
    saveProfile(email, { name, picture, preferences: {} });

    // Redirect browser back to frontend client page with user session metadata
    res.redirect(`${clientOrigin}/?login_success=true&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}`);
  } catch (err) {
    console.error("[Google Auth Callback Exchange Error]", err.message);
    res.status(500).send(`Failed to finalize OAuth authorization: ${err.message}`);
  }
});

// Fetch events for the next 7 days
app.get('/api/calendar/events', async (req, res) => {
  const { email } = req.query;
  try {
    const authClient = await getAuthenticatedClient(email);
    if (authClient) {
      console.log("[Calendar API] Fetching live Google Calendar events...");
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      
      const timeMin = new Date().toISOString();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 7);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      console.log("[Calendar API Debug] Google items count:", (response.data.items || []).length);
      console.log("[Calendar API Debug] Live items list:", (response.data.items || []).map(item => ({
        summary: item.summary,
        start: item.start,
        status: item.status
      })));
      
      const events = (response.data.items || []).map(event => {
        let meetLink = '';
        if (event.hangoutLink) {
          meetLink = event.hangoutLink;
        } else if (event.conferenceData?.entryPoints) {
          const videoEntry = event.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
          if (videoEntry) meetLink = videoEntry.uri;
        }
        
        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location || '',
          meetLink: meetLink,
          isGoogle: true
        };
      });
      
      lastFetchError = null; // Clear error on successful live sync
      return res.json(events);
    }
  } catch (err) {
    console.error("[Calendar API Google Fetch Error, falling back to Mock]", err.message);
    lastFetchError = err.message;
  }

  // Fallback: Return in-memory mock events for demo user (no disk access)
  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    if (inMemoryDemoCalendarEvents.length === 0) {
      regenerateMockEventsInMemory();
    }
    if (lastFetchError) {
      res.setHeader('X-Calendar-Error', lastFetchError);
      res.setHeader('Access-Control-Expose-Headers', 'X-Calendar-Error');
    }
    return res.json(inMemoryDemoCalendarEvents);
  }

  return res.json([]);
});

// Create new calendar event
app.post('/api/calendar/events', async (req, res) => {
  const { title, description, start, end, location, createMeet, email } = req.body;
  if (!title || !start || !end) {
    return res.status(400).json({ error: "Missing required parameters (title, start, end)" });
  }

  // Real (non-demo) users depend entirely on their own Google Calendar — there's no
  // per-user local fallback for them (the mock registry consulted below is a single
  // shared, generic dataset, not scoped to any one email, so it can't stand in for a
  // real user's actual calendar). Check auth *before* the dedupe guard: otherwise a
  // real user with no valid Google session could get a false "already scheduled" from
  // that shared registry instead of the real "reconnect Google" error.
  const demoUser = isDemoEmail(email);
  let authClient = null;
  if (!demoUser) {
    try {
      authClient = await getAuthenticatedClient(email);
    } catch (err) {
      console.error("[Calendar API] getAuthenticatedClient error:", err.message);
    }
    if (!authClient) {
      return res.status(409).json({
        error: "Google Calendar isn't connected (or your session expired). Reconnect Google Calendar and try again.",
        requiresGoogleReconnect: true
      });
    }
  }

  // Dedupe guard: an intelligent/wellness task (Deep Focus, Cook & Dine, Digestive Walk,
  // Active Workout, Healthy Dinner) should only ever exist once per category per day.
  // Without this, repeated auto-schedule clicks (or the weekly cron re-running) pile up
  // duplicate wellness blocks instead of skipping ones already scheduled.
  if (isIntelligentTask(title)) {
    const category = getIntelligentTaskCategory(title);
    const localDateString = getLocalEventDateString(start);
    const todaysEvents = await getTodayEvents(localDateString, email);
    const alreadyScheduled = todaysEvents.some(e => getIntelligentTaskCategory(e.title) === category);
    if (alreadyScheduled) {
      return res.json({ success: true, skipped: true, reason: 'already-scheduled', event: null });
    }
  }

  let googleInsertError = null;
  try {
    if (authClient) {
      console.log("[Calendar API] Inserting event into Google Calendar...");
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      
      const eventResource = {
        summary: title,
        description: description || '',
        start: { dateTime: start, timeZone: SERVER_TIME_ZONE },
        end: { dateTime: end, timeZone: SERVER_TIME_ZONE },
        location: location || ''
      };

      if (createMeet) {
        eventResource.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      }

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventResource,
        conferenceDataVersion: createMeet ? 1 : 0
      });
      
      let meetLink = response.data.hangoutLink || '';
      if (!meetLink && response.data.conferenceData?.entryPoints) {
        const videoEntry = response.data.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
        if (videoEntry) meetLink = videoEntry.uri;
      }

      const localDateString = getLocalEventDateString(start);
      const completedEventsList = req.body.completedEvents || [];
      const logs = await rescheduleIntelligentTasks(localDateString, email, completedEventsList);

      return res.json({
        success: true,
        rescheduled: logs || [],
        event: {
          id: response.data.id,
          title: response.data.summary,
          description: response.data.description || '',
          start: response.data.start?.dateTime || response.data.start?.date,
          end: response.data.end?.dateTime || response.data.end?.date,
          location: response.data.location || '',
          meetLink: meetLink,
          isGoogle: true
        }
      });
    }
  } catch (err) {
    googleInsertError = err;
    console.error(
      `[Calendar API Google Insert Error for "${title}"] code=${err?.code || err?.response?.status} reason=${err?.errors?.[0]?.reason || 'unknown'} message=${err.message}`
    );
  }

  // The in-memory mock calendar is a single shared bucket meant only for the demo user —
  // GET /api/calendar/events only ever returns it for demouser@gmail.com. A real user only
  // reaches this point if the Google insert above threw (auth was valid moments ago but the
  // API call itself failed) — writing here would report success while the event vanishes
  // into a bucket they can never see, so fail clearly instead. Only claim a reconnect is
  // needed when the error actually looks like an auth problem — otherwise surface the real
  // Google API error (e.g. rate limit, quota, malformed request) so it can actually be fixed.
  if (!demoUser) {
    if (googleInsertError && !isGoogleAuthError(googleInsertError)) {
      return res.status(502).json({
        error: `Google Calendar rejected this event: ${googleInsertError.message}`,
        requiresGoogleReconnect: false
      });
    }
    return res.status(409).json({
      error: "Google Calendar isn't connected (or your session expired). Reconnect Google Calendar and try again.",
      requiresGoogleReconnect: true
    });
  }

  // Fallback: write to in-memory mock calendar (no disk writes for demo)
  const newEvent = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    description: description || '',
    start,
    end,
    location: location || '',
    meetLink: createMeet ? `https://meet.google.com/mock-meet-${Math.random().toString(36).substring(2, 5)}` : '',
    isGoogle: false
  };

  if (inMemoryDemoCalendarEvents.length === 0) regenerateMockEventsInMemory();
  inMemoryDemoCalendarEvents.push(newEvent);
  saveDemoEventsToDisk();

  const localDateString = getLocalEventDateString(start);
  const completedEventsList = req.body.completedEvents || [];
  const logs = await rescheduleIntelligentTasks(localDateString, email, completedEventsList);

  return res.json({
    success: true,
    rescheduled: logs || [],
    event: newEvent
  });
});

// Update calendar event
app.put('/api/calendar/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, start, end, location, createMeet, email } = req.body;
  
  try {
    const authClient = await getAuthenticatedClient(email);
    if (authClient && !id.startsWith('mock-')) {
      console.log(`[Calendar API] Updating event ${id} in Google Calendar...`);
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      
      const reqBody = {
        summary: title,
        description,
        start: { dateTime: start, timeZone: SERVER_TIME_ZONE },
        end: { dateTime: end, timeZone: SERVER_TIME_ZONE },
        location
      };
      
      const updatedEvent = await calendar.events.patch({
        calendarId: 'primary',
        eventId: id,
        requestBody: reqBody
      });
      const localDateString = getLocalEventDateString(start);
      const completedEventsList = req.body.completedEvents || [];
      const logs = await rescheduleIntelligentTasks(localDateString, email, completedEventsList);

      return res.json({ success: true, event: updatedEvent.data, rescheduled: logs || [] });
    }
  } catch (err) {
    console.error(`[Calendar API Google Update Error for ${id}, attempting mock update]`, err.message);
  }

  // Fallback/in-memory update for demo user
  if (inMemoryDemoCalendarEvents.length === 0) regenerateMockEventsInMemory();
  
  const eventIdx = inMemoryDemoCalendarEvents.findIndex(event => event.id === id);
  if (eventIdx === -1) {
    // A real (non-mock) event id only lands here if Google auth failed above — the mock
    // registry was never going to have it. Give an actionable message instead of a
    // confusing "not found" for what is really an auth problem.
    if (!isDemoEmail(email) && !id.startsWith('mock-')) {
      return res.status(409).json({
        error: "Google Calendar isn't connected (or your session expired). Reconnect Google Calendar and try again.",
        requiresGoogleReconnect: true
      });
    }
    return res.status(404).json({ error: `Event ${id} not found in demo registry.` });
  }

  const updatedMockEvent = {
    ...inMemoryDemoCalendarEvents[eventIdx],
    title,
    description,
    start,
    end,
    location,
    meetLink: createMeet ? "https://meet.google.com/abc-defg-hij" : ""
  };
  
  inMemoryDemoCalendarEvents[eventIdx] = updatedMockEvent;
  saveDemoEventsToDisk();

  const localDateString = getLocalEventDateString(start);
  const completedEventsList = req.body.completedEvents || [];
  const logs = await rescheduleIntelligentTasks(localDateString, email, completedEventsList);

  return res.json({ success: true, event: updatedMockEvent, rescheduled: logs || [] });
});

// Delete calendar event
app.delete('/api/calendar/events/:id', async (req, res) => {
  const { id } = req.params;
  const { email, localDate } = req.query;
  const completedEventsList = req.query.completedEvents ? JSON.parse(req.query.completedEvents) : [];
  
  let resolvedLocalDate = localDate || new Date().toISOString().split('T')[0];

  try {
    const authClient = await getAuthenticatedClient(email);
    // Google event IDs don't start with 'mock-'
    if (authClient && !id.startsWith('mock-')) {
      console.log(`[Calendar API] Deleting event ${id} from Google Calendar...`);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      try {
        const ev = await calendar.events.get({ calendarId: 'primary', eventId: id });
        if (ev.data.start?.dateTime || ev.data.start?.date) {
          resolvedLocalDate = getLocalEventDateString(ev.data.start.dateTime || ev.data.start.date);
        }
      } catch (getErr) {
        console.error("[Calendar API Google Get error before delete]", getErr.message);
      }

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: id
      });

      const logs = await rescheduleIntelligentTasks(resolvedLocalDate, email, completedEventsList);

      return res.json({ success: true, id, rescheduled: logs || [] });
    }
  } catch (err) {
    console.error(`[Calendar API Google Delete Error for ${id}, attempting mock delete]`, err.message);
  }

  // Fallback/in-memory delete for demo user
  if (inMemoryDemoCalendarEvents.length === 0) regenerateMockEventsInMemory();
  
  const targetEvent = inMemoryDemoCalendarEvents.find(event => event.id === id);
  if (targetEvent) {
    resolvedLocalDate = getLocalEventDateString(targetEvent.start);
  }

  const originalLength = inMemoryDemoCalendarEvents.length;
  inMemoryDemoCalendarEvents = inMemoryDemoCalendarEvents.filter(event => event.id !== id);
  saveDemoEventsToDisk();

  if (inMemoryDemoCalendarEvents.length === originalLength) {
    // Same reasoning as the PUT handler: a real (non-mock) id only reaches here because
    // Google auth failed above, not because the event doesn't exist.
    if (!isDemoEmail(email) && !id.startsWith('mock-')) {
      return res.status(409).json({
        error: "Google Calendar isn't connected (or your session expired). Reconnect Google Calendar and try again.",
        requiresGoogleReconnect: true
      });
    }
    return res.status(404).json({ error: `Event ${id} not found in demo registry.` });
  }

  const logs = await rescheduleIntelligentTasks(resolvedLocalDate, email, completedEventsList);

  return res.json({ success: true, id, rescheduled: logs || [] });
});

// Helper to parse date strings in a timezone-agnostic local-preserving format
function getLocalEventDateString(startStr) {
  if (!startStr) return "";
  if (startStr.length === 10) {
    return startStr; // YYYY-MM-DD
  }
  const d = new Date(startStr);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const date = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// Helper to fetch today's events for optimization
async function getTodayEvents(localDateString, email) {
  const startOfDay = new Date(`${localDateString}T00:00:00`);
  const endOfDay = new Date(`${localDateString}T23:59:59`);
  
  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    if (inMemoryDemoCalendarEvents.length === 0) regenerateMockEventsInMemory();
    return inMemoryDemoCalendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart < endOfDay && eventEnd > startOfDay;
    }).map(e => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      isGoogle: false
    }));
  }

  try {
    const authClient = await getAuthenticatedClient(email);
    if (authClient) {
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      return (response.data.items || []).map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        isGoogle: true
      }));
    }
  } catch (err) {
    console.error("[Optimize API] Google calendar fetch error:", err.message);
  }
  
  // Fallback to mock registry
  try {
    initializeMockEvents();
    const data = fs.readFileSync(MOCK_EVENTS_PATH, 'utf8');
    const allEvents = JSON.parse(data);
    
    // Select events that overlap with startOfDay and endOfDay
    return allEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart < endOfDay && eventEnd > startOfDay;
    }).map(e => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      isGoogle: false
    }));
  } catch (err) {
    console.error("[Optimize API] Fallback registry read error:", err.message);
    return [];
  }
}

// Check if event is an intelligent task (wellness block)
function isIntelligentTask(title) {
  if (!title) return false;
  return /^(🎯|🍳|🚶|💪|🥗|Cook & Dine:|Active Workout:|Digestive Walk:|Deep Focus:|Healthy Dinner:)/i.test(title);
}

// Categorize an intelligent task by its title prefix, so duplicate-detection can tell
// "already scheduled today" apart from "different kind of wellness task" (lunch vs dinner
// both use the generic "cooking" type, so they need distinct categories here).
function getIntelligentTaskCategory(title) {
  if (!title) return null;
  if (/^(🎯|Deep Focus:)/i.test(title)) return 'productivity';
  if (/^(🍳|Cook & Dine:)/i.test(title)) return 'cooking-lunch';
  if (/^(🥗|Healthy Dinner:)/i.test(title)) return 'cooking-dinner';
  if (/^(🚶|Digestive Walk:)/i.test(title)) return 'walking';
  if (/^(💪|Active Workout:)/i.test(title)) return 'exercise';
  return null;
}

// Reschedule all uncompleted intelligent tasks for a given day around the normal tasks to prevent overlaps.
async function rescheduleIntelligentTasks(localDateString, email, completedEvents = []) {
  console.log(`[Intelligent Scheduler] Rescheduling triggered for "${localDateString}" | Email: "${email}"`);
  
  // 1. Fetch all events for the day
  const todayEvents = await getTodayEvents(localDateString, email);
  
  // 2. Classify events
  const normalEvents = [];
  const doneIntelligentEvents = [];
  const notDoneIntelligentEvents = [];

  for (const event of todayEvents) {
    if (isIntelligentTask(event.title)) {
      const isDone = completedEvents.includes(event.id);
      if (isDone) {
        doneIntelligentEvents.push(event);
      } else {
        notDoneIntelligentEvents.push(event);
      }
    } else {
      normalEvents.push(event);
    }
  }

  // If there are no not-done intelligent tasks to reschedule, we're done
  if (notDoneIntelligentEvents.length === 0) {
    console.log(`[Intelligent Scheduler] No uncompleted intelligent tasks found for "${localDateString}". Skipping.`);
    return;
  }

  // 3. Time conversion helpers
  const timeStringToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const dateToMinutes = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const startOfDay = new Date(`${localDateString}T00:00:00`);
    if (d < startOfDay) return 0;
    const endOfDay = new Date(`${localDateString}T23:59:59`);
    if (d > endOfDay) return 1440;
    return d.getHours() * 60 + d.getMinutes();
  };

  const minutesToISOString = (mins) => {
    const startOfDay = new Date(`${localDateString}T00:00:00`);
    const d = new Date(startOfDay.getTime() + mins * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const minutesToTimeString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Get user wake and sleep times from profile (or default to 7:00 and 22:00)
  let wakeMin = 420; // 07:00
  let sleepMin = 1320; // 22:00
  try {
    const profiles = loadProfiles();
    const profile = profiles[email];
    if (profile && profile.preferences) {
      if (profile.preferences.wellnessWakeTime) {
        wakeMin = timeStringToMinutes(profile.preferences.wellnessWakeTime);
      }
      if (profile.preferences.wellnessSleepTime) {
        sleepMin = timeStringToMinutes(profile.preferences.wellnessSleepTime);
      }
    }
  } catch (err) {
    console.error("[Intelligent Scheduler] Error loading wake/sleep times:", err.message);
  }

  // 4. Map busy segments: normal events + completed intelligent events
  const busySegments = [];
  const allHardBlocks = [...normalEvents, ...doneIntelligentEvents];

  for (const event of allHardBlocks) {
    let startMin, endMin;
    if (event.start && event.start.length === 10) {
      startMin = wakeMin;
      endMin = sleepMin;
    } else {
      const eventStartMin = dateToMinutes(event.start);
      const eventEndMin = dateToMinutes(event.end);
      startMin = Math.max(wakeMin, Math.min(sleepMin, eventStartMin));
      endMin = Math.max(wakeMin, Math.min(sleepMin, eventEndMin));
    }
    if (startMin < endMin) {
      busySegments.push({ start: startMin, end: endMin });
    }
  }

  // Merge overlapping busy segments
  busySegments.sort((a, b) => a.start - b.start);
  const mergedSegments = [];
  if (busySegments.length > 0) {
    let current = busySegments[0];
    for (let i = 1; i < busySegments.length; i++) {
      const next = busySegments[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        mergedSegments.push(current);
        current = next;
      }
    }
    mergedSegments.push(current);
  }

  // 5. Compute free gaps
  const gaps = [];
  let lastEnd = wakeMin;
  for (const segment of mergedSegments) {
    if (segment.start > lastEnd) {
      gaps.push({ start: lastEnd, end: segment.start, duration: segment.start - lastEnd });
    }
    lastEnd = Math.max(lastEnd, segment.end);
  }
  if (sleepMin > lastEnd) {
    gaps.push({ start: lastEnd, end: sleepMin, duration: sleepMin - lastEnd });
  }

  // Helper to schedule a slot in a gap
  // Scores how good a candidate start time is relative to the task's original slot.
  // Strongly prefers "at or after" the original time over "before" it: when a task gets
  // bumped by a new conflicting event, sliding it later reads as the task making room for
  // the new thing; jumping it backward in time looks arbitrary/illogical to the user even
  // though it's technically conflict-free. The +1440 (one day, in minutes) penalty on
  // "before" candidates guarantees any same-day "at/after" option always wins; "before" is
  // only ever chosen when literally nothing fits later in the day.
  const scoreCandidate = (candidateStart, targetStart) => {
    if (candidateStart >= targetStart) {
      return candidateStart - targetStart;
    }
    return (targetStart - candidateStart) + 1440;
  };

  const tryScheduleInGaps = (duration, targetStart, targetEnd, validityStart, validityEnd) => {
    let bestGap = null;
    let bestStartMin = null;
    let minScore = Infinity;

    const valStart = validityStart !== undefined ? validityStart : wakeMin;
    const valEnd = validityEnd !== undefined ? validityEnd : sleepMin;

    for (const gap of gaps) {
      const overlapStart = Math.max(gap.start, targetStart, valStart);
      const overlapEnd = Math.min(gap.end, targetEnd, valEnd);
      if (overlapEnd - overlapStart >= duration) {
        const startMin = overlapStart;
        const score = scoreCandidate(startMin, targetStart);
        if (score < minScore) {
          minScore = score;
          bestGap = gap;
          bestStartMin = startMin;
        }
      }
    }

    if (bestGap !== null) {
      const startMin = bestStartMin;
      const endMin = startMin + duration;
      const index = gaps.indexOf(bestGap);
      gaps.splice(index, 1);
      if (startMin > bestGap.start) {
        gaps.push({ start: bestGap.start, end: startMin, duration: startMin - bestGap.start });
      }
      if (bestGap.end > endMin) {
        gaps.push({ start: endMin, end: bestGap.end, duration: bestGap.end - endMin });
      }
      gaps.sort((a, b) => a.start - b.start);
      return { startMin, endMin };
    }

    // Fallback search
    for (const gap of gaps) {
      const fitStart = Math.max(gap.start, valStart);
      const fitEnd = Math.min(gap.end, valEnd);
      if (fitEnd - fitStart >= duration) {
        const candidateStart = Math.max(fitStart, Math.min(fitEnd - duration, targetStart));
        const score = scoreCandidate(candidateStart, targetStart);
        if (score < minScore) {
          minScore = score;
          bestGap = gap;
          bestStartMin = candidateStart;
        }
      }
    }

    if (bestGap !== null) {
      const startMin = bestStartMin;
      const endMin = startMin + duration;
      const index = gaps.indexOf(bestGap);
      gaps.splice(index, 1);
      if (startMin > bestGap.start) {
        gaps.push({ start: bestGap.start, end: startMin, duration: startMin - bestGap.start });
      }
      if (bestGap.end > endMin) {
        gaps.push({ start: endMin, end: bestGap.end, duration: bestGap.end - endMin });
      }
      gaps.sort((a, b) => a.start - b.start);
      return { startMin, endMin };
    }

    return null;
  };

  // Removes [startMin, endMin) from the shared `gaps` list, splitting the containing gap
  // as needed. Mirrors the bookkeeping tryScheduleInGaps does internally, so a slot chosen
  // by the LLM can't be handed out twice to two different tasks in the same run.
  const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
  const consumeGapSlot = (startMin, endMin) => {
    const idx = gaps.findIndex(g => startMin >= g.start && endMin <= g.end);
    if (idx === -1) return false;
    const gap = gaps[idx];
    gaps.splice(idx, 1);
    if (startMin > gap.start) gaps.push({ start: gap.start, end: startMin, duration: startMin - gap.start });
    if (gap.end > endMin) gaps.push({ start: endMin, end: gap.end, duration: gap.end - endMin });
    gaps.sort((a, b) => a.start - b.start);
    return true;
  };

  // 6. Reschedule only the uncompleted intelligent tasks that actually conflict with a hard block
  console.log(`[Intelligent Scheduler] Checking ${notDoneIntelligentEvents.length} uncompleted tasks for conflicts...`);
  notDoneIntelligentEvents.sort((a, b) => dateToMinutes(a.start) - dateToMinutes(b.start));

  const authClient = await getAuthenticatedClient(email);
  const rescheduleLogs = [];

  for (const event of notDoneIntelligentEvents) {
    const duration = Math.round((new Date(event.end) - new Date(event.start)) / (1000 * 60)) || 30;
    const targetStart = dateToMinutes(event.start);
    const targetEnd = dateToMinutes(event.end);

    // Only move this task if its current slot genuinely overlaps a hard block. Untouched
    // tasks are left alone entirely — no move, no agent call.
    const conflictingHardEvent = allHardBlocks.find(e => {
      const s = dateToMinutes(e.start);
      const en = dateToMinutes(e.end);
      return overlaps(targetStart, targetEnd, s, en);
    });
    if (!conflictingHardEvent) {
      continue;
    }

    let newSlot = null;
    let decisionReason = null;

    try {
      const availableSlotStrings = gaps
        .filter(g => g.duration >= duration)
        .map(g => `${minutesToTimeString(g.start)}-${minutesToTimeString(g.end)}`);

      const decision = await decideRescheduleWithLLM({
        taskTitle: event.title,
        taskType: getIntelligentTaskCategory(event.title) || 'other',
        durationMinutes: duration,
        conflictingEventTitle: conflictingHardEvent.title,
        availableSlots: availableSlotStrings,
        wakeTime: minutesToTimeString(wakeMin),
        sleepTime: minutesToTimeString(sleepMin)
      });

      if (decision?.action === 'skip') {
        console.log(`[Intelligent Scheduler] Agent chose to skip "${event.title}": ${decision.reason || 'no reason given'}`);
        continue;
      }

      if (decision?.action === 'reschedule' && decision.startTime) {
        const [h, m] = decision.startTime.split(':').map(Number);
        const candidateStart = h * 60 + m;
        const candidateEnd = candidateStart + duration;
        // Trust the agent's chosen slot only if it genuinely fits inside a currently free gap.
        if (gaps.some(g => candidateStart >= g.start && candidateEnd <= g.end)) {
          consumeGapSlot(candidateStart, candidateEnd);
          newSlot = { startMin: candidateStart, endMin: candidateEnd };
          decisionReason = decision.reason;
        } else {
          console.warn(`[Intelligent Scheduler] Agent chose ${decision.startTime} for "${event.title}" but it doesn't fit a free gap — falling back to nearest-gap math.`);
        }
      }
    } catch (err) {
      console.warn(`[Intelligent Scheduler] LLM reschedule decision unavailable for "${event.title}" (${err.message}) — falling back to nearest-gap math.`);
    }

    // Resilience fallback only — used when the LLM is unavailable, errors, or returns a
    // slot that doesn't actually fit. Not the primary decision path.
    if (!newSlot) {
      newSlot = tryScheduleInGaps(duration, targetStart, targetEnd, wakeMin, sleepMin);
    }

    if (newSlot) {
      const newStartISO = minutesToISOString(newSlot.startMin);
      const newEndISO = minutesToISOString(newSlot.endMin);

      if (event.start !== newStartISO) {
        rescheduleLogs.push({
          title: event.title,
          oldStart: event.start,
          newStart: newStartISO,
          newStartStr: minutesToTimeString(newSlot.startMin),
          newEndStr: minutesToTimeString(newSlot.endMin),
          reason: decisionReason || undefined
        });
      }

      console.log(`[Intelligent Scheduler] Moving task "${event.title}" from [${event.start} - ${event.end}] to [${newStartISO} - ${newEndISO}]${decisionReason ? ` — agent: ${decisionReason}` : ' — fallback math'}`);

      try {
        if (authClient && !event.id.startsWith('mock-')) {
          const calendar = google.calendar({ version: 'v3', auth: authClient });
          await calendar.events.patch({
            calendarId: 'primary',
            eventId: event.id,
            resource: {
              start: { dateTime: newStartISO, timeZone: SERVER_TIME_ZONE },
              end: { dateTime: newEndISO, timeZone: SERVER_TIME_ZONE }
            }
          });
        } else {
          // Mock update
          const mockIdx = inMemoryDemoCalendarEvents.findIndex(e => e.id === event.id);
          if (mockIdx !== -1) {
            inMemoryDemoCalendarEvents[mockIdx].start = newStartISO;
            inMemoryDemoCalendarEvents[mockIdx].end = newEndISO;
            saveDemoEventsToDisk();
          }
        }
      } catch (updateErr) {
        console.error(`[Intelligent Scheduler] Failed to update event "${event.title}":`, updateErr.message);
      }
    } else {
      console.warn(`[Intelligent Scheduler] Could not fit task "${event.title}" (Duration: ${duration}m) in schedule!`);
    }
  }

  return rescheduleLogs;
}

// Dynamic Suggestion Databases
// Dynamic Suggestion Databases
const DIET_RECIPES = {
  vegan: [
    { title: "🥑 Quinoa & Avocado Power Bowl", desc: "Quinoa, black beans, diced avocado, cilantro, cherry tomatoes, and lime juice. Rich in clean energy." },
    { title: "🍲 Creamy Coconut Lentil Curry", desc: "Red lentils simmered in coconut milk, spinach, ginger, and turmeric. Served with cauliflower rice." },
    { title: "🌮 Sweet Potato & Black Bean Tacos", desc: "Warm corn tortillas filled with roasted sweet potatoes, spiced black beans, avocado slices, and salsa verde." },
    { title: "🥗 Sesame Peanut Crunch Salad", desc: "Shredded cabbage, carrots, edamame, and cucumber tossed in a savory ginger-peanut dressing." },
    { title: "🍛 Chickpea Vegetable Tagine", desc: "Slow-simmered chickpeas with sweet apricots, carrots, zucchini, and aromatic Moroccan spices." }
  ],
  vegetarian: [
    { title: "🥗 Mediterranean Chickpea Salad", desc: "Chickpeas, cucumber, feta cheese, olives, and red onion tossed in lemon-herb vinaigrette." },
    { title: "🍳 Spinach & Tofu Sesame Stir-Fry", desc: "Pan-seared tofu cubes, fresh baby spinach, broccoli, garlic, and light sesame oil." },
    { title: "🍝 Lemon Ricotta Asparagus Pasta", desc: "Whole grain penne tossed with fresh asparagus tips, olive oil, lemon zest, and creamy ricotta." },
    { title: "🥘 Sweet Potato Black Bean Quesadilla", desc: "Crispy tortilla stuffed with mashed sweet potatoes, black beans, Monterey Jack cheese, and fresh cilantro." },
    { title: "🍲 Wild Mushroom & Barley Soup", desc: "A hearty soup filled with earthy cremini mushrooms, pearl barley, root vegetables, and fresh herbs." }
  ],
  keto: [
    { title: "🐟 Avocado Salmon Cobb Salad", desc: "Flaked grilled salmon, avocado, boiled eggs, bacon bits, and olive oil on a bed of spinach." },
    { title: "🥩 Garlic Butter Steak Bites", desc: "Pan-seared sirloin steak bites basted in butter and garlic, served with seasoned roasted zucchini." },
    { title: "🍗 Bacon-Wrapped Asparagus Chicken", desc: "Tender chicken breast stuffed with asparagus and cream cheese, wrapped in crispy bacon." },
    { title: "🍳 Keto Breakfast Skillet", desc: "Scrambled eggs with ground sausage, avocado, cheddar cheese, and fresh salsa in a hot pan." },
    { title: "🍤 Garlic Butter Shrimp Cauliflower Rice", desc: "Sautéed jumbo shrimp basted in lemon-garlic butter over a bed of seasoned riced cauliflower." }
  ],
  'high-protein': [
    { title: "🍗 Grilled Chicken & Sweet Potato", desc: "Seasoned grilled chicken breast, grilled asparagus, and sweet potato mash. Optimal for muscle repair." },
    { title: "🥛 Power Greek Yogurt Parfait", desc: "Double-strain Greek yogurt with chia seeds, pumpkin seeds, mixed berries, and honey." },
    { title: "🐟 Seared Tuna Sesame Steak", desc: "Sesame-crusted tuna steak seared rare, served with a side of edamame and brown rice." },
    { title: "🥩 Beef & Broccoli Protein Bowls", desc: "Lean shaved beef stir-fried with fresh broccoli florets and a soy-ginger glaze over quinoa." },
    { title: "🥚 Egg White Veggie Frittata", desc: "Baked egg whites with spinach, mushrooms, bell peppers, and turkey bacon. High protein, low fat." }
  ],
  none: [
    { title: "🥪 Turkey Avocado Egg Toast", desc: "Toasted artisanal sourdough bread topped with mashed avocado, smoked turkey breast, and a poached egg." },
    { title: "🐟 Honey Mustard Glazed Salmon", desc: "Baked salmon fillet glazed with honey mustard, served with roasted green beans and brown rice." },
    { title: "🍗 Tuscan Herb Grilled Chicken", desc: "Grilled chicken breast basted with rosemary and thyme, served alongside roasted fingerling potatoes." },
    { title: "🍝 Classic Shrimp Scampi Linguine", desc: "Jumbo shrimp sautéed in white wine, butter, and garlic sauce, tossed with a light nest of linguine." },
    { title: "🥩 Grilled Sirloin with Asparagus", desc: "Perfectly seared sirloin steak served with grilled asparagus spears and garlic mashed potatoes." }
  ]
};

const EXERCISE_ROUTINES = {
  cardio: [
    { title: "🏃 HIIT Cardio Intervals", desc: "Perform 4 rounds of: 40s jumping jacks, 40s mountain climbers, 40s high knees, 40s squat jumps. 60s rest." },
    { title: "👟 Steady State Jog", desc: "Outdoor jogging block. Maintain a steady conversational pace to build endurance." },
    { title: "🚲 Sprint Cycling Intervals", desc: "Cycle intensely for 30s followed by 90s of recovery pedaling. Repeat 8 times." },
    { title: "🧗 Shadow Boxing & Jump Rope", desc: "3 minutes of shadow boxing followed by 2 minutes of jump rope. Complete 4 rounds." },
    { title: "🏊 Cardio Stair Climber Boost", desc: "Stairmaster intervals: 5 mins warm up, then alternate 1 min fast pace with 1 min moderate for 20 mins." }
  ],
  strength: [
    { title: "💪 Bodyweight Strength Circuit", desc: "3 rounds of: 15 push-ups, 20 bodyweight squats, 12 reverse lunges, and a 45s plank hold." },
    { title: "🏋 Dumbbell Conditioning", desc: "3 sets of: 10 dumbbell curls, 10 overhead shoulder presses, and 12 floor dumbbell chest presses." },
    { title: "🦵 Lower Body Power Day", desc: "3 sets of: 12 dumbbell goblet squats, 12 Romanian deadlifts, and 15 calf raises." },
    { title: "🎯 Core & Pushup Focus", desc: "4 sets of: 12 diamond pushups, 20 bicycle crunches, 15 leg raises, and a 60s side plank." },
    { title: "🛡 Upper Body Sculpt", desc: "3 sets of: 12 dumbbell lateral raises, 12 bent-over rows, and 15 tricep overhead extensions." }
  ],
  yoga: [
    { title: "🧘 Vinyasa Yoga Flow", desc: "Flow through Sun Salutations A & B, followed by Warrior poses, tree pose, and a final deep savasana." },
    { title: "🕯 Stress-Relieving Yin Yoga", desc: "Hold deep stretches like child's pose, pigeon pose, and butterfly pose for 90s each to release fascia tension." },
    { title: "🌅 Morning Sun Salutations", desc: "Slow, mindful flow of 10 sun salutations to wake up the joints, lengthen the spine, and practice breathing." },
    { title: "🤸 Core & Balance Yoga", desc: "Targeted poses like Crow, Boat, Warrior III, and Plank variants to build solid stability." },
    { title: "🌌 Evening Wind-Down Yoga", desc: "Restorative poses like legs-up-the-wall, bridge, and spinal twists to prepare the mind and body for sleep." }
  ],
  stretching: [
    { title: "🤸 Desk Relief Stretch Routine", desc: "Neck rolls, chest openers, wrist flexions, and seated twists to reverse desk hunch and relieve tension." },
    { title: "🛹 Full Body Joint Mobility", desc: "Hip circles, leg swings, arm circles, and cat-cow stretches to lubricate joints and increase range of motion." },
    { title: "🦵 Lower Body Hamstring & Hip Flex", desc: "Deep lunges, butterfly stretch, half-splits, and figure-4 stretches to open up tight hips and hamstrings." },
    { title: "🧍 Active Upper Body Opener", desc: "Shoulder pass-throughs, wall walks, and thoracic spine extensions to improve posture and relieve back soreness." },
    { title: "💤 Sleep Prep Stretching", desc: "Gentle floor stretches focusing on deep belly breathing: child's pose, happy baby, and lying butterfly." }
  ]
};

// Optimizer Endpoint
app.post('/api/daily-focus/optimize', async (req, res) => {
  const { diet, exercise, wakeTime, sleepTime, localDate, email, completedEvents } = req.body;
  
  const dietPref = diet || 'none';
  const exercisePref = exercise || 'stretching';
  const wakeStr = wakeTime || '07:00';
  const sleepStr = sleepTime || '22:00';
  const localDateString = localDate || new Date().toISOString().split('T')[0];

  console.log(`[Optimize API] Optimization requested for date "${localDateString}". Preferences: Diet="${dietPref}", Workout="${exercisePref}", Waking="${wakeStr}-${sleepStr}" | Email="${email}"`);

  // Fetch today's busy events
  const todayEvents = await getTodayEvents(localDateString, email);

  // Time conversion helpers
  const timeStringToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const dateToMinutes = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const startOfDay = new Date(`${localDateString}T00:00:00`);
    if (d < startOfDay) {
      return 0; // Started before today
    }
    const endOfDay = new Date(`${localDateString}T23:59:59`);
    if (d > endOfDay) {
      return 1440; // Ends after today
    }
    return d.getHours() * 60 + d.getMinutes();
  };

  const minutesToTimeString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const minutesToISOString = (mins) => {
    const startOfDay = new Date(`${localDateString}T00:00:00`);
    const d = new Date(startOfDay.getTime() + mins * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const wakeMin = timeStringToMinutes(wakeStr);
  const sleepMin = timeStringToMinutes(sleepStr);

  // Parse requested date to get day of the week (0 = Sunday, 1 = Monday, etc.)
  const eventDate = new Date(`${localDateString}T00:00:00`);
  const dayOfWeek = isNaN(eventDate.getDay()) ? 0 : eventDate.getDay();

  // Map busy ranges
  const busySegments = [];
  for (const event of todayEvents) {
    if (isIntelligentTask(event.title)) {
      const completedEventsList = completedEvents || [];
      const isDone = completedEventsList.includes(event.id);
      if (!isDone) {
        continue; // Uncompleted intelligent tasks are movable, they do not block optimization slots
      }
    }

    let startMin, endMin;
    if (event.start && event.start.length === 10) {
      // All-day event covers the entire active day
      startMin = wakeMin;
      endMin = sleepMin;
    } else {
      // Timed event
      const eventStartMin = dateToMinutes(event.start);
      const eventEndMin = dateToMinutes(event.end);
      startMin = Math.max(wakeMin, Math.min(sleepMin, eventStartMin));
      endMin = Math.max(wakeMin, Math.min(sleepMin, eventEndMin));
    }
    if (startMin < endMin) {
      busySegments.push({ start: startMin, end: endMin });
    }
  }

  // Merge overlapping busy segments
  busySegments.sort((a, b) => a.start - b.start);
  const mergedSegments = [];
  if (busySegments.length > 0) {
    let current = busySegments[0];
    for (let i = 1; i < busySegments.length; i++) {
      const next = busySegments[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        mergedSegments.push(current);
        current = next;
      }
    }
    mergedSegments.push(current);
  }

  // Find Gaps
  const gaps = [];
  let lastEnd = wakeMin;
  for (const segment of mergedSegments) {
    if (segment.start > lastEnd) {
      gaps.push({ start: lastEnd, end: segment.start, duration: segment.start - lastEnd });
    }
    lastEnd = Math.max(lastEnd, segment.end);
  }
  if (sleepMin > lastEnd) {
    gaps.push({ start: lastEnd, end: sleepMin, duration: sleepMin - lastEnd });
  }

  const suggestions = [];

  // Helper to schedule a slot in a gap (and remove it from gaps)
  const trySchedule = (name, type, duration, targetStart, targetEnd, details, validityStart, validityEnd) => {
    let bestGap = null;
    let bestStartMin = null;
    let minDistance = Infinity;

    const valStart = validityStart !== undefined ? validityStart : wakeMin;
    const valEnd = validityEnd !== undefined ? validityEnd : sleepMin;

    // 1. Try to schedule inside the target window intersecting with validity bounds
    for (const gap of gaps) {
      const overlapStart = Math.max(gap.start, targetStart, valStart);
      const overlapEnd = Math.min(gap.end, targetEnd, valEnd);
      if (overlapEnd - overlapStart >= duration) {
        const startMin = overlapStart;
        const distance = Math.abs(startMin - targetStart);
        if (distance < minDistance) {
          minDistance = distance;
          bestGap = gap;
          bestStartMin = startMin;
        }
      }
    }

    // 2. If it fits, schedule it
    if (bestGap !== null) {
      const startMin = bestStartMin;
      const endMin = startMin + duration;
      const index = gaps.indexOf(bestGap);
      gaps.splice(index, 1);
      if (startMin > bestGap.start) {
        gaps.push({ start: bestGap.start, end: startMin, duration: startMin - bestGap.start });
      }
      if (bestGap.end > endMin) {
        gaps.push({ start: endMin, end: bestGap.end, duration: bestGap.end - endMin });
      }
      gaps.sort((a, b) => a.start - b.start);

      const result = {
        id: `suggest-${type}-${Date.now()}-${Math.random().toString(36).substring(2,5)}`,
        name,
        type,
        startMin,
        endMin,
        startTime: minutesToTimeString(startMin),
        endTime: minutesToTimeString(endMin),
        startISO: minutesToISOString(startMin),
        endISO: minutesToISOString(endMin),
        details
      };
      suggestions.push(result);
      return result;
    }

    // 3. Fallback: Find a gap that fits the duration and falls within validity bounds
    for (const gap of gaps) {
      const fitStart = Math.max(gap.start, valStart);
      const fitEnd = Math.min(gap.end, valEnd);
      if (fitEnd - fitStart >= duration) {
        const candidateStart = Math.max(fitStart, Math.min(fitEnd - duration, targetStart));
        const distance = Math.abs(candidateStart - targetStart);
        if (distance < minDistance) {
          minDistance = distance;
          bestGap = gap;
          bestStartMin = candidateStart;
        }
      }
    }

    if (bestGap !== null) {
      const startMin = bestStartMin;
      const endMin = startMin + duration;
      const index = gaps.indexOf(bestGap);
      gaps.splice(index, 1);
      if (startMin > bestGap.start) {
        gaps.push({ start: bestGap.start, end: startMin, duration: startMin - bestGap.start });
      }
      if (bestGap.end > endMin) {
        gaps.push({ start: endMin, end: bestGap.end, duration: bestGap.end - endMin });
      }
      gaps.sort((a, b) => a.start - b.start);

      const result = {
        id: `suggest-${type}-${Date.now()}-${Math.random().toString(36).substring(2,5)}`,
        name,
        type,
        startMin,
        endMin,
        startTime: minutesToTimeString(startMin),
        endTime: minutesToTimeString(endMin),
        startISO: minutesToISOString(startMin),
        endISO: minutesToISOString(endMin),
        details
      };
      suggestions.push(result);
      return result;
    }

    // Return null if it cannot fit within validity parameters
    return null;
  };

  // Schedule suggestions dynamically based on wake times and date seeds
  
  // 1. Morning Focus Block (9:00 AM - 12:00 PM target, shifts if user wakes up late)
  let focusStart = Math.max(wakeMin + 30, timeStringToMinutes("09:00"));
  let focusEnd = focusStart + 180; // 3 hour window

  const actualFocus = trySchedule(
    "🎯 Deep Focus Work Block",
    "productivity",
    90,
    focusStart,
    focusEnd,
    "Turn off communication notifications. Devote 90 minutes of high-cognitive energy to your top priority task.",
    wakeMin,
    timeStringToMinutes("15:00") // Skip focus if it gets pushed past 3:00 PM
  );

  const focusEndMin = actualFocus ? actualFocus.endMin : wakeMin;

  // 2. Lunch Prep & Eat (11:30 AM - 2:30 PM target, shifts relative to focus)
  const mealDb = DIET_RECIPES[dietPref] || DIET_RECIPES.none;
  const lunchRecipeIndex = dayOfWeek % mealDb.length;
  const lunchRecipe = mealDb[lunchRecipeIndex];
  
  let lunchStart = Math.max(focusEndMin + 15, timeStringToMinutes("11:30"));
  let lunchEnd = Math.max(lunchStart + 120, timeStringToMinutes("14:30"));
  
  const actualLunch = trySchedule(
    `🍳 Cook & Dine: ${lunchRecipe.title}`,
    "cooking",
    60,
    lunchStart,
    lunchEnd,
    `Prep time: 20 mins. Cook time: 15 mins. Recipe: ${lunchRecipe.desc}`,
    timeStringToMinutes("11:00"), // Valid lunch start range 11 AM - 4 PM
    timeStringToMinutes("16:00")
  );

  const lunchEndMin = actualLunch ? actualLunch.endMin : focusEndMin;

  // 3. Digestive walk (strictly after actual lunch ends, if lunch was scheduled)
  let actualWalk = null;
  if (actualLunch) {
    let walkStart = actualLunch.endMin; // Starts right after lunch ends
    let walkEnd = walkStart + 45; // Must start within 45 minutes after lunch ends
    
    actualWalk = trySchedule(
      "🚶 Digestive Walk Break",
      "walking",
      15,
      walkStart,
      walkEnd,
      "A brisk 15-minute outdoor walk post-lunch. Helps clear cognitive fatigue, stabilizes blood sugar, and accumulates steps.",
      walkStart,
      walkStart + 60 // Validity limits it to start within 1 hour after lunch ends
    );
  }

  const walkEndMin = actualWalk ? actualWalk.endMin : lunchEndMin;

  // 4. Afternoon Workout block (4:00 PM - 6:30 PM target, relative to walk)
  const exerciseDb = EXERCISE_ROUTINES[exercisePref] || EXERCISE_ROUTINES.stretching;
  const exerciseRoutineIndex = dayOfWeek % exerciseDb.length;
  const exerciseRoutine = exerciseDb[exerciseRoutineIndex];
  
  let workoutStart = Math.max(walkEndMin + 120, timeStringToMinutes("16:00"));
  let workoutEnd = Math.max(workoutStart + 120, timeStringToMinutes("18:30"));
  
  const actualWorkout = trySchedule(
    `💪 Active Workout: ${exerciseRoutine.title}`,
    "exercise",
    30,
    workoutStart,
    workoutEnd,
    `Workout style: ${exercisePref.toUpperCase()}. Routine: ${exerciseRoutine.desc}`,
    timeStringToMinutes("14:00"), // Valid workout range 2:00 PM - 8:30 PM
    timeStringToMinutes("20:30")
  );

  const workoutEndMin = actualWorkout ? actualWorkout.endMin : walkEndMin;

  // 5. Dinner Prep & Eat (6:30 PM - 9:30 PM default, strictly after workout ends)
  const dinnerRecipeIndex = (dayOfWeek + 2) % mealDb.length;
  const dinnerRecipe = mealDb[dinnerRecipeIndex] || mealDb[0];
  
  let dinnerStart = Math.max(workoutEndMin + 30, timeStringToMinutes("18:30"));
  let dinnerEnd = Math.min(sleepMin, Math.max(dinnerStart + 120, timeStringToMinutes("21:30")));
  
  trySchedule(
    `🥗 Healthy Dinner: ${dinnerRecipe.title}`,
    "cooking",
    45,
    dinnerStart,
    dinnerEnd,
    `Prep time: 15 mins. Cook time: 20 mins. Recipe: ${dinnerRecipe.desc}`,
    timeStringToMinutes("17:00"), // Valid dinner range 5:00 PM - sleep hour
    sleepMin
  );

  // Sort final suggestions by start time
  suggestions.sort((a, b) => a.startMin - b.startMin);

  // Compute optimization score
  let score = 40;
  suggestions.forEach(s => {
    if (["exercise", "walking", "cooking", "productivity"].includes(s.type)) {
      score += 12;
    }
  });
  score = Math.min(100, score);

  return res.json({
    date: localDateString,
    score,
    suggestions,
    gapsCount: gaps.length,
    todayEventsCount: todayEvents.length
  });
});

// Reschedule Daily Focus events to resolve conflicts
app.post('/api/daily-focus/reschedule', async (req, res) => {
  const { email, localDate, completedEvents } = req.body;
  const localDateString = localDate || new Date().toISOString().split('T')[0];

  try {
    const logs = await rescheduleIntelligentTasks(localDateString, email, completedEvents || []);
    return res.json({ success: true, date: localDateString, rescheduled: logs || [] });
  } catch (err) {
    console.error("[Daily Focus Reschedule Endpoint Error]", err);
    return res.status(500).json({ error: "Failed to reschedule intelligent tasks: " + err.message });
  }
});

// --- EMAIL TRIAGE AGENT SUPPORT ---

// Deadline extractor helper
function extractDeadline(subject, body) {
  const text = (subject + " " + body).toLowerCase();

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

  if (isBankingOrPromo) {
    return {
      isUrgent: false,
      deadlineText: null
    };
  }
  
  // Try to find due/deadline dates
  // e.g. "due by July 2nd", "deadline: June 30th", "respond by 06/28"
  const dateRegexes = [
    /due\s+by\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/i,
    /deadline(?:\s+is)?:?\s*([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/i,
    /respond\s+by\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/i,
    /reply\s+by\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/i,
    /complete\s+(?:this|by|before)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/i
  ];

  for (const regex of dateRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      let dateStr = match[1].trim();
      return {
        isUrgent: true,
        deadlineText: dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
      };
    }
  }

  // Try relative durations
  const relativeRegexes = [
    /within\s+(\d+\s+(?:hours?|hrs?|days?))/i,
    /in\s+(\d+\s+(?:hours?|hrs?|days?))/i,
    /expires\s+in\s+(\d+\s+(?:hours?|hrs?|days?))/i
  ];

  for (const regex of relativeRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      let relativeStr = match[1].trim();
      return {
        isUrgent: true,
        deadlineText: `Within ${relativeStr}`
      };
    }
  }

  // Interview / Assessment / Meeting / Invite keywords
  const assessmentKeywords = [
    "online assessment", 
    "coding challenge", 
    "coding test", 
    "technical test", 
    "technical assessment",
    "interview invitation",
    "schedule your interview",
    "interview", 
    "hackerrank", 
    "codesignal", 
    "codility",
    "assessment link",
    "assessment to be completed",
    "meeting",
    "scheduled",
    "test",
    "assessment",
    "hiring",
    "calendar",
    "invite",
    "zoom",
    "meet.google.com",
    "teams"
  ];

  for (const kw of assessmentKeywords) {
    if (text.includes(kw)) {
      let label = kw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const matchDays = text.match(/within\s+(\d+)\s+days?/i) || text.match(/in\s+(\d+)\s+days?/i);
      if (matchDays) {
        return { isUrgent: true, deadlineText: `${label} (Within ${matchDays[1]} days)` };
      }
      return {
        isUrgent: true,
        deadlineText: label
      };
    }
  }

  // Word boundary check for "OA" (Online Assessment)
  if (/\boa\b/i.test(text)) {
    const matchDays = text.match(/within\s+(\d+)\s+days?/i) || text.match(/in\s+(\d+)\s+days?/i);
    if (matchDays) {
      return { isUrgent: true, deadlineText: `Online Assessment (Within ${matchDays[1]} days)` };
    }
    return {
      isUrgent: true,
      deadlineText: "Online Assessment"
    };
  }

  // Urgent keywords without specific date
  if (text.includes("action required") || text.includes("urgent") || text.includes("immediate attention") || text.includes("reply within")) {
    const matchDays = text.match(/within\s+(\d+)\s+days?/i);
    if (matchDays) {
      return { isUrgent: true, deadlineText: `Within ${matchDays[1]} days` };
    }
    return {
      isUrgent: true,
      deadlineText: "Urgent"
    };
  }

  return {
    isUrgent: false,
    deadlineText: null
  };
}

// Parses date/time/link details from email subject and body
function parseMeetingSlot(subject, body) {
  const text = (subject + " " + body).toLowerCase();
  
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
                  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  
  let targetDate = new Date(); // fallback to today
  let dateFound = false;

  // 1. Match month and day: e.g. "july 2", "june 30th", "july 2nd"
  const monthDayRegex = new RegExp(`\\b(${months.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');
  const monthDayMatch = text.match(monthDayRegex);
  
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1].toLowerCase();
    const dayNum = parseInt(monthDayMatch[2]);
    
    let monthIdx = 0;
    if (monthStr.startsWith("jan")) monthIdx = 0;
    else if (monthStr.startsWith("feb")) monthIdx = 1;
    else if (monthStr.startsWith("mar")) monthIdx = 2;
    else if (monthStr.startsWith("apr")) monthIdx = 3;
    else if (monthStr.startsWith("may")) monthIdx = 4;
    else if (monthStr.startsWith("jun")) monthIdx = 5;
    else if (monthStr.startsWith("jul")) monthIdx = 6;
    else if (monthStr.startsWith("aug")) monthIdx = 7;
    else if (monthStr.startsWith("sep")) monthIdx = 8;
    else if (monthStr.startsWith("oct")) monthIdx = 9;
    else if (monthStr.startsWith("nov")) monthIdx = 10;
    else if (monthStr.startsWith("dec")) monthIdx = 11;
    
    targetDate.setMonth(monthIdx);
    targetDate.setDate(dayNum);
    dateFound = true;
  } else {
    // Look for slash/hyphen formats: e.g. "06/30" or "6/30"
    const dateSlashRegex = /\b(\d{1,2})[\/\-](\d{1,2})\b/;
    const dateSlashMatch = text.match(dateSlashRegex);
    if (dateSlashMatch) {
      const monthNum = parseInt(dateSlashMatch[1]) - 1;
      const dayNum = parseInt(dateSlashMatch[2]);
      targetDate.setMonth(monthNum);
      targetDate.setDate(dayNum);
      dateFound = true;
    } else {
      // Look for relative days: e.g. "tomorrow", "next monday", "monday"
      if (text.includes("tomorrow")) {
        targetDate.setDate(targetDate.getDate() + 1);
        dateFound = true;
      } else {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        for (let i = 0; i < 7; i++) {
          if (text.includes(days[i])) {
            const currentDay = targetDate.getDay();
            const targetDay = i;
            let diff = targetDay - currentDay;
            if (diff <= 0) diff += 7; // next week
            targetDate.setDate(targetDate.getDate() + diff);
            dateFound = true;
            break;
          }
        }
      }
    }
  }

  // If no date found, default to tomorrow
  if (!dateFound) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  // Match time: e.g. "10:00 am", "2:30 pm", "at 14:00", "at 3 pm"
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const searchWindows = ["at", "on", "time", "interview", "scheduled"];
  let timeMatch = null;
  
  for (const win of searchWindows) {
    const idx = text.indexOf(win);
    if (idx !== -1) {
      const sub = text.substring(idx, idx + 45);
      const match = sub.match(timeRegex);
      if (match && match[0] && !match[0].includes("/") && parseInt(match[1]) <= 24) {
        timeMatch = match;
        break;
      }
    }
  }
  
  if (!timeMatch) {
    timeMatch = text.match(/\b(1[0-2]|\d)(?::([0-5]\d))?\s*(am|pm)\b/i) || text.match(/\b(2[0-3]|[01]?\d):([0-5]\d)\b/);
  }
  
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    let mins = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
    
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    
    targetDate.setHours(hours, mins, 0, 0);
  } else {
    // Default to 10:00 AM
    targetDate.setHours(10, 0, 0, 0);
  }
  
  // Ensure we preserve today/future date bounds (move forward 1 year if parsed date is in the past)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (targetDate < oneDayAgo) {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }
  
  const duration = 60; // 60 mins default
  const endDate = new Date(targetDate.getTime() + duration * 60 * 1000);
  
  let location = "Virtual / Google Meet";
  let meetLink = "";
  
  const zoomMatch = text.match(/https?:\/\/[a-z0-9]+\.zoom\.us\/j\/[a-zA-Z0-9\?=\-_]+/i);
  const teamsMatch = text.match(/https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9\?=\-_%]+/i);
  const googleMeetMatch = text.match(/https?:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i);
  
  if (googleMeetMatch) {
    meetLink = googleMeetMatch[0];
    location = "Google Meet";
  } else if (zoomMatch) {
    meetLink = zoomMatch[0];
    location = "Zoom Meeting";
  } else if (teamsMatch) {
    meetLink = teamsMatch[0];
    location = "Microsoft Teams";
  }
  
  return {
    start: targetDate.toISOString(),
    end: endDate.toISOString(),
    location,
    meetLink
  };
}

// Get Emails Endpoint
app.get('/api/email/inbox', async (req, res) => {
  const { email } = req.query;
  
  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    const elapsed = demoSessionStartTime ? (Date.now() - demoSessionStartTime) : 0;
    const list = [
      {
        id: 'mock-email-2',
        from: 'hr@startupteam.io',
        fromName: 'StartupTeam HR',
        subject: 'Action Required: Complete Coding Challenge within 48 hours',
        snippet: 'Please complete the Hackerrank online assessment link sent below to proceed with your application...',
        body: 'Hello Demo,\n\nPlease complete the Hackerrank online assessment link sent below to proceed with your application. The test must be completed within 48 hours.\n\nHackerrank Link: https://hackerrank.com/test-startup-team\n\nThanks,\nHR Team',
        date: 'Yesterday',
        category: 'primary',
        starred: false,
        read: false,
        isUrgent: true,
        deadlineText: 'Online Assessment',
        isGoogle: false
      },
      {
        id: 'mock-email-3',
        from: 'newsletter@hacker-news.com',
        fromName: 'Hacker News Digest',
        subject: 'Tech Trends: The Rise of Agentic AI Frameworks',
        snippet: 'In this week\'s edition, we explore agentic architectures, state machines, and modern design aesthetics...',
        body: 'In this week\'s edition, we explore agentic architectures, state machines, and modern design aesthetics...',
        date: '2 days ago',
        category: 'updates',
        starred: false,
        read: true,
        isUrgent: false,
        deadlineText: '',
        isGoogle: false
      }
    ];

    // Deliver TechCorp Recruiting email after 10 seconds
    if (elapsed >= 10000) {
      list.unshift({
        id: 'mock-email-1',
        from: 'recruiter@techcorp.com',
        fromName: 'TechCorp Recruiting',
        subject: 'Urgent: Schedule Technical Interview - Software Engineer',
        snippet: 'Hi Demo, we loved your profile and want to schedule a 60-minute technical interview this week...',
        body: 'Hi Demo,\n\nWe loved your profile and want to schedule a 60-minute technical interview this week. Please let us know your availability tomorrow or next Monday for a virtual call.\n\nBest,\nTechCorp Recruiting Team',
        date: 'Today',
        category: 'primary',
        starred: true,
        read: false,
        isUrgent: true,
        deadlineText: 'Technical Interview',
        isGoogle: false
      });
    }

    // Deliver Meta Recruiting email after 20 seconds
    if (elapsed >= 20000) {
      list.push({
        id: 'mock-email-meta',
        from: 'recruiting@meta.com',
        fromName: 'Meta Recruiting',
        subject: 'Update: Senior React Developer Application',
        snippet: 'Hi Demo, we received your application 8 days ago and are currently reviewing it...',
        body: 'Hi Demo,\n\nThank you for applying to Meta. We received your application for the Senior React Developer role 8 days ago. We are currently matching your skills with the team.\n\nBest,\nMeta Recruiting',
        date: '8 days ago',
        category: 'primary',
        starred: true,
        read: false,
        isUrgent: true,
        deadlineText: 'Follow-up',
        isGoogle: false
      });
    }

    // Deliver Stripe Recruiting email after 60 seconds (1 minute)
    if (elapsed >= 60000) {
      list.push({
        id: 'mock-email-stripe',
        from: 'scheduling@stripe.com',
        fromName: 'Stripe Scheduling',
        subject: 'Schedule Interview: Stripe Frontend Engineer',
        snippet: 'Hi Demo, we want to schedule a 45-minute technical round with the dashboard team...',
        body: 'Hi Demo,\n\nWe want to schedule a 45-minute technical round with the dashboard team. Please use the link to schedule your slot.\n\nBest,\nStripe Dashboard Team',
        date: 'Today',
        category: 'primary',
        starred: true,
        read: false,
        isUrgent: true,
        deadlineText: 'Stripe Interview',
        isGoogle: false
      });
    }

    return res.json(list);
  }

  try {
    const authClient = await getAuthenticatedClient(email);
    if (!authClient) {
      return res.status(401).json({ error: "Google OAuth credentials not configured or disconnected." });
    }
    
    console.log("[Gmail API] Fetching live Google Mail inbox (last 7 days)...");
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    
    // Fetch only INBOX emails from the last week (7 days)
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      q: 'label:INBOX newer_than:7d'
    });
    
    const messages = response.data.messages || [];
    const fetchedEmails = [];
    
    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });
      
      const payload = detail.data.payload;
      const headers = payload.headers || [];
      
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
      
      const subject = subjectHeader ? subjectHeader.value : 'No Subject';
      const from = fromHeader ? fromHeader.value : 'Unknown Sender';
      const dateRaw = dateHeader ? dateHeader.value : '';
      
      let body = '';
      if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf8');
      } else if (payload.parts) {
        const partsToSearch = [...payload.parts];
        while (partsToSearch.length > 0) {
          const part = partsToSearch.shift();
          if (part.mimeType === 'text/plain' && part.body && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf8');
            break;
          }
          if (part.parts) {
            partsToSearch.push(...part.parts);
          }
        }
      }
      
      if (!body) {
        body = detail.data.snippet || '';
      }
      
      let fromName = from;
      const nameMatch = from.match(/^"([^"]+)"/);
      if (nameMatch) {
        fromName = nameMatch[1];
      } else {
        const emailMatch = from.match(/^([^<]+)</);
        if (emailMatch) {
          fromName = emailMatch[1].trim();
        }
      }
      
      const { isUrgent, deadlineText } = extractDeadline(subject, body);
      
      fetchedEmails.push({
        id: msg.id,
        from: from,
        fromName: fromName,
        subject: subject,
        snippet: detail.data.snippet || (body.slice(0, 100) + '...'),
        body: body,
        date: dateRaw ? new Date(dateRaw).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
        category: isUrgent ? 'primary' : 'updates',
        starred: detail.data.labelIds?.includes('STARRED') || false,
        read: !detail.data.labelIds?.includes('UNREAD'),
        isUrgent,
        deadlineText,
        isGoogle: true
      });
    }
    
    return res.json(fetchedEmails);
  } catch (err) {
    console.error("[Gmail API Live Fetch Error, falling back to mock check]", err.message);
  }

  return res.status(401).json({ error: "Google OAuth credentials not configured or disconnected." });
});


// Helper for Orchestrator multi-agent coordination
async function triggerOrchestrationLoop(email) {
  if (!email) return;
  const profiles = loadProfiles();
  const profile = profiles[email];
  if (!profile) return;

  const preferences = profile.preferences || {};
  
  // 1. Calculate financial details
  const finSetup = preferences.finSetup || {};
  const finExpenses = preferences.finExpenses || [];
  const totalExpenses = finExpenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  
  const financial = {
    income: parseFloat(finSetup.income) || 0,
    expenses: totalExpenses,
    savings: parseFloat(finSetup.savings) || 0
  };

  // 2. Read applications from database
  let applications = [];
  const dbPath = path.join(__dirname, 'applied_jobs.json');
  if (fs.existsSync(dbPath)) {
    try {
      applications = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error("[Orchestrator DB read fail]", e.message);
    }
  }

  // Filter applications by user's email if possible
  const userApps = applications.filter(app => app.applicant?.email === email);

  // 3. Fetch recent emails to check priority alerts
  let emails = [];
  try {
    const authClient = await getAuthenticatedClient(email);
    if (authClient) {
      const gmail = google.gmail({ version: 'v1', auth: authClient });
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        q: 'label:INBOX newer_than:7d'
      });
      const messages = response.data.messages || [];
      for (const msg of messages) {
        const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
        const headers = detail.data.payload.headers || [];
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        
        let body = '';
        const payload = detail.data.payload;
        if (payload.body && payload.body.data) {
          body = Buffer.from(payload.body.data, 'base64').toString('utf8');
        } else if (payload.parts) {
          const partsToSearch = [...payload.parts];
          while (partsToSearch.length > 0) {
            const part = partsToSearch.shift();
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf8');
              break;
            }
            if (part.parts) {
              partsToSearch.push(...part.parts);
            }
          }
        }
        if (!body) {
          body = detail.data.snippet || '';
        }

        let fromName = from;
        const nameMatch = from.match(/^"([^"]+)"/);
        if (nameMatch) {
          fromName = nameMatch[1];
        } else {
          const emailMatch = from.match(/^([^<]+)</);
          if (emailMatch) {
            fromName = emailMatch[1].trim();
          }
        }

        emails.push({ id: msg.id, subject, body, fromName, snippet: detail.data.snippet || '' });
      }
    }
  } catch (e) {
    // ignore
  }

  // Parse meeting slots for urgent emails (skip already confirmed/dismissed ones)
  const confirmedMeetingEmailIds = preferences.confirmedMeetingEmailIds || [];
  for (const emailObj of emails) {
    // Skip if user already confirmed/dismissed this meeting notification
    if (confirmedMeetingEmailIds.includes(emailObj.id)) continue;

    const { isUrgent } = extractDeadline(emailObj.subject, emailObj.body);
    const text = (emailObj.subject + " " + emailObj.body).toLowerCase();
    
    const hasSchedulingIntent = text.includes("schedule") || 
                                text.includes("interview") || 
                                text.includes("meeting") || 
                                text.includes("slot") || 
                                text.includes("calendar") ||
                                text.includes("invite") ||
                                text.includes("zoom") ||
                                text.includes("teams") ||
                                text.includes("meet.google.com");

    if (isUrgent && hasSchedulingIntent) {
      console.log(`[Meeting Triage] Found meeting slot in email: "${emailObj.subject}"`);
      const slot = parseMeetingSlot(emailObj.subject, emailObj.body);
      emailObj.meetingSlot = {
        title: `📝 Interview/Meeting: ${emailObj.subject.replace(/re:|fwd:/gi, '').trim()}`,
        description: `Scheduled in response to email from ${emailObj.fromName}.\n\nSource Email Content:\n${emailObj.snippet || emailObj.body.slice(0, 200)}`,
        start: slot.start,
        end: slot.end,
        location: slot.location,
        meetLink: slot.meetLink
      };
    }
  }

  // 4. Load news context
  let newsArticles = [];
  if (preferences.newsKeyword) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(preferences.newsKeyword)}&hl=en-US&gl=US&ceid=US:en`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      });
      if (response.ok) {
        const xmlText = await response.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xmlText)) !== null && newsArticles.length < 5) {
          const itemContent = match[1];
          const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
          const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
          newsArticles.push({ title });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 5. Jobs list
  const jobs = preferences.activeJobs || [];

  const state = {
    financial,
    applications: userApps,
    emails,
    news: { articles: newsArticles, keywords: preferences.newsKeyword || "" },
    jobs,
    notifiedJobIds: preferences.notifiedJobIds || [],
    onJobNotified: (jobId) => {
      if (!preferences.notifiedJobIds) {
        preferences.notifiedJobIds = [];
      }
      if (!preferences.notifiedJobIds.includes(jobId)) {
        preferences.notifiedJobIds.push(jobId);
        saveProfile(email, { preferences });
      }
    }
  };

  await runCoordinatedOrchestration(state);
}

// --- DEMO MODE DATA STORES ---
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formats an arbitrary Date as a local YYYY-MM-DD string. Unlike `date.toISOString()`
// (which is always UTC and can land on the wrong calendar day depending on server
// timezone), this always reflects the server's own local wall-clock date.
const formatLocalDateYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


function saveDemoEventsToDisk() {
  const payload = JSON.stringify(inMemoryDemoCalendarEvents, null, 2);
  try {
    fs.writeFileSync(DEMO_EVENTS_PATH, payload, 'utf8');
  } catch (err) {
    // This file lives inside a OneDrive-synced folder, which can transiently lock it
    // during cloud sync. One immediate retry clears that in most cases; if it still
    // fails, in-memory state is ahead of disk until the next successful save.
    console.warn("[Demo Calendar Disk Sync] Write failed, retrying once:", err.message);
    try {
      fs.writeFileSync(DEMO_EVENTS_PATH, payload, 'utf8');
    } catch (retryErr) {
      console.error("[Demo Calendar Disk Sync Error] Write failed after retry:", retryErr.message);
    }
  }
}

function regenerateMockEventsInMemory() {
  if (fs.existsSync(DEMO_EVENTS_PATH)) {
    try {
      const data = fs.readFileSync(DEMO_EVENTS_PATH, 'utf8');
      inMemoryDemoCalendarEvents = JSON.parse(data);
      return;
    } catch (err) {
      console.error("[Demo Calendar Load Error, regenerating default mocks]", err.message);
    }
  }

  const now = new Date();
  const relativeDate = (daysOffset, hour, minute) => {
    const d = new Date(now);
    d.setDate(now.getDate() + daysOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  inMemoryDemoCalendarEvents = [
    { id: 'mock-1', title: '🚀 Product Roadmap Sync', description: 'Review Q3 tech stack dependencies and coordinate the AgentOS dashboard release pipeline.', start: relativeDate(0, 10, 0), end: relativeDate(0, 11, 0), location: 'Virtual / Google Meet', meetLink: 'https://meet.google.com/abc-defg-hij', isGoogle: false },
    { id: 'mock-lunch-walk', title: '🚶 Post-Lunch Digestive Walk', description: 'Brisk 15-minute digestive walk to stabilize blood sugar and clear cognitive fatigue.', start: relativeDate(0, 13, 0), end: relativeDate(0, 13, 15), location: 'Outdoors', meetLink: '', isGoogle: false },
    { id: 'mock-2', title: '💻 Deep Work Focus Block', description: 'Undistracted feature development for Calendar Planner agent connection and layout testing.', start: relativeDate(0, 14, 0), end: relativeDate(0, 16, 0), location: 'Workspace', meetLink: '', isGoogle: false },
    { id: 'mock-workout', title: '💪 Daily Active Exercise / Workout', description: 'Stretching & strength routine for active habits.', start: relativeDate(0, 17, 0), end: relativeDate(0, 17, 30), location: 'Home Gym / Living Room', meetLink: '', isGoogle: false },
    { id: 'mock-3', title: '🎨 AgentOS Design Review', description: 'Review glassmorphic aesthetic feedback, dashboard grid margins, and responsive layouts.', start: relativeDate(1, 11, 30), end: relativeDate(1, 12, 30), location: 'Design Portal Room', meetLink: 'https://meet.google.com/xyz-uvwx-123', isGoogle: false },
    { id: 'mock-4', title: '📝 Technical Interview Practice', description: 'Solve target algorithms and practice mock dynamic system design questions.', start: relativeDate(2, 15, 0), end: relativeDate(2, 16, 30), location: 'Workstation', meetLink: '', isGoogle: false },
    { id: 'mock-5', title: '☕ 1:1 Engineering Director Sync', description: 'Discuss Q3 deliverables, carrier scrape portal benchmarks, and future agent architectures.', start: relativeDate(3, 10, 0), end: relativeDate(3, 10, 30), location: 'Hangouts Space', meetLink: 'https://meet.google.com/mno-pqrst-uvw', isGoogle: false }
  ];
  saveDemoEventsToDisk();
}
// Seed on startup
regenerateMockEventsInMemory();


let demoNotifications = [];
let dismissedDemoNotificationIds = new Set();
let demoSessionStartTime = null;
let demoJobSearchTriggered = false;

function resetDemoNotifications() {
  dismissedDemoNotificationIds.clear();
  demoNotifications = [];
}

// Initialize on startup
resetDemoNotifications();

// Orchestrator Notifications Endpoint
app.get('/api/orchestrator/notifications', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required." });
  }

  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    const activeDemo = [...demoNotifications];
    const elapsed = demoSessionStartTime ? (Date.now() - demoSessionStartTime) : 0;
    
    // Check if 10 seconds have passed since demo login -> Show Urgent Interview
    if (elapsed >= 10000) {
      const hasInterview = activeDemo.some(n => n.id === "coord-confirm-meeting-demoemail1");
      if (!hasInterview && !dismissedDemoNotificationIds.has("coord-confirm-meeting-demoemail1")) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const pad = (n) => String(n).padStart(2, "0");
        const startStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00:00`;
        const endStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T11:00:00`;

        activeDemo.push({
          id: "coord-confirm-meeting-demoemail1",
          title: "Urgent Interview Detected",
          message: `TechCorp Recruiting requests technical interview scheduling for tomorrow at 10:00 AM. Confirm slot to add to calendar.`,
          severity: "warning",
          actionText: "Confirm Slot",
          actionTile: 1,
          payload: {
            suggestedEvent: {
              title: "🚀 TechCorp Technical Interview",
              description: "Technical interview with TechCorp Recruiting Team.",
              start: startStr,
              end: endStr,
              location: "Google Meet",
              meetLink: "https://meet.google.com/abc-defg-hij"
            }
          }
        });
      }
    }

    // Check if 20 seconds have passed since demo login -> Show Stagnant Application follow-up
    if (elapsed >= 20000) {
      const hasFollowUp = activeDemo.some(n => n.id === "coord-tracker-followup-demoapp1");
      if (!hasFollowUp && !dismissedDemoNotificationIds.has("coord-tracker-followup-demoapp1")) {
        activeDemo.push({
          id: "coord-tracker-followup-demoapp1",
          title: "Stagnant Application Alert",
          message: "No response in 8 days from Meta for \"Senior React Developer\". Flagged for immediate follow-up.",
          severity: "info",
          actionText: "Draft Follow-up Email",
          actionTile: 2
        });
      }
    }

    // Check if job search setup was triggered by the user
    if (demoJobSearchTriggered) {
      const fortyFiveSecondsPassed = demoSessionStartTime && (Date.now() - demoSessionStartTime >= 45000);
      
      // Always show IBM match (better fit, <= 95%)
      const hasIbm = activeDemo.some(n => n.id === "coord-job-match-demo-job-ibm");
      if (!hasIbm && !dismissedDemoNotificationIds.has("coord-job-match-demo-job-ibm")) {
        activeDemo.push({
          id: "coord-job-match-demo-job-ibm",
          title: "🔥 JOB MATCH: 94%",
          message: "New Match: \"Senior Frontend Developer\" at IBM — 94% profile fit.",
          severity: "success",
          actionText: "Auto-Fill Application",
          actionTile: 3,
          payload: {
            job: {
              id: "demo-job-ibm",
              company: "IBM",
              companyEmoji: "█",
              companyDesc: "IBM Hybrid Cloud UX Innovation team developing state-of-the-art developer consoles.",
              title: "Senior Frontend Developer",
              score: 94,
              standsOut: "Strong experience match. Aligns with your target seniority level.",
              seniorityMatch: "perfect",
              location: "Remote",
              url: "https://ibm.com/careers",
              status: "ready"
            }
          }
        });
      }

      if (fortyFiveSecondsPassed) {
        // Show Google match on second sync (first match, <= 95%)
        const hasGoogle = activeDemo.some(n => n.id === "coord-job-match-demo-job-1");
        if (!hasGoogle && !dismissedDemoNotificationIds.has("coord-job-match-demo-job-1")) {
          activeDemo.push({
            id: "coord-job-match-demo-job-1",
            title: "🔥 JOB MATCH: 87%",
            message: "New Match: \"Frontend Engineer\" at Google — 87% profile fit.",
            severity: "success",
            actionText: "Auto-Fill Application",
            actionTile: 3,
            payload: {
              job: {
                id: "demo-job-1",
                company: "Google",
                companyEmoji: "▲",
                companyDesc: "Google's Core Dev team working on next-gen productivity and scheduling tools.",
                title: "Frontend Engineer",
                score: 87,
                standsOut: "Aligns perfectly with your skillset. Aligns with your target title.",
                seniorityMatch: "perfect",
                location: "Remote",
                url: "https://google.com/careers",
                status: "ready"
              }
            }
          });
        }
      }
    }

    // Check if 60 seconds (1 minute) have passed since demo login -> Show Stripe Interview scheduler
    if (elapsed >= 60000) {
      const hasStripe = activeDemo.some(n => n.id === "coord-confirm-meeting-stripe");
      if (!hasStripe && !dismissedDemoNotificationIds.has("coord-confirm-meeting-stripe")) {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        const pad = (n) => String(n).padStart(2, "0");
        const startStr = `${twoDaysFromNow.getFullYear()}-${pad(twoDaysFromNow.getMonth() + 1)}-${pad(twoDaysFromNow.getDate())}T14:00:00`;
        const endStr = `${twoDaysFromNow.getFullYear()}-${pad(twoDaysFromNow.getMonth() + 1)}-${pad(twoDaysFromNow.getDate())}T15:00:00`;

        activeDemo.push({
          id: "coord-confirm-meeting-stripe",
          title: "Stripe Scheduling Request",
          message: "Stripe Recruiting requests scheduling a Technical Round. Confirm slot to add to calendar.",
          severity: "warning",
          actionText: "Confirm Slot",
          actionTile: 1,
          payload: {
            suggestedEvent: {
              title: "⚡ Stripe Technical Interview",
              description: "Technical Round for Frontend Engineer position at Stripe.",
              start: startStr,
              end: endStr,
              location: "Stripe Meet / Google Meet",
              meetLink: "https://meet.google.com/stripe-meet"
            }
          }
        });
      }
    }
    
    const filteredDemo = activeDemo.filter(n => !dismissedDemoNotificationIds.has(n.id));
    return res.json({ notifications: filteredDemo });
  }

  try {
    await triggerOrchestrationLoop(email);
    res.json({ notifications: ambientNotifications });
  } catch (err) {
    res.status(500).json({ error: "Orchestration failed: " + err.message });
  }
});

// Dismiss Notification Endpoint
app.post('/api/orchestrator/dismiss', (req, res) => {
  const { id, email } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Notification ID is required." });
  }

  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    dismissedDemoNotificationIds.add(id);
    return res.json({ success: true });
  }

  try {
    // Filter out from ambient list
    const index = ambientNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      ambientNotifications.splice(index, 1);
    }

    // If this was a meeting confirmation notification, persist the email ID so the
    // orchestrator loop never re-generates it for this email.
    if (email && id.startsWith('coord-confirm-meeting-')) {
      const emailId = id.replace('coord-confirm-meeting-', '');
      const profiles = loadProfiles();
      const profile = profiles[email];
      if (profile) {
        const prefs = profile.preferences || {};
        const confirmed = prefs.confirmedMeetingEmailIds || [];
        if (!confirmed.includes(emailId)) {
          confirmed.push(emailId);
          prefs.confirmedMeetingEmailIds = confirmed;
          saveProfile(email, { preferences: prefs });
          console.log(`[Meeting Triage] Persisted confirmed meeting email ID: ${emailId}`);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to dismiss notification: " + err.message });
  }
});

// Load profile preferences
app.get('/api/profile/load', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required." });
  }
  const profiles = loadProfiles();
  const profile = profiles[email] || {
    email,
    name: '',
    picture: '',
    preferences: {}
  };

  // Also check if they have Google tokens connected
  const isGoogleConnected = await hasTokens(email);

  res.json({
    ...profile,
    isGoogleConnected
  });
});

// Client Log Endpoint for Frontend Error Relay and Monitoring
app.post('/api/client-log', (req, res) => {
  const { level, file, fn, msg, error, ts } = req.body;
  const timestamp = ts || new Date().toISOString();
  
  // Format log message with time, level, file, function name and details
  let logOutput = `[FRONTEND] [${timestamp}] [${level}] [${file}:${fn}] ${msg}`;
  if (error) {
    logOutput += `\n  Error Details: ${error.name || 'Error'}: ${error.message || error}`;
    if (error.stack) {
      logOutput += `\n  Stack Trace:\n${error.stack}`;
    }
  }
  
  // Print to server console
  if (level === 'ERROR') {
    console.error(logOutput);
  } else if (level === 'WARN') {
    console.warn(logOutput);
  } else {
    console.log(logOutput);
  }
  
  return res.json({ success: true });
});


// Save profile preferences
app.post('/api/profile/save', (req, res) => {
  const { email, name, picture, preferences } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required." });
  }
  try {
    const updatedProfile = saveProfile(email, { name, picture, preferences });
    res.json({ success: true, profile: updatedProfile });
  } catch (err) {
    res.status(500).json({ error: "Failed to save profile: " + err.message });
  }
});

// Send Gmail API follow-up and update application status
app.post('/api/email/followup', async (req, res) => {
  const { email, to, subject, body, company } = req.body;

  if (!email || !to || !subject || !body) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (email && email.toLowerCase().startsWith('demouser@gmail')) {
    console.log(`[Demo SMTP Relay] Mock email sent from demouser@gmail to ${to}`);
    dismissedDemoNotificationIds.add("coord-tracker-followup-demoapp1");
    return res.json({ success: true });
  }

  try {
    const authClient = await getAuthenticatedClient(email);
    if (!authClient) {
      return res.status(401).json({ error: "Google Gmail account not authenticated." });
    }

    console.log(`[Gmail API] Sending follow-up email from ${email} to ${to}...`);
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    // Construct raw MIME email
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    // Mark corresponding stagnant job application as followed_up in applied_jobs.json
    const dbPath = path.join(__dirname, 'applied_jobs.json');
    if (fs.existsSync(dbPath)) {
      try {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        const applications = JSON.parse(fileContent);
        
        let updated = false;
        for (const app of applications) {
          if (app.applicant?.email === email && 
              app.job?.company && 
              company && 
              app.job.company.toLowerCase() === company.toLowerCase() &&
              (!app.status || app.status === 'applied' || app.status === 'ready')) {
            app.status = 'followed_up';
            updated = true;
            break;
          }
        }

        if (updated) {
          fs.writeFileSync(dbPath, JSON.stringify(applications, null, 4), 'utf8');
          console.log(`[Gmail API] Marked application at ${company} as followed_up.`);
        }
      } catch (err) {
        console.error("Error updating application follow-up status:", err.message);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[Gmail API Send Error]", err.message);
    return res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

// Demo authentication endpoint (resets preferences to a fresh new user state)
app.post('/api/auth/demo', (req, res) => {
  try {
    const today = getLocalDateString();
    
    // Construct the fresh user profile preferences
    const freshDemoProfile = {
      email: 'demouser@gmail.com',
      name: 'Demo User',
      picture: '',
      preferences: {
        prefTitles: '', // job search empty titles
        prefLocation: '', // job search empty location
        prefHours: 72,
        prefSkills: '',
        prefYOE: '',
        prefSeniority: 'mid',
        resumeText: '',
        resumeSkills: [],
        resumeExperiences: [],
        resumeFile: null,
        personalInfo: { 
          name: 'Demo User', 
          email: 'demouser@gmail.com', // mock email
          phone: '+1 (555) 019-2834', 
          linkedin: 'linkedin.com/in/demouser', 
          github: 'github.com/demouser', 
          location: 'United States' 
        },
        newsKeyword: '', // ask for topic for news
        finSetup: null, // fresh start for financial
        finExpenses: [],
        finHistory: [],
        activeJobs: [],
        waterCups: 0,
        exerciseMinutes: 0,
        wellnessLastResetDate: today,
        wellnessWakeTime: '07:00',
        wellnessSleepTime: '22:00'
      }
    };

    // Store demo profile in-memory only (no disk write)
    // to avoid triggering Vite's file watcher which causes a full page reload
    inMemoryDemoProfile = freshDemoProfile;

    // Reset demo notifications and start the calendar completely empty. The demo is meant
    // to show each feature working live (e.g. the "Urgent Interview Detected" notification
    // flow creating its own event) — not open with a calendar already full of mock events
    // accumulated from earlier demo sessions, which is what regenerateMockEventsInMemory()
    // (loads from demo_calendar_events.json, or a hardcoded fallback) would otherwise do.
    demoSessionStartTime = Date.now();
    demoJobSearchTriggered = false;
    resetDemoNotifications();
    inMemoryDemoCalendarEvents = [];
    saveDemoEventsToDisk();

    res.json({
      success: true,
      profile: freshDemoProfile
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize demo session: " + err.message });
  }
});

// ============================================================================
// SECURE DATA ENDPOINTS (Encrypted Job Applications & Wellness Data)
// ============================================================================

/**
 * POST /api/secure/application
 * Save a job application with encryption for sensitive fields
 */
app.post('/api/secure/application', (req, res) => {
  try {
    const { jobId, company, title, coverLetter, personalNotes, salaryExpectation, contactInfo } = req.body;
    
    const application = {
      id: `app-${Date.now()}`,
      jobId,
      company,
      title,
      coverLetter,      // Will be encrypted
      personalNotes,    // Will be encrypted
      salaryExpectation, // Will be encrypted
      contactInfo       // Will be encrypted
    };
    
    const result = saveJobApplication(application);
    res.json({ success: true, message: 'Application saved securely (encrypted)', result });
  } catch (err) {
    console.error('[Secure API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/secure/application/:id
 * Retrieve a job application with decryption
 */
app.get('/api/secure/application/:id', (req, res) => {
  try {
    const application = getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    console.error('[Secure API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/secure/wellness
 * Save a wellness entry with encryption for personal health data
 */
app.post('/api/secure/wellness', (req, res) => {
  try {
    const { waterIntake, activeMinutes, heartRate, bloodPressure, medications, notes } = req.body;
    
    const entry = {
      id: `wellness-${Date.now()}`,
      waterIntake,
      activeMinutes,
      heartRate,        // Will be encrypted
      bloodPressure,    // Will be encrypted
      medications,      // Will be encrypted
      notes             // Will be encrypted
    };
    
    const result = saveWellnessEntry(entry);
    res.json({ success: true, message: 'Wellness entry saved securely (encrypted)', result });
  } catch (err) {
    console.error('[Secure API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/secure/wellness/history
 * Retrieve all wellness entries with decryption
 */
app.get('/api/secure/wellness/history', (req, res) => {
  try {
    const history = getWellnessHistory();
    res.json(history);
  } catch (err) {
    console.error('[Secure API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

/**
 * GET /api/profile/:email
 * Get user profile and check if first login
 */
app.get('/api/profile/:email', (req, res) => {
  try {
    const { email } = req.params;
    const profile = getProfile(email);
    const isFirst = isFirstLogin(email);
    
    res.json({
      profile,
      isFirstLogin: isFirst,
      defaultPreferences: isFirst ? getDefaultPreferences() : null
    });
  } catch (err) {
    console.error('[Profile API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/profile/:email/setup
 * First-time user setup - save preferences
 */
app.post('/api/profile/:email/setup', (req, res) => {
  try {
    const { email } = req.params;
    const { dietPreference, exerciseStyle, wellnessWakeTime, wellnessSleepTime } = req.body;
    
    const preferences = {
      dietPreference: dietPreference || 'none',
      exerciseStyle: exerciseStyle || 'stretching',
      wellnessWakeTime: wellnessWakeTime || '07:00',
      wellnessSleepTime: wellnessSleepTime || '22:00',
      autoScheduleEnabled: true,
      autoScheduleDay: 6, // Saturday
      autoScheduleTime: '20:00'
    };
    
    const profile = saveProfile(email, { preferences });
    res.json({ success: true, profile, message: 'Profile setup complete!' });
  } catch (err) {
    console.error('[Profile Setup Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/profile/:email/preferences
 * Update user preferences (diet, exercise, wake/sleep times)
 */
app.post('/api/profile/:email/preferences', (req, res) => {
  try {
    const { email } = req.params;
    const preferences = req.body;
    
    const profile = saveProfile(email, preferences);
    res.json({ success: true, profile });
  } catch (err) {
    console.error('[Preferences Update Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// WEEKLY AUTO-SCHEDULING ENDPOINTS
// ============================================================================

/**
 * POST /api/schedule/weekly
 * Schedule all wellness tasks for the upcoming week (Mon-Fri)
 * Call this every Saturday to schedule the next week
 */
// Schedules wellness tasks for Mon-Fri of the week starting at `startDate`, for one user.
// Shared by the manual /api/schedule/weekly endpoint and the Saturday cron job below —
// relies on the dedupe guard in POST /api/calendar/events, so re-running it (e.g. the
// cron firing again after a server restart) is a safe no-op for days already scheduled.
async function runWeeklyScheduling(email, startDate, numDays = 5) {
  console.log(`[Weekly Scheduler] Scheduling wellness tasks for "${email}", ${numDays} day(s) starting ${startDate}`);

  const prefs = getUserPreferences(email);
  const scheduledDays = [];
  let totalScheduled = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let requiresGoogleReconnect = false;
  let lastError = null;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let dayOffset = 0; dayOffset < numDays; dayOffset++) {
    const date = new Date(`${startDate}T00:00:00`);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = formatLocalDateYMD(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Call optimize endpoint for this day
    const optimizeRes = await fetch('http://localhost:' + PORT + '/api/daily-focus/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diet: prefs.dietPreference,
        exercise: prefs.exerciseStyle,
        wakeTime: prefs.wellnessWakeTime,
        sleepTime: prefs.wellnessSleepTime,
        localDate: dateStr,
        email,
        completedEvents: []
      })
    });

    if (!optimizeRes.ok) {
      console.error(`[Weekly Scheduler] Failed to optimize day ${dayName}`);
      continue;
    }

    const plan = await optimizeRes.json();

    // Schedule all suggestions for this day. A small delay between each real Google
    // Calendar insert avoids bursting past Google's per-user rate limit (creating a
    // whole week — 25 events — back to back with zero delay is exactly the kind of burst
    // that trips it, whereas a single manually-created event never would).
    for (const sug of plan.suggestions) {
      try {
        if (!isDemoEmail(email)) await sleep(300);

        const eventRes = await fetch('http://localhost:' + PORT + '/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: sug.name,
            description: sug.details,
            start: sug.startISO,
            end: sug.endISO,
            location: sug.type === "walking" ? "Outdoors" : sug.type === "cooking" ? "Kitchen" : "Home",
            createMeet: false,
            email,
            completedEvents: [],
            isAutoScheduled: true
          })
        });

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          if (eventData.skipped) {
            totalSkipped++;
          } else {
            totalScheduled++;
          }
        } else {
          const errorData = await eventRes.json().catch(() => ({}));
          totalFailed++;
          lastError = errorData.error || `HTTP ${eventRes.status}`;
          if (errorData.requiresGoogleReconnect) {
            requiresGoogleReconnect = true;
          }
          console.error(`[Weekly Scheduler] Failed to schedule "${sug.name}" for ${dateStr}: ${lastError}`);
        }
      } catch (err) {
        console.error(`[Weekly Scheduler] Error scheduling ${sug.name}:`, err.message);
      }
    }

    scheduledDays.push({
      date: dateStr,
      day: dayName,
      suggestionsCount: plan.suggestions.length
    });
  }

  return {
    success: true,
    message: `Weekly schedule created! ${totalScheduled} wellness tasks scheduled, ${totalSkipped} already scheduled${totalFailed > 0 ? `, ${totalFailed} failed` : ''}.`,
    scheduledDays,
    totalScheduled,
    totalSkipped,
    totalFailed,
    lastError,
    requiresGoogleReconnect
  };
}

// Schedules wellness tasks for "the rest of this work week" right now, rather than
// waiting for the Saturday cron. Without this, a user logging in mid-week (or the very
// first time, before any Saturday has passed) would see no auto-scheduled tasks at all —
// the cron alone can only ever affect the *following* week, and only if the server
// happens to be running at 9am on a Saturday. Safe to call on every login: the dedupe
// guard in POST /api/calendar/events makes re-running this a no-op for already-scheduled days.
async function scheduleCurrentOrUpcomingWeek(email) {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sunday ... 6 = Saturday

  if (dow >= 1 && dow <= 5) {
    // Weekday: schedule from today through Friday of this week.
    const startDate = formatLocalDateYMD(today);
    const numDays = 6 - dow; // Monday(1) -> 5 days through Friday, Friday(5) -> 1 day
    return runWeeklyScheduling(email, startDate, numDays);
  }

  // Weekend: schedule the upcoming Mon-Fri right away instead of waiting for the cron.
  const daysUntilMonday = dow === 6 ? 2 : 1; // Saturday -> +2, Sunday -> +1
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return runWeeklyScheduling(email, formatLocalDateYMD(nextMonday), 5);
}

app.post('/api/schedule/current-week', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = await scheduleCurrentOrUpcomingWeek(email);
    res.json(result);
  } catch (err) {
    console.error('[Current Week Scheduler Error]', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedule/weekly', async (req, res) => {
  const { email, startDate } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = await runWeeklyScheduling(email, startDate);
    res.json(result);
  } catch (err) {
    console.error('[Weekly Scheduler Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/schedule/check-conflicts
 * Check if there are scheduling conflicts and use agent to reschedule intelligently
 */
app.post('/api/schedule/check-conflicts', async (req, res) => {
  const { email, eventDate, conflictingWellnessTask, newEvent } = req.body;

  try {
    // For now, return a simple conflict detection
    // In production, this would use the IntelligentReschedulerAgent

    res.json({
      hasConflict: true,
      suggestedAction: {
        type: 'reschedule',
        task: conflictingWellnessTask,
        newTime: 'Agent will determine best time',
        reason: 'Intelligent rescheduling based on task type and availability'
      }
    });
  } catch (err) {
    console.error('[Conflict Check Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Every Saturday at 9:00 AM server time, auto-schedule Mon-Fri wellness tasks for the
// upcoming week for every known user. Safe to re-run (e.g. after a restart) since
// runWeeklyScheduling relies on the dedupe guard in POST /api/calendar/events.
cron.schedule('0 9 * * 6', async () => {
  console.log('[Weekly Cron] Running Saturday auto-schedule for the upcoming week...');
  const profiles = loadProfiles();
  const emails = [...new Set(Object.keys(profiles))];

  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7; // Saturday(6) -> +2, Sunday(0) -> +1
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  const startDate = formatLocalDateYMD(nextMonday);

  for (const email of emails) {
    try {
      const result = await runWeeklyScheduling(email, startDate);
      console.log(`[Weekly Cron] ${email}: ${result.message}`);
    } catch (err) {
      console.error(`[Weekly Cron] Failed for ${email}:`, err.message);
    }
  }
});

// Catch-all route to serve the built frontend single page application index.html
app.get('*any', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Production assets not built yet. Run 'npm run build' first.");
  }
});

app.listen(PORT, () => {
  console.log(`[API] AgentOS backend server running on http://localhost:${PORT}`);
});
