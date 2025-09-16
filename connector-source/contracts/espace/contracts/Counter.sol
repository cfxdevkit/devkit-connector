// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Counter is Ownable, ReentrancyGuard {
    uint256 private _count;
    uint256 private _maxCount;
    
    event CountChanged(uint256 newCount, string operation, uint256 value);
    event MaxCountUpdated(uint256 newMaxCount);
    
    constructor() Ownable(msg.sender) {
        _count = 0;
        _maxCount = 1000000; // Default max count
    }
    
    // View functions
    function getCount() external view returns (uint256) {
        return _count;
    }
    
    function getMaxCount() external view returns (uint256) {
        return _maxCount;
    }
    
    // Counter operations
    function add(uint256 value) external onlyOwner nonReentrant {
        require(_count + value <= _maxCount, "Counter: would exceed maximum count");
        _count += value;
        emit CountChanged(_count, "add", value);
    }
    
    function subtract(uint256 value) external onlyOwner nonReentrant {
        require(_count >= value, "Counter: insufficient count to subtract");
        _count -= value;
        emit CountChanged(_count, "subtract", value);
    }
    
    function multiply(uint256 value) external onlyOwner nonReentrant {
        require(value > 0, "Counter: multiplier must be greater than 0");
        require(_count * value <= _maxCount, "Counter: would exceed maximum count");
        _count *= value;
        emit CountChanged(_count, "multiply", value);
    }
    
    function divide(uint256 value) external onlyOwner nonReentrant {
        require(value > 0, "Counter: divisor must be greater than 0");
        _count /= value;
        emit CountChanged(_count, "divide", value);
    }
    
    function reset() external onlyOwner nonReentrant {
        _count = 0;
        emit CountChanged(_count, "reset", 0);
    }
    
    function setMaxCount(uint256 newMaxCount) external onlyOwner {
        require(newMaxCount > 0, "Counter: max count must be greater than 0");
        _maxCount = newMaxCount;
        emit MaxCountUpdated(newMaxCount);
    }
    
    // Batch operations
    function batchAdd(uint256[] calldata values) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < values.length; i++) {
            require(_count + values[i] <= _maxCount, "Counter: would exceed maximum count");
            _count += values[i];
        }
        emit CountChanged(_count, "batchAdd", values.length);
    }
    
    function batchSubtract(uint256[] calldata values) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < values.length; i++) {
            require(_count >= values[i], "Counter: insufficient count to subtract");
            _count -= values[i];
        }
        emit CountChanged(_count, "batchSubtract", values.length);
    }
}
