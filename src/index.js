require('dotenv').config();

const cors = require('cors');
const express = require("express");
const app = express();
const boydParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app_port = process.env.PORT || 3000;

const whitelist = ['http://localhost:4200', 'https://placeet.com', 'http://paceet.com.br']

/* app.use(cors({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not Allowed by CORS'))
        }
    },
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
})) */

app.use(cors());
app.use(cookieParser());
app.use(boydParser.json());
app.use(boydParser.urlencoded({ extended: true }));

app.use('/alg-imgs', express.static('public/tmp/uploads'));

require('./controllers')(app);

app.get('/', (req, res, next) => {
    res.status(200).send({ status: 'ok' });
});

app.listen(app_port, () => console.log(`Server running on port ${app_port}`));