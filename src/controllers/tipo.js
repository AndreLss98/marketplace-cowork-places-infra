const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Tipo = require('./../repositorys/tipo');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Tipo.getAll());
});

router.post('/', async (req, res, next) => {
    try {
        const tipo = await Tipo.save(req.body);
        return res.status(200).send(tipo)
    } catch (error) {
        return res.status(400).send({ error: "Registration Failed"});
    }
});

router.put('/:id', async (req, res, next) => {
    const tipo = await Tipo.getById(req.body.id);

    if (!tipo) return res.status(404).send({ error: "Not found" });

    try {
        return res.status(200).send({ response: await Tipo.update(req.body) });
    } catch(error) {
        return res.status(400).send({ error });
    }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;

    res.status(200).send({ response: await Tipo.delete(id)});
});

module.exports = app => app.use('/tipos', router);
