const debug = require('debug')('trx-emulate: index,js');
const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  explorer: true
};
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);
const routes = require('./api').default;

app.use('/', routes());

app.listen(config.port, () => {
  debug('Listening on %o', config.port);
});
