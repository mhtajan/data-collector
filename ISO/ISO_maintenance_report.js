const axios = require('axios').default
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs');
const path = require('path')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const logger = require('../logger.js')

function getMainteReport(body){
    axios({
        method: 'get',
        url: 'https://apps.mypurecloud.jp/platform/api/v2/audits/query/servicemapping',
        headers: { 'Authorization': 'Bearer ' + body.access_token }
      }).then((response) => {
        res = response.data
        const csv = json2csvParser.parse(res);
        fs.appendFileSync(`./ISO_reports/ISO_Maintenance_Report_${datetime}.csv`,csv)
        logger.info("ISO_Maintenance_Report EXPORTED SUCCESSFULLY!")  
      }).catch(e => logger.error(e));
}

module.exports = getMainteReport