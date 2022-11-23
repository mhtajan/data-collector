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

var wrapup= []
async function load(token){
    client.setAccessToken(token)
    getRoutingWrapupcode()
}
async function getRoutingWrapupcode() {
  let wrapInstance = new platformClient.RoutingApi()
  wrapInstance
    .getRoutingWrapupcodes(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      wrapup.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getRoutingWrapupcode()
  }
  else{
    toCsv.main(wrapup,'WRAPUP_LOOKUP',datetime)
  }
}

module.exports = load