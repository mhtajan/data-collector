const fs = require('fs')
const moment = require(`moment`);
var datetime = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const logger = require('../../Logger')
const platformClient = require("purecloud-platform-client-v2")
const client = platformClient.ApiClient.instance
const sleep = require('sleep-promise')
const uuid = require('uuid');


  async function process(token){
    logger.info('Exporting viewtype without filters')
    const Components = fs.readdirSync('./src/Controller/Export/Payload/WithoutFilter')
    for (const component of Components){
      const id = uuid.v4()
      var jsonData = fs.readFileSync(`./src/Controller/Export/Payload/WithoutFilter/${component}`)
      var jsonBody = JSON.parse(jsonData);
             Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
             Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
             await exportdata(jsonBody)
             await sleep(8000)
    }
  }
  client.setEnvironment("mypurecloud.jp")

  let apiInstance = new platformClient.AnalyticsApi()

  async function exportdata(payload) {
    apiInstance.postAnalyticsReportingExports(payload).then(()=>{
      logger.info(`Done Exporting ${payload.viewType}`);
  }).catch((err)=>{
      logger.error(`Failed at ${payload.viewType}`);
      logger.error(err);
  })
  }


module.exports = process;