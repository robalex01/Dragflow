'use strict';

const { createFlagRemoveCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagRemoveCommand({
  name: 'unwhitelist',
  flag: 'whitelist',
  label: 'whitelist',
  emoji: '🔴',
});
