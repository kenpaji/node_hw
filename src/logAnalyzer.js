import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_ROOT = path.resolve(__dirname, '..', 'logs');

function parseArgs() {
  const typeIndex = process.argv.indexOf('--type');
  if (typeIndex !== -1 && process.argv[typeIndex + 1]) {
    return process.argv[typeIndex + 1].toLowerCase();
  }
  return null;
}

function readLogEntries(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(?<timestamp>[^\s]+) \[(?<type>[^\]]+)\] (?<message>.*)$/);
      if (!match) {
        return null;
      }
      return {
        timestamp: match.groups.timestamp,
        type: match.groups.type,
        message: match.groups.message
      };
    })
    .filter(Boolean);
}

function gatherFiles() {
  if (!fs.existsSync(LOG_ROOT)) {
    return [];
  }
  const minuteFolders = fs
    .readdirSync(LOG_ROOT)
    .map((folder) => path.join(LOG_ROOT, folder))
    .filter((folderPath) => fs.statSync(folderPath).isDirectory());

  const files = [];
  for (const folder of minuteFolders) {
    const folderFiles = fs
      .readdirSync(folder)
      .map((file) => path.join(folder, file))
      .filter((filePath) => fs.statSync(filePath).isFile());
    files.push(...folderFiles);
  }
  return files;
}

function summarize(filterType) {
  const logger = new Logger({ target: process.stdout });
  const files = gatherFiles();
  if (files.length === 0) {
    logger.log('info', 'No logs to analyze.');
    return;
  }

  const totals = { all: 0 };
  for (const file of files) {
    const entries = readLogEntries(file);
    for (const entry of entries) {
      const type = entry.type.toLowerCase();
      totals[type] = (totals[type] || 0) + 1;
      totals.all += 1;
    }
  }

  const filteredTotals = filterType ? { [filterType]: totals[filterType] || 0 } : totals;
  logger.log('info', `Analyzed ${files.length} files with ${totals.all} entries.`);
  Object.entries(filteredTotals).forEach(([type, count]) => {
    if (type === 'all') return;
    logger.log('info', `${type}: ${count}`);
  });
}

const filterType = parseArgs();
summarize(filterType);
