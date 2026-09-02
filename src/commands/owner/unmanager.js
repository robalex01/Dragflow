'use strict';

const { createFlagRemoveCommand } = require('../../utils/memberFlagCommandFactory');

module.exports = createFlagRemoveCommand({
  name: 'unmanager',
  flag: 'manager',
  label: 'manager du bot',
  emoji: '🛠️',
});
