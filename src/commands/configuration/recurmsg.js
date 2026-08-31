'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const { parseDuration, formatDuration } = require('../../utils/parseDuration');
const { RecurringMessage } = require('../../database/models');

module.exports = {
  name: 'recurmsg',
  aliases: [],
  category: 'configuration',
  description: 'Programme un message envoyé automatiquement à intervalle régulier.',
  usage: 'add <#salon> <intervalle> <message> / list / remove <id>',
  examples: ['add #annonces 1h Pensez à lire le règlement !', 'list', 'remove 3'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === 'list') {
      const messages = await RecurringMessage.findAll({ where: { guildId: message.guild.id } });
      if (messages.length === 0) {
        return message.channel.send({
          embeds: [EmbedManager.build({ title: '🔁 Messages récurrents', description: 'Aucun message récurrent configuré.' })],
        });
      }
      const embed = EmbedManager.build({
        title: '🔁 Messages récurrents configurés',
        fields: messages.map((m) => ({
          name: `#${m.id} — <#${m.channelId}>`,
          value: `Toutes les ${formatDuration(Number(m.intervalMs))}\n${m.content.substring(0, 100)}`,
        })),
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const id = Number(args[1]);
      const deleted = await RecurringMessage.destroy({ where: { id, guildId: message.guild.id } });
      const embed = deleted
        ? EmbedManager.success({ title: '🔁 Message récurrent supprimé', description: `Le message #${id} a été supprimé.` })
        : EmbedManager.genericError(`Aucun message récurrent #${id} trouvé.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'add') {
      const channel = resolveChannel(message, args[1]);
      if (!channel) return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });

      const intervalMs = parseDuration(args[2]);
      if (!intervalMs) {
        return message.channel.send({
          embeds: [EmbedManager.genericError('Intervalle invalide. Exemple : `1h`, `30m`.')],
        });
      }

      const content = args.slice(3).join(' ');
      if (!content) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez fournir le contenu du message.')] });
      }

      const created = await RecurringMessage.create({
        guildId: message.guild.id,
        channelId: channel.id,
        intervalMs,
        content,
      });

      const embed = EmbedManager.success({
        title: '🔁 Message récurrent créé',
        description: `Message **#${created.id}** envoyé dans ${channel} toutes les **${formatDuration(intervalMs)}**.`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Sous-commande invalide. Utilisez `add`, `remove` ou `list`.')],
    });
  },
};
