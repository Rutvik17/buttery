require('dotenv').config();

const session = require('express-session');
var MongoDbStore = require('connect-mongodb-session')(session);

const { SESSION_SECRET, MONGO_URI } = process.env;

const store = new MongoDbStore({
    uri: MONGO_URI,
    collection: 'sessions',
    ttl: 72 * 60 * 24 * 7,
    databaseName: 'buttery'
});

exports.session_config = {
    secret: SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie: {  
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    },
    store: store
};