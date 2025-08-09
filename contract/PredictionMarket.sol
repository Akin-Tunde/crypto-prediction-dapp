// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PredictionMarket
 * @author Akin-Tunde (enhanced by AI)
 * @dev A complete binary prediction market for a crypto asset's price.
 * Users can bet on whether the price will be above (UP) or below (DOWN) a target.
 * Winners can claim a proportional share of the total prize pool.
 */
contract PredictionMarket {
    //================================================
    // State Variables
    //================================================

    // The address of the Chainlink Price Feed oracle. It is immutable for security.
    address public immutable oracle;

    // The price target users are betting against (e.g., $80,000).
    uint256 public immutable priceTarget;

    // The timestamp when betting closes and the market can be resolved.
    uint256 public immutable resolutionTimestamp;

    // An enum to represent the two possible betting positions.
    enum Position { UP, DOWN }

    // An enum to track the current state of the market.
    enum MarketState { OPEN, RESOLVED }
    MarketState public state;

    // Mappings to track how much each user has bet on each position.
    mapping(address => uint256) public betsUp;
    mapping(address => uint256) public betsDown;

    // The total amount of ETH bet on each position.
    uint256 public totalBetsUp;
    uint256 public totalBetsDown;

    //================================================
    // Events
    //================================================

    event BetPlaced(address indexed user, Position position, uint256 amount);
    event MarketResolved(uint256 finalPrice, Position winningPosition);
    event WinningsClaimed(address indexed user, uint256 amount);

    //================================================
    // Constructor
    //================================================

    /**
     * @dev Sets up the market with its core parameters.
     * @param _priceTarget The price to predict against.
     * @param _resolutionTimestamp The Unix timestamp for when the market resolves.
     * @param _oracle The on-chain address of the Chainlink data feed.
     */
    constructor(uint256 _priceTarget, uint256 _resolutionTimestamp, address _oracle) {
        priceTarget = _priceTarget;
        resolutionTimestamp = _resolutionTimestamp;
        oracle = _oracle;
        state = MarketState.OPEN; // The market starts in the OPEN state.
    }

    //================================================
    // Core Functions
    //================================================

    /**
     * @dev Allows a user to place a bet by sending ETH.
     * @param _position The position the user is betting on (UP or DOWN).
     */
    function placeBet(Position _position) public payable {
        require(state == MarketState.OPEN, "Market is not open for betting");
        require(block.timestamp < resolutionTimestamp, "Betting has now closed");
        require(msg.value > 0, "Must bet more than 0 ETH");

        // Add the bet to the appropriate pool.
        if (_position == Position.UP) {
            betsUp[msg.sender] += msg.value;
            totalBetsUp += msg.value;
        } else {
            betsDown[msg.sender] += msg.value;
            totalBetsDown += msg.value;
        }

        emit BetPlaced(msg.sender, _position, msg.value);
    }

    /**
     * @dev Resolves the market after the resolution time has passed.
     * This function checks the final price from the oracle and sets the market state to RESOLVED.
     * Anyone can call this function to trigger the resolution.
     */
    function resolveMarket() public {
        require(state == MarketState.OPEN, "Market has already been resolved");
        require(block.timestamp >= resolutionTimestamp, "Market is not yet ready to resolve");

        // Get the latest price from the Chainlink oracle.
        (, int256 price, , , ) = AggregatorV3Interface(oracle).latestRoundData();
        uint256 finalPrice = uint256(price);

        // Determine the winning side.
        Position winningPosition = finalPrice > priceTarget ? Position.UP : Position.DOWN;
        
        // Update the market state to prevent further bets or re-resolutions.
        state = MarketState.RESOLVED;

        emit MarketResolved(finalPrice, winningPosition);
    }

    /**
     * @dev Allows winning users to claim their share of the prize pool.
     * The winnings are calculated proportionally to the user's bet size within the winning pool.
     */
    function claimWinnings() public {
        require(state == MarketState.RESOLVED, "Market is not yet resolved");

        // First, determine which position won by re-checking the final price.
        (, int256 price, , , ) = AggregatorV3Interface(oracle).latestRoundData();
        Position winningPosition = uint256(price) > priceTarget ? Position.UP : Position.DOWN;

        uint256 winnings = 0;

        if (winningPosition == Position.UP) {
            uint256 userBetAmount = betsUp[msg.sender];
            require(userBetAmount > 0, "You did not place a bet on the winning side");

            // The prize pool is the sum of all bets (both sides).
            uint256 totalPrizePool = totalBetsUp + totalBetsDown;
            // Winnings are proportional: (Your Bet / Total Winning Bets) * Total Prize Pool
            winnings = (userBetAmount * totalPrizePool) / totalBetsUp;

            // Set the user's bet to 0 to prevent them from claiming again.
            betsUp[msg.sender] = 0;

        } else { // The winning position was DOWN.
            uint256 userBetAmount = betsDown[msg.sender];
            require(userBetAmount > 0, "You did not place a bet on the winning side");

            uint256 totalPrizePool = totalBetsUp + totalBetsDown;
            winnings = (userBetAmount * totalPrizePool) / totalBetsDown;

            betsDown[msg.sender] = 0;
        }

        require(winnings > 0, "No winnings to claim");

        // Send the ETH to the user.
        (bool sent, ) = msg.sender.call{value: winnings}("");
        require(sent, "Failed to send winnings");

        emit WinningsClaimed(msg.sender, winnings);
    }
}