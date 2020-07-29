const db = require('./../configs/knex');
const TABLE = 'banco';

module.exports = {
    async getAll() {
        return await db(TABLE);
    }
}