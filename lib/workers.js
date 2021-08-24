// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const data = require('./data');

// module scaffolding
const workers = {};

// perform all the checks
workers.performCheck = (checkObj) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    let outcome = false;

    const parsedUrl = url.parse(`${checkObj.protocol}://${checkObj.url}`, true);
    const { hostname } = parsedUrl;
    const { path } = parsedUrl;

    const requestDetails = {
        protocol: `${checkObj.protocol}:`,
        hostname,
        path,
        method: checkObj.method.toUpperCase(),
        timeout: checkObj.timeoutSeconds * 1000,
    };

    const protocolToUse = checkObj.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        const status = res.statusCode;
        console.log(status, checkObj.url);

        // update to the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcome) {
            workers.processCheckOutcome(checkObj, checkOutCome);
            outcome = true;
        }
    });

    req.on('error', (err) => {
        checkOutCome = {
            error: true,
            value: err,
        };

        if (!outcome) {
            workers.processCheckOutcome(checkObj, checkOutCome);
            outcome = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };

        if (!outcome) {
            workers.processCheckOutcome(checkObj, checkOutCome);
            outcome = true;
        }
    });

    // request sent
    req.end();
};

// save the check outcome to database and send to next process
workers.processCheckOutcome = (checkObj, checkOutCome) => {
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        checkObj.successCodes.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    const alertWanted = !!(checkObj.lastChecked && checkObj.state !== state);

    const newCheckData = checkObj;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // pass to next process
                workers.alertUserToStateChange(newCheckData);
            } else {
                console.log('Alert is not need to send');
            }
        } else {
            console.log('Error trying to update one of the check data');
        }
    });
};

workers.alertUserToStateChange = (newCheckData) => {
    console.log(`Your provided url is ${newCheckData.state}`);
};

// Check Data Validation
workers.checkValidator = (checkData) => {
    const checkObj = checkData;
    if (checkData && checkData.id) {
        checkObj.state =
            typeof checkData.state === 'string' && ['up', 'down'].indexOf(checkData.state) > -1
                ? checkData.state
                : 'down';

        checkObj.lastChecked =
            typeof checkData.lastChecked === 'number' && checkData.lastChecked > 0
                ? checkData.lastChecked
                : false;

        // pass to next process
        workers.performCheck(checkObj);
    } else {
        console.log('Error: check is invalid or not properly formatted!');
    }
};

// get all the checks
workers.getherAllChecks = () => {
    data.getDataList('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                data.read('checks', check, (err1, checkData) => {
                    if (!err1 && checkData) {
                        // pass to data validator
                        workers.checkValidator(parseJSON(checkData));
                    } else {
                        console.log('Error: There is no Data with such checks id!');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process!');
        }
    });
};

// timer to execute the workers once per minute
workers.loop = () => {
    setInterval(() => {
        workers.getherAllChecks();
    }, 5000);
};

// initialize workers
workers.init = () => {
    workers.getherAllChecks();

    workers.loop();
};

// export workers module
module.exports = workers;
