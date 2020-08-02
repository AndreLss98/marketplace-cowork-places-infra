const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Aluguel = require('./../repositorys/aluguel');
const Usuario = require('./../repositorys/usuario');
const Alugavel = require('./../repositorys/alugavel');
const DiasReservados = require('./../repositorys/dias_reservados');
const PayPal = require('./../shared/paypal');

const shared = require('./../shared/functions');

router.post('/checkout', authMiddleware(), async (req, res, next) => {
    let tempAluguel = req.body;

    const userToken = shared.decodeToken(req.headers.authorization);
    const user = await Usuario.getById(userToken.id);
    if (!user) res.status(400).send({ error: "User not found" });
    tempAluguel.usuario_id = user.id;

    const alugavel = await Alugavel.getById(tempAluguel.alugavel_id);
    if (!alugavel) return res.status(400).send({ error: "Rentable not found" });

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

    const qtd_months = shared.totalMonths(dias_reservados.data_entrada, dias_reservados.data_saida);
    
    if (qtd_months > 1) {
        try {
            const plan = await PayPal.createPlan(alugavel, qtd_months, aluguel.valor);
            await Aluguel.update(aluguel.id, { paypal_plan_id: plan.id });
            aluguel.paypal_plan_id = plan.id;
            return res.status(200).send(aluguel);
        } catch (error) {
            return res.status(400).send({ error: "Error creating a plan", trace: error });
        }
    } else {
        return res.status(200).send(aluguel);
    }
});

router.post('/cancel/:id', async (req, res, next) => {
    const { id } = req.params;

});

router.put('/:id', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const { nota, comentario, subscription_id, paypal_order_id } = req.body;
    if ((nota === undefined || nota === null)
        && (comentario === undefined || comentario === null || comentario === "")
        && !subscription_id
        && !paypal_order_id
    ) {
        return res.status(400).send({ error: "Note or Comment or subscription id or order id is required" });
    }

    let avaliacao = {};
    if (nota !== undefined && nota !== null) avaliacao.nota = nota;
    if (comentario !== undefined && comentario !== null) avaliacao.comentario = comentario;
    if (subscription_id) avaliacao.subscription_id = subscription_id;
    if (paypal_order_id) avaliacao.paypal_order_id = paypal_order_id;

    const response = await Aluguel.update(id, avaliacao);
    return res.status(200).send({ response });
});

module.exports = app => app.use('/alugueis', router);