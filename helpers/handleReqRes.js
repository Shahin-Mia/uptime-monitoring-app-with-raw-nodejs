// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routesHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

// Module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryString = parsedUrl.query;
    const headersObject = req.headers;

    const requestedProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryString,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestedProperties.body = parseJSON(realData);

        chosenHandler(requestedProperties, (statusCode, payload) => {
            const code = typeof statusCode === 'number' ? statusCode : 500;
            const payLoad = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payLoad);

            res.setHeader('Content-type', 'application/json');
            res.writeHead(code);
            res.end(payloadString);
        });
    });
};

module.exports = handler;
