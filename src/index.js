const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const BlockChain = require('./block-chain');
const Transaction = require('./transaction');

const myKey = ec.keyFromPrivate(
    '4e17d3df52243e9557615f0f3f1cf6be35d999115a94d174175cb822a87bb156'
);

const myWalletKey = myKey.getPublic('hex');

const blockChain = new BlockChain();

blockChain.minePendingTransactions(myWalletKey);

const txa = new Transaction(myWalletKey, 'address2', 100);
txa.signTransaction(myKey);
blockChain.createTransaction(txa);

blockChain.minePendingTransactions(myWalletKey);

const txb = new Transaction(myWalletKey, 'address1', 50);
txb.signTransaction(myKey);
blockChain.createTransaction(txb);

blockChain.minePendingTransactions(myWalletKey);

console.log(JSON.stringify(blockChain, null, 4));

console.log(`Balance of zj is ${blockChain.getBalanceOfAddress(myWalletKey)}`);

console.log('验证区块链是否合法', blockChain.isChainValid() ? '是' : '否');
