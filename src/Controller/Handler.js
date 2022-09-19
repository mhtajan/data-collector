const axios = require(`axios`);
const download = require("download");
const fetch = require("node-fetch");
const moment = require(`moment`);
var datetime = moment().format("YYYY_MM_DD_HH_mm_ss");
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
          entity.forEach(async(entry) => {
            //date filter
            if (entry.interval.includes(`${yesterday}T00:00:00.000Z/${today}T00:00:00.000Z`)) {        
            if (entry.status.includes("COMPLETED")) {
              //download filter
              try {
                await fetch(entry.downloadUrl, options)
                .then(async (res) => {
                  try {
                      await download(res.url, "./reports/").then(() => {
                      logger.info(
                        `Complete Downloading - ${entry.name}`
                      );
                    });
                  } catch (error) {
                    logger.error(error)
                  }  
                })
                .catch((e) => console.error(e));
              } catch (error) {
                logger.error(error)
              }           
            }
          }
          else if(entry.status.includes("FAILED")){
            logger.error(`FAILED: ${entry.viewType}\n ERROR: ${entry.exportErrorMessagesType}`)
          }
          });
          opts.pageNumber = opts.pageNumber + 1;
          getData();
        } else if ((res.total == 0 && res.pageCount==0)) {
          logger.info("There are no available data in Analytics Exports");
        }
      })
      .catch((e) => console.error());
  }
}

module.exports = getReport