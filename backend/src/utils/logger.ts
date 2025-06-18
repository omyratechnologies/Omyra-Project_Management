import { config } from '../config/environment.js';
import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  meta?: any;
}

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'production.log');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(entry: LogEntry): void {
    if (config.nodeEnv === 'production') {
      try {
        const logString = JSON.stringify(entry) + '\n';
        fs.appendFileSync(this.logFile, logString);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  private createLogEntry(level: LogEntry['level'], message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };
  }

  error(message: string, meta?: any): void {
    const entry = this.createLogEntry('error', message, meta);
    this.writeLog(entry);
    
    // Always output errors to console
    console.error(`[${entry.timestamp}] ERROR: ${message}`, meta || '');
  }

  warn(message: string, meta?: any): void {
    const entry = this.createLogEntry('warn', message, meta);
    this.writeLog(entry);
    
    if (config.nodeEnv !== 'production') {
      console.warn(`[${entry.timestamp}] WARN: ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    const entry = this.createLogEntry('info', message, meta);
    this.writeLog(entry);
    
    if (config.nodeEnv !== 'production') {
      console.info(`[${entry.timestamp}] INFO: ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any): void {
    if (config.nodeEnv === 'development') {
      const entry = this.createLogEntry('debug', message, meta);
      console.debug(`[${entry.timestamp}] DEBUG: ${message}`, meta || '');
    }
  }
}

export const logger = new Logger();
