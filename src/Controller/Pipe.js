const fs = require("fs");
const sleep = require("sleep-promise");
const WithoutFilter = require("./Export/Components/WithoutFilter");
const UserIds = require("./Export/Components/UserIds");
const QueueIds = require("./Export/Components/QueueIds");
const FilterQueuesbyUserIds = require("./Export/Components/FilterQueuesByUserIds");
const FilterUsersByQueueIds = require("./Export/Components/FilterUsersByQueueIds");
const FlowIds = require('./Export/Components/FlowIds')
const Downloader = require("./Downloader");
const Controller = require("./Controller");
const Deleter = require('./Delete')
const logger = require("./Logger");
const test = require("./Export/Components/test")
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance
function _callback() {
  console.log("callback");
}
async function controller(token, _callback) {
  await Controller(token);
  await sleep(5000)
}
async function filterQueuesByUserIds(token, _callback) {
  await FilterQueuesbyUserIds(token);
  await sleep(5000)
}
async function filterUsersByQueueIds(token, _callback) {
  await FilterUsersByQueueIds(token);
  await sleep(5000)
}
async function flowIds(token, _callback) {
  await FlowIds(token);
  await sleep(5000)
}
async function userIds(token, _callback) {
  await UserIds(token);
  await sleep(5000)
}
async function withoutFilter(token, _callback) {
  await WithoutFilter(token);
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
  //test(token)
  //await controller(token);
  //await sleep(8000);
  // await sleep(20000)
  // await filterQueuesByUserIds(token)
  await sleep(20000)
  test(token)
  //await filterUsersByQueueIds(token);
  //Deleter(token)
  //await flowIds(token)
  //await userIds(token);
  // await withoutFilter(token);
  //await downloader(token);
  //
  // await Promise.all([
  //   await setTimeout(async()=>{
  //     await filterQueuesByUserIds(token)
  //   },500),
  //   await setTimeout(async()=>{
  //     await userIds(token)
  //   },500)
  // ])
  //await datacoll(token)
}

async function datacoll(token){
  const funcArr = []
  funcArr.push(filterQueuesByUserIds(token));
  //funcArr.push(filterUsersByQueueIds(token));
  //funcArr.push(flowIds(token));
  //funcArr.push(userIds(token));
  //funcArr.push(withoutFilter(token));
  //funcArr.push(downloader(token));
  try {
    await Promise.all(funcArr)
  } catch (error) {
    console.error(error.message);
  }
}
module.exports = main;
