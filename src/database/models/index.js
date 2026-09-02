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
const { initGiveaway } = require('./Giveaway');
const { initGiveawayParticipant } = require('./GiveawayParticipant');
const { initLevelData } = require('./LevelData');
const { initInviteData } = require('./InviteData');
const { initInviteJoin } = require('./InviteJoin');
const { initInviteReward } = require('./InviteReward');
const { initTicketConfig } = require('./TicketConfig');
const { initTicket } = require('./Ticket');
const { initMemberStats } = require('./MemberStats');
const { initChannelStats } = require('./ChannelStats');
const { initGuildStats } = require('./GuildStats');
const { initBotSettings } = require('./BotSettings');
const { initBackup } = require('./Backup');

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
const Giveaway = initGiveaway(sequelize);
const GiveawayParticipant = initGiveawayParticipant(sequelize);
const LevelData = initLevelData(sequelize);
const InviteData = initInviteData(sequelize);
const InviteJoin = initInviteJoin(sequelize);
const InviteReward = initInviteReward(sequelize);
const TicketConfig = initTicketConfig(sequelize);
const Ticket = initTicket(sequelize);
const MemberStats = initMemberStats(sequelize);
const ChannelStats = initChannelStats(sequelize);
const GuildStats = initGuildStats(sequelize);
const BotSettings = initBotSettings(sequelize);
const Backup = initBackup(sequelize);

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
  Giveaway,
  GiveawayParticipant,
  LevelData,
  InviteData,
  InviteJoin,
  InviteReward,
  TicketConfig,
  Ticket,
  MemberStats,
  ChannelStats,
  GuildStats,
  BotSettings,
  Backup,
};
