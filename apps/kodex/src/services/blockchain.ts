import { ethers } from 'ethers';
import {
  CODAI_TOKEN_ABI,
  MARKETPLACE_ABI,
  GOVERNANCE_ABI,
  CONTRACT_ADDRESSES,
  NETWORKS,
  GAS_CONFIGS
} from './config';

export interface Agent {
  id: number;
  developer: string;
  name: string;
  description: string;
  category: string;
  price: string; // In CODAI tokens
  totalSales: number;
  totalRevenue: string;
  reputation: number;
  verified: boolean;
  active: boolean;
  metadataURI: string;
  createdAt: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  executed: boolean;
  cancelled: boolean;
  state: ProposalState;
}

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Succeeded = 2,
  Failed = 3,
  Executed = 4,
  Cancelled = 5
}

export class CodaiBlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private tokenContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;
  private governanceContract: ethers.Contract | null = null;
  private currentNetwork: string = 'localhost';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.connectWallet();
      } else {
        // Fallback to localhost for development
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        console.warn('MetaMask not found, using localhost provider');
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await this.provider.getSigner();
        await this.initializeContracts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  private async initializeContracts() {
    if (!this.signer || !this.provider) return;

    const network = await this.provider.getNetwork();
    const chainId = network.chainId.toString();

    // Determine network
    this.currentNetwork = chainId === '137' ? 'POLYGON' :
      chainId === '80001' ? 'MUMBAI' : 'LOCALHOST';

    const addresses = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES];

    this.tokenContract = new ethers.Contract(addresses.CODAI_TOKEN, CODAI_TOKEN_ABI, this.signer);
    this.marketplaceContract = new ethers.Contract(addresses.MARKETPLACE, MARKETPLACE_ABI, this.signer);
    this.governanceContract = new ethers.Contract(addresses.GOVERNANCE, GOVERNANCE_ABI, this.signer);
  }

  // Token functions
  async getTokenBalance(address: string): Promise<string> {
    if (!this.tokenContract) throw new Error('Token contract not initialized');
    const balance = await this.tokenContract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getTokenSymbol(): Promise<string> {
    if (!this.tokenContract) throw new Error('Token contract not initialized');
    return await this.tokenContract.symbol();
  }

  async approveTokens(spender: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.tokenContract) throw new Error('Token contract not initialized');
    const amountWei = ethers.parseEther(amount);
    return await this.tokenContract.approve(spender, amountWei);
  }

  // Marketplace functions
  async registerAgent(
    name: string,
    description: string,
    category: string,
    price: string,
    metadataURI: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');

    const priceWei = ethers.parseEther(price);
    return await this.marketplaceContract.registerAgent(
      name,
      description,
      category,
      priceWei,
      metadataURI,
      GAS_CONFIGS.registerAgent
    );
  }

  async purchaseAgent(agentId: number): Promise<ethers.TransactionResponse> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');
    return await this.marketplaceContract.purchaseAgent(agentId, GAS_CONFIGS.purchaseAgent);
  }

  async getAgent(agentId: number): Promise<Agent> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');

    const agentData = await this.marketplaceContract.getAgent(agentId);
    return {
      id: agentId,
      developer: agentData.developer,
      name: agentData.name,
      description: agentData.description,
      category: agentData.category,
      price: ethers.formatEther(agentData.price),
      totalSales: Number(agentData.totalSales),
      totalRevenue: ethers.formatEther(agentData.totalRevenue),
      reputation: Number(agentData.reputation),
      verified: agentData.verified,
      active: agentData.active,
      metadataURI: agentData.metadataURI,
      createdAt: Number(agentData.createdAt)
    };
  }

  async getUserPurchases(address: string): Promise<number[]> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');
    const purchases = await this.marketplaceContract.getUserPurchases(address);
    return purchases.map((id: any) => Number(id));
  }

  async getDeveloperAgents(address: string): Promise<number[]> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');
    const agents = await this.marketplaceContract.getDeveloperAgents(address);
    return agents.map((id: any) => Number(id));
  }

  async getMarketplaceStats(): Promise<{ totalAgents: number; totalPurchases: number; totalRevenue: string }> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');

    const stats = await this.marketplaceContract.getMarketplaceStats();
    return {
      totalAgents: Number(stats.totalAgents),
      totalPurchases: Number(stats.totalPurchases),
      totalRevenue: ethers.formatEther(stats.totalRevenue)
    };
  }

  async withdrawEarnings(): Promise<ethers.TransactionResponse> {
    if (!this.marketplaceContract) throw new Error('Marketplace contract not initialized');
    return await this.marketplaceContract.withdrawEarnings();
  }

  // Governance functions
  async createProposal(
    title: string,
    description: string,
    targets: string[],
    values: string[],
    calldatas: string[]
  ): Promise<ethers.TransactionResponse> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');

    const valuesWei = values.map(v => ethers.parseEther(v));
    return await this.governanceContract.propose(
      title,
      description,
      targets,
      valuesWei,
      calldatas,
      GAS_CONFIGS.createProposal
    );
  }

  async castVote(proposalId: number, support: number): Promise<ethers.TransactionResponse> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');
    return await this.governanceContract.castVote(proposalId, support, GAS_CONFIGS.castVote);
  }

  async executeProposal(proposalId: number): Promise<ethers.TransactionResponse> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');
    return await this.governanceContract.execute(proposalId, GAS_CONFIGS.executeProposal);
  }

  async getProposal(proposalId: number): Promise<Proposal> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');

    const proposalData = await this.governanceContract.getProposal(proposalId);
    const state = await this.governanceContract.getProposalState(proposalId);

    return {
      id: proposalId,
      proposer: proposalData.proposer,
      title: proposalData.title,
      description: proposalData.description,
      startTime: Number(proposalData.startTime),
      endTime: Number(proposalData.endTime),
      forVotes: ethers.formatEther(proposalData.forVotes),
      againstVotes: ethers.formatEther(proposalData.againstVotes),
      abstainVotes: ethers.formatEther(proposalData.abstainVotes),
      executed: proposalData.executed,
      cancelled: proposalData.cancelled,
      state: Number(state) as ProposalState
    };
  }

  async getVotingPower(address: string): Promise<string> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');
    const power = await this.governanceContract.getVotingPower(address);
    return ethers.formatEther(power);
  }

  async getGovernanceStats(): Promise<{ totalProposals: number; activeProposals: number; totalVoters: number }> {
    if (!this.governanceContract) throw new Error('Governance contract not initialized');

    const stats = await this.governanceContract.getGovernanceStats();
    return {
      totalProposals: Number(stats.totalProposals),
      activeProposals: Number(stats.activeProposals),
      totalVoters: Number(stats.totalVoters)
    };
  }

  // Utility functions
  async getCurrentAccount(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async switchNetwork(networkName: string): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const network = NETWORKS[networkName as keyof typeof NETWORKS];
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  getNetworkInfo() {
    return {
      current: this.currentNetwork,
      available: Object.keys(NETWORKS)
    };
  }
}

export default CodaiBlockchainService;
