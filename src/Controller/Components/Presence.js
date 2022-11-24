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
      arr = []
      data.entities.forEach((entry)=>{
        arr.push({id: `${entry.id}`,
        languageLabels_en_US: `${entry.languageLabels.en_US}`,
        systemPresence: `${entry.systemPresence}`,
        deactivated: `${entry.deactivated}`,
        primary: `${entry.primary}`,
        createdBy_id: `${entry.createdBy.id}`,
        createdBy_selfUri: `${entry.createdBy.selfUri}`,
        createdDate: `${entry.createdDate}`,
        modifiedBy_id: `${entry.modifiedBy.id}`,
        modifiedBy_selfUri: `${entry.modifiedBy.selfUri}`,
        modifiedDate: `${entry.modifiedDate}`,
        selfUri: `${entry.selfUri}`,
        languageLabels_en: `${entry.languageLabels.en}`
        })
      })
      toCsv.main(arr,'AGENT_PRESENCE_CONFIG_DEFINITIONS',datetime)
    })
    .catch((err) => {
      loggers.info("There was a failure calling getPresencedefinitions");
      loggers.error(err);
    });
}

module.exports = load
