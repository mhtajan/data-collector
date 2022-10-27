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
const { backOff } = require("exponential-backoff");
var sql = require("mssql");
var dbConn = require("../../config");
const { sqlconfig } = require("../../config");
const sql_conn = require("../../sql_conn")
const sql_dl = require('../../downloader_sql')
const client = platformClient.ApiClient.instance
const params = new URLSearchParams()
client.setEnvironment('mypurecloud.jp')
let apiInstance = new platformClient.AnalyticsApi()
let validator = []
const user = []
const queue = []
const flow = []
const flowMileStone = []
const flowOutcome = []
const did = []
const directions = ['Inbound']
const survey = []
const wrapup = []
var counter = 0
var export_counter = 0; // counter for export

const second = 1000
let opts = {
  pageSize: 500,
  pageNumber: 1,
}
let optsqueue = {
  pageSize: 500,
  pageNumber: 1,
}
let optswrap = {
  pageSize: 500,
  pageNumber: 1,
}
let optsdid = {
  pageSize: 500,
  pageNumber: 1,
}
let optsflow = {
  pageSize: 500,
  pageNumber: 1,
}
let optsflowoutcome = {
  pageSize: 500,
  pageNumber: 1,
}
let optssurvey = {
  pageSize: 500,
  pageNumber: 1,
}
milestoneopts= {
  pageSize: 500,
  pageNumber: 1,
}
mediatypes = ["chat", "email", "message", "callback"]
async function load(acessToken) {
  await lookup()
  await sleep(5000)
  await export_AGENT_STATUS_SUMMARY_VIEW()
  await export_QUEUE_INTERACTION_DETAIL_VIEW()
  await export_AGENT_STATUS_DETAIL_VIEW()
  await export_AGENT_PERFORMANCE_DETAIL_VIEW()
  await export_INTERACTION_SEARCH_VIEW()
  await export_AGENT_INTERACTION_DETAIL_VIEW()
  await export_QUEUE_PERFORMANCE_DETAIL_VIEW()
  await export_AGENT_PERFORMANCE_SUMMARY_VIEW()
  await export_QUEUE_PERFORMANCE_SUMMARY_VIEW()
  await export_AGENT_QUEUE_DETAIL_VIEW()
  await export_QUEUE_AGENT_DETAIL_VIEW()
  await export_AGENT_EVALUATION_SUMMARY_VIEW()
  await export_AGENT_EVALUATION_DETAIL_VIEW()
  await export_FLOW_DESTINATION_SUMMARY_VIEW()
  await export_SKILLS_PERFORMANCE_VIEW()
  await export_SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW()
  await export_DNIS_PERFORMANCE_SUMMARY_VIEW()
  await export_ABANDON_INSIGHTS_VIEW()
  await export_AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW()
  await export_WRAP_UP_PERFORMANCE_SUMMARY_VIEW()
  await export_DNIS_PERFORMANCE_DETAIL_VIEW()
  await export_FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW()
  await export_FLOW_OUTCOME_SUMMARY_VIEW()
  await export_IVR_PERFORMANCE_DETAIL_VIEW()
  await export_IVR_PERFORMANCE_SUMMARY_VIEW()
  await export_SURVEY_FORM_PERFORMANCE_DETAIL_VIEW()
  await sleep(5*second)
  await postExport()
 //await sleep(60*second)
 // await retry()

}
async function lookup() {
  getUserProfile()
  getQueue()
  getWrapUp()
  getFlow()
  getFlowMilestone()
  getFlowOutCome()
  getSurvey()
async function getUserProfile() {
    let userInstance = new platformClient.UsersApi()
    await userInstance
      .getUsers(opts)
      .then((data) => {
        Loop(user,data,opts,getUserProfile)
      })
      .catch((e) => console.error(e))
  }
  async function getQueue() {
    let queueInstance = new platformClient.RoutingApi()
    await queueInstance
      .getRoutingQueues(optsqueue)
      .then((data) => {
        Loop(queue,data,optsqueue,getQueue)
      })
      .catch((e) => console.error(e))
  }
  async function getWrapUp() {
    let wrapInstance = new platformClient.RoutingApi()
    wrapInstance
      .getRoutingWrapupcodes(optswrap)
      .then((data) => {
        Loop(wrapup,data,optswrap,getWrapUp)
      })
      .catch((e) => console.error(e))
  }
  async function getDid() {
    let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
    teleInstance
      .getTelephonyProvidersEdgesDids(optsdid)
      .then((data) => {
        Loop(did,data,optsdid,getDid)
      })
      .catch((e) => console.error(e))
  }
  async function getFlow() {
    let flowInstance = new platformClient.ArchitectApi()
    flowInstance
      .getFlows(optsflow)
      .then((data) => {
        Loop(flow,data,optsflow,getFlow)
      })
      .catch((e) => console.error(e))
  }
  function getFlowOutCome(body) {
    let flowInstance = new platformClient.ArchitectApi()
    flowInstance
      .getFlowsOutcomes(optsflowoutcome)
      .then((data) => {
        Loop(flowOutcome,data,optsflowoutcome,getFlowOutCome)
      })
      .catch((e) => console.error(e))
  }
  async function getSurvey() {
    let wrapInstance = new platformClient.QualityApi()
    wrapInstance
      .getQualityFormsSurveys(optssurvey)
      .then((data) => {
        Loop(survey,data,optssurvey,getSurvey)
      })
      .catch((e) => console.error(e))
  }
  async function getFlowMilestone() {
    let flowInstance = new platformClient.ArchitectApi()
    flowInstance
      .getFlowsMilestones(milestoneopts)
      .then((data) => {
        Loop(flowMileStone,data,milestoneopts,getFlowMilestone)
      })
      .catch((e) => console.error(e))
  }
  function Loop(arr,res,opt,process) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach(async (entry) => {
        arr.push(entry.id)
      })
      opt.pageNumber = opt.pageNumber + 1
      process()
    }
  }
}
async function export_AGENT_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('AGENT_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/UserIds/AGENT_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
        Object.assign(payload.filter, { userIds: [`${userid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_AGENT_STATUS_DETAIL_VIEW() {
  await fileCheck('AGENT_STATUS_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_STATUS_DETAIL_VIEW")
    var jsonData = fs.readFileSync( __dirname + `/../Payload/UserIds/AGENT_STATUS_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for (const userid of user) {
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
      Object.assign(payload.filter, { userIds: [`${userid}`] })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_QUEUE_INTERACTION_DETAIL_VIEW() {
  await fileCheck('QUEUE_INTERACTION_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting QUEUE_INTERACTION_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/QueueIds/QUEUE_INTERACTION_DETAIL_VIEW.json` )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for await (const queueid of queue) {
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
      Object.assign(payload.filter, { queueIds: [`${queueid}`] })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_INTERACTION_SEARCH_VIEW() {
  await fileCheck('INTERACTION_SEARCH_VIEW', process)
  async function process() {
    logger.info("Exporting INTERACTION_SEARCH_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/UserIds/INTERACTION_SEARCH_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for await (const userid of user) {
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
      Object.assign(payload.filter, { userIds: [`${userid}`] })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_AGENT_STATUS_SUMMARY_VIEW() {
  await fileCheck('AGENT_STATUS_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_STATUS_SUMMARY_VIEW")
    var jsonData = fs.readFileSync( __dirname + '/../Payload/WithoutFilter/AGENT_STATUS_SUMMARY_VIEW.json')
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_AGENT_INTERACTION_DETAIL_VIEW() {
  await fileCheck('AGENT_INTERACTION_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_INTERACTION_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/UserIds/AGENT_INTERACTION_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for await (const userid of user) {
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
      Object.assign(payload.filter, { userIds: [`${userid}`] })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_QUEUE_PERFORMANCE_DETAIL_VIEW() {

  await fileCheck('QUEUE_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting QUEUE_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/QueueIds/QUEUE_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {interval: `${yesterday}T00:00:00/${datetime}T00:00:00`})
    for await (const queueid of queue) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
        Object.assign(payload.filter, { queueIds: [`${queueid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_AGENT_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('AGENT_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/AGENT_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_AGENT_EVALUATION_SUMMARY_VIEW() {
  await fileCheck('AGENT_EVALUATION_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_EVALUATION_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/AGENT_EVALUATION_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00`, })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_QUEUE_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('QUEUE_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting QUEUE_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/QUEUE_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_FLOW_DESTINATION_SUMMARY_VIEW() {
  await fileCheck('FLOW_DESTINATION_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_DESTINATION_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/FLOW_DESTINATION_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_SKILLS_PERFORMANCE_VIEW() {
  await fileCheck('SKILLS_PERFORMANCE_VIEW', process)
  async function process() {
    logger.info("Exporting SKILLS_PERFORMANCE_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/SKILLS_PERFORMANCE_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_DNIS_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('DNIS_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting DNIS_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/Directions/DNIS_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    payload.filter.mediaTypes = ['voice']
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_DNIS_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('DNIS_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting DNIS_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/Directions/DNIS_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    payload.filter.mediaTypes = ['voice']
    payload.filter.dnisList = did
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_AGENT_QUEUE_DETAIL_VIEW() {
  await fileCheck('AGENT_QUEUE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_QUEUE_DETAIL_VIEW_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FilterQueuesbyUserIds/AGENT_QUEUE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { filterQueuesByUserIds: [`${userid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_AGENT_EVALUATION_DETAIL_VIEW() {
  await fileCheck('AGENT_EVALUATION_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_EVALUATION_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/UserIds/AGENT_EVALUATION_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { userIds: [`${userid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_QUEUE_AGENT_DETAIL_VIEW() {
  await fileCheck('QUEUE_AGENT_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting QUEUE_AGENT_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FilterUsersByQueueIds/QUEUE_AGENT_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const queueid of queue) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { filterUsersByQueueIds: [`${queueid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_ABANDON_INSIGHTS_VIEW() {
  await fileCheck('ABANDON_INSIGHTS_VIEW', process)
  async function process() {
    logger.info("Exporting ABANDON_INSIGHTS_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/QueueIds/ABANDON_INSIGHTS_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const queueid of queue) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { queueIds: [`${queueid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/UserIds/AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        payload.filter.WrapUpCodes = [wrapup]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { userIds: [`${userid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_WRAP_UP_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('WRAP_UP_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting WRAP_UP_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WrapUpCodes/WRAP_UP_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      payload.filter.WrapUpCodes = [wrapup]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_FLOW_OUTCOME_SUMMARY_VIEW() {
  await fileCheck('FLOW_OUTCOME_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_OUTCOME_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/FLOW_OUTCOME_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_IVR_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('IVR_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting IVR_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/IVR_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const media of mediatypes) {
      const id = uuid.v4()
      payload.filter.mediaTypes = [media]
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_IVR_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('IVR_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting IVR_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FlowIds/IVR_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const flowid of flow) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FlowIds/FLOW_OUTCOME_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const flowid of flow) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_SURVEY_FORM_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('SURVEY_FORM_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting SURVEY_FORM_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/SurveyFormIds/SURVEY_FORM_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const surveyid of survey) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        payload.filter.surveyFormIds = [surveyid]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_BOT_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('BOT_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting BOT_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/BOT_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_BOT_PERFORMANCE_SUMMARY_VIEW() {
  await fileCheck('BOT_PERFORMANCE_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting BOT_PERFORMANCE_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/BOT_PERFORMANCE_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_CONTENT_SEARCH_VIEW() {
  await fileCheck('CONTENT_SEARCH_VIEW', process)
  async function process() {
    logger.info("Exporting CONTENT_SEARCH_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/CONTENT_SEARCH_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_JOURNEY_ACTION_MAP_SUMMARY_VIEW() {
  await fileCheck('JOURNEY_ACTION_MAP_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting JOURNEY_ACTION_MAP_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/JOURNEY_ACTION_MAP_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_JOURNEY_OUTCOME_SUMMARY_VIEW() {
  await fileCheck('JOURNEY_OUTCOME_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting JOURNEY_OUTCOME_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/JOURNEY_OUTCOME_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_JOURNEY_SEGMENT_SUMMARY_VIEW() {
  await fileCheck('JOURNEY_SEGMENT_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting JOURNEY_SEGMENT_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/JOURNEY_SEGMENT_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_SCHEDULED_CALLBACKS_VIEW() {
  await fileCheck('SCHEDULED_CALLBACKS_VIEW', process)
  async function process() {
    logger.info("Exporting SCHEDULED_CALLBACKS_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/SCHEDULED_CALLBACKS_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FlowIds/FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const flowid of flow) {
      for await (const milestone of flowMileStone) {
        const id = uuid.v4()
        payload.filter.flowMilestoneIds = [milestone]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW() {
  await fileCheck('FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FlowIds/FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const flowid of flow) {
      for await (const milestone of flowMileStone) {
        const id = uuid.v4()
        payload.filter.flowMilestoneIds = [milestone]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        Object.assign(payload.filter, { flowIds: [`${flowid}`] })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
}
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
async function fileCheck(viewtype, process) {
  sql.connect(sqlconfig).then((pool) => {
    pool
      .request()
      .query(`SELECT * FROM datasources where name='${viewtype}'`)
      .then(async (res) => {
        placeholder = res.recordset
        if(placeholder[0].is_active==true){
          logger.info(viewtype+" is active")
          process()
        }
        else{
          logger.info(viewtype+" is not active")
        }
      })
  });
}
async function postExport() {
	sql.connect(sqlconfig).then((pool) => {
    pool
		.request()
		// Get x number of records to send as post request to genesys
		.query(`Select top (${process.env.MAX_QUERY_LIMIT}) * from exports where is_exported = 0`, async function (err, res) {
			if (err) {
				logger.error("error");
				return (err, null);
			} else {
				console.log("counter:" + counter);
				await sleep(5000); // is this needed as there is a sleep inside the if condition after this?
				if (res.recordset.length > 0) {

					if(counter>process.env.MAX_REPORT_LIMIT){
            console.log("Limit Reach counter:" + counter);
            await sql_dl()
          }
          else{
            await sleep(60000); // rate-limit avoidance
					// iterate in the x number of records captured from database
					for await (entry of res.recordset) {
						reportname = entry.report_name;
						// send post request to genesys
						exportdata(JSON.parse(entry.payload), entry.id);
					}
          counter = counter + export_counter;
          export_counter = 0;
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


module.exports = load