const fs = require('fs')

async function tokenizer(token) {
  await ensureDirectoryExistence()
  await Main(token)
}

async function Main(token){
  const Components = fs
  .readdirSync(__dirname+'/Components/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      const Worker = require(`./Components/${component}`)
      await Worker(token)
    })
  )
}

async function ensureDirectoryExistence() {
  if (!fs.existsSync('./ISO_reports/')) {
    fs.mkdirSync('./ISO_reports/')
  }
  
}

module.exports = tokenizer