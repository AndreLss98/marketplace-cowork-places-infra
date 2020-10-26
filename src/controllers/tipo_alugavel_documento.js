const {
    BACK_END_URL
} = process.env;

const router = require('express').Router();

const TipoAlugavelDocumento = require('./../repositorys/tipo_alugavel_documento');

const multer = require('multer');
const multerConfig = require('./../configs/multer');
const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await TipoAlugavelDocumento.getAll());
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).send({ error: 'Name is required' });

    try {
        const response = await TipoAlugavelDocumento.save(req.body);
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error });
    }
});

router.post('/doc', authMiddleware([perfis.ADMIN]), multer(multerConfig('doc', false)).single('file'), async (req, res, next) => {
    const { location, originalname } = req.file;
    return res.status(200).send({ url: location? location : `${BACK_END_URL}/doc/${originalname}`});
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { nome } = req.body;
    const { id } = req.params;
    if (!nome) return res.status(400).send({ error: 'Name is required' });

    try {
        const response = await TipoAlugavelDocumento.update(id, req.body);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error });
    }
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await TipoAlugavelDocumento.delete(id);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error });
    }
});

module.exports = app => app.use('/tipo-alugavel-documento', router);