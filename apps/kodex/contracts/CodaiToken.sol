// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CodaiToken
 * @dev Native token for the Codai ecosystem
 * Features:
 * - ERC20 standard with permit functionality
 * - Mintable by authorized agents
 * - Pausable for emergency situations
 * - Integration with agent marketplace
 */
contract CodaiToken is ERC20, ERC20Permit, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256) public agentEarnings;
    
    event AgentEarning(address indexed agent, uint256 amount, string serviceType);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor(address initialOwner) 
        ERC20("Codai Token", "CODAI")
        ERC20Permit("Codai Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint tokens for agent rewards and ecosystem growth
     */
    function mint(address to, uint256 amount) external whenNotPaused {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Record agent earnings for marketplace transactions
     */
    function recordAgentEarning(address agent, uint256 amount, string calldata serviceType) external {
        require(authorizedMinters[msg.sender], "Not authorized");
        agentEarnings[agent] += amount;
        emit AgentEarning(agent, amount, serviceType);
    }
    
    /**
     * @dev Add authorized minter (for marketplace, staking, etc.)
     */
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Pause token transfers in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get agent total earnings
     */
    function getAgentEarnings(address agent) external view returns (uint256) {
        return agentEarnings[agent];
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
