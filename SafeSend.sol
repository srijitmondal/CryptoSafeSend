// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SafeSend {
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        bytes32 codeHash;
        bool claimed;
        bool cancelled;
    }

    mapping(uint => Transaction) public transactions;
    uint public txCounter;

    event Created(uint txId, address indexed sender, address indexed recipient, uint amount);
    event Claimed(uint txId, address indexed recipient);
    event Cancelled(uint txId, address indexed sender);

    // Create a transaction with hashed code
    function createTransaction(address _recipient, bytes32 _codeHash) public payable {
        require(msg.value > 0, "Send some ETH");

        transactions[txCounter] = Transaction(
            msg.sender,
            _recipient,
            msg.value,
            _codeHash,
            false,
            false
        );

        emit Created(txCounter, msg.sender, _recipient, msg.value);
        txCounter++;
    }

    // Claim funds with the correct passcode
    function claimFunds(uint _txId, string memory _code) public {
        Transaction storage txn = transactions[_txId];

        require(!txn.claimed, "Already claimed");
        require(!txn.cancelled, "Transaction cancelled");
        require(msg.sender == txn.recipient, "Not the intended recipient");
        require(txn.codeHash == keccak256(abi.encodePacked(_code)), "Invalid code");

        txn.claimed = true;
        payable(txn.recipient).transfer(txn.amount);

        emit Claimed(_txId, msg.sender);
    }

    // Cancel a transaction if unclaimed
    function cancelTransaction(uint _txId) public {
        Transaction storage txn = transactions[_txId];

        require(!txn.claimed, "Already claimed");
        require(!txn.cancelled, "Already cancelled");
        require(msg.sender == txn.sender, "Not sender");

        txn.cancelled = true;
        payable(txn.sender).transfer(txn.amount);

        emit Cancelled(_txId, msg.sender);
    }

    // View transaction details
    function getTransaction(uint _txId) public view returns (
        address sender,
        address recipient,
        uint amount,
        bool claimed,
        bool cancelled
    ) {
        Transaction memory txn = transactions[_txId];
        return (txn.sender, txn.recipient, txn.amount, txn.claimed, txn.cancelled);
    }
}
