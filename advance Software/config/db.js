const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'dania#2003#',
    database: 'healthpal'
});

module.exports = db;
