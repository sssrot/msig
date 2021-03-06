import * as packageJSON from "../../package.json";
import { Command } from "commander";
import { getEnvPublicKeys, getProgramFromEnv, setupJSONPrint } from "../utils";
import { batchCreate } from "../commands/batchCreate";
import { batchVerify } from "../commands/batchVerify";
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute";
import { ENV } from "../env";
import { createMultisig } from "../commands/createMultisig";
import { join } from "path";
import { IProposals } from "../types";

setupJSONPrint();
let cli = new Command();

cli.version(packageJSON.version);

cli
  .option("--rpc <rpc>", "rpc url", "https://api.devnet.solana.com")
  .option(
    "--program <program>",
    "multisig program",
    "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  )
  .option("--wallet <wallet>", "wallet file", "./id.json")
  .on("option:rpc", () => (ENV.rpcUrl = cli.opts().rpc))
  .on("option:program", () => (ENV.multisigProgram = cli.opts().program))
  .on("option:wallet", () => (ENV.wallet = cli.opts().wallet));

cli
  .command("setup")
  .description("create new multisig")
  .requiredOption("--owners <owners...>", "members of multisig")
  .requiredOption("--threshold <threshold>", "min signatures needed", "1")
  .action(
    async ({ owners, threshold }: { owners: string[]; threshold: string }) => {
      if (owners.length < 2 || owners.length < parseInt(threshold)) {
        throw Error("at least 2 members and threshold >= owners.length");
      }
      createMultisig(getProgramFromEnv(), parseInt(threshold), owners);
    }
  );

cli
  .command("create")
  .description("create multisig transactions from proposals")
  .argument("<proposal>", "proposal js file", "proposal.js")
  .action(async (proposals: string) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchCreate(
      getProgramFromEnv(),
      await getEnvPublicKeys(rProposals.multisig),
      rProposals.transactions
    );
  });

cli
  .command("verify")
  .description("verify created multisig transactions from proposals")
  .argument("<proposal>", "proposal js file", "proposal.js")
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchVerify(
      getProgramFromEnv(),
      await getEnvPublicKeys(rProposals.multisig),
      rProposals.transactions,
      args.more
    );
  });

cli
  .command("execute")
  .argument("<proposal>", "proposal js file", "proposal.js")
  .description(
    "approve and execute created multisig transactions from proposals"
  )
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchApproveExecuteProposals(
      getProgramFromEnv(),
      await getEnvPublicKeys(rProposals.multisig),
      rProposals.transactions,
      args.more
    );
  });

cli.parse(process.argv);

//TODO: inspect multisig
