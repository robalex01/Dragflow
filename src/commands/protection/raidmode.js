'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'raidmode',
  settingKey: 'raidmode',
  label: 'Mode raid',
  emoji: '🛡️',
  description: 'Active ou désactive le mode raid (expulsion automatique de tout nouvel arrivant).',
});
