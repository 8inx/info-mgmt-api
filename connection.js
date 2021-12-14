const sql = require('mssql')
const dotenv = require('dotenv')
dotenv.config()

const config = {
    server: process.env.DB_SERVER,
	port: parseInt(process.env.DB_PORT, 10),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,

	options: {
		trustedConnection: true,
		trustServerCertificate: true,
		encrypt: true,
		instancename: "SQLEXPRESS",
	}
}

module.exports = { sql, config }