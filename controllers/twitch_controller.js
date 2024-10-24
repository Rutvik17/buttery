const passport = require('../config/passport_config');

exports.twitchLogin = async (req, res) => {
    passport.authenticate('twitch', { scope: ['user_read'] })(req, res);
};

exports.twitchCallback = async (req, res) => {
    passport.authenticate('twitch', { failureRedirect: '/login' })(req, res, () => {
        res.redirect('/');
    });
};