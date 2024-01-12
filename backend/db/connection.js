const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',
    port:'8889',
    user: 'root',
    password: 'root',
    database: 'PackageDeliveryApp'
});

module.exports = db;