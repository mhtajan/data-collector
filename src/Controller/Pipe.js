const fs = require("fs");
const sleep = require("sleep-promise");
const Downloader = require("./Downloader");
const Controller = require("./Controller");
const Deleter = require('./Delete')
const logger = require("./Logger");
const test = require("./Export/Components/test")
const exporter = require("./Export/Components/export")
const exporter2 = require("./Export/Components/batch2")
const agentcustom = require("./Components/Agent_custom_break_view")
const presence = require("./Components/Presence")
const did = require("./LookUp/Did")
const flow = require("./LookUp/Flow")
const flowmilestone = require("./LookUp/FlowMilestone")
const flowoutcome = require("./LookUp/FlowOutcome")
const mediatype = require("./LookUp/MediaTypes")
const queue = require("./LookUp/Queue")
const survey = require("./LookUp/Survey")
const user = require("./LookUp/User")
const wrapup = require("./LookUp/Wrapup")
const newDL = require('./newDownloader')
const sql_conn = require('./sql_conn')
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance
function _callback() {
  console.log("callback");
}
async function controller(token, _callback) {
  //await Controller(token);
  await sleep(5000)
}
async function downloader(token, _callback) {
  await Downloader(token);
  await sleep(5000)
}
async function deleter(token, _callback) {
  await Deleter(token);
  await sleep(5000)
}
async function main(token) {
  client.setAccessToken(token);
  // await sleep(20000)
  // await ensureDirectoryExistence()
  // await agentcustom(token)
  // await presence(token)
  // await did(token)
  // await flow(token)
  // await flowmilestone(token)
  // await flowoutcome(token)
  // await mediatype(token)
  // await queue(token)
  // await survey(token)
  // await user(token)
  // await wrapup(token)
  // await sleep(10000)
  await exporter(token)
  // await sleep(20000)

  //await newDL(token)
  //await sleep(90000)
  //await deleter(token)
  
}
async function ensureDirectoryExistence() {
  if (!fs.existsSync('./reports/')) {
    fs.mkdirSync('./reports/')
  }
}
module.exports = main;
