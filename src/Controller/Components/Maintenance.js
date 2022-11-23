const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const toCsv = require('../toCsv')
var MainteArr = []

async function getMainteReport(body) {
  axios({
    method: 'get',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/audits/query/servicemapping',
    headers: { Authorization: 'Bearer ' + body },
  })
    .then(async(response) => {
      const arr = []
      MainteArr.push(response.data)
      MainteArr.forEach((services)=>{
        services.services.forEach((entry)=>{
          entry.entities.forEach((entity)=>{
            entity.actions.forEach((action)=>{
              arr.push({Service_name: `${entry.name}`,
            Entity_name: `${entity.name}`,
          Action: `${action}`})
            })
          })
        })
      })
      toCsv.main(arr,'ISO_SECURITY_MAINTENANCE_REPORT',datetime)
    })
    .catch((e) => loggers.error(e))
}

module.exports = getMainteReport