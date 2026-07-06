import { LlmAgent, FunctionTool } from './adk.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * INTELLIGENT RESCHEDULING AGENT
 * Uses Gemini 2.0 to make smart decisions about moving wellness tasks
 * when there are conflicts with important events (meetings, interviews, tests)
 * ============================================================================
 */

// Skill: Analyze conflict and suggest reschedule
const ConflictAnalysisSkill = new FunctionTool({
  name: 'ConflictAnalysisSkill',
  description: 'Analyzes a scheduling conflict and determines how to intelligently reschedule.',
  parameters: {
    type: 'object',
    properties: {
      conflictingTask: { type: 'string', description: 'The wellness task that conflicts (e.g., "Lunch at 12:00-13:00")' },
      newEvent: { type: 'string', description: 'The new event causing conflict (e.g., "Interview at 11:30-12:30")' },
      availableSlots: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Array of available time slots (e.g., ["10:00-11:00", "13:30-14:30"])' 
      },
      taskType: { type: 'string', description: 'Type of task: "meal", "exercise", "focus", "walk"' },
      taskDuration: { type: 'number', description: 'Duration in minutes' }
    },
    required: ['conflictingTask', 'newEvent', 'availableSlots', 'taskType', 'taskDuration']
  },
  execute: async ({ conflictingTask, newEvent, availableSlots, taskType, taskDuration }) => {
    // Parse times
    const parseTime = (timeStr) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (!match) return null;
      return match[1] * 60 + parseInt(match[2]);
    };

    const availableMinutes = availableSlots.map(slot => {
      const [start, end] = slot.split('-');
      return { start: parseTime(start), end: parseTime(end), slot };
    }).filter(s => s.start !== null && s.end !== null && (s.end - s.start) >= taskDuration);

    if (availableMinutes.length === 0) {
      return {
        action: 'skip',
        reason: 'No available slots can accommodate this task',
        recommendation: 'Task will be skipped for this day'
      };
    }

    // Intelligent decision based on task type
    let bestSlot = availableMinutes[0];

    if (taskType === 'meal') {
      // Prefer slots around typical meal times
      const lunchPreferred = availableMinutes.find(s => s.start >= 11 * 60 && s.start <= 13 * 60);
      const dinnerPreferred = availableMinutes.find(s => s.start >= 18 * 60 && s.start <= 20 * 60);
      
      if (conflictingTask.toLowerCase().includes('lunch') && lunchPreferred) {
        bestSlot = lunchPreferred;
      } else if (conflictingTask.toLowerCase().includes('dinner') && dinnerPreferred) {
        bestSlot = dinnerPreferred;
      } else if (conflictingTask.toLowerCase().includes('lunch') && !lunchPreferred) {
        // Lunch got blocked, try next best slot
        bestSlot = availableMinutes[availableMinutes.length - 1]; // Last slot
      }
    } else if (taskType === 'exercise' || taskType === 'walk') {
      // Prefer afternoon/evening slots (4 PM - 6 PM)
      const afternoonSlot = availableMinutes.find(s => s.start >= 16 * 60 && s.start <= 18 * 60);
      bestSlot = afternoonSlot || availableMinutes[availableMinutes.length - 1];
    } else if (taskType === 'focus') {
      // Prefer morning slots (9 AM - 12 PM)
      const morningSlot = availableMinutes.find(s => s.start >= 9 * 60 && s.start <= 12 * 60);
      bestSlot = morningSlot || availableMinutes[0];
    }

    const minutes = Math.floor(bestSlot.start / 60);
    const mins = bestSlot.start % 60;
    const startStr = `${String(minutes).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    return {
      action: 'reschedule',
      newSlot: bestSlot.slot,
      newStartTime: startStr,
      reason: `Intelligently moved ${taskType} task to available slot`,
      confidence: 'high'
    };
  }
});

// Main Intelligent Rescheduler Agent
export const IntelligentReschedulerAgent = new LlmAgent({
  name: 'IntelligentRescheduler',
  description: 'Analyzes scheduling conflicts and makes intelligent decisions about rescheduling wellness tasks.',
  instruction: `You are an intelligent scheduling assistant. When there's a conflict between a wellness task and a new important event (meeting, interview, test), decide the best action.

Consider:
- The importance of the new event (interviews/tests > meetings > other)
- The type of wellness task (meals should be rescheduled close to typical times, workouts should stay afternoon/evening, focus blocks should stay morning)
- Available slots provided
- User well-being (don't skip important wellness activities, reschedule them intelligently)

Always choose to reschedule rather than skip when possible. Use the ConflictAnalysisSkill to get specific recommendations.`,
  model: 'gemini-2.5-flash',
  tools: [ConflictAnalysisSkill]
});

// Agent used specifically to DECIDE where a conflicting wellness task should move.
// Deliberately configured with no tools: the model must reason about the conflict itself
// and answer directly, rather than deferring to a hardcoded FunctionTool like
// ConflictAnalysisSkill above (which just branches on taskType strings). Callers must
// supply the actual available time gaps — this agent only decides which one to use and why.
const ReschedulingDecisionAgent = new LlmAgent({
  name: 'ReschedulingDecisionAgent',
  description: 'Decides how to intelligently move a single conflicting wellness task, given real availability.',
  instruction: `You are an intelligent scheduling assistant helping a busy person keep up their wellness habits.

A wellness task now overlaps a newly scheduled important event (meeting, interview, test, etc). Decide the single best replacement time slot for the wellness task, or decide it should be skipped for today if nothing reasonable fits.

Use your own judgment about what makes sense for the specific task described (for example: meals generally belong near typical meal times, workouts are usually better later in the day, focused work is usually better earlier, a short walk works almost anywhere) — but you are not given a fixed rulebook; reason about the actual task, its duration, and the actual available slots provided.

All else being equal, prefer a slot at or after the task's original time over one before it — sliding a task later reads as "making room for the new thing," while jumping it earlier in the day tends to feel arbitrary to the person it's for. This is a preference, not a rule: if a slot earlier in the day is clearly the better fit for this specific task, choose it anyway.

Respond with ONLY strict JSON, no markdown fences, no extra commentary, in exactly this shape:
{"action": "reschedule", "startTime": "HH:MM", "reason": "one short sentence"}
or
{"action": "skip", "reason": "one short sentence"}`,
  model: 'gemini-2.5-flash',
  tools: []
});

function parseJsonFromModelText(text) {
  if (!text) throw new Error('Empty model response');
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
}

// Asks the LLM to decide how to reschedule a single conflicting wellness task.
// Throws if GEMINI_API_KEY isn't configured or the model call/parse fails — callers
// are expected to catch this and fall back to a deterministic strategy.
export async function decideRescheduleWithLLM({
  taskTitle,
  taskType,
  durationMinutes,
  conflictingEventTitle,
  availableSlots,
  wakeTime,
  sleepTime
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  if (!availableSlots || availableSlots.length === 0) {
    return { action: 'skip', reason: 'No available slots today.' };
  }

  const input = JSON.stringify({
    conflictingWellnessTask: taskTitle,
    taskType,
    durationMinutes,
    newEventCausingConflict: conflictingEventTitle,
    availableSlots,
    dayBounds: { wakeTime, sleepTime }
  });

  const result = await ReschedulingDecisionAgent.run(input, {});
  return parseJsonFromModelText(result.text);
}

export { ConflictAnalysisSkill };
