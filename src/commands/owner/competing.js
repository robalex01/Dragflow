'use strict';

const { ActivityType } = require('discord.js');
const { createActivityCommand } = require('../../utils/activityCommandFactory');

module.exports = createActivityCommand({ name: 'competing', activityType: ActivityType.Competing, label: 'Participe à', emoji: '🏆' });
