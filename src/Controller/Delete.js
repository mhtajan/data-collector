const logger = require(`./Logger`);
const axios = require(`axios`);
const sleep = require("sleep-promise");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const modules = require('./modules')
var counter = 0
var export_counter = 0;
//const exporter  = require("./Export/Components/export_only")
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
            //postExport()
          }  
          return(null, res);
        }
      });
  });
}
async function exportdata(payload, id) {
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
            modules.downloader()
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

module.exports = deleter;
