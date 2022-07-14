const platformClient = require("purecloud-platform-client-v2");
const download = require("download");
const fs = require("fs");
const fetch = require("node-fetch");
const creds = require("./creds.json");
const client = platformClient.ApiClient.instance;
client.setEnvironment("mypurecloud.jp"); // Genesys Cloud region

client
  .loginClientCredentialsGrant(creds.id, creds.secret)
  .then(({ accessToken }) => {
    client.setAccessToken(accessToken);

    let apiInstance = new platformClient.AnalyticsApi();

    let opts = {
      pageNumber: 1, // Number | Page number
      pageSize: 500, // Number | Page size
    };

    apiInstance
      .getAnalyticsReportingExports(opts)
      .then(async (data) => {
        //logs for debug
        const datareports = new console.Console(
          fs.createWriteStream("./datareports.txt")
        );
        const urlreports = new console.Console(
          fs.createWriteStream("./urlReports.txt")
        );
        const fail = new console.Console(fs.createWriteStream("./failure.txt"));
        const log = new console.Console(fs.createWriteStream("./logs.txt"));
        datareports.log(data);

        let entities = data.entities;
        //loop entities
        entities.forEach((entry) => {
          //yesterdaydate
          let date = new Date();
          date.setDate(date.getDate() - 1);
          yesterday = date.toISOString().split("T")[0];
          const url = entry.downloadUrl;

          if (entry.status == "FAILED") {
            console.log("failure");
          }
          const rootpath = `./reports`;
          const filepath = `./reports/${entry.viewType}`;
          if (!fs.existsSync(rootpath)) {
            fs.mkdirSync(rootpath);
          }
          if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
          }
          const fileoption = {
            filename: `${entry.viewType}-${entry.id}.csv`,
          };
          const options = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ContentType: `application/json`,
            },
          };
          //datefilter
          if (entry.modifiedDateTime.includes(yesterday)) {
            log.log(entry.viewType, "\n" + entry.modifiedDateTime);
            log.log(yesterday);
          }
          if (entry.status.includes("COMPLETED")) {
            // datacollection
            fetch(url, options).then(async (res) => {
              const filelink = res.url;
              await download(filelink, filepath, fileoption).then(() => {
                console.log(
                  `Complete Downloading -`,
                  Object.values(fileoption)
                );
              });
            });
          } else {
            //status = failed
            fail.log(entry);
          }
        });
      })
      .catch((err) => {
        console.log("There was a failure calling getAnalyticsReportingExports");
        console.error(err);
      });
  })
  .catch((err) => {
    console.log("Invalid Credentials");
    throw new Error(err);
  });
