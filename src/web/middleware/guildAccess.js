'use strict';

const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

function computePermissionFlags(permissionsBitfield) {
  try {
    const bits = BigInt(permissionsBitfield);
    return {
      administrator: (bits & ADMINISTRATOR) === ADMINISTRATOR,
      manageGuild: (bits & MANAGE_GUILD) === MANAGE_GUILD,
    };
  } catch {
    return { administrator: false, manageGuild: false };
  }
}

/**
 * Vérifie, pour CHAQUE requête touchant un serveur précis :
 * 1. l'utilisateur est authentifié (requireAuth doit être appliqué avant) ;
 * 2. l'utilisateur est réellement membre de ce serveur (via la liste
 *    obtenue lors du login OAuth2, jamais via une donnée envoyée par le
 *    frontend) ;
 * 3. l'utilisateur y possède une permission suffisante (Administrator ou
 *    Manage Server) ;
 * 4. le bot est réellement présent sur ce serveur.
 *
 * En cas de succès, attache `req.guild` (objet discord.js Guild réel) et
 * `req.guildPermissions` pour que les routes suivantes n'aient plus à
 * revalider quoi que ce soit.
 */
function requireGuildAccess(client) {
  return (req, res, next) => {
    const { guildId } = req.params;

    const userGuilds = req.session.userGuilds || [];
    const membership = userGuilds.find((g) => g.id === guildId);

    if (!membership) {
      return res.status(403).json({
        error: 'not_a_member',
        message: "Vous n'êtes pas membre de ce serveur.",
      });
    }

    const flags = computePermissionFlags(membership.permissions);
    if (!flags.administrator && !flags.manageGuild) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: "Vous n'avez pas les permissions nécessaires pour gérer ce serveur.",
      });
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({
        error: 'bot_not_in_guild',
        message: "Dragflow n'est pas présent sur ce serveur.",
      });
    }

    req.guild = guild;
    req.guildPermissions = flags;
    next();
  };
}

module.exports = { requireGuildAccess };
