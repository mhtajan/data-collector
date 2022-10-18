const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const eol = require('eol')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [flatten({ objects: true, arrays: true })],
})
const fs = require('fs')
const loggers = require('../Logger')
const sql_conn = require('../sql_conn')

const userAct = []
const opts = {
  interval: `${yesterday}T00:00:00.000Z/${datetime}T00:00:00.000Z`, //test 1 day interval
  paging: {
    pageSize: 100,
    pageNumber: 1,
  },
}

async function getUserAct(body) {
  axios({
    method: 'post',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/analytics/users/details/query',
    headers: { Authorization: 'Bearer ' + body },
    data: opts,
  })
    .then(async (response) => {
      Loop(response.data, body)
    })
    .catch((e) => console.error(e))
}
async function Loop(res, body) {
  numberofLoops = Math.floor(res.totalHits / 100) + 1
  if (opts.paging.pageNumber != numberofLoops) {
    userD = res.userDetails
    userD.forEach((user) => {
      userAct.push(user)
    })
    opts.paging.pageNumber = opts.paging.pageNumber + 1
    getUserAct(body)
  }
  if (opts.paging.pageNumber >= numberofLoops) {
    userD = res.userDetails
    userD.forEach((user) => {
      userAct.push(user)
    })
    csv = json2csvParser.parse(userAct)
    let createdDateTime = new Date();
    var viewType = "ISO_USER_ACTIVITY_REPORT"
    var filename = `ISO_USER_ACTIVITY_REPORT_${datetime}`
    fs.writeFileSync(`./reports/ISO_USER_ACTIVITY_REPORT_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info(`ISO_USER_ACTIVITY_REPORT EXPORTED SUCCESSFULLY`)
  }
  return
}

module.exports = getUserAct