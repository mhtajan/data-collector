const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`);
var datetime = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const fetch = require('node-fetch')
const logger = require('./Logger')
const axios = require('axios').default
const sleep = require('sleep-promise')

const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance
const params = new URLSearchParams();


let opts = {
  pageSize: 25, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}
const user = []

async function loader(token){
  logger.info('Exporting viewtype with FilterbyQueueId')
  client.setAccessToken(token);
  await getUserProfile(token)
  await sleep(3000)
  await process()
}

async function getUserProfile(body) {
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
async function Loop(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      user.push(entry.id)
    })
    
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile(body)
    
  }
}
async function pusher(payload){
    for(const userid of user){
      const id = uuid.v4()
      Object.assign(payload, { name: `${jsonBody.viewType}_${datetime}_${id}`})
      Object.assign(payload.filter,{filterQueuesByUserIds: [`${userid}`]})
      //console.log(payload)
      await exportdata(payload,userid)
      await sleep(8000)
}
}
async function process(){
    const Components = fs.readdirSync('./src/Controller/exp_filtquser/')
    for (const component of Components){
      
      var jsonData = fs.readFileSync(`./src/Controller/exp_filtquser/${component}`)
      var jsonBody = JSON.parse(jsonData);
             
             Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
                await pusher(jsonBody)
                logger.info(`Done exporting for ${jsonBody.viewType}`)
    }
  }

  client.setEnvironment("mypurecloud.jp")

  let apiInstance = new platformClient.AnalyticsApi()

  async function exportdata(payload,user) {
    apiInstance.postAnalyticsReportingExports(payload).then(()=>{
      logger.info(`Done Exporting ${payload.viewType}-${user}`);
  }).catch((err)=>{
      console.log(user)
      logger.error(`Failed at ${payload.viewType} for user:${user}`);
      logger.error(err);
  })
  }

module.exports = loader;