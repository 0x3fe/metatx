# Native Meta Transaction

There is a growing interest in making it possible for smart contracts to accept calls from externally owned accounts that do not have ETH to pay for gas. Solutions that allow for third parties to pay for gas costs are called meta transactions.

The meta transactions are transactions that have been authorized by a Transaction Signer and relayed by an untrusted third party that pays for the gas (the Gas Relay).

https://eips.ethereum.org/EIPS/eip-2771

## Introduction

Simple webapp that simply shows how meta transactions work.

You will be able to connect your wallet and interact with a "Storage" contract that has the sole purpose of saving internally a value entered by the user.

To do this, the user will have two options:

- interact directly with the contract thereby paying transaction fees. Then by signing and sending an on-chain transaction.
- signing a message and sending it to the relayer (located in the backend), which will send the transaction and pay the fees on its own. (for the signed message, check the standard https://eips.ethereum.org/EIPS/eip-712)

The Storage contract, will be the Recipient contract, which will accept meta-transactions through a Trusted Forwarder.
The Trusted Forwarder for convenience and simplicity will implement OpenZeppelin's MinimalForwarder.
MinimalForwarder which is intended primarily for testing, as it lacks the features to be a good production-ready forwarder. 
This contract is not intended to have all the properties necessary for a good forwarding system. 
A fully functional forwarder system with good properties requires more complexity. 
OpenZeppelin itself suggests looking at other projects, such as GSN, that have the goal of building such a system.

The goal of this webapp is to show how the user may not pay their funds in the network's native currency (thus MATIC for this example, as the contracts were deployed on the Polygon network)

## Installation

Install all dependencies for each folder (smart contracts, backend, frontend).
Deploy the smart contracts and store the addresses into the env vars.

## Usage

Run the backend:

```bash
npm run start
```

Run the webapp:

```bash
npm run start
```
