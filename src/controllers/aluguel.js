const axios = require('axios');
const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Aluguel = require('./../repositorys/aluguel');
const Usuario = require('./../repositorys/usuario');
const DiasReservados = require('./../repositorys/dias_reservados');

const shared = require('./../shared/functions');

router.post('/checkout', authMiddleware(), async (req, res, next) => {
    let tempAluguel = req.body;

    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);

    tempAluguel.usuario_id = user.id;

    const { dias_reservados } = tempAluguel;
    delete tempAluguel.dias_reservados;

    const aluguel = await Aluguel.save(tempAluguel);

    try {
        dias_reservados.aluguel_id = aluguel.id;
        dias_reservados.alugavel_id = aluguel.alugavel_id;
        await DiasReservados.save(dias_reservados);
    } catch (error) {
        return res.status(400).send({ error: "Failed to reserve" });
    }

    delete aluguel.authorization_id;
    delete aluguel.cancellation_id;

    await axios({
        method: 'post',
        url: 'https://appws.picpay.com/ecommerce/public/payments',
        data: {
            referenceId: aluguel.id,
            callbackUrl: "https://spotted-br.com",
            returnUrl: "https://placeet.com",
            value: aluguel.valor,
            buyer: {
                firstName: user.nome,
                lastName: user.sobrenome,
                document: user.cpf,
                email: user.email,
                phone: user.numero_1
            }
        },
        headers: {
            "Content-Type": "application/json",
            "x-picpay-token": process.env.PIC_PAY_TOKEN,
            "accept-encoding": 'gzip,deflate,br'
        }
    }).then(async (response) => {
        return res.status(200).send(response.data);
    }).catch((error) => {
        return res.status(400).send(error);
    });
});

router.post('/checkout/callback', async (req, res, next) => {

    await axios({
        method: 'post',
        url: `https://appws.picpay.com/ecommerce/public/payments/${referenceId}/status`,
        data: {},
        headers: {
            "Content-Type": "application/json",
            "x-picpay-token": process.env.PIC_PAY_TOKEN,
            "accept-encoding": 'gzip,deflate,br'
        }
    }).then(async (response) => {
        const result = await Aluguel.update(referenceId, { authorization_id: response.data.authorizationId, status: response.data.status });
        return res.status(200).send({ result });
    }).catch(error => {
        return res.status(400).send({ error: 'Update status failed' });
    });
});

router.post('/cancel/:id', async (req, res, next) => {
    const { id } = req.params;
    const aluguel = await Aluguel.getAllByAlugavelId(id);

    const data = aluguel.authorization_id ? { authorizationId: aluguel.authorization_id } : {};

    await axios({
        method: 'post',
        url: `https://appws.picpay.com/ecommerce/public/payments/${aluguel.id}/cancellations`,
        data,
        headers: {
            "Content-Type": "application/json",
            "x-picpay-token": process.env.PIC_PAY_TOKEN,
            "accept-encoding": 'gzip,deflate,br'
        }
    }).then(async (response) => {
        const result = await Aluguel.update(aluguel.id, { cancellation_id: response.data.cancellationId });
        return res.status(200).send({ result });
    }).catch(error => {
        return res.status(400).send({ error });
    });
});

router.put('/:id', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    if ((nota === undefined || nota === null) && (comentario === undefined || comentario === null || comentario === "")) {
        return res.status(400).send({ error: "Note or Comment is required" });
    }

    let avaliacao = {};
    if (nota !== undefined && nota !== null) avaliacao.nota = nota;
    if (comentario !== undefined && comentario !== null) avaliacao.comentario = comentario;
    
    const response = await Aluguel.update(id, avaliacao);
    return res.status(200).send({ response });

});

module.exports = app => app.use('/alugueis', router);