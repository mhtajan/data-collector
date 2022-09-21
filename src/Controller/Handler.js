const axios = require(`axios`);
const fs = require('fs')
const download = require("download");
const fetch = require("node-fetch");
const moment = require(`moment`);
var datetime = moment().format("YYYY_MM_DD_HH_mm_ss");
var today = moment().format("YYYY-MM-DD")
var today = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const logger = require("./Logger.js");
let opts = {
  pageNumber: 1,
  pageSize: 500,
};
//function for whole api
function getReport(body) {
  const options = {
    headers: {
      Authorization: `Bearer ${body}`,
      ContentType: `application/json`,
    },
  };
  const log = new console.Console(fs.createWriteStream("./logs.txt"))
  getData(); //getting data from api
  function getData() {
    axios({
      method: "get",
      url: "https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports",
      headers: { Authorization: "Bearer " + body },
      params: opts,
    })
      .then((response) => {
        res = response.data
        entity = res.entities;
        if (res.pageCount >= res.pageNumber) {
          entity.forEach(async (entry) => {
            //date filter
            if (entry.interval.includes(`${yesterday}T00:00:00.000Z/${today}T00:00:00.000Z`)) {
            if (entry.status.includes("COMPLETED")) {
                //download filter
                try {
                  await fetch(entry.downloadUrl, options)
                  .then(async (res) => {
                      if (res.ok) {
                        try {
                          await download(res.url, "./reports").then(() => {
                          logger.info(`Complete Downloading - ${entry.viewType}`);
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
            }
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