require('dotenv').config();
require('./configs/passport');

const express = require("express");
const app = express();
const boydParser = require('body-parser');
const app_port = process.env.PORT || 3000;

app.use(boydParser.json());
app.use(boydParser.urlencoded({extended: false}));

require('./src/controllers')(app);

app.listen(app_port, () => console.log(`Server running on port ${app_port}`));