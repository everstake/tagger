const express = require('express');

const router = express.Router();

const counterController = require('../../controllers/counter');

exports.default = app => {
  app.use('/counter', router);

  router.get('/', counterController.getCounter);
};
