'use strict';

const EmbedManager = require('../managers/EmbedManager');
const Logger = require('./Logger');
const { config } = require('../config/config');

class ErrorHandler {
  /**
   * Doit être appelé une seule fois au démarrage, avec le client Discord prêt,
   * pour intercepter les erreurs process-level (promesses rejetées, exceptions).
   */
  static registerGlobalHandlers(client) {
    process.on('unhandledRejection', (error) => {
      Logger.error('Rejection non gérée (unhandledRejection).', error);
      ErrorHandler.reportToOwners(client, error, { context: 'unhandledRejection' });
    });

    process.on('uncaughtException', (error) => {
      Logger.error('Exception non interceptée (uncaughtException).', error);
      ErrorHandler.reportToOwners(client, error, { context: 'uncaughtException' });
    });

    client.on('error', (error) => {
      Logger.error('Erreur émise par le client Discord.', error);
      ErrorHandler.reportToOwners(client, error, { context: 'discordClientError' });
    });

    client.on('shardError', (error) => {
      Logger.error('Erreur de shard Discord.', error);
      ErrorHandler.reportToOwners(client, error, { context: 'shardError' });
    });
  }

  /**
   * Gère une erreur survenue pendant l'exécution d'une commande.
   * Répond toujours proprement à l'utilisateur, jamais de stack trace.
   */
  static async handleCommandError(message, command, error) {
    Logger.error(`Erreur dans la commande "${command?.name || 'inconnue'}".`, error);

    try {
      const embed = EmbedManager.genericError(
        "Une erreur est survenue lors de l'exécution de cette commande.\nVeuillez réessayer plus tard."
      );
      await message.channel.send({ embeds: [embed] }).catch(() => null);
    } catch (sendError) {
      Logger.error("Impossible d'envoyer le message d'erreur à l'utilisateur.", sendError);
    }

    await ErrorHandler.reportToOwners(message.client, error, {
      context: `command:${command?.name || 'unknown'}`,
      guildId: message.guild?.id,
      userId: message.author?.id,
    });
  }

  /**
   * Envoie le détail technique de l'erreur (stack trace) dans le salon
   * de logs réservé au staff/owner (ERROR_LOG_CHANNEL_ID), jamais aux utilisateurs.
   */
  static async reportToOwners(client, error, meta = {}) {
    if (!config.logging.errorLogChannelId || !client?.channels) return;

    try {
      const channel = await client.channels.fetch(config.logging.errorLogChannelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;

      const stack = (error?.stack || String(error)).substring(0, 3800);

      const embed = EmbedManager.error({
        title: '⚠️ Erreur technique interne',
        description: `\`\`\`js\n${stack}\n\`\`\``,
        fields: [
          { name: 'Contexte', value: meta.context || 'inconnu', inline: true },
          { name: 'Serveur', value: meta.guildId || 'N/A', inline: true },
          { name: 'Utilisateur', value: meta.userId || 'N/A', inline: true },
        ],
        timestamp: true,
      });

      await channel.send({ embeds: [embed] });
    } catch (reportError) {
      Logger.error("Impossible d'envoyer le rapport d'erreur au salon de logs.", reportError);
    }
  }
}

module.exports = ErrorHandler;
