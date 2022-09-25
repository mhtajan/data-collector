const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [flatten({ objects: true, arrays: true })],
})
const fs = require('fs')
const loggers = require('../Logger')

const userAct = []
const opts = {
  interval: '2022-07-26T08:00:00/2022-07-27T08:00:00', //test 1 day interval
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
    .then(async(response) => {
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
    fs.writeFileSync(`./ISO_reports/ISO_User_Activities_${datetime}.csv`, csv)
    loggers.info(`ISO_User_Activities EXPORTED SUCCESSFULLY`)
  }
  return
}

module.exports = getUserAct