import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encryptObjectFields, decryptObjectFields } from './encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const WELLNESS_FILE = path.join(DATA_DIR, 'wellness.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * ============================================================================
 * SECURE JOB APPLICATION STORAGE
 * Encrypts cover letters, personal notes, and salary expectations
 * ============================================================================
 */

export function saveJobApplication(application) {
  try {
    const applications = loadAllApplications();
    
    // Encrypt sensitive fields
    const encrypted = encryptObjectFields(application, [
      'coverLetter',
      'personalNotes',
      'salaryExpectation',
      'contactInfo'
    ]);
    
    applications.push({
      ...encrypted,
      id: application.id || `app-${Date.now()}`,
      appliedAt: new Date().toISOString()
    });
    
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2), 'utf-8');
    console.log(`[Secure Store] Job application saved and encrypted: ${application.id}`);
    
    return { success: true, id: encrypted.id };
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    throw err;
  }
}

export function loadAllApplications() {
  try {
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf-8'));
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    return [];
  }
}

export function getApplicationById(id) {
  try {
    const applications = loadAllApplications();
    const encrypted = applications.find(app => app.id === id);
    
    if (!encrypted) return null;
    
    // Decrypt sensitive fields when retrieving
    return decryptObjectFields(encrypted, [
      'coverLetter',
      'personalNotes',
      'salaryExpectation',
      'contactInfo'
    ]);
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    return null;
  }
}

/**
 * ============================================================================
 * SECURE WELLNESS DATA STORAGE
 * Encrypts personal health metrics and fitness data
 * ============================================================================
 */

export function saveWellnessEntry(entry) {
  try {
    const entries = loadWellnessData();
    
    // Encrypt personal health data
    const encrypted = encryptObjectFields(entry, [
      'heartRate',
      'bloodPressure',
      'medications',
      'notes'
    ]);
    
    entries.push({
      ...encrypted,
      id: entry.id || `wellness-${Date.now()}`,
      recordedAt: new Date().toISOString()
    });
    
    fs.writeFileSync(WELLNESS_FILE, JSON.stringify(entries, null, 2), 'utf-8');
    console.log(`[Secure Store] Wellness entry saved and encrypted: ${encrypted.id}`);
    
    return { success: true, id: encrypted.id };
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    throw err;
  }
}

export function loadWellnessData() {
  try {
    if (!fs.existsSync(WELLNESS_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(WELLNESS_FILE, 'utf-8'));
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    return [];
  }
}

export function getWellnessHistory() {
  try {
    const encrypted = loadWellnessData();
    
    // Decrypt all entries for viewing history
    return encrypted.map(entry =>
      decryptObjectFields(entry, [
        'heartRate',
        'bloodPressure',
        'medications',
        'notes'
      ])
    );
  } catch (err) {
    console.error('[Secure Store Error]', err.message);
    return [];
  }
}

export { APPLICATIONS_FILE, WELLNESS_FILE, DATA_DIR };
