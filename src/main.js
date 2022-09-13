const cron = require("node-cron");
const fetch = require(`node-fetch`);
const fs = require("fs");
const token = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
const encodedToken = Buffer.from(token).toString("base64");
const Controller = require("./Controller/Controller");
const Handler = require("./Controller/Handler");
const loggers = require("./Controller/Logger")

const params = new URLSearchParams();

params.append("grant_type", "client_credentials");

//  cron.schedule("23 17 * * *", () => {
//    loggers.info("Data collection executing!");
//    runScript();
//  });
runScript();
load();
function runScript() {
  fetch(`https://login.mypurecloud.jp/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedToken}`,
    },
    body: params,
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then((jsonResponse) => {
      Controller(jsonResponse.access_token);
      Handler(jsonResponse.access_token);
    })
    .catch((e) => console.error(e));
}

function load() {
  loggers.info("Data-collector is now running")
  fs.readdirSync(`./src`).forEach((jsFile) => {
    if (jsFile.includes(".js")) {
      if (!jsFile.includes("main.js")) {
        console.log("Loaded: ", jsFile);
      }
    } else {
      fs.readdirSync("./src/Controller/").forEach((file) => {
        if (file.includes(".js")) {
          console.log("Loaded: ", file);
        } else {
          fs.readdirSync(`./src/Controller/${file}`).forEach((file1) => {
            console.log("Loaded: ", file1);
          });
        }
      });
    }
  });
}
