const {
    SAME_SITE,
    HTTP_SECURE,
} = process.env;

require('../middlewares/passport');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = require('express').Router();

const sharedFunctions = require('./../shared/functions');

const Usuario = require('../repositorys/usuario');
const ContaBancaria = require('./../repositorys/conta_bancaria');

router.post('/', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await Usuario.getByEmail(email);
    } catch (error) {
        return res.status(400).send({ error: "Login failed" })
    }

    if (!user) return res.status(404).send({ error: "User not found" });
    if (user && !user.senha) return res.status(405).send({ error: "User by Google Oauth" });
    if (!await bcrypt.compare(senha, user.senha)) return res.status(400).send({ error: "Invalid password" });

    const expires_at = sharedFunctions.generateExpirationTime();
    const refresh_token = sharedFunctions.generateRefreshToken();
    await Usuario.update(user.id, { refresh_token, expires_at });
    
    delete user.senha;
    delete user.refresh_token;
    delete user.expires_at;
    delete user.email_token;
    
    res.cookie('refresh_token', refresh_token, {
        maxAge: expires_at,
        httpOnly: true,
        sameSite: SAME_SITE,
        secure: sharedFunctions.changeStringBoolToBool(HTTP_SECURE)
    }).status(200)
    .send({ user, token: sharedFunctions.generateToken({ id: user.id }), expires_at });
});

router.delete('/logout', async (req, res, next) => {
    let refresh_token = req.cookies.refresh_token;

    if (!refresh_token) return res.status(200).send({ error: "Invalid refresh token" });
    
    const user = await Usuario.getBySearchKey({ refresh_token });

    if (!user) return res.status(200).send({ error: "Invalid refresh token" });

    const expires_at = new Date(2000, 0, 1).setHours(0, 0, 0) / 1000;
    refresh_token = null;
    await Usuario.update(user.id, { refresh_token, expires_at });
    return res.status(200).send({ response: 'Ok' });
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google'), async (req, res) => {
    const expires_at = sharedFunctions.generateExpirationTime();
    const refresh_token = sharedFunctions.generateRefreshToken();
    await Usuario.update(req.user.id, { refresh_token, expires_at });

    delete req.user.senha;
    delete req.user.refresh_token;
    delete req.user.expires_at;
    delete req.user.email_token;

    req.user.conta_bancaria = await ContaBancaria.getByUserId(req.user.id);

    res.cookie('refresh_token', refresh_token, {
        maxAge: expires_at,
        httpOnly: true,
        sameSite: SAME_SITE,
        secure: sharedFunctions.changeStringBoolToBool(HTTP_SECURE)
    }).redirect(process.env.FRONT_END_URL);
});

router.post('/refresh-token', async (req, res, next) => {
    let refresh_token = req.cookies.refresh_token;
    if (!refresh_token) return res.status(400).send({ error: "Invalid refresh token" });
    const user = await Usuario.getBySearchKey({ refresh_token });
    
    if (!user || sharedFunctions.verifyTokenExpires(user.expires_at)) return res.status(400).send({ error: "Invalid refresh token" });

    refresh_token = sharedFunctions.generateRefreshToken();
    const expires_at = sharedFunctions.generateExpirationTime();
    await Usuario.update(user.id, { refresh_token, expires_at });

    delete user.senha;
    delete user.expires_at;
    delete user.email_token;
    delete user.refresh_token;

    res.cookie('refresh_token', refresh_token, {
        maxAge: expires_at,
        httpOnly: true,
        sameSite: SAME_SITE,
        secure: sharedFunctions.changeStringBoolToBool(HTTP_SECURE)
    }).status(200)
    .send({ user, token: sharedFunctions.generateToken({ id: user.id }), expires_at });
});

module.exports = app => {
    app.use(passport.initialize());
    app.use('/auth', router);
};
