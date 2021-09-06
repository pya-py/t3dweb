const fs = require('fs');
const path = require('path');

const logDirPath = path.resolve(__dirname, 'logs');
const reqsLogFilePath = path.resolve(logDirPath, 'reqs.json');

module.exports = (req, res, next) => {
    fs.exists(logDirPath, exists => { // learn new way plz
        if (!exists) {
            fs.mkdir(logDirPath, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
        saveRequestsLog(req);
        next();
    });
};

const saveRequestsLog = req => {
    fs.readFile(reqsLogFilePath, (err, data) => {
        if (err) {
            console.log(err);
            if (err.code === 'ENOENT') {
                try {
                    data = '[]';
                    fs.writeFileSync(reqsLogFilePath, data);
                    console.log('reqs log file created!');
                } catch (ex) {
                    console.log(ex);
                }

            }
        }
        try {
            let objReqsLog = JSON.parse(data);
            objReqsLog.push({ url: req.baseURl, headers: req.headers, date: Date.now() }); /*body: req.body,*/
            data = JSON.stringify(objReqsLog);
            fs.writeFileSync(reqsLogFilePath, data);
        } catch (ex) {
            console.log(ex);
        }
    });
}