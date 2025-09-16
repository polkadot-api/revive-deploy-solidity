import { execSync } from "node:child_process";

console.log("Generating ABI");
execSync("bun resolc --abi ./3_Ballot.sol");

console.log("Generating PVM");
execSync("bun resolc --bin ./3_Ballot.sol");

console.log("Formatting ABI");
// This basically copies the ABI and transforms it to a TS file
// (i.e. adding a `as const` at the end to keep types intact)
execSync("bun wagmi generate");

console.log("Generating chain types");
execSync("bun papi", {
  stdio: "inherit",
});
