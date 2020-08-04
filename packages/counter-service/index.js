require('dotenv').config();
const express = require('express');
const config = require('config');
const debug = require('debug')('solana-v0-counter-service: index.js');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require('./api').default;
// const subscription = require('./controllers/subscription');
const slotBySlot = require('./controllers/slot-by-slot');
const backup = require('./controllers/backup');

backup.softLaunch().then(() => {
  if (config.backup.active){
    backup.proceedBackup();
  }
  slotBySlot.proceedFromLastConfirmed();

  const options = {
    explorer: true
  };
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, options)
  );
  app.use('/', routes());
  app.use('/', (req, res) => {
    res.send('Alive');
  });

  app.listen(config.port, () => {
    debug('Listening on %o', config.port);
  });
});
