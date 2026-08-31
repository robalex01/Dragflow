'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'antispam',
  settingKey: 'antispam',
  label: 'AntiSpam',
  emoji: '🚫',
  description: 'Active ou désactive la protection anti-spam sur ce serveur.',
});
