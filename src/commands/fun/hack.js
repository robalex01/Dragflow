'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { randomChoice } = require('../../utils/hash');

const FAKE_RESULTS = [
  'Mot de passe : `motdepasse123` (évidemment faux, ceci est une blague)',
  "Nombre de photos de chats trouvées : 9999",
  "Historique de recherche : \"comment être plus cool\"",
  'Fichiers secrets trouvés : 0 (il n\'y en a pas vraiment)',
];

module.exports = {
  name: 'hack',
  aliases: [],
  category: 'fun',
  description: "Simule (pour rire) le \"piratage\" d'un membre. Aucune donnée réelle n'est utilisée.",
  usage: '<@membre>',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    const name = target ? target.user.username : args[0];

    const loadingEmbed = EmbedManager.build({
      title: '💻 Piratage en cours... (pour rire)',
      description: `Connexion aux serveurs de ${name}...\n\`[■□□□□□□□□□] 10%\``,
    });
    const sent = await message.channel.send({ embeds: [loadingEmbed] });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    await sent.edit({
      embeds: [
        EmbedManager.build({
          title: '💻 Piratage en cours... (pour rire)',
          description: `Extraction des données de ${name}...\n\`[■■■■■□□□□□] 50%\``,
        }),
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const embed = EmbedManager.success({
      title: '💻 "Piratage" terminé (c\'est une blague !)',
      description: `**${name}** a été "piraté" avec succès.\n\n${randomChoice(FAKE_RESULTS)}\n\n*Ceci est purement un jeu, aucune donnée réelle n'a été consultée.*`,
    });
    return sent.edit({ embeds: [embed] });
  },
};
