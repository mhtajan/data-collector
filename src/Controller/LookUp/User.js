const axios = require('axios').default
const moment = require('moment')
const sleep = require("sleep-promise")
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../toCsv')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
  state: 'active', // String | Only list users of this state
}

var user = []
async function load(token){
    client.setAccessToken(token)
    getUserProfile()
}
async function getUserProfile() {
    let userInstance = new platformClient.UsersApi()
    userInstance
    .getUsers(opts) 
    .then((response) => {
      Loop(response)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res) {
  if (res.pageCount >= res.pageNumber) {
    entities = res.entities
    entities.forEach((entry) => {
      user.push(entry)
     
    })
    opts.pageNumber = opts.pageNumber + 1
    getUserProfile()
  }
  else{
    
    saveCsv()
  }
}
async function saveCsv(){
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
    toCsv.main(newArray,'USERID_LOOKUP',datetime)
}
module.exports = load