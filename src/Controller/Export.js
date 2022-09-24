const fs = require('fs')
const moment = require(`moment`);
var datetime = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const handler = require('./Handler')
const logger = require('./Logger')
const platformClient = require("purecloud-platform-client-v2")
const client = platformClient.ApiClient.instance
const sleep = require('sleep-promise')
const uuid = require('uuid');
const exp_filtquser = require('./exp_quser')
const exp_user = require('./exp_user')
async function Export(token){
  client.setAccessToken(token);
    promisi(token)
  }
   function _callback(){
     console.log('callback')
   }
  async function filterQueuesByUserIds(token,_callback){
    await exp_filtquser(token)
  }
  async function filterUserId(token,_callback){
    await exp_user(token)
  }
  async function viewTypes(token,_callback){
    await process()
  }
  async function exp_download(token,_callback){
    await handler(token)
  }
  async function promisi(token){
   await filterQueuesByUserIds(token)
   await filterUserId(token)
   await process()
   await download(token)
  }

  async function download(token){
    //await sleep(8000*41)
    await handler(token)
  }
  async function process(){
    logger.info('Exporting viewtype without filters')
    const Components = fs.readdirSync('./src/Controller/Export/')
    for (const component of Components){
      const id = uuid.v4()
      var jsonData = fs.readFileSync(`./src/Controller/Export/${component}`)
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


module.exports = Export;