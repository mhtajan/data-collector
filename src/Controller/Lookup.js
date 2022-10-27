const fs = require('fs')


async function Main(token){
  const Components = fs
  .readdirSync(__dirname+'/Lookup/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      const Worker = require(`./Lookup/${component}`)
      await Worker(token)
    })
  )
}


module.exports = Main