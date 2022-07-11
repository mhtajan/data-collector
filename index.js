const platformClient = require("purecloud-platform-client-v2");
const http = require('http');
const fs = require('fs');
const client = platformClient.ApiClient.instance;
client.setEnvironment("mypurecloud.jp"); // Genesys Cloud region

const clientID = "588c86a0-c120-4c47-9c00-99c113db00ca";
const clientSecret = "G12v6taK-_sOMJ7oht6I1i52urd8pMX8DXOYLR37Efk";

client
  .loginClientCredentialsGrant(clientID, clientSecret)
  .then(({ accessToken }) => {
    //console.log(token);

    client.setAccessToken(accessToken);

    let apiInstance = new platformClient.AnalyticsApi();

    let opts = {
      pageNumber: 1, // Number | Page number
      pageSize: 500, // Number | Page size
    };

    apiInstance
      .getAnalyticsReportingExports(opts)
      .then((data) => {
        ObjectData = Object.values(data)
        ObjectData1 = ObjectData[0] 
        ObjectCount1 = Object.values(ObjectData1) // number of entities
        EntityElements =Object.keys(ObjectCount1[0]) //entities
        EntityS = Object.values(ObjectCount1)
        EntityV = Object.keys(EntityS)
        EntityValues = Object.values(ObjectCount1[0])
        var TopField = EntityElements.join() + "\n"
        fs.writeFileSync("demo.csv", TopField)
        console.log(Object.keys(EntityS[0]))
     for (i = 0; i < ObjectCount1.length; i++) // entity element loop
       {
         
         var dl_entity = Object.keys(EntityS[i])
         var dstr_entity = Object.values(EntityS[i])
         for(x=0;x<dl_entity.length; x++) //downloadurl loop
           {
             if (dl_entity[x]=="downloadUrl")
         {
           console.log(dstr_entity[x])
          urlToPrint = dstr_entity[x]
         }
           }
         for(z=0;z<dl_entity.length;z++) //id loop
           {
             if(dl_entity[z]=="id")
             {
               console.log(dstr_entity[z])
             }
           }
         for(y=0;y<dl_entity.length;y++) //viewtype loop
           {
             if(dl_entity[y]=="viewType")
             {
               console.log(dstr_entity[y])
             }
           }
       }
             
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