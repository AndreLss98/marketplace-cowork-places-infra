const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const originalToken = req.headers.authorization;

    if (!originalToken) return res.status(401).send({ error: 'No token provided' });

    const tokenParts = originalToken.split(' ');
    if (!tokenParts.length === 2) return res.status(401).send({ error: "Token error" });

    const [ scheme, token ] = tokenParts;
    if(!/^Bearer$/i.test(scheme)) return res.status(401).send({ error: "Bad token formatted" })

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) return res.status(401).send({ error: "Invalid token" });
        req.userId = decoded.id;
        return next();
    });
}