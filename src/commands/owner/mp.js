'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');

module.exports = {
  name: 'mp',
  aliases: ['dm'],
  category: 'owner',
  description: 'Envoie un message privé à un membre via le bot.',
  usage: '<@membre> <message>',
  examples: ['@Utilisateur Merci de respecter le règlement.'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const text = args.slice(1).join(' ');
    const embed = EmbedManager.build({
      title: `📩 Message de ${message.guild.name}`,
      description: text,
      footerText: `Envoyé par ${message.author.tag}`,
    });

    const sent = await target.send({ embeds: [embed] }).catch(() => null);

    const confirm = sent
      ? EmbedManager.success({ title: '✅ Message envoyé', description: `Message privé envoyé à **${target.user.tag}**.` })
      : EmbedManager.genericError('Impossible d\'envoyer un message privé à ce membre (MPs probablement fermés).');
    return message.channel.send({ embeds: [confirm] });
  },
};
