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
    /**
     * 将所有 pending 状态下的账单取出，放入区块中；同时，将挖矿所得的报酬转入挖矿钱包
     * @param {string} miningRewordAddress
     */
    minePendingTransactions(miningRewordAddress) {
        const rewardTx = new Transaction(
            null,
            miningRewordAddress,
            this.miningReword
        );
        this.pendingTransactions.push(rewardTx);

        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLastBlock().hash
        );
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pendingTransactions = [];
    }

    /**
     * 将新的交易加入到待交易的队列中，在下一次挖块成功时会打包到区块中
     * @param {*} transaction
     */
    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('交易账单必须包含转出地址和转入地址');
        }
        // 验证交易是否是签名过的
        if (!transaction.isValid()) {
            throw new Error('不能将不合法的交易账单加入链中');
        }

        if (transaction.amount <= 0) {
            throw new Error('交易额需要大于 0');
        }
        // 判断资金转出地址是否有足够的余额
        const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
        if (walletBalance < transaction.amount) {
            throw new Error('没有足够的余额');
        }
        // 获取在 pending 状态下的当前地址的交易账单，也就是获取还没有被打包的账单
        const pendingTxForWallet = this.pendingTransactions.filter(
            (tx) => tx.fromAddress === transaction.fromAddress
        );
        // 如果待交易的账单总额大于钱包余额，则取消本次交易
        if (pendingTxForWallet.length > 0) {
            const totalPendingAmount = pendingTxForWallet
                .map((tx) => tx.amount)
                .reduce((prev, curr) => prev + curr);

            const totalAmount = totalPendingAmount + transaction.amount;
            if (totalAmount > walletBalance) {
                throw new Error('待交易的账单总额大于当前钱包的余额');
            }
        }

        this.pendingTransactions.push(transaction);
        console.log('添加账单 %s', transaction);
    }
    /**
     * 获取某个钱包地址的余额
     * @param {*} address
     * @returns
     */
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

    /**
     * 获取和某个地址有关的所有交易
     * @param {string} address
     * @returns {Transaction[]}
     */
    getAllTransactionsForWallet(address) {
        const txs = [];

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                    txs.push(tx);
                }
            }
        }

        return txs;
    }
    /**
     * 判断区块链中的所有区块都彼此链接在一起且其中的数据没有被篡改
     * 在判断区块链的同时判断账单是否已经加入签名
     * @returns {boolean}
     */
    isChainValid() {
        const realGenesis = JSON.stringify(this.createGenesisBlock());
        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

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
