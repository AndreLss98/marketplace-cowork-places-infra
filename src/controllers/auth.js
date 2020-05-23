require('../middlewares/passport');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = require('express').Router();

const shared = require('./../shared/functions');
const Usuario = require('../repositorys/usuario');

router.post('/', async (req, res) => {
    const { email, senha } = req.body;
    const user = await Usuario.getByEmail(email);

    if (!user) return res.status(404).send({ error: "User not found" });

    if (!await bcrypt.compare(senha, user.senha)) return res.status(400).send({ error: "Invalid password" });

    const refresh_token = shared.generateRefreshToken();
    await Usuario.update(user.id, { refresh_token });
    
    user.senha = undefined;
    user.refresh_token = undefined;

    res
    .cookie('refresh_token', refresh_token, { maxAge: shared.generateExpirationTime(), httpOnly: true })
    .status(200)
    .send({ user, token: shared.generateToken({ id: user.id }), espiresAt: shared.generateExpirationTime() });
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google'), async (req, res) => {

    const refresh_token = shared.generateRefreshToken();
    await Usuario.update(req.user.id, { refresh_token });

    req.user.senha = undefined;
    req.user.refresh_token = undefined;

    res
    .cookie('refresh_token', refresh_token, { maxAge: shared.generateExpirationTime(), httpOnly: true })
    .status(200)
    .send({ user: req.user, token: shared.generateToken({ id: req.user.id }), espiresAt: shared.generateExpirationTime() });
});

router.post('/refresh-token', async (req, res, next) => {
    let refresh_token = req.cookies.refresh_token;

    if (!refresh_token) return res.status(400).send({ error: "Invalid refresh token" });
    
    const user = await Usuario.getBySearchKey({ refresh_token });

    if (!user) return res.status(401).send({ error: "Invalid refresh token" });

    refresh_token = shared.generateRefreshToken();
    await Usuario.update(user.id, { refresh_token });

    user.senha = undefined;
    user.refresh_token = undefined;

    console.log(user);

    res
    .cookie('refresh_token', refresh_token, { maxAge: shared.generateExpirationTime(), httpOnly: true })
    .status(200)
    .send({ user, token: shared.generateToken({ id: user.id }), espiresAt: shared.generateExpirationTime() });
});

module.exports = app => {
    app.use(passport.initialize());
    app.use('/auth', router);
};
