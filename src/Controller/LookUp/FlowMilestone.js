const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../toCsv')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}

var flowMileStone = []
async function load(token){
    client.setAccessToken(token)
    getFlowMilestone()
}
async function getFlowMilestone() {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlowsMilestones(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flowMileStone.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getFlowMilestone()
  }
  else{
    toCsv.main(flowMileStone,'FLOWMILESTONE_LOOKUP',datetime)
  }
}

module.exports = load