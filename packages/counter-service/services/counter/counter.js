const debug = require('debug')(
  'solana-v0-counter-service: controllers/counter'
);

const knex = require('../../database/knex');
const { tables } = require('../../database/info');
const { counterInstructions, requiredFields } = require('./counter.constants');

/*
 * Create counter with provided params
 *
 * @param   {String}  publicKey   Signer of instruction transaction public key
 * @param   {String}  label       Label for further filtering
 * @param   {String}  resourceId  Resource id for further filtering
 * */
async function createCounter({ publicKey, label, resourceId }) {
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();

  try {
    await trx.raw(
      `
            INSERT INTO ${tables.COUNTERS} (owner, label, id) VALUES (?, ?, ?)
            ON CONFLICT DO NOTHING
        `,
      [publicKey, label, resourceId]
    );
    await trx.commit();
    debug(
      'counter created: publicKey: %o, resourceId: %o',
      publicKey,
      resourceId
    );
  } catch (err) {
    debug('createCounter err: %o', err);
    await trx.rollback();
  }
}

/*
 * Increment counter by followed params
 *
 * @param   {String}  publicKey   Signer of instruction transaction public key
 * @param   {String}  label       Label for further filtering
 * @param   {String}  resourceId  Resource id for further filtering
 * */
async function incrementCounter({ publicKey, label, resourceId }) {
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();

  try {
    const res = await trx
      .raw(
        `
            UPDATE ${tables.COUNTERS} SET count = count + 1
            WHERE owner = ? AND label = ? AND id = ?
            RETURNING count
        `,
        [publicKey, label, resourceId]
      )
      .then(result => {
        return result.rows[0];
      });
    await trx.commit();
    if (res.count) {
      debug(
          'counter incrementCounter: publicKey: %o, resourceId: %o, count: %o',
          publicKey,
          resourceId,
          res.count
      );
    }
  } catch (err) {
    debug('incrementCounter err: %o', err);
    await trx.rollback();
  }
}
/*
 * Validate instruction data
 *
 * @param   {JSON}  data   Instruction with defined JSON schema
 * */
function validateData(data) {
  if (!counterInstructions.find(val => data[val])) {
    throw new Error('invalid data');
  }
  if (!requiredFields.every(val => data[val])) throw new Error('invalid data');
}

/*
 * Get current counter state
 *
 * @param    {String}    publicKey   Public key for counters
 * */
async function getCounter(publicKey) {
  return knex(tables.COUNTERS)
    .select()
    .where({ owner: publicKey });
}

module.exports = {
  createCounter,
  incrementCounter,
  validateData,
  getCounter
};
