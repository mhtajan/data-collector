const platformClient = require("purecloud-platform-client-v2");
const axios = require('axios').default;
const fs =require("fs")
const client = platformClient.ApiClient.instance;
const f = require("./app.js")
client.setEnvironment("mypurecloud.jp"); // Genesys Cloud region
const clientID = "588c86a0-c120-4c47-9c00-99c113db00ca";
const clientSecret = "G12v6taK-_sOMJ7oht6I1i52urd8pMX8DXOYLR37Efk";
//aibsg testing
const log = new console.Console(fs.createWriteStream("./logs.txt"))
client
  .loginClientCredentialsGrant(clientID, clientSecret)
  .then(({accessToken}) =>{
    client.setAccessToken(accessToken)
   let apiInstance = new platformClient.AuditApi();

// Get service mapping information used in audits.
apiInstance.getAuditsQueryServicemapping()
  .then((data) => {
    console.log(`getAuditsQueryServicemapping success! data: ${JSON.stringify(data, null, 2)}`);
  })
  .catch((err) => {
    console.log("There was a failure calling getAuditsQueryServicemapping");
    console.error(err);
  });
  }
)

    