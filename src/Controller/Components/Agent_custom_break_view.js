const axios = require('axios').default
const moment = require(`moment`)
let createdDateTime = new Date();
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const fs = require('fs')
const loggers = require('../Logger')
const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const BlobUpload = require('../sql_conn');
const toCsv = require('../toCsv');
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')
const obj = {
  results :[]
}
user = []
let opts = {
  pageSize: 500,
  pageNumber: 1,
}
template = {
  "type": "dimension",
  "dimension": "userId",
  "operator": "matches"
}
array = []
jsonPayload = {
  "interval": `${yesterday}T00:00:00.000Z/${datetime}T00:00:00.000Z`,
  "groupBy": [
    "userId"
  ],
  "filter": {
    "type": "or",
    "predicates": [

    ]
  },
  "metrics": [
    "tOrganizationPresence"
  ]
}
async function load(token) {
  client.setAccessToken(token)
  await getUserProfile(token)
  await sleep(2000)
  await AgentCustom(token)
}

function getUserProfile(body) {
  let userInstance = new platformClient.UsersApi()
  userInstance
    .getUsers(opts)
    .then((data) => {
      LoopUser(data, body)
    })
    .catch((e) => console.error(e))
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

async function AgentCustom(token) {
  user.map((entry, index) => {
    array.push({
      "type": "dimension",
      "dimension": "userId",
      "operator": "matches",
      "value": `${entry}`
    })
  })
  Object.assign(jsonPayload.filter.predicates, array)
  GetApi(token, jsonPayload)
}
async function GetApi(token, jsonPayload) {
  let apiInstance = new platformClient.AnalyticsApi();
  apiInstance.postAnalyticsUsersAggregatesQuery(jsonPayload)
    .then(async (response) => {
      res = response.data
      const arr = []
      await response.results.forEach(async(entry)=>{
        await entry.data.forEach(async(data)=>{
          await data.metrics.forEach(async(metric)=>{
            obj.results.push({UserId: `${entry.group.userId}`,
          Interval: `${data.interval}`,
          Metric: `${metric.metric}`,
          Qualifier: `${metric.qualifier}`,
          Stats_Sum: `${metric.stats.sum}`})
          })
        })
      })
      toCsv.main(obj.results,'AGENT_CUSTOM_BREAK_VIEW',datetime)
}).catch((e) => loggers.error(e))
}

module.exports = load