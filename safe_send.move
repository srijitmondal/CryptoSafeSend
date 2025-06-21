module SafeSend::safe_send {

    use std::signer;
    use std::vector;
    use std::string;
    use std::hash;
    use std::option;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    struct Transaction has key {
        sender: address,
        recipient: address,
        amount: u64,
        code_hash: vector<u8>,
        claimed: bool,
        cancelled: bool,
    }

    struct Transactions has key {
        txs: vector<Transaction>,
    }

    public entry fun create_transaction(
        sender: &signer,
        recipient: address,
        code: string::String,
        amount: u64
    ) {
        let sender_addr = signer::address_of(sender);
        let code_hash = hash::sha3_256(string::utf8(code));
        let tx = Transaction {
            sender: sender_addr,
            recipient,
            amount,
            code_hash,
            claimed: false,
            cancelled: false,
        };
        let txs = borrow_global_mut<Transactions>(sender_addr);
        vector::push_back(&mut txs.txs, tx);
        Coin::transfer<AptosCoin>(sender, recipient, amount);
        // You may want to emit an event here
    }

    public entry fun claim_funds(
        recipient: &signer,
        sender_addr: address,
        tx_id: u64,
        code: string::String
    ) {
        let txs = borrow_global_mut<Transactions>(sender_addr);
        let tx = &mut vector::borrow_mut(&mut txs.txs, tx_id);
        assert!(!tx.claimed, 1);
        assert!(!tx.cancelled, 2);
        assert!(tx.recipient == signer::address_of(recipient), 3);
        let code_hash = hash::sha3_256(string::utf8(code));
        assert!(tx.code_hash == code_hash, 4);
        tx.claimed = true;
        // Funds already transferred on creation in this simple version
        // You may want to emit an event here
    }

    public entry fun cancel_transaction(
        sender: &signer,
        tx_id: u64
    ) {
        let sender_addr = signer::address_of(sender);
        let txs = borrow_global_mut<Transactions>(sender_addr);
        let tx = &mut vector::borrow_mut(&mut txs.txs, tx_id);
        assert!(!tx.claimed, 5);
        assert!(!tx.cancelled, 6);
        assert!(tx.sender == sender_addr, 7);
        tx.cancelled = true;
        // Refund logic would go here if funds were escrowed
        // You may want to emit an event here
    }

    public fun get_transaction(
        sender_addr: address,
        tx_id: u64
    ): &Transaction {
        let txs = borrow_global<Transactions>(sender_addr);
        vector::borrow(&txs.txs, tx_id)
    }

    public fun init_account(account: &signer) {
        move_to(account, Transactions { txs: vector::empty<Transaction>() });
    }
}