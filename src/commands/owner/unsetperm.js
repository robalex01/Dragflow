'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveRole } = require('../../utils/resolveRole');
const { CustomPermission } = require('../../database/models');

module.exports = {
  name: 'unsetperm',
  aliases: [],
  category: 'owner',
  description: 'Retire une permission personnalisée à un rôle, un membre, ou @everyone.',
  usage: '<permission> <@role/id/everyone>',
  examples: ['vip @Membre VIP'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const name = args[0].toLowerCase();
    const target = args[1];

    const perm = await CustomPermission.findOne({ where: { guildId: message.guild.id, name } });
    if (!perm) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Permission \`${name}\` introuvable.`)] });
    }

    let holderId;
    let holderLabel;
    if (target.toLowerCase() === 'everyone') {
      holderId = 'everyone';
      holderLabel = '@everyone';
    } else {
      const role = resolveRole(message.guild, target);
      const member = role ? null : await resolveMember(message.guild, target);
      if (!role && !member) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Rôle ou membre introuvable.')] });
      }
      holderId = role ? role.id : member.id;
      holderLabel = role ? `${role}` : `${member}`;
    }

    if (!perm.holders.includes(holderId)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`${holderLabel} n'a pas la permission \`${name}\`.`)] });
    }

    perm.holders = perm.holders.filter((h) => h !== holderId);
    await perm.save();

    const embed = EmbedManager.success({
      title: '🔐 Permission retirée',
      description: `${holderLabel} ne possède plus la permission \`${name}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
