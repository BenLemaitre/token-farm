pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";         // state variable, will be stored in blockchain
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    // a mapping is a data structure (key => value)
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stakes Tokens (Deposit)
    function stakeTokens(uint _amount) public {
        // require amount greater than 0 (if false, an exception will be raised)
        require(_amount > 0, "ammount cannot be 0");

        // Transfer Mock Dai Tokens to this contract for staking
        // msg is a global variable, sender is the person calling the function
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] += _amount;

        // add user to stakers array only if they havent staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Issuing Tokens
    function issueTokens() public {
        // only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // issue token to all stakers
        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];

            if (balance > 0) {
                // rewards = x2
                dappToken.transfer(recipient, balance);
            }
        }
    }

    // Unstaking all Tokens (Withdraw)
    function unstakeTokens() public {
        // staking balance 
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "amount cannot be 0");

        // transfer mDai tokens to sender
        daiToken.transfer(msg.sender, balance);

        // reset balance
        stakingBalance[msg.sender] = 0;

        // update status
        isStaking[msg.sender] = false;
    }
}