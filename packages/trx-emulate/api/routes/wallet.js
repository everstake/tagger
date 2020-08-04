const express = require('express');

const router = express.Router();

const walletController = require('../../controllers/wallet');

exports.default = app => {
  app.use('/wallet', router);
  router.get('/balance', walletController.getBalance);
  router.get('/getTransaction', walletController.getTransaction);

  router.post('/sendMemo', walletController.sendToMemo);
};
