import { defineConfig } from "@wagmi/cli";
import type { Abi } from "viem";
import ballotAbi from "./3_Ballot_sol_Ballot.abi" with { type: "json" };

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "ballot",
      abi: ballotAbi as Abi,
    },
  ],
});
