const fs = require('fs');

let errLogger = (err ,req, res, next) =>{
    if(err){
        let data = new Date() + " - " + err.stack + '\n';
        fs.appendFile('./errorLogger.txt', data, errorInAppending => {
            if(errorInAppending){
                throw new Error("Error in errorLogger");
            }
        })
        if(err.status){
            res.status(err.status)
        }else{
            res.status(500)
        }
    }
    next();
}

module.exports = errLogger ;