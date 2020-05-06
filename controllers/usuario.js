const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');
const paginationMiddleware = require('./../middlewares/pagination');

const Usuario = require('../repositorys/usuario');

function generateToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: 60
    });
}

router.get('/', authMiddleware, paginationMiddleware(Usuario.getAll), async (req, res, next) => {
    res.result.results.forEach(user => user.senha = undefined);
    res.send(res.result);
});

router.get('/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const user = await Usuario.getById(id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    user.senha = undefined;
    res.send(user);
});

router.post('/create', async (req, res, next) => {
    const teste = await Usuario.getByEmail(req.body.email);

    if (teste) return res.status(400).send({ error: "Email already used!" });

    try {
        const user = await Usuario.save(req.body);
        user.senha = undefined;
        return res.status(200).send({ user, token: generateToken({ id: user.id }) });
    } catch (err) {
        return res.status(400).send({ error: "Registrarion Failed!" });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, senha } = req.body;
    const user = await Usuario.getByEmail(email);

    if (!user) return res.status(404).send({ error: "User not found" });

    if (!await bcrypt.compare(senha, user.senha)) return res.status(400).send({ error: "Invalid password" });

    user.senha = undefined;

    res.status(200).send({ user, token: generateToken({ id: user.id }) });
});

module.exports = app => app.use('/usuarios', router);