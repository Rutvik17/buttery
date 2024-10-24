require('dotenv').config();
const jwt = require('jsonwebtoken');
const Token = require('../models/token_model');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

exports.generateAccessToken = (user_id) => {
    return jwt.sign(
        { user_id: user_id },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
}

// Generate Refresh Token
exports.generateRefreshToken = (user_id) => {
    return jwt.sign(
        { user_id: user_id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '365d' }
    );
}

exports.saveTokenObj = async (user_id, access_token, refresh_token) => {
    const token = await Token.findOne({ user_id });
    if (!token) {
        await Token.create({ user_id, access_token, refresh_token });
    } else {
        await Token.findOneAndUpdate({ user_id }, { user_id, access_token, refresh_token });
    }
}