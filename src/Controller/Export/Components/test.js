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
const client = platformClient.ApiClient.instance
const params = new URLSearchParams()
client.setEnvironment('mypurecloud.jp')
let apiInstance = new platformClient.AnalyticsApi()
const user = []
const queue = []
const flow = []
const flowMileStone = []
const flowOutcome = []
const did = []
const directions = ['Inbound']
const survey = []
const wrapup = []
const inactive_filter = {
  QueuesByUserIds: ['AGENT_QUEUE_DETAIL_VIEW.json'],
  UsersByQueueIds: ['QUEUE_AGENT_DETAIL_VIEW.json'],
  Dnis: [
    'DNIS_PERFORMANCE_DETAIL_VIEW.json',
    'DNIS_PERFORMANCE_SUMMARY_VIEW.json',
  ],
  FlowIdsMulti: ['IVR_PERFORMANCE_DETAIL_VIEW.json'],
  FlowMileStone: [
    'FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW.json',
    'FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW.json',
  ],
  FlowIds: ['FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW.json'],
  FlowOutCome: ['FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW.json'],
  QueueIds: [
    'ABANDON_INSIGHTS_VIEW.json',
    'QUEUE_INTERACTION_DETAIL_VIEW.json',
    'QUEUE_PERFORMANCE_DETAIL_VIEW.json',
  ],
  SurveyFormIds: ['SURVEY_FORM_PERFORMANCE_DETAIL_VIEW.json'],
  UserIds: [
    'AGENT_EVALUATION_DETAIL_VIEW.json',
    'AGENT_INTERACTION_DETAIL_VIEW.json',
    'AGENT_PERFORMANCE_DETAIL_VIEW.json',
    'AGENT_STATUS_DETAIL_VIEW.json',
    'AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW.json',
    'INTERACTION_SEARCH_VIEW.json',
  ],
  WithoutFilter: [
    'AGENT_DEVELOPMENT_DETAIL_ME_VIEW.json',
    'AGENT_DEVELOPMENT_DETAIL_ME_VIEW.json',
    'AGENT_DEVELOPMENT_DETAIL_VIEW.json',
    'AGENT_DEVELOPMENT_SUMMARY_VIEW.json',
    'AGENT_EVALUATION_SUMMARY_VIEW.json',
    'AGENT_PERFORMANCE_SUMMARY_VIEW.json',
    'AGENT_STATUS_SUMMARY_VIEW.json',
    
    'BOT_PERFORMANCE_DETAIL_VIEW.json',
    'BOT_PERFORMANCE_SUMMARY_VIEW.json',
    'CONTENT_SEARCH_VIEW.json',
    'FLOW_DESTINATION_SUMMARY_VIEW.json',
    'FLOW_OUTCOME_SUMMARY_VIEW.json',
    'IVR_PERFORMANCE_SUMMARY_VIEW.json',
    'JOURNEY_ACTION_MAP_SUMMARY_VIEW.json',
    'JOURNEY_OUTCOME_SUMMARY_VIEW.json',
    'JOURNEY_SEGMENT_SUMMARY_VIEW.json',
    'QUEUE_PERFORMANCE_SUMMARY_VIEW.json',
    'SCHEDULED_CALLBACKS_VIEW.json',
    'SKILLS_PERFORMANCE_VIEW.json',
  ],
  WrapUpCodes: ['WRAP_UP_PERFORMANCE_SUMMARY_VIEW.json'],
  AgentWrap:['AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW.json']
}
mediatypes = ["voice","chat","email","message"]
withMediatype = ['QUEUE_PERFORMANCE_DETAIL_VIEW.json',
'QUEUE_PERFORMANCE_SUMMARY_VIEW.json',
'AGENT_PERFORMANCE_DETAIL_VIEW.json',
'AGENT_STATUS_DETAIL_VIEW.json']
const filter = {

}
let opts = {
  pageSize: 25,
  pageNumber: 1,
}
let optsF = {}
const second = 1000
async function pipeLoader(token) {
  await getUserProfile()
  await getQueue()
  //getFlow()
  // getFlowMilestone()
  // getFlowOutCome()
  // getSurvey()
  // getDid()
  // getWrapUp()
 
  // await exportAgentWrap()
  // await sleep(100 * second)
  // await exportFlowOutcome()
  // await sleep(100 * second)
  // await exportFlowIdwith()
  // await sleep(100 * second)
  // await exportDnis()
  // await sleep(100 * second)
  // await exportFlowId()
  // await sleep(100 * second)
  // await exportFlowMileStone()
  await sleep(50*second)
   await export_AGENT_STATUS_DETAIL_VIEW()
   await sleep(100*second)
 await export_AGENT_PERFORMANCE_DETAIL_VIEW()
 await sleep(100*second)
   await export_INTERACTION_SEARCH_VIEW()
   await sleep(100*second)
   await export_QUEUE_INTERACTION_DETAIL_VIEW()
   await sleep(100*second)
   await export_AGENT_STATUS_SUMMARY_VIEW()
   await sleep(100*second)
   await export_QUEUE_PERFORMANCE_SUMMARY_VIEW()
   await sleep(100*second)
  await export_INTERACTION_SEARCH_VIEW()
  await sleep(100*second)
  // await sleep(100 * second)
  // await exportUser()
  // await sleep(100 * second)
  // await exportQueue()
  // await sleep(100 * second)
  // await exportSurvey()
  // await sleep(100 * second)
  // await exportFilterQueues()
  // await sleep(100 * second)
  // await exportWrapUp()
  //await sleep(100 * sleep)
  //await exportNoFilter()
}
async function getUserProfile(body) {
  let userInstance = new platformClient.UsersApi()
  await userInstance
    .getUsers(opts)
    .then((data) => {
      LoopUser(data, body)
    })
    .catch((e) => console.error(e))
}
async function getQueue(body) {
  let queueInstance = new platformClient.RoutingApi()
  await queueInstance
    .getRoutingQueues(opts)
    .then((data) => {
      LoopQueue(data, body)
    })
    .catch((e) => console.error(e))
}
function getFlow(body) {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlows(opts)
    .then((data) => {
      LoopFlow(data, body)
    })
    .catch((e) => console.error(e))
}
function getFlowMilestone(body) {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlowsMilestones(opts)
    .then((data) => {
      LoopFlowMilestone(data, body)
    })
    .catch((e) => console.error(e))
}
function getFlowOutCome(body) {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlowsOutcomes(opts)
    .then((data) => {
      LoopFlowOutcome(data, body)
    })
    .catch((e) => console.error(e))
}
function getDid(body) {
  let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
  teleInstance
    .getTelephonyProvidersEdgesDids(opts)
    .then((data) => {
      LoopDid(data, body)
    })
    .catch((e) => console.error(e))
}
function getWrapUp(body) {
  let wrapInstance = new platformClient.RoutingApi()
  wrapInstance
    .getRoutingWrapupcodes(opts)
    .then((data) => {
      LoopWrapUp(data, body)
    })
    .catch((e) => console.error(e))
}
function LoopWrapUp(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      wrapup.push(entry.id)
    })
    opts.pageNumber = opts.pageNumber + 1
    getWrapUp(body)
  }
}
function getSurvey(body) {
  let wrapInstance = new platformClient.QualityApi()
  wrapInstance
    .getQualityFormsSurveys(opts)
    .then((data) => {
      LoopSurvey(data, body)
    })
    .catch((e) => console.error(e))
}
function LoopSurvey(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      survey.push(entry.id)
    })
    opts.pageNumber = opts.pageNumber + 1
    getSurvey(body)
  }
}
function LoopDid(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      did.push(entry.id)
    })
    opts.pageNumber = opts.pageNumber + 1
    getDid(body)
  }
}
function LoopFlow(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flow.push(entry.id)
    })

    opts.pageNumber = opts.pageNumber + 1
    getFlow(body)
  }
}
function LoopFlowOutcome(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flowOutcome.push(entry.id)
    })
    opts.pageNumber = opts.pageNumber + 1
    getFlowOutCome(body)
  }
}
function LoopFlowMilestone(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flowMileStone.push(entry.id)
    })

    opts.pageNumber = opts.pageNumber + 1
    getFlow(body)
  }
}
function LoopQueue(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      queue.push(entry.id)
    })

    opts.pageNumber = opts.pageNumber + 1
    getQueue(body)
  }
}
function LoopUser(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach(async (entry) => {
      user.push(entry.id)
    })
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile(body)
  }
}
async function exportUser() {
  logger.info('Exporting viewtype with UserId')
  await sleep(1000)
  await process()
  async function process() {
    for  (const component of filter.UserIds) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/UserIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
      const array = withMediatype
      for (const userid of user){
        if( array.includes(component)){
          mediatypes.map(async(media)=>{
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            exportdata(payload)
          })
        }
        else{
          const id = uuid.v4()
          Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
          Object.assign(payload, {
                interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
                })
          Object.assign(payload.filter, {userIds: [`${userid}`]})
         exportdata(payload)
        }
      }
    }
  }
}
async function export_AGENT_STATUS_DETAIL_VIEW(){
  logger.info("Exporting AGENT_STATUS_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_STATUS_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      const array = withMediatype
      for await (const userid of user){
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            exportdata(payload)
          }
      }
  }
}
async function export_AGENT_PERFORMANCE_DETAIL_VIEW(){
  logger.info("Exporting AGENT_PERFORMANCE_DETAIL_VIEW")
  process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
      const array = withMediatype
      for await (const userid of user){
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            exportdata(payload)
          }
      }
  }
}
async function export_INTERACTION_SEARCH_VIEW(){
  logger.info("Exporting INTERACTION_SEARCH_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/INTERACTION_SEARCH_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      const array = withMediatype
      for await (const userid of user){
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            exportdata(payload)
          }
      }
  }
}
async function export_QUEUE_INTERACTION_DETAIL_VIEW(){
  logger.info("Exporting QUEUE_INTERACTION_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/QueueIds/QUEUE_INTERACTION_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      const array = withMediatype
      for await (const queueid of queue){
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {queueIds: [`${queueid}`]})
            exportdata(payload)
          }
      }
  }
}
async function export_QUEUE_PERFORMANCE_DETAIL_VIEW(){
  logger.info("Exporting QUEUE_PERFORMANCE_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/QueueIds/QUEUE_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      const array = withMediatype
      for await (const queueid of queue){
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {queueIds: [`${queueid}`]})
            exportdata(payload)
          }
      }
  }
}
async function export_AGENT_STATUS_SUMMARY_VIEW(){
  logger.info("Exporting AGENT_STATUS_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + '/../Payload/WithoutFilter/AGENT_STATUS_SUMMARY_VIEW.json',
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
    exportdata(payload)
  }
}
async function export_QUEUE_PERFORMANCE_SUMMARY_VIEW(){
  logger.info("Exporting QUEUE_PERFORMANCE_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + '/../Payload/WithoutFilter/QUEUE_PERFORMANCE_SUMMARY_VIEW.json',
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
    exportdata(payload)
}
}
async function exportQueue() {
  logger.info('Exporting viewtype with QueueIds')
  await sleep(1000)
  await process()
  async function process() {
    for await (const component of filter.QueueIds) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/QueueIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const queueid of queue) {
        const array = withMediatype
        if(await array.includes(component)){
          mediatypes.map(async(media)=>{
            const id = uuid.v4()
          payload.filter.mediaTypes = [media]
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { queueIds: [`${queueid}`] })
        exportdata(payload)
          })
        }
        else{
          const id = uuid.v4()
          Object.assign(payload, {
            name: `${payload.viewType}_${datetime}_${id}`,
          })
          Object.assign(payload.filter, { queueIds: [`${queueid}`] })
          await exportdata(payload)
        }
      }
    }
  }
}
async function exportFlowIdwith() {
  logger.info('Exporting viewtype with individual FlowId')
  await sleep(1000)
  await process()
  async function process() {
    for await (const component of filter.FlowIdsMulti) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/FlowIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const flowid of flow) {
        const id = uuid.v4()
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        exportdata(payload)
      }
    }
  }
}
async function exportFlowId() {
  logger.info('Exporting viewtype with FlowIds')
  await sleep(1000)
  for (const component of filter.FlowIds) {
    const id = uuid.v4()
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/FlowIds/${component}`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    Object.assign(payload.filter.flowIds, flow)
    exportdata(payload)
  }
}
async function exportSurvey() {
  logger.info('Exporting viewtype with SurveyFormIds')
  await sleep(1000)
  for (const component of filter.SurveyFormIds) {
    const id = uuid.v4()
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/SurveyFormIds/${component}`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    Object.assign(payload.filter.surveyFormIds, survey)
    exportdata(payload)
  }
}
async function exportWrapUp() {
  logger.info('Exporting viewtype with WrapUpCodes')
  await sleep(1000)
  for (const component of filter.WrapUpCodes) {
    const id = uuid.v4()
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WrapUpCodes/${component}`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    Object.assign(payload.filter.WrapUpCodes, wrapup)
    exportdata(payload)
  }
}
async function exportFlowMileStone() {
  logger.info('Exporting viewtype with FlowMileStoneId')
  await sleep(1000)
  await process()
  async function process() {
    for await (const component of filter.FlowMileStone) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/FlowIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      Object.assign(payload.filter, { flowMilestoneIds: [`${flowMileStone}`] })
      for await (const flowid of flow) {
        const id = uuid.v4()
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        exportdata(payload)
      }
    }
  }
}
async function exportFlowOutcome() {
  logger.info('Exporting viewtype with FlowOutcome')
  await sleep(1000)
  process()

  async function process() {
    for (const component of filter.FlowOutCome) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/FlowIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for (const flowid of flow) {
        const id = uuid.v4()
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        Object.assign(payload.filter.flowOutcomeIds, [`${flowOutcome[0]}`])
        exportdata(payload)
      }
    }
  }
}
async function exportDnis() {
  logger.info('Exporting viewtype with Directions')
  await sleep(1000)
  await process()
  async function process() {
    for await (const component of filter.Dnis) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/Directions/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      if (payload.viewType == 'DNIS_PERFORMANCE_DETAIL_VIEW') {
        console.log('exporting with dnislist')
        Object.assign(payload.filter, { dnisList: [`${did}`] })
      }
      for await (const direction of directions) {
        const id = uuid.v4()
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { directions: [`${direction}`] })
        exportdata(payload)
      }
    }
  }
}
async function exportFilterQueues() {
  await sleep(1000)
  await process()
  async function process() {
    logger.info('Exporting viewtype with FilterbyQueueId')
    for await (const component of filter.QueuesByUserIds) {
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/FilterQueuesbyUserIds/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const userid of user) {
        const id = uuid.v4()
        Object.assign(payload, {
          name: `${payload.viewType}_${datetime}_${id}`,
        })
        Object.assign(payload.filter, { filterQueuesByUserIds: [`${userid}`] })
        exportdata(payload, userid)
      }
    }
  }
}
async function exportNoFilter() {
  await sleep(1000)
  logger.info('Exporting viewtype without filters')
  for await (const component of filter.WithoutFilter) {
    const id = uuid.v4()
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/${component}`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    exportdata(payload)
  }
}
async function exportAgentWrap(){
  logger.info('Exporting viewtype with UserID and WrapUp')
  await sleep(1000)
  await process()
  async function process() {
    for await (const component of filter.AgentWrap) {
      const id = uuid.v4()
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/AgentWrapUp/${component}`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
      Object.assign(payload.filter.userIds, user)
      Object.assign(payload.filter.WrapUpCodes, wrapup)
      console.log(payload)
      exportdata(payload)
    }
  }
}
async function exportdata(payload) {
   apiInstance
    .postAnalyticsReportingExports(payload)
    .then(() => {
      logger.info(`Done Exporting ${payload.viewType}`)
    })
    .catch((err) => {
      logger.error(`Failed at ${payload.viewType}`)
      logger.error(err)
    })
}

module.exports = pipeLoader
