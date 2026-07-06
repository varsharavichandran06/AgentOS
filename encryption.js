import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * DATA ENCRYPTION LAYER
 * Protects sensitive user data (job applications, wellness records, financial data)
 * at rest using AES-256-GCM encryption.
 * ============================================================================
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SESSION_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

// Resolve the key buffer dynamically based on key format (Hex, Base64, or raw passphrase)
let keyBuffer;
const cleanedKey = ENCRYPTION_KEY.trim();
if (cleanedKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanedKey)) {
  keyBuffer = Buffer.from(cleanedKey, 'hex');
} else if (cleanedKey.includes('+') || cleanedKey.includes('/') || cleanedKey.endsWith('=')) {
  keyBuffer = Buffer.from(cleanedKey, 'base64');
} else {
  keyBuffer = crypto.createHash('sha256').update(cleanedKey).digest();
}

/**
 * Encrypt sensitive data
 * @param {string} plaintext - Data to encrypt
 * @returns {object} { iv, authTag, encryptedData } - All required for decryption
 */
export function encryptData(plaintext) {
  try {
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    let encryptedData = cipher.update(plaintext, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encryptedData
    };
  } catch (err) {
    console.error('[Encryption Error]', err.message);
    throw err;
  }
}

/**
 * Decrypt sensitive data
 * @param {object} encrypted - { iv, authTag, encryptedData }
 * @returns {string} Decrypted plaintext
 */
export function decryptData(encrypted) {
  try {
    const { iv, authTag, encryptedData } = encrypted;
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      keyBuffer,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted;
  } catch (err) {
    console.error('[Decryption Error]', err.message);
    throw err;
  }
}

/**
 * Encrypt an object's sensitive fields
 * @param {object} data - Object with sensitive fields
 * @param {array} fieldsToEncrypt - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 */
export function encryptObjectFields(data, fieldsToEncrypt = []) {
  const encrypted = { ...data };
  
  fieldsToEncrypt.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptData(JSON.stringify(encrypted[field]));
    }
  });
  
  return encrypted;
}

/**
 * Decrypt an object's sensitive fields
 * @param {object} data - Object with encrypted fields
 * @param {array} fieldsToDecrypt - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
export function decryptObjectFields(data, fieldsToDecrypt = []) {
  const decrypted = { ...data };
  
  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] && decrypted[field].encryptedData) {
      decrypted[field] = JSON.parse(decryptData(decrypted[field]));
    }
  });
  
  return decrypted;
}

export { ENCRYPTION_KEY, ALGORITHM };
