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
client.setEnvironment("mypurecloud.jp")
let apiInstance = new platformClient.AnalyticsApi()
const user = []
const queue = []
const flow = []
const filter = {
    QueuesByUserIds:["AGENT_QUEUE_DETAIL_VIEW.json"],
    UsersByQueueIds:["QUEUE_AGENT_DETAIL_VIEW.json"],
    FlowIds:["FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW.json",
    "FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW.json",
    "FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW.json",
    "IVR_PERFORMANCE_DETAIL_VIEW.json"],
    QueueIds:["ABANDON_INSIGHTS_VIEW.json",
    "QUEUE_INTERACTION_DETAIL_VIEW.json",
    "QUEUE_PERFORMANCE_DETAIL_VIEW.json"],
    SurveyFormIds:["SURVEY_FORM_PERFORMANCE_DETAIL_VIEW.json"],
    UserIds:["AGENT_EVALUATION_DETAIL_VIEW.json",
    "AGENT_INTERACTION_DETAIL_VIEW.json",
    "AGENT_PERFORMANCE_DETAIL_VIEW.json",
    "AGENT_STATUS_DETAIL_VIEW.json",
    "AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW.json",
    "INTERACTION_SEARCH_VIEW.json"],
    WithoutFilter:["AGENT_DEVELOPMENT_DETAIL_ME_VIEW.json",
    "AGENT_DEVELOPMENT_DETAIL_ME_VIEW.json",
    "AGENT_DEVELOPMENT_DETAIL_VIEW.json",
    "AGENT_DEVELOPMENT_SUMMARY_VIEW.json",
    "AGENT_EVALUATION_SUMMARY_VIEW.json",
    "AGENT_PERFORMANCE_SUMMARY_VIEW.json",
    "AGENT_STATUS_SUMMARY_VIEW.json",
    "AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW.json",
    "BOT_PERFORMANCE_DETAIL_VIEW.json",
    "BOT_PERFORMANCE_SUMMARY_VIEW.json",
    "CONTENT_SEARCH_VIEW.json",
    "FLOW_DESTINATION_SUMMARY_VIEW.json",
    "FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW.json",
    "FLOW_OUTCOME_SUMMARY_VIEW.json",
    "IVR_PERFORMANCE_SUMMARY_VIEW.json",
    "JOURNEY_ACTION_MAP_SUMMARY_VIEW.json",
    "JOURNEY_OUTCOME_SUMMARY_VIEW.json",
    "JOURNEY_SEGMENT_SUMMARY_VIEW.json",
    "QUEUE_PERFORMANCE_SUMMARY_VIEW.json",
    "SCHEDULED_CALLBACKS_VIEW.json",
    "SKILLS_PERFORMANCE_VIEW.json",
    "WRAP_UP_PERFORMANCE_SUMMARY_VIEW.json"],
    WrapUpCodes:[]
    
}
let opts = {
    pageSize: 25, // Number | Page size
    pageNumber: 1, // Number | Page number
    state: 'active', // String | Only list users of this state
  }
const second = 1000;
async function pipeLoader(token){
    await sleep(10*second)
    await getUserProfile(token)
    await sleep(10*second)
    await getQueue(token)
    await sleep(10*second)
    await getFlow(token)
    //client.setAccessToken(token);
    await sleep(10*second)
    await exportFlowIdwith()
    await sleep(100*second)
    await exportFlowId()
    await sleep(100*second)
    await exportUser()
    await sleep(100*second)
    await exportQueue()
    await exportFilterQueues()
    await sleep(100*second)
    await exportNoFilter() 
}
async function getUserProfile(body) {
    axios({
     method: 'get',
     url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
     headers: { Authorization: 'Bearer ' + body },
     params: opts,
   })
     .then(async(response) => {
       LoopUser(response.data, body)
     })
     .catch((e) => console.error(e))
}
async function getQueue(body) {
    axios({
      method: 'get',
      url: 'https://apps.mypurecloud.jp/platform/api/v2/routing/queues',
      headers: { Authorization: 'Bearer ' + body },
      params: opts,
    })
      .then((response) => {
        LoopQueue(response.data, body)
      })
      .catch((e) => console.error(e))
}
async function getFlow(body) {
    axios({
      method: 'get',
      url: 'https://apps.mypurecloud.jp/platform/api/v2/flows',
      headers: { Authorization: 'Bearer ' + body },
      params: opts,
    })
      .then((response) => {
        LoopFlow(response.data, body)
      })
      .catch((e) => console.error(e))
}
async function LoopFlow(res, body) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach((entry) => {
        flow.push(entry.id)
      })
      
      opts.pageNumber = opts.pageNumber + 1
      getFlow(body)
      
    }
}
async function LoopQueue(res, body) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach((entry) => {
        queue.push(entry.id)
      })
      
      opts.pageNumber = opts.pageNumber + 1
      getQueue(body)
      
    }
}
async function LoopUser(res, body) {
   if (res.pageCount >= res.pageNumber) {
     entities = res.entities
     entities.forEach(async(entry) => {
        user.push(entry.id)
     })
     
     opts.pageNumber = opts.pageNumber + 1
      getUserProfile(body)
     
   }
}
async function exportUser(){
logger.info('Exporting viewtype with UserId')
await sleep(1000)
await process()
      async function pusher(payload){
       Object.assign(payload.filter.userIds,user)
      }
      async function process(){
          for await (const component of filter.UserIds){
            const id = uuid.v4()
            var jsonData = fs.readFileSync(__dirname+`/../Payload/UserIds/${component}`)
            var jsonBody = JSON.parse(jsonData);
            Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
            Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
            pusher(jsonBody)
            exportdata(jsonBody)
                  
          }
      }
}
async function exportQueue(){
logger.info('Exporting viewtype with QueueIds')
await sleep(1000)
await process()
async function pusher(payload){
    for await (const queueid of queue){
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}`})
      Object.assign(payload.filter,{queueIds: [`${queueid}`]})
      exportdata(payload)
}
}
async function process(){
    for await (const component of filter.QueueIds){
      var jsonData = fs.readFileSync(__dirname+`/../Payload/QueueIds/${component}`)
      var jsonBody = JSON.parse(jsonData);          
        Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
        pusher(jsonBody)
    }
  }
}
async function exportFlowIdwith(){
    logger.info('Exporting viewtype with single FlowIds')
await sleep(1000)
await process()
    async function pusher(payload){
        for await (const flowid of flow){
            const id = uuid.v4()
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}`})
            Object.assign(payload.filter,{flowIds: [`${flowid}`]})
            exportdata(payload)
            }
    }
    async function process(){
        for await(const component of filter.FlowIds){
            var jsonData = fs.readFileSync(__dirname+`/../Payload/FlowIds/${component}`)
            var jsonBody = JSON.parse(jsonData);          
            Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
            pusher(jsonBody) 
        }
    }
}
async function exportFlowId(){
    logger.info('Exporting viewtype with FlowIds')
    await sleep(1000)
    await process()
    async function pusher(payload){
        Object.assign(payload.filter.flowIds,flow)
      }
      async function process(){
          const Components = fs.readdirSync(__dirname+'/../Payload/FlowIds/')
          for (const component of Components){
            const id = uuid.v4()
            var jsonData = fs.readFileSync(__dirname+`/../Payload/FlowIds/${component}`)
            var jsonBody = JSON.parse(jsonData);
                   Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
                   Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
                   pusher(jsonBody)
                   exportdata(jsonBody)
          }
      }      
}
async function exportFilterQueues(){
        await sleep(1000)
        await process()
      async function pusher(payload){
          for await (const userid of user){
            const id = uuid.v4()
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}`})
            Object.assign(payload.filter,{filterQueuesByUserIds: [`${userid}`]})
            exportdata(payload,userid)
      }
      }
      async function process(){
        logger.info('Exporting viewtype with FilterbyQueueId')
          for await (const component of filter.QueuesByUserIds){
            
            var jsonData = fs.readFileSync(__dirname+`/../Payload/FilterQueuesbyUserIds/${component}`)
            var jsonBody = JSON.parse(jsonData);
                   
             Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
             pusher(jsonBody)
          }
      }   
}
async function exportNoFilter(){
    await sleep(1000)
        logger.info('Exporting viewtype without filters')
        for await (const component of filter.WithoutFilter){
          const id = uuid.v4()
          var jsonData = fs.readFileSync(__dirname+`/../Payload/WithoutFilter/${component}`)
          var jsonBody = JSON.parse(jsonData);
                 Object.assign(jsonBody, { name: `${jsonBody.viewType}_${datetime}_${id}`})
                 Object.assign(jsonBody, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
                 exportdata(jsonBody)
        }
}
  async function exportdata(payload) {
    await apiInstance.postAnalyticsReportingExports(payload).then(()=>{
      logger.info(`Done Exporting ${payload.viewType}`);
  }).catch((err)=>{
      logger.error(`Failed at ${payload.viewType}`);
      logger.error(err);
  })
}

module.exports = pipeLoader;