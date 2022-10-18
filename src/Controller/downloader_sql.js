const logger = require(`./Logger`);
const fs = require('fs')
const { writeFile } = require('fs').promises;
const axios = require(`axios`);
const sleep = require("sleep-promise");
const fetch = require("node-fetch");
let createdDateTime = new Date();
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
const Downloader = require("./Downloader");
const tokeni = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(tokeni).toString("base64");
const blobUpload = require('./sql_conn')
const deleter = require('./Delete')

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
let DlInstance = new platformClient.DownloadsApi();
client.setEnvironment("mypurecloud.jp");

async function mainDownload() {
  client
    .loginClientCredentialsGrant(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    )
    .then(async (token) => {
      logger.info("Extracting URL")
      await dlExport();
      // console.log(token)
      
      // await downloader(token.accessToken);
      // deleteReport(token.accessToken);
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
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities;
    entities.forEach(async (entity) => {
      if (entity.status.includes("COMPLETED")) {
        await sql_conn.dload(entity.name,entity.downloadUrl,entity.viewType)
      }
    });
    opts.pageNumber = opts.pageNumber + 1;
    dlExport();
  }
  if(res.pageCount==res.pageNumber){
    await sleep(2000)
    await sqlDownload()
  }
}

async function sqlDownload(){
  sql.connect(sqlconfig).then((pool) => {
    return pool
      .request()
      .query("Select top (275) * from downloads where is_completed = 0", async function (err, res) {
        if (err) {
          console.log("error:", err);
          return(err, null);
        } else {
          if(res.recordset.length>0){
            logger.info("Downloading")
            for (entry of res.recordset){         
              await getDownloads(entry.url.substr(54),entry.report_name,entry.exports_id,entry.datasource_name)
              .catch((err)=>{
                logger.error(err)
              })
            }
            await sleep(30000)
            await sqlDownload()
          }
          else{
            await deleter()
          }
            return(null, res);
        }
      });
  });
}
async function getDownloads(id,name,exports_id,viewtype){
  DlInstance.getDownload(id)
  .then(async(res)=>{
    await writeFile(`./reports/${name}.csv`,res)
    var path = process.cwd() + '\\reports\\' + name
    file_path = path +'.csv'
    data = res.toString().split('\n').length
    rowcount = data -2
    if (rowcount < 0) {
      rowcount = 0
    }
    await sql_conn.main(viewtype,createdDateTime,name,rowcount,file_path)
    await sql_conn.doneDownload(exports_id,name)
  })
  .catch((err)=>{
    logger.error(err)
  })
}


module.exports = mainDownload