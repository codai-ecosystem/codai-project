import { ethers } from 'ethers';

// Contract ABI interfaces (simplified for demo)
export const CODAI_TOKEN_ABI = [
  // ERC20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // Codai specific
  "function mint(address to, uint256 amount)",
  "function getAgentEarnings(address agent) view returns (uint256)",
  "function authorizedMinters(address) view returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event AgentEarning(address indexed agent, uint256 amount, string serviceType)"
];

export const MARKETPLACE_ABI = [
  // Agent management
  "function registerAgent(string name, string description, string category, uint256 price, string metadataURI) returns (uint256)",
  "function purchaseAgent(uint256 agentId)",
  "function getAgent(uint256 agentId) view returns (tuple(address developer, string name, string description, string category, uint256 price, uint256 totalSales, uint256 totalRevenue, uint256 reputation, bool verified, bool active, string metadataURI, uint256 createdAt))",
  "function verifyAgent(uint256 agentId)",
  "function updateReputation(uint256 agentId, uint256 score)",

  // User functions
  "function getDeveloperAgents(address developer) view returns (uint256[])",
  "function getUserPurchases(address user) view returns (uint256[])",
  "function doesUserOwnAgent(address user, uint256 agentId) view returns (bool)",
  "function withdrawEarnings()",
  "function getMarketplaceStats() view returns (uint256 totalAgents, uint256 totalPurchases, uint256 totalRevenue)",

  // Events
  "event AgentRegistered(uint256 indexed agentId, address indexed developer, string name)",
  "event AgentPurchased(uint256 indexed agentId, address indexed buyer, uint256 amount)"
];

export const GOVERNANCE_ABI = [
  // Proposal management
  "function propose(string title, string description, address[] targets, uint256[] values, bytes[] calldatas) returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support)",
  "function execute(uint256 proposalId) payable",
  "function cancel(uint256 proposalId)",

  // View functions
  "function getProposalState(uint256 proposalId) view returns (uint8)",
  "function getProposal(uint256 proposalId) view returns (address proposer, string title, string description, uint256 startTime, uint256 endTime, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool executed, bool cancelled)",
  "function getVotingPower(address account) view returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function getGovernanceStats() view returns (uint256 totalProposals, uint256 activeProposals, uint256 totalVoters)",

  // Events
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, string description)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 weight)"
];

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  // Polygon Mainnet
  POLYGON: {
    CODAI_TOKEN: "0x0000000000000000000000000000000000000000", // Will be deployed
    MARKETPLACE: "0x0000000000000000000000000000000000000000", // Will be deployed
    GOVERNANCE: "0x0000000000000000000000000000000000000000"   // Will be deployed
  },

  // Polygon Mumbai Testnet
  MUMBAI: {
    CODAI_TOKEN: "0x0000000000000000000000000000000000000000", // Will be deployed
    MARKETPLACE: "0x0000000000000000000000000000000000000000", // Will be deployed
    GOVERNANCE: "0x0000000000000000000000000000000000000000"   // Will be deployed
  },

  // Local development
  LOCALHOST: {
    CODAI_TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat default
    MARKETPLACE: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Hardhat default
    GOVERNANCE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"   // Hardhat default
  }
};

// Network configurations
export const NETWORKS = {
  polygon: {
    chainId: 137,
    name: "Polygon Mainnet",
    rpc: "https://polygon-rpc.com/",
    explorer: "https://polygonscan.com",
    currency: "MATIC"
  },
  mumbai: {
    chainId: 80001,
    name: "Polygon Mumbai",
    rpc: "https://rpc-mumbai.maticvigil.com/",
    explorer: "https://mumbai.polygonscan.com",
    currency: "MATIC"
  },
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpc: "http://127.0.0.1:8545",
    explorer: "http://localhost:8545",
    currency: "ETH"
  }
};

// Gas configurations
export const GAS_CONFIGS = {
  registerAgent: { gasLimit: 200000 },
  purchaseAgent: { gasLimit: 150000 },
  createProposal: { gasLimit: 250000 },
  castVote: { gasLimit: 100000 },
  executeProposal: { gasLimit: 300000 }
};

export default {
  CODAI_TOKEN_ABI,
  MARKETPLACE_ABI,
  GOVERNANCE_ABI,
  CONTRACT_ADDRESSES,
  NETWORKS,
  GAS_CONFIGS
};
