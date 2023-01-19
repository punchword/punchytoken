// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Pausable.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/utils/TokenTimelock.sol";
import "@openzeppelin/contracts@4.5.0/utils/math/SafeMath.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/ERC20.sol";

contract PunchyToken is ERC20, Pausable {

    address private _advisorsVesting;
  	address private _teamAddr;
    address private _privateSaleAddr;
    address private _presaleAddr;
    address private _IDOAddr;
    address private _CEXAddr;
    address private _punchwordTreasuryAddr;
    address private _giveawaysAddr;

    address private _teamTimeLock;

    uint256 private _advisorsSupply;
  	uint256 private _teamSupply;
    uint256 private _privateSaleSupply;
    uint256 private _presaleSupply;
    uint256 private _IDOSupply;
    uint256 private _CEXSupply;
    uint256 private _punchwordTreasurySupply;
    uint256 private _giveawaysSupply;

    bool alreadyMinted = false;

    uint256 private _endOfICO;

    uint256 private _teamReleaseTime;

    constructor(
                address teamAddr,
                address privateSaleAddr,
                address presaleddr,
                address IDOAddr,
                address CEXAddr,
                address punchwordTreasuryAddr,
                address giveawaysAddr
        ) ERC20("Punchy Token", "PUNCH") {

        _teamAddr=teamAddr;
        _privateSaleAddr=privateSaleAddr;
        _presaleAddr=presaleddr;
        _IDOAddr=IDOAddr;
        _CEXAddr=CEXAddr;
        _punchwordTreasuryAddr=punchwordTreasuryAddr;
        _giveawaysAddr=giveawaysAddr;
        
        _advisorsSupply=250000000 * (10 ** uint256(decimals())); 
        _teamSupply=750000000 * (10 ** uint256(decimals())); 
        _privateSaleSupply=275000000 * (10 ** uint256(decimals())); 
        _presaleSupply=412500000 * (10 ** uint256(decimals()));
        _IDOSupply=962500000 * (10 ** uint256(decimals()));
        _CEXSupply=1100000000 * (10 ** uint256(decimals()));
        _punchwordTreasurySupply=1000000000 * (10 ** uint256(decimals()));
        _giveawaysSupply=250000000 * (10 ** uint256(decimals()));

        _endOfICO=1667260800;  // Tuesday, November 1, 2022 12:00:00 AM GMT 
        _teamReleaseTime=1709251200; //Friday, March 1, 2024 12:00:00 AM

    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public  {
        require (block.timestamp > _endOfICO, "Token is still in ICO");
        _unpause();
    }

    function mint(address _vesting) public {

        require(!alreadyMinted, "All tokens have been minted");
        _advisorsVesting = _vesting;
        _mint(_advisorsVesting, _advisorsSupply);
        
        _teamTimeLock = address(new TokenTimelock(this,_teamAddr,_teamReleaseTime));
        _mint(_teamTimeLock, _teamSupply);

        _mint(_privateSaleAddr, _privateSaleSupply);
        _mint(_presaleAddr, _presaleSupply);
        _mint(_IDOAddr, _IDOSupply);
        _mint(_CEXAddr, _CEXSupply);
        _mint(_punchwordTreasuryAddr, _punchwordTreasurySupply);
        _mint(_giveawaysAddr, _giveawaysSupply);

        alreadyMinted=true;
        pause();

    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
    * @dev Returns  team address.
    */
    function getTeamAddr() external view returns (address) {
    return _teamAddr;
    }

    /**
    * @dev Returns  teamTimeLockAddress address.
    */
    function getTeamTimeLockAddr() external view returns (address) {
    return _teamTimeLock;
    }


    /**
    * @dev Returns  team address.
    */
    function getAdvisorsVestingAddr() external view returns (address) {
    return address(_advisorsVesting);
    }

    /**
    * @dev Returns  team address.
    */
    function getPrivateSaleAddr() external view returns (address) {
    return _privateSaleAddr;
    }

    /**
    * @dev Returns  team address.
    */
    function getPresaleAddr() external view returns (address) {
    return _presaleAddr;
    }

    /**
    * @dev Returns  team address.
    */
    function getIDOAddr() external view returns (address) {
    return _IDOAddr;
    }

    /**
    * @dev Returns  team address.
    */
    function getCEXAddr() external view returns (address) {
    return _CEXAddr;
    }

    /**
    * @dev Returns  team address.
    */
    function getPunchwordTreasuryAddr() external view returns (address) {
    return _punchwordTreasuryAddr;
    }

    /**
    * @dev Returns  team address.
    */
    function getgiveawaysAddr() external view returns (address) {
    return _giveawaysAddr;
    }
}
