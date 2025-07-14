// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CodaiToken.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgentMarketplace
 * @dev Decentralized marketplace for AI agents and services
 * Features:
 * - Agent registration and verification
 * - Service payments in CODAI tokens
 * - Revenue sharing with developers
 * - Quality scoring and reputation
 */
contract AgentMarketplace is ReentrancyGuard, Ownable, Pausable {
    CodaiToken public immutable codaiToken;
    
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant REPUTATION_THRESHOLD = 100;
    
    struct Agent {
        address developer;
        string name;
        string description;
        string category;
        uint256 price;
        uint256 totalSales;
        uint256 totalRevenue;
        uint256 reputation;
        bool verified;
        bool active;
        string metadataURI;
        uint256 createdAt;
    }
    
    struct Purchase {
        address buyer;
        uint256 agentId;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public developerAgents;
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => Purchase[]) public agentPurchases;
    mapping(address => uint256) public developerEarnings;
    mapping(address => mapping(uint256 => bool)) public userOwnsAgent;
    
    uint256 public nextAgentId = 1;
    uint256 public totalRevenue;
    uint256 public totalAgents;
    uint256 public totalPurchases;
    
    event AgentRegistered(uint256 indexed agentId, address indexed developer, string name);
    event AgentPurchased(uint256 indexed agentId, address indexed buyer, uint256 amount);
    event AgentVerified(uint256 indexed agentId);
    event ReputationUpdated(uint256 indexed agentId, uint256 newReputation);
    event DeveloperEarningWithdrawn(address indexed developer, uint256 amount);
    
    constructor(address _codaiToken, address initialOwner) Ownable(initialOwner) {
        codaiToken = CodaiToken(_codaiToken);
    }
    
    /**
     * @dev Register a new AI agent
     */
    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata category,
        uint256 price,
        string calldata metadataURI
    ) external whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price must be greater than 0");
        
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            developer: msg.sender,
            name: name,
            description: description,
            category: category,
            price: price,
            totalSales: 0,
            totalRevenue: 0,
            reputation: 0,
            verified: false,
            active: true,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });
        
        developerAgents[msg.sender].push(agentId);
        totalAgents++;
        
        emit AgentRegistered(agentId, msg.sender, name);
        return agentId;
    }
    
    /**
     * @dev Purchase an AI agent
     */
    function purchaseAgent(uint256 agentId) external whenNotPaused nonReentrant {
        Agent storage agent = agents[agentId];
        require(agent.active, "Agent not active");
        require(!userOwnsAgent[msg.sender][agentId], "Already owns agent");
        
        uint256 price = agent.price;
        uint256 platformFee = (price * PLATFORM_FEE) / 10000;
        uint256 developerShare = price - platformFee;
        
        // Transfer CODAI tokens
        require(
            codaiToken.transferFrom(msg.sender, address(this), price),
            "Transfer failed"
        );
        
        // Update agent statistics
        agent.totalSales++;
        agent.totalRevenue += price;
        
        // Update developer earnings
        developerEarnings[agent.developer] += developerShare;
        
        // Record purchase
        agentPurchases[agentId].push(Purchase({
            buyer: msg.sender,
            agentId: agentId,
            amount: price,
            timestamp: block.timestamp,
            refunded: false
        }));
        
        userPurchases[msg.sender].push(agentId);
        userOwnsAgent[msg.sender][agentId] = true;
        
        totalRevenue += price;
        totalPurchases++;
        
        // Record earnings in token contract
        codaiToken.recordAgentEarning(agent.developer, developerShare, agent.category);
        
        emit AgentPurchased(agentId, msg.sender, price);
    }
    
    /**
     * @dev Verify an agent (only owner)
     */
    function verifyAgent(uint256 agentId) external onlyOwner {
        require(agents[agentId].developer != address(0), "Agent not found");
        agents[agentId].verified = true;
        emit AgentVerified(agentId);
    }
    
    /**
     * @dev Update agent reputation based on usage and ratings
     */
    function updateReputation(uint256 agentId, uint256 score) external {
        require(userOwnsAgent[msg.sender][agentId], "Must own agent to rate");
        require(score <= 100, "Score must be 0-100");
        
        Agent storage agent = agents[agentId];
        agent.reputation = (agent.reputation + score) / 2; // Simple average
        
        emit ReputationUpdated(agentId, agent.reputation);
    }
    
    /**
     * @dev Withdraw developer earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = developerEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        
        developerEarnings[msg.sender] = 0;
        require(codaiToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit DeveloperEarningWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get agent details
     */
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }
    
    /**
     * @dev Get developer's agents
     */
    function getDeveloperAgents(address developer) external view returns (uint256[] memory) {
        return developerAgents[developer];
    }
    
    /**
     * @dev Get user's purchased agents
     */
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @dev Check if user owns specific agent
     */
    function doesUserOwnAgent(address user, uint256 agentId) external view returns (bool) {
        return userOwnsAgent[user][agentId];
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 _totalAgents,
        uint256 _totalPurchases,
        uint256 _totalRevenue
    ) {
        return (totalAgents, totalPurchases, totalRevenue);
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update platform fee (max 10%)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        // Would emit event and update fee
    }
}
