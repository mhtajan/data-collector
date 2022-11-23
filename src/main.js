const fetch = require(`node-fetch`);
const fs = require("fs");
const token = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(token).toString("base64");
const { Controller, Lookup, exporter} = require('./Controller/handler.js')
const logger = require('./Controller/Logger.js')
const params = new URLSearchParams();
params.append("grant_type", "client_credentials");
const sleep = require("sleep-promise");
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
        await ensureDirectoryExistence()       
        Controller(jsonResponse.access_token) //iso with custombreakview and presenceconfig
        await sleep(1000)
        await Lookup(jsonResponse.access_token) //lookups
        await sleep(1000)
        exporter(jsonResponse.access_token)
    })
    .catch((e) => logger.error(e));
}

async function ensureDirectoryExistence() {
  if (!fs.existsSync('c:\\collector')) {
    fs.mkdirSync('c:\\collector')
    }
  if(!fs.existsSync('c:\\collector\\reports\\')){
    fs.mkdirSync('c:\\collector\\reports')
    }
  }

