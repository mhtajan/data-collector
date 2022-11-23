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

var did= []
async function load(token){
    client.setAccessToken(token)
    getTelephonyProvidersEdgesDid()
}
async function getTelephonyProvidersEdgesDid() {
  let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
  teleInstance
    .getTelephonyProvidersEdgesDids(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      did.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getTelephonyProvidersEdgesDid()
  }
  else{
    toCsv.main(did,'DID_LOOKUP',datetime)
  }
}
module.exports = load