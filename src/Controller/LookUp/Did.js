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
const loggers = require('../Logger')
let createdDateTime = new Date();
const platformClient = require('purecloud-platform-client-v2')
const BlobUpload = require('../sql_conn')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}

var did= []
async function load(token){
    client.setAccessToken(token)
    getTelephonyProvidersEdgesDid()
}
async function getTelephonyProvidersEdgesDid() {
  let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
  teleInstance
    .getTelephonyProvidersEdgesDids(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      did.push(entry)
    })
    const csv = json2csvParser.parse(did)
    var viewType = "DID_LOOKUP"
    var filename = `DID_LOOKUP_${datetime}`
    fs.writeFileSync(`./reports/DID_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
    loggers.info('DID_LOOKUP EXPORTED SUCCESSFULLY')
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
    opts.pageNumber = opts.pageNumber + 1
    getTelephonyProvidersEdgesDid()
  }
}
module.exports = load