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

async function Export(token){
  client.setAccessToken(token);
    await process()
    await download(token)
  }
  async function download(token){
    await sleep(8000*41)
    handler(token)
  }
  async function process(){
    const Components = fs.readdirSync('./src/Controller/Export/')
    .forEach((component, index)=>{
      const id = uuid.v4()
      var jsonData = fs.readFileSync(`./src/Controller/Export/${component}`)
      var jsonBody = JSON.parse(jsonData);
             Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
             Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
             logger.info(`Exporting ${jsonBody.viewType}`)
             
             setTimeout(()=>{
              exportdata(jsonBody)
             },8000*(index+1))
    })
  }
  client.setEnvironment("mypurecloud.jp")

  let apiInstance = new platformClient.AnalyticsApi()

  async function exportdata(jsonBody) {
    try {
      await apiInstance.postAnalyticsReportingExports(jsonBody);
      logger.info(`Done Exporting ${jsonBody.viewType}`);
    } catch (err) {
      logger.error(`Failed at ${jsonBody.viewType}`);
      logger.error(err);
      throw err;
    }
  }

async function exportUser(body){
  const user = []
  getUserProfile(body)
  function getUserProfile(body) {
    axios({
      method: 'get',
      url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
      headers: { Authorization: 'Bearer ' + body },
      params: opts,
    })
      .then((response) => {
        Loop(response.data, body)
      })
      .catch((e) => console.error(e))
  }
  function Loop(res, body) {
    if (res.pageCount >= res.pageNumber) {
      console.log(user)
      entities = res.entities
      entities.forEach((entry) => {
        json.userIds.user.push(entry.id)
      })
  
      opts.pageNumber = opts.pageNumber + 1
      getUserProfile(body)
  
    }
    console.log(json)
  }
  Object.assign()
}
async function expFilters(){

}


module.exports = Export;