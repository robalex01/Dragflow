'use strict';

const { createFlagRemoveCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagRemoveCommand({
  name: 'unblacklist',
  flag: 'blacklist',
  label: 'blacklist',
  emoji: '✅',
  supportAll: true,
});
