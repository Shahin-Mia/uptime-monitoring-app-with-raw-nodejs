// dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// Module Scaffolding
const handler = {};

handler.userHandler = (requestedProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
        handler._user[requestedProperties.method](requestedProperties, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.get = (requestedProperties, callback) => {
    const phone =
        typeof requestedProperties.queryString.phone === 'string' &&
        requestedProperties.queryString.phone.trim().length === 11
            ? requestedProperties.queryString.phone
            : false;
    if (phone) {
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err, userString) => {
                    if (err) {
                        callback(404, {
                            message: 'There is problem with this user!',
                        });
                    } else {
                        const user = { ...parseJSON(userString) };
                        delete user.password;
                        callback(200, user);
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'There is a problem with this user!',
        });
    }
};

handler._user.post = (requestedProperties, callback) => {
    const firstName =
        typeof requestedProperties.body.firstName === 'string' &&
        requestedProperties.body.firstName.trim().length > 0
            ? requestedProperties.body.firstName
            : false;

    const lastName =
        typeof requestedProperties.body.lastName === 'string' &&
        requestedProperties.body.lastName.trim().length > 0
            ? requestedProperties.body.lastName
            : false;
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

    const tosAgreement =
        typeof requestedProperties.body.tosAgreement === 'boolean'
            ? requestedProperties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exists
        data.read('users', phone, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'User was created successfully!',
                        });
                    } else {
                        console.log(err2);
                        callback(500, { error: 'Could not create user!' });
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
            error: 'You have a problem in your request',
        });
    }
};

handler._user.put = (requestedProperties, callback) => {
    const firstName =
        typeof requestedProperties.body.firstName === 'string' &&
        requestedProperties.body.firstName.trim().length > 0
            ? requestedProperties.body.firstName
            : false;

    const lastName =
        typeof requestedProperties.body.lastName === 'string' &&
        requestedProperties.body.lastName.trim().length > 0
            ? requestedProperties.body.lastName
            : false;

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

    if (phone) {
        if (firstName || lastName || password) {
            const token =
                typeof requestedProperties.headersObject.token === 'string'
                    ? requestedProperties.headersObject.token
                    : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    data.read('users', phone, (err, udata) => {
                        const userData = { ...parseJSON(udata) };
                        if (!err && udata) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            data.update('users', phone, userData, (err1) => {
                                if (err1) {
                                    callback(500, {
                                        error: 'There is a problem in server side!',
                                    });
                                } else {
                                    callback(200, {
                                        message: 'User updated successfully!',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request!',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication failure!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number, please try again',
        });
    }
};

handler._user.delete = (requestedProperties, callback) => {
    const phone =
        typeof requestedProperties.queryString.phone === 'string' &&
        requestedProperties.queryString.phone.trim().length === 11
            ? requestedProperties.queryString.phone
            : false;

    if (phone) {
        const token =
            typeof requestedProperties.headersObject.token === 'string'
                ? requestedProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err) => {
                    if (err) {
                        callback(404, {
                            error: 'There is no user exists!',
                        });
                    } else {
                        data.delete('users', phone, (error) => {
                            if (error) {
                                callback(500, {
                                    error: 'There is a server side problem!',
                                });
                            } else {
                                callback(200, {
                                    message: 'The user has been removed successfully!',
                                });
                            }
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(500, {
            error: 'There is a server side problem!',
        });
    }
};

module.exports = handler;
