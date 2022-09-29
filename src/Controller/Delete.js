const logger = require(`./Logger`)
const axios = require(`axios`);
const sleep = require('sleep-promise')
let opts = {
    pageNumber: 1,
    pageSize: 500
}
async function deleter(token){
  deleteExport(token)
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
        if (res.total == 0 && res.pageCount ==0){
          logger.info("Deleted all export")
        }
        if(res.total !=0){
          entity.map(async (entry)=>{
               axios({
                  method: "delete",
                  url: `https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports/${entry.id}/history/${entry.runId}`,
                  headers: { Authorization: "Bearer " + token }
              })
              .then(()=>{
                console.log("success delete")
              })
              .catch((err)=>{
                  console.log(err.message)
                  deleteExport(token)
              })
          })
          opts.pageNumber = opts.pageNumber + 1;
          deleteExport(token);
        } 
      })
      .catch((err)=>{
        console.log("1")
        console.log(err.message)
      })
}
}


module.exports = deleter