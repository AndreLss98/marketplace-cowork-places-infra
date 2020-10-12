const {
    STORAGE_TYPE,
    AWS_ACCESS_KEY,
    SENDGRID_TOKEN,
    AWS_BUCKET_NAME,
    AWS_SECRET_ACCESS_KEY,
} = process.env;

const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendGrid = require('@sendgrid/mail');

const tokenDuration = 900;

const Usuario = require('./../repositorys/usuario');

sendGrid.setApiKey(SENDGRID_TOKEN);

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
    async sendEmailForAdmins(from, subject, text) {
        const admins = await Usuario.getAllAdmin();
        for (let admin of admins) {
            try {
                await sendGrid.send({to: admin.email, from, subject, text});
            } catch(error) {
                console.log(error);
            }
        }
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
    },
    changeStringBoolToBool(string_bool)  {
        if (string_bool === 'false' || string_bool === 'FALSE') return false;
        return true;
    },
    convertDate(date) {
        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    },
    async deleteFile(folder, key) {
        const s3 = new aws.S3({
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        });

        switch(STORAGE_TYPE) {
            case 's3':
                try {
                    await s3.deleteObject({
                        Bucket: AWS_BUCKET_NAME,
                        Key: `${folder}/${key}`
                    }).promise().catch(error => {
                        throw error;
                    });
                } catch (error) {
                    console.log('Error on delete file from s3: ', error);
                    throw error;
                }
            break;
            
            default:
                try {
                    await promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder, key));
                } catch (error) {
                    throw error;
                }
        }
    }
}
