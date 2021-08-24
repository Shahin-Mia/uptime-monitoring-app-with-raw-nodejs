/* eslint-disable comma-dangle */
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// Module Scaffolding
const handler = {};

handler.checkHandler = (requestedProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
        handler._check[requestedProperties.method](requestedProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.get = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryString.id === 'string' &&
        requestedProperties.queryString.id.trim().length === 20
            ? requestedProperties.queryString.id
            : false;

    if (id) {
        data.read('checks', id, (err, checksData) => {
            if (!err && checksData) {
                const token =
                    typeof requestedProperties.headersObject.token === 'string'
                        ? requestedProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, parseJSON(checksData).userPhone, (isToken) => {
                    if (isToken) {
                        callback(200, parseJSON(checksData));
                    } else {
                        callback(403, {
                            error: 'Authentication Failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.post = (requestedProperties, callback) => {
    const protocol =
        typeof requestedProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1
            ? requestedProperties.body.protocol
            : false;
    const method =
        typeof requestedProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1
            ? requestedProperties.body.method
            : false;
    const url =
        typeof requestedProperties.body.url === 'string' &&
        requestedProperties.body.url.trim().length > 0
            ? requestedProperties.body.url
            : false;
    const successCodes =
        typeof requestedProperties.body.successCodes === 'object' &&
        requestedProperties.body.successCodes instanceof Array
            ? requestedProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestedProperties.body.timeoutSeconds === 'number' &&
        requestedProperties.body.timeoutSeconds % 1 === 0 &&
        requestedProperties.body.timeoutSeconds >= 1 &&
        requestedProperties.body.timeoutSeconds <= 5
            ? requestedProperties.body.timeoutSeconds
            : false;
    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : false;
        data.read('tokens', token, (err, tokenObj) => {
            if (!err && tokenObj) {
                const userPhone = parseJSON(tokenObj).phone;

                data.read('users', userPhone, (err1, userObj) => {
                    if (!err1 && userObj) {
                        tokenHandler._token.verify(token, userPhone, (isToken) => {
                            if (isToken) {
                                const user = parseJSON(userObj);
                                const userChecks =
                                    typeof user.checks === 'object' && user.checks instanceof Array
                                        ? user.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObj = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    data.create('checks', checkId, checkObj, (err2) => {
                                        if (!err2) {
                                            user.checks = userChecks;
                                            user.checks.push(checkId);
                                            data.update('users', userPhone, user, (err3) => {
                                                if (!err3) {
                                                    callback(200, checkObj);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        message: 'User has already reached max checks limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failure!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not Found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.put = (requestedProperties, callback) => {
    const protocol =
        typeof requestedProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1
            ? requestedProperties.body.protocol
            : false;
    const method =
        typeof requestedProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1
            ? requestedProperties.body.method
            : false;
    const url =
        typeof requestedProperties.body.url === 'string' &&
        requestedProperties.body.url.trim().length > 0
            ? requestedProperties.body.method
            : false;
    const successCodes =
        typeof requestedProperties.body.successCodes === 'object' &&
        requestedProperties.body.successCodes instanceof Array
            ? requestedProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestedProperties.body.timeoutSeconds === 'number' &&
        requestedProperties.body.timeoutSeconds % 1 === 0 &&
        requestedProperties.body.timeoutSeconds >= 1 &&
        requestedProperties.body.timeoutSeconds <= 5
            ? requestedProperties.body.timeoutSeconds
            : false;
    const id =
        typeof requestedProperties.body.id === 'string' &&
        requestedProperties.body.id.trim().length === 20
            ? requestedProperties.body.id
            : false;

    if (id) {
        if (protocol || method || successCodes || url || timeoutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const checkObj = parseJSON(checkData);

                    const token =
                        typeof requestedProperties.headersObject.token === 'string'
                            ? requestedProperties.headersObject.token
                            : false;

                    tokenHandler._token.verify(token, checkObj.userPhone, (isToken) => {
                        if (isToken) {
                            if (protocol) {
                                checkObj.protocol = protocol;
                            }
                            if (method) {
                                checkObj.method = method;
                            }
                            if (url) {
                                checkObj.url = url;
                            }
                            if (successCodes) {
                                checkObj.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObj.timeoutSeconds = timeoutSeconds;
                            }

                            data.update('checks', id, checkObj, (err1) => {
                                if (!err1) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in server side',
                                    });
                                }
                            });
                        } else {
                            callback(401, {
                                error: 'Authentication error!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in server side',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at least one field to update!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.delete = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryString.id === 'string' &&
        requestedProperties.queryString.id.trim().length === 20
            ? requestedProperties.queryString.id
            : false;

    if (id) {
        data.read('checks', id, (err, checksData) => {
            if (!err && checksData) {
                const token =
                    typeof requestedProperties.headersObject.token === 'string'
                        ? requestedProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, parseJSON(checksData).userPhone, (isToken) => {
                    if (isToken) {
                        data.delete('checks', id, (err1) => {
                            if (!err1) {
                                data.read(
                                    'users',
                                    parseJSON(checksData).userPhone,
                                    (err2, userData) => {
                                        if (!err2 && userData) {
                                            const userObj = parseJSON(userData);
                                            const userChecks =
                                                typeof userObj.checks === 'object' &&
                                                userObj.checks instanceof Array
                                                    ? userObj.checks
                                                    : [];

                                            const checkPosition = userChecks.indexOf(id);

                                            if (checkPosition > -1) {
                                                userChecks.splice(checkPosition, 1);
                                                userObj.checks = userChecks;

                                                data.update(
                                                    'users',
                                                    userObj.phone,
                                                    userObj,
                                                    (err3) => {
                                                        if (!err3) {
                                                            callback(200);
                                                        } else {
                                                            callback(500, {
                                                                error: 'There was a server side problem!',
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                callback(500, {
                                                    error: 'The check id that you have provided is not exists',
                                                });
                                            }
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in server side!',
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(500, {
                                    error: 'There was a problem in server side!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication Failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

module.exports = handler;
