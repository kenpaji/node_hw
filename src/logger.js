import fs from 'fs';
import path from 'path';

export class Logger {
  constructor({ target, consoleAlso = false } = {}) {
    this.consoleAlso = consoleAlso;
    this.setTarget(target || process.stdout);
  }

  setTarget(target) {
    if (typeof target === 'string') {
      const dir = path.dirname(target);
      fs.mkdirSync(dir, { recursive: true });
      this.stream = fs.createWriteStream(target, { flags: 'a' });
    } else {
      this.stream = target;
    }
  }

  formatEntry(type, message) {
    const timestamp = new Date().toISOString();
    const normalizedType = type.toLowerCase();
    return `${timestamp} [${normalizedType}] ${message}`;
  }

  log(type, message) {
    const line = this.formatEntry(type, message);
    this.stream.write(line + '\n');
    if (this.consoleAlso && this.stream !== process.stdout) {
      process.stdout.write(line + '\n');
    }
  }
}

export default Logger;
