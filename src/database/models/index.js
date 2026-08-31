'use strict';

const { sequelize } = require('../database');

const { initGuildConfig } = require('./GuildConfig');
const { initCustomPermission } = require('./CustomPermission');
const { initCommandPermission } = require('./CommandPermission');
const { initDisabledCommand } = require('./DisabledCommand');
const { initCommandAlias } = require('./CommandAlias');
const { initGuildMemberFlag } = require('./GuildMemberFlag');
const { initCustomCommand } = require('./CustomCommand');
const { initInfraction } = require('./Infraction');
const { initTempAction } = require('./TempAction');
const { initBadWord } = require('./BadWord');
const { initCounter } = require('./Counter');
const { initRecurringMessage } = require('./RecurringMessage');
const { initVoiceTempChannel } = require('./VoiceTempChannel');
const { initAutoReact } = require('./AutoReact');
const { initPicOnlyChannel } = require('./PicOnlyChannel');

const GuildConfig = initGuildConfig(sequelize);
const CustomPermission = initCustomPermission(sequelize);
const CommandPermission = initCommandPermission(sequelize);
const DisabledCommand = initDisabledCommand(sequelize);
const CommandAlias = initCommandAlias(sequelize);
const GuildMemberFlag = initGuildMemberFlag(sequelize);
const CustomCommand = initCustomCommand(sequelize);
const Infraction = initInfraction(sequelize);
const TempAction = initTempAction(sequelize);
const BadWord = initBadWord(sequelize);
const Counter = initCounter(sequelize);
const RecurringMessage = initRecurringMessage(sequelize);
const VoiceTempChannel = initVoiceTempChannel(sequelize);
const AutoReact = initAutoReact(sequelize);
const PicOnlyChannel = initPicOnlyChannel(sequelize);

module.exports = {
  sequelize,
  GuildConfig,
  CustomPermission,
  CommandPermission,
  DisabledCommand,
  CommandAlias,
  GuildMemberFlag,
  CustomCommand,
  Infraction,
  TempAction,
  BadWord,
  Counter,
  RecurringMessage,
  VoiceTempChannel,
  AutoReact,
  PicOnlyChannel,
};
