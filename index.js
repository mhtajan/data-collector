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
      .then((data) => {
        let entities = data["entities"];
        entities.forEach((entry) => {
          const url = entry["downloadUrl"];
          const rootpath = `./reports`;
          const filepath = `./reports/${entry["viewType"]}`;
          if (!fs.existsSync(rootpath)) {
            fs.mkdirSync(rootpath);
          }
          if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
          }
          const fileoption = {
            filename: `${entry["viewType"]}-${entry["id"]}.csv`,
          };
          const options = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ContentType: `application/json`,
            },
          };
          //datacollection
          fetch(url, options).then(async (res) => {
            const filelink = res.url;
            await download(filelink, filepath, fileoption).then(() => {
              console.log(`Complete Downloading -`, Object.values(fileoption));
            });
          });
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
