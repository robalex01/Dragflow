'use strict';

const { ActivityType } = require('discord.js');
const { createActivityCommand } = require('../../utils/activityCommandFactory');

module.exports = createActivityCommand({ name: 'listen', activityType: ActivityType.Listening, label: 'Écoute', emoji: '🎧' });
