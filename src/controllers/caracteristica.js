const router  = require('express').Router();

const Caracteristica = require('../repositorys/caracteristica');

const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Caracteristica.getAll());
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const caracteristica = await Caracteristica.getById(id);
    if (!caracteristica) return res.status(404).send({ error: "Not found" });
    res.status(200).send(caracteristica);
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {

    const { tipo_campo, nome, icone, unidade_medida } = req.body;

    if (!tipo_campo) return res.status(400).send({ error: "Type of characteristic is required" });
    if (!nome) return res.status(400).send({ error: "Name of characteristic is required" });

    let caracteristica = { nome, tipo_campo };
    if (icone) caracteristica = { ...caracteristica, icone };
    if (unidade_medida) caracteristica = { ...caracteristica, unidade_medida };

    try {
        const response = await Caracteristica.save(caracteristica);
        return res.status(200).send(response);
    } catch (err) {
        return res.status(400).send({ error: "Registration failed" });
    }
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const caracteristica = await Caracteristica.getById(req.params.id);

    if (!caracteristica) return res.status(404).send({ error: "Not found" });
    if (!req.body.nome) return res.status(400).send({ error: "Name is required" });

    try {
        return res.status(200).send({ response: await Caracteristica.update(req.params.id, req.body) });
    } catch(error) {
        return res.status(400).send(error);
    }
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    try {
        return res.status(200).send({ response: await Caracteristica.delete(id) });
    } catch(error) {
        return res.status(400).send({ error: "Failed to delete" });
    }
});

module.exports = app => app.use('/caracteristicas', router);