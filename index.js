const platformClient = require("purecloud-platform-client-v2")
const download = require("download")
const fs = require("fs")
const fetch = require("node-fetch")
const creds = require("./creds.json")
var moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const client = platformClient.ApiClient.instance

client.setEnvironment("mypurecloud.jp") // Genesys Cloud region
client
    .loginClientCredentialsGrant(creds.id, creds.secret)
    .then(({ accessToken }) => {
        client.setAccessToken(accessToken)
        let date = new Date()
        let i = 0  //unique id
        date.setDate(date.getDate() - 1)
        yesterday = date.toISOString().split("T")[0]
        let apiInstance = new platformClient.AnalyticsApi()
        let opts = {
            pageNumber: 1, // Number | Page number
            pageSize: 25, // Number | Page size
        } 
        getAnalyticsReportingExports()
        function getAnalyticsReportingExports() {
            apiInstance
                .getAnalyticsReportingExports(opts)
                .then(async (data) => {
                    let entities = data.entities     
                    //page && loop
                    if (data.pageCount>=data.pageNumber) {
                        entities.forEach((entry) => {                        
                          const filepath = `./reports/`
                          const fileoption = {
                              filename: `${entry.viewType}_${moment().format('YYYY_MM_DD HHmmss')}_${i++}.csv`,
                          }
                          const options = {
                              headers: {
                                  Authorization: `Bearer ${accessToken}`,
                                  ContentType: `application/json`,
                              },
                          }
                          //datefilter  
                          if (entry.modifiedDateTime.includes("2022")) {
                              if (entry.status.includes("COMPLETED")) {
                                  // datacollection
                                 
                                  fetch(entry.downloadUrl, options).then(async (res) => {
                                      const filelink = res.url
                                      await download(filelink, filepath, fileoption).then(() => {
                                          
                                          console.log()
                                          logger.info(`Complete Downloading - ${Object.values(fileoption)}`)
                                          return
                                      })
                                  })
                              } else {
                                  //status failed or pending/(etc) 
                                  fail_logger.debug(JSON.stringify(entry,null,2))
                                  logger.info(`failed downloading ${entry.viewType} status: ${entry.status}`)  
                              }
                          }
                      })
                      opts.pageNumber = opts.pageNumber + 1
                      getAnalyticsReportingExports()
                    }
                })
                .catch((err) => {
                    logger.info("There was a failure calling getAnalyticsReportingExports")
                    logger.error(err)
                })
        }
    })
    .catch((err) => {
        logger.info("Invalid Credentials")
        throw new Error(err)
    })

// logger

const myFormat = printf(({ message, timestamp }) => {
    return `${timestamp}: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
    new transports.Console(),
    new transports.File({
        filename: 'app.log',
        level: 'info'
    }),
    new transports.File({
        filename: 'errors.log',
        level: 'error'
    })
    ]
});
const fail_logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [new transports.File({
        filename: 'debug.log',
        level: 'debug'
    })
]
})
