const router = require('express').Router();

const multer = require('multer');
const multerConfig = require('./../configs/multer');

const authMiddleware = require('../middlewares/auth');
const paginationMiddleware = require('../middlewares/pagination');

const Usuario = require('../repositorys/usuario');
const Duvida = require('./../repositorys/duvida');
const Termos = require('./../repositorys/termos');
const Perfil = require('./../repositorys/perfil');
const Alugavel = require('./../repositorys/alugavel');
const Feedback = require('./../repositorys/feedback');
const Documento = require('./../repositorys/documento');
const Questionario = require('./../repositorys/questionario');
const Favoritos = require('./../repositorys/usuario_favoritos');
const ContaBancaria = require('./../repositorys/conta_bancaria');
const AlugavelImagem = require('./../repositorys/alugavel_imagem');

const perfis = require('./../shared/perfis');
const shared = require('./../shared/functions');

router.get('/', authMiddleware([perfis.ADMIN]), paginationMiddleware(Usuario.getAll), async (req, res, next) => {
    res.result.results.forEach(user => {
        delete user.senha;
        delete user.refresh_token;
        delete user.expires_at;
    });
    res.status(200).send(res.result);
});

router.get('/duvidas', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization)
    const duvidas = await Duvida.getAllByUserId(user.id);
    return res.status(200).send(duvidas);
});

router.post('/duvidas', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    req.body.usuario_id = user.id;
    const { alugavel_id, pergunta } = req.body;
    if (!alugavel_id) return res.status(400).send({ error: "Rentable id is required" });
    if (!pergunta) return res.status(400).send({ error: "Question is required" });

    const alugavel = await Duvida.getAllByAlugavelId(alugavel_id);
    
    if (!alugavel) return res.status(404).send({ error: "Rentable not found" });

    const duvida = await Duvida.save(req.body);
    delete duvida.resposta;
    return res.status(200).send(duvida);
});

router.put('/duvidas/:id', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const { resposta } = req.body;
    if (!resposta) return res.status(400).send({ error: "Response is required" });
    const response = await Duvida.update(id, { resposta });
    return res.status(200).send({ response });
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
        .cookie('refresh_token', refresh_token, { maxAge: expires_at, httpOnly: true, sameSite: 'lax', secure: false })
        .status(200)
        .send({ user, token: shared.generateToken({ id: user.id }), expires_at });
    } catch (err) {
        return res.status(400).send({ error: "Registrarion Failed!" });
    }
});

router.post('/payment', authMiddleware(), async (req, res, next) => {
    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);

    if (parseFloat(user.saldo) === 0) return res.status(400).send({ error: "Insufficient funds" });
    const response = await Usuario.update(userToken.id, { saldo: 0 });
    res.status(200).send({ response });
});

router.post('/conta-bancaria', authMiddleware(), async (req, res, next) => {
    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const { banco, agencia, numero, tipo } = req.body;

    if (!banco) return res.status(400).send({ error: "Bank is required" });
    if (!agencia) return res.status(400).send({ error: "Agency is required" });
    if (!numero) return res.status(400).send({ error: "Number is required" });
    if (!tipo) return res.status(400).send({ error: "Type is required" });

    try {
        const response = await ContaBancaria.save({ usuario_id: user.id, banco, agencia, numero, tipo });
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Register Failed" });
    }
});

router.put('/conta-bancaria', authMiddleware(), async (req, res, next) => {
    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const { banco, agencia, numero, tipo } = req.body;

    if (!banco) return res.status(400).send({ error: "Bank is required" });
    if (!agencia) return res.status(400).send({ error: "Agency is required" });
    if (!numero) return res.status(400).send({ error: "Number is required" });
    if (!tipo) return res.status(400).send({ error: "Type is required" });

    try {
        const response = await ContaBancaria.update(user.id, { banco, agencia, numero, tipo });
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Update Failed" });
    }
});

router.post('/img-perfil', authMiddleware(), multer(multerConfig('img')).single('file'), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    if (!user) return res.status(400).send({ error: "User not found!" });
    await Usuario.update(user.id, { img_perfil: req.file.key });

    res.status(200).send({ image_name: req.file.key });
});

router.post('/assinar-termos', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    if (!versao) return res.status(400).send({ error: "Version of terms is required" });
    const response = await Termos.save(user.id, versao);
    return res.status(200).send(response);
});

router.put('/assinar-termos', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    const response = await Termos.update(user.id, versao);
    return res.status(200).send({ response });
});

router.get('/feedbacks', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    res.status(200).send(await Feedback.getAllByUser(user.id));
});

router.post('/feedbacks', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const feedback = await Feedback.reply(user.id, req.body);
    res.status(200).send(feedback);
});

/**
 * Valida um email se já está em uso ou não
 */
router.post('/email', async(req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: "Email is required" });
    const user = await Usuario.getByEmail(email);

    if (!user) return res.status(404).send({ error: "Email not found" });
    return res.status(200).send({ response: "Email already registered" })
});

router.get('/favoritos', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const favoritosIds = await Favoritos.getAllByUserId(user.id);

    let favoritos = [];

    for (let favorito of favoritosIds) {
        let object = await Alugavel.getById(favorito.alugavel_id);
        object.imagens = await AlugavelImagem.getAllByAlugavelId(object.id);
        favoritos.push(object);
    }

    return res.status(200).send(favoritos);
});

router.post('/favoritos', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { alugavel_id } = req.body;

    try {
        const response = await Favoritos.favoritar(user.id, alugavel_id);

        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.post('/check-admin', async (req, res, next) => {

    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const perfil = await Perfil.getById(user.perfil_id);

    if (perfil.nivel !== perfis.ADMIN) return res.status(400).send({ error: "Access denied" });

    return res.status(200).send({ response: "Authorized access" });
});

router.get('/doc', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    if (!user) return res.status(400).send({ error: "User not found!" });
    const response = await Documento.getAllSendByUser(user.id);
    return res.status(200).send(response);
});

router.post('/doc', authMiddleware(), multer(multerConfig('doc')).single('file'), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    if (!user) return res.status(400).send({ error: "User not found!" });
    const { documento_id } = req.body;
    if (!documento_id) return res.status(400).send({ error: "Document id is required" });

    try {
        const response = await Documento.salvarDocumento({ usuario_id: user.id, documento_id, url: req.file.key });
        res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

router.post('/perguntas', authMiddleware(), async (req, res, next) => {
    const { perguntas } = req.body;
    if (!perguntas || perguntas.length == 0) return res.status(400).send({ error: "Answers is required" });
    const user = shared.decodeToken(req.headers.authorization);

    try {
        const response = await Questionario.answer(user.id, perguntas);
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

router.delete('/favoritos/:alugavelId', authMiddleware(), async (req, res, next) => {
    const user = shared.decodeToken(req.headers.authorization);
    const { alugavelId } = req.params;
    const response = await Favoritos.desfavoritar(user.id, alugavelId);
    return res.status(200).send({response});
});

router.get('/:id', authMiddleware(perfis.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    let user = await Usuario.getById(id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    user.conta_bancaria = await ContaBancaria.getByUserId(user.id);

    delete user.senha;
    delete user.refresh_token;
    delete user.expires_at;
    res.status(200).send(user);
});

module.exports = app => app.use('/usuarios', router);