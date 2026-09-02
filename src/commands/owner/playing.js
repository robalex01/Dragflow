'use strict';

const { ActivityType } = require('discord.js');
const { createActivityCommand } = require('../../utils/activityCommandFactory');

module.exports = createActivityCommand({ name: 'playing', activityType: ActivityType.Playing, label: 'Joue à', emoji: '🎮' });
