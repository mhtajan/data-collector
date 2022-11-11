
const sql = require('mssql');
 
const sqlconfig = {
  user: process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  server:  process.env.DB_SVR_MAIN,
  database:  process.env.DB_NAME,
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};
//local mssql db connection
const dbConn = new sql.ConnectionPool({
  user: process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  server:  process.env.DB_SVR_MAIN,
  database:  process.env.DB_NAME,
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