import { passethub } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { withLogsRecorder } from "polkadot-api/logs-provider";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const log = Bun.file("./log.txt").writer();
export const client = createClient(
  withLogsRecorder(
    (v) => {
      log.write(v + "\n");
      log.flush();
    },
    getWsProvider([
      "wss://testnet-passet-hub.polkadot.io",
      "wss://passet-hub-paseo.ibp.network",
    ])
  )
);
export const typedApi = client.getTypedApi(passethub);
