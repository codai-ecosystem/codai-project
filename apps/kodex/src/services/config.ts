// Blockchain configuration for KODEX

export const CODAI_TOKEN_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)'
]

export const MARKETPLACE_ABI = [
    'function registerAgent(string name, string description, string category, uint256 price, string metadataURI)',
    'function purchaseAgent(uint256 agentId)',
    'function getAgent(uint256 agentId) view returns (tuple)',
    'function getUserPurchases(address user) view returns (uint256[])',
    'function getDeveloperAgents(address developer) view returns (uint256[])',
    'function getMarketplaceStats() view returns (tuple)',
    'function withdrawEarnings()'
]

export const GOVERNANCE_ABI = [
    'function propose(string title, string description, address[] targets, uint256[] values, bytes[] calldatas)',
    'function castVote(uint256 proposalId, uint8 support)',
    'function execute(uint256 proposalId)',
    'function getProposal(uint256 proposalId) view returns (tuple)',
    'function getProposalState(uint256 proposalId) view returns (uint8)',
    'function getVotingPower(address account) view returns (uint256)',
    'function getGovernanceStats() view returns (tuple)'
]

export const CONTRACT_ADDRESSES = {
    LOCALHOST: {
        CODAI_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        MARKETPLACE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        GOVERNANCE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    MUMBAI: {
        CODAI_TOKEN: '0x742d35Cc6226B3D5B2be4E8d0B3c7F2B2b3D6E91',
        MARKETPLACE: '0x1234567890123456789012345678901234567890',
        GOVERNANCE: '0x0987654321098765432109876543210987654321'
    },
    POLYGON: {
        CODAI_TOKEN: '0x742d35Cc6226B3D5B2be4E8d0B3c7F2B2b3D6E91',
        MARKETPLACE: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        GOVERNANCE: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed'
    }
}

export const NETWORKS = {
    LOCALHOST: {
        chainId: 1337,
        name: 'Localhost',
        rpcUrl: 'http://127.0.0.1:8545',
        currency: 'ETH'
    },
    MUMBAI: {
        chainId: 80001,
        name: 'Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        currency: 'MATIC'
    },
    POLYGON: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        currency: 'MATIC'
    }
}

export const GAS_CONFIGS = {
    registerAgent: { gasLimit: 300000 },
    purchaseAgent: { gasLimit: 150000 },
    createProposal: { gasLimit: 500000 },
    castVote: { gasLimit: 100000 },
    executeProposal: { gasLimit: 800000 }
}
