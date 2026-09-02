'use strict';

const { EmbedBuilder } = require('discord.js');
const { config } = require('../config/config');
const runtimeSettings = require('../state/botRuntimeSettings');

/**
 * EmbedManager centralise la création de tous les embeds du bot.
 * Toutes les commandes DOIVENT passer par ce manager afin de garantir
 * une identité visuelle cohérente (couleur bleue par défaut, footer, etc.)
 */
class EmbedManager {
  /**
   * Construit un embed de base.
   * @param {object} options
   * @param {string} [options.color] - couleur hex (sinon couleur par défaut du serveur/bot)
   * @param {string} [options.title]
   * @param {string} [options.description]
   * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
   * @param {string} [options.footerText]
   * @param {string} [options.footerIcon]
   * @param {string} [options.thumbnail]
   * @param {string} [options.image]
   * @param {boolean} [options.timestamp] - ajoute un timestamp si true
   * @param {{text:string, iconURL?:string}} [options.author]
   * @param {import('discord.js').Client} [options.client] - permet d'utiliser l'avatar du bot en footer
   */
  static build(options = {}) {
    const runtime = runtimeSettings.get();
    const embed = new EmbedBuilder().setColor(options.color || runtime.embedColor || config.embeds.color);

    if (options.title) embed.setTitle(options.title.substring(0, 256));
    if (options.description) embed.setDescription(options.description.substring(0, 4096));
    if (options.url) embed.setURL(options.url);

    if (Array.isArray(options.fields) && options.fields.length > 0) {
      embed.addFields(
        options.fields.slice(0, 25).map((f) => ({
          name: String(f.name).substring(0, 256),
          value: String(f.value).substring(0, 1024),
          inline: Boolean(f.inline),
        }))
      );
    }

    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);

    if (options.author) {
      embed.setAuthor({
        name: options.author.text,
        iconURL: options.author.iconURL,
      });
    }

    const footerIcon =
      options.footerIcon || (options.client ? options.client.user.displayAvatarURL() : undefined);
    const footerText = options.footerText || runtime.footerText;

    if (footerText || footerIcon) {
      embed.setFooter({
        text: footerText || '\u200b',
        iconURL: footerIcon,
      });
    }

    if (options.timestamp) embed.setTimestamp();

    return embed;
  }

  /** Embed de succès (couleur verte) */
  static success(options = {}) {
    return this.build({ ...options, color: options.color || config.embeds.colorSuccess });
  }

  /** Embed d'erreur (couleur rouge) */
  static error(options = {}) {
    return this.build({ ...options, color: options.color || config.embeds.colorError });
  }

  /** Embed d'avertissement (couleur jaune) */
  static warning(options = {}) {
    return this.build({ ...options, color: options.color || config.embeds.colorWarning });
  }

  /**
   * Raccourci pour une simple réponse d'erreur générique côté utilisateur.
   */
  static genericError(message = "Une erreur est survenue. Veuillez réessayer plus tard.") {
    return this.error({
      title: '❌ Erreur',
      description: message,
    });
  }
}

module.exports = EmbedManager;
