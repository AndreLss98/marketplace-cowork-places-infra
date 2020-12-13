require('dotenv').config({
    path: './../.env'
});

const {
    NODE_ENV
} = process.env;

const knexfile = require('./knexfile');
const knex = require('knex')(knexfile[NODE_ENV]);
module.exports = knex;