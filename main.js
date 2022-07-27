const handle = require('./handler.js')
const isohandle = require('./ISO_handler.js')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
const fetch = require(`node-fetch`)
const creds = require(`./creds.json`)
const token = `${creds.id}:${creds.secret}`
const encodedToken = Buffer.from(token).toString('base64')

const params = new URLSearchParams()
params.append('grant_type', 'client_credentials')

fetch(`https://login.mypurecloud.jp/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${encodedToken}`,
  },
  body: params,
})
  .then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      throw Error(res.statusText)
    }
  })
  .then((jsonResponse) => {
    handle(jsonResponse) //40viewtypes
    isohandle(jsonResponse) //isoviewtypes
  })
  .catch((e) => console.error(e))
