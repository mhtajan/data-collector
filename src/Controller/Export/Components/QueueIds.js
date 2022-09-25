const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`);
var datetime = moment().format("YYYY-MM-DD")
var yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
const fetch = require('node-fetch')
const logger = require('../../Logger')
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
const queue = []

async function loader(token){
  logger.info('Exporting viewtype with QueueId')
  client.setAccessToken(token);
  await getUserProfile(token)
  await sleep(3000)
  await process()
}

async function getUserProfile(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/routing/queues',
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
      queue.push(entry.id)
    })
    
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile(body)
    
  }
}
async function pusher(payload,_callback){
    for(const queueid of queue){
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}`})
      Object.assign(payload.filter,{queueIds: [`${queueid}`]})
      //console.log(payload)
      await exportdata(payload,queueid)
      await sleep(8000)
}
}
async function process(){
    const Components = fs.readdirSync('./src/Controller/Export/Payload/QueueIds/')
    for (const component of Components){
      
      var jsonData = fs.readFileSync(`./src/Controller/Export/Payload/QueueIds/${component}`)
      var jsonBody = JSON.parse(jsonData);
             
            Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
            await pusher(jsonBody)

    }
  }

  client.setEnvironment("mypurecloud.jp")

  let apiInstance = new platformClient.AnalyticsApi()

  async function exportdata(payload,queueid) {
    apiInstance.postAnalyticsReportingExports(payload).then(()=>{
      logger.info(`Done Exporting ${payload.viewType}-${queueid}`);
  }).catch((err)=>{
      console.log(queueid)
      logger.error(`Failed at ${payload.viewType} for user:${queueid}`);
      logger.error(err);
  })
  }

module.exports = loader;