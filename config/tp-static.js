'use strict';

const frontendConfig = require('./tp-frontend');

exports.id = 'tp-static';

exports.modules = [
  'h5-express/static',
  'httpServer'
];

exports.httpServer = {
  expressId: 'h5-express/static',
  host: '0.0.0.0',
  port: 81
};

exports['h5-express/static'] = {
  staticPath: frontendConfig.express.staticPath,
  staticBuildPath: frontendConfig.express.staticBuildPath,
  ejsAmdHelpers: frontendConfig.express.ejsAmdHelpers
};
