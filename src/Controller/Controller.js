const fs = require('fs')
const sleep = require('sleep-promise')
async function Main(token){
  const Components = fs
  .readdirSync(__dirname+'/Components/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      const Worker = require(`./Components/${component}`)
      await sleep(1000)
      await Worker(token)
    })
  )
}


module.exports = Main