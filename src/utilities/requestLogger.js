const fs = require('fs');

let requestLogger = (req, res, next) => {
    let dataUrl = new Date() + " - " + req.ip + " - " + req.url + '\n';
    fs.appendFile('./requestlogger.txt', dataUrl , (err)=>{
        if(err){
            console.log("Request logger error");
        }else{
            next();
        }
    });
}

module.exports = requestLogger;