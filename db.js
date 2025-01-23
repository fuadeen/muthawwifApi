const mysql = require('mysql2/promise')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Bismillah@99',
  database: 'muthawwif_db',
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = db
