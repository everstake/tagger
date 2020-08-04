const debug = require('debug')('trx-emulate: services/wallet.js');
const config = require('config');
const {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Account
} = require('@solana/web3.js');
const fs = require('fs');

class Wallet {
  constructor() {
    this.pubKey = new PublicKey(config.wallet2.pub);
    this.connection = new Connection(config.connection.url);
    const keyPair = fs.readFileSync(`${__dirname}/../config/keypair2`);
    this.account = new Account(
      keyPair
        .toString('utf8')
        .replace(/[[\]]/g, '')
        .split(',')
        .map(val => {
          return +val;
        })
    );
  }

  /*
   * Request balance for public key (wallet by default)
   *
   * @param    {String}    pubkey      Public key
   * */
  async getBalance(pubKey) {
    return this.connection.getBalance(
      pubKey ? new PublicKey(pubKey) : this.pubKey
    );
  }

  /*
   * Send data to Memo program
   *
   * @param   {JSON}  data  Required memo instruction
   * */
  async sendToMemo(data) {
    const { blockhash } = await this.connection.getRecentBlockhash('recent');

    const trx = new Transaction(blockhash);
    trx.recentBlockhash = blockhash;
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: this.account.publicKey.toString(),
          isSigner: true,
          isWritable: true
        }
      ],
      programId: new PublicKey(config.memo.address),
      data: Buffer.from(
        typeof data === 'string' ? data : JSON.stringify(data),
        'utf8'
      )
    });
    trx.add(instruction);

    const result = await this.connection.sendTransaction(trx, [this.account]);
    debug('transaction hash: %o', result);
    return result;
  }

  /*
   * Get transaction data via hash
   *
   * @param   {String}  hash  Transaction hash to find
   * */
  async getTransaction(hash) {
    return this.connection.getConfirmedTransaction(hash);
  }
}

module.exports = new Wallet();
