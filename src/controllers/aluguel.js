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
});

router.post('/cancel/:id', async (req, res, next) => {
    const { id } = req.params;

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