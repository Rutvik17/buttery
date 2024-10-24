const express = require('express');

const router = express.Router();
const { twitchLogin, twitchCallback } = require('../controllers/twitch_controller');
const { getUser, dashboard, logout } = require('../controllers/user_controller');
const { protected  } = require('../middleware/authorize');

router.get('/', dashboard);

router.get('/users/:user_id', protected, getUser);

router.get('/auth/twitch', protected, twitchLogin);
router.get('/auth/twitch/callback', protected, twitchCallback);

router.post('/logout', protected, logout);

module.exports = router;