const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../toCsv')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500,
  pageNumber: 1,
}
function load(token) {
  client.setAccessToken(token)
  let apiInstance = new platformClient.PresenceApi();
  apiInstance.getPresencedefinitions(opts)
    .then(async (data) => {
      toCsv.main(data.entities,'AGENT_PRESENCE_CONFIG_DEFINITIONS',datetime)
    })
    .catch((err) => {
      loggers.info("There was a failure calling getPresencedefinitions");
      loggers.error(err);
    });
}

module.exports = load
