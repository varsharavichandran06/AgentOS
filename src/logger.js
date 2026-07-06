/**
 * AgentOS Frontend Logger
 * Provides timestamped, file-tagged, severity-level logging.
 * Automatically relays ERROR logs to /api/client-log on the backend.
 *
 * Usage:
 *   import log from './logger';
 *   log.info('App.jsx', 'handleDemoLogin', 'Demo login initiated');
 *   log.error('App.jsx', 'useEffect:profileLoad', 'Failed to fetch profile', err);
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const MIN_LEVEL = LOG_LEVELS.DEBUG; // set to INFO in production

function now() {
  return new Date().toISOString();
}

function fmt(level, file, fn, msg) {
  return `[${now()}] [${level.padEnd(5)}] [${file}:${fn}] ${msg}`;
}

function send(level, file, fn, msg, err) {
  const line = fmt(level, file, fn, msg);
  const extra = err instanceof Error
    ? `\n  → ${err.name}: ${err.message}\n  Stack: ${err.stack}`
    : (err !== undefined ? `\n  → Extra: ${JSON.stringify(err)}` : '');

  switch (level) {
    case 'ERROR': console.error(line + extra); break;
    case 'WARN':  console.warn(line + extra);  break;
    case 'DEBUG': console.debug(line + extra); break;
    default:      console.log(line + extra);
  }

  // Relay errors to backend for server-side audit log
  if (level === 'ERROR' || level === 'WARN') {
    try {
      fetch('/api/client-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          file,
          fn,
          msg,
          error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : (err || null),
          ts: now()
        })
      }).catch(() => {}); // fire-and-forget, never throw
    } catch (_) {}
  }
}

const log = {
  debug: (file, fn, msg, extra) => send('DEBUG', file, fn, msg, extra),
  info:  (file, fn, msg, extra) => send('INFO',  file, fn, msg, extra),
  warn:  (file, fn, msg, extra) => send('WARN',  file, fn, msg, extra),
  error: (file, fn, msg, extra) => send('ERROR', file, fn, msg, extra),
};

export default log;
