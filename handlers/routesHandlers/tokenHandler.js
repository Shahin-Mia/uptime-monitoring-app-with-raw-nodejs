// dependencies
const data = require('../../lib/data');
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

// token handler
handler.tokenHandler = (requestedProperties, callback) => {
    const acceptedMethods = ['get', 'put', 'delete', 'post'];
    if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
        handler._token[requestedProperties.method](requestedProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestedProperties, callback) => {
    const phone =
        typeof requestedProperties.body.phone === 'string' &&
        requestedProperties.body.phone.trim().length === 11
            ? requestedProperties.body.phone
            : false;

    const password =
        typeof requestedProperties.body.password === 'string' &&
        requestedProperties.body.password.trim().length > 0
            ? requestedProperties.body.password
            : false;
    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password && !err) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObj = {
                    phone,
                    id: tokenId,
                    expires,
                };

                // store token to database
                data.create('tokens', tokenId, tokenObj, (err1) => {
                    if (err1) {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });
                    } else {
                        callback(200, tokenObj);
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};
handler._token.get = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryString.id === 'string' &&
        requestedProperties.queryString.id.trim().length === 20
            ? requestedProperties.queryString.id
            : false;
    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (err) {
                callback(500, {
                    error: 'There was an error in server side!',
                });
            } else {
                const token = { ...parseJSON(tokenData) };
                callback(200, token);
            }
        });
    } else {
        callback(400, {
            error: 'There is a problem in your request!',
        });
    }
};

handler._token.put = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.body.id === 'string' &&
        requestedProperties.body.id.trim().length === 20
            ? requestedProperties.body.id
            : false;
    const extend =
        typeof requestedProperties.body.extend === 'boolean' && requestedProperties.body.extend > 0
            ? requestedProperties.body.extend
            : false;

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            const token = parseJSON(tokenData);
            if (token.expires > Date.now()) {
                token.expires = Date.now() + 3600 * 1000;
                data.update('tokens', id, token, (err1) => {
                    if (err1) {
                        callback(500, {
                            error: 'There is a problem in server side!',
                        });
                    } else {
                        callback(200);
                    }
                });
            } else {
                callback(400, {
                    message: 'Token has already expired!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a problem in your request!',
        });
    }
};

handler._token.delete = (requestedProperties, callback) => {
    const id =
        typeof requestedProperties.queryString.id === 'string' &&
        requestedProperties.queryString.id.trim().length === 20
            ? requestedProperties.queryString.id
            : false;
    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (err1) => {
                    if (err1) {
                        callback(500, {
                            error: 'There was a server side error',
                        });
                    } else {
                        callback(200, {
                            message: 'Token was successfully deleted',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was an error in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a problem in your request!',
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            const tokenObj = parseJSON(tokenData);
            if (tokenObj.phone === phone && tokenObj.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
