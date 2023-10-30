const { Pool } = require("pg");

let connectionString = process.env.DB_URL;

const pool = new Pool({
    connectionString,
});

module.exports = pool;
