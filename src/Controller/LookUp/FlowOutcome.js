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

var FlowsOutcome = []
async function load(token){
    client.setAccessToken(token)
    getFlowsOutcome()
}
async function getFlowsOutcome() {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlowsOutcomes(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      FlowsOutcome.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getFlowsOutcome()
  }
  else{
    toCsv.main(FlowsOutcome,'FLOWOUTCOME_LOOKUP',datetime)
  }
}

module.exports = load