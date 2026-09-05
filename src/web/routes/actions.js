'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireGuildAccess } = require('../middleware/guildAccess');
const { getAction, listActions, validateParams } = require('../actions');
const Logger = require('../../utils/Logger');

function createActionsRouter(client) {
  const router = express.Router({ mergeParams: true });

  router.get('/', requireAuth, requireGuildAccess(client), (req, res) => {
    res.json({ actions: listActions() });
  });

  /**
   * Exécution d'une action. La chaîne de vérification complète :
   * authentification -> appartenance au serveur -> permission Discord
   * suffisante (requireGuildAccess) -> validation stricte des paramètres
   * -> exécution via les mêmes services que les commandes du bot.
   * Le frontend ne peut jamais court-circuiter une étape.
   */
  router.post('/:actionKey', requireAuth, requireGuildAccess(client), async (req, res) => {
    const action = getAction(req.params.actionKey);
    if (!action) {
      return res.status(404).json({ error: 'unknown_action', message: 'Action introuvable.' });
    }

    const { params, errors } = validateParams(action, req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'invalid_params', message: errors.join(' ') });
    }

    const executorMember = await req.guild.members.fetch(req.session.user.id).catch(() => null);
    if (!executorMember) {
      return res.status(403).json({ error: 'not_a_member', message: "Vous n'êtes plus membre de ce serveur." });
    }

    try {
      const result = await action.execute({ guild: req.guild, executorMember, client }, params);
      if (!result.ok) {
        return res.status(400).json({ error: 'action_failed', message: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (error) {
      Logger.error(`Erreur lors de l'exécution de l'action "${action.key}" depuis le dashboard.`, error);
      res.status(500).json({
        error: 'action_error',
        message: "L'action n'a pas pu être exécutée (permissions du bot insuffisantes ou erreur Discord).",
      });
    }
  });

  return router;
}

module.exports = { createActionsRouter };
