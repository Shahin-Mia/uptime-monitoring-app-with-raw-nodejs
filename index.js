// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Module scaffolding - object
const app = {};

// Create server
app.init = () => {
    // start the server
    server.init();

    // start the workers
    workers.init();
};

// Start the app
app.init();
