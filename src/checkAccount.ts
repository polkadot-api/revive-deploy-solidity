import { reviveAddressIsMapped } from "@polkadot-api/sdk-ink";
import { devAccount, trackBestTx } from "./util";
import { typedApi } from "./chain";
import type { SS58String } from "polkadot-api";

const TOKEN_UNIT = 1_000_000_000_000n;

export async function checkAccount(name: string) {
  const account = devAccount(name);

  console.log("Awaiting connection to RPC…");
  await typedApi.compatibilityToken;

  console.log("Checking account status…");
  const [isMapped, balance] = await Promise.all([
    reviveAddressIsMapped(typedApi, account.address),
    getBalance(account.address),
  ]);

  if (balance < TOKEN_UNIT) {
    console.log(
      `Not enough funds in your account. Please add funds through the faucet https://faucet.polkadot.io/?parachain=1111 with your address ${account.address}`
    );
    process.exit(1);
  }

  if (!isMapped) {
    console.log(
      "Account is not mapped. Calling `map_account` (only needs to be done once)"
    );
    await trackBestTx(
      typedApi.tx.Revive.map_account().signSubmitAndWatch(account.signer)
    );
  }

  return account;
}

const getBalance = (addr: SS58String) =>
  typedApi.query.System.Account.getValue(addr).then((acc) => {
    const v = acc.data;

    // https://wiki.polkadot.network/learn/learn-account-balances/

    // Total tokens in the account
    const total = v.reserved + v.free;

    // Portion of "free" balance that can't be transferred.
    const untouchable = total == 0n ? 0n : v.frozen - v.reserved;

    // Portion of "free" balance that can be transferred
    // TODO missing existential deposit
    const spendable = v.free - untouchable;

    return spendable;
  });

const maxBigInt = (a: bigint, b: bigint) => (a > b ? a : b);
