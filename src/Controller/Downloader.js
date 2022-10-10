const axios = require(`axios`);
const fs = require('fs')
const download = require("download");
const fetch = require("node-fetch");
const moment = require(`moment`);
var datetime = moment().format("YYYY_MM_DD_HH_mm_ss");
var today = moment().format("YYYY-MM-DD")
var today = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(6, "days").format("YYYY-MM-DD")
const logger = require("./Logger.js");
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const sleep = require('sleep-promise');
const blobUpload = require('./BlobUpload')

let opts = {
  pageNumber: 1,
  pageSize: 500,
};
//function for whole api
async function getReport(body) {
  const options = {
    headers: {
      Authorization: `Bearer ${body}`,
      ContentType: `application/json`,
    },
  };
getData(); //getting data from api
 async  function getData() {
    axios({
      method: "get",
      url: "https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports",
      headers: { Authorization: "Bearer " + body },
      params: opts,
    })
      .then(async(response) => {
        res = response.data
        entity = res.entities;
        if (res.pageCount >= res.pageNumber) {
          entity.forEach(async (entry) => {
            if (entry.status.includes("FAILED")){
              console.log(`Failed at: `+entry.name)
            }
            //if (entry.interval.includes(`${yesterday}T00:00:00.000Z/${today}T00:00:00.000Z`)) {
            if (entry.status.includes("COMPLETED")) {
                //download filter             
                try {
                  await fetch(entry.downloadUrl, options)
                  .then(async (res) => {
                      if (res.ok) {
                        try {
                          await download(res.url, "./reports").then(async() => {
                          logger.info(`Complete Downloading - ${entry.name}`);
                          var path = process.cwd() + '\\reports\\' + entry.name
                          var file_path = path + '.csv';
                        var data = fs.readFileSync(file_path)
                        var res = data.toString().split('\n').length;
                        const rowcount = res - 2
                        if (rowcount < 0) {
                          rowcount = 0
                        }
                        await blobUpload.main(entry.viewType,entry.createdDateTime,entry.name,rowcount,file_path)
                        .then( (res) => {
                          logger.info('Done')
                        })
                        .catch((ex) => console.log(ex.message));
                          });
                        } catch (error) {
                          logger.error(error)
                        }
                      }
                  })
                  .catch((e) => console.error(e));
                } catch (error) {
                  logger.error(error)
                }
              }
            //}
          });
          opts.pageNumber = opts.pageNumber + 1;
          getData();
        } else if ((res.total == 0 && res.pageCount == 0)) {
          logger.info("There are no available data in Analytics Exports");
        }
      })
      .catch((e) => console.error());
  }
}

module.exports = getReport