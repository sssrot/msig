
import { u64 } from "@solana/spl-token";

// import { Foo } from "./customProposal/Foo"

export default {
  // default to "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  // program: "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"

  multisig: "5gAAsvqvDdsgC9TE61TF45ZZg3UjjYhwkgn5HfRY6oa7",

  transactions: [
    new TokenMintToOwner(
      "2021-11-05T14:38:08+08:00 mint some token to multisigSigner 1",
      {
        mint: knownAccounts.testTokenMint,
        owner: knownAccounts.multisigPDA,
      },
      new u64(1000)
    ),

    new TransferTokenToOwner(
      "2021-11-05T14:38:14+08:00 transfer some test token to memberA from multisig token account 1",
      {
        source: knownAccounts.associatedMultisigTestTokenAccount,
        toOwner: knownAccounts.memberA,
      },
      new u64(100)
    ),
  ]
}