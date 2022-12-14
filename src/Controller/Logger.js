const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

function info(body){
    logger.info(body)
}
function error(body){
    logger.error(body)
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
        filename: `C:\\collector\\collector.log`,
        level: 'info'
    }),
    new transports.File({
        filename: 'C:\\collector\\errors.log',
        level: 'error'
    })
    ]
});
module.exports = { info, error}