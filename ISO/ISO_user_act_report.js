const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs')
const path = require('path')

const opts = {
  interval: '2022-07-26T08:00:00/2022-07-27T08:00:00', //test 1 day interval
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
      res = response.data
        const csv = json2csvParser.parse(res);
        fs.writeFileSync(`./ISO_reports/ISO_User_Activities_${datetime}.csv`,csv)
        //console.log("ISO_User_Activities EXPORTED SUCCESSFULLY!")  
    })
    .catch((e) => console.error(e))
}

module.exports = getUserAct
