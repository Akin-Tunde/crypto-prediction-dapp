// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PredictionMarket {
    address public immutable oracle;
    uint256 public immutable priceTarget;
    uint256 public immutable resolutionTimestamp;

    enum Position { UP, DOWN }
    enum MarketState { OPEN, RESOLVED }
    MarketState public state = MarketState.OPEN;

    mapping(address => uint256) public betsUp;
    mapping(address => uint256) public betsDown;
    uint256 public totalBetsUp;
    uint256 public totalBetsDown;

    event BetPlaced(address indexed user, Position position, uint256 amount);
    event MarketResolved(uint256 finalPrice, Position winningPosition);

    constructor(uint256 _priceTarget, uint256 _resolutionTimestamp, address _oracle) {
        priceTarget = _priceTarget;
        resolutionTimestamp = _resolutionTimestamp;
        oracle = _oracle;
    }

    function placeBet(Position _position) public payable {
        require(state == MarketState.OPEN, "Market is not open");
        require(block.timestamp < resolutionTimestamp, "Betting has closed");
        require(msg.value > 0, "Must bet more than 0 ETH");

        if (_position == Position.UP) {
            betsUp[msg.sender] += msg.value;
            totalBetsUp += msg.value;
        } else {
            betsDown[msg.sender] += msg.value;
            totalBetsDown += msg.value;
        }
        emit BetPlaced(msg.sender, _position, msg.value);
    }

    function resolveMarket() public {
        require(state == MarketState.OPEN, "Market already resolved");
        require(block.timestamp >= resolutionTimestamp, "Market not yet ready");

        (, int256 price, , , ) = AggregatorV3Interface(oracle).latestRoundData();
        uint256 finalPrice = uint256(price);

        Position winningPosition = finalPrice > priceTarget ? Position.UP : Position.DOWN;
        state = MarketState.RESOLVED;
        emit MarketResolved(finalPrice, winningPosition);
    }
}