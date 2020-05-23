const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const multerMiddleware = require('./../middlewares/multer');
const paginationMiddleware = require('../middlewares/pagination');

const shared = require('./../shared/functions');
const Usuario = require('../repositorys/usuario');
const Duvida = require('./../repositorys/duvida');
const Termos = require('./../repositorys/termos');
const Feedback = require('./../repositorys/feedback');

router.get('/', authMiddleware, paginationMiddleware(Usuario.getAll), async (req, res, next) => {
    res.result.results.forEach(user => user.senha = undefined);
    res.send(res.result);
});

router.get('/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const user = await Usuario.getById(id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    user.senha = undefined;
    res.send(user);
});

router.get('/:id/duvidas', async (req, res, next) => {
    const { id } = req.params;
    const duvidas = await Duvida.getAllByUserId(id);
    res.status(200).send(duvidas);
});

router.post('/create', async (req, res, next) => {
    const teste = await Usuario.getByEmail(req.body.email);

    if (teste) return res.status(400).send({ error: "Email already used!" });
    if (!req.body.senha) return res.status(400).send({ error: "Invalid object!" });

    try {
        const user = await Usuario.save(req.body);

        const refresh_token = shared.generateRefreshToken();
        const expires_at = shared.generateExpirationTime();
        await Usuario.update(user.id, { refresh_token, expires_at });

        user.senha = undefined;
        user.refresh_token = undefined;
        user.expires_at = undefined;
        
        return res
        .cookie('refresh_token', refresh_token, { maxAge: expires_at, httpOnly: true })
        .status(200)
        .send({ user, token: shared.generateToken({ id: user.id }), expires_at });
    } catch (err) {
        return res.status(400).send({ error: "Registrarion Failed!" });
    }
});

router.post('/:id/adiar-pagamento', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const user = await Usuario.getById(id);
    if (parseFloat(user.saldo) === 0) return res.status(400).send({ error: "Insufficient funds" });
    const response = await Usuario.update(id, { saldo: 0 });
    res.status(200).send({ response });
});

router.post('/:id/img-perfil', authMiddleware, multerMiddleware.single('file'), async (req, res, next) => {
    const { id } = req.params;
    const img = { img_perfil: req.file.key };

    const response = await Usuario.update(id, img);

    res.status(200).send({ response });
});

router.post('/:id/assinar-termos', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    req.body.usuario_id = id;
    return res.status(200).send(await Termos.save(req.body));
});

router.put('/:id/assinar-termos', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const { versao } = req.body;
    const response = await Termos.update(id, versao);
    return res.status(200).send({ response });
});

router.get('/:id/feedbacks', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    res.status(200).send(await Feedback.getAllByUser(id));
});

router.post('/:id/feedbacks', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const feedback = await Feedback.reply(id, req.body);
    res.status(200).send(feedback);
});

module.exports = app => app.use('/usuarios', router);