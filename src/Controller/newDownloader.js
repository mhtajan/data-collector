const logger = require(`./Logger`);
const fs = require('fs')
const { writeFile } = require('fs').promises;
const axios = require(`axios`);
const sleep = require("sleep-promise");
const fetch = require("node-fetch");
let createdDateTime = new Date();
const Downloader = require("./Downloader");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");
const blobUpload = require('./sql_conn')

let opts = {
  pageNumber: 1,
  pageSize: 500,
};
const array = [];
const platformClient = require("purecloud-platform-client-v2");
const download = require("download");
const sql_conn = require('./sql_conn');
const client = platformClient.ApiClient.instance;
let apiInstance = new platformClient.AnalyticsApi();
client.setEnvironment("mypurecloud.jp");

async function mainDownload() {
  client
    .loginClientCredentialsGrant(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    )
    .then(async (token) => {
      logger.info("Downloading Exports")
      await dlExport();
      console.log(token)
      await sleep(15000)
      await downloader(token.accessToken);
      deleteReport(token.accessToken);
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
  if ((res.total = 0)) {
    console.log("Reports now empty");
  }
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities;
    entities.forEach(async (entity) => {
      if (entity.status.includes("COMPLETED")) {
        array.push({ id: entity.id, runId: entity.runId, name: entity.name, viewType: entity.viewType, url: entity.downloadUrl });
      }
    });
    opts.pageNumber = opts.pageNumber + 1;
    dlExport();
    console.log();
    console.log();
  }
}

// async function downloader(accessToken){
//   const options = {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         ContentType: `application/json`,
//       },
//     };
//   if (array.length !=0){
//       logger.info("Number of download: "+array.length)
//       for await (const dl of array){
//           fetch(dl.url,options)
//           .then(async(res)=>{
//               if (res.ok) {
//                   console.log();
//                     await download(res.url, "./reports")
//                     .then(() => {
//                     logger.info(`Complete Downloading - ${dl.name}`);
//                     var path = process.cwd() + '\\reports\\' + dl.name
//                     var file_path = path + '.csv';
//                   var data = fs.readFileSync(file_path)
//                   var res = data.toString().split('\n').length;
//                   const rowcount = res - 2
//                   if (rowcount < 0) {
//                     rowcount = 0
//                   }
//                     });
//                 }
//           }).catch((error)=>{
//               logger.error(error)
//           })
//       }
//   }
// }

async function downloader(accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ContentType: `application/json`,
    },
  };
  logger.info("Number of download: " + array.length)
  for (let i = 0; i < array.length; i++) {
    await fetch(array[i].url, options)
      .then(async (res) => {
        if (res.ok) {
          const response = await fetch(res.url);
          const buffer = await response.buffer();
          await writeFile(`./reports/${array[i].name}.csv`, buffer);
          logger.info('Complete downloading - ' + array[i].name)
          var path = process.cwd() + '\\reports\\' + array[i].name
          var file_path = path + '.csv';
          var data = fs.readFileSync(file_path)
          var res = data.toString().split('\n').length;
          let rowcount = res - 2
          if (rowcount < 0) {
            rowcount = 0
          }
          blobUpload.main(array[i].viewType, createdDateTime, array[i].name, rowcount, file_path)
          .catch((ex) => console.log(ex.message));
        }
      }
      )
      .catch((err) => {
        logger.error(err)
      })
  }
}
async function deleteReport(accessToken) {
  logger.info("Removing exports")
  await sleep(2000)
  if (array.length != 0) {
    console.log();
    for (const report of array) {
      await axios({
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
    logger.info("Deleted export");
  } else if (array.length == 0) {
    console.log("No export to delete");
  }
}
module.exports = mainDownload