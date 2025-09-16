import { passethub } from "@polkadot-api/descriptors";
import { Binary, createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { encodeDeployData, toHex } from "viem";
import { ballotAbi } from "./generated";
import { devAccount, trackTx } from "./util";

import "./checkAccount";
process.exit(0);

const client = createClient(
  getWsProvider([
    "wss://testnet-passet-hub.polkadot.io",
    "wss://passet-hub-paseo.ibp.network",
  ])
);
const typedApi = client.getTypedApi(passethub);

const pvmFile = Bun.file("./3_Ballot_sol_Ballot.polkavm");
console.log("Loading pvm file");
const pvmBytes = Binary.fromBytes(await pvmFile.bytes());

console.log("Encoding data");

// Constructor takes an array of 32-byte strings
const titleToHex = (title: string) =>
  toHex(title.slice(0, 32).padStart(32, " "));

const data = encodeDeployData({
  abi: ballotAbi,
  args: [[titleToHex("Proposal A"), titleToHex("Proposal B")]],
  // In revive, the code is uploaded separately. We can leave bytecode empty
  bytecode: "0x",
});

console.log("Wait connection");
await typedApi.compatibilityToken;

const account = devAccount("Oliva");

console.log("Dry running");
const instantiateResult = await typedApi.apis.ReviveApi.instantiate(
  account.address,
  0n,
  undefined,
  undefined,
  {
    type: "Upload",
    value: pvmBytes,
  },
  Binary.fromHex(data),
  undefined
);

console.log(
  JSON.stringify(instantiateResult.result.value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v instanceof Binary ? v.asHex() : v
  )
);

if (!instantiateResult.result.success) {
  throw new Error("Not successful");
}

// await trackTx(
//   typedApi.tx.Revive.instantiate_with_code({
//     code: pvmBytes,
//     data: Binary.fromHex(data),
//     gas_limit: instantiateResult.gas_required,
//     salt: undefined,
//     storage_deposit_limit: instantiateResult.storage_deposit.value,
//     value: 0n,
//   }).signSubmitAndWatch(account.signer, {
//     at: "finalized",
//   })
// );

// Teardown
client.destroy();
