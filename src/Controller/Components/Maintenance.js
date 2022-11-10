const axios = require('axios').default
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [unwind({ blankOut: true }), flatten('__')],
})
const fs = require('fs')
const path = require('path')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const sql_conn = require('../sql_conn')
const eol = require('eol')
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
      if(arr.length>0)
      const csv = json2csvParser.parse(arr)
      let createdDateTime = new Date();
      var viewType = "ISO_SECURITY_MAINTENANCE_REPORT"
      var filename = `ISO_SECURITY_MAINTENANCE_REPORT_${datetime}`
      fs.writeFileSync(`./reports/ISO_SECURITY_MAINTENANCE_REPORT_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
      var path = process.cwd() + `\\reports\\` + filename
      var file_path = path + '.csv'
      var data = fs.readFileSync(file_path)
      var resp = data.toString().split('\n').length;
      const rowcount = resp - 2
      if (rowcount < 0) {
        rowcount = 0
      }
      await sql_conn.main(viewType, createdDateTime, filename, rowcount, file_path)
        .then((res) => {
        })
        .catch((ex) => logger.error(ex.message))
      loggers.info('ISO_SECURITY_MAINTENANCE_REPORT EXPORTED SUCCESSFULLY!')
    })
    .catch((e) => loggers.error(e))
}

module.exports = getMainteReport