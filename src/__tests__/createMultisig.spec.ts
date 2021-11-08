import { getProgramFromEnvWithWallet } from "../utils";
import { createMultisig } from "../commands/createMultisig";
import { ensureDevnetEnv, TEST_KEYS } from "./common";

describe("create multisig", () => {
  it("should create success", async () => {
    const program = getProgramFromEnvWithWallet(TEST_KEYS.memberA);
    await ensureDevnetEnv(program, TEST_KEYS.memberA);

    await createMultisig(
      program,
      2,
      [
        TEST_KEYS.memberA.publicKey.toBase58(),
        TEST_KEYS.memberB.publicKey.toBase58(),
      ],
      TEST_KEYS.multisig
    );
  });
});
