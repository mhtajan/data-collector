const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const fetch = require('node-fetch')
const logger = require('../../Logger')
const axios = require('axios').default
const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const { backOff } = require("exponential-backoff");
var sql = require("mssql");
var dbConn = require("../../config");
const { sqlconfig } = require("../../config");
const sql_conn = require("../../sql_conn")
const sql_dl = require('../../downloader_sql')
const client = platformClient.ApiClient.instance
const params = new URLSearchParams()
client.setEnvironment('mypurecloud.jp')

var counter = 0
var export_counter = 0;
async function exportdata(payload, id) {
  let apiInstance = new platformClient.AnalyticsApi()
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
            await sql_dl()
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
					await sql_dl();
				}
			}
		});
	});
}


module.exports = postExport