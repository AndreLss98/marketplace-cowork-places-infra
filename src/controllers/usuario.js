const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const multerMiddleware = require('./../middlewares/multer');
const paginationMiddleware = require('../middlewares/pagination');

const shared = require('./../shared/functions');
const Usuario = require('../repositorys/usuario');
const Duvida = require('./../repositorys/duvida');
const Termos = require('./../repositorys/termos');
const Feedback = require('./../repositorys/feedback');
const Favoritos = require('./../repositorys/usuario_favoritos');

router.get('/', authMiddleware, paginationMiddleware(Usuario.getAll), async (req, res, next) => {
    res.result.results.forEach(user => {
        delete user.senha;
        delete user.refresh_token;
        delete user.expires_at;
    });
    res.status(200).send(res.result);
});

router.get('/duvidas', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization)
    const duvidas = await Duvida.getAllByUserId(user.id);
    return res.status(200).send(duvidas);
});

router.post('/create', async (req, res, next) => {
    const teste = await Usuario.getByEmail(req.body.email);

    if (teste) return res.status(400).send({ error: "Email already used!" });
    if (!req.body.senha) return res.status(400).send({ error: "Invalid object!" });
    if (!req.body.numero_1) return res.status(400).send({ error: "Invalid object!" });

    try {
        const user = await Usuario.save(req.body);

        const refresh_token = shared.generateRefreshToken();
        const expires_at = shared.generateExpirationTime();
        await Usuario.update(user.id, { refresh_token, expires_at });

        user.senha = undefined;
        user.refresh_token = undefined;
        user.expires_at = undefined;
        
        return res
        .cookie('refresh_token', refresh_token, { maxAge: expires_at, httpOnly: true, sameSite: 'lax', secure: true })
        .status(200)
        .send({ user, token: shared.generateToken({ id: user.id }), expires_at });
    } catch (err) {
        return res.status(400).send({ error: "Registrarion Failed!" });
    }
});

router.post('/payment', authMiddleware, async (req, res, next) => {
    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);

    if (parseFloat(user.saldo) === 0) return res.status(400).send({ error: "Insufficient funds" });
    const response = await Usuario.update(userToken.id, { saldo: 0 });
    res.status(200).send({ response });
});

router.post('/img-perfil', authMiddleware, multerMiddleware.single('file'), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);

    const response = await Usuario.update(user.id, { img_perfil: req.file.key });

    res.status(200).send({ response });
});

router.post('/assinar-termos', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    if (!versao) return res.status(400).send({ error: "Version of terms is required" });
    const response = await Termos.save(user.id, versao);
    return res.status(200).send(response);
});

router.put('/assinar-termos', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    const response = await Termos.update(user.id, versao);
    return res.status(200).send({ response });
});

router.get('/feedbacks', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    res.status(200).send(await Feedback.getAllByUser(user.id));
});

router.post('/feedbacks', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const feedback = await Feedback.reply(user.id, req.body);
    res.status(200).send(feedback);
});

router.post('/email', async(req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: "Email is required" });
    const user = await Usuario.getByEmail(email);

    if (!user) return res.status(404).send({ error: "Email not found" });
    return res.status(200).send({ response: "Email already registered" })
});

router.get('/favoritos', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const response = await Favoritos.getAllByUserId(user.id);
    return res.status(200).send(response);
});

router.post('/favoritos', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { alugavel_id } = req.body;

    try {
        const response = await Favoritos.favoritar(user.id, alugavel_id);

        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.delete('/favoritos', authMiddleware, async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { alugavel_id } = req.body;
    const response = await Favoritos.desfavoritar(user.id, alugavel_id);
    return res.status(200).send({response});
});

router.get('/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const user = await Usuario.getById(id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    delete user.senha;
    delete user.refresh_token;
    delete user.expires_at;
    res.send(user);
});

module.exports = app => app.use('/usuarios', router);