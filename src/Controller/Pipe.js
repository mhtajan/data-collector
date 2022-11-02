const logger = require("./Logger");
const exporter  = require("./Export/Components/export")
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance

async function main(token) {
  client.setAccessToken(token);
await exporter(token) //fully-working needs optimization
//await olddelete(token)//temp deleter
}

module.exports = main;
