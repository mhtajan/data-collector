const fs = require('fs')
const ISOviewTypes = fs
  .readdirSync('./ISO')
  .filter((file) => file.endsWith('.js'))

function tokenizer(body) {
  for (const file of ISOviewTypes) {
    const IsoVT = require(`./ISO/${file}`)
    console.log(file)
    IsoVT(body)
  }
}

module.exports = tokenizer
