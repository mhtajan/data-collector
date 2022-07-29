const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;



function info(body){
    logger.info(body)
}
function error(body){
    logger.error(body)
}
function debug(body){
    logger.debug(body)
}






const myFormat = printf(({ message, timestamp }) => {
    return `${timestamp}: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
    new transports.Console(),
    new transports.File({
        filename: 'app.log',
        level: 'info'
    }),
    new transports.File({
        filename: 'errors.log',
        level: 'error'
    }),
    new transports.File({
        filename: 'debug.log',
        level: 'debug'
    })
    ]
});
module.exports = { info, error, debug}