'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { buildCommandCatalog } = require('../commandCatalog');

function createCommandsRouter(client) {
  const router = express.Router();

  router.get('/', requireAuth, (req, res) => {
    res.json({ commands: buildCommandCatalog(client) });
  });

  return router;
}

module.exports = { createCommandsRouter };
