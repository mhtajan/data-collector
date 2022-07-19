const platformClient = require("purecloud-platform-client-v2")
const download = require("download")
const fs = require("fs")
const fetch = require("node-fetch")
const creds = require("./creds.json")
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const client = platformClient.ApiClient.instance


client.setEnvironment("mypurecloud.jp") // Genesys Cloud region
client
    .loginClientCredentialsGrant(creds.id, creds.secret)
    .then(({ accessToken }) => {
        client.setAccessToken(accessToken)

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

                    function getData() {
                        //loop entities
                        entities.forEach((entry) => {
                            //yesterdaydate
                            let date = new Date()
                            let timestamp = new Date()
                            timestamp.getDate()
                            timestamp = timestamp.toISOString()
                            date.setDate(date.getDate() - 1)
                            yesterday = date.toISOString().split("T")[0]
                            const filepath = `./reports/${entry.viewType}`
                            const fileoption = {
                                filename: `${entry.viewType}-${timestamp}.csv`,
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
                                            logger.info(`Complete Downloading - ${Object.values(fileoption)}`)
                                        })
                                    })
                                } else {
                                    //status failed or pending/(etc)
                                    logger.info(`failed downloading ${entry.viewType} status: ${entry.status}`)
                                }
                            }
                        })
                    }
                    //page
                    if (data.pageCount == data.pageNumber) {
                        getData()
                    }
                    else {
                        getData()
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
    transports: [new transports.Console(),
    new transports.File({
        filename: 'combined.log',
        level: 'info'
    }),
    new transports.File({
        filename: 'errors.log',
        level: 'error'
    })
    ]
});
