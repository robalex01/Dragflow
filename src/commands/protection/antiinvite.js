'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'antiinvite',
  settingKey: 'antiinvite',
  label: 'AntiInvite',
  emoji: '📨',
  description: "Active ou désactive la suppression automatique des invitations Discord.",
});
