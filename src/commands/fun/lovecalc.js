'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { hashToPercent, randomInt } = require('../../utils/hash');

module.exports = {
  name: 'lovecalc',
  aliases: ['lovemeter'],
  category: 'fun',
  description: "Calcule un pourcentage de compatibilité amoureuse entre deux personnes.",
  usage: '[@membre1/nom/random/id] [@membre2/nom/random/id]',
  examples: ['@Alice @Bob', 'random random'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    let nameA;
    let nameB;

    if (args.length === 0) {
      nameA = message.author.username;
      nameB = message.guild.members.cache.random()?.user.username || 'Quelqu\'un';
    } else if (args.length === 1) {
      const member = await resolveMember(message.guild, args[0]);
      nameA = message.author.username;
      nameB = member ? member.user.username : args[0];
    } else {
      const resolve = async (arg) => {
        if (arg.toLowerCase() === 'random') {
          return message.guild.members.cache.random()?.user.username || 'Quelqu\'un';
        }
        const member = await resolveMember(message.guild, arg);
        return member ? member.user.username : arg;
      };
      nameA = await resolve(args[0]);
      nameB = await resolve(args[1]);
    }

    const percent = hashToPercent(`${nameA.toLowerCase()}-${nameB.toLowerCase()}`);

    let comment;
    if (percent >= 90) comment = "Un amour parfait ! 💞";
    else if (percent >= 70) comment = 'Une belle alchimie ! 💕';
    else if (percent >= 40) comment = 'Ça pourrait fonctionner... 💛';
    else comment = "Pas vraiment le grand amour. 💔";

    const embed = EmbedManager.build({
      title: '💘 Love Calculator',
      description: `**${nameA}** ❤️ **${nameB}**\n\n**${percent}%** compatibles\n${comment}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
