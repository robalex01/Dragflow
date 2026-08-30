'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');
const { getCategoryLabel } = require('../../utils/categoryLabels');
const { CustomCommand } = require('../../database/models');
const { config } = require('../../config/config');

const COMMANDS_PER_CATEGORY_PAGE = 10;

function buildOverviewPage({ client, prefix, categories, uniqueCommandsCount, customCount, totalPages }) {
  const categoryLabels = categories.map((c) => getCategoryLabel(c));

  const description =
    `**Information**\n` +
    `➤ Version : \`${config.bot.version}\`\n\n` +
    `**Catégories**\n\n` +
    categoryLabels.join('\n') +
    `\n\n` +
    `**Syntaxes**\n` +
    `\`\`\`\n` +
    `╭➤￤Soulbot\n` +
    `┊ - ${prefix}help <commande>\n` +
    `┊ <>・Obligatoire\n` +
    `┊ []・Optionnel\n` +
    `┊ ()・Spécification\n` +
    `┊ /・Sépare syntaxes\n` +
    `\`\`\`\n\n` +
    `**Nombre de commandes:** ${uniqueCommandsCount}\n` +
    `**Commandes custom:** ${customCount}`;

  const nextCategoryLabel = categories.length > 0 ? getCategoryLabel(categories[0]) : null;
  const footerText = nextCategoryLabel
    ? `Page 1/${totalPages} | ${nextCategoryLabel} ➡️`
    : `Page 1/${totalPages}`;

  return EmbedManager.build({
    description,
    client,
    footerText,
    timestamp: true,
  });
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function buildCategoryPages({ client, categories, pageOffset, totalPages }) {
  const pages = [];

  categories.forEach((category) => {
    const commands = category.commands;
    const label = getCategoryLabel(category.key);
    const groups = chunk(commands, COMMANDS_PER_CATEGORY_PAGE);

    groups.forEach((group, groupIndex) => {
      const description = group
        .map((cmd) => `**${cmd.name}**\n${cmd.description || '*Pas de description.*'}`)
        .join('\n\n');

      const currentPageNumber = pages.length + pageOffset + 1;

      pages.push(
        EmbedManager.build({
          title: label,
          description,
          client,
          footerText: `Page ${currentPageNumber}/${totalPages}${
            groups.length > 1 ? ` (${label} ${groupIndex + 1}/${groups.length})` : ''
          }`,
          timestamp: true,
        })
      );
    });
  });

  return pages;
}

function buildCommandDetailEmbed(command, { client, prefix }) {
  const label = getCategoryLabel(command.category);

  const fields = [
    { name: 'Description', value: command.description || '*Pas de description.*' },
    {
      name: 'Syntaxe',
      value: `\`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\``,
    },
    { name: 'Permission', value: `\`${command.permission || 'everyone'}\``, inline: true },
    { name: 'Catégorie', value: label, inline: true },
    { name: 'Cooldown', value: `${command.cooldown || 0}s`, inline: true },
  ];

  if (Array.isArray(command.aliases) && command.aliases.length > 0) {
    fields.push({ name: 'Alias', value: command.aliases.map((a) => `\`${a}\``).join(', ') });
  }

  if (Array.isArray(command.userPermissions) && command.userPermissions.length > 0) {
    fields.push({
      name: 'Permissions Discord requises',
      value: command.userPermissions.map((p) => `\`${p}\``).join(', '),
    });
  }

  if (Array.isArray(command.examples) && command.examples.some((e) => e && e.length > 0)) {
    fields.push({
      name: 'Exemple' + (command.examples.length > 1 ? 's' : ''),
      value: command.examples
        .filter((e) => e && e.length > 0)
        .map((e) => `\`${prefix}${command.name} ${e}\``)
        .join('\n'),
    });
  }

  return EmbedManager.build({
    title: command.name.toUpperCase(),
    fields,
    client,
    timestamp: true,
  });
}

module.exports = {
  name: 'help',
  aliases: ['aide', 'h'],
  category: 'information',
  description: "Affiche la liste des commandes ou le détail d'une commande précise.",
  usage: '[commande]',
  examples: ['', 'ban'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args, { client, prefix }) {
    // +help <commande> : fiche détaillée
    if (args.length > 0) {
      const query = args[0].toLowerCase();
      const command = client.commands.get(query);

      if (!command) {
        const embed = EmbedManager.genericError(
          `Aucune commande nommée \`${query}\` n'a été trouvée.\nUtilisez \`${prefix}help\` pour voir la liste complète.`
        );
        return message.channel.send({ embeds: [embed] });
      }

      const embed = buildCommandDetailEmbed(command, { client, prefix });
      return message.channel.send({ embeds: [embed] });
    }

    // +help : aide générale paginée
    const uniqueCommandsCount = new Set(client.commands.values()).size;
    const customCount = await CustomCommand.count({ where: { guildId: message.guild.id } });

    const categoryKeys = [...client.categories.keys()].sort();
    const categoriesWithCommands = categoryKeys.map((key) => ({
      key,
      commands: [...new Set(client.categories.get(key))].sort((a, b) => a.name.localeCompare(b.name)),
    }));

    // Calcul du nombre total de pages : 1 (aperçu) + pages nécessaires par catégorie
    const categoryPageCounts = categoriesWithCommands.map((c) =>
      Math.max(1, Math.ceil(c.commands.length / COMMANDS_PER_CATEGORY_PAGE))
    );
    const totalPages = 1 + categoryPageCounts.reduce((a, b) => a + b, 0);

    const overviewPage = buildOverviewPage({
      client,
      prefix,
      categories: categoryKeys,
      uniqueCommandsCount,
      customCount,
      totalPages,
    });

    const categoryPages = buildCategoryPages({
      client,
      categories: categoriesWithCommands,
      pageOffset: 1,
      totalPages,
    });

    const pages = [overviewPage, ...categoryPages];

    await paginate(message, pages);
  },
};
