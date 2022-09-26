const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`);
var datetime = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const fetch = require('node-fetch')
const logger = require('../../Logger')
const axios = require('axios').default
const sleep = require('sleep-promise')

const platformClient = require("purecloud-platform-client-v2")
const client = platformClient.ApiClient.instance
const params = new URLSearchParams();


let opts = {
  pageSize: 25, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}
const flow = []
async function load(token){
  logger.info('Exporting viewtype with UserId')
  client.setAccessToken(token);
  await getUserProfile(token)
  await sleep(3000)
  process()
}

async function getFlow(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/flows',
    headers: { Authorization: 'Bearer ' + body },
    params: opts,
  })
    .then((response) => {
      Loop(response.data, body)
    })
    .catch((e) => console.error(e))
}
async function Loop(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flow.push(entry.id)
    })
    
    opts.pageNumber = opts.pageNumber + 1
    getFlow(body)
    
  }
}
async function pusher(payload){
  Object.assign(payload.filter.userIds,user)
}
async function process(){
    const Components = fs.readdirSync('./src/Controller/Export/Payload/UserIds/')
    for (const component of Components){
      const id = uuid.v4()
      var jsonData = fs.readFileSync(`./src/Controller/Export/Payload/UserIds/${component}`)
      var jsonBody = JSON.parse(jsonData);
             Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
             Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
             logger.info(`Exporting ${jsonBody.viewType}`)
             await pusher(jsonBody)
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

module.exports = load;