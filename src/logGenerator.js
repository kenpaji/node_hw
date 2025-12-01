import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_ROOT = path.resolve(__dirname, '..', 'logs');
const LOG_TYPES = ['success', 'error', 'info', 'debug'];
let currentFolder = '';
let minuteInterval;
let logInterval;

function ensureLogRoot() {
  fs.mkdirSync(LOG_ROOT, { recursive: true });
}

function timestampFolder(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hour}-${minute}`;
}

function timestampFile(date = new Date()) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${hour}-${minute}-${second}.log`;
}

function pickRandomType() {
  return LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)];
}

function pickRandomMessage(type) {
  const messages = {
    success: ['Completed task', 'Handled request', 'Persisted data', 'Scheduled job finished'],
    error: ['Failed to connect', 'Unexpected exception', 'Validation failed', 'Timeout occurred'],
    info: ['Heartbeat ok', 'Cache warmed', 'Background sync running', 'Metrics collected'],
    debug: ['Checking configuration', 'Received payload', 'Computed checksum', 'Retry scheduled']
  };
  const options = messages[type] || ['Log entry'];
  return options[Math.floor(Math.random() * options.length)];
}

function createMinuteFolder() {
  currentFolder = path.join(LOG_ROOT, timestampFolder());
  fs.mkdirSync(currentFolder, { recursive: true });
  process.stdout.write(`Switched to folder: ${currentFolder}\n`);
}

function writeLogFile() {
  if (!currentFolder) {
    createMinuteFolder();
  }
  const filename = timestampFile();
  const targetPath = path.join(currentFolder, filename);
  const logger = new Logger({ target: targetPath });
  const entries = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < entries; i += 1) {
    const type = pickRandomType();
    const message = pickRandomMessage(type);
    logger.log(type, message);
  }
  process.stdout.write(`Generated ${entries} entries in ${targetPath}\n`);
}

function startIntervals() {
  ensureLogRoot();
  createMinuteFolder();
  minuteInterval = setInterval(createMinuteFolder, 60 * 1000);
  logInterval = setInterval(writeLogFile, 10 * 1000);
}

function stopIntervals() {
  clearInterval(minuteInterval);
  clearInterval(logInterval);
}

process.on('SIGINT', () => {
  stopIntervals();
  process.stdout.write('\nLog generator stopped.\n');
  process.exit(0);
});

startIntervals();
