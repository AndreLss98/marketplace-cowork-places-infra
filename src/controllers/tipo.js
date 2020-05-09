const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Tipo = require('./../repositorys/tipo');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Tipo.getAll());
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const tipo = await Tipo.getById(id);
    if (!tipo) return res.status(404).send({ error: "Not found" });
    res.status(200).send(tipo);
});

router.post('/', async (req, res, next) => {
    try {
        const tipo = await Tipo.save(req.body);
        return res.status(200).send(tipo)
    } catch (error) {
        return res.status(400).send({ error: "Registration failed"});
    }
});

router.put('/:id', async (req, res, next) => {
    const tipo = await Tipo.getById(req.params.id);

    if (!tipo) return res.status(404).send({ error: "Not found" });

    try {
        return res.status(200).send({ response: await Tipo.update(req.body) });
    } catch(err) {
        return res.status(400).send({ error: "Name already exists" });
    }
})

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    res.status(200).send({ response: await Tipo.delete(id)});
});

module.exports = app => app.use('/tipos', authMiddleware, router);
