const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../toCsv')
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
    arr.push({
    Id: ``,
    Name: ``,
    Division_Id: ``,
    Division_Name: ``,
    Type: ``,
    Active: ``,
    System: ``,
    Deleted: ``,
    lockedUser_id: ``,
    lockedUser_Name: ``,
    Saved_Version_id: ``,
    Saved_Version_name: ``,
    Saved_Version_commit_version: ``,
    Saved_Version_config_version: ``,
    Saved_Version_config_uri: ``,
    Publish_Version_id: ``,
    Publish_Version_Name: ``,
    Publish_Version_Commit_Version: ``,
    Publish_Version_config_version: ``,
    Publish_Version_secure: ``,
    Publish_Version_debug: ``,
    Publish_Version_createdBy: ``,
    Publish_Version_dateCreated: ``,
    Publish_Version_dateCheckedin: ``,
    Publish_Version_dataSaved: ``,
    Publish_Version_generation_ID: ``,
    Publish_Version_inputSchema_title: ``,
    Publish_Version_inputSchema_desc: ``,
    Publish_Version_inputSchema_Type: ``,
    Publish_Version_inputSchema_addtional_Properties: ``,
    Publish_Version_generation_ID: ``,
    Publish_Version_outputSchema_title: ``,
    Publish_Version_outputSchema_desc: ``,
    Publish_Version_outputSchema_Type: ``,
    Publish_Version_outputSchema_addtional_Properties: ``,
    })
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
    if(entry.hasOwnProperty("lockedUser")){
      Object.assign(arr[index+1],{lockedUser_id: `${entry.lockedUser.id}`,
      lockedUser_Name: `${entry.lockedUser.name}`,})
    }
    else{
      Object.assign(arr[index+1],{lockedUser_id: ``,
      lockedUser_Name: ``,})
    }
    if(entry.hasOwnProperty("savedVersion")){
      Object.assign(arr[index+1],{Saved_Version_id: `${entry.savedVersion.id}`,
      Saved_Version_name: `${entry.savedVersion.name}`,
      Saved_Version_commit_version: `${entry.savedVersion.commitVersion}`,
      Saved_Version_config_version: `${entry.savedVersion.configurationVersion}`,
      Saved_Version_config_uri: `${entry.savedVersion.configurationUri}`,})
    }
    else{
      Object.assign(arr[index+1],{Saved_Version_id: ``,
      Saved_Version_name: ``,
      Saved_Version_commit_version: ``,
      Saved_Version_config_version: ``,
      Saved_Version_config_uri: ``,})
    }
    if(entry.hasOwnProperty("publishedVersion")){
      Object.assign(arr[index+1],{Publish_Version_id: `${entry.publishedVersion.id}`,
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
    
    })
    arr.splice(0,1)
    toCsv.main(arr,'FLOW_LOOKUP',datetime)
  }
}

module.exports = load