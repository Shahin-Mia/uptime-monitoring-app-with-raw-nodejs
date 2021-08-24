const handlers = {};

handlers.notFoundHandler = (requestedProperties, callback) => {
    callback(404, {
        message: 'Your requested url was not Found!',
    });
};

module.exports = handlers;
