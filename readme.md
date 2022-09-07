Installation
## Data Collector

Chinabank Data-Collector


|Dependencies    |Version   
|----------------|---------
|@vercel/ncc	 |`0.34.0`            
|axios           |`0.27.2`            
|copyfiles       |`2.4.1`
|D	             |`1.0.0`            
|download        |`8.0.0`            
|json2csv        |`5.0.7`
|moment          |`2.29.4`            
|node-cron       |`3.0.2`            
|node-fetch      |`2.6.1`
|pkg		     |`5.8.0`
|rimraf		     |`3.0.2`
|winston         |`3.8.1` 

## Pre-requisite
node-js
nssm


## Installation

Run `npm install`
After installing npm packages run `node run build`


## Windows Service Installation
Download Latest NSSM Release [here](https://nssm.cc/download)
Run `nssm install data-collector`
Target data-collector.exe
