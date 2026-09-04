'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { getCategoryLabel } = require('../../utils/categoryLabels');
const { buildCommandCatalog } = require('../commandCatalog');

/**
 * Expose les catégories RÉELLEMENT présentes dans client.commands (pas une
 * liste figée) avec leur libellé français, en réutilisant categoryLabels.js
 * déjà utilisé par la commande +help — source de vérité unique.
 */
function createCategoriesRouter(client) {
  const router = express.Router();

  router.get('/', requireAuth, (req, res) => {
    const catalog = buildCommandCatalog(client);
    const uniqueKeys = [...new Set(catalog.map((c) => c.category))].sort();

    const categories = uniqueKeys.map((key) => ({
      key,
      label: getCategoryLabel(key),
      commandCount: catalog.filter((c) => c.category === key).length,
    }));

    res.json({ categories });
  });

  return router;
}

module.exports = { createCategoriesRouter };
