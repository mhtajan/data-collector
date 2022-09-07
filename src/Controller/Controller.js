const fs = require('fs')
const {Worker} = require('worker_threads')
const ISOviewTypes = fs
  .readdirSync('../Controller/Component')
  .filter((file) => file.endsWith('.js'))

function tokenizer(body) {
  ensureDirectoryExistence()
  run(body).catch(err => console.error(err))
}


function runService(workerData) {
  return new Promise((resolve, reject) => {
    for (const file of ISOviewTypes) {
      const worker = new Worker(`./Component/${file}`, { workerData })
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(
            new Error(`Stopped the Worker Thread with the exit code: ${code}`),
          )
      })
    }
  })
}

async function run(body) {
  const result = await runService(body)
  console.log(result)
}
function ensureDirectoryExistence() {
  if (fs.existsSync('../ISO_reports/')) {
    return true
  }
  fs.mkdirSync('../ISO_reports/')
}

module.exports = tokenizer