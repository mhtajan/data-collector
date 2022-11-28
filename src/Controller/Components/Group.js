const fetch = require(`node-fetch`)
const axios = require('axios')
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const sleep = require('sleep-promise')
const toCsv = require('../toCsv')

let opts = {
  pageSize: 500,
  pageNumber: 1,
}
let optsUser = {
  pageSize: 500,
  pageNumber: 1,
}


var groups = []
var members = []
var Sub = []
var Id = []

function ifExist(obj,arr_el,ele){
  if(obj.hasOwnProperty(`${ele}`)){
    return arr_el
  }
  else{
   return ""
  }
}

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
        await getUserProfile(token) //to get userid then use in subject
        getMember(token)
      }
      if (res.pageCount == res.pageNumber) {
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
              owner: `${owner.id}`,
              Address_extension: ``,
              Address_display: ``,
              Address_type: ``,
              Address_Mediatype: ``
            })
            if (entry.hasOwnProperty("addresses")) {
              if (entry.addresses.length > 0) {
                entry.addresses.forEach((addr) => {
                  arr.push({Id: `${entry.id}`,
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
        toCsv.main(arr, 'ISO_LIST_GROUP_ROLES', datetime)
      }
    })
    .catch((e) => loggers.error(e))
}

async function getSub(token) {
  user.forEach((id) => {
    axios({
      method: 'get',
      url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
      headers: { Authorization: 'Bearer ' + token },
    }).then(async (response) => {
      Sub.push(response.data)
    }).catch((e) => loggers.error(e, "at SUBJECTS LOOKUP"))
  })
  await sleep(2000)
  const arr = []
  Sub.forEach(async(entry) => {
    if (entry.hasOwnProperty('grants')) {
      entry.grants.forEach((grant) => {
        if (grant.role.hasOwnProperty('policies')) {
          grant.role.policies.forEach((policy) => {
            if (policy.hasOwnProperty('actions')) {
              policy.actions.forEach((action) => {
                if(action=="view"){
                  arr.push({
                    Id: `${entry.id}`,
                    Version: `${entry.version}`,
                    SelfUri: `${entry.selfUri}`,
                    Subject_Id: `${grant.subjectId}`,
                    Division_Id: `${grant.division.id}`,
                    Division_Name: `${grant.division.name}`,
                    Division_Desc: `${grant.division.description}`,
                    Division_selfUri: `${grant.division.selfUri}`,
                    Role_Id: `${grant.role.id}`,
                    Role_Name: `${grant.role.name}`,
                    Role_Description: `${grant.role.description}`,
                    Policy_Action: `${action}`,
                    Policy_Domain: `${policy.domain}`,
                    Policy_EntityName: `${policy.entityName}`
                  })
                }
              })
            }
            arr.push({
              Id: `${entry.id}`,
              Version: `${entry.version}`,
              SelfUri: `${entry.selfUri}`,
              Subject_Id: `${grant.subjectId}`,
              Division_Id: `${grant.division.id}`,
              Division_Name: `${grant.division.name}`,
              Division_Desc: `${grant.division.description}`,
              Division_selfUri: `${grant.division.selfUri}`,
              Role_Id: `${grant.role.id}`,
              Role_Name: `${grant.role.name}`,
              Role_Description: `${grant.role.description}`,
              Policy_Action: ``,
              Policy_Domain: `${policy.domain}`,
              Policy_EntityName: `${policy.entityName}`
            })
          })
        }
        arr.push({
          Id: `${entry.id}`,
          Version: `${entry.version}`,
          SelfUri: `${entry.selfUri}`,
          Subject_Id: `${grant.subjectId}`,
          Division_Id: `${grant.division.id}`,
          Division_Name: `${grant.division.name}`,
          Division_Desc: `${grant.division.description}`,
          Division_selfUri: `${grant.division.selfUri}`,
          Role_Id: `${grant.role.id}`,
          Role_Name: `${grant.role.name}`,
          Role_Description: `${grant.role.description}`,
          Policy_Action: ``,
          Policy_Domain: ``,
          Policy_EntityName: ``
        })
      })
    }
    arr.push({
      Id: `${entry.id}`,
      Version: `${entry.version}`,
      SelfUri: `${entry.selfUri}`,
      Subject_Id: ``,
      Division_Id: ``,
      Division_Name: ``,
      Division_Desc: ``,
      Division_selfUri: ``,
      Role_Id: ``,
      Role_Name: ``,
      Role_Description: ``,
      Policy_Action: ``,
      Policy_Domain: ``,
      Policy_EntityName: ``
    })
  })
  newarr = []
  arr.forEach((entry,index)=>{
    if(index>0){
      if(entry.Policy_Domain!=arr[index-1].Policy_Action&&entry.Policy_EntityName!=arr[index-1].Policy_EntityName){
        newarr.push(entry)
      }
    }
    
  })
  await sleep(3000)
  toCsv.main(newarr, 'SUBJECT_LOOKUP', datetime)
}

async function getMember(token) {
  Id.forEach(async (id) => {
    axios({
      method: 'get',
      url: `https://apps.mypurecloud.jp/platform/api/v2/groups/${id}/members`,
      headers: { Authorization: 'Bearer ' + token }
    }).then(async (response) => {
      res = response.data
      entities = res.entities
      entities.forEach((entry) => {
        members.push(entry)
      })
    }).catch((e) => loggers.error(e, "at MEMBER_LOOKUP"))
  })
  await sleep(1000)
  const arr = []
  members.forEach(async (entry) => {
    if (!entry.addresses.length >= 0) {
      arr.push({
        Id: `${entry.id}`,
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
    if (entry.primaryContactInfo.length > 0) {
      entry.primaryContactInfo.forEach(async (contact) => {
        if (entry.primaryContactInfo.length > 0) {
          entry.addresses.forEach(async (addr) => {
            arr.push({
              Id: `${entry.id}`,
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
        else {
          await arr.push({
            Id: `${entry.id}`,
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
    if (entry.addresses.length > 0 && entry.primaryContactInfo == 0) {
      await entry.addresses.forEach(async (addr) => {
        await arr.push({
          Id: `${entry.id}`,
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
  toCsv.main(arr, 'MEMBER_LOOKUP', datetime)
}
var user = []

async function getUserProfile(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body },
    params: optsUser,
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
      user.push(entry.id)
    })
    if(res.pageCount==res.pageNumber){
      getSub(body)
    }
    optsUser.pageNumber = optsUser.pageNumber + 1
    getUserProfile(body)
  }
}
module.exports = getGroup