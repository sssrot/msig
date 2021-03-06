import { Program } from "@project-serum/anchor";
import * as browserBuffer from "buffer";
import chalk from "chalk";
import { encode } from "js-base64";
import {
  ensureProposalsMemoUnique,
  getProposalsChainStates,
  printKeys,
} from "../utils";
import { ProposalBase } from "../instructions/ProposalBase";
import {
  IEnvPublicKeys,
  MultisigContext,
  MultisigTransactionStruct,
} from "../types";

/// verify configured multisig tx
export async function batchVerify(
  multisigProg: Program,
  accounts: IEnvPublicKeys,
  proposals: ProposalBase[],
  verbose: boolean
) {
  ensureProposalsMemoUnique(proposals);
  const chainTransactions = await getProposalsChainStates(
    multisigProg,
    proposals
  );

  const ctx = {
    multisigProg: multisigProg,
    multisigPDA: accounts.multisigSigner,
  };
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i];
    const chainTx = chainTransactions[i];
    if (chainTx == null) {
      console.log(prop.memo, chalk.yellow(` not created, skip verify`));
      continue;
    }
    if (chainTx.data.didExecute) {
      console.log(prop.memo, chalk.grey(` did executed, skip verify`));
      continue;
    }
    await verify(ctx, prop, chainTx.data, verbose);
  }
}

export async function verify(
  ctx: MultisigContext,
  proposal: ProposalBase,
  chainTxState: MultisigTransactionStruct,
  verbose: boolean
) {
  const tx = proposal.calcTransactionAccount().publicKey;
  console.log(`=======>> verify ${proposal.memo} ${tx.toBase58()}`);
  await proposal.verifyTx(ctx, chainTxState);
  if (verbose) {
    const instrs = await proposal.createInstr(ctx);
    let ix = instrs.multisigInstr;
    printKeys(chainTxState.accounts);
    console.log(
      "local created instr in base64(should same as UI): ",
      encode(browserBuffer.Buffer.from(ix.data).toString())
    );
  }
  console.log(chalk.green(` PASSED`));
}
