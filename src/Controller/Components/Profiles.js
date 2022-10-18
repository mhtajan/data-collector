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
const eol = require('eol')
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const sql_conn = require('../sql_conn')

let opts = {
  pageSize: 25, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}

var user = []

async function getUserProfile(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body },
    params: opts,
  })
    .then((response) => {
      Loop(response.data, body)
    })
    .catch((e) => loggers.error(e))
}
function Loop(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      user.push(entry)
    })
    const csv = json2csvParser.parse(user)
    let createdDateTime = new Date();
    var viewType = "ISO_USER_PROFILE_REPORT"
    var filename = `ISO_USER_PROFILE_REPORT_${datetime}`
    fs.writeFileSync(`./reports/ISO_USER_PROFILE_REPORT_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info('ISO_USER_PROFILE_REPORT EXPORTED SUCCESSFULLY')
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile(body)
  }
}

module.exports = getUserProfile