const Block = require('./Block');
const Transaction = require('./transaction');

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReword = 100;
    }

    createGenesisBlock() {
        return new Block('20220506', 'The genesis block', '0');
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewordAddress) {
        this.pendingTransactions = [
            new Transaction(null, miningRewordAddress, this.miningReword),
        ];

        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLastBlock().hash
        );
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pendingTransactions = [];
    }

    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('交易账单必须包含转出地址和转入地址');
        }

        if (!transaction.isValid()) {
            throw new Error('不能将不合法的交易账单加入链中');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (prevBlock.hash !== currentBlock.prevHash) {
                return false;
            }
        }

        return true;
    }
}

module.exports = BlockChain;
