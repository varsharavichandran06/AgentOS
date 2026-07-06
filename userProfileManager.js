import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILES_DIR = path.join(__dirname, '.profiles');
const PROFILES_FILE = path.join(PROFILES_DIR, 'profiles.json');

// Ensure profiles directory exists
if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

/**
 * ============================================================================
 * USER PROFILE MANAGEMENT
 * Stores user preferences including diet, exercise style, wake/sleep times
 * ============================================================================
 */

/**
 * Load all user profiles
 */
export function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const data = fs.readFileSync(PROFILES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Profile Manager] Error loading profiles:', err.message);
  }
  return {};
}

/**
 * Get a specific user profile
 */
export function getProfile(email) {
  const profiles = loadProfiles();
  return profiles[email] || null;
}

/**
 * Create or update user profile
 */
export function saveProfile(email, preferences) {
  try {
    const profiles = loadProfiles();
    
    if (!profiles[email]) {
      // First-time setup
      profiles[email] = {
        email,
        createdAt: new Date().toISOString(),
        preferences: {
          dietPreference: 'none',
          exerciseStyle: 'stretching',
          wellnessWakeTime: '07:00',
          wellnessSleepTime: '22:00',
          ...preferences
        }
      };
    } else {
      // Update existing
      profiles[email].preferences = {
        ...profiles[email].preferences,
        ...preferences
      };
      profiles[email].updatedAt = new Date().toISOString();
    }
    
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    console.log(`[Profile Manager] Profile saved for ${email}`);
    return profiles[email];
  } catch (err) {
    console.error('[Profile Manager] Error saving profile:', err.message);
    throw err;
  }
}

/**
 * Check if this is the user's first login
 */
export function isFirstLogin(email) {
  const profile = getProfile(email);
  return !profile;
}

/**
 * Get default preferences for new users
 */
export function getDefaultPreferences() {
  return {
    dietPreference: 'none',
    exerciseStyle: 'stretching',
    wellnessWakeTime: '07:00',
    wellnessSleepTime: '22:00',
    autoScheduleEnabled: true,
    autoScheduleDay: 6, // Saturday (0 = Sunday, 6 = Saturday)
    autoScheduleTime: '20:00' // 8 PM
  };
}

/**
 * Get user preferences or defaults
 */
export function getUserPreferences(email) {
  const profile = getProfile(email);
  if (profile && profile.preferences) {
    return profile.preferences;
  }
  return getDefaultPreferences();
}

/**
 * Delete a user profile (for testing/cleanup)
 */
export function deleteProfile(email) {
  try {
    const profiles = loadProfiles();
    if (profiles[email]) {
      delete profiles[email];
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
      console.log(`[Profile Manager] Profile deleted for ${email}`);
      return true;
    }
  } catch (err) {
    console.error('[Profile Manager] Error deleting profile:', err.message);
  }
  return false;
}
