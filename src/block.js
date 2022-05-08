const sha256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, transactions, prevHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return sha256(
            this.timestamp +
                this.prevHash +
                this.nonce +
                JSON.stringify(this.transactions)
        ).toString();
    }

    mineBlock(difficulty) {
        console.log(`挖块中...`);
        while (
            this.hash.substring(0, difficulty) !==
            Array(difficulty + 1).join('0')
        ) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`出块成功: ${this.hash}`);
    }

    hasValidTransactions() {
        for (const trans of this.transactions) {
            if (!trans.isValid()) return false;
        }
        return true;
    }
}

module.exports = Block;
