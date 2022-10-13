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
mediatypes = ["chat","email","message","callback"]
async function load(){
    lookup()
    await sleep(5000)
    console.log(queue.length)
    await export_AGENT_STATUS_SUMMARY_VIEW()
     await sleep(5000)
    await export_QUEUE_INTERACTION_DETAIL_VIEW()
    await sleep(100000)
    await export_AGENT_STATUS_DETAIL_VIEW()
    await sleep(100000)
    await export_AGENT_PERFORMANCE_DETAIL_VIEW()
    await sleep(100000)
    await export_INTERACTION_SEARCH_VIEW()
    await sleep(100000)
    await export_AGENT_INTERACTION_DETAIL_VIEW()
    await sleep(100000)
    await export_QUEUE_PERFORMANCE_DETAIL_VIEW()

}
async function lookup(){
    getUserProfile()
    getQueue()
  
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
}
async function export_AGENT_PERFORMANCE_DETAIL_VIEW(){
    logger.info("Exporting AGENT_PERFORMANCE_DETAIL_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/UserIds/AGENT_PERFORMANCE_DETAIL_VIEW.json`,
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
async function export_AGENT_STATUS_DETAIL_VIEW(){
    logger.info("Exporting AGENT_STATUS_DETAIL_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/UserIds/AGENT_STATUS_DETAIL_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
        for await (const userid of user){
              const id = uuid.v4()
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              Object.assign(payload.filter, {userIds: [`${userid}`]})
              exportdata(payload)
        }
    }
}
async function export_QUEUE_INTERACTION_DETAIL_VIEW(){
    logger.info("Exporting QUEUE_INTERACTION_DETAIL_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/QueueIds/QUEUE_INTERACTION_DETAIL_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
        for await (const queueid of queue){
              const id = uuid.v4()
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              Object.assign(payload.filter, {queueIds: [`${queueid}`]})
              exportdata(payload)
        }
    }
}
async function export_INTERACTION_SEARCH_VIEW(){
    logger.info("Exporting INTERACTION_SEARCH_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/UserIds/INTERACTION_SEARCH_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
        for await (const userid of user){
              const id = uuid.v4()
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              Object.assign(payload.filter, {userIds: [`${userid}`]})
              exportdata(payload)
        }
    }
}
async function export_AGENT_STATUS_SUMMARY_VIEW(){
    logger.info("Exporting AGENT_STATUS_SUMMARY_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + '/../Payload/WithoutFilter/AGENT_STATUS_SUMMARY_VIEW.json',
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
      const id = uuid.v4()
      Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
      exportdata(payload)
    }
}
async function export_AGENT_INTERACTION_DETAIL_VIEW(){
    logger.info("Exporting AGENT_INTERACTION_DETAIL_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/UserIds/AGENT_INTERACTION_DETAIL_VIEW.json`,
      )
      var payload = JSON.parse(jsonData)
      Object.assign(payload, {
        interval: `${yesterday}T00:00:00/${datetime}T00:00:00`,
        })
        for await (const userid of user){
              const id = uuid.v4()
              Object.assign(payload, { name: `${payload.viewType}_${datetime}_${id}` })  
              Object.assign(payload.filter, {userIds: [`${userid}`]})
              exportdata(payload)
        }
    }
}
async function export_QUEUE_PERFORMANCE_DETAIL_VIEW(){
    logger.info("Exporting QUEUE_PERFORMANCE_DETAIL_VIEW")
    await process()
    async function process(){
      var jsonData = fs.readFileSync(
        __dirname + `/../Payload/QueueIds/QUEUE_PERFORMANCE_DETAIL_VIEW.json`,
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
              exportdata(payload)
            }
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