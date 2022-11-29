const eol = require('eol')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [flatten({ objects: true, arrays: true })],
})
const fs = require('fs')
const loggers = require('./Logger')
const sql_conn = require('./sql_conn')

module.exports = {
  async main(arr,viewType,datetime){
    if(!arr.length){
       loggers.error(`${viewType} does not have any data to be exported`)
      }
      else {
        csv = json2csvParser.parse(arr)
        let createdDateTime = new Date();
        var filename = `${viewType}_${datetime}`
        fs.writeFileSync(`c:\\collector\\reports\\${viewType}_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
        var path = 'c:\\collector\\reports\\' + filename
        var file_path = path + '.csv'
        const rowcount = csv.toString().split('\n').length - 2;
        if (rowcount < 0) {
            rowcount = 0
        }
        await sql_conn.main(viewType, createdDateTime, filename, rowcount, file_path)
            .then((res) => {})
            .catch((ex) => logger.error(ex.message))
        loggers.info(`${viewType} EXPORTED SUCCESSFULLY`)
      }   
    }
}