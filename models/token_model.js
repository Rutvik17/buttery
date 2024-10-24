const mongoose = require('mongoose');

const token_schema = new mongoose.Schema({
    user_id: String,
    access_token: String,
    refresh_token: String,
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Token', token_schema);