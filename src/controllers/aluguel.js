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
            "accept-encoding": 'gzip,deflate,br',
        }
    }).then(async (response) => {
        return res.status(200).send(response.data);
    }).catch((error) => {
        return res.status(400).send(error);
    });
});

router.post('/checkout/callback', async (req, res, next) => {
    const { referenceId, authorizationId } = req.body;
    const response = await Aluguel.update(referenceId, { authorization_id: authorizationId });
    return res.status(200).send({ response });
});

module.exports = app => app.use('/alugueis', router);