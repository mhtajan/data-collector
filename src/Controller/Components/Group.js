const fetch = require(`node-fetch`)
const axios = require('axios')
const {
  Parser,
  transforms: { unwind, flatten },
} = require('json2csv')
const json2csvParser = new Parser({
  transforms: [flatten({ objects: true, arrays: true })],
})
const subparser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const memberparser = new Parser({
  transforms: [
    unwind({ paths: ['fieldToUnwind'], blankOut: true }),
    flatten({ objects: true, arrays: true }),
  ],
})
const fs = require('fs')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const eol = require('eol')
const sql_conn = require('../sql_conn')
const sleep = require('sleep-promise')
let opts = {
  pageSize: 500,
  pageNumber: 1,
}

var groups = []
var members = []
var Sub = []
var Id = []

async function getGroup(token) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/groups',
    headers: { Authorization: 'Bearer ' + token },
    params: opts,
  })
    .then(async (response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach(async (entry) => {
          groups.push(entry)
          Id.push(entry.id)
        })
        opts.pageNumber = opts.pageNumber + 1
        getGroup(token)
        getSub(token)
        getMember(token)
      }
      if (res.pageCount == res.pageNumber){
        const arr = []
        groups.forEach((entry) => {
          entry.owners.forEach((owner) => {
            arr.push({
              Id: `${entry.id}`,
              name: `${entry.name}`,
              dateModified: `${entry.dateModified}`,
              memberCount: `${entry.memberCount}`,
              state: `${entry.state}`,
              version: `${entry.version}`,
              type: `${entry.type}`,
              rulesVisible: `${entry.rulesVisible}`,
              visibility: `${entry.visibility}`,
              chat_jabberId: `${entry.chat.jabberId}`,
              owner: `${owner.id}`
            })
            if (entry.hasOwnProperty("addresses")) {
              if (entry.addresses.length > 0) {
                entry.addresses.forEach((addr) => {
                  arr.push({
                    Id: `${entry.id}`,
                    name: `${entry.name}`,
                    dateModified: `${entry.dateModified}`,
                    memberCount: `${entry.memberCount}`,
                    state: `${entry.state}`,
                    version: `${entry.version}`,
                    type: `${entry.type}`,
                    rulesVisible: `${entry.rulesVisible}`,
                    visibility: `${entry.visibility}`,
                    chat_jabberId: `${entry.chat.jabberId}`,
                    owner: `${owner.id}`,
                    Address_extension: `${addr.extension}`,
                    Address_display: `${addr.display}`,
                    Address_type: `${addr.type}`,
                    Address_Mediatype: `${addr.mediaType}`
                  })
                })
              }
            }
          })
        })
        const csv = json2csvParser.parse(arr)
      let createdDateTime = new Date();
      var viewType = "ISO_LIST_GROUP_ROLES"
      var filename = `ISO_LIST_GROUP_ROLES_${datetime}`
      fs.writeFileSync(`./reports/ISO_LIST_GROUP_ROLES_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
      var path = process.cwd() + `\\reports\\` + filename
      var file_path = path + '.csv'
      var data = fs.readFileSync(file_path)
      var resp = data.toString().split('\n').length;
      const rowcount = resp - 2
      if (rowcount < 0) {
        rowcount = 0
      }
      await sql_conn.main(viewType, createdDateTime, filename, rowcount, file_path)
        .then(async (res) => {
        })
        .catch((ex) => logger.error(ex.message))
      loggers.info('ISO_LIST_GROUP_ROLES EXPORTED SUCCESSFULLY')
      }
    })
    .catch((e) => console.error(e))
}

async function getSub(token) {
Id.forEach((id)=>{
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
    headers: { Authorization: 'Bearer ' + token },
  }).then(async(response)=>{
    Sub.push(response.data)
  }).catch((e) => loggers.error(e, "at SUBJECTS LOOKUP"))
})
  await sleep(2000)
      const csv = subparser.parse(Sub)
      let createdDateTime = new Date();
      var viewType = "SUBJECT_LOOKUP"
      var filename = `SUBJECT_LOOKUP_${datetime}`
      fs.writeFileSync(`./reports/SUBJECT_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
        loggers.info('SUBJECT_LOOKUP EXPORTED SUCCESSFULLY')

    
}

async function getMember(token) {
Id.forEach(async(id)=>{
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/groups/${id}/members`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(async(response)=>{
    res = response.data
    entities = res.entities
        entities.forEach((entry) => {
          members.push(entry)
        })
  }).catch((e) => loggers.error(e, "at MEMBER_LOOKUP"))
})
      await sleep(1000)
      const arr = []
      members.forEach(async(entry)=>{
        if(!entry.addresses.length>=0){
          arr.push({Id:`${entry.id}`,
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
          Version: `${entry.version}`,
          acdAutoAnswer: `${entry.acdAutoAnswer}`
            })
        }
        if(entry.primaryContactInfo.length>0){
          entry.primaryContactInfo.forEach(async(contact)=>{
            if(entry.primaryContactInfo.length>0){
              entry.addresses.forEach(async(addr)=>{
                arr.push({Id:`${entry.id}`,
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
            Version: `${entry.version}`,
          acdAutoAnswer: `${entry.acdAutoAnswer}`
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
          Version: `${entry.version}`,
          acdAutoAnswer: `${entry.acdAutoAnswer}`
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
        Version: `${entry.version}`,
        acdAutoAnswer: `${entry.acdAutoAnswer}`
          })
        })
        } 
      })
      const newArray = arr.filter((item, index, arr) => {
        return index === arr.findIndex((foundItem) => {
          return foundItem.Id === item.Id && 
          foundItem.Contact_Display === item.Contact_Display &&
          foundItem.Contact_Address === item.Contact_Address &&
          foundItem.Contact_Extension === item.Contact_Extension &&
          foundItem.Contact_Type === item.Contact_Type &&
          foundItem.Address_Country_Code === item.Address_Country_Code &&
          foundItem.Address_Display === item.Address_Display;
          // 'name' should correspond to an identifying property of the objects
        })
      }) 
      const csv = memberparser.parse(newArray)
      
      let createdDateTime = new Date();
      var viewType = "MEMBER_LOOKUP"
      var filename = `MEMBER_LOOKUP_${datetime}`
      fs.writeFileSync(`./reports/MEMBER_LOOKUP_${datetime}.csv`, `${eol.split(csv).join(eol.lf)}\n`)
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
        loggers.info('MEMBER_LOOKUP EXPORTED SUCCESSFULLY')
    
}

module.exports = getGroup