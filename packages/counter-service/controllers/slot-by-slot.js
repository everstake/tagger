const debug = require('debug')(
  'solana-v0-counter-service: controllers/slot-by-slot'
);
const config = require('config');
const { Connection } = require('@solana/web3.js');

const counterService = require('../services/counter/counter');
const knex = require('../database/knex');
const { tables } = require('../database/info');

const solanaClient = new Connection(config.connection.http);

/*
 * Recursively produce slots starting from current
 *
 * @param  {Number}  slotIndex   Index of slot to proceed
 * */
async function proceedFromLastConfirmed(slotIndex) {
  let currentSlot;
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();
  try {
    if (!slotIndex) {
      currentSlot = await solanaClient.getSlot(config.parser.commitment);
    }

    const slot = await solanaClient.getConfirmedBlock(currentSlot || slotIndex);
    debug('current slot: %o', currentSlot || slotIndex);

    for (let i = 0; i < slot.transactions.length; i += 1) {
      const { transaction } = slot.transactions[i];
      const memoInstructions = transaction.instructions.reduce((acc, val) => {
        try {
          if (val.programId.toString() !== config.memo.address) return acc;
          const parsed = JSON.parse(val.data.toString());
          counterService.validateData(parsed);
          parsed.publicKey = val.keys
            .find(key => key.isSigner)
            .pubkey.toString();
          debug('got instruction: %o', parsed);
          acc.push(parsed);
          return acc;
        } catch (err) {
          return acc;
        }
      }, []);

      for (let j = 0; j < memoInstructions.length; j += 1) {
        if (memoInstructions[j].createCounter) {
          // eslint-disable-next-line no-await-in-loop
          await counterService.createCounter(memoInstructions[j]);
        } else if (memoInstructions[j].incrementCounter) {
          // eslint-disable-next-line no-await-in-loop
          await counterService.incrementCounter(memoInstructions[j]);
        }
      }
    }

    await trx(tables.BACKUP)
      .update({ slot: currentSlot || slotIndex })
      .where({ id: 'current' });
    await trx.commit();
    return proceedFromLastConfirmed((currentSlot || slotIndex) + 1);
  } catch (err) {
    debug('proceedFromLastConfirmed err: %o', err.message);
    await trx.rollback();
    await new Promise(resolve =>
      setTimeout(resolve, config.parser.slotTimeout)
    );
    return proceedFromLastConfirmed(currentSlot || slotIndex);
  }
}

module.exports = {
  proceedFromLastConfirmed
};
