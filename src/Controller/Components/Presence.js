const {
    Parser,
    transforms: { unwind, flatten },
  } = require('json2csv')
  const json2csvParser = new Parser({
    transforms: [unwind({ blankOut: true }), flatten('__')],
  })
  const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
const fs = require('fs')
const loggers = require('../Logger')
const sleep = require('sleep-promise')
const platformClient = require('purecloud-platform-client-v2')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
    pageSize: 500,
    pageNumber: 1,
  }
function load(token){
    client.setAccessToken(token)
     getPresence()
}
  let apiInstance = new platformClient.PresenceApi();
function getPresence(){
    apiInstance.getPresencedefinitions(opts)
    .then((data) => {
      const csv = json2csvParser.parse(data)
          fs.writeFileSync(`./reports/AGENT_PRESENCE_CONFIG_DEFINITIONS${datetime}.csv`,csv)
          loggers.info('Done Exporting AGENT_PRESENCE_CONFIG_DEFINITIONS')
      
    })
    .catch((err) => {
      console.log("There was a failure calling getPresencedefinitions");
      console.error(err);
    });
}
  
module.exports= load
