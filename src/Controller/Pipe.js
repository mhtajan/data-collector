const fs = require("fs");
const sleep = require("sleep-promise");
const Downloader = require("./Downloader");
const Controller = require("./Controller");
const Deleter = require('./Delete')
const logger = require("./Logger");
const test = require("./Export/Components/test")
const exporter = require("./Export/Components/export")
const exporter_batch2 = require("./Export/Components/export batch2")
const exporter_batch3 = require("./Export/Components/export batch3")
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
const dlsql = require('./downloader_sql')
const olddelete = require('./olddelete')
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
  //await ensureDirectoryExistence()
  //  await agentcustom(token)
   //await presence(token)
  // await did(token)
   await flow(token)
  // await flowmilestone(token)
  // await flowoutcome(token)
   //await mediatype(token)
  // await queue(token)
  // await survey(token)
  //await user(token)
  //await wrapup(token)
  // await sleep(10000)
  //await exporter(token) //fully-working needs optimization
  //await exporter_batch2(token) // testing // working
  //await exporter_batch3(token) // testing
  //await sleep(60000*2)
  //await dlsql(token)
  //await newDL(token)
  //await sleep(40000)
  //await olddelete(token)//temp deleter
  
}

module.exports = main;
