'use strict';

/**
 * Construit le catalogue de commandes à partir de client.commands (source de
 * vérité unique et toujours à jour — si une commande est ajoutée dans
 * src/commands/, elle apparaît automatiquement ici sans code supplémentaire).
 */
function buildCommandCatalog(client) {
  const unique = new Set(client.commands.values());

  const catalog = [...unique].map((cmd) => ({
    name: cmd.name,
    aliases: cmd.aliases || [],
    category: cmd.category,
    description: cmd.description || null,
    usage: cmd.usage ?? '',
    examples: cmd.examples || [],
    permission: cmd.permission || 'everyone',
    userPermissions: cmd.userPermissions || [],
    botPermissions: cmd.botPermissions || [],
    ownerOnly: Boolean(cmd.ownerOnly),
    cooldown: cmd.cooldown || 0,
    args: cmd.args || null,
  }));

  catalog.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return catalog;
}

module.exports = { buildCommandCatalog };
