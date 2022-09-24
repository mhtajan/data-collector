const cron = require("node-cron");
const fetch = require(`node-fetch`);
const fs = require("fs");
const token = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(token).toString("base64");
const Controller = require("./Controller/Controller");
const Handler = require("./Controller/Handler");
const loggers = require("./Controller/Logger")
const Exporter = require("./Controller/Export")
const exp_user = require("./Controller/exp_user")
const exp_quser = require("./Controller/exp_quser")
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
      //exp_quser(jsonResponse.access_token)
        //Controller(jsonResponse.access_token) //iso viewtypes
        await Exporter(jsonResponse.access_token) //analytics exports
    })
    .catch((e) => loggers.error(e));
}


