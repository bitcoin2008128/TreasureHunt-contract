// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;
contract TreasureHunt {
    mapping (address => uint256) public playerPositions;
    uint256 public treasurePosition;

    uint256 public constant gridSize = 10;

    uint256 public constant gridSizeSquared = gridSize * gridSize;

    event Move(address player, uint256 from, uint256 to);
    event Win(address player, uint256 reward);
    constructor() {
        treasurePosition = uint256(keccak256(abi.encodePacked(block.number))) % gridSizeSquared;
    }


    function move(uint256 direction) public {

    if (playerPositions[msg.sender] == 0) {
        revert("You haven't joined the game yet");
    }
    if (getAdjacentPosition(playerPositions[msg.sender], direction) == playerPositions[msg.sender]) {
        revert("You can't move to the same position");
    }
        
        uint256 newPosition = getAdjacentPosition(playerPositions[msg.sender], direction);
    
        playerPositions[msg.sender] =newPosition;

        if (newPosition % 5 == 0) {
            treasurePosition = getRandomAdjacentPosition(treasurePosition);
        } else if (isPrime(newPosition)) {
            treasurePosition = uint256(keccak256(abi.encodePacked(block.timestamp))) % gridSizeSquared;
        }

        if (newPosition == treasurePosition) {
    
            uint256 reward = address(this).balance * 9 / 10;
        
            payable(msg.sender).transfer(reward);
    
            emit Win(msg.sender, reward);
        }
        emit Move(msg.sender, playerPositions[msg.sender], newPosition);
    }

    function join() public payable {
        require(msg.value > 0, "You must send some ETH to join the game");
        playerPositions[msg.sender] = uint256(keccak256(abi.encodePacked(msg.sender))) % gridSizeSquared;
    }
    function getAdjacentPosition(uint256 position, uint256 direction) internal pure returns (uint256) {
        if (direction == 0) { 
            return position - gridSize;
        } else if (direction == 1) { 
            return position + 1;
        } else if (direction == 2) { 
            return position + gridSize;
        } else if (direction == 3) { 
            return position - 1;
        }
        return position; 
    }

    function getRandomAdjacentPosition(uint256 position) view internal returns (uint256) {
        uint256 direction = uint256(keccak256(abi.encodePacked(block.timestamp))) % 4;
        return getAdjacentPosition(position, direction);
    }
    function isPrime(uint256 number) internal pure returns (bool) {
        if (number <= 1) {
            return false;
        }
        for (uint256 i = 2; i * i <= number; i++) {
            if (number % i == 0) {
                return false;
            }
        }
        return true;
    }
}