const logger = require(`./Logger`);
const axios = require(`axios`);
const sleep = require("sleep-promise");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");

let opts = {
  pageNumber: 1,
  pageSize: 500,
};
const array = [];
const platformClient = require("purecloud-platform-client-v2");
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
      await deleteExport(token.accessToken);
    });
}
async function deleteExport(token) {
  apiInstance
    .getAnalyticsReportingExports(opts)
    .then((res) => {
      Loop(res, token);
    })
    .catch((e) => console.error(e));
}
async function Loop(res, token) {
  if ((res.total = 0)) {
    console.log("Reports now empty");
  }
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities;
    console.log(res);
    entities.forEach(async (entity) => {
      array.push({ id: entity.id, runId: entity.runId });
    });
    opts.pageNumber = opts.pageNumber + 1;
    deleteExport();
    console.log(opts.pageCount);
    console.log(opts.pageNumber);
  }
  if (res.pageCount == res.pageNumber) {
    await sleep(100);
    deleteReport(token);
  }
}
async function deleteReport(token) {
  if (array.length != 0) {
    console.log(array.length);
    for (const report of array) {
      await sleep(200);
      axios({
        method: "delete",
        url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${report.id}/history/${report.runId}`,
        headers: { Authorization: "Bearer " + token },
      })
        .then(() => {
          console.log(array.length);
          console.log("success delete");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
    console.log("Deleted all export");
  } else if (array.length == 0) {
    console.log("No export to delete");
  }
}

module.exports = deleter;
