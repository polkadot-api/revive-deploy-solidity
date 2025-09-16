# Deploy and call solidity contracts

This is an example repository that shows how to deploy and call solidity contracts on polkadot's pallet revive, using a regular polkadot node.

## Getting Started

You will need [bun](https://bun.com/) installed in your system. Then run:

```sh
bun i
bun codegen
```

This will install the necessary packages and generate the contract's ABI, code and chain types.

It relies on:

- (`@parity/resolc`)[https://github.com/paritytech/revive] to generate ABI+PVM from `.sol`.
- `@wagmi/cli` to generate the ABI types.
- `viem` to encode and decode function calls (fully typed).
- (`polkadot-api`)[https://papi.how/] to connect and interact with revive pallet.

## Usage

The contract source is `3_Ballot.sol`. This is an example contract found in Remix https://remix.polkadot.io/, which puts some proposals up for voting and different accounts can vote them.

This repo has 3 scripts ready to interact with the contract:

- `bun run deploy {dev account name}`
  - Runs `src/deploy.ts` to deploy the contract.
  - For the account name you can put any string
  - e.g. `bun run deploy Alice` will deploy as Alice, but please use your own name, the script will guide you in case you need to set your account up.
  - Will give you a deployment address as a result
- `bun winning {dev account name} {address}`
  - Runs `src/winning.ts` to read from a view-only function and storage.
  - Gets the current winning proposal.
- `bun vote {dev account name} {address} {vote: 0|1}`
  - Runs `src/vote.ts` to call a contract function.
  - Votes for one of the proposals, indexed by 0 or 1.
