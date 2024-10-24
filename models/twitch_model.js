const mongoose = require('mongoose');

const twitch_schema = new mongoose.Schema({
    id: String,
    login: String,
    display_name: String,
    type: String,
    broadcaster_type: String,
    description: String,
    profile_image_url: String,
    offline_image_url: String,
    view_count: Number,
    email: String,
    created_at: String,
    twitch_access_token: String,
    twitch_refresh_token: String,
});

module.exports = mongoose.model('Twitch', twitch_schema, 'twitchers');