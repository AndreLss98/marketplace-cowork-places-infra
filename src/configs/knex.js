const {
    DB_TEST, DB_USER_TEST, DB_PASSWORD_TEST,
    DB_PROD, DB_USER_PROD, DB_PASSWORD_PROD
} = process.env;

CONFIGS = {
    dev: {
        client: 'pg',
        connection: {
            database: DB_TEST,
            user: DB_USER_TEST,
            password: DB_PASSWORD_TEST
        }
    },
    prod: {
        client: 'pg',
        connection: {
            database: DB_PROD,
            user: DB_USER_PROD,
            password: DB_PASSWORD_PROD
        }
    }
}

const knex = require('knex')(CONFIGS[process.env.ENVIRONMENT]);
module.exports = knex;