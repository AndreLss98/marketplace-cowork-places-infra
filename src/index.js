require('dotenv').config();

const express = require("express");
const app = express();
const boydParser = require('body-parser');
const app_port = process.env.PORT || 3000;

app.use(boydParser.json());
app.use(boydParser.urlencoded({ extended: true }));

app.use('/alg-imgs', express.static('public/tmp/uploads'));

require('./controllers')(app);

app.listen(app_port, () => console.log(`Server running on port ${app_port}`));