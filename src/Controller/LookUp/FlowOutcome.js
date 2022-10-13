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
const BlobUpload = require('../BlobUpload')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}

var FlowsOutcome = []
async function load(token){
    client.setAccessToken(token)
    getFlowsOutcome()
}
async function getFlowsOutcome() {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlowsOutcomes(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      FlowsOutcome.push(entry)
    })
    const csv = json2csvParser.parse(FlowsOutcome)
    var viewType = "FLOWOUTCOME_LOOKUP"
    var filename = `FLOWOUTCOME_LOOKUP_${datetime}`
    fs.writeFileSync(`./reports/FLOWOUTCOME_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info('FLOWOUTCOME_LOOKUP EXPORTED SUCCESSFULLY')
    opts.pageNumber = opts.pageNumber + 1
    getFlowsOutcome()
  }
}

module.exports = load