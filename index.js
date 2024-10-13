var express = require('express');
var session = require('express-session');
var passport = require('passport');
var axios = require('axios');
require('dotenv').config();
var mongoose = require('mongoose');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var MongoDbStore = require('connect-mongodb-session')(session);

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET    = process.env.TWITCH_SECRET;
const CALLBACK_URL     = process.env.CALLBACK_URL;
const SESSION_SECRET   = process.env.SESSION_SECRET;

var app = express();
app.set('view engine', 'pug');

mongoose.connect('mongodb://127.0.0.1:27017/', {})

app.use(session({
    secret: SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true,
    store: new MongoDbStore({ 
        mongooseConnection: mongoose.connection, 
        collection: 'sessions', 
        ttl: 72 * 60 * 24 * 7,
        databaseName: 'crush-realm'
    })
}));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: CALLBACK_URL,
    state: true
}, function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    done(null, profile);
}));

app.get('/', function(req, res) {
    if (req.session && req.session.passport && req.session.passport.user) {
        res.render('dashboard', { user: req.user });
    } else {
        res.render('login', { user: null });
    }
});

app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

app.get('/logout', function(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.clearCookie('connect.sid');
        for (let cookie in req.cookies) {
            res.clearCookie(cookie);
        }
        res.redirect('/');
    });
});

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
