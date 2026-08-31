'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'ghostping',
  settingKey: 'ghostping',
  label: 'Détection Ghost Ping',
  emoji: '👻',
  description: 'Active ou désactive la détection et le signalement des ghost pings.',
});
