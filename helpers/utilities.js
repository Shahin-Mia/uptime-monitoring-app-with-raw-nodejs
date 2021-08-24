/* eslint-disable comma-dangle */
// dependencies
const crypto = require('crypto');
const environment = require('./environments');

// module scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
    let object;

    try {
        object = JSON.parse(jsonString);
    } catch (error) {
        object = {};
    }

    return object;
};

// hash the password
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHash('sha256', environment.secretKey).update(str).digest('hex');

        return hash;
    }
    return false;
};

utilities.createRandomString = (strLength) => {
    const length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    let output = '';
    const possibleCharacter = 'abcdefghijklmnopqrstuvwxyz123456890';
    for (let i = 1; i <= length; i += 1) {
        const random = possibleCharacter.charAt(
            Math.floor(Math.random() * possibleCharacter.length)
        );
        output += random;
    }
    return output;
};
module.exports = utilities;
