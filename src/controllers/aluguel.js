const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Aluguel = require('./../repositorys/aluguel');
const DiasReservados = require('./../repositorys/dias_reservados');

router.post('/', async (req, res, next) => {
    const tempAluguel = req.body;
    

    res.status(200).send({ response: 'ok' });
});

module.exports = app => app.use('/alugueis', authMiddleware, router);