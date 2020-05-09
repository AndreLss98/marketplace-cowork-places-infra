const router  = require('express').Router();

const Caracteristica = require('../repositorys/caracteristica');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Caracteristica.getAll());
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const caracteristica = await Caracteristica.getById(id);
    if (!caracteristica) return res.status(404).send({ error: "Not found" });
    res.status(200).send(caracteristica);
});

router.post('/', async (req, res, next) => {
    try {
        const caracteristica = await Caracteristica.save(req.body);
        return res.status(200).send(caracteristica);
    } catch (err) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.put('/:id', async (req, res, next) => {
    const caracteristica = await Caracteristica.getById(req.params.id);
    if (!caracteristica) return res.status(404).send({ error: "Not found" });

    try {
        return res.status(200).send({ response: await Caracteristica.update(req.body) });
    } catch(err) {
        return res.status(400).send({ error: "Name already exists" });
    }
});

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    return res.status(200).send({ response: await Caracteristica.delete(id) });
});

module.exports = app => app.use('/caracteristicas', router);