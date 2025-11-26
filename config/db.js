const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "healthpal",
});

module.exports = db;
