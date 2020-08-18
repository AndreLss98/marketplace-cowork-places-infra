const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const sendGrid = require('@sendgrid/mail');

const tokenDuration = 86400;

sendGrid.setApiKey(process.env.SENDGRID_TOKEN);

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
    generateRandoString() {
        return Math.random().toString(36).substring(2, 15);
    },
    verifyTokenExpires(expires_at) {
        return expires_at < Math.floor(Date.now() / 1000);
    },
    decodeToken(bearer_token) {
        const token = bearer_token.split(' ');
        return jwt.decode(token[1]);
    },
    async sendEmail(to, from, subject, text) {
        return await sendGrid.send({to, from, subject, text});
    },
    totalMonths(firstDate, lastDate) {
        lastDate = moment(lastDate);
        firstDate = moment(firstDate);
        const qtd_months = lastDate.diff(firstDate, 'month'); // moment considers a month with 31 days

        if (qtd_months > 0) {
            const qtd_days = lastDate.diff(firstDate, 'days');
            return Math.round(qtd_days / 31);
        }
        return qtd_months;
    }
}
