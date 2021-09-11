const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
  // Deploy Mck DAI Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  // Deploy Dapp Token
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  // Deploy Token farm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed();

  // Transfer all tokens to TokenFarm (1million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

  // Transfer 100 Mock DAI tokens to investor
  // account[0] is the deployer, the person who puts the contract on the network
  // account[1] is the investor
  await daiToken.transfer(accounts[1], '100000000000000000000');
};