const BigNumber = web3.BigNumber;
const PunchyToken = artifacts.require("PunchyToken");
const TokenTimelock = artifacts.require('TokenTimelock');
const TokenVesting = artifacts.require('TokenVesting');

const day = 24 * 60 * 60;
const {
    BN,
    time,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

contract('PunchyToken', (accounts) => {

  beforeEach(async function() {
    const punchy = await PunchyToken.deployed();
  });

  it('Test1 : The Balalance of the owner should be 0', async () => {
    const punchy = await PunchyToken.deployed();
    const balance = await punchy.balanceOf(accounts[0]);
    await punchy.mint();
    assert.equal(balance.valueOf(),  0, "The Ballance should be  0");
  });


  it('Test2 : The Balalance of other addresses', async () => {
    const punchy = await PunchyToken.deployed();
    
    const balance1 = await punchy.balanceOf(accounts[1]);
    const balance2 = await punchy.balanceOf(accounts[2]);
    const balance3 = await punchy.balanceOf(accounts[3]);
    const balance4 = await punchy.balanceOf(accounts[4]);
    const balance5 = await punchy.balanceOf(accounts[5]);
    const balance6 = await punchy.balanceOf(accounts[6]);
    const teamTimelock=await punchy.getTeamTimeLockAddr();
    const balance7 = await punchy.balanceOf(teamTimelock);

    const advisorsVesting = await punchy.getAdvisorsVestingAddr();
    const balance8 = await punchy.balanceOf(advisorsVesting);

    const balance9 = await punchy.balanceOf(accounts[7]);
    const balance10 = await punchy.balanceOf(accounts[8]);

    const totalSupply = await punchy.totalSupply();
    console.log("Balance of advisors : " +balance1);
    console.log("Balance of team : " +balance2);
    console.log("Balance of private sale : " +balance3);
    console.log("Balance of presale : " +balance4);
    console.log("Balance of ido : " +balance5);
    console.log("Balance of cex : " +balance6);
    console.log("Balance of teamTimeLock : " +balance7);
    console.log("Balance of advisorsVesting : " +balance8);
    console.log("Balance of punchword treasury : " +balance9);
    console.log("Balance of giveaways : " +balance10);

 	  console.log("Token total supply : " +totalSupply);
    
  });

  it('Test3 : Cannot transfer token from private sale', async () => {
    const punchy = await PunchyToken.deployed();
    const beneficiery = accounts[9];
    await expectRevert(
        punchy.transfer(beneficiery, 100000,{ from: accounts[3] }),
        "Pausable: paused"
      );
  });

  it('Test4 : Can transfer token from private sale after token ownership transfered', async () => {
    const punchy = await PunchyToken.deployed();
    punchy.transferOwnership(accounts[3]);
    const beneficiery = accounts[9];
    const result=await punchy.transfer(beneficiery, 100000,{ from: accounts[3] });
    expectEvent(result, 'Transfer');

    const balance=await punchy.balanceOf(beneficiery);
    assert.equal(balance.valueOf(),  100000, "The Ballance should be  100000");
    
    await expectRevert(
        punchy.transfer(accounts[3], 100000,{ from: beneficiery}),
        "Pausable: paused"
      );
  });

  it('Test5 : cannot unpause before ico ends', async () => {
    const punchy = await PunchyToken.deployed();
    await expectRevert(
        punchy.unpause(),
        "Token is still in ICO"
      );

  });

  it('Test6 : can unpause after ends', async () => {
    const punchy = await PunchyToken.deployed();
    await time.increaseTo(1667260801); //end if ico + 1 second
    const result=await punchy.unpause();
    expectEvent(result, 'Unpaused');

  });

it('Test7 : can transfer token after token unpaused', async () => {
    const punchy = await PunchyToken.deployed();
    const sender = accounts[9];
    const result=await punchy.transfer(accounts[0], 100000,{ from: sender });
    expectEvent(result, 'Transfer');
  });


// it('Test77 : owner can withdraw all funds from vesting schedule', async () => {
//     const punchy = await PunchyToken.deployed();
//     const advisorsVestingAddress = await punchy.getAdvisorsVestingAddr();
//     const advisorsVesting = await TokenVesting.at(advisorsVestingAddress);
//     const owner  = await advisorsVesting.owner();
//     console.log("vesting owner =" + owner);
//     const tokenAddress = await advisorsVesting.getToken()
//     console.log(tokenAddress.valueOf());
//     await advisorsVesting.withdraw(100000000000000,{ from: accounts[0] });
//     const balance=await punchy.balanceOf(accounts[0]);
//     console.log("owner balance = " +balance.valueOf());

//   });

  it('Test8 : cannot pause token after it has been unpaused', async () => {
    const punchy = await PunchyToken.deployed();
    const owner  = await punchy.owner();
    console.log("token owner =" + owner);
    console.log(accounts[3]);
    await expectRevert(
        punchy.pause({ from: accounts[3] }),
        "Token is unpausable"
      );
  });

  it('Test9 : cannot withdraw funds from team timelock before teamRelease time', async () => {
    const punchy = await PunchyToken.deployed();
    const teamTimeLockAddress = await punchy.getTeamTimeLockAddr();
    const teamTimelock = await TokenTimelock.at(teamTimeLockAddress);
    await expectRevert(
        teamTimelock.release(),
        "TokenTimelock: current time is before release time"
      );
    
  });

  it('Test10 : cannot withdraw funds from advisors vesting before cliff time', async () => {
    const punchy = await PunchyToken.deployed();
    const advisorsVestingAddress = await punchy.getAdvisorsVestingAddr();
    const advisorsVesting = await TokenVesting.at(advisorsVestingAddress);
    //get vesting schedule id for advisors address
    const advisorsAddress = accounts[1];
    const vestingScheduleId=await advisorsVesting.computeVestingScheduleIdForAddressAndIndex(advisorsAddress,0);
    const releasableAmount= await advisorsVesting.computeReleasableAmount(vestingScheduleId);

    assert.equal(releasableAmount.valueOf(),  0, "The releasable amount should be  0");
    
  });

  it('Test11 : can withdraw funds from advisors vesting by cliff time', async () => {
    const punchy = await PunchyToken.deployed();
    const advisorsVestingAddress = await punchy.getAdvisorsVestingAddr();
    const advisorsVesting = await TokenVesting.at(advisorsVestingAddress);
    //get vesting schedule id for advisors address
    const advisorsAddress = accounts[1];
    const vestingScheduleId=await advisorsVesting.computeVestingScheduleIdForAddressAndIndex(advisorsAddress,0);

    const thirtyDays = 30*day;
    await time.increaseTo(1667260801+thirtyDays); //end if ico + 1 second + 30 days 

    const releasableAmount= await advisorsVesting.computeReleasableAmount(vestingScheduleId);
    console.log("releasableAmount = " +releasableAmount)

  });

  it('Test12 : can withdraw all funds from advisors vesting by vesting end', async () => {
    const punchy = await PunchyToken.deployed();
    const advisorsVestingAddress = await punchy.getAdvisorsVestingAddr();
    const advisorsVesting = await TokenVesting.at(advisorsVestingAddress);
    //get vesting schedule id for advisors address
    const advisorsAddress = accounts[1];
    const vestingScheduleId=await advisorsVesting.computeVestingScheduleIdForAddressAndIndex(advisorsAddress,0);

    const vestingDuration=47433599; // 548 days, 23 hours, 59 minutes and 59 seconds. (18 months)
    const vestingStartTime=1646092800; //Tuesday, March 1, 2022 12:00:00 AM
    await time.increaseTo(vestingStartTime+vestingDuration + 1);

    const releasableAmount= await advisorsVesting.computeReleasableAmount(vestingScheduleId);
    console.log("releasableAmount = " +releasableAmount)

    await advisorsVesting.release(vestingScheduleId,releasableAmount,{ from: advisorsAddress });
    const balance=await punchy.balanceOf(advisorsAddress);
    console.log("advisors balance = " +balance.valueOf());

  });


  it('Test13 : can withdraw funds from team timelock after teamRelease time', async () => {
    const punchy = await PunchyToken.deployed();
    const teamTimeLockAddress = await punchy.getTeamTimeLockAddr();
    const teamTimelock = await TokenTimelock.at(teamTimeLockAddress);
    await time.increaseTo(1709251200+ 1); //team release time + 1 second 

    await teamTimelock.release();
    const teamAddress = accounts[2];

    const balance=await punchy.balanceOf(teamAddress);
    console.log("team balance = " +balance.valueOf());
    
  });




  

});
