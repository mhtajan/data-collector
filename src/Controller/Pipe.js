const fs = require("fs");
const sleep = require("sleep-promise");
const Downloader = require("./Downloader");
const Controller = require("./Controller");
const Deleter = require('./Delete')
const logger = require("./Logger");
const test = require("./Export/Components/test")
const agentcustom = require("./Components/Agent_custom_break_view")
const presence = require("./Components/Presence")
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
  await ensureDirectoryExistence()
  await agentcustom(token)
  await presence(token)
  await sleep(2000)
  await test(token)
  await downloader(token)
  await sleep(2000)
  await deleter(token)
}
async function ensureDirectoryExistence() {
  if (!fs.existsSync('./reports/')) {
    fs.mkdirSync('./reports/')
  }
}
module.exports = main;
