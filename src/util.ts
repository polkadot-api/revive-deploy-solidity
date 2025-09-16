import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import type { TxEvent, TxFinalized, TxInBestBlocksFound } from "polkadot-api";
import { AccountId, Binary } from "polkadot-api";
import { getPolkadotSigner } from "polkadot-api/signer";
import type { Observable } from "rxjs";

const dev_mnemonic =
  "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
const entropy = mnemonicToEntropy(dev_mnemonic);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);

export const devAccount = (name: string) => {
  const { publicKey, sign } = derive("//" + name);

  return {
    address: AccountId().dec(publicKey),
    signer: getPolkadotSigner(publicKey, "Sr25519", sign),
  };
};

export type HexString = `0x${string}`;
export const toHex = (value: string | Uint8Array | Binary) =>
  (typeof value === "string"
    ? Binary.fromText(value)
    : value instanceof Uint8Array
      ? Binary.fromBytes(value)
      : value
  ).asHex() as HexString;

export const trackTx = (obs: Observable<TxEvent>) =>
  new Promise<TxFinalized>((resolve, reject) =>
    obs.subscribe({
      next: (evt) => {
        console.log(evt.type);
        if (evt.type === "finalized") {
          resolve(evt);
        }
      },
      error: (err) => reject(err),
    })
  );

export const trackBestTx = (obs: Observable<TxEvent>) =>
  new Promise<TxInBestBlocksFound>((resolve, reject) => {
    let found = false;
    let wasOk = false;
    obs.subscribe({
      next: (evt) => {
        if (!found) {
          console.log(evt.type);
        }

        if (evt.type === "txBestBlocksState" && evt.found) {
          resolve(evt);
          found = true;
          wasOk = evt.ok;
        }
        if (evt.type === "finalized" && wasOk && !evt.ok) {
          console.log(
            "transaction found in best block failed afterwards",
            evt.dispatchError
          );
          process.exit(1);
        }
      },
      error: (err) => {
        reject(err);
        if (found) {
          console.log("transaction found in best block failed afterwards", err);
          process.exit(1);
        }
      },
    });
  });
