const { assert } = require("chai");

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", ([owner, investor]) => {
  let dappToken, daiToken, tokenFarm;

  before(async () => {
    // Load contracts
    dappToken = await DappToken.new();
    daiToken = await DaiToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // Transfer all Dapp tokens to farm (1 million)
    await dappToken.transfer(tokenFarm.address, tokens("1000000"));

    // Transfer 100 Mock Dai to investor
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  describe("Mock DAI Deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  describe("Mock DAPP Deployment", async () => {
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("Mock DAPP Deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp Token Farm");
    });

    it("contract has tokens", async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("Farming tokens", async () => {
    it("rewards investors for staking mDai tokens", async () => {
      let result;
      // check investor balance before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor mDai wallet balance should be correct before staking"
      );

      // Stake mDai Tokens
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      // Check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "Investor mDai wallet balance correct after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Token farm mDai balance correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor staking balance correct after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.isTrue(result, "Investor staking status correct after staking");

      // issue tokens
      await tokenFarm.issueTokens({ from: owner });

      // check balances after issuance
      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor DApp token wallet balance correct after issuance"
      );

      // ensure only the owner can call the function
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // unstake tokens
      await tokenFarm.unstakeTokens({ from: investor });

      // check result after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor mDai wallet balance correct after unstaking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("0"),
        "Token farm mDai balance correct after unstaking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor balance correct after unstaking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.isFalse(result, "Investor staking status correct after staking");
    });
  });
});
