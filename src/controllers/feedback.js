const router = require('express').Router();

const Feedback = require('./../repositorys/feedback');

const authMiddleware = require('./../middlewares/auth');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Feedback.getAll());
});

router.post('/', async (req, res, next) => {
    const feedback = await Feedback.save(req.body);
    res.status(200).send(feedback);
});

module.exports = app => app.use('/feedback', authMiddleware, router);