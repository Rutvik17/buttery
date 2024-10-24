require('dotenv').config();
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const User = require('../models/user_model');
const Twitch = require('../models/twitch_model');
const axios = require('axios');
const { TWITCH_CLIENT_ID, TWITCH_SECRET, TWITCH_REDIRECT_URI } = process.env;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: TWITCH_REDIRECT_URI,
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
        }
        console.log(user);
        user.twitch_id = profile.id;
        user.twitch = profile;
        user.twitch.access_token = accessToken;
        user.twitch.refresh_token = refreshToken;
        await User.findOneAndUpdate({ username: user.username }, user);

        const twitchUser = await Twitch.findOne({ id: profile.id });
        if (!twitchUser) {
            await Twitch.create(profile);
        } else {
            await Twitch.findOneAndUpdate({ id: profile.id }, profile);
        }
        done(null, user);
    } catch (err) {
        console.log(err);
        done(err, null);
    }
}));

OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken
        }
    };

    axios(options).then(response => {
        done(null, response.data.data[0]);
    }).catch(error => { 
        done(error);
    });
}

module.exports = passport;
