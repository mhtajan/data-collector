const fetch = require(`node-fetch`)
const axios = require('axios')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [flatten({ objects: true, arrays: true })],
})
const subparser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const memberparser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const logger = require('../logger.js')
const { workerData } = require('worker_threads')

let opts = {
  pageSize: 500,
  pageNumber: 1,
}

var groups = []
var members = []
var Sub = []


function getGroup(token) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/groups',
    headers: { Authorization: 'Bearer ' + token },
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
        getGroup(token)
      }
      const csv = json2csvParser.parse(groups)
      fs.writeFileSync(`./ISO_reports/ISO_GroupRoles_${datetime}.csv`, csv)
      logger.info('ISO_GroupRoles EXPORTED SUCCESSFULLY')
    })
    .catch((e) => logger.error(e))
}

function getSub(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
    headers: { Authorization: 'Bearer ' + token },
  })
    .then((response) => {
      Sub.push(response.data)
      const csv = subparser.parse(Sub)
      fs.writeFileSync(`./ISO_reports/ISO_Subjects_${datetime}.csv`, csv)
    })
    .catch((e) => logger.error(e,"at ISO GET SUBJECTS"))
}

function getMember(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/groups/${id}/members`,
    headers: { Authorization: 'Bearer ' + token },
    params: opts,
  })
    .then((response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach((entry) => {
          members.push(entry)
        })
        opts.pageNumber = opts.pageNumber + 1
        getMember(token, id)
      }
      const csv = memberparser.parse(members)
      fs.writeFileSync(`./ISO_reports/ISO_Get_Member_${datetime}.csv`, csv)
    })
    .catch((e) => logger.error(e,"at ISO GET MEMBER"))
}

module.exports = getGroup