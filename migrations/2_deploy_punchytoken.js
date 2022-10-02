PunchyToken = artifacts.require("./PunchyToken.sol");

module.exports = async function(deployer, network, accounts) {
  
  const _advisorsAddr   = accounts[1];
  const _teamAddr   = accounts[2];
  const _privateSaleAddr   = accounts[3];
  const _presaleAddr   = accounts[4];
  const _IDOAddr   = accounts[5];
  const _CEXAddr   = accounts[6];
  const _treasuryAddr   = accounts[7];
  const _giveawaysAddr   = accounts[8];
  await deployer.deploy(
  	PunchyToken,
  	_advisorsAddr,
  	_teamAddr,
  	_privateSaleAddr,
  	_presaleAddr,
  	_IDOAddr,
  	_CEXAddr,
  	_treasuryAddr,
  	_giveawaysAddr
  	);

  const deployedToken = await PunchyToken.deployed();
  
  // await deployedToken.mint();
  // await deployedToken.transferOwnership(_privateSaleAddr);
  
};