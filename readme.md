## Data Collector

Chinabank Data-Collector


|Dependencies    |Version   
|----------------|---------           
|axios           |`0.27.2`                    
|download        |`8.0.0`            
|json2csv        |`5.0.7`
|moment          |`2.29.4`
|nexe            |`4.0.0-rc.1`            
|node-cron       |`3.0.2`            
|node-fetch      |`2.6.1`
|pkg		     |`5.8.0`
|rimraf		     |`3.0.2`
|winston         |`3.8.1` 

## Pre-requisite
node-js <br />
nssm <br />


## Installation

Run `npm install`<br />
After installing npm packages run `node run build`


## Windows Service Installation
Download Latest NSSM Release [here](https://nssm.cc/download)<br />
Run `nssm install data-collector`<br />
Target data-collector.exe<br />

## Updates
Now using environment variables for Client Credentials instead of JSON <br/>
Loads JS files on execution <br/>
Compiled all JS files into one executable <br/>
Removed worker_threads <br/>
Now using Nexe instead of ncc/vercel and PKG for building executable
