const sha256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return sha256(
            this.fromAddress + this.toAddress + this.amount
        ).toString();
    }

    signTransaction(sigingKey) {
        if (sigingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('你不能为其它的钱包做交易签名');
        }

        const hashTx = this.calculateHash();
        const sig = sigingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('此账单没有签名');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports = Transaction;
