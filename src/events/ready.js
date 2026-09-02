'use strict';

const Logger = require('../utils/Logger');
const { config } = require('../config/config');
const TempActionService = require('../services/TempActionService');
const RecurringMessageService = require('../services/RecurringMessageService');
const runtimeSettings = require('../state/botRuntimeSettings');
const StatusRotationService = require('../services/StatusRotationService');
const BackupService = require('../services/BackupService');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    Logger.success(`Connecté en tant que ${client.user.tag} (ID: ${client.user.id}).`);
    Logger.info(`Présent sur ${client.guilds.cache.size} serveur(s).`);
    Logger.info(`Préfixe par défaut : "${config.bot.defaultPrefix}" (configurable par serveur).`);

    const uniqueCommands = new Set(client.commands.values());
    Logger.info(`${uniqueCommands.size} commande(s) prête(s) à l'emploi.`);

    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: `${config.bot.defaultPrefix}help | ${client.guilds.cache.size} serveurs`,
          type: 3, // Watching
        },
      ],
    });

    TempActionService.start(client);
    RecurringMessageService.start(client);
    await runtimeSettings.load();
    StatusRotationService.init(client);
    BackupService.start(client);
  },
};
