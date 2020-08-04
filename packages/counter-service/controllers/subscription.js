const debug = require('debug')(
  'solana-v0-counter-service: controllers/subscription'
);
const config = require('config');
const WebSocket = require('ws');

const { Connection, PublicKey } = require('@solana/web3.js');

const { connection } = config;
const solanaClient = new Connection(connection.http);

const solanaWS = new WebSocket(connection.ws);

solanaWS.onopen = async () => {
  solanaWS.send(
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'programSubscribe',
      params: [config.memo.address, { commitment: 'single' }]
    })
  );
  solanaWS.onmessage = event => {
    debug('EVENT FROM NODE: %o', event);
  };
};

solanaClient.onAccountChange(
  new PublicKey('5UdwGv8NZ23EFf159DMY46935zfLxsEESg7jeY9AAnbz'),
  event => {
    debug(event);
  }
);

solanaWS.onerror = err => {
  debug('err %o', err);
};

solanaWS.onclose = event => {
  debug(event);
};
