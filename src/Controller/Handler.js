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
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const sleep = require('sleep-promise');

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
  const log = new console.Console(fs.createWriteStream("./logs.txt"))
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
            //date filter
            if (entry.interval.includes(`${yesterday}T00:00:00.000Z/${today}T00:00:00.000Z`)) {
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
                        sql.connect(sqlconfig, function (res,err) {
                          const ps = new sql.PreparedStatement();
                          ps.input("file_name", sql.NVarChar);
                          ps.input("run_date",sql.DateTime);
                          ps.input("file_path", sql.NVarChar);
                          ps.input("extracted_quantity", sql.BigInt)
                          ps.prepare(
                            "exec sp_insertTasks 'tasks', @file_name, @run_date, @file_path, @extracted_quantity",
                            (err) => {
                              ps.execute(
                                { 
                                  file_name: entry.viewType,
                                  run_date: entry.createdDateTime,
                                  file_path: file_path,
                                  extracted_quantity: rowcount,
                                },
                                function (err, res) {
                                  if (err) {
                                    console.log("error:", err);
                                  } else {
                                    console.log(`Tasks added successfully - ${entry.name}`);
                                  }
                                  ps.unprepare((err) => {});
                                });
                            });
                            
                        });
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
            await sleep(2000)
          });
         // await sleep(2000)
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