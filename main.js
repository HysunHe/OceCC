/* 
 * This is just an sample implementation to support Line integration. Not for Prod.
 * 
 * WeChatConnector.js - for wechat integration. 
 * 
 * Author: Hysun He
 */

// Modules Import
const Constants = require('./utils/Constants');
const http = require('http');
const express = require('express');
const cors = require('cors');
const logger = require('./utils/Logger');

const moduleName = 'ConnectorServer';
const serviceUrl = '/components';

// initialize express
const app = express();
app.use(cors());
const server = http.createServer(app);

const cc = require('./service');
cc(app, serviceUrl);

server.listen(Constants.HTTP_PORT, function () {
    logger.info(moduleName, 'Listening on ' + server.address().port);
});

module.exports = server;
