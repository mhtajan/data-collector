const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
const fs = require("fs")
var sql = require("mssql");
var dbConn = require("./config");
const { sqlconfig } = require("./config");
require('dotenv').config()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
else {
  console.log("Azure Storage Connection found")
}
// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

module.exports = {
  async main(viewType,createdDateTime,filename,rowcount,file_path) {
    // Create a unique name for the container
    const containerName = "reportfiles";

    // console.log("\nCreating container...");
    // console.log("\t", containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create the container
    try 
      {
      const createContainerResponse = await containerClient.create();
      console.log(`Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`);
      const uploadFileResponse = await this.uploadFile(viewType,createdDateTime,filename,rowcount,file_path,containerName)
      return {
        uploadFileResponse
      }
      } catch (error) {
        // console.log(error.message);
        if (error.message.includes('The specified container already exists.')) {
          // console.log('Container Exists')
          const uploadFileResponse = await this.uploadFile(viewType,createdDateTime,filename,rowcount,file_path,containerName)
          return {
            uploadFileResponse
          }
        }
      }  
  },

  async uploadFile(viewType,createdDateTime,filename,rowcount,file_path,containerName) {
    try {
      // Create a unique name for the blob
      const blobName = filename + ".csv";
      const data = fs.readFileSync(file_path);

      // Get a block blob client
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Display blob name and url
      console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);

      // Upload data to the blob
      const uploadBlobResponse = await blockBlobClient.upload(data.toString(), data.toString().split('\n').length);
      console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);
      sql.connect(sqlconfig, function (res,err) {
        const ps = new sql.PreparedStatement();
        ps.input("file_name", sql.NVarChar);
        ps.input("run_date",sql.DateTime);
        ps.input("file_path", sql.NVarChar);
        ps.input("extracted_quantity", sql.BigInt)
        ps.prepare(
          "exec sp_insertTasks 'tasks', @file_name, @run_date, @file_path, @extracted_quantity",
          (err) => {
            ps.execute(
              { 
                file_name: viewType,
                run_date: createdDateTime,
                file_path: blockBlobClient.url,
                extracted_quantity: rowcount,
              },
              function (err, res) {
                if (err) {
                  console.log("error:", err);
                } else {
                  console.log(`Tasks added successfully - ${filename}`);
                }
                ps.unprepare((err) => {});
              });
          });
      })
      return 'Uploaded and inserted successfully'

    }
    catch(error) {
      console.error(error)
    }
  }
}

// this.main('AGENT_EVALUATION_DETAIL_VIEW_2022-09-19_04e92586-37a9-4a82-8816-5b0c63510b56',"C:\\Users\\Administrator\\Desktop\\Chinabank - Data Collector\\data-collector\\reports\\AGENT_EVALUATION_DETAIL_VIEW_2022-09-19_04e92586-37a9-4a82-8816-5b0c63510b56.csv")
// .then((res) => {
//   console.log('Done',res.uploadFileResponse)
//   console.log(res.uploadFileResponse.blockBlobClient.url)
// }
// )
// .catch((ex) => console.log('mes',ex.message));
