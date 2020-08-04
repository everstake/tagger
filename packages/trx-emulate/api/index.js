const express = require('express');

const { Router } = express;

const walletRouter = require('./routes/wallet').default;

exports.default = () => {
  const app = Router();

  /* Register new routers here */
  walletRouter(app);

  return app;
};
