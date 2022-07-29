const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs')
const logger = require('../logger.js')

const userAct = []
let i = 0
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
      res = response.data
      numberofLoops = Math.floor(res.totalHits/opts.paging.pageSize)
      addCheck = numberofLoops%1!=0
      if(addCheck=true){
        numberofLoops=numberofLoops+1
      }
      for(i=0;i<numberofLoops;i++)
      {
        const csv = json2csvParser.parse(res);
        fs.writeFileSync(`./ISO_reports/ISO_User_Activities_Page_${i+1}${datetime}.csv`,csv)
        logger.info(`ISO_User_Activities_Page_${i+1} EXPORTED SUCCESSFULLY`)
      }
      
    })
    .catch((e) => logger.error(e))
}

module.exports = getUserAct
