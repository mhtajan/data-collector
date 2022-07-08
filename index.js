const platformClient = require("purecloud-platform-client-v2");

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
        interval: "2022-07-01T00:00:00/2022-07-07T00:00:00",
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
        console.log(data);
      })
      .catch((err) => {
        console.log(
          "There was a failure calling postAnalyticsReportingExports"
        );
        console.error(err);
      });

    let opts = {
      pageNumber: 1, // Number | Page number
      pageSize: 25, // Number | Page size
    };

    apiInstance
      .getAnalyticsReportingExports(opts)
      .then((data) => {
        console.log(
          `getAnalyticsReportingExports success! data: ${JSON.stringify(
            data,
            null,
            2
          )}`
        );
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

// authenticate();

// Manually set auth token or use loginImplicitGrant(...) or loginClientCredentialsGrant(...)

// Get all export metadata
// apiInstance
//   .getAnalyticsReportingExportsMetadata()
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.log(
//       "There was a failure calling getAnalyticsReportingExportsMetadata"
//     );
//     console.error(err);
//   });
