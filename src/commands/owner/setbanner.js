'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'setbanner',
  aliases: [],
  category: 'owner',
  description: "Change la bannière du bot (affecte TOUS les serveurs, nécessite le niveau de boost Discord approprié).",
  usage: '<lien/pièce jointe>',
  examples: ['https://exemple.com/banniere.png'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 30,
  args: { min: 1 },
  async execute(message, args) {
    const url = message.attachments.first()?.url || args[0];
    try {
      await message.client.user.setBanner(url);
      const embed = EmbedManager.success({ title: '🎨 Bannière du bot modifiée', description: 'La bannière a été mise à jour.' });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Impossible de changer la bannière (fonctionnalité non disponible pour ce compte bot, ou lien invalide).")],
      });
    }
  },
};
