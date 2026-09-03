'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { id, username, globalName, avatar } = req.session.user;

  let defaultAvatarIndex = 0;
  try {
    defaultAvatarIndex = Number(BigInt(id) % 5n);
  } catch {
    defaultAvatarIndex = 0;
  }

  res.json({
    id,
    username,
    globalName,
    avatarUrl: avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.${avatar.startsWith('a_') ? 'gif' : 'png'}`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`,
  });
});

module.exports = router;
