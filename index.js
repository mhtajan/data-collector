const platformClient = require("purecloud-platform-client-v2")
const download = require("download")
const fs = require("fs")
const fetch = require("node-fetch")
const creds = require("./creds.json")
const client = platformClient.ApiClient.instance

client.setEnvironment("mypurecloud.jp") // Genesys Cloud region
client
  .loginClientCredentialsGrant(creds.id, creds.secret)
  .then(({ accessToken }) => {
    client.setAccessToken(accessToken)

    let apiInstance = new platformClient.AnalyticsApi()
    let opts = {
      pageNumber: 1, // Number | Page number
      pageSize: 500, // Number | Page size
    }

    apiInstance
      .getAnalyticsReportingExports(opts)
      .then(async (data) => {
        //logs for debug
        const datalogs = new console.Console(fs.createWriteStream("./data.txt"))
        const fail = new console.Console(fs.createWriteStream("./failure.txt"))
        const log = new console.Console(fs.createWriteStream("./logs.txt"))
        datalogs.log(data)
        let entities = data.entities
        //loop entities
        entities.forEach((entry) => {
          //yesterdaydate
          let date = new Date()
          let current = new Date()
          current.getDate()
          current.setHours(current.getHours() + 8) //test convert from utc to phtime
          date.setDate(date.getDate() - 1)
          yesterday = date.toISOString().split("T")[0]
          const url = entry.downloadUrl
          const filepath = `./reports/${entry.viewType}`            
          const fileoption = {
            filename: `${entry.viewType}-${entry.id}.csv`,
          }
          const options = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ContentType: `application/json`,
            },
          }
          //datefilter
          if (entry.modifiedDateTime.includes(yesterday)) {
            log.log(entry.viewType, "\n" + entry.modifiedDateTime)
            log.log(yesterday)
            log.log(current)
          }
          if (entry.status.includes("COMPLETED")) {
            // datacollection
            fetch(url, options).then(async (res) => {
              const filelink = res.url
              await download(filelink, filepath, fileoption).then(() => {
                console.log(`Complete Downloading -`, Object.values(fileoption))
              })
            })
          } else {
            //status failed or pending/(etc)
            fail.log(entry)
          }
        })
      })
      .catch((err) => {
        console.log("There was a failure calling getAnalyticsReportingExports")
        console.error(err)
      })
  })
  .catch((err) => {
    console.log("Invalid Credentials")
    throw new Error(err)
  })
