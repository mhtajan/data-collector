const fetch = require(`node-fetch`)
const axios = require('axios')
const { Parser, transforms: { unwind, flatten } } = require('json2csv');
const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
const fs = require('fs');
const moment = require('moment');
const { group } = require('console');
var datetime = moment().format('YYYY_MM_DD')

let opts = {
  pageSize: 500,
  pageNumber: 1,
}
var groups =[]
var members =[]
function isoDL(token) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/groups',
    headers: { Authorization: 'Bearer ' + token.access_token },
    params: opts,
  })
    .then((response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach((entry) => {
          groups.push(entry)
          getSub(token, entry.id)
          getMember(token, entry.id)
        })    
        opts.pageNumber = opts.pageNumber + 1
        isoDL(token)
      }
      const csv = json2csvParser.parse(groups);
        fs.writeFileSync(`./ISO_reports/ISO_GroupRoles_${datetime}.csv`,csv) 
      //console.log(placeholder)
        
    })
    .catch((e) => console.error(e))
}

function getSub(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
    headers: { Authorization: 'Bearer ' + token.access_token },
  })
    .then((response) => {
      //console.log(response.data)
      res = response.data
      const csv = json2csvParser.parse(res);
        fs.writeFileSync(`./ISO_reports/ISO_Subjects_${datetime}.csv`,csv) 
    })
    .catch((e) => console.error(e))
}

function getMember(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/groups/${id}/members`,
    headers: { Authorization: 'Bearer ' + token.access_token },
    params: opts,
  })
    .then((response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach((entry) => {
          //console.log(entry)
          members.push(entry)
        })
        opts.pageNumber = opts.pageNumber + 1
        getMember(token,id)
      }
      const csv = json2csvParser.parse(members);
      fs.writeFileSync(`./ISO_reports/ISO_Get_Member_${datetime}.csv`,csv) 
    })
    .catch((e) => console.error(e))
}

module.exports = isoDL
