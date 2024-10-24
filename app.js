const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { session_config } = require('./config/session');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport_config');
require('dotenv').config();

const auth_router = require('./routes/auth_routes');
const user_router = require('./routes/user_routes');

var app = express();

connectDB();

app.use(session(session_config));
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'styles')));


app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');

app.use('/auth', auth_router);
app.use('/', user_router);

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
