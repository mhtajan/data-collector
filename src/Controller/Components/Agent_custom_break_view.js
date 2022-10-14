const axios = require('axios').default
const moment = require(`moment`)
let createdDateTime = new Date();
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const eol = require('eol')
const {
    Parser,
    transforms: { unwind, flatten }  
  } = require('json2csv')
//   const json2csvParser = new Parser({
//     transforms: [unwind({ blankOut: true }), flatten('__')],
//   })

const json2csvParser = new Parser({
    transforms: [
      unwind({ paths: ['fieldToUnwind'], blankOut: false }),
      flatten({ objects: true, arrays: true, separator: "_"}),
      flatten('__')
    ]
  })

const fs = require('fs')
const loggers = require('../Logger')

const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const BlobUpload = require('../sql_conn')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

user = []
let opts = {
    pageSize: 500,
    pageNumber: 1,
  }
template = {
    "type": "dimension",
    "dimension": "userId",
    "operator": "matches"
}
array = []
jsonPayload = {
        "interval": `${yesterday}T00:00:00.000Z/${datetime}T00:00:00.000Z`,
        "groupBy": [
         "userId"
        ],  
        "filter": {
            "type": "or",
            "predicates": [
        
            ]
          },
        "metrics": [
         "tOrganizationPresence"
        ]
}
async function load(token){
    client.setAccessToken(token)
    await getUserProfile(token)
    await sleep(2000)
    await AgentCustom(token)
}

function getUserProfile(body) {
    let userInstance = new platformClient.UsersApi()
    userInstance
      .getUsers(opts)
      .then((data) => {
        LoopUser(data, body)
      })
      .catch((e) => console.error(e))
  }

function LoopUser(res, body) {
    if (res.pageCount >= res.pageNumber) {
      entities = res.entities
      entities.forEach(async (entry) => {
        user.push(entry.id)
      })
      opts.pageNumber = opts.pageNumber + 1
      getUserProfile(body)
    }
  }

function AgentCustom(token){
    user.map((entry, index) => {
        array.push({
          "type": "dimension",
          "dimension": "userId",
          "operator": "matches",
          "value": `${entry}`
        })    
      })
      Object.assign(jsonPayload.filter.predicates, array)
    GetApi(token,jsonPayload)
}
async function GetApi(token,jsonPayload){
    let apiInstance = new platformClient.AnalyticsApi();
    apiInstance.postAnalyticsUsersAggregatesQuery(jsonPayload)
    .then(async(response)=>{
        res = response.data
        const csv = json2csvParser.parse(response.results)
        String(eol.lf)
        
        var viewType = "AGENT_CUSTOM_BREAK_VIEW"
        var filename = `AGENT_CUSTOM_BREAK_VIEW_${datetime}`
        fs.writeFileSync(`./reports/AGENT_CUSTOM_BREAK_VIEW_${datetime}.csv`,`${eol.split(csv).join(eol.lf)}\n`)
        var path = process.cwd() + `\\reports\\` + filename
        var file_path = path + '.csv'
        var data = fs.readFileSync(file_path)
        var resp = data.toString().split('\n').length;
        const rowcount = resp - 2
        if (rowcount<0){
          rowcount = 0
        }
        await BlobUpload.main(viewType,createdDateTime,filename,rowcount,file_path)
        .then((res)=>{
        })
        .catch((ex)=> logger.error(ex.message))
        loggers.info('Done Exporting AGENT_CUSTOM_BREAK_VIEW')
    }).catch((e)=> loggers.error(e,"at AGENT_CUSTOM_BREAK_VIEW"))
}

module.exports = load