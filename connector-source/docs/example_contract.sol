// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// =============================================
// MAIN TEST CONTRACT - COMPREHENSIVE WALLET TESTING
// =============================================

/**
 * @title ConfluxWalletTestSuite
 * @dev Comprehensive contract to test all wallet delegation use cases
 * Deploys on both eSpace and Core chains to test dual-chain functionality
 */
contract ConfluxWalletTestSuite is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    // =============================================
    // EVENTS FOR TESTING DELEGATION MONITORING
    // =============================================
    
    event SimpleTransfer(address indexed from, address indexed to, uint256 amount);
    event ContractInteraction(address indexed user, string action, uint256 value);
    event ParameterUpdate(string parameter, uint256 oldValue, uint256 newValue);
    event BatchOperation(address indexed user, uint256[] amounts, string[] actions);
    event TimeLockOperation(address indexed user, uint256 unlockTime, string action);
    event HighValueTransaction(address indexed user, uint256 amount, string reason);
    event CrossChainMessage(address indexed sender, string destinationChain, bytes data);
    event GamingAction(address indexed player, uint256 gameId, string action, uint256 cost);
    event DeFiOperation(address indexed user, string protocol, uint256 amount, string operation);
    
    // =============================================
    // STATE VARIABLES FOR TESTING
    // =============================================
    
    Counters.Counter private _operationCounter;
    Counters.Counter private _gameIdCounter;
    
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public lastActionTime;
    mapping(address => bool) public premiumUsers;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => StakingPosition) public stakingPositions;
    
    struct GameSession {
        address player;
        uint256 gameId;
        uint256 startTime;
        uint256 score;
        bool active;
        uint256 entryFee;
    }
    
    struct StakingPosition {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        bool active;
    }
    
    // Configuration parameters for testing limits
    uint256 public maxTransactionAmount = 1000 ether;
    uint256 public dailyTransactionLimit = 5000 ether;
    uint256 public gameEntryCost = 0.1 ether;
    uint256 public premiumUpgradeCost = 10 ether;
    uint256 public stakingRewardRate = 100; // 1% per day (100 basis points)
    
    // Time-based restrictions for testing
    uint256 public operatingHoursStart = 6; // 6 AM
    uint256 public operatingHoursEnd = 22;   // 10 PM
    
    // =============================================
    // BASIC WALLET OPERATIONS
    // =============================================
    
    /**
     * @dev Simple value transfer - should be auto-approved for small amounts
     */
    function simpleTransfer(address to) external payable whenNotPaused {
        require(to != address(0), "Invalid recipient");
        require(msg.value > 0, "Must send value");
        
        userBalances[to] += msg.value;
        emit SimpleTransfer(msg.sender, to, msg.value);
        emit ContractInteraction(msg.sender, "simpleTransfer", msg.value);
        
        _operationCounter.increment();
    }
    
    /**
     * @dev Withdraw user balance - medium risk operation
     */
    function withdrawBalance() external nonReentrant whenNotPaused {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit ContractInteraction(msg.sender, "withdrawBalance", balance);
    }
    
    /**
     * @dev Batch transfer - should test batch operation delegation
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) 
        external payable whenNotPaused {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 10, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient value");
        
        string[] memory actions = new string[](recipients.length);
        for (uint i = 0; i < recipients.length; i++) {
            userBalances[recipients[i]] += amounts[i];
            actions[i] = "batchTransfer";
        }
        
        emit BatchOperation(msg.sender, amounts, actions);
    }
    
    // =============================================
    // PARAMETER UPDATES - TESTING GOVERNANCE OPERATIONS
    // =============================================
    
    /**
     * @dev Update max transaction amount - should require approval for large changes
     */
    function updateMaxTransactionAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be positive");
        require(newAmount <= 10000 ether, "Amount too large");
        
        uint256 oldValue = maxTransactionAmount;
        maxTransactionAmount = newAmount;
        
        emit ParameterUpdate("maxTransactionAmount", oldValue, newAmount);
    }
    
    /**
     * @dev Update game entry cost - test parameter modification delegation
     */
    function updateGameEntryCost(uint256 newCost) external onlyOwner {
        uint256 oldValue = gameEntryCost;
        gameEntryCost = newCost;
        
        emit ParameterUpdate("gameEntryCost", oldValue, newCost);
    }
    
    /**
     * @dev Emergency pause - should always require approval
     */
    function emergencyPause() external onlyOwner {
        _pause();
        emit ContractInteraction(msg.sender, "emergencyPause", 0);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractInteraction(msg.sender, "unpause", 0);
    }
    
    // =============================================
    // GAMING OPERATIONS - MICRO-TRANSACTIONS
    // =============================================
    
    /**
     * @dev Start a game session - should be auto-approved for regular users
     */
    function startGame() external payable whenNotPaused {
        require(msg.value >= gameEntryCost, "Insufficient entry fee");
        
        uint256 gameId = _gameIdCounter.current();
        _gameIdCounter.increment();
        
        gameSessions[gameId] = GameSession({
            player: msg.sender,
            gameId: gameId,
            startTime: block.timestamp,
            score: 0,
            active: true,
            entryFee: msg.value
        });
        
        emit GamingAction(msg.sender, gameId, "startGame", msg.value);
    }
    
    /**
     * @dev Submit game score - free operation, should always be auto-approved
     */
    function submitScore(uint256 gameId, uint256 score) external whenNotPaused {
        GameSession storage session = gameSessions[gameId];
        require(session.player == msg.sender, "Not your game");
        require(session.active, "Game not active");
        
        session.score = score;
        
        // Award rewards based on score
        if (score > 1000) {
            userRewards[msg.sender] += 0.01 ether; // Small reward
        }
        
        emit GamingAction(msg.sender, gameId, "submitScore", 0);
    }
    
    /**
     * @dev End game and claim rewards
     */
    function endGame(uint256 gameId) external whenNotPaused {
        GameSession storage session = gameSessions[gameId];
        require(session.player == msg.sender, "Not your game");
        require(session.active, "Game not active");
        
        session.active = false;
        
        // Determine rewards based on score and time played
        uint256 playTime = block.timestamp - session.startTime;
        uint256 reward = (session.score * playTime) / 10000; // Simple reward calculation
        
        if (reward > 0) {
            userRewards[msg.sender] += reward;
        }
        
        emit GamingAction(msg.sender, gameId, "endGame", reward);
    }
    
    /**
     * @dev Purchase premium upgrade - higher value, should require approval
     */
    function purchasePremium() external payable whenNotPaused {
        require(msg.value >= premiumUpgradeCost, "Insufficient payment");
        require(!premiumUsers[msg.sender], "Already premium");
        
        premiumUsers[msg.sender] = true;
        
        emit GamingAction(msg.sender, 0, "purchasePremium", msg.value);
        emit HighValueTransaction(msg.sender, msg.value, "Premium upgrade");
    }
    
    // =============================================
    // DEFI OPERATIONS - STAKING AND YIELDS
    // =============================================
    
    /**
     * @dev Stake tokens - should be auto-approved for reasonable amounts
     */
    function stake() external payable whenNotPaused {
        require(msg.value > 0, "Must stake something");
        
        StakingPosition storage position = stakingPositions[msg.sender];
        
        // If already staking, calculate and add pending rewards
        if (position.active) {
            uint256 pendingRewards = calculatePendingRewards(msg.sender);
            userRewards[msg.sender] += pendingRewards;
        }
        
        position.amount += msg.value;
        position.startTime = block.timestamp;
        position.lastRewardTime = block.timestamp;
        position.active = true;
        
        emit DeFiOperation(msg.sender, "ConfluxStaking", msg.value, "stake");
    }
    
    /**
     * @dev Harvest staking rewards - free operation
     */
    function harvestRewards() external whenNotPaused {
        StakingPosition storage position = stakingPositions[msg.sender];
        require(position.active, "No active staking position");
        
        uint256 rewards = calculatePendingRewards(msg.sender);
        require(rewards > 0, "No rewards to harvest");
        
        position.lastRewardTime = block.timestamp;
        userRewards[msg.sender] += rewards;
        
        emit DeFiOperation(msg.sender, "ConfluxStaking", rewards, "harvest");
    }
    
    /**
     * @dev Unstake tokens - should require approval for large amounts
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        StakingPosition storage position = stakingPositions[msg.sender];
        require(position.active, "No active staking position");
        require(amount <= position.amount, "Insufficient staked amount");
        
        // Harvest pending rewards first
        uint256 rewards = calculatePendingRewards(msg.sender);
        userRewards[msg.sender] += rewards;
        
        // Update position
        position.amount -= amount;
        position.lastRewardTime = block.timestamp;
        
        if (position.amount == 0) {
            position.active = false;
        }
        
        // Transfer unstaked amount
        payable(msg.sender).transfer(amount);
        
        emit DeFiOperation(msg.sender, "ConfluxStaking", amount, "unstake");
        
        if (amount > 100 ether) {
            emit HighValueTransaction(msg.sender, amount, "Large unstake");
        }
    }
    
    /**
     * @dev Calculate pending staking rewards
     */
    function calculatePendingRewards(address user) public view returns (uint256) {
        StakingPosition memory position = stakingPositions[user];
        if (!position.active) return 0;
        
        uint256 timeStaked = block.timestamp - position.lastRewardTime;
        uint256 dailyReward = (position.amount * stakingRewardRate) / 10000;
        return (dailyReward * timeStaked) / 1 days;
    }
    
    // =============================================
    // TIME-BASED OPERATIONS - TESTING TIME RESTRICTIONS
    // =============================================
    
    /**
     * @dev Time-restricted operation - only during business hours
     */
    function businessHoursOperation() external payable whenNotPaused {
        uint256 hour = (block.timestamp / 3600) % 24;
        require(hour >= operatingHoursStart && hour < operatingHoursEnd, 
                "Operation only allowed during business hours");
        
        userBalances[msg.sender] += msg.value;
        emit ContractInteraction(msg.sender, "businessHoursOperation", msg.value);
    }
    
    /**
     * @dev Time-locked operation - requires waiting period
     */
    function createTimelock(string calldata action) external payable whenNotPaused {
        uint256 unlockTime = block.timestamp + 1 hours;
        
        emit TimeLockOperation(msg.sender, unlockTime, action);
        emit ContractInteraction(msg.sender, "createTimelock", msg.value);
    }
    
    // =============================================
    // HIGH-VALUE OPERATIONS - REQUIRE MANUAL APPROVAL
    // =============================================
    
    /**
     * @dev Large value transfer - should always require approval
     */
    function largeValueTransfer(address to) external payable whenNotPaused {
        require(msg.value >= 100 ether, "Not a large value transaction");
        require(to != address(0), "Invalid recipient");
        
        userBalances[to] += msg.value;
        
        emit HighValueTransaction(msg.sender, msg.value, "Large transfer");
        emit SimpleTransfer(msg.sender, to, msg.value);
    }
    
    /**
     * @dev Contract upgrade simulation - critical operation
     */
    function criticalSystemUpdate(uint256 newVersion) external onlyOwner {
        require(newVersion > 0, "Invalid version");
        
        emit ParameterUpdate("systemVersion", 0, newVersion);
        emit HighValueTransaction(msg.sender, 0, "Critical system update");
    }
    
    // =============================================
    // CROSS-CHAIN TESTING OPERATIONS
    // =============================================
    
    /**
     * @dev Simulate cross-chain message for dual-chain testing
     */
    function sendCrossChainMessage(
        string calldata destinationChain,
        bytes calldata data
    ) external payable whenNotPaused {
        require(bytes(destinationChain).length > 0, "Invalid destination");
        require(data.length > 0, "Empty data");
        
        emit CrossChainMessage(msg.sender, destinationChain, data);
        emit ContractInteraction(msg.sender, "crossChainMessage", msg.value);
    }
    
    /**
     * @dev Bridge simulation - test cross-chain asset movement
     */
    function bridgeAssets(
        string calldata targetChain,
        uint256 amount
    ) external payable whenNotPaused {
        require(msg.value >= amount, "Insufficient value");
        require(bytes(targetChain).length > 0, "Invalid target chain");
        
        // Simulate bridge by locking funds
        emit CrossChainMessage(msg.sender, targetChain, abi.encode(amount));
        emit DeFiOperation(msg.sender, "Bridge", amount, "bridge");
        
        if (amount > 50 ether) {
            emit HighValueTransaction(msg.sender, amount, "Large bridge");
        }
    }
    
    // =============================================
    // BATCH OPERATIONS - TESTING COMPLEX WORKFLOWS
    // =============================================
    
    /**
     * @dev Complex multi-step operation
     */
    function complexWorkflow(
        uint256 stakeAmount,
        uint256 gameEntries,
        address[] calldata transferRecipients,
        uint256[] calldata transferAmounts
    ) external payable whenNotPaused {
        require(msg.value >= stakeAmount + (gameEntries * gameEntryCost), 
                "Insufficient value for workflow");
        
        // Step 1: Stake some amount
        if (stakeAmount > 0) {
            StakingPosition storage position = stakingPositions[msg.sender];
            position.amount += stakeAmount;
            position.startTime = block.timestamp;
            position.lastRewardTime = block.timestamp;
            position.active = true;
        }
        
        // Step 2: Start multiple games
        for (uint i = 0; i < gameEntries && i < 3; i++) {
            uint256 gameId = _gameIdCounter.current();
            _gameIdCounter.increment();
            
            gameSessions[gameId] = GameSession({
                player: msg.sender,
                gameId: gameId,
                startTime: block.timestamp,
                score: 0,
                active: true,
                entryFee: gameEntryCost
            });
        }
        
        // Step 3: Batch transfers
        require(transferRecipients.length == transferAmounts.length, "Array mismatch");
        for (uint i = 0; i < transferRecipients.length && i < 5; i++) {
            userBalances[transferRecipients[i]] += transferAmounts[i];
        }
        
        emit ContractInteraction(msg.sender, "complexWorkflow", msg.value);
    }
    
    // =============================================
    // ANALYTICS AND MONITORING
    // =============================================
    
    /**
     * @dev Get user statistics for delegation analytics
     */
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 rewards,
        uint256 lastAction,
        bool isPremium,
        uint256 stakedAmount,
        bool hasActiveStaking
    ) {
        return (
            userBalances[user],
            userRewards[user],
            lastActionTime[user],
            premiumUsers[user],
            stakingPositions[user].amount,
            stakingPositions[user].active
        );
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalOperations,
        uint256 totalGames,
        uint256 contractBalance,
        bool isPaused
    ) {
        return (
            _operationCounter.current(),
            _gameIdCounter.current(),
            address(this).balance,
            paused()
        );
    }
    
    // =============================================
    // EMERGENCY AND ADMIN FUNCTIONS
    // =============================================
    
    /**
     * @dev Emergency withdrawal - should always require approval
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        
        emit HighValueTransaction(msg.sender, balance, "Emergency withdrawal");
    }
    
    /**
     * @dev Update operating hours for time-based testing
     */
    function updateOperatingHours(uint256 start, uint256 end) external onlyOwner {
        require(start < 24 && end < 24 && start < end, "Invalid hours");
        
        operatingHoursStart = start;
        operatingHoursEnd = end;
        
        emit ParameterUpdate("operatingHours", start, end);
    }
    
    // =============================================
    // FALLBACK AND RECEIVE
    // =============================================
    
    receive() external payable {
        emit SimpleTransfer(msg.sender, address(this), msg.value);
    }
    
    fallback() external payable {
        emit ContractInteraction(msg.sender, "fallback", msg.value);
    }
}

// =============================================
// ERC20 TOKEN FOR TESTING TOKEN OPERATIONS
// =============================================

/**
 * @title ConfluxTestToken
 * @dev ERC20 token for testing delegation with token operations
 */
contract ConfluxTestToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1M tokens
    uint256 public mintPrice = 0.001 ether; // 0.001 CFX per token
    
    mapping(address => bool) public minters;
    mapping(address => uint256) public lastMintTime;
    
    event TokensMinted(address indexed to, uint256 amount, uint256 cost);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("Conflux Test Token", "CTT") {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000 * 10**18);
    }
    
    /**
     * @dev Public minting function - test auto-approval for small amounts
     */
    function mint(uint256 amount) external payable {
        require(amount > 0, "Amount must be positive");
        require(amount <= 1000 * 10**18, "Amount too large for public mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= amount * mintPrice / 10**18, "Insufficient payment");
        
        // Rate limiting: max 100 tokens per hour
        require(
            block.timestamp >= lastMintTime[msg.sender] + 1 hours || 
            amount <= 100 * 10**18,
            "Rate limit exceeded"
        );
        
        lastMintTime[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
        
        emit TokensMinted(msg.sender, amount, msg.value);
    }
    
    /**
     * @dev Batch mint to multiple addresses - test batch operations
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 10, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= totalAmount * mintPrice / 10**18, "Insufficient payment");
        
        for (uint i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i], 0);
        }
    }
    
    /**
     * @dev Update mint price - governance operation
     */
    function updateMintPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be positive");
        require(newPrice <= 0.01 ether, "Price too high");
        
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        
        emit MintPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Add authorized minter - admin operation
     */
    function addMinter(address minter) external onlyOwner {
        require(!minters[minter], "Already a minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter - admin operation
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Privileged mint for authorized minters
     */
    function privilegedMint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized minter");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, 0);
    }
}

// =============================================
// NFT CONTRACT FOR TESTING NFT OPERATIONS
// =============================================

/**
 * @title ConfluxTestNFT
 * @dev ERC721 NFT for testing delegation with NFT operations
 */
contract ConfluxTestNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    uint256 public mintPrice = 0.1 ether;
    uint256 public maxSupply = 10000;
    uint256 public maxMintPerTransaction = 5;
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => bool) public freeMinters;
    mapping(address => uint256) public lastFreeMint;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 price);
    event BatchMinted(address indexed to, uint256[] tokenIds);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event FreeMinterAdded(address indexed minter);
    
    constructor() ERC721("Conflux Test NFT", "CTN") {}
    
    /**
     * @dev Public mint function - test auto-approval for small amounts
     */
    function mint() external payable {
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked("https://api.conflux-nft.test/", Strings.toString(newTokenId))));
        
        emit NFTMinted(msg.sender, newTokenId, msg.value);
    }
    
    /**
     * @dev Batch mint function - test batch operations
     */
    function batchMint(uint256 quantity) external payable {
        require(quantity > 0 && quantity <= maxMintPerTransaction, "Invalid quantity");
        require(_tokenIds.current() + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            tokenIds[i] = newTokenId;
            
            _mint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, string(abi.encodePacked("https://api.conflux-nft.test/", Strings.toString(newTokenId))));
        }
        
        emit BatchMinted(msg.sender, tokenIds);
    }
    
    /**
     * @dev Free mint for whitelisted addresses - test whitelist operations
     */
    function freeMint() external {
        require(freeMinters[msg.sender], "Not eligible for free mint");
        require(block.timestamp >= lastFreeMint[msg.sender] + 1 days, "Free mint cooldown");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        lastFreeMint[msg.sender] = block.timestamp;
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked("https://api.conflux-nft.test/free/", Strings.toString(newTokenId))));
        
        emit NFTMinted(msg.sender, newTokenId, 0);
    }
    
    /**
     * @dev Update mint price - governance operation
     */
    function updateMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Add free minter - admin operation
     */
    function addFreeMinter(address minter) external onlyOwner {
        freeMinters[minter] = true;
        emit FreeMinterAdded(minter);
    }
    
    /**
     * @dev Set token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIds.current();
    }
}

// =============================================
// DEPLOYMENT SCRIPT INFORMATION
// =============================================

/*
DEPLOYMENT INSTRUCTIONS:

1. eSpace Deployment:
   - Network: Conflux eSpace (Chain ID: 1030 for mainnet, 71 for testnet)
   - Use standard deployment tools (Hardhat, Remix, etc.)
   - Gas: Use CFX for gas fees
   - Example addresses format: 0x1234...

2. Core Deployment:
   - Network: Conflux Core (Chain ID: 1029 for mainnet, 1 for testnet)  
   - Use Conflux-Portal or Core-specific tools
   - Gas: Use CFX for gas fees
   - Example addresses format: cfx:type.contract:acc7uawf5ubtnmezvhu9dhc6sghea0403y2dgpyfjp

3. Test Scenarios:
   
   AUTO-APPROVAL SCENARIOS (should not require user confirmation):
   - simpleTransfer() with amount < 1 CFX
   - startGame() with standard entry fee
   - submitScore() (free operation)
   - harvestRewards() (free operation)
   - mint() token with amount < 10 tokens
   - mint() NFT single item
   
   REQUIRE-APPROVAL SCENARIOS (shoul
