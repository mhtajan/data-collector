const fs = require('fs')
const sleep = require('sleep-promise')


async function Main(token){
  const Components = fs
  .readdirSync(__dirname+'/LookUp/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      await sleep(1000)
      const Worker = require(`./LookUp/${component}`)
      await Worker(token)
    })
  )
}


module.exports = Main