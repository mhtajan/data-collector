const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Controller/Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../Controller/toCsv')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}

var survey= []
async function load(token){
    client.setAccessToken(token)
    getQualityFormsSurvey()
}
async function getQualityFormsSurvey() {
  let wrapInstance = new platformClient.QualityApi()
  wrapInstance
    .getQualityFormsSurveys(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      survey.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getQualityFormsSurvey()
  }
  else{
    toCsv.main(survey,'SURVEY_LOOKUP',datetime)
  }
}

module.exports = load