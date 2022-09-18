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

var inactive_users = []

function get_inactive(body) {
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
        fs.writeFileSync(
          './ISO_reports/ISO_inactive_users' + datetime + '.csv',
          csv,
        )
        loggers.info('ISO_Inactive_Users EXPORTED SUCCESSFULLY!')
      } catch(err) {
        loggers.info('There are no Inactive Users')
      }
    })
    .catch((e) => loggers.error(e))
}

module.exports = get_inactive