require('dotenv').config();

const fs = require('fs');
const cors = require('cors');
const express = require("express");
const app = express();
const boydParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app_port = process.env.PORT || 3000;

const whitelist = ['http://localhost:4200', 'https://placeet.com', 'http://placeet.com.br', 'https://appws.picpay.com']

app.use(cors({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not Allowed by CORS'))
        }
    },
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
}));

// app.use(cors());
app.use(cookieParser());
app.use(boydParser.json());
app.use(boydParser.urlencoded({ extended: true }));

app.use('/md', express.static('public/tmp/uploads/md'));
app.use('/imgs', express.static('public/tmp/uploads/img'));
app.use('/docs', express.static('public/tmp/uploads/doc'));

require('./controllers')(app);

app.get('/', (req, res, next) => {
    res.status(200).send({ status: 'ok' });
});

app.listen(app_port, () => {
    console.log(`Server running on port ${app_port}`);
    if (!fs.existsSync('./public/tmp/uploads/img')) {
        fs.mkdirSync('./public/tmp/uploads/img', { recursive: true });
    }
    if (!fs.existsSync('./public/tmp/uploads/md')) {
        fs.mkdirSync('./public/tmp/uploads/md', { recursive: true });
    }
    if (!fs.existsSync('./public/tmp/uploads/doc')) {
        fs.mkdirSync('./public/tmp/uploads/doc', { recursive: true });
    }
});