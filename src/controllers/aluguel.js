const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Aluguel = require('./../repositorys/aluguel');
const Usuario = require('./../repositorys/usuario');
const DiasReservados = require('./../repositorys/dias_reservados');

router.post('/', async (req, res, next) => {
    let tempAluguel = req.body;
    
    const { dias_reservados } = tempAluguel;
    delete tempAluguel.dias_reservados;

    const aluguel = await Aluguel.save(tempAluguel);

    for(let dia of dias_reservados) {
        try {
            dia.aluguel_id = aluguel.id;
            dia.alugavel_id = aluguel.alugavel_id;
            await DiasReservados.save(dia);
        } catch(error) {
            return res.status(400).send({ error: "Failed to reserve" });
        }
    }

    await Usuario.atualizarSaldo(aluguel.usuario_id, aluguel.valor);

    delete aluguel.authorization_id;
    delete aluguel.cancellation_id;

    res.status(200).send(aluguel);
});

module.exports = app => app.use('/alugueis', authMiddleware([]), router);