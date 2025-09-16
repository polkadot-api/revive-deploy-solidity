import { execSync } from "node:child_process";

console.log("Generating ABI");
execSync("bun resolc --abi ./3_Ballot.sol");

console.log("Generating PVM");
execSync("bun resolc --bin ./3_Ballot.sol");

console.log("Generating chain types");
execSync("bun papi");
