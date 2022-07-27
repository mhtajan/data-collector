const axios = require('axios').default
function getUserProfile(body) {
  let opts = {
    pageSize: 25, // Number | Page size
    pageNumber: 1, // Number | Page number
    state: 'active', // String | Only list users of this state
  }

  // Get the list of available users.
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body.access_token },
    params: opts,
  })
    .then((response) => {
      //increment and recursion to be added
      //console.log(response.data)
    })
    .catch((e) => console.error(e))
}

module.exports = getUserProfile
