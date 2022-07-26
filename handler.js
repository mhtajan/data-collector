const fetch = require(`node-fetch`)
const ent_handle = require(`./exporting/INTERACTION_SEARCH_VIEW.js`)

function getReport(body) {
  return fetch(`https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${body.token_type} ${body.access_token}`
    }
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then(jsonResponse => {

      if (jsonResponse.pageCount >= jsonResponse.pageNumber) {
        //there is data
        //console.log(jsonResponse.entities)
        ent_handle( jsonResponse.entities, body.access_token)
      }
      else if (jsonResponse.total == 0) {
        console.log("there is no data")
      }
      else {

      }
    })
    .catch(e => console.error(e));
}

module.exports = getReport