---
layout: ../../../layouts/PostLayout.astro
title: A quick and comprehensive introduction to Ethereum
description: Ethereum - A cryptocurrency, but not only
date: 2026-06-13
author: Antoine Passemiers
lang: en
tag: Crypto
difficulty: 3
---

TODO

- Gas (is Remix actually good at estimating gas consumption?)
- `library` keyword to make libraries stateless -> prevent vulnerabilities
- ERC-1967 proxy to move the contract's logic to another address. Allows changing the code or fixing bugs over time: https://eips.ethereum.org/EIPS/eip-1967. Storage slot for the implementation contract address is hardcoded (derived from a hash) to prevent any collision with other variables in the code.
- ERC-2612: addition to ERC-20, allows token transfers without interacting with the blockchain (therefore avoiding gas fees). Only creates the signature. The actual transaction is performed by someone else.
- Tokens sent to contract addresses which do not have ERC-20 capabilities are lost forever. Instead, the contract should have the ERC20 instance should be set in the constructor.

Install foundry, as explained here: https://www.getfoundry.sh/introduction/installation
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
forge install OpenZeppelin/openzeppelin-contracts
```

Create a project:
```bash
forge init
```

Compile the project:
```bash
forge build
```

Run Anvil:
```bash
anvil
```

Deploy locally with Anvil:
```bash
forge script script/ContractDeploy.s.sol --broadcast --rpc-url "http://127.0.0.1:8545" --private-key <DEPLOYER_PRIVATE_KEY>
```