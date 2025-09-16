import { Binary } from "polkadot-api";
import { encodeDeployData, encodeFunctionData, toHex } from "viem";
import { client, typedApi } from "./chain";
import { checkAccount } from "./checkAccount";
import { ballotAbi } from "./generated";
import { stringify, trackTx } from "./util";

const [, , devName, address, vote] = process.argv;
if (!devName) {
  console.log("Missing account name");
  console.log("Usage: bun vote {account name} {address} {vote: 0|1}");
  process.exit(1);
}

if (!address) {
  console.log("Missing address");
  console.log("Usage: bun vote {account name} {address} {vote: 0|1}");
  process.exit(1);
}

if (vote !== "0" && vote !== "1") {
  console.log("Missing vote");
  console.log("Usage: bun vote {account name} {address} {vote: 0|1}");
  process.exit(1);
}

const account = await checkAccount(devName);

const data = encodeFunctionData({
  abi: ballotAbi,
  functionName: "vote",
  args: [BigInt(vote)],
});

// We need to dry run to know the gas and storage deposit costs
const dryRunResult = await typedApi.apis.ReviveApi.call(
  account.address,
  Binary.fromHex(address),
  0n, // transferred value
  undefined, // gas limit (unknown)
  undefined, // storage deposit limit (unknown)
  Binary.fromHex(data)
);

console.log("Dry run result: " + stringify(dryRunResult.result.value));

if (!dryRunResult.result.success) {
  throw new Error("Dry run not successful");
}

console.log("Voting (might take a minute)");
const res = await trackTx(
  typedApi.tx.Revive.call({
    dest: Binary.fromHex(address),
    data: Binary.fromHex(data),
    gas_limit: dryRunResult.gas_required,
    storage_deposit_limit: dryRunResult.storage_deposit.value,
    value: 0n,
  }).signSubmitAndWatch(account.signer)
);

if (res.ok) {
  console.log("Voted!");
}

// Teardown
client.destroy();
