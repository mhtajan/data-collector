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
const sql_conn = require('../sql_conn')
const sleep = require('sleep-promise')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}
var progress = []
var campid = []
var arrsss = []
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance;
client.setEnvironment('mypurecloud.jp')
async function getCampaign(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/outbound/campaigns',
    headers: { Authorization: 'Bearer ' + body },
    params: opts,
  })
    .then(async(response) => {
      entities = response.data.entities
      entities.forEach((entry) => {
        campid.push(entry)
      })
      await sleep(1000)
      tocsv(body)
    })
    .catch((e) => loggers.error(e))
}
function ifExist(obj,arr_el,ele){
  if(obj.hasOwnProperty(`${ele}`)){
    return arr_el
  }
  else{
   return ""
  }
}
function phoneList(obj){
  return obj.phoneColumns[0]
}
async function getP(obj,body){
  client.setAccessToken(body)
    let apiInstance = new platformClient.OutboundApi();
    await apiInstance.getOutboundCampaignProgress(obj).then(async(data)=>{
      await progress.push(data)
    }).catch((err)=>(loggers.info(err)))
}
async function tocsv(body){
  const arr = []
  const temparr = []
  await campid.forEach(async(entry)=>{
    await getP(entry.id,body)
    await arr.push({Id : `${entry.id}`,
  Name: `${entry.name}`,
  dateCreated: `${entry.dateCreated}`,
  dateModified: `${entry.dateModified}`,
  version: `${entry.version}`,
  ContactList_ID: `${(ifExist(entry,entry.contactList,`contactList`).id)}`,
  ContactList_Name: `${(ifExist(entry,entry.contactList,`contactList`).name)}`,
  Queue_ID: `${(ifExist(entry,entry.queue,`queue`).id)}`,
  Queue_Name: `${(ifExist(entry,entry.queue,`queue`).name)}`,
  Dialing_mode: `${entry.dialingMode}`,
  Script_Id: `${(ifExist(entry,entry.script,`script`).id)}`,
  Script_Name: `${(ifExist(entry,entry.script,`script`).name)}`,
  Site_ID: `${(ifExist(entry,entry.site,`site`).id)}`,
  Site_Name: `${(ifExist(entry,entry.site,`site`).name)}`,
  EdgeGroup_ID: `${(ifExist(entry,entry.edgeGroup,`edgeGroup`).id)}`,
  EdgeGroup_Name: `${(ifExist(entry,entry.edgeGroup,`edgeGroup`).name)}`,
  Campaign_Status: `${entry.campaignStatus}`,
  PhoneColumn_Name: `${phoneList(entry).columnName}`,
  PhoneColumn_Type: `${phoneList(entry).type}`,
  AbandonRate: `${entry.abandonRate}`,
  callAnalysisResponseSe_ID: `${(ifExist(entry,entry.callAnalysisResponseSet,`callAnalysisResponseSet`).id)}`,
  callAnalysisResponseSe_Name: `${(ifExist(entry,entry.callAnalysisResponseSet,`callAnalysisResponseSet`).name)}`,
  CallerName: `${entry.callerName}`,
  CallerAddress: `${entry.callerAddress}`,
  outboundLineCount: `${entry.outboundLineCount}`,
  skipPreviewDisabled: `${entry.skipPreviewDisabled}`,
  previewTimeOutSeconds: `${entry.previewTimeOutSeconds}`,
  singleNumberPreview: `${entry.singleNumberPreview}`,
  alwaysRunning: `${entry.alwaysRunning}`,
  contactSort_fieldName: `${(ifExist(entry,entry.contactSort,`contactSort`).fieldName)}`,
  contactSort_direction: `${(ifExist(entry,entry.contactSort,`contactSort`).direction)}`,
  contactSort_numeric: `${(ifExist(entry,entry.contactSort,`contactSort`).numeric)}`,
  noAnswerTimeout: `${entry.noAnswerTimeout}`,
  priority: `${entry.priority}`,
  division_ID: `${(ifExist(entry,entry.division,`division`).id)}`,
  division_Name: `${(ifExist(entry,entry.division,`division`).name)}`,
  dynamicContactQueueingSettings: `${(ifExist(entry,entry.dynamicContactQueueingSettings,`dynamicContactQueueingSettings`).sort)}`,
  numberOfContactsCalled: `${progress[progress.length-1].numberOfContactsCalled}`,
  totalNumberOfContacts: `${progress[progress.length-1].totalNumberOfContacts}`,
  percentage: `${progress[progress.length-1].percentage}`
})
  })
await sleep(2000)
const csv = json2csvParser.parse(arr)
    let createdDateTime = new Date();
    var viewType = "DAILY_UPLOAD_REPORT"
    var filename = `DAILY_UPLOAD_REPORT_${datetime}`
    fs.writeFileSync(`./reports/DAILY_UPLOAD_REPORT_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info('DAILY_UPLOAD_REPORT EXPORTED SUCCESSFULLY')
}

module.exports = getCampaign