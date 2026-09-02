'use strict';

const { ActivityType } = require('discord.js');
const { createActivityCommand } = require('../../utils/activityCommandFactory');

module.exports = createActivityCommand({ name: 'watch', activityType: ActivityType.Watching, label: 'Regarde', emoji: '📺' });
