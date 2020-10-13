const router = require('express').Router();

const TipoAlugavelDocumento = require('./../repositorys/tipo_alugavel_documento');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await TipoAlugavelDocumento.getAll());
});

router.post('/', async (req, res, next) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).send({ error: 'Name is required' });

    try {
        const response = await TipoAlugavelDocumento.save(req.body);
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error });
    }
});


router.put('/:id', async (req, res, next) => {
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

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await TipoAlugavelDocumento.delete(id);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error });
    }
});

module.exports = app => app.use('/tipo-alugavel-documento', router);