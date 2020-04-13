const start_http = require('./http_server.js').start;
const http_port = 1234;

start_http(http_port);

console.log('Starting HTTP server at http://localhost:1234');
