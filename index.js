const platformClient = require("purecloud-platform-client-v2");
const fs = require("fs")
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

    // POST AGENT_INTERACTION_DETAIL_VIEW
    apiInstance
      .postAnalyticsReportingExports({
        name: "SAMPLE-AGENT_INTERACTION_DETAIL_VIEW",
        timeZone: "Aisa/Singapore",
        exportFormat: "CSV",
        interval: "2022-06-12T00:00:00/2022-07-07T00:00:00",
        period: "PT30M",
        viewType: "INTERACTION_SEARCH_VIEW",
        read: true,
        filter: {
          mediaTypes: ["voice"],
        },
        locale: "en-us",
        hasFormatDurations: true,
        hasSplitFilters: false,
        excludeEmptyRows: true,
        hasSplitByMedia: true,
        hasSummaryRow: false,
        csvDelimiter: "COMMA",
        hasCustomParticipantAttributes: true,
      })
      .then((data) => {
      })
      .catch((err) => {
        console.log(
          "There was a failure calling postAnalyticsReportingExports"
        );
        console.error(err);
      });

    let opts = {
      pageNumber: 1, // Number | Page number
      pageSize: 500, // Number | Page size
    };

    apiInstance
      .getAnalyticsReportingExports(opts)
      .then((data) => {
        ObjectData = Object.values(data)
        ObjectData1 = ObjectData[0]
        ObjectCount1 = Object.values(ObjectData1)
        EntityElements =Object.keys(ObjectCount1[0]) //entities
        EntityValues = Object.values(ObjectCount1[0])
        var TopField = EntityElements.join() + "\n"
        fs.writeFileSync("demo.csv", TopField)
         for (i = 0; i < ObjectCount1.length; i++)
  {
    
    Fdata = Object.values(ObjectCount1[i])
    Filter = Fdata[10]
    Media = Object.keys(Filter)
    Type = Object.values(Filter)
    var mediatype = `${Media}: ${Type}`
    correctedData = Fdata[10] = mediatype
    var test1 = (Fdata.join() + "\n")
    fs.appendFileSync("demo.csv", test1)  
  
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