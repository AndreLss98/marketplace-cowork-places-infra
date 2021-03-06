const {
    SAME_SITE,
    HTTP_SECURE,
    BACK_END_URL
} = process.env;

const bcrypt = require('bcryptjs');
const router = require('express').Router();

const multer = require('multer');
const multerConfig = require('./../configs/multer');

const authMiddleware = require('../middlewares/auth');
const paginationMiddleware = require('../middlewares/pagination');

const Usuario = require('../repositorys/usuario');
const Duvida = require('./../repositorys/duvida');
const Termos = require('./../repositorys/termos');
const Perfil = require('./../repositorys/perfil');
const Aluguel = require('./../repositorys/aluguel');
const Alugavel = require('./../repositorys/alugavel');
const Feedback = require('./../repositorys/feedback');
const Documento = require('./../repositorys/documento');
const Questionario = require('./../repositorys/questionario');
const Favoritos = require('./../repositorys/usuario_favoritos');
const ContaBancaria = require('./../repositorys/conta_bancaria');

const perfis = require('./../shared/perfis');
const constants = require('./../shared/constants');
const sharedFunctions = require('./../shared/functions');

function filterUserSensibleFields(user) {
    delete user.senha;
    delete user.saldo;
    delete user.perfil_id;
    delete user.google_id;
    delete user.expires_at;
    delete user.email_token;
    delete user.refresh_token;
    delete user.email_validado;
    delete user.cadastro_validado;
    return user;
}

router.get('/', authMiddleware([perfis.ADMIN]), paginationMiddleware(Usuario.getAll), async (req, res, next) => {
    res.result.results.forEach(user => {
        delete user.senha;
        delete user.refresh_token;
        delete user.expires_at;
        delete user.email_token;
    });
    res.status(200).send(res.result);
});

router.put('/', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    delete req.body.id;
    const response = await Usuario.update(user.id, req.body);
    return res.status(200).send({ response });
});

router.put('/dados-juridicos', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    delete req.body.id;
    const { cnpj, razao_social, local } = req.body;
    const response = await Usuario.updateDadosJuridico(user.id, {cnpj, razao_social}, local);
    return res.status(200).send({ response });
});

router.put('/alter-password', authMiddleware(), async (req, res, next) => {
    const {id} = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(id);
    const { senha_antiga, senha_nova } = req.body;
    if (!senha_antiga) return res.status(400).send({ error: "Old password is required" });
    if (!await bcrypt.compare(senha_antiga, user.senha)) return res.status(400).send({ error: "Old password don't match" });
    if (!senha_nova) return res.status(400).send({ error: "New password is required" });
    if (senha_antiga === senha_nova) return res.status(400).send({ error: "New password is equal to old password" });
    const response = await Usuario.update(id, { senha: senha_nova });
    return res.status(200).send({ response });
});

router.post('/recover-password', async (req, res, next) => {
    const { email } = req.body;
    const user = await Usuario.getByEmail(email);
    if (!user) return res.status(404).send({ error: "Email not found" });
    const senha = sharedFunctions.generateRandoString();
    const response = await Usuario.update(user.id, { senha });
    try {
        sharedFunctions.sendEmail(email, constants.NO_REPLY_EMAIL, constants.EMAILS_USUARIO.RESET_PASSWORD.subject, constants.EMAILS_USUARIO.RESET_PASSWORD.email(user, senha));
        return res.status(200).send({ response });
    } catch (error) {
        console.log("Error: ", error);
        return res.status(400).send({ error });
    }
});

router.get('/duvidas', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization)
    const duvidas = await Duvida.getAllByUserId(user.id);
    return res.status(200).send(duvidas);
});

router.get('/alugueis', async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const { locacoes } = req.query;
    if (locacoes) {
        const alugueis = await Aluguel.getAllAlocacoesByUsuarioId(user.id);
        for (let aluguel of alugueis) {
            aluguel.alugavel = await Alugavel.getById(aluguel.alugavel_id);
            aluguel.locatario = await Usuario.getById(aluguel.usuario_id);
            aluguel.locatario = filterUserSensibleFields(aluguel.locatario);
        }
        return res.status(200).send(alugueis);
    } else {
        const alugueis = await Aluguel.getAllByUsuarioId(user.id);
        for (let aluguel of alugueis) {
            aluguel.alugavel = await Alugavel.getById(aluguel.alugavel_id);
            aluguel.locador = await Usuario.getById(aluguel.alugavel.anunciante_id);
            aluguel.locador = filterUserSensibleFields(aluguel.locador);
        }
        return res.status(200).send(alugueis);
    }
});

router.post('/duvidas', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
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
    let teste;

    try {
        teste = await Usuario.getByEmail(req.body.email);
    } catch (error) { }

    // const teste_cpf = await Usuario.getByCpf(req.body.cpf);

    if (teste) return res.status(400).send({ error: "Email already used!" , item : 'Email'});
    // if (teste_cpf) return res.status(400).send({ error: "CPF already used!" , item: 'CPF' });
    if (!req.body.senha) return res.status(400).send({ error: "Invalid object!" });
    if (!req.body.numero_1) return res.status(400).send({ error: "Invalid object!" });

    try {
        req.body.email_token = sharedFunctions.generateRefreshToken();
        req.body.refresh_token = sharedFunctions.generateRefreshToken();
        req.body.expires_at = sharedFunctions.generateExpirationTime();
        
        const user = await Usuario.save(req.body);
        delete user.senha;

        const refresh_token = user.refresh_token;
        const expires_at = user.expires_at;

        delete user.refresh_token;
        delete user.expires_at;

        try {
            await sharedFunctions.sendEmail(user.email, constants.NO_REPLY_EMAIL, constants.EMAILS_USUARIO.SIGIN.subject, constants.EMAILS_USUARIO.SIGIN.email(user));
        } catch (error) {
            console.log("Error: ", error);
            // return res.status(400).send({ error });
        }
        delete user.email_token;
        
        return res
        .cookie('refresh_token', refresh_token, { maxAge: expires_at, httpOnly: true, sameSite: SAME_SITE, secure: sharedFunctions.changeStringBoolToBool(HTTP_SECURE) })
        .status(200)
        .send({ user, token: sharedFunctions.generateToken({ id: user.id }), expires_at });
    } catch (err) {
        console.log("Error: ", err);
        return res.status(400).send({ error: "Registrarion Failed!" });
    }
});

router.get('/resend-confirm-email', authMiddleware(), async (req, res, next) => {
    const userToken = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    try {
        await sharedFunctions.sendEmail(user.email, constants.NO_REPLY_EMAIL, 'Confirme seu email',
        `Oi ${user.nome} ${user.sobrenome}

        Bem vindo a Placeet.
        
        Clique no link abaixo para confirmar seu email:
        
        https://placeet.com/confirm-email?token=${user.email_token}
        
        Caso voc?? n??o tenha criado conta na Placeet e est?? recebendo este email por engano, por favor ignore-o.
        
        Abra??os,
        
        Equipe Placeet`);

        return res.status(200).send({ response: "Ok" });
    } catch (error) {
        console.log("Error: ", error);
        return res.status(400).send({ error });
    }
});

router.post('/payment', authMiddleware(), async (req, res, next) => {
    const userToken = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);

    if (parseFloat(user.saldo) === 0) return res.status(400).send({ error: "Insufficient funds" });
    const response = await Usuario.update(userToken.id, { saldo: 0 });
    res.status(200).send({ response });
});

router.post('/conta-bancaria', authMiddleware(), async (req, res, next) => {
    const userToken = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const { codigo_banco, agencia, numero, tipo } = req.body;

    if (!codigo_banco) return res.status(400).send({ error: "Cod Bank is required" });
    if (!agencia) return res.status(400).send({ error: "Agency is required" });
    if (!numero) return res.status(400).send({ error: "Number is required" });
    if (!tipo) return res.status(400).send({ error: "Type is required" });

    try {
        const response = await ContaBancaria.save({ usuario_id: user.id, codigo_banco, agencia, numero, tipo });
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Register Failed" });
    }
});

router.put('/conta-bancaria', authMiddleware(), async (req, res, next) => {
    const userToken = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const { codigo_banco, agencia, numero, tipo } = req.body;

    if (!codigo_banco) return res.status(400).send({ error: "Cod Bank is required" });
    if (!agencia) return res.status(400).send({ error: "Agency is required" });
    if (!numero) return res.status(400).send({ error: "Number is required" });
    if (!tipo) return res.status(400).send({ error: "Type is required" });

    try {
        const response = await ContaBancaria.update(user.id, { codigo_banco, agencia, numero, tipo });
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Update Failed" });
    }
});

router.post('/img-perfil', authMiddleware(), multer(multerConfig('img')).single('file'), async (req, res, next) => {
    const { location, key } = req.file;
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    
    const oldImg = await Usuario.getBySearchKey({ id: user.id }, ['img_perfil']);
    
    if (oldImg.img_perfil) {
        console.log(oldImg);
        try {
            await sharedFunctions.deleteFile('img', oldImg.img_perfil.substr(oldImg.img_perfil.lastIndexOf('/') + 1));
        } catch (error) {
            
        }
    }

    if (!user) return res.status(400).send({ error: "User not found!" });
    await Usuario.update(user.id, { img_perfil: location? location : `${BACK_END_URL}/img/${key}` });

    res.status(200).send({ image_name: location? location : `${BACK_END_URL}/img/${key}` });
});

router.post('/assinar-termos', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    if (!versao) return res.status(400).send({ error: "Version of terms is required" });
    const response = await Termos.save(user.id, versao);
    return res.status(200).send(response);
});

router.put('/assinar-termos', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const { versao } = req.body;
    const response = await Termos.update(user.id, versao);
    return res.status(200).send({ response });
});

router.get('/feedbacks', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    res.status(200).send(await Feedback.getAllByUser(user.id));
});

router.post('/feedbacks', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const feedback = await Feedback.reply(user.id, req.body);
    res.status(200).send(feedback);
});

/**
 * Valida um email se j?? est?? em uso ou n??o
 */
router.post('/email', async(req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: "Email is required" });
    let user;
    
    try {
        user = await Usuario.getByEmail(email);
    } catch (error) { }

    if (!user) return res.status(404).send({ error: "Email not found" });
    return res.status(200).send({ response: "Email already registered" })
});

router.post('/validar-email', async (req, res, next) => {
    const { token } = req.body;

    const usuario = await Usuario.getBySearchKey({ email_token: token });

    if (!usuario) return res.status(400).send({ error: "Invalid token" });

    const response = await Usuario.update(usuario.id, { email_validado: true });
    return res.status(200).send({ response });
});

router.get('/favoritos', async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const favoritosIds = await Favoritos.getAllByUserId(user.id);

    let favoritos = [];

    for (let favorito of favoritosIds) {
        let object = await Alugavel.getById(favorito.alugavel_id);
        favoritos.push(object);
    }

    return res.status(200).send(favoritos);
});

router.post('/favoritos', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const { alugavel_id } = req.body;

    try {
        const response = await Favoritos.favoritar(user.id, alugavel_id);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.post('/check-admin', authMiddleware(), async (req, res, next) => {

    const userToken = sharedFunctions.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    const perfil = await Perfil.getById(user.perfil_id);

    if (perfil.nivel !== perfis.ADMIN) return res.status(400).send({ error: "Access denied" });

    return res.status(200).send({ response: "Authorized access" });
});

router.get('/doc', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    if (!user) return res.status(400).send({ error: "User not found!" });
    const response = await Documento.getAllSendByUser(user.id);
    return res.status(200).send(response);
});

router.post('/doc', authMiddleware(), multer(multerConfig('doc')).single('file'), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    if (!user) return res.status(400).send({ error: "User not found!" });
    
    const { documento_id } = req.body;
    if (!documento_id) return res.status(400).send({ error: "Document id is required" });
    const { location, key } = req.file;

    try {
        const response = await Documento.salvarDocumento({
            usuario_id: user.id,
            documento_id,
            url: location? location : `${BACK_END_URL}/${key}`
        });
        res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

router.post('/perguntas', authMiddleware(), async (req, res, next) => {
    const { perguntas } = req.body;
    if (!perguntas || perguntas.length == 0) return res.status(400).send({ error: "Answers is required" });
    const user = sharedFunctions.decodeToken(req.headers.authorization);

    try {
        const response = await Questionario.answer(user.id, perguntas);
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

router.delete('/favoritos/:alugavelId', authMiddleware(), async (req, res, next) => {
    const user = sharedFunctions.decodeToken(req.headers.authorization);
    const { alugavelId } = req.params;
    const response = await Favoritos.desfavoritar(user.id, alugavelId);
    return res.status(200).send({response});
});

router.get('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    let user = await Usuario.getById(id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    user.conta_bancaria = await ContaBancaria.getByUserId(user.id);
    user.documentos = await Documento.getAllSendByUser(user.id);

    delete user.senha;
    delete user.refresh_token;
    delete user.expires_at;
    res.status(200).send(user);
});

router.put('/:id/validar-perfil', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { status_cadastro, observacao } = req.body;
    const { id } = req.params;
    if(status_cadastro === undefined || status_cadastro === null) return res.status(400).send({ error: "Validate is required" });

    let update = { status_cadastro };
    if (observacao) update.observacao = observacao;

    const user = await Usuario.getById(id);
    if(!user) return res.status(404).send({ error: "User not found" });

    try {
        if (status_cadastro === constants.USUARIO_STATUS.DISAPPROVED) {
            sharedFunctions.sendEmail(user.email, constants.NO_REPLY_EMAIL, constants.EMAILS_USUARIO.ON_REPROVED.subject, constants.EMAILS_USUARIO.ON_REPROVED.email(user, observacao));
        } else if (status_cadastro === constants.USUARIO_STATUS.APPROVED) {
            sharedFunctions.sendEmail(user.email, constants.NO_REPLY_EMAIL, constants.EMAILS_USUARIO.ON_APPROVED.subject, constants.EMAILS_USUARIO.ON_APPROVED.email(user));
        }
    } catch (error) {
        console.log("Error: ", error);
    }

    const response = await Usuario.update(id, { status_cadastro, observacao });
    return res.status(200).send({ response });
});

module.exports = app => app.use('/usuarios', router);