const axios = require('axios').default

const opts = {
  interval: '2022-07-22T08:00:00/2022-07-27T08:00:00',
  paging: {
    pageSize: 100,
    pageNumber: 1,
  },
}
function getUserAct(body) {
  axios({
    method: 'post',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/analytics/users/details/query',
    headers: { Authorization: 'Bearer ' + body.access_token },
    data: opts,
  })
    .then((response) => {
      //increment and recursion to be added
      //console.log(JSON.stringify(response.data,null,2))
    })
    .catch((e) => console.error(e))
}
module.exports = getUserAct
