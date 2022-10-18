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
const loggers = require('../Logger')
const eol = require('eol')
const sql_conn = require('../sql_conn')
let opts = {
  pageSize: 500,
  pageNumber: 1,
}

var groups = []
var members = []
var Sub = []


async function getGroup(token) {
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
      let createdDateTime = new Date();
      var viewType = "ISO_LIST_GROUP_ROLES"
      var filename = `ISO_LIST_GROUP_ROLES_${datetime}`
      fs.writeFileSync(`./reports/ISO_LIST_GROUP_ROLES_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
      loggers.info('ISO_LIST_GROUP_ROLES EXPORTED SUCCESSFULLY')
    })
    .catch((e) => console.error(e))
}

async function getSub(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
    headers: { Authorization: 'Bearer ' + token },
  })
    .then((response) => {
      Sub.push(response.data)
      const csv = subparser.parse(Sub)
      let createdDateTime = new Date();
      var viewType = "SUBJECT_LOOKUP"
      var filename = `SUBJECT_LOOKUP_${datetime}`
      fs.writeFileSync(`./reports/SUBJECT_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    })
    .catch((e) => loggers.error(e, "at SUBJECTS LOOKUP"))
}

async function getMember(token, id) {
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
      let createdDateTime = new Date();
      var viewType = "MEMBER_LOOKUP"
      var filename = `MEMBER_LOOKUP_${datetime}`
      fs.writeFileSync(`./reports/MEMBER_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    })
    .catch((e) => loggers.error(e, "at MEMBER_LOOKUP"))
}

module.exports = getGroup