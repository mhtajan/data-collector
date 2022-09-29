const logger = require(`./Logger`)
const axios = require(`axios`);
const sleep = require('sleep-promise')
let opts = {
    pageNumber: 1,
    pageSize: 500
}

async function deleteExport(token){
    axios({
        method: "get",
        url: "https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports",
        headers: { Authorization: "Bearer " + token },
        params: opts,
      })
      .then(async(response)=>{
        res = response.data
        entity = res.entities;
        if(res.pageCount >= res.pageNumber){
          entity.map(async(entry)=>{
            await sleep(100)
               axios({
                  method: "delete",
                  url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${entry.id}/history/${entry.runId}`,
                  headers: { Authorization: "Bearer " + token }
              })
              .catch((err)=>{
                  console.log(err.message)
              })
          })
          opts.pageNumber = opts.pageNumber + 1;
          deleteExport(token);
        } else if (res.total == 0 && res.pageCount ==0){
          logger.info("Deleted all export")
        }
        
      })
      .catch((err)=>{
        console.log(err.message)
      })
}

module.exports = deleteExport