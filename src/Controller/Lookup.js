const fs = require('fs')


async function Main(token){
  const Components = fs
  .readdirSync(__dirname+'/LookUp/')
  await process(Components, token)
}
async function process(components,token){
  await Promise.all(
    components.map(async(component)=>{
      const Worker = require(`./LookUp/${component}`)
      await Worker(token)
    })
  )
}


module.exports = Main