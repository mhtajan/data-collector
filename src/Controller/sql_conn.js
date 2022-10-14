
const fs = require("fs")
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const logger = require("./Logger")
require('dotenv').config()


module.exports = {

  async main(viewType,createdDateTime,filename,rowcount,file_path,containerName) {
    try {

      sql.connect(sqlconfig, function (res,err) {
        const ps = new sql.PreparedStatement();
        ps.input("file_name", sql.NVarChar);
        ps.input("run_date",sql.DateTime);
        ps.input("file_path", sql.NVarChar);
        ps.input("extracted_quantity", sql.BigInt)
        ps.prepare(
          "exec sp_insertTasks 'tasks', @file_name, @run_date, @file_path, @extracted_quantity",
          (err) => {
            ps.execute(
              { 
                file_name: viewType,
                run_date: createdDateTime,
                file_path: file_path,
                extracted_quantity: rowcount,
              },
              function (err, res) {
                if (err) {
                  console.log(err)
                  logger.error("error:", err);
                } else {
                  logger.info(`Tasks added successfully - ${filename}`);
                }
                ps.unprepare((err) => {});
              });
          });
      })

    }
    catch(error) {
      logger.error(error)
    }
  },
  async export(viewType,payLoad) {
    try {

      sql.connect(sqlconfig, function (res,err) {
        const ps = new sql.PreparedStatement();
        ps.input("viewtype", sql.NVarChar);
        ps.input("payload", sql.NVarChar);
        ps.prepare(
          "exec sp_insertExports 'exports', @viewtype, @payload",
          (err) => {
            ps.execute(
              { 
                viewtype: viewType,
                payload: payLoad
              },
              function (err, res) {
                if (err) {
                  console.log(err)
                  logger.error("error:", err);
                } else {
                  logger.info(`Exported - ${viewType}`);
                }
                ps.unprepare((err) => {});
              });
          });
      })

    }
    catch(error) {
      logger.error(error)
    }
  },
  async doneExport(viewType,ID){
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.exports SET is_exported = 1 WHERE id = ${ID}`);
      });
        }
catch(error) {
  logger.error(error)
}
}
}