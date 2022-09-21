const fs = require('fs')

async function tokenizer(token) {
  ensureDirectoryExistence()
  await Main(token)
}

async function Main(token){
  const Components = fs
  .readdirSync('./src/Controller/Components/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      const Worker = require(`./Components/${component}`)
      Worker(token)
    })
  )
}

function ensureDirectoryExistence() {
  if (!fs.existsSync('./ISO_reports/')) {
    fs.mkdirSync('./ISO_reports/')
  }
  
}

module.exports = tokenizer