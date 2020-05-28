const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const tokenDuration = 900

module.exports = {
    generateToken(params = {}) {
        return jwt.sign(params, process.env.JWT_SECRET, {
            expiresIn: tokenDuration
        });
    },
    generateExpirationTime() {
        return Math.floor(Date.now() / 1000) + tokenDuration;
    },
    generateRefreshToken() {
        return crypto.randomBytes(30).toString('hex');
    },
    verifyTokenExpires(expires_at) {
        return expires_at < Math.floor(Date.now() / 1000);
    },
    decodeToken(bearer_token) {
        const token = bearer_token.split(' ');
        return jwt.decode(token[1]);
    }
}
