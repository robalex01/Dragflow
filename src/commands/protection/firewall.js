'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'firewall',
  settingKey: 'firewall',
  label: 'Firewall (anti-nuke)',
  emoji: '🚨',
  description: 'Active ou désactive la protection anti-nuke (bannissement automatique en cas d\'actions destructrices en rafale).',
});
