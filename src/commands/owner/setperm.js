'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveRole } = require('../../utils/resolveRole');
const { CustomPermission } = require('../../database/models');

module.exports = {
  name: 'setperm',
  aliases: [],
  category: 'owner',
  description: 'Attribue une permission personnalisée à un rôle, un membre, ou @everyone.',
  usage: '<permission> <@role/id/everyone>',
  examples: ['vip @Membre VIP', 'vip everyone'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const name = args[0].toLowerCase();
    const target = args[1];

    const [perm] = await CustomPermission.findOrCreate({ where: { guildId: message.guild.id, name }, defaults: { holders: [] } });

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

    if (perm.holders.includes(holderId)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`${holderLabel} a déjà la permission \`${name}\`.`)] });
    }

    perm.holders = [...perm.holders, holderId];
    await perm.save();

    const embed = EmbedManager.success({
      title: '🔐 Permission attribuée',
      description: `${holderLabel} possède maintenant la permission \`${name}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
