'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unwarn',
  aliases: ['desavertir'],
  category: 'moderation',
  description: "Retire un avertissement précis d'un membre.",
  usage: '<@membre/id> <identifiant de l\'avertissement>',
  examples: ['@Utilisateur 2'],
  permission: 'helper',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const caseNumber = Number(args[1]);
    if (!Number.isInteger(caseNumber) || caseNumber <= 0) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Identifiant d'avertissement invalide.")],
      });
    }

    const warn = await InfractionService.deactivateWarn(message.guild.id, target.id, caseNumber);
    if (!warn) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(`Aucun avertissement #${caseNumber} trouvé pour ce membre.`)],
      });
    }

    await ModLogService.send(message.guild, {
      title: '✅ Avertissement retiré',
      color: '#2ECC71',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Cas #', value: `${caseNumber}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '✅ Avertissement retiré',
      description: `L'avertissement **#${caseNumber}** de **${target.user.tag}** a été retiré.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
