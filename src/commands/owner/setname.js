'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'setname',
  aliases: [],
  category: 'owner',
  description: "Change le nom d'utilisateur du bot (affecte TOUS les serveurs).",
  usage: '<nom>',
  examples: ['Dragflow'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 30,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const name = args.join(' ').substring(0, 32);
    try {
      await client.user.setUsername(name);
      const embed = EmbedManager.success({ title: '✏️ Nom du bot modifié', description: `Le bot s'appelle maintenant **${name}**.` });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Impossible de changer le nom (limite Discord de changements atteinte, réessayez plus tard).')],
      });
    }
  },
};
