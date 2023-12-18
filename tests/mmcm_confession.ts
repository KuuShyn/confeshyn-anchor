import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MmcmConfession } from "../target/types/mmcm_confession";
import { assert } from "chai";

describe("mmcm_confession", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MmcmConfession as Program<MmcmConfession>;

  it("can send a new tweet", async () => {
    // Create an account keypair for our program to use.
    const tweet = anchor.web3.Keypair.generate();

    await program.methods
      .sendConfession("Hryryr am I right?")
      .accounts({
        confession: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.confession.fetch(
      tweet.publicKey
    );
    assert.equal(
      tweetAccount.author.toBase58(),
      program.provider.publicKey.toBase58()
    );

    assert.equal(tweetAccount.content, "Hryryr am I right?");
    assert.ok(tweetAccount.timestamp);
  });

  it("Different authors", async () => {
    // Create an account keypair for our program to use.
    const tweet = anchor.web3.Keypair.generate();

    await program.methods
      .sendConfession("asfasfs?")
      .accounts({
        confession: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.confession.fetch(
      tweet.publicKey
    );

    console.log(tweetAccount.author);
    console.log(tweetAccount.reactionCount);
    console.log(tweetAccount.content);
    console.log(tweetAccount.timestamp);

    assert.equal(
      tweetAccount.author.toBase58(),
      program.provider.publicKey.toBase58()
    );
    // assert.equal(tweetAccount.content, "bnbght?");
    assert.ok(tweetAccount.timestamp);
    console.log(tweetAccount.timestamp.toNumber());
  });

  it("can react to a tweet", async () => {
    // Create an account keypair for our program to use.
    const tweet = anchor.web3.Keypair.generate();

    // Send a new tweet.
    await program.methods
      .sendConfession("Hummus, am I right?")
      .accounts({
        confession: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    // React to the tweet.
    await program.methods
      .addReact()
      .accounts({
        confession: tweet.publicKey,
        // author: program.provider.publicKey,
      })
      .rpc();

    // Fetch the account details of the tweet.
    const tweetAccount = await program.account.confession.fetch(
      tweet.publicKey
    );
    console.log(tweetAccount.reactionCount);
    // Check that the reaction was recorded correctly.
    assert.ok(tweetAccount.reactionCount.eq(new anchor.BN(1)));
  });

  it("remove react", async () => {
    // Create an account keypair for our program to use.
    const tweet = anchor.web3.Keypair.generate();

    // Send a new tweet.
    await program.methods
      .sendConfession("Hummus, am I right?")
      .accounts({
        confession: tweet.publicKey,
        author: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc();

    await program.methods
      .addReact()
      .accounts({
        confession: tweet.publicKey,
        // author: program.provider.publicKey,
      })
      .rpc();
    await program.methods
      .addReact()
      .accounts({
        confession: tweet.publicKey,
        // author: program.provider.publicKey,
      })
      .rpc();

    await program.methods
      .addReact()
      .accounts({
        confession: tweet.publicKey,
        // author: program.provider.publicKey,
      })
      .rpc();

    await program.methods
      .removeReact()
      .accounts({
        confession: tweet.publicKey,
        author: program.provider.publicKey,
      })
      .rpc();

    const tweetAccount = await program.account.confession.fetch(
      tweet.publicKey
    );
    console.log(tweetAccount.reactionCount);
    assert.ok(tweetAccount.reactionCount.eq(new anchor.BN(2)));
  });
  let confess: any = [];
  it("can delete a tweet", async () => {
    const tweets = await program.account.confession.all();
    // console.log(tweets)
    confess = tweets;
    confess.forEach((a, i) => {
      // console.log(a.account);
      console.log(a.publicKey.toBase58());

    });
  });
});
