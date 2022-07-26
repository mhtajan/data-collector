const download = require("download");
const moment = require(`moment`)
const fetch = require(`node-fetch`)
var datetime = moment().format('YYYY_MM_DD_hh_mm_ss.SSSSS');



function entityhandler(body, token) {

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      ContentType: `application/json`,
    },
  }

  body.forEach((entry)=>{
    const fileoption = {
      filename: `${entry.viewType}_${datetime}.csv`
    }
    if(entry.viewType=="INTERACTION_SEARCH_VIEW")
    {
      if(entry.status.includes("COMPLETED")){
        fetch(entry.downloadUrl, options).then((res)=>{
         download(res.url,'./reports',fileoption).then(()=>{
          console.log(`Complete Downloading - ${Object.values(fileoption)}`)
         })
        })
        .catch(e => console.error(e));
     }
     else{
       
     }
    }
    
  })
}


module.exports = entityhandler