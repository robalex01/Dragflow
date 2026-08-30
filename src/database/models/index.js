'use strict';

const { sequelize } = require('../database');

const { initGuildConfig } = require('./GuildConfig');
const { initCustomPermission } = require('./CustomPermission');
const { initCommandPermission } = require('./CommandPermission');
const { initDisabledCommand } = require('./DisabledCommand');
const { initCommandAlias } = require('./CommandAlias');
const { initGuildMemberFlag } = require('./GuildMemberFlag');
const { initCustomCommand } = require('./CustomCommand');

const GuildConfig = initGuildConfig(sequelize);
const CustomPermission = initCustomPermission(sequelize);
const CommandPermission = initCommandPermission(sequelize);
const DisabledCommand = initDisabledCommand(sequelize);
const CommandAlias = initCommandAlias(sequelize);
const GuildMemberFlag = initGuildMemberFlag(sequelize);
const CustomCommand = initCustomCommand(sequelize);

module.exports = {
  sequelize,
  GuildConfig,
  CustomPermission,
  CommandPermission,
  DisabledCommand,
  CommandAlias,
  GuildMemberFlag,
  CustomCommand,
};
