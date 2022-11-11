const axios = require('axios').default
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const eol = require('eol')
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const sql_conn = require('../sql_conn')
const sleep = require('sleep-promise')

let opts = {
  pageSize: 25, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}

var user = []

async function getUserProfile(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body },
    params: opts,
  })
    .then((response) => {
      Loop(response.data, body)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res, body) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      user.push(entry)
    })
  if(res.pageCount==res.pageNumber){
    tocsv()
  }
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile(body)
  }
}
async function tocsv(){
  const arr = []
  await user.forEach(async(entry)=>{
    if(!entry.addresses.length>=0){
      await arr.push({Id:`${entry.id}`,
      Name: `${entry.name}`,
      Division_Id: `${entry.division.id}`,
      Division_Name: `${entry.division.name}`,
      Chat_JabberId: `${entry.chat.jabberId}`,
      Email: `${entry.email}`,
      Contact_Display: ``,
        Contact_Address: ``,
        Contact_Mediatype: ``,
        Contact_Type: ``,
        Contact_Extension: ``,
        Address_Display: ``,
        Address_Mediatype: ``,
        Address_Type: ``,
        Address_Extension: ``,
        Address_Country_Code: ``,
      State: `${entry.state}`,
      Username: `${entry.username}`,
        })
    }
    if(entry.primaryContactInfo.length>=1){
      await entry.primaryContactInfo.forEach(async(contact)=>{
        if(entry.primaryContactInfo.length>0){
          await entry.addresses.forEach(async(addr)=>{
            await arr.push({Id:`${entry.id}`,
            Name: `${entry.name}`,
            Division_Id: `${entry.division.id}`,
            Division_Name: `${entry.division.name}`,
            Chat_JabberId: `${entry.chat.jabberId}`,
            Email: `${entry.email}`,
        Contact_Display: `${contact.display}`,
        Contact_Address: `${contact.address}`,
        Contact_Mediatype: `${contact.mediaType}`,
        Contact_Type: `${contact.type}`,
        Contact_Extension: `${contact.extension}`,
        Address_Display: `${addr.display}`,
        Address_Mediatype: `${addr.mediaType}`,
        Address_Type: `${addr.type}`,
        Address_Extension: `${addr.extension}`,
        Address_Country_Code: `${addr.countryCode}`,
        State: `${entry.state}`,
        Username: `${entry.username}`,
          })
        })
          
        }
        else{
          await arr.push({Id:`${entry.id}`,
          Name: `${entry.name}`,
          Division_Id: `${entry.division.id}`,
          Division_Name: `${entry.division.name}`,
          Chat_JabberId: `${entry.chat.jabberId}`,
          Email: `${entry.email}`,
      Contact_Display: `${contact.display}`,
      Contact_Address: `${contact.address}`,
      Contact_Mediatype: `${contact.mediaType}`,
      Contact_Type: `${contact.type}`,
      Contact_Extension: `${contact.extension}`,
      State: `${entry.state}`,
      Username: `${entry.username}`,
        })
        }  
      })
    }
    if(entry.addresses.length>0&&entry.primaryContactInfo==0){
      await entry.addresses.forEach(async(addr)=>{
        await arr.push({Id:`${entry.id}`,
        Name: `${entry.name}`,
        Division_Id: `${entry.division.id}`,
        Division_Name: `${entry.division.name}`,
        Chat_JabberId: `${entry.chat.jabberId}`,
        Email: `${entry.email}`,
    Address_Display: `${addr.display}`,
    Address_Mediatype: `${addr.mediaType}`,
    Address_Type: `${addr.type}`,
    Address_Extension: `${addr.extension}`,
    Address_Country_Code: `${addr.countryCode}`,
    State: `${entry.state}`,
    Username: `${entry.username}`,
      })
    })
    }    
  })
await sleep(2000)
const csv = json2csvParser.parse(arr)
    let createdDateTime = new Date();
    var viewType = "ISO_USER_PROFILE_REPORT"
    var filename = `ISO_USER_PROFILE_REPORT_${datetime}`
    fs.writeFileSync(`./reports/ISO_USER_PROFILE_REPORT_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
    var path = process.cwd() + `\\reports\\` + filename
    var file_path = path + '.csv'
    var data = fs.readFileSync(file_path)
    var resp = data.toString().split('\n').length;
    const rowcount = resp - 2
    if (rowcount < 0) {
      rowcount = 0
    }
    await sql_conn.main(viewType, createdDateTime, filename, rowcount, file_path)
      .then((res) => {
      })
      .catch((ex) => logger.error(ex.message))
    loggers.info('ISO_USER_PROFILE_REPORT EXPORTED SUCCESSFULLY')
}

module.exports = getUserProfile