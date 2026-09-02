'use strict';

const { createFlagAddCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagAddCommand({
  name: 'manager',
  flag: 'manager',
  label: 'manager du bot',
  emoji: '🛠️',
});
