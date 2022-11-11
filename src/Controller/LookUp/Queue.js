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
}
Array.prototype.insert = function ( index, ...items ) {
  this.splice( index, 0, ...items );
};
var queue = []
async function load(token){
    client.setAccessToken(token)
    getQueue()
}
async function getQueue() {
  let queueInstance = new platformClient.RoutingApi()
  await queueInstance
    .getRoutingQueues(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      queue.push(entry)
    })
    opts.pageNumber = opts.pageNumber + 1
    getQueue()
  }
  else{
    const arr = []
    queue.forEach((entry,index)=>{
      arr.insert(index,{Id: `${entry.id}`,
      Name: `${entry.name}`,
      Division_id: `${entry.division.id}`,
      Division_name: `${entry.division.name}`,
      Date_created: `${entry.dateCreated}`,
      Date_modified: `${entry.dateModified}`,
      Created_by: `${entry.createdBy}`,
      Modified_by: `${entry.modifiedBy}`,
      Member_count: `${entry.memberCount}`,
      User_member_count: `${entry.userMemberCount}`,
      Joined_member_count: `${entry.joinedMemberCount}`,
      AcwSettings_wrapup_prompt: `${entry.acwSettings.wrapupPrompt}`,
      Skill_Evaluation_Method: `${entry.skillEvaluationMethod}`,
      Auto_answer_Only: `${entry.autoAnswerOnly}`,
      Enable_manual_assignment: `${entry.enableManualAssignment}`,
      })
      if(entry.mediaSettings.hasOwnProperty("call")){
        Object.assign(arr[index],{Media_Settings_Call_Alerting_Timeout_seconds: `${entry.mediaSettings.call.alertingTimeoutSeconds}`,
        Media_Settings_Call_Service_level_percentage: `${entry.mediaSettings.call.serviceLevel.percentage}`,
        Media_Settings_Call_Service_level_durationMs: `${entry.mediaSettings.call.serviceLevel.durationMs}`,})
      }
      if(entry.mediaSettings.hasOwnProperty("socialExpression")){
        Object.assign(arr[index],{Media_Settings_socialExpression_Alerting_Timeout_seconds: `${entry.mediaSettings.socialExpression.alertingTimeoutSeconds}`,
        Media_Settings_socialExpression_Service_level_percentage: `${entry.mediaSettings.socialExpression.serviceLevel.percentage}`,
        Media_Settings_socialExpression_Service_level_duratioMs: `${entry.mediaSettings.socialExpression.serviceLevel.durationMs}`,
        })
      }
      if(entry.mediaSettings.hasOwnProperty("chat")){
        Object.assign(arr[index],{Media_Settings_Chat_Alerting_Timeout_seconds: `${entry.mediaSettings.chat.alertingTimeoutSeconds}`,
        Media_Settings_Chat_Service_level_percentage: `${entry.mediaSettings.chat.serviceLevel.percentage}`,
        Media_Settings_Chat_Service_level_duratioMs: `${entry.mediaSettings.chat.serviceLevel.durationMs}`,
      })
      }
      if(entry.mediaSettings.hasOwnProperty("callback")){
        Object.assign(arr[index],{Media_Settings_Callback_Alerting_Timeout_seconds: `${entry.mediaSettings.callback.alertingTimeoutSeconds}`,
        Media_Settings_Callback_Service_level_percentage: `${entry.mediaSettings.callback.serviceLevel.percentage}`,
        Media_Settings_Callback_Service_level_duratioMs: `${entry.mediaSettings.callback.serviceLevel.durationMs}`,
        })
      }
      if(entry.mediaSettings.hasOwnProperty("message")){
        Object.assign(arr[index],{Media_Settings_Message_Alerting_Timeout_seconds: `${entry.mediaSettings.message.alertingTimeoutSeconds}`,
        Media_Settings_Message_Service_level_percentage: `${entry.mediaSettings.message.serviceLevel.percentage}`,
        Media_Settings_Message_Service_level_duratioMs: `${entry.mediaSettings.message.serviceLevel.durationMs}`,
        })
      }
      if(entry.mediaSettings.hasOwnProperty("videoComm")){
        Object.assign(arr[index],{Media_Settings_videoComm_Alerting_Timeout_seconds: `${entry.mediaSettings.videoComm.alertingTimeoutSeconds}`,
        Media_Settings_videoComm_Service_level_percentage: `${entry.mediaSettings.videoComm.serviceLevel.percentage}`,
        Media_Settings_videoComm_Service_level_duratioMs: `${entry.mediaSettings.videoComm.serviceLevel.durationMs}`,
      })
      }
      if(entry.mediaSettings.hasOwnProperty("email")){
        Object.assign(arr[index],{Media_Settings_Email_Alerting_Timeout_seconds: `${entry.mediaSettings.email.alertingTimeoutSeconds}`,
        Media_Settings_Email_Service_level_percentage: `${entry.mediaSettings.email.serviceLevel.percentage}`,
        Media_Settings_Email_Service_level_duratioMs: `${entry.mediaSettings.email.serviceLevel.durationMs}`,
      })
      }
      if(entry.hasOwnProperty("agentOwnedRouting")){
        Object.assign(arr[index],{Agent_Owned_Routing_enable_callback: `${entry.agentOwnedRouting.enableAgentOwnedCallbacks}`,
        Agent_Owned_Routing_max_owned_callback_hours: `${entry.agentOwnedRouting.maxOwnedCallbackHours}`,
        Agent_Owned_Routing_max_owned_callback_delay_hours: `${entry.agentOwnedRouting.maxOwnedCallbackDelayHours}`
      })
      }
    })
    const csv = json2csvParser.parse(arr)
    var viewType = "QUEUE_ID_LOOKUP"
        var filename = `QUEUE_ID_LOOKUP_${datetime}`
    fs.writeFileSync(`./reports/QUEUE_ID_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
    loggers.info('QUEUE_ID_LOOKUP EXPORTED SUCCESSFULLY')
  }
}

module.exports = load