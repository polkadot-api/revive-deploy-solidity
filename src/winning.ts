import { Binary } from "polkadot-api";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import { client, typedApi } from "./chain";
import { checkAccount } from "./checkAccount";
import { ballotAbi } from "./generated";
import { stringify, toHex } from "./util";

const [, , devName, address] = process.argv;
if (!devName) {
  console.log("Missing account name");
  console.log("Usage: bun winning {account name} {address}");
  process.exit(1);
}

if (!address) {
  console.log("Missing address");
  console.log("Usage: bun winning {account name} {address}");
  process.exit(1);
}

const account = await checkAccount(devName);

async function getWinningIdx() {
  const data = encodeFunctionData({
    abi: ballotAbi,
    args: [],
    functionName: "winningProposal",
  });

  const callResult = await typedApi.apis.ReviveApi.call(
    account.address,
    Binary.fromHex(address!),
    0n, // transferred value
    undefined, // gas limit
    undefined, // storage deposit limit
    Binary.fromHex(data)
  );

  console.log("Query result: " + stringify(callResult.result.value));

  if (!callResult.result.success) {
    throw new Error("Query not successful");
  }

  return decodeFunctionResult({
    abi: ballotAbi,
    functionName: "winningProposal",
    data: toHex(callResult.result.value.data),
  });
}

async function getProposalTitle(idx: bigint) {
  const data = encodeFunctionData({
    abi: ballotAbi,
    args: [idx],
    functionName: "proposals",
  });

  const callResult = await typedApi.apis.ReviveApi.call(
    account.address,
    Binary.fromHex(address!),
    0n, // transferred value
    undefined, // gas limit
    undefined, // storage deposit limit
    Binary.fromHex(data)
  );

  console.log("Query result: " + stringify(callResult.result.value));

  if (!callResult.result.success) {
    throw new Error("Query not successful");
  }

  const [title, votes] = decodeFunctionResult({
    abi: ballotAbi,
    functionName: "proposals",
    data: toHex(callResult.result.value.data),
  });

  return Binary.fromHex(title).asText().trim();
}

const idx = await getWinningIdx();

const title = await getProposalTitle(idx);
console.log(`Winning proposal: ${idx}. "${title}"`);

// Teardown
client.destroy();
