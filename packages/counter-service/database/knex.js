const config = require('config');

const knexConfig = config.postgres;
knexConfig.connection.host =
  knexConfig.connection.host ||
  process.env.SOLANA_COUNTER_POSTGRES_CONNECTION_HOST;
knexConfig.connection.port =
  knexConfig.connection.port ||
  process.env.SOLANA_COUNTER_POSTGRES_CONNECTION_PORT;
knexConfig.connection.password =
  process.env.SOLANA_COUNTER_POSTGRES_CONNECTION_PASSWORD;

module.exports = require('knex')(knexConfig);
