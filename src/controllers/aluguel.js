const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Aluguel = require('./../repositorys/aluguel');
const Usuario = require('./../repositorys/usuario');
const Alugavel = require('./../repositorys/alugavel');
const DiasReservados = require('./../repositorys/dias_reservados');
const PayPal = require('./../shared/paypal');

const perfis = require('./../shared/perfis');
const shared = require('./../shared/functions');
const { ALUGUEL_STATUS } = require('./../shared/constants');

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

router.delete('/cancel/:id', async (req, res, next) => {
    const { id } = req.params;
    const aluguel = await Aluguel.getById(id);
    if (!aluguel) return res.status(400).send({ error: "Not found" });
    //Todo: Cancelar o aluguel na paypal
    const response = await Alugavel.update(aluguel.id, { status: ALUGUEL_STATUS.CANCELED });

    return res.status(200).send({ response });
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
    
    if (avaliacao.subscription_id) {
        const details = await PayPal.showSubscriptionDetails(avaliacao.subscription_id);
        avaliacao.subscription_status = details.status;
        return res.status(200).send({ response: await Aluguel.update(id, avaliacao) });
    } else {
        return res.status(200).send({ response: await Aluguel.update(id, avaliacao) });
    }
});

router.get('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    return res.status(200).send(await Aluguel.getAll());
});

router.get('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    let aluguel =  await Aluguel.getById(id);
    if(!aluguel) return res.status(404).send({ error: "Not Found!" });
    
    aluguel.alugavel = await Alugavel.getById(aluguel.alugavel_id);
    aluguel.locatario = await Usuario.getById(aluguel.usuario_id);
    aluguel.locador = await Usuario.getById(aluguel.alugavel.anunciante_id);
    
    delete aluguel.locatario.perfil_id;
    delete aluguel.locatario.senha;
    delete aluguel.locatario.saldo;
    delete aluguel.locatario.google_id;
    delete aluguel.locatario.refresh_token;
    delete aluguel.locatario.expires_at;
    delete aluguel.locatario.cadastro_validado;
    delete aluguel.locatario.email_token;
    delete aluguel.locatario.email_validado;

    delete aluguel.locador.perfil_id;
    delete aluguel.locador.senha;
    delete aluguel.locador.saldo;
    delete aluguel.locador.google_id;
    delete aluguel.locador.refresh_token;
    delete aluguel.locador.expires_at;
    delete aluguel.locador.cadastro_validado;
    delete aluguel.locador.email_token;
    delete aluguel.locador.email_validado;
    
    return res.status(200).send(aluguel);
});

module.exports = app => app.use('/alugueis', router);