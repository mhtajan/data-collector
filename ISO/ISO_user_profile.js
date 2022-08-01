const axios = require('axios').default
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const logger = require('../logger.js')

let opts = {
  pageSize: 25, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}

var user = []

function getUserProfile(body) {
  // Get the list of available users.
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body.access_token },
    params: opts,
  })
    .then((response) => {
      //increment and recursion to be added
      Loop(response.data, body)
    })
    .catch((e) => logger.error(e))
}
function Loop(res, body)
{
  if(res.pageCount>=res.pageNumber){
    user.push(res)
    opts.pageNumber = opts.pageNumber+1
    getUserProfile(body)
  }
    const csv = json2csvParser.parse(user);
    fs.writeFileSync(`./ISO_reports/ISO_User_Profile_${datetime}.csv`,csv)
    logger.info("ISO_User_Profile EXPORTED SUCCESSFULLY")
}
module.exports = getUserProfile
