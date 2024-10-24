const mongoose = require('mongoose');
const Twitch = require('./twitch_model');

const user_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    twitch_id: { type: String, default: '' },
    access_token: String,
    refresh_token: String,
    twitch: { type: Twitch.schema }
});

module.exports = mongoose.model('User', user_schema);