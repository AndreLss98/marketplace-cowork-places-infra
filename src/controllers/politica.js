const router = require('express').Router();

const multer = require('multer');
const multerConfig = require('./../configs/multer');

const authMiddleware = require('./../middlewares/auth');

const Politica = require('./../repositorys/politicas');

const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await Politica.getAll());
});

router.post('/', multer(multerConfig('md', false)).single('file'), async (req, res, next) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).send({ error: "Nome is required" });

    const sluq = req.file.originalname;

    try {
        const politica = await Politica.save({ sluq, nome });
        return res.status(201).send(politica);
    } catch(error) {
        return res.status(400).send({ error: "Register failed" });
    }
});

router.put('/:id', multer(multerConfig('md')).single('file'), async (req, res, next) => {
    const { id } = req.params;
    const { nome, versao } = req.body;
    if (!versao) return res.status(400).send({ error: "Version is required" });

    let politica = { versao };
    if (nome) politica = { ...politica, nome };

    try {
        const response = await Politica.update(id, politica);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error: "Failed to Update" });
    }
});

module.exports = app => app.use('/politicas', authMiddleware([perfis.ADMIN]), router);