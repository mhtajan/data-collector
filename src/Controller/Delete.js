const logger = require(`./Logger`);
const axios = require(`axios`);
const sleep = require("sleep-promise");
const Downloader = require("./Downloader");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
let opts = {
  pageNumber: 1,
  pageSize: 500,
};
const array = [];
const platformClient = require("purecloud-platform-client-v2");
const sql_conn = require("./sql_conn");
const client = platformClient.ApiClient.instance;
let apiInstance = new platformClient.AnalyticsApi();
client.setEnvironment("mypurecloud.jp"); // Genesys Cloud region

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
  apiInstance
    .getAnalyticsReportingExports(opts)
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
// async function deleteReport(accessToken) {
//   if (array.length != 0) {
//     console.log();
//     for (const report of array) {
//       await sleep(200);
//       axios({
//         method: "delete",
//         url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${report.id}/history/${report.runId}`,
//         headers: { Authorization: "Bearer " + accessToken },
//       })
//         .then(() => {
//           console.log();
//           console.log("success delete");
//         })
//         .catch((err) => {
//           console.log(err.message);
//         });
//     }
//     logger.info("Deleted all export");
//   } else if (array.length == 0) {
//     console.log("No export to delete");
//   }
// }
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
          }
          
          return(null, res);
        }
      });
  });
}

module.exports = deleter;
