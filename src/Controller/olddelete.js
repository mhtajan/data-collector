const logger = require(`./Logger`);
const axios = require(`axios`);
const sleep = require("sleep-promise");
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
      array.push({ id: entity.id, runId: entity.runId })
    });
    opts.pageNumber = opts.pageNumber + 1;
    deleteExport();
    console.log();
  }
}
async function deleteReport(accessToken) {
  if (array.length != 0) {
    console.log();
    for (const report of array) {
      await sleep(200);
      axios({
        method: "delete",
        url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${report.id}/history/${report.runId}`,
        headers: { Authorization: "Bearer " + accessToken },
      })
        .then(() => {
          console.log();
          console.log("success delete");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
    logger.info("Deleted all export");
  } else if (array.length == 0) {
    console.log("No export to delete");
  }
}
module.exports = deleter;