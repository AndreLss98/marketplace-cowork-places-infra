const router = require('express').Router();

const Alugavel = require('../repositorys/alugavel');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Alugavel.getAll());
});

router.get('/:id', async (req, res, next) => {
    const alugavel = await Alugavel.getById(req.params.id);
    if (!alugavel) res.status(404).send({ error: "Not found" });
    res.status(200).send(alugavel);
});

router.post('/', async (req, res, next) => {
    try {
        return res.status(200).send(await Alugavel.save(req.body));
    } catch(error) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const alugavel = await Alugavel.getById(id);

    if (!alugavel) return res.status(404).send({ error: "Not found" });

    try {
        const response = await Alugavel.update(req.body);
        return res.status(200).send({ response });
    } catch(err) {
        return res.status(400).send({ error: "Update failed" });
    }
});

module.exports = app => app.use('/alugaveis', router);
