const fs = require('fs')



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
  if (!fs.existsSync('./ISO_reports/')) {
    fs.mkdirSync('./ISO_reports/')
  }
  
}

module.exports = tokenizer