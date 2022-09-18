const axios = require(`axios`);
const download = require("download");
const fetch = require("node-fetch");
const moment = require(`moment`);
var datetime = moment().format("YYYY_MM_DD_HH_mm_ss");
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
          entity.forEach((entry) => {
            const fileoption = {
              filename: `${entry.viewType}_${datetime}_${entry.id}.csv`,
            };
            //date filter
            if (entry.interval.includes(yesterday)) {        
            if (entry.status.includes("COMPLETED")) {
              //download filter
              fetch(entry.downloadUrl, options)
                .then((res) => {
                  download(res.url, "./reports", fileoption).then(() => {
                    logger.info(
                      `Complete Downloading - ${Object.values(fileoption)}`
                    );
                  });
                })
                .catch((e) => console.error(e));
            }
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