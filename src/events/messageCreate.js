'use strict';

const EmbedManager = require('../managers/EmbedManager');
const { PermissionManager } = require('../managers/PermissionManager');
const CooldownManager = require('../managers/CooldownManager');
const ErrorHandler = require('../utils/ErrorHandler');
const Logger = require('../utils/Logger');
const GuildConfigService = require('../services/GuildConfigService');
const { DisabledCommand, CommandAlias } = require('../database/models');

/**
 * Résout le nom réel d'une commande à partir de ce que l'utilisateur a tapé,
 * en tenant compte des alias statiques (déjà gérés par le commandHandler via client.commands)
 * et des alias dynamiques créés par serveur via +alias.
 */
async function resolveCommandName(client, guildId, rawName) {
  const lower = rawName.toLowerCase();

  if (client.commands.has(lower)) {
    return client.commands.get(lower).name;
  }

  const dynamicAlias = await CommandAlias.findOne({ where: { guildId, alias: lower } });
  if (dynamicAlias && client.commands.has(dynamicAlias.commandName.toLowerCase())) {
    return dynamicAlias.commandName.toLowerCase();
  }

  return null;
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    try {
      if (message.author.bot) return;
      if (!message.guild) return; // Le bot fonctionne uniquement en serveur, pas en MP.

      const prefix = await GuildConfigService.getPrefix(message.guild.id);

      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const rawCommandName = args.shift();
      if (!rawCommandName) return;

      const resolvedName = await resolveCommandName(client, message.guild.id, rawCommandName);
      if (!resolvedName) return;

      const command = client.commands.get(resolvedName);
      if (!command) return;

      // Commande désactivée sur ce serveur ?
      const disabled = await DisabledCommand.findOne({
        where: { guildId: message.guild.id, commandName: command.name },
      });
      if (disabled) {
        const embed = EmbedManager.error({
          title: '❌ Commande désactivée',
          description: 'Cette commande est actuellement désactivée sur ce serveur.',
        });
        return message.channel.send({ embeds: [embed] });
      }

      // Vérification des permissions (Discord + personnalisées + blacklist + owner)
      const permissionCheck = await PermissionManager.check(message, command);
      if (!permissionCheck.allowed) {
        return sendPermissionError(message, permissionCheck);
      }

      // Cooldown
      const cooldownResult = CooldownManager.check(command.name, message.author.id, command.cooldown);
      if (cooldownResult.onCooldown) {
        const embed = EmbedManager.warning({
          title: '⏳ Cooldown',
          description: `Vous devez attendre ${CooldownManager.formatRemaining(
            cooldownResult.remainingMs
          )} avant d'utiliser cette commande.`,
        });
        return message.channel.send({ embeds: [embed] });
      }

      // Validation basique des arguments minimum requis
      if (command.args?.min && args.length < command.args.min) {
        const embed = EmbedManager.error({
          title: '❌ Arguments manquants',
          description: `Syntaxe correcte :\n\`${prefix}${command.name} ${command.usage || ''}\``,
        });
        return message.channel.send({ embeds: [embed] });
      }

      Logger.command(
        `${message.author.tag} a exécuté "${command.name}" sur ${message.guild.name} (${message.guild.id}).`
      );

      await command.execute(message, args, { client, prefix });
    } catch (error) {
      const command = client.commands.get(
        message.content.slice(1).trim().split(/\s+/)[0]?.toLowerCase()
      );
      await ErrorHandler.handleCommandError(message, command, error);
    }
  },
};

function sendPermissionError(message, permissionCheck) {
  let description = "Vous n'avez pas la permission d'utiliser cette commande.";

  if (permissionCheck.reason === 'blacklisted') {
    description = 'Vous êtes blacklist sur ce serveur et ne pouvez utiliser aucune commande.';
  } else if (permissionCheck.reason === 'owner_only') {
    description = 'Cette commande est réservée aux propriétaires du bot.';
  } else if (permissionCheck.reason === 'missing_discord_permissions') {
    description = `Il vous manque la/les permission(s) Discord suivante(s) : \`${permissionCheck.missing.join(
      ', '
    )}\`.`;
  } else if (permissionCheck.reason === 'missing_bot_permissions') {
    description = `Le bot n'a pas la/les permission(s) suivante(s) pour exécuter cette action : \`${permissionCheck.missing.join(
      ', '
    )}\`.`;
  } else if (permissionCheck.reason === 'missing_custom_permission') {
    description = `Cette commande nécessite la permission \`${permissionCheck.permission}\`.`;
  }

  const embed = EmbedManager.error({ title: '🚫 Permission refusée', description });
  return message.channel.send({ embeds: [embed] });
}
