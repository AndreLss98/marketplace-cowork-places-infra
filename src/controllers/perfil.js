const router = require('express').Router();
const authMiddleware = require('./../middlewares/auth');

const Perfil = require('./../repositorys/perfil');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Perfil.getAll());
});

router.post('/', async (req, res, next) => {
    const tempPerfil = req.body;
    const temp = await Perfil.search({ nivel: tempPerfil.nivel });
    if (temp && temp.length > 0) return res.status(400).send({ error: "Level already exists" });

    try {
        const perfil = await Perfil.save(tempPerfil);
        return res.status(200).send(perfil);
    } catch(error) {
        return res.status(400).send({ error: 'Register failed' });
    }
});

module.exports = app => app.use('/perfil', authMiddleware, router);