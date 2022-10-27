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
const sql_dl = require('../../downloader_sql')
const { backOff } = require("exponential-backoff");
var sql = require("mssql");
var dbConn = require("../../config");
const { sqlconfig } = require("../../config");
const sql_conn = require("../../sql_conn")
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
  await sleep(7000)
   await export_AGENT_DEVELOPMENT_DETAIL_ME_VIEW()
   await export_AGENT_DEVELOPMENT_DETAIL_VIEW()
   await export_AGENT_DEVELOPMENT_SUMMARY_VIEW()
   await export_AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW()
  //await export_FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW()
  await sleep(5 * second)
  await postExport()
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
//batch 5
async function export_AGENT_DEVELOPMENT_SUMMARY_VIEW() {
  await fileCheck('AGENT_DEVELOPMENT_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_DEVELOPMENT_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/AGENT_DEVELOPMENT_SUMMARY_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
      for await (const mediatype of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [mediatype]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
  }
}
async function export_AGENT_DEVELOPMENT_DETAIL_VIEW() {
  await fileCheck('AGENT_DEVELOPMENT_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_DEVELOPMENT_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/AGENT_DEVELOPMENT_DETAIL_VIEW.json`)
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
async function export_AGENT_DEVELOPMENT_DETAIL_ME_VIEW() {
  await fileCheck('AGENT_DEVELOPMENT_DETAIL_ME_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_DEVELOPMENT_DETAIL_ME_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/WithoutFilter/AGENT_DEVELOPMENT_DETAIL_ME_VIEW.json`)
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
async function export_FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW() {
  await fileCheck('FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/FlowIds/FLOW_OUTCOME_PERFORMANCE_INTERVAL_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
        for await (const media of mediatypes) {
          const id = uuid.v4()
          payload.filter.flowOutcomeIds = flowOutcome
          payload.filter.mediaTypes = [media]
          payload.filter.flowIds = [flow[0]]
          Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
          sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
        }
      }
  }
async function export_AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW() {
  await fileCheck('AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW")
    var jsonData = fs.readFileSync(__dirname + `/../Payload/AgentWrapUp/AGENT_WRAP_UP_PERFORMANCE_INTERVAL_DETAIL_VIEW.json`)
    var payload = JSON.parse(jsonData)
    Object.assign(payload, { interval: `${yesterday}T00:00:00/${datetime}T00:00:00` })
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.wrapUpCodes = wrapup
        payload.filter.mediaTypes = [media]
        payload.filter.userIds = [userid]
        Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}


async function exportdata(payload, id) {
  apiInstance
    .postAnalyticsReportingExports(payload)
    .then(async () => {
      sql_conn.doneExport(payload.viewType, id)
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
        if (placeholder[0].is_active == true) {
          logger.info(viewtype + " is active")
          process()
        }
        else {
          logger.info(viewtype + " is not active")
        }
      })
  });
}
async function postExport() {
  sql.connect(sqlconfig).then((pool) => {
    return pool
      .request()
      .query("Select top (200)* from exports where is_exported = 0", async function (err, res) {
        if (err) {
          logger.error("error")
          return (err, null);
        } else {
          await sleep(10000)
          if (res.recordset.length > 0) {
            for await (entry of res.recordset) {
              reportname = entry.report_name
                exportdata(JSON.parse(entry.payload), entry.id)
            }
            await sleep(60000)
            await postExport()
          }
          else {
            logger.info("There is nothing to be exported")
            await sql_dl()
          }
          return (null, res);
        }
      });
  });
}

module.exports = load