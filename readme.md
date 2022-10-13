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
|rimraf		     |`3.0.2`
|winston         |`3.8.1` 

## Pre-requisite
node-js <br />
Download Latest NSSM Release [here](https://nssm.cc/download)<br />

## Installation

Run `npm install`<br />
After installing npm packages run `npm run build`


## Windows Service Installation
Run `nssm install data-collector`<br />
Target data-collector.exe<br />


## Windows Environment Setup
Run `sysdm.cpl` <br />
Create a new System Environment variable for Client Credentials <br/>
* Client_ID: <`Client ID Credential`>
* Client_SECRET: <`Client Secret Credential`>
* CRON_Sched <`CRON schedule format configuration`>

