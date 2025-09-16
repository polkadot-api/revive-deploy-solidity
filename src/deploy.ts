import { Binary } from "polkadot-api";
import { encodeDeployData, toHex } from "viem";
import { client, typedApi } from "./chain";
import { checkAccount } from "./checkAccount";
import { ballotAbi } from "./generated";
import { stringify, trackTx } from "./util";

const devName = process.argv[2];
if (!devName) {
  console.log("Missing account name");
  console.log("Usage: bun deploy {account name}");
  process.exit(1);
}

const account = await checkAccount(devName);

const pvmFile = Bun.file("./3_Ballot_sol_Ballot.polkavm");
const pvmBytes = Binary.fromBytes(await pvmFile.bytes());

// Constructor takes an array of 32-byte strings
const titleToHex = (title: string) =>
  toHex(title.slice(0, 32).padStart(32, " "));

const data = encodeDeployData({
  abi: ballotAbi,
  args: [[titleToHex("Proposal A"), titleToHex("Proposal B")]],
  // In revive, the code is uploaded separately. We can leave bytecode empty
  bytecode: "0x",
});

const instantiateResult = await typedApi.apis.ReviveApi.instantiate(
  account.address,
  0n, // transferred value
  undefined, // gas limit (unknown)
  undefined, // storage deposit limit (unknown)
  {
    type: "Upload",
    value: pvmBytes,
  },
  Binary.fromHex(data),
  undefined, // salt (use default)
  // Because we might have mapped the account and that might not be yet finished
  {
    at: "best",
  }
);

console.log("Dry run result: " + stringify(instantiateResult.result.value));

if (
  !instantiateResult.result.success ||
  instantiateResult.result.value.result.flags > 0
) {
  throw new Error("Dry run not successful");
}

console.log("Deploying (might take a minute)");
const res = await trackTx(
  typedApi.tx.Revive.instantiate_with_code({
    code: pvmBytes,
    data: Binary.fromHex(data),
    gas_limit: instantiateResult.gas_required,
    salt: undefined,
    storage_deposit_limit: instantiateResult.storage_deposit.value,
    value: 0n,
  }).signSubmitAndWatch(account.signer)
);

if (res.ok) {
  console.log(
    "deployed to address: " + instantiateResult.result.value.addr.asHex()
  );
}

// Teardown
client.destroy();
