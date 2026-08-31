'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'antialt',
  settingKey: 'antialt',
  label: 'AntiAlt',
  emoji: '🕵️',
  description: 'Active ou désactive l\'expulsion automatique des comptes trop récents (moins de 7 jours).',
});
