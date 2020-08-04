const debug = require('debug')('solana-v0-counter-service: controllers/backup');
const config = require('config');
const { Connection } = require('@solana/web3.js');

const knex = require('../database/knex');
const { tables } = require('../database/info');
const counterService = require('../services/counter/counter');

const solanaClient = new Connection(config.connection.http);

/* Enable this in case of ws subscription used */
// setInterval(slotChecker, config.backup.timeInterval);

/*
 * Get current slot number, store to database
 * */
async function slotChecker() {
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();
  try {
    const slot = await solanaClient.getSlot('max');
    debug('slotChecker: %o', slot);
    await trx(tables.BACKUP)
      .update({ slot })
      .where({ id: 'current' });
    await trx.commit();
  } catch (err) {
    debug('err: %o', err);
    trx.rollback();
  }
}

/*
 * Save last parsed block for backup
 * */
async function softLaunch() {
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();
  const currentSlot = await solanaClient.getSlot('max');
  const backUpCurrent = await trx(tables.BACKUP)
    .select()
    .where({ id: 'current' })
    .then(result => {
      return result[0];
    });
  const backUp = await trx(tables.BACKUP)
    .select()
    .where({ id: 'backup' })
    .then(result => {
      return result[0];
    });

  if (!backUpCurrent || !backUpCurrent.slot) return;

  try {
    if (
      backUp &&
      backUp.slot < currentSlot &&
      backUp.slot < currentSlot - config.backup.slotInterval
    ) {
      await trx.raw(`
      INSERT INTO backup (id, slot) VALUES ('backup', ${currentSlot -
        config.backup.slotInterval})
      ON CONFLICT (id) DO UPDATE SET slot = ${currentSlot -
        config.backup.slotInterval};
    `);
    } else if (!backUp || backUpCurrent.slot < backUp.slot) {
      await trx.raw(`
      INSERT INTO backup (id, slot) VALUES ('backup', ${backUpCurrent.slot})
      ON CONFLICT (id) DO UPDATE SET slot = ${backUpCurrent.slot};
    `);
    }
    await trx.commit();
  } catch (err) {
    debug('err: %o', err);
    await trx.rollback();
    throw err;
  }
}

/*
 * Proceed from backed up to current slot
 * */
async function proceedBackup() {
  const backUp = await knex
    .raw(
      `
        SELECT * FROM ${tables.BACKUP} WHERE id = 'backup'
    `
    )
    .then(result => {
      return result.rows;
    });
  if (!backUp.length || !backUp[0]) return;
  const currentSlot = await solanaClient.getSlot(config.parser.commitment);

  debug('backing up from %o to %o', backUp[0].slot, currentSlot);
  for (let i = backUp[0].slot; i <= currentSlot; i += 1) {
    const trxProvider = knex.transactionProvider();
    // eslint-disable-next-line no-await-in-loop
    const trx = await trxProvider();
    try {
      // eslint-disable-next-line no-await-in-loop
      const slot = await solanaClient.getConfirmedBlock(i);

      for (let j = 0; j < slot.transactions.length; j += 1) {
        const { transaction } = slot.transactions[j];
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

        for (let k = 0; k < memoInstructions.length; k += 1) {
          if (memoInstructions[k].createCounter) {
            // eslint-disable-next-line no-await-in-loop
            await counterService.createCounter(memoInstructions[k]);
          } else if (memoInstructions[k].incrementCounter) {
            // eslint-disable-next-line no-await-in-loop
            await counterService.incrementCounter(memoInstructions[k]);
          }
        }
      }

      // eslint-disable-next-line no-await-in-loop
      await trx(tables.BACKUP)
        .where({ id: 'backup' })
        .update({ slot: i });
      // eslint-disable-next-line no-await-in-loop
      await trx.commit();
      debug('backed up %o, left: %o', i, currentSlot - i);
    } catch (err) {
      debug('proceedBackup err: %o', err.message);
      // eslint-disable-next-line no-await-in-loop
      await trx.rollback();
    }
  }
  await knex(tables.BACKUP)
    .delete()
    .where({ id: 'backup' });
  debug('backup completed');
}

module.exports = {
  softLaunch,
  proceedBackup,
  slotChecker
};
