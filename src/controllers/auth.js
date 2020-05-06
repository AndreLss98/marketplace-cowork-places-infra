const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = require('express').Router();

const shared = require('./../shared/functions');
const Usuario = require('../repositorys/usuario');

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const user = await Usuario.getByEmail(email);

    if (!user) return res.status(404).send({ error: "User not found" });

    if (!await bcrypt.compare(senha, user.senha)) return res.status(400).send({ error: "Invalid password" });

    user.senha = undefined;

    res.status(200).send({ user, token: shared.generateToken({ id: user.id }) });
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.post('/google/redirect', )

module.exports = app => app.use('/auth', router);