const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const sleep = require('sleep-promise')
const toCsv = require('../toCsv')

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
toCsv.main(arr,'ISO_USER_PROFILE_REPORT',datetime)
}

module.exports = getUserProfile