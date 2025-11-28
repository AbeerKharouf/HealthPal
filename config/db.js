<<<<<<< HEAD
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password:'123456',
    database:'healthpai'
});
=======

const mysql = require('mysql2');

const db = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'healthpai'
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8

module.exports = db;
