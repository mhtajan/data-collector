const axios = require('axios').default
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const fs = require('fs')
const moment = require('moment')
const path = require('path')
var datetime = moment().format('YYYY_MM_DD_hh')
const loggers = require('../Logger')
const eol = require('eol')
const sql_conn = require('../sql_conn')
var inactive_users = []

async function get_inactive(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body },
  })
    .then((response) => {
      data = response.data
      entities = data.entities
      entities.forEach((entry) => {
        if (entry.state == 'inactive') {
          inactive_users.push(entry)
        }
      })
      try {
        const csv = json2csvParser.parse(inactive_users)
        let createdDateTime = new Date();
        var viewType = "ISO_LIST_INACTIVE_USERS"
        var filename = `ISO_LIST_INACTIVE_USERS_${datetime}`
        fs.writeFileSync('./reports/ISO_LIST_INACTIVE_USERS' + datetime + '.csv', `${eol.split(csv).join(eol.lf)}\n`)
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
        loggers.info('ISO_Inactive_Users EXPORTED SUCCESSFULLY!')
      } catch (err) {
        loggers.info('There are no Inactive Users')
      }
    })
    .catch((e) => loggers.error(e))
}

module.exports = get_inactive