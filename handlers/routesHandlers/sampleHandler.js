// module scaffolding
const handlers = {};

handlers.sampleHandler = (requestedProperties, callback) => {
    callback(200, {
        message: 'This is the sample Handler',
    });
};

module.exports = handlers;
