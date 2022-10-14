const axios = require('axios').default
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const eol = require('eol')
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
let createdDateTime = new Date();
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const BlobUpload = require('../sql_conn')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}

var user = []
async function load(token){
    client.setAccessToken(token)
    getUserProfile()
}
async function getUserProfile() {
    let userInstance = new platformClient.UsersApi()
    userInstance
    .getUsers(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      user.push(entry)
    })
    const csv = json2csvParser.parse(user)
    var viewType = "USERID_LOOKUP"
    var filename = `USERID_LOOKUP_${datetime}`
    fs.writeFileSync(`./reports/USERID_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
    
    var path = process.cwd() + `\\reports\\` + filename
        var file_path = path + '.csv'
        var data = fs.readFileSync(file_path)
        var resp = data.toString().split('\n').length;
        const rowcount = resp - 2
        if (rowcount<0){
          rowcount = 0
        }
        BlobUpload.main(viewType,createdDateTime,filename,rowcount,file_path)
        .then((res)=>{
        })
        .catch((ex)=> logger.error(ex.message))
        loggers.info('USERID_LOOKUP EXPORTED SUCCESSFULLY')
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile()
  }
}

module.exports = load