const User = require("../models/user_model");

exports.dashboard = async (req, res) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        try {
            const user = await User.findById(req.session.passport.user._id);
            if (!user) {
                await User.create(req.session.passport.user);
            } else {
                await User.findOneAndUpdate({ _id: req.session.passport.user._id }, req.session.passport.user);
            }
        } catch (err) {}
        res.render('dashboard', { user: req.session.passport.user });
    } else {
        res.render('landing');
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          } else {
            res.json(user);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.logout = async (req, res) => {
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
};