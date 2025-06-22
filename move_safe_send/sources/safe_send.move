module {{sender}}::safe_send {
    use std::signer;
    use std::vector;
    use std::string;
    use std::option::{Self, Option};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use std::error;

    struct Transaction has key, store {
        sender: address,
        recipient: address,
        amount: u64,
        code_hash: vector<u8>,
        claimed: bool,
        cancelled: bool,
    }

    struct Transactions has key, store {
        txs: vector<Transaction>,
    }

    public entry fun create_transaction(
        account: &signer,
        recipient: address,
        code_hash: vector<u8>,
        amount: u64
    ) {
        let sender = signer::address_of(account);
        let tx = Transaction {
            sender,
            recipient,
            amount,
            code_hash,
            claimed: false,
            cancelled: false,
        };
        let txs = borrow_global_mut_or_create<Transactions>(sender);
        Coin::transfer<AptosCoin>(account, recipient, 0); // Dummy to ensure recipient exists
        vector::push_back(&mut txs.txs, tx);
    }

    public entry fun claim_funds(
        account: &signer,
        sender: address,
        tx_id: u64,
        code: vector<u8>
    ) {
        let txs = borrow_global_mut<Transactions>(sender);
        let tx_ref = &mut vector::borrow_mut(&mut txs.txs, tx_id);
        assert!(!tx_ref.claimed, 1);
        assert!(!tx_ref.cancelled, 2);
        assert!(signer::address_of(account) == tx_ref.recipient, 3);
        assert!(tx_ref.code_hash == aptos_std::hash::sha3_256(&code), 4);
        tx_ref.claimed = true;
        Coin::transfer<AptosCoin>(&signer::borrow(tx_ref.sender), tx_ref.recipient, tx_ref.amount);
    }

    public entry fun cancel_transaction(
        account: &signer,
        tx_id: u64
    ) {
        let sender = signer::address_of(account);
        let txs = borrow_global_mut<Transactions>(sender);
        let tx_ref = &mut vector::borrow_mut(&mut txs.txs, tx_id);
        assert!(!tx_ref.claimed, 5);
        assert!(!tx_ref.cancelled, 6);
        assert!(signer::address_of(account) == tx_ref.sender, 7);
        tx_ref.cancelled = true;
        Coin::transfer<AptosCoin>(&signer::borrow(tx_ref.recipient), tx_ref.sender, tx_ref.amount);
    }

    public fun get_transaction(
        sender: address,
        tx_id: u64
    ): Option<&Transaction> {
        if (exists<Transactions>(sender)) {
            let txs = borrow_global<Transactions>(sender);
            Option::some(&vector::borrow(&txs.txs, tx_id))
        } else {
            Option::none<Transaction>()
        }
    }

    public fun borrow_global_mut_or_create<T: store>(addr: address): &mut T {
        if (!exists<T>(addr)) {
            move_to<T>(&signer::borrow(addr), T { txs: vector::empty<Transaction>() });
        }
        borrow_global_mut<T>(addr)
    }
}
