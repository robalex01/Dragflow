'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');

module.exports = createToggleCommand({
  name: 'imgmod',
  settingKey: 'imgmod',
  label: 'ImgMod',
  emoji: '🖼️',
  description: 'Active ou désactive la modération des images/fichiers suspects (extensions déguisées).',
});
