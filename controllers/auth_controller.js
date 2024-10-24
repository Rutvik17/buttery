const User = require('../models/user_model');
const Token = require('../models/token_model');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, saveTokenObj } = require('../utils/utils');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
        });

        const access_token = generateAccessToken(user._id);
        const refresh_token = generateRefreshToken(user._id);
    
        user.access_token = access_token;
        user.refresh_token = refresh_token;
    
        await user.save();
    
        await saveTokenObj(user._id, access_token, refresh_token);

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed after registration', message: err.message });
            }
            res.redirect('/');
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user', message: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const access_token = generateAccessToken(user._id);
    const refresh_token = generateRefreshToken(user._id);
  
    user.access_token = access_token;
    user.refresh_token = refresh_token;

    await User.findOneAndUpdate({ _id: user._id }, { access_token, refresh_token });

    await saveTokenObj(user._id, access_token, refresh_token);

    req.login(user, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed', message: err.message });
        }
        res.redirect('/');
    });
};

exports.validateToken = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(401).json({ message: 'Must provide a refresh token' });
    }

    const storedToken = await Token.findOne({ refresh_token: refresh_token });
    if (!storedToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
        const decoded = await jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);
        const access_token = generateAccessToken(decoded.user_id);
        await saveTokenObj(decoded.user_id, access_token, storedToken.refresh_token);

        const user = await User.findOneAndUpdate(
            { _id: decoded.user_id }, 
            { access_token },
            { new: true }
        );

        return res.json(user);
    } catch (err) {
        return res.status(403).json({ message: 'Refresh Token expired' });
    }
};