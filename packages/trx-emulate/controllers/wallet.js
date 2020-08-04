const debug = require('debug')('trx-emulate: controllers/wallet');

const walletService = require('../services/wallet');

async function getBalance(req, res) {
  try {
    return res.json({
      balance: await walletService.getBalance(req.body.publicKey)
    });
  } catch (err) {
    debug('getBalance err: %o', err);
    return res.status(500).send(err.message);
  }
}

async function getTransaction(req, res) {
  try {
    return res.send(await walletService.getTransaction(req.query.hash));
  } catch (err) {
    debug('getTransaction err: %o', err);
    return res.status(500).send(err.message);
  }
}

async function sendToMemo(req, res) {
  try {
    return res.json({ result: await walletService.sendToMemo(req.body.data) });
  } catch (err) {
    debug('sendToMemo err: %o', err);
    return res.status(500).send(err.message);
  }
}

module.exports = {
  getBalance,
  sendToMemo,
  getTransaction
};
