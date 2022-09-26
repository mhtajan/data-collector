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
const logger = require("./Logger");

function _callback() {
  console.log("callback");
}
async function controller(token, _callback) {
  await Controller(token);
}
async function filterQueuesByUserIds(token, _callback) {
  await FilterQueuesbyUserIds(token);
}
async function filterUsersByQueueIds(token, _callback) {
  await FilterUsersByQueueIds(token);
}
async function flowIds(token, _callback) {
  await FlowIds(token);
}
async function userIds(token, _callback) {
  await UserIds(token);
}
async function withoutFilter(token, _callback) {
  await WithoutFilter(token);
}
async function downloader(token, _callback) {
  await Downloader(token);
}

async function main(token) {
  await controller(token);
  // await filterQueuesByUserIds(token);
  //await filterUsersByQueueIds(token);
  //await flowIds(token)
  // await userIds(token);
  // await withoutFilter(token);
  //await downloader(token);
}

module.exports = main;
