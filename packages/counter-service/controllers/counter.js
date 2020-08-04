const debug = require('debug')(
  'solana-v0-counter-service: controllers/counter'
);

const counterService = require('../services/counter/counter');

/*
 * Get counters for given public key
 * */
async function getCounter(req, res) {
  try {
    return res.send(await counterService.getCounter(req.query.publicKey));
  } catch (err) {
    debug('getCounter err: %o', err);
    return res.status(500).send(err.message);
  }
}

module.exports = {
  getCounter
};
