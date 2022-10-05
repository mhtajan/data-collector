'use strict';
const sql = require('mssql');

const sqlconfig = {
  user: "sa",
  password: "P@ssw0rd",
  server: "localhost",
  database: "datacollector_db",
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

//local mssql db connection
const dbConn = new sql.ConnectionPool({
    user: 'sa',
    password: 'P@ssw0rd',
    server: 'localhost',
    database: 'datacollector_db',
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
      },
});

dbConn.connect(function(err){
  if (err) throw err;
  console.log("Data Collector Database Connected!");
});


module.exports = { sqlconfig };