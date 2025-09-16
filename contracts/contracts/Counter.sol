// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Counter
 * @dev Simple counter contract for testing and demonstration
 * @notice Provides basic arithmetic operations with overflow protection
 */
contract Counter {
    uint256 public count;
    uint256 public maxCount;
    
    event CountUpdated(uint256 newCount, string operation);
    event CounterReset();

    constructor() {
        count = 0;
        maxCount = 1000000; // 1 million max
    }

    /**
     * @dev Add value to counter
     * @param value The value to add
     */
    function add(uint256 value) external {
        require(value > 0, "Value must be greater than 0");
        require(count + value <= maxCount, "Counter would exceed maximum");
        
        count += value;
        emit CountUpdated(count, "add");
    }

    /**
     * @dev Subtract value from counter
     * @param value The value to subtract
     */
    function subtract(uint256 value) external {
        require(value > 0, "Value must be greater than 0");
        require(count >= value, "Counter would go negative");
        
        count -= value;
        emit CountUpdated(count, "subtract");
    }

    /**
     * @dev Multiply counter by value
     * @param value The multiplier
     */
    function multiply(uint256 value) external {
        require(value > 0, "Value must be greater than 0");
        require(count * value <= maxCount, "Counter would exceed maximum");
        
        count *= value;
        emit CountUpdated(count, "multiply");
    }

    /**
     * @dev Divide counter by value
     * @param value The divisor
     */
    function divide(uint256 value) external {
        require(value > 0, "Value must be greater than 0");
        
        count /= value;
        emit CountUpdated(count, "divide");
    }

    /**
     * @dev Reset counter to zero
     */
    function reset() external {
        count = 0;
        emit CounterReset();
    }

    /**
     * @dev Batch add multiple values
     * @param values Array of values to add
     */
    function batchAdd(uint256[] calldata values) external {
        require(values.length > 0, "Values array cannot be empty");
        
        for (uint256 i = 0; i < values.length; i++) {
            require(values[i] > 0, "All values must be greater than 0");
            require(count + values[i] <= maxCount, "Counter would exceed maximum");
            count += values[i];
        }
        
        emit CountUpdated(count, "batchAdd");
    }

    /**
     * @dev Batch subtract multiple values
     * @param values Array of values to subtract
     */
    function batchSubtract(uint256[] calldata values) external {
        require(values.length > 0, "Values array cannot be empty");
        
        for (uint256 i = 0; i < values.length; i++) {
            require(values[i] > 0, "All values must be greater than 0");
            require(count >= values[i], "Counter would go negative");
            count -= values[i];
        }
        
        emit CountUpdated(count, "batchSubtract");
    }

    /**
     * @dev Get current count
     * @return The current count value
     */
    function getCount() external view returns (uint256) {
        return count;
    }

    /**
     * @dev Get maximum count
     * @return The maximum count value
     */
    function getMaxCount() external view returns (uint256) {
        return maxCount;
    }

    /**
     * @dev Check if counter is at maximum
     * @return True if counter is at maximum
     */
    function isAtMax() external view returns (bool) {
        return count >= maxCount;
    }

    /**
     * @dev Check if counter is at zero
     * @return True if counter is at zero
     */
    function isAtZero() external view returns (bool) {
        return count == 0;
    }
}

