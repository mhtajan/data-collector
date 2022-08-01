const isohandle = require('./ISO_handler.js')
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
    run(jsonResponse.access_token).catch(err => console.error(err))
    isohandle(jsonResponse) //isoviewtypes
  })
  .catch((e) => console.error(e))

  const { Worker } = require('worker_threads')
  
  function runService(workerData) {
      return new Promise((resolve, reject) => {
          const worker = new Worker(
                  './handler.js', { workerData });
          worker.on('message', resolve);
          worker.on('error', reject);
          worker.on('exit', (code) => {
              if (code !== 0)
                  reject(new Error(
  `Stopped the Worker Thread with the exit code: ${code}`));
          })
      })
  }
    
  async function run(body) {
      const result = await runService(body)
      console.log(result);
  }
    
