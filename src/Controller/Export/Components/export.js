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
const download = require('../../newDownloader')
const downloadr = require('../../Downloader')
const deletr = require('../../Delete')
const { backOff } = require("exponential-backoff");
var sql = require("mssql");
var dbConn = require("../../config");
const { sqlconfig } = require("../../config");
const sql_conn = require("../../sql_conn")
const { createPipelineFromOptions } = require('@azure/core-http')
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
mediatypes = ["chat", "email", "message", "callback"]
async function load(acessToken) {
  lookup()


  await sleep(5000)
  await export_AGENT_STATUS_SUMMARY_VIEW()
  await export_QUEUE_INTERACTION_DETAIL_VIEW()
  await export_AGENT_STATUS_DETAIL_VIEW()
  await export_AGENT_PERFORMANCE_DETAIL_VIEW()
  await export_INTERACTION_SEARCH_VIEW()
  await export_AGENT_INTERACTION_DETAIL_VIEW()
  await export_QUEUE_PERFORMANCE_DETAIL_VIEW()
  await sleep(5*second)
  postExport(acessToken)

}
async function lookup() {
  getUserProfile()
  getQueue()

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
}
async function export_AGENT_PERFORMANCE_DETAIL_VIEW() {
  await fileCheck('AGENT_PERFORMANCE_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_PERFORMANCE_DETAIL_VIEW")
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    for await (const userid of user) {
      for await (const media of mediatypes) {
        const id = uuid.v4()
        payload.filter.mediaTypes = [media]
        Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
        Object.assign(payload.filter, { userIds: [`${userid}`] })
        console.log(payload.id)
        sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
      }
    }
  }
}
async function export_AGENT_STATUS_DETAIL_VIEW() {
  await fileCheck('AGENT_STATUS_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_STATUS_DETAIL_VIEW")
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_STATUS_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
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
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/QueueIds/QUEUE_INTERACTION_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
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
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/INTERACTION_SEARCH_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    for await (const userid of user) {
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
      Object.assign(payload.filter, { userIds: [`${userid}`] })
      sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
    }
  }
}
async function export_AGENT_STATUS_SUMMARY_VIEW() {
  // process()
  await fileCheck('AGENT_STATUS_SUMMARY_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_STATUS_SUMMARY_VIEW")
    var jsonData = fs.readFileSync(
      __dirname + '/../Payload/WithoutFilter/AGENT_STATUS_SUMMARY_VIEW.json',
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
    const id = uuid.v4()
    Object.assign(payload, { name: `${payload.viewType}_${datetime.replaceAll("-", "_")}_${id.replaceAll("-", "_")}` })
    sql_conn.export(payload.viewType, JSON.stringify(payload), payload.name)
  }
}
async function export_AGENT_INTERACTION_DETAIL_VIEW() {

  await fileCheck('AGENT_INTERACTION_DETAIL_VIEW', process)
  async function process() {
    logger.info("Exporting AGENT_INTERACTION_DETAIL_VIEW")
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_INTERACTION_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
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
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/QueueIds/QUEUE_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
    })
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
async function exportdata(accessToken, payload, id) {
  apiInstance
    .postAnalyticsReportingExports(payload)
    .then(() => {
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
        placeholder = await res.recordset
        process()
      })
  });
}
async function postExport(accessToken) {
  sql.connect(sqlconfig).then((pool) => {
    return pool
      .request()
      .query("Select * from exports where is_exported = 0", async function (err, res) {
        if (err) {
          console.log("error:", err);
          return (err, null);
        } else {
          await sleep(5000)
          for await (entry of res.recordset) {
            reportname = entry.report_name
            exportdata(accessToken, JSON.parse(entry.payload), entry.id)

          }
          return (null, res);
        }
      });
  });
}
module.exports = load