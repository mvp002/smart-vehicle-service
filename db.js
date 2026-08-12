require('dotenv').config();
const sql = require('mssql');

const config = {
    server: 'smartvehicle-server.database.windows.net',
    database: 'SmartVehicleService',
    user: 'MVP001',
    password: process.env.DB_PASSWORD,
    port: 1433,

    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('Connected to Azure SQL database');
        return pool;
    })
    .catch(err => {
        console.log('Database connection failed:', err);
    });

module.exports = {
    sql,
    poolPromise
};