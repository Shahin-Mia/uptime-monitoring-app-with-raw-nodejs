const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// Module scaffolding - object
const server = {};

// Create server
server.createServer = () => {
    const createdServer = http.createServer(server.handleReqRes);
    createdServer.listen(environment.port, () => {
        console.log(`listening to the port ${environment.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// Start server
server.init = () => {
    server.createServer();
};

module.exports = server;
