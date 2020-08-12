const {
    ENV,
    DB,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_HOMOLOG,
    DB_USER_HOMOLOG,
    DB_PASSWORD_HOMOLOG,
    DB_HOST_HOMOLOG,
    DB_DEV,
    DB_USER_DEV,
    DB_PASSWORD_DEV,
    DB_HOST_DEV,
} = process.env;

const CONFIG = {
    prod: {
        client: 'pg',
        connection: {
            host: DB_HOST,
            database: DB,
            user: DB_USER,
            password: DB_PASSWORD
        }
    },
    homolog: {
        client: 'pg',
        connection: {
            host: DB_HOST_HOMOLOG,
            database: DB_HOMOLOG,
            user: DB_USER_HOMOLOG,
            password: DB_PASSWORD_HOMOLOG
        }
    },
    dev: {
        client: 'pg',
        connection: {
            host: DB_HOST_DEV,
            database: DB_DEV,
            user: DB_USER_DEV,
            password: DB_PASSWORD_DEV
        }
    }
}

const knex = require('knex')(CONFIG[ENV]);
module.exports = knex;