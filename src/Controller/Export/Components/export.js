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

mediatypes = ["voice","chat","email","message"]
withMediatype = ['QUEUE_PERFORMANCE_DETAIL_VIEW.json',
'QUEUE_PERFORMANCE_SUMMARY_VIEW.json',
'AGENT_PERFORMANCE_DETAIL_VIEW.json',
'AGENT_STATUS_DETAIL_VIEW.json']



