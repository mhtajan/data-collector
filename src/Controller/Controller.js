const fs = require('fs')
const logger = require('./Logger')


function tokenizer(body) {
  ensureDirectoryExistence()
  Main(body)
}

function Main(body){
  const Components = fs
  .readdirSync('./src/Controller/Components')
  .forEach((file)=>{
    const Worker = require(`./Components/${file}`)
    Worker(body)
  })
}

function ensureDirectoryExistence() {
  if (fs.existsSync('./ISO_reports/')) {
    return true
  }
  fs.mkdirSync('./ISO_reports/')
}

module.exports = tokenizer