# 🔐 CryptoSafeSend – Smart Contract Mediator for Secure Blockchain Transfers

CryptoSafeSend is a decentralized Web3-based transaction mediator designed to safeguard users from one of the most common and irreversible errors in blockchain—sending crypto to the wrong wallet. This dApp ensures that funds are only released to the correct recipient once they confirm the transaction using a secret passcode.

🛠️ Built with Solidity, Firebase, and React, CryptoSafeSend combines on-chain security with off-chain communication to create a seamless and secure experience for everyday blockchain users.

---

## 🧩 Features

- ✅ Smart Contract Escrow: Securely holds MATIC until verification.
- ✅ Secret Code Validation: Receiver must provide a unique code to unlock funds.
- ✅ In-App Secure Messaging: Firebase-based chat for sending the secret code safely.
- ✅ Dual Login: Sender and Receiver can log in with separate wallet addresses.
- ✅ Transaction Logs: Transparent and immutable logs on the blockchain.
- ✅ Clean UI: Built using React for a smooth UX.

---

## 🏗️ Architecture

1. User logs in via MetaMask.
2. Sender creates a transaction by locking MATIC with a secret code (hashed).
3. Receiver inputs the secret code to verify and unlock the funds.
4. Secure messaging is used to send the code off-chain via Firebase Firestore.
5. Smart contract validates and transfers the amount to the receiver.

---

## 🧪 Tech Stack

| Layer              | Technology                    |
|-------------------|-------------------------------|
| Smart Contract     | Solidity, Remix IDE, Ganache  |
| Blockchain Network | Etherium          |
| Frontend           | Vite + React + TypeScript     |
| UI Framework       | shadcn-ui + Tailwind CSS      |
| Web3 Integration   | Web3.js                       |
| Messaging Backend  | Firebase Firestore            |
| Login Backebd  | Firebase Authencation            |
| Wallet Integration | MetaMask                      |

---

## 💡 What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

---

## 🧠 Future Enhancements

- QR-code scanning for simplified sharing.
- Support for ERC20 tokens and NFTs.
- Cross-chain support (e.g., BSC, Arbitrum).
- Gasless transactions using meta-transactions.

---

## 🧑‍💻 Use GitHub Codespaces

Skip the local setup! Run CryptoSafeSend instantly with GitHub Codespaces:

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

---

## 🤝 Contributing

1. Fork this repo 🍴  
2. Create your feature branch: git checkout -b feature/your-feature  
3. Commit your changes ✅  
4. Push to the branch: git push origin feature/your-feature  
5. Open a Pull Request 🚀  

---

## 📄 License

MIT License © 2025 Srijit Mondal  
Feel free to use, fork, or contribute with attribution.
