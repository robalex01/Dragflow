'use strict';

const { createFlagAddCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagAddCommand({
  name: 'whitelist',
  flag: 'whitelist',
  label: 'whitelist',
  emoji: '🟢',
});
