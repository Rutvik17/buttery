const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth_controller');

router.get('/login', (req, res) => {
    res.render('login'); // Render the login Pug template
});

router.get('/register', (req, res) => {
    res.render('login'); // Render the login Pug template
});

router.post('/register', register);
router.post('/login', login);


module.exports = router;