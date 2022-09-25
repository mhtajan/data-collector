const cron = require("node-cron");
const fetch = require(`node-fetch`);
const fs = require("fs");
const token = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(token).toString("base64");
const Pipe = require('./Controller/Pipe')
const logger = require('./Controller/Logger')
const params = new URLSearchParams();
params.append("grant_type", "client_credentials");

  // cron.schedule(`${process.env.CRON_Sched}`, () => {
  //  loggers.info("Data collection executing!");
  //  runScript();
  // });
runScript();

async function runScript() {
  //oauth login
  fetch(`https://login.mypurecloud.jp/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedToken}`,
    },
    body: params,
  })
    .then(async(res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then(async(jsonResponse) => {
        await Pipe(jsonResponse.access_token) //analytics exports
    })
    .catch((e) => logger.error(e));
}


