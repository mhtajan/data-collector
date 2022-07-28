const axios = require('axios').default
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs');
const moment = require('moment')
const path = require('path')
var datetime = moment().format('YYYY_MM_DD_hh')
var placeholder =[]

function get_inactive(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body.access_token },
  })
    .then((response) => {
      data = response.data
      entities = data.entities
      entities.forEach((entry) => {
       if (entry.state == 'inactive') {
          placeholder.push(entry)
          //console.log("ISO_inactive_users EXPORTED SUCCESSFULLY!")  
       }
      })
          //const csv = json2csvParser.parse(placeholder) 
          //will add catch error since there is no inactive entries this will result in error
          //fs.writeFileSync("./ISO_reports/ISO_inactive_users"+datetime+".csv",csv)
           
    })
    .catch((e) => console.error(e))
}

module.exports = get_inactive
