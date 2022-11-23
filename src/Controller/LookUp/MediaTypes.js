const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY_MM_DD')
const loggers = require('../Logger')
const platformClient = require('purecloud-platform-client-v2')
const toCsv = require('../toCsv')
const client = platformClient.ApiClient.instance
client.setEnvironment('mypurecloud.jp')

let opts = {
  pageSize: 500, // Number | Page size
  pageNumber: 1, // Number | Page number
}

var mediatypes = []
async function load(token){
    await client.setAccessToken(token)
    getRoutingAvailablemediatype()
}
async function getRoutingAvailablemediatype() {
 let mediaInstance = new platformClient.RoutingApi();
  await mediaInstance
    .getRoutingAvailablemediatypes(opts) 
    .then((data) => {
        entities = data.entities
        entities.forEach((entry) => {
            mediatypes.push(entry)
        })
        const arr = []
        mediatypes.forEach((entry)=>{
          if(entry.availableSubTypes.length>0){
            entry.availableSubTypes.forEach((subtype)=>{
              arr.push({mediaType: `${entry.mediaType}`,
            Available_subtype: `${subtype}`})
            })
          }
          else{
            arr.push({mediaType: `${entry.mediaType}`})
          }
        }
        )
        toCsv(arr,'MEDIATYPES_LOOKUP',datetime)
    })
    .catch((e) => loggers.error(e))
}

module.exports = load