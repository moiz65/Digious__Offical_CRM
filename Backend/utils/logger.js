const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Get log filename based on date
const getLogFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.log`;
};

// Format log message
const formatLogMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logData = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${logData}`;
};

// Write to file
const writeLog = (filename, message) => {
  const logPath = path.join(logsDir, filename);
  fs.appendFile(logPath, message + '\n', (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

// Logger functions
const logger = {
  error: (message, data = null) => {
    const formattedMessage = formatLogMessage(logLevels.ERROR, message, data);
    console.error(formattedMessage);
    writeLog(getLogFilename(), formattedMessage);
  },

  warn: (message, data = null) => {
    const formattedMessage = formatLogMessage(logLevels.WARN, message, data);
    console.warn(formattedMessage);
    writeLog(getLogFilename(), formattedMessage);
  },

  info: (message, data = null) => {
    const formattedMessage = formatLogMessage(logLevels.INFO, message, data);
    console.log(formattedMessage);
    writeLog(getLogFilename(), formattedMessage);
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = formatLogMessage(logLevels.DEBUG, message, data);
      console.log(formattedMessage);
      writeLog(getLogFilename(), formattedMessage);
    }
  }
};

module.exports = logger;
