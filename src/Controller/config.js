'use strict';
const sql = require('mssql');

const sqlconfig = {
  user: "saadmin",
  password: "@!13$GCBC@dm!n2o22!!",
  server: "historicalstaging.database.windows.net",
  database: "collector",
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

//local mssql db connection
const dbConn = new sql.ConnectionPool({
    user: 'saadmin',
    password: '@!13$GCBC@dm!n2o22!!',
    server: 'historicalstaging.database.windows.net',
    database: 'collector',
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