const uuid = require('uuid')
const fs = require('fs')
const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const fetch = require('node-fetch')
const logger = require('../../Logger')
const axios = require('axios').default
const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const download = require('../../newDownloader')
const downloadr = require('../../Downloader')
const deletr = require('../../Delete')

const client = platformClient.ApiClient.instance
const params = new URLSearchParams()
client.setEnvironment('mypurecloud.jp')
let apiInstance = new platformClient.AnalyticsApi()

const user = []
const queue = []
const flow = []
const flowMileStone = []
const flowOutcome = []
const did = []
const directions = ['Inbound']
const survey = []
const wrapup = []
const second = 1000
let opts = {
    pageSize: 500,
    pageNumber: 1,
  }
  let optsqueue = {
    pageSize: 500,
    pageNumber: 1,
  }
  let optswrap = {
    pageSize: 500,
    pageNumber: 1,
  }
  let optsdid = {
    pageSize: 500,
    pageNumber: 1,
  }
mediatypes = ["chat","email","message","callback"]
async function load(){
    lookup()
    await sleep(5000)
    console.log(queue.length)
    await export_AGENT_PERFORMANCE_SUMMARY_VIEW()
    await sleep(100000)
    await export_QUEUE_PERFORMANCE_SUMMARY_VIEW()
    await sleep(100000)
    await export_AGENT_QUEUE_DETAIL_VIEW()
    await sleep(100*second)
    await export_QUEUE_AGENT_DETAIL_VIEW()
    await sleep(100*second)
    await export_AGENT_EVALUATION_SUMMARY_VIEW()
    await sleep(100*second)
    await export_AGENT_EVALUATION_DETAIL_VIEW()
    await sleep(100*second)
    await export_FLOW_DESTINATION_SUMMARY_VIEW()
    await sleep(100*second)
    await export_SKILLS_PERFORMANCE_VIEW()
    await sleep(100*second)
    await export_SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW()
    await sleep(100*second)
    await export_DNIS_PERFORMANCE_SUMMARY_VIEW()
    await sleep(100*second)
    await export_ABANDON_INSIGHTS_VIEW()
    await sleep(100*second)
    await export_AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW()
    await sleep(100*second)
    await export_WRAP_UP_PERFORMANCE_SUMMARY_VIEW()
    await sleep(100*second)
    await export_DNIS_PERFORMANCE_DETAIL_VIEW()
}
async function lookup(){
    getUserProfile()
    getQueue()
    getWrapUp()
    async function getUserProfile() {
        let userInstance = new platformClient.UsersApi()
        await userInstance
          .getUsers(opts)
          .then((data) => {
            LoopUser(data)
          })
          .catch((e) => console.error(e))
      }
    async function getQueue() {
        let queueInstance = new platformClient.RoutingApi()
        await queueInstance
          .getRoutingQueues(optsqueue)
          .then((data) => {
            LoopQueue(data)
          })
          .catch((e) => console.error(e))
      }
      async function getWrapUp() {
        let wrapInstance = new platformClient.RoutingApi()
        wrapInstance
          .getRoutingWrapupcodes(optswrap)
          .then((data) => {
            LoopWrapUp(data)
          })
          .catch((e) => console.error(e))
      }
      async function getDid() {
        let teleInstance = new platformClient.TelephonyProvidersEdgeApi()
        teleInstance
          .getTelephonyProvidersEdgesDids(optsdid)
          .then((data) => {
            LoopDid(data)
          })
          .catch((e) => console.error(e))
      }
      function LoopQueue(res) {
        if (res.pageCount >= res.pageNumber) {
          entities = res.entities
          entities.forEach((entry) => {
            queue.push(entry.id)
          })
      
          optsqueue.pageNumber = optsqueue.pageNumber + 1
          getQueue()
        }
      }
      function LoopUser(res) {
        if (res.pageCount >= res.pageNumber) {
          entities = res.entities
          entities.forEach(async (entry) => {
            user.push(entry.id)
          })
          opts.pageNumber = opts.pageNumber + 1
          getUserProfile()
        }
      }
      function LoopWrapUp(res) {
        if (res.pageCount >= res.pageNumber) {
          entities = res.entities
          entities.forEach((entry) => {
            wrapup.push(entry.id)
          })
          optswrap.pageNumber = optswrap.pageNumber + 1
          getWrapUp()
        }
      }
      function LoopDid(res) {
        if (res.pageCount >= res.pageNumber) {
          entities = res.entities
          entities.forEach((entry) => {
            did.push(entry.id)
          })
          optsdid.pageNumber = optsdid.pageNumber + 1
          getDid()
        }
      }
}
//batch2//
async function export_AGENT_PERFORMANCE_SUMMARY_VIEW(){
    logger.info("Exporting AGENT_PERFORMANCE_SUMMARY_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/WithoutFilter/AGENT_PERFORMANCE_SUMMARY_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })   
            for await (const media of mediatypes){
              const id = uuid.v4()
              payload.filter.mediaTypes = [media]
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              await exportdata(payload)
            }
    }
}
async function export_AGENT_EVALUATION_SUMMARY_VIEW(){
  logger.info("Exporting AGENT_EVALUATION_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/AGENT_EVALUATION_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
            const id = uuid.v4()
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
  }
}
async function export_QUEUE_PERFORMANCE_SUMMARY_VIEW(){
  logger.info("Exporting QUEUE_PERFORMANCE_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/QUEUE_PERFORMANCE_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_FLOW_DESTINATION_SUMMARY_VIEW(){
  logger.info("Exporting FLOW_DESTINATION_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/FLOW_DESTINATION_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_SKILLS_PERFORMANCE_VIEW(){
  logger.info("Exporting SKILLS_PERFORMANCE_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/SKILLS_PERFORMANCE_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW(){
  logger.info("Exporting SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WithoutFilter/SURVEY_FORM_PERFORMANCE_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_DNIS_PERFORMANCE_SUMMARY_VIEW(){
  logger.info("Exporting DNIS_PERFORMANCE_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/Directions/DNIS_PERFORMANCE_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_DNIS_PERFORMANCE_DETAIL_VIEW(){
  logger.info("Exporting DNIS_PERFORMANCE_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/Directions/DNIS_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })   
          for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            payload.filter.dnisList = [did]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            await exportdata(payload)
          }
  }
}
async function export_AGENT_QUEUE_DETAIL_VIEW(){
    logger.info("Exporting AGENT_QUEUE_DETAIL_VIEW_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/FilterQueuesbyUserIds/AGENT_QUEUE_DETAIL_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
        for await (const userid of user){
          for await (const media of mediatypes){
              const id = uuid.v4()
              payload.filter.mediaTypes = [media]
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              Object.assign(payload.filter, {filterQueuesByUserIds: [`${userid}`]})
              await exportdata(payload)
          }        
        }
    }
}
async function export_AGENT_EVALUATION_DETAIL_VIEW(){
  logger.info("Exporting AGENT_EVALUATION_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_EVALUATION_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const userid of user){
        for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            await exportdata(payload)
        }        
      }
  }
}
async function export_QUEUE_AGENT_DETAIL_VIEW(){
  logger.info("Exporting QUEUE_AGENT_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/FilterUsersByQueueIds/QUEUE_AGENT_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const queueid of queue){
        for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {filterUsersByQueueIds: [`${queueid}`]})
            await exportdata(payload)
        }        
      }
  }
}
async function export_ABANDON_INSIGHTS_VIEW(){
  logger.info("Exporting ABANDON_INSIGHTS_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/QueueIds/ABANDON_INSIGHTS_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const queueid of queue){
        for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {queueIds: [`${queueid}`]})
            await exportdata(payload)
        }        
      }
  }
}
async function export_AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW(){
  logger.info("Exporting AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/UserIds/AGENT_WRAP_UP_PERFORMANCE_DETAIL_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
      for await (const userid of user){
        for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            payload.filter.WrapUpCodes = [wrapup]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
            Object.assign(payload.filter, {userIds: [`${userid}`]})
            await exportdata(payload)
        }        
      }
  }
}
async function export_WRAP_UP_PERFORMANCE_SUMMARY_VIEW(){
  logger.info("Exporting WRAP_UP_PERFORMANCE_SUMMARY_VIEW")
  await process()
  async function process(){
    var jsonData = fs.readFileSync(
      __dirname + `/../Payload/WrapUpCodes/WRAP_UP_PERFORMANCE_SUMMARY_VIEW.json`,
    )
    var payload = JSON.parse(jsonData)
    Object.assign(payload, {
      interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
      })
        for await (const media of mediatypes){
            const id = uuid.v4()
            payload.filter.mediaTypes = [media]
            payload.filter.WrapUpCodes = [wrapup]
            Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` }) 
            await exportdata(payload)
        }        
  }
}

async function exportdata(payload) {
    apiInstance
     .postAnalyticsReportingExports(payload)
     .then(() => {
       logger.info(`Done Exporting ${payload.viewType}`)
     })
     .catch((err) => {
       logger.error(`Failed at ${payload.viewType}`)
       logger.error(err)
     })
}
module.exports = load