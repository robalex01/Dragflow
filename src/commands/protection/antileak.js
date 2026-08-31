'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const ProtectionService = require('../../services/ProtectionService');

const VALID_TYPES = ['token', 'ipv4', 'email', 'phone'];

function onOff(value) {
  return value ? '🟢 Activé' : '🔴 Désactivé';
}

module.exports = {
  name: 'antileak',
  aliases: [],
  category: 'protection',
  description: 'Configure le système AntiLeak (token, IPv4, e-mail, numéro de téléphone).',
  usage: '[token/ipv4/email/phone] [on/off]',
  examples: ['', 'token on', 'email off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  async execute(message, args) {
    const settings = await ProtectionService.getAntileakSettings(message.guild.id);

    if (args.length === 0) {
      const embed = EmbedManager.build({
        title: '🛡️ Configuration AntiLeak',
        fields: [
          { name: 'Token de bot', value: onOff(settings.token), inline: true },
          { name: 'Adresses IPv4', value: onOff(settings.ipv4), inline: true },
          { name: 'E-mails', value: onOff(settings.email), inline: true },
          { name: 'Numéros de téléphone', value: onOff(settings.phone), inline: true },
        ],
        footerText: 'Utilisez : +antileak <token/ipv4/email/phone> <on/off>',
      });
      return message.channel.send({ embeds: [embed] });
    }

    const type = args[0].toLowerCase();
    const value = args[1]?.toLowerCase();

    if (!VALID_TYPES.includes(type)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(`Type invalide. Utilisez : ${VALID_TYPES.join(', ')}.`)],
      });
    }

    if (!['on', 'off'].includes(value)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')],
      });
    }

    await ProtectionService.setAntileakSetting(message.guild.id, type, value === 'on');

    const embed = EmbedManager.success({
      title: '🛡️ AntiLeak mis à jour',
      description: `La détection **${type}** est maintenant **${value === 'on' ? 'activée' : 'désactivée'}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
