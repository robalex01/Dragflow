'use strict';

const { createFlagAddCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagAddCommand({
  name: 'blacklist',
  flag: 'blacklist',
  label: 'blacklist',
  emoji: '⛔',
});
