const {
    Parser,
    transforms: { unwind, flatten },
    formatters: {string: stringFormatter,
      stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter}
  } = require('json2csv')
  const json2csvParser = new Parser({
    transforms: [unwind({ blankOut: true }), flatten({separator: "_"})],
    formatters: {  string: stringQuoteOnlyIfNecessaryFormatter({ eol: '\n' }),
    string: stringFormatter()}
  })
  const eol = require('eol')
  const moment = require(`moment`)
var datetime = moment().format('YYYY-MM-DD')
const fs = require('fs')
const loggers = require('../Logger')
const sleep = require('sleep-promise')
const BlobUpload = require('../sql_conn')
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
    .then(async(data) => {
      const csv = json2csvParser.parse(data)
      let createdDateTime = new Date();
      var viewType = "AGENT_PRESENCE_CONFIG_DEFINITIONS"
        var filename = `AGENT_PRESENCE_CONFIG_DEFINITIONS_${datetime}`
          await fs.writeFileSync(`./reports/AGENT_PRESENCE_CONFIG_DEFINITIONS_${datetime}.csv`,`${eol.split(csv).join(eol.lf)}\n`)
          var path = process.cwd() + `\\reports\\` + filename
          loggers.info('Done Exporting AGENT_PRESENCE_CONFIG_DEFINITIONS')
          var file_path = path + '.csv'
        var data = fs.readFileSync(file_path)
        var resp = data.toString().split('\n').length;
        const rowcount = resp - 2
        if (rowcount<0){
          rowcount = 0
        }
        await BlobUpload.main(viewType,createdDateTime,filename,rowcount,file_path)
        .then((res)=>{
        })
        .catch((ex)=> loggers.error(ex.message))
      
    })
    .catch((err) => {
      console.log("There was a failure calling getPresencedefinitions");
      console.error(err);
    });
}
  
module.exports= load
