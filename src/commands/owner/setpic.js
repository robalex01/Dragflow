'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'setpic',
  aliases: ['setavatar'],
  category: 'owner',
  description: "Change la photo de profil du bot (affecte TOUS les serveurs).",
  usage: '<lien/pièce jointe>',
  examples: ['https://exemple.com/avatar.png'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 30,
  args: { min: 1 },
  async execute(message, args) {
    const url = message.attachments.first()?.url || args[0];
    try {
      await message.client.user.setAvatar(url);
      const embed = EmbedManager.success({ title: '🖼️ Avatar du bot modifié', description: 'La photo de profil a été mise à jour.' });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Impossible de changer l\'avatar (lien invalide ou limite Discord atteinte).')] });
    }
  },
};
