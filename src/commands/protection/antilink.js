'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'antilink',
  settingKey: 'antilink',
  label: 'AntiLien',
  emoji: '🔗',
  description: 'Active ou désactive la suppression automatique des liens.',
});
