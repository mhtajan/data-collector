const cron = require("node-cron");
const fetch = require(`node-fetch`);
const creds = require(`./creds.json`);
const token = `${creds.id}:${creds.secret}`;
const encodedToken = Buffer.from(token).toString("base64");
const Controller = require("./Controller/Controller");
const Handler = require("./Controller/Handler")

const params = new URLSearchParams();

params.append("grant_type", "client_credentials");

// cron.schedule("43 15 * * *", () => {
//   console.log("running task ");
//   runScript();
// });
runScript()
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
      console.log(res)
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

