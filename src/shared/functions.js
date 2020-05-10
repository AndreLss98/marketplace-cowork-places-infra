const jwt = require('jsonwebtoken');

module.exports = {
    generateToken(params = {}) {
        return jwt.sign(params, process.env.JWT_SECRET, {
            expiresIn: 300
        });
    }
}
