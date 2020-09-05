const jwt = require('jsonwebtoken');

const Perfil = require('./../repositorys/perfil');
const Usuario = require('./../repositorys/usuario');

const perfis = require('./../shared/perfis');
const sharedFunctions = require('./../shared/functions');

module.exports = (permissions = []) => {
    return async (req, res, next) => {
        const originalToken = req.headers.authorization;
        if (!originalToken) return res.status(401).send({ error: 'No token provided' });
        const tokenParts = originalToken.split(' ');
        if (!tokenParts.length === 2) return res.status(401).send({ error: "Token error" });
    
        const [ scheme, token ] = tokenParts;
        if(!/^Bearer$/i.test(scheme)) return res.status(401).send({ error: "Bad token formatted" });
        
        if (permissions.length > 0) {
            const tokenUser = sharedFunctions.decodeToken(originalToken);
            const user = await Usuario.getById(tokenUser.id);
            const perfil = await Perfil.getById(user.perfil_id);

            if (perfil.nivel !== perfis.ADMIN && !permissions.includes(perfil.nivel)) {
                return res.status(401).send({ error: "User does not have permission for access this resource" });
            }
        }
    
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) return res.status(401).send({ error: "Invalid token" });
            req.userId = decoded.id;
            return next();
        });
    }
}