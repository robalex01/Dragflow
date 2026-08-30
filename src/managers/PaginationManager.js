'use strict';

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

const DEFAULT_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * PaginationManager fournit un système de pagination réutilisable par boutons.
 * Toutes les commandes ayant besoin d'afficher plusieurs pages (help, leaderboard,
 * inviteinfo, etc.) doivent passer par ce manager pour garantir un comportement
 * cohérent : navigation, vérification de l'auteur, timeout, désactivation des boutons.
 *
 * @param {import('discord.js').Message} message - message d'origine de la commande
 * @param {Array<import('discord.js').EmbedBuilder>} pages - embeds à afficher, dans l'ordre
 * @param {object} [options]
 * @param {number} [options.timeout] - durée en ms avant expiration (défaut 2 minutes)
 * @param {boolean} [options.showFirstLast] - affiche les boutons première/dernière page
 * @param {boolean} [options.showClose] - affiche un bouton de fermeture
 */
async function paginate(message, pages, options = {}) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('PaginationManager.paginate: "pages" doit être un tableau non vide.');
  }

  const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  const showFirstLast = options.showFirstLast ?? pages.length > 3;
  const showClose = options.showClose ?? true;

  let currentPage = 0;

  // Si une seule page, pas besoin de composants interactifs.
  if (pages.length === 1) {
    return message.channel.send({ embeds: [pages[0]] });
  }

  function buildRow(pageIndex) {
    const row = new ActionRowBuilder();

    if (showFirstLast) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('paginate_first')
          .setEmoji('⏮️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0)
      );
    }

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('paginate_prev')
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === 0)
    );

    if (showClose) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('paginate_close')
          .setEmoji('✖️')
          .setStyle(ButtonStyle.Danger)
      );
    }

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('paginate_next')
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === pages.length - 1)
    );

    if (showFirstLast) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('paginate_last')
          .setEmoji('⏭️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === pages.length - 1)
      );
    }

    return row;
  }

  const sentMessage = await message.channel.send({
    embeds: [pages[currentPage]],
    components: [buildRow(currentPage)],
  });

  const collector = sentMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        content: "❌ Seul l'auteur de la commande peut utiliser ces boutons.",
        ephemeral: true,
      });
    }

    switch (interaction.customId) {
      case 'paginate_first':
        currentPage = 0;
        break;
      case 'paginate_prev':
        currentPage = Math.max(0, currentPage - 1);
        break;
      case 'paginate_next':
        currentPage = Math.min(pages.length - 1, currentPage + 1);
        break;
      case 'paginate_last':
        currentPage = pages.length - 1;
        break;
      case 'paginate_close':
        collector.stop('closed');
        return interaction.update({ components: [] });
      default:
        break;
    }

    await interaction.update({
      embeds: [pages[currentPage]],
      components: [buildRow(currentPage)],
    });
  });

  collector.on('end', async (_collected, reason) => {
    if (reason === 'closed') return;
    try {
      const disabledRow = buildRow(currentPage);
      disabledRow.components.forEach((c) => c.setDisabled(true));
      await sentMessage.edit({ components: [disabledRow] });
    } catch {
      // Le message a pu être supprimé entre-temps, on ignore silencieusement.
    }
  });

  return sentMessage;
}

module.exports = { paginate };
