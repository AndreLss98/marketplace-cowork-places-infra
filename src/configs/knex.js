const { DB, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const CONFIG = {
    client: 'pg',
    connection: {
        host: DB_HOST,
        database: DB,
        user: DB_USER,
        password: DB_PASSWORD
    }
}

const knex = require('knex')(CONFIG);
module.exports = knex;