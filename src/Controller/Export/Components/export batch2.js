const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const logger = require('../../Logger')
const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const sql_dl = require('../../downloader_sql')
var sql = require("mssql");
const { sqlconfig, dbConn } = require("../../config");

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
mediatypes = ["chat", "email", "message", "callback"]
async function load(acessToken) {
  await lookup()
  await sleep(5000)
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
  await export_BOT_PERFORMANCE_DETAIL_VIEW()
  await export_BOT_PERFORMANCE_SUMMARY_VIEW()
  await export_CONTENT_SEARCH_VIEW()
  await export_FLOW_MILESTONE_PERFORMANCE_DETAIL_VIEW()
  await export_FLOW_MILESTONE_PERFORMANCE_INTERVAL_DETAIL_VIEW()
  await export_JOURNEY_ACTION_MAP_SUMMARY_VIEW()
  await export_JOURNEY_OUTCOME_SUMMARY_VIEW()
  await export_JOURNEY_SEGMENT_SUMMARY_VIEW()
  await export_SCHEDULED_CALLBACKS_VIEW()
  await sleep(5 * second)
  await postExport()
}
async function lookup() {
  getUserProfile()
  getQueue()
  getWrapUp()
  getDid()
  async function getUserProfile() {
    let userInstance = new platformClient.UsersApi()
    await userInstance
      .getUsers(opts)
      .then((data) => {
        LoopUser(data)
      })
      .catch((e) => console.error(e))
  }
  async function getQueue() {
    let queueInstance = new platformClient.RoutingApi()
    await queueInstance
      .getRoutingQueues(optsqueue)
      .then((data) => {
        LoopQueue(data)
      })
      .catch((e) => console.error(e))
  }
  async function getWrapUp() {
    let wrapInstance = new platformClient.RoutingApi()
    wrapInstance
      .getRoutingWrapupcodes(optswrap)
      .then((data) => {
        LoopWrapUp(data)
      })
      .catch((e) => console.error(e))
  }
  async function getDid() {
    let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
    teleInstance
      .getTelephonyProvidersEdgesDids(optsdid)
      .then((data) => {
        LoopDid(data)
      })
      .catch((e) => console.error(e))
  }
  function LoopQueue(res) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach((entry) => {
        queue.push(entry.id)
      })

      optsqueue.pageNumber = optsqueue.pageNumber + 1
      getQueue()
    }
  }
  function LoopUser(res) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach(async (entry) => {
        user.push(entry.id)
      })
      opts.pageNumber = opts.pageNumber + 1
      getUserProfile()
    }
  }
  function LoopWrapUp(res) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach((entry) => {
        wrapup.push(entry.id)
      })
      optswrap.pageNumber = optswrap.pageNumber + 1
      getWrapUp()
    }
  }
  function LoopDid(res) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach((entry) => {
        did.push(entry.id)
      })
      optsdid.pageNumber = optsdid.pageNumber + 1
      getDid()
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
      .query("Select top (200) * from exports where is_exported = 0", async function (err, res) {
        if (err) {
          logger.error("error")
          return (err, null);
        } else {
          await sleep(10000)
          //console.log(res.recordset.length) number of record checker
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