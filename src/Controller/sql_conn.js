
const fs = require("fs")
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const logger = require("./Logger")
require('dotenv').config()


module.exports = {

  async main(viewType, createdDateTime, filename, rowcount, file_path, containerName) {
    try {

      sql.connect(sqlconfig, function (res, err) {
        const ps = new sql.PreparedStatement();
        ps.input("file_name", sql.NVarChar);
        ps.input("run_date", sql.DateTime);
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
                  logger.error(`error: ${err}`);
                } else {
                  logger.info(`Tasks added successfully - ${filename}`);
                }
                ps.unprepare((err) => { });
              });
          });
      })

    }
    catch (error) {
      logger.error(error)
    }
  },
  async export(viewType, payLoad, report_Name) {
    try {

      sql.connect(sqlconfig, function (res, err) {
        const ps = new sql.PreparedStatement();
        ps.input("viewtype", sql.NVarChar);
        ps.input("payload", sql.NVarChar);
        ps.input("report_name", sql.NVarChar);
        ps.prepare(
          "exec sp_insertExports 'exports', @viewtype, @payload, @report_name",
          (err) => {
            ps.execute({
                viewtype: viewType,
                payload: payLoad,
                report_name: report_Name
              },
              function (err, res) {
                if (err) {
                  logger.error(`Error in ${report_Name} : ${err}`);
                } else {
                  logger.info(`Exported - ${report_Name}`);
                }
                ps.unprepare((err) => { });
              });
          });
      })
    }
    catch (error) {
      logger.error(error)
    }
  },
  async dload(report_Name, Url,viewType) {
    try {
      await sql.connect(sqlconfig, function (res, err) {
        const ps = new sql.PreparedStatement();
        ps.input("report_name", sql.NVarChar);
        ps.input("url", sql.NVarChar);
        ps.input("viewtype", sql.NVarChar);
        ps.prepare(
          "exec sp_insertDownload 'exports',@report_name, @url,@viewtype",
          (err) => {
            ps.execute({
                report_name: report_Name,
                url: Url,
                viewtype: viewType
              },
              function (err, res) {
                if (err) {
                  logger.error(`error: ${err}`);
                } else {
                  logger.info(`Extracted URL from :` + report_Name);
                }
                ps.unprepare((err) => { });
              });
          });
      })
    }
    catch (error) {
      logger.error(error)
    }
  },
  async doneExport(viewType, ID,name) {
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.exports SET is_exported = 1 WHERE id = ${ID}`)
          .then(logger.info('Done exporting - ' + name))
      });
    }
    catch (error) {
      logger.error(error)
    }
  },
  async failExport(viewType, ID){
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.exports SET generation_retries=generation_retries+1 WHERE id = ${ID}`)
      });
    }
    catch (error) {
      logger.error(error)
    }
  },
  async status(runId,reportId,Status,Name){
    try {
      sql.connect(sqlconfig, function (res, err) {
        const ps = new sql.PreparedStatement();
        ps.input("runid", sql.NVarChar);
        ps.input("reportid", sql.NVarChar);
        ps.input("status", sql.NVarChar);
        ps.input("name", sql.NVarChar);
        ps.prepare(
          "exec sp_insertStatus 'status', @runid, @reportid, @status, @name",
          (err) => {
            ps.execute(
              {
                runid: runId,
                reportid: reportId,
                status: Status,
                name: Name
              },
              function (err, res) {
                if (err) {
                  console.log(err)
                  logger.error(`error: ${err}`);
                } else {
                  logger.info(`For deletion - ${Name}`);
                }
                ps.unprepare((err) => { });
              });
          });
      })
  }
  catch (error) {
    logger.error(error)
  }
}
  ,
  async doneDownload(id,name) {
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.downloads SET is_completed = 1 WHERE exports_id = ${id}`)
          .then(()=>{logger.info("Complete Downloading - "+name+".csv")
          this.completed(id)})
      });
    }
    catch (error) {
      logger.error(error)
    }
  },
  async completed(id) {
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.exports SET is_completed = 1 WHERE id = ${id}`)
      });
    }
    catch (error) {
      logger.error(error)
    }
  },
  async deleted(name) {
    try {
      sql.connect(sqlconfig).then((pool) => {
        return pool
          .request()
          .query(`UPDATE dbo.status SET is_deleted = 1 WHERE report_id = '${name}'`)
          .then(console.log("success delete"))
      });
    }
    catch (error) {
      logger.error(error)
    }
  }
}