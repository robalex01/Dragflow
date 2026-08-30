'use strict';

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { config, validateConfig } = require('./config/config');
const Logger = require('./utils/Logger');
const ErrorHandler = require('./utils/ErrorHandler');
const { connectDatabase, syncDatabase } = require('./database/database');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

async function bootstrap() {
  Logger.info('Démarrage du bot...');

  try {
    validateConfig();
  } catch (error) {
    Logger.error(error.message);
    process.exit(1);
  }

  // S'assure que tous les modèles Sequelize sont enregistrés avant la synchronisation.
  require('./database/models');

  await connectDatabase();
  await syncDatabase({ alter: config.env === 'development' });

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
  });

  ErrorHandler.registerGlobalHandlers(client);

  loadCommands(client);
  loadEvents(client);

  await client.login(config.bot.token);
}

bootstrap().catch((error) => {
  Logger.error('Erreur fatale au démarrage du bot.', error);
  process.exit(1);
});
