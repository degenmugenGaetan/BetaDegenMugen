// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "hardhat/console.sol";

abstract contract NFTInterface {
    function getNFTOwner(uint256 id) external view virtual returns (address);
}

contract DegenMugen {
    NFTInterface NFTContract;

    address NFTContractAddress;
    string public name;
    string public functionCalled;

    // Open 0 , Closed 1 , Resolved 2 , Cancelled 3
    uint256 state;

    uint256 public totalBetOne;
    uint256 public totalBetTwo;
    uint256 public minimumBet;

    address payable[] public players;

    struct Player {
        uint256 amountBet;
        uint256 teamSelected;
    }

    struct Game {
        uint256 p1;
        uint256 p2;
        uint256 stage;
    }
    struct Percent {
        uint256 percentTotalFees;
        uint256 percentContractFees;
        uint256 percentP1Fees;
        uint256 percentP2Fees;
        uint256 percentStageFees;
        uint256 divideNumber;
        uint256 ninetyPercent;
    }

    struct GameAddress {
        address payable p1Address;
        address payable p2Address;
        address payable stageAddress;
    }

    // Address of the player and => the user info
    mapping(address => Player) public playerInfo;
    Game game;
    Percent percent;
    GameAddress gameAddress;

    event changeState(address indexed _from, uint256 _value);
    event betMade(address indexed _from, uint256 _value, uint256 _player);
    event fight(uint256 p1, uint256 p2, uint256 stage);
    event fightWinner(uint256 winner);
    event trPaid(address _to, uint256 amount);

    event debugEventStr(address indexed _from, string _value);
    event debugEventUint(
        address indexed _from,
        string _message,
        uint256 _value
    );
    event myDebug(string value);

    constructor(address _address) {
        name = "Dapp University Social Network !!";
        state = 1;
        // 100000000000000 wei correspond to 0.0001 ether
        minimumBet = 100000000000000;
        NFTContractAddress = _address;
        NFTContract = NFTInterface(_address);
    }

    receive() external payable {}

    fallback() external payable {}

    function setNFTContractAddress(address _address) external {
        NFTContract = NFTInterface(_address);
    }

    function getNFTOwner(uint256 id) public view returns (address) {
        return NFTContract.getNFTOwner(id);
    }

    function checkPlayerExists(address player) public view returns (bool) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) return true;
        }
        return false;
    }

    function setState(uint256 _state) public {
        state = _state;
        emit changeState(msg.sender, _state);
    }

    function getState() public view returns (uint256) {
        return state;
    }

    function bet(uint256 amount, uint256 player) public payable {
        //emit debugEventUint(msg.sender, "valeur de state: ", state);
        //require(state == 0, 'bet is not open');
        //The first require is used to check if the player already exist
        //require(!checkPlayerExists(msg.sender));
        //The second one is used to see if the value sended by the player is
        //Higher than the minum value
        require(msg.value >= minimumBet);

        emit debugEventStr(msg.sender, "Je suis bien rentre dans la fct");
        //We set the player informations : amount of the bet and selected team
        playerInfo[msg.sender].amountBet = msg.value;
        playerInfo[msg.sender].teamSelected = player;

        //then we add the address of the player to the players array
        players.push(payable(msg.sender));

        //at the end, we increment the stakes of the team selected with the player bet
        if (player == 1) {
            totalBetOne += msg.value;
        } else {
            totalBetTwo += msg.value;
        }
        emit betMade(msg.sender, amount, player);
    }

    function distributePrizes(uint256 teamWinner) public {
        address payable[1000] memory winners;
        //We have to create a temporary in memory array with fixed size
        //Let's choose 1000
        uint256 count = 0; // This is the count for the array of winners
        uint256 LoserBet = 0; //This will take the value of all losers bet
        uint256 WinnerBet = 0; //This will take the value of all winners bet
        address add;
        uint256 amountBet;
        address payable playerAddress;
        uint256 tmp;
        uint256 totalFees;
        uint256 contractFees;
        uint256 p1Fees;
        uint256 p2Fees;
        uint256 stageFees;

        percent.percentTotalFees = 1000;
        percent.percentContractFees = 4000;
        percent.percentP1Fees = 3000;
        percent.percentP2Fees = 2000;
        percent.percentStageFees = 1000;
        percent.divideNumber = 10000;
        percent.ninetyPercent = 9000;

        //We loop through the player array to check who selected the winner team
        for (uint256 i = 0; i < players.length; i++) {
            playerAddress = players[i];
            //If the player selected the winner team
            //We add his address to the winners array
            if (playerInfo[playerAddress].teamSelected == teamWinner) {
                winners[count] = playerAddress;
                count++;
            }
        }
        //We define which bet sum is the Loser one and which one is the winner
        if (teamWinner == 1) {
            LoserBet = totalBetTwo;
            WinnerBet = totalBetOne;
        } else {
            LoserBet = totalBetOne;
            WinnerBet = totalBetTwo;
        }

        totalFees =
            ((WinnerBet + LoserBet) * percent.percentTotalFees) /
            percent.divideNumber;

        LoserBet = (LoserBet * percent.ninetyPercent) / percent.divideNumber;
        WinnerBet = (WinnerBet * percent.ninetyPercent) / percent.divideNumber;

        //We loop through the array of winners, to give ethers to the winners
        for (uint256 j = 0; j < count; j++) {
            // Check that the address in this fixed array is not empty
            if (winners[j] != address(0)) {
                add = winners[j];
                amountBet =
                    (playerInfo[add].amountBet * percent.ninetyPercent) /
                    percent.divideNumber;
                //Transfer the money to the user
                tmp = amountBet + (amountBet * LoserBet) / WinnerBet;
                winners[j].transfer(tmp);
                emit trPaid(winners[j], tmp);
                //winners[j].transfer((amountBet*(10000+(LoserBet*10000/WinnerBet)))/10000);
            }
        }

        contractFees =
            (totalFees * percent.percentContractFees) /
            percent.divideNumber;
        p1Fees = (totalFees * percent.percentP1Fees) / percent.divideNumber;
        p2Fees = (totalFees * percent.percentP2Fees) / percent.divideNumber;
        stageFees =
            (totalFees * percent.percentStageFees) /
            percent.divideNumber;

        gameAddress.p1Address = payable(getNFTOwner(game.p1));
        gameAddress.p2Address = payable(getNFTOwner(game.p2));
        gameAddress.stageAddress = payable(getNFTOwner(game.stage));

        if (game.p2 == teamWinner) {
            emit debugEventStr(msg.sender, "Inverse p1Fees et p2Fees ! ");

            (p1Fees, p2Fees) = (p2Fees, p1Fees);
        } else {}

        //gameAddress.p1Address.transfer(p1Fees);

        bool sent = gameAddress.p1Address.send(p1Fees);
        require(sent, "Failed to send Ether");
        emit trPaid(gameAddress.p1Address, p1Fees);

        gameAddress.p2Address.transfer(p2Fees);
        emit trPaid(gameAddress.p2Address, p2Fees);

        gameAddress.stageAddress.transfer(stageFees);
        emit trPaid(gameAddress.stageAddress, stageFees);

        //payable(address(this)).transfer(contractFees);
        emit trPaid(address(this), contractFees);

        delete playerInfo[playerAddress]; // Delete all the players
        delete players; // Delete all the players array
        LoserBet = 0; //reinitialize the bets
        WinnerBet = 0;
        totalBetOne = 0;
        totalBetTwo = 0;
        game.p1 = 0;
        game.p2 = 0;
        game.stage = 0;
    }

    function AmountOne() public view returns (uint256) {
        return totalBetOne;
    }

    function AmountTwo() public view returns (uint256) {
        return totalBetTwo;
    }

    function resetAmountOne() public {
        totalBetOne = 0;
    }

    function resetAmountTwo() public {
        totalBetTwo = 0;
    }

    function resetAmount() public {
        resetAmountOne();
        resetAmountTwo();
    }

    function changeName(string memory newName) public {
        name = newName;
    }

    function startFight(
        uint256 p1,
        uint256 p2,
        uint256 stage
    ) public {
        game.p1 = p1;
        game.p2 = p2;
        game.stage = stage;
        emit fight(p1, p2, stage);
        setState(0);
    }

    function endFight(uint256 winner) public {
        emit fightWinner(winner);
        distributePrizes(winner);
        setState(2);
    }

    /*
  function balanceOfSC() public returns(uint256) {
    return this.balance;
  }
  */
}
