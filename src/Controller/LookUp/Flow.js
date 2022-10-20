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

var flow = []
async function load(token){
    client.setAccessToken(token)
    getFlow()
}
async function getFlow() {
  let flowInstance = new platformClient.ArchitectApi()
  flowInstance
    .getFlows(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      flow.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getFlow()
  }
  else{
    const arr = []
    flow.forEach((entry,index)=>{
      arr.push({Id: `${entry.id}`,
    Name: `${entry.name}`,
    Division_Id: `${entry.division.id}`,
    Division_Name: `${entry.division.name}`,
    Type: `${entry.type}`,
    Active: `${entry.active}`,
    System: `${entry.system}`,
    Deleted: `${entry.deleted}`,
    })
    if(entry.hasOwnProperty("publishedVersion")){
      Object.assign(arr[index],{Publish_Version_id: `${entry.publishedVersion.id}`,
      Publish_Version_Name: `${entry.publishedVersion.name}`,
      Publish_Version_Commit_Version: `${entry.publishedVersion.commitVersion}`,
      Publish_Version_config_version: `${entry.publishedVersion.configurationVersion}`,
      Publish_Version_secure: `${entry.publishedVersion.secure}`,
      Publish_Version_debug: `${entry.publishedVersion.debug}`,
      Publish_Version_createdBy: `${entry.publishedVersion.createdBy.id}`,
      Publish_Version_dateCreated: `${entry.publishedVersion.dateCreated}`,
      Publish_Version_dateCheckedin: `${entry.publishedVersion.dateCheckedIn}`,
      Publish_Version_dataSaved: `${entry.publishedVersion.dateSaved}`,
      Publish_Version_generation_ID: `${entry.publishedVersion.generationId}`,
      Publish_Version_inputSchema_title: `${entry.publishedVersion.inputSchema.title}`,
      Publish_Version_inputSchema_desc: `${entry.publishedVersion.inputSchema.description}`,
      Publish_Version_inputSchema_Type: `${entry.publishedVersion.inputSchema.type}`,
      Publish_Version_inputSchema_addtional_Properties: `${entry.publishedVersion.inputSchema.additionalProperties}`,
      Publish_Version_generation_ID: `${entry.publishedVersion.generationId}`,
      Publish_Version_outputSchema_title: `${entry.publishedVersion.outputSchema.title}`,
      Publish_Version_outputSchema_desc: `${entry.publishedVersion.outputSchema.description}`,
      Publish_Version_outputSchema_Type: `${entry.publishedVersion.outputSchema.type}`,
      Publish_Version_outputSchema_addtional_Properties: `${entry.publishedVersion.outputSchema.additionalProperties}`,
      })
    }
    if(entry.hasOwnProperty("lockedUser")){
      Object.assign(arr[index],{lockedUser_id: `${entry.lockedUser.id}`,
      lockedUser_Name: `${entry.lockedUser.name}`,})
    }
    if(entry.hasOwnProperty("checkedinVersion")){
      Object.assign(arr[index],{CheckedInVersion_id: `${entry.checkedInVersion.id}`,
      CheckedInVersion_name: `${entry.checkedInVersion.name}`,
      CheckedInVersion_commitVersion: `${entry.checkedInVersion.commitVersion}`,
      CheckedInVersion_configVersion: `${entry.checkedInVersion.configurationVersion}`,
      CheckedInVersion_secure: `${entry.checkedInVersion.secure}`})
    }
    if(entry.hasOwnProperty("savedVersion")){
      Object.assign(arr[index],{Saved_Version_id: `${entry.savedVersion.id}`,
      Saved_Version_name: `${entry.savedVersion.name}`,
      Saved_Version_commit_version: `${entry.savedVersion.commitVersion}`,
      Saved_Version_config_version: `${entry.savedVersion.configurationVersion}`,
      Saved_Version_config_uri: `${entry.savedVersion.configurationUri}`,})
    }
    })
    const csv = json2csvParser.parse(arr)
    var viewType = "FLOW_LOOKUP"
    var filename = `FLOW_LOOKUP_${datetime}`
    fs.writeFileSync(`./reports/FLOW_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info('FLOW_LOOKUP EXPORTED SUCCESSFULLY')
  }
}

module.exports = load