const fs = require('fs')
const ISOviewTypes = fs
  .readdirSync('./ISO')
  .filter((file) => file.endsWith('.js'))

function tokenizer(body) {
  ensureDirectoryExistence()
  for (const file of ISOviewTypes) {
    const IsoVT = require(`./ISO/${file}`)
    //console.log(file)
    IsoVT(body)
  }
}

function ensureDirectoryExistence(){
  if(fs.existsSync("./ISO_reports/"))
  {
    return true;
  }
  fs.mkdirSync("./ISO_reports/")
}
module.exports = tokenizer
