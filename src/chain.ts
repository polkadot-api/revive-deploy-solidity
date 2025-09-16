import { passethub } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

export const client = createClient(
  getWsProvider([
    "wss://testnet-passet-hub.polkadot.io",
    "wss://passet-hub-paseo.ibp.network",
  ])
);
export const typedApi = client.getTypedApi(passethub);
