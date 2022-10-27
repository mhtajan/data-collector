const logger = require(`./Logger`);
const fs = require('fs')
const { writeFile } = require('fs').promises;
const axios = require(`axios`);
const sleep = require("sleep-promise");
const fetch = require("node-fetch");
let createdDateTime = new Date();
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");
const sql_conn = require('./sql_conn')
const deleter = require('./Delete')
var counter = 0
var export_counter = 0;

let opts = {
  pageNumber: 1,
  pageSize: 500,
};
let deleteopts = {
  pageNumber: 1,
  pageSize: 500,
};
const array = [];
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance;
let apiInstance = new platformClient.AnalyticsApi();
let DlInstance = new platformClient.DownloadsApi();
client.setEnvironment("mypurecloud.jp");

async function mainDownload() {
  client
    .loginClientCredentialsGrant(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    )
    .then(async (token) => {
      logger.info("Extracting URL")
      await dlExport();
    });
}

async function dlExport(accessToken) {
  apiInstance
    .getAnalyticsReportingExports(opts)
    .then((res) => {
      Loop(res, accessToken);
    })
    .catch((e) => console.error(e));
}
async function Loop(res, accessToken) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities;
    entities.forEach(async (entity) => {
      if (entity.status.includes("COMPLETED")) {
        await sql_conn.dload(entity.name, entity.downloadUrl, entity.viewType)
      }
    });
    opts.pageNumber = opts.pageNumber + 1;
    dlExport();
  }
  if (res.pageCount == res.pageNumber) {
    await sleep(2000)
    await sqlDownload()
  }
}

async function sqlDownload() {
  sql.connect(sqlconfig).then((pool) => {
    return pool
      .request()
      .query("Select top (200) * from downloads where is_completed = 0", async function (err, res) {
        if (err) {
          console.log("error:", err);
          return (err, null);
        } else {
          if (res.recordset.length > 0) {
            logger.info("Downloading")
            for (entry of res.recordset) {
              await getDownloads(entry.url.substr(54), entry.report_name, entry.exports_id, entry.datasource_name)
                .catch((err) => {
                  logger.error(err)
                })
            }
            await sleep(50000)
            await sqlDownload()
          }
          else {
            await deleteRep()
          }
          return (null, res);
        }
      });
  });
}
async function getDownloads(id, name, exports_id, viewtype) {
  DlInstance.getDownload(id)
    .then(async (res) => {
      await writeFile(`./reports/${name}.csv`, res)
      var path = process.cwd() + '\\reports\\' + name
      file_path = path + '.csv'
      data = res.toString().split('\n').length
      rowcount = data - 2
      if (rowcount < 0) {
        rowcount = 0
      }
      await sql_conn.main(viewtype, createdDateTime, name, rowcount, file_path)
      await sql_conn.doneDownload(exports_id, name)
    })
    .catch((err) => {
      logger.error(err)
    })
}

async function deleteRep(){
  await deleter()
  async function deleter() {
    client
      .loginClientCredentialsGrant(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
      )
      .then(async (token) => {
        logger.info("Removing all successful export")
        await deleteExport(token.accessToken);
        await sleep(10000)
        await deleteReport(token.accessToken);
      });
  }
  async function deleteExport(accessToken) {
    let apiInstance = new platformClient.AnalyticsApi();
    apiInstance
      .getAnalyticsReportingExports(deleteopts)
      .then((res) => {
        Loop(res, accessToken);
      })
      .catch((e) => console.error(e));
  }
  async function Loop(res, accessToken) {
    if ((res.total = 0)) {
      console.log("Reports now empty");
    }
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities;
      entities.forEach(async (entity) => {
        sql_conn.status(entity.runId,entity.id,entity.status,entity.name)
      });
      opts.pageNumber = opts.pageNumber + 1;
      deleteExport();
      console.log();
    }
  }
  async function deleteReport(accessToken) {
    sql.connect(sqlconfig).then((pool) => {
      return pool
        .request()
        .query("Select * from status where is_deleted = 0", async function (err, res) {
          if (err) {
            console.log("error:", err);
            return(err, null);
          } else {
            await sleep(5000)
            if(res.recordset.length>0){
              for await(report of res.recordset){
                await sleep(200)
                axios({
                  method: "delete",
                  url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${report.report_id}/history/${report.run_id}`,
                  headers: { Authorization: "Bearer " + accessToken },
                })
                  .then(async() => {
                    sql_conn.deleted(report.report_id)
                    
                  })
                  .catch((err) => {
                    console.log(err.message);
                  });
              }
              await deleteReport(accessToken)
            }
            else{
              logger.info("Successfully deleted all reports")
              counter = 0
              opts.pageNumber = 1
              deleteopts.pageNumber = 1
              CheckExportsLeft()
            }  
            return(null, res);
          }
        });
    });
  }
  async function exportdata(payload, id) {
    apiInstance
      .postAnalyticsReportingExports(payload)
      .then(async() => {
        //counter++
      export_counter++;
        sql_conn.doneExport(payload.viewType, id)
        // console.log(counter)
      console.log(export_counter);
      })
      .catch((err) => {
        logger.error(`Failed at ${payload.viewType} : ` + err.message)
      })
  }
  async function postExport() {
    sql.connect(sqlconfig).then((pool) => {
      pool
      .request()
      // Get x number of records to send as post request to genesys
      .query("Select top (125) * from exports where is_exported = 0", async function (err, res) {
        if (err) {
          logger.error("error");
          return (err, null);
        } else {
          console.log("counter:" + counter);
          await sleep(5000); // is this needed as there is a sleep inside the if condition after this?
          if (res.recordset.length > 0) {
            counter = counter + export_counter;
            export_counter = 0;
            if(counter>100){
              console.log("Limit Reach counter:" + counter);
              mainDownload()
            }
            else{
              await sleep(60000); // rate-limit avoidance
            // iterate in the x number of records captured from database
            for await (entry of res.recordset) {
              reportname = entry.report_name;
              // send post request to genesys
              exportdata(JSON.parse(entry.payload), entry.id);
            }
              console.log("counter:" + counter);
              await postExport()
            }
          } else {
            logger.info("There is nothing to be exported");
            // initiate report download then subtract total number of successful download to counter
            await mainDownload();
          }
        }
      });
    });
  }
  async function CheckExportsLeft(){
    sql.connect(sqlconfig).then((pool) => {
      pool
      .request()
      .query("Select * from exports where is_exported = 0", async function (err, res) {
        if (err) {
          logger.error("error");
          return (err, null);
        } else {
          if(res.recordset.length > 0){
            //not empty
            await postExport()
          }
          else{
            logger.info("No more exports left")
          }
        }
      });
    });
  }
}

module.exports = mainDownload