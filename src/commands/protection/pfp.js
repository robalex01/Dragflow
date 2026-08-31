'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'pfp',
  settingKey: 'pfpRequired',
  label: 'Photo de profil obligatoire',
  emoji: '🖼️',
  description: 'Exige que les membres aient une photo de profil personnalisée pour écrire.',
});
