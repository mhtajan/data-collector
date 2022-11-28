const axios = require('axios').default
const moment = require('moment')
var datetime = moment().format('YYYY-MM-DD')
var yesterday = moment().subtract(6, 'days').format('YYYY-MM-DD')
const tocsv = require('../toCsv')
const loggers = require('../Logger')

const userAct = []
const opts = {
  interval: `${yesterday}T00:00:00.000Z/${datetime}T00:00:00.000Z`, //test 1 day interval
  paging: {
    pageSize: 100,
    pageNumber: 1,
  },
}

async function getUserAct(body) {
  axios({
    method: 'post',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/analytics/users/details/query',
    headers: { Authorization: 'Bearer ' + body },
    data: opts,
  })
    .then(async (response) => {
      Loop(response.data, body)
    })
    .catch((e) => loggers.error(e))
}
async function Loop(res, body) {
  numberofLoops = Math.floor(res.totalHits / 100) + 1  
  if (opts.paging.pageNumber < numberofLoops) {
    userD = res.userDetails
    userD.forEach((user) => {
      userAct.push(user)
    })
    opts.paging.pageNumber = opts.paging.pageNumber + 1
    getUserAct(body)
  }
  else if (opts.paging.pageNumber == numberofLoops) {
    userD = res.userDetails
    userD.forEach((user) => {
      userAct.push(user)
    })
    getCsv()
  }
}
async function getCsv(){
  const arr = []
  userAct.forEach((entry) => {
    //arr.push({User_Id: `${entry.userId}`})
    if(entry.hasOwnProperty("primaryPresence")){
      entry.primaryPresence.forEach((presence) => {
        if (!entry.hasOwnProperty("routingStatus")) {
          arr.push({
            User_Id: `${entry.userId}`,
            Presence_start_time: `${presence.startTime}`,
            Presence_end_time: `${presence.endTime}`,
            Presence: `${presence.systemPresence}`,
            Organization_presence_id: `${presence.organizationpresenceId}`
          })
        }
        else {
          entry.routingStatus.forEach((route) => {
            arr.push({
              User_Id: `${entry.userId}`,
              Presence_start_time: `${presence.startTime}`,
              Presence_end_time: `${presence.endTime}`,
              Presence: `${presence.systemPresence}`,
              Organization_presence_id: `${presence.organizationPresenceId}`,
              Routing_start_time: `${route.startTime}`,
              Routing_end_time: `${route.endTime}`,
              Routing_status: `${route.routingStatus}`
            })
          })
        }
      })
    }
    else{
      entry.routingStatus.forEach((route) => {
        arr.push({
          User_Id: `${entry.userId}`,
          Routing_start_time: `${route.startTime}`,
          Routing_end_time: `${route.endTime}`,
          Routing_status: `${route.routingStatus}`
        })
      })
    }   
  })
  tocsv.main(arr,'ISO_USER_ACTIVITY_REPORT',datetime)
  return
}

module.exports = getUserAct