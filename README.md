PetChain Gas Fees

A NestJS backend service for analyzing and optimizing gas fees in PetChain’s StarkNet ecosystem.

  Overview
  
PetChain is a decentralized platform on StarkNet that manages pet medical records. This repository (petchain_gas_fees) provides a NestJS-powered backend to:

Monitor gas costs for PetChain smart contract interactions.

Optimize transaction timing and batching to reduce fees.

Expose APIs for real-time gas analytics and recommendations.

⚡ Why This Matters
🐾 Cost efficiency – Helps pet owners/vets save on record updates.

⚡ Performance – Uses StarkNet’s L2 scalability for low-fee transactions.

📊 Data-driven – Tracks historical gas trends for smarter scheduling.

🔧 Features

✅ Gas Analytics API – REST endpoints for real-time fee data.
✅ StarkNet RPC Integration – Fetches gas prices from StarkNet nodes.
✅ Optimization Engine – Suggests low-fee windows for transactions.
✅ PostgreSQL Storage – Logs historical gas data for trend analysis.

🛠 Tech Stack

Layer	Technology
Backend	NestJS (TypeScript)
Database	PostgreSQL + TypeORM
Blockchain	StarkNet.js, Cairo
APIs	REST, Swagger Docs
DevOps	Docker, AWS (optional)

🚀 Getting Started
Prerequisites
Node.js (v18+)

PostgreSQL (v12+)

StarkNet CLI (starknet-devnet for local testing)

Installation
Clone the repo:


git clone https://github.com/DogStark/petchain_gas_fees.git
cd petchain_gas_fees
Install dependencies:


npm install
Configure .env (copy from .env.example):

# Start dev server
npm run start:dev
Access APIs at http://localhost:3000/api 

🤝 Contributing
Fork the repo and create a branch.

Follow the NestJS structure:

Controllers in /src/gas/controllers

Services in /src/gas/services

Submit a PR with clear descriptions.

