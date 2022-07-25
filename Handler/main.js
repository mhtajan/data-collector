const axios = require('axios').default;
const handle = require('./testing.js')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format
const fetch = require(`node-fetch`)
var id = '588c86a0-c120-4c47-9c00-99c113db00ca'
var secret = 'G12v6taK-_sOMJ7oht6I1i52urd8pMX8DXOYLR37Efk'
const token = `${id}:${secret}`;
const encodedToken = Buffer.from(token).toString('base64');


const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

fetch(`https://login.mypurecloud.jp/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${encodedToken}`
  },
  body: params
}).then(res => {
  if (res.ok) {
    return res.json();
  } else {
    throw Error(res.statusText);
  }
})
  .then(jsonResponse => {
    console.log(jsonResponse);
    getReport(jsonResponse);
  })
  .catch(e => console.error(e));
