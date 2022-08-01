const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [unwind({ blankOut: true }), flatten('__')],
})
const fs = require('fs')
const logger = require('../logger.js')

const userAct = []
const opts = {
  interval: '2022-07-22T08:00:00/2022-07-27T08:00:00', //test 1 day interval
  paging: {
    pageSize: 100,
    pageNumber: 1,
  },
}
function getUserAct(body) {
  axios({
    method: 'post',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/analytics/users/details/query',
    headers: { Authorization: 'Bearer ' + body.access_token },
    data: opts,
  })
    .then((response) => {
      Loop(response.data, body)
    })
    .catch((e) => logger.error(e))
}
function Loop(res, body) {
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
    logger.info(`ISO_User_Activities EXPORTED SUCCESSFULLY`)
  }
  return
}
module.exports = getUserAct
