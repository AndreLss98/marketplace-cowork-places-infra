const router = require('express').Router();

const Feedback = require('./../repositorys/feedback');

const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Feedback.getAll());
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const feedback = await Feedback.save(req.body);
    res.status(200).send(feedback);
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const id = req.params.id;
    if (!id) return res.status(400).send({ error: "Id is required" });
    const response = await Feedback.update(id, req.body);
    return res.status(200).send({ response });
});

module.exports = app => app.use('/feedback', router);