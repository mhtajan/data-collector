const platformClient = require("purecloud-platform-client-v2");
const axios = require('axios').default;
const fs =require("fs")
const client = platformClient.ApiClient.instance;
const f = require("./app.js")
client.setEnvironment("mypurecloud.jp"); // Genesys Cloud region
const clientID = "588c86a0-c120-4c47-9c00-99c113db00ca";
const clientSecret = "G12v6taK-_sOMJ7oht6I1i52urd8pMX8DXOYLR37Efk";

client
  .loginClientCredentialsGrant(clientID, clientSecret)
  .then(({accessToken}) =>{
    axios({
  method: 'get',
  url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
  headers: { 'Authorization': 'Bearer '+ accessToken }
}).then((response)=>{
      data = response.data
      entities = data.entities
      console.log(entities)
      entities.forEach(entry=>{
        if(entry.state=="active"){
          console.log(entry.name+"\n"+entry.username)
        }
      })
})
  }
)

    