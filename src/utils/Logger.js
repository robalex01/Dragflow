'use strict';

const chalk = require('chalk');

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

class Logger {
  static info(message) {
    console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.blueBright('[INFO]')} ${message}`);
  }

  static success(message) {
    console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.greenBright('[SUCCESS]')} ${message}`);
  }

  static warn(message) {
    console.warn(`${chalk.gray(`[${timestamp()}]`)} ${chalk.yellowBright('[WARN]')} ${message}`);
  }

  static error(message, error) {
    console.error(`${chalk.gray(`[${timestamp()}]`)} ${chalk.redBright('[ERROR]')} ${message}`);
    if (error && error.stack) {
      console.error(chalk.red(error.stack));
    } else if (error) {
      console.error(error);
    }
  }

  static debug(message) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.magenta('[DEBUG]')} ${message}`);
    }
  }

  static event(message) {
    console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.cyan('[EVENT]')} ${message}`);
  }

  static command(message) {
    console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.green('[COMMAND]')} ${message}`);
  }
}

module.exports = Logger;
