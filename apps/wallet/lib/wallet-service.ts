'use client'

import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

// Wallet Platform Core Types
export interface WalletAccount {
  id: string
  name: string
  address: string
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism'
  balance: number
  balanceUSD: number
  type: 'hardware' | 'software' | 'multisig' | 'smart'
  createdAt: Date
  isActive: boolean
}

export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  balance: number
  balanceUSD: number
  price: number
  priceChange24h: number
  network: string
  contractAddress?: string
  decimals: number
  logoUrl?: string
}

export interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  amount: number
  asset: string
  network: string
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  gasUsed?: number
  gasFee?: number
  blockNumber?: number
}

export interface NFT {
  id: string
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
  network: string
  traits: Array<{ trait_type: string; value: string }>
  lastSale?: {
    price: number
    currency: string
    date: Date
  }
}

export interface DeFiPosition {
  id: string
  protocol: string
  type: 'lending' | 'staking' | 'liquidity' | 'farming' | 'yield'
  asset: string
  amount: number
  valueUSD: number
  apy: number
  rewards: number
  rewardsUSD: number
  startDate: Date
  network: string
}

export interface WalletMetrics {
  totalBalance: number
  totalBalanceUSD: number
  portfolioChange24h: number
  portfolioChangePercent24h: number
  totalTransactions: number
  totalGasFees: number
  totalNFTs: number
  totalDeFiValue: number
  activePositions: number
}

export interface SecuritySettings {
  biometricAuth: boolean
  pinAuth: boolean
  autoLock: number // minutes
  transactionLimits: {
    daily: number
    single: number
  }
  whitelistedAddresses: string[]
  requireConfirmation: boolean
}

export interface WalletActivity {
  id: string
  type: 'transaction' | 'swap' | 'nft_transfer' | 'defi_action' | 'security'
  description: string
  amount?: number
  asset?: string
  timestamp: Date
  status: 'success' | 'pending' | 'failed'
  metadata?: Record<string, any>
}

export interface NetworkConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  gasPrice: number
  isMainnet: boolean
}

// Wallet Service Implementation
export class WalletService {
  private static instance: WalletService
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null
  private accounts: WalletAccount[] = []
  private assets: CryptoAsset[] = []
  private transactions: Transaction[] = []
  private nfts: NFT[] = []
  private defiPositions: DeFiPosition[] = []
  private securitySettings: SecuritySettings
  private currentNetwork: NetworkConfig

  constructor() {
    this.securitySettings = {
      biometricAuth: false,
      pinAuth: false,
      autoLock: 5,
      transactionLimits: {
        daily: 10000,
        single: 1000
      },
      whitelistedAddresses: [],
      requireConfirmation: true
    }

    this.currentNetwork = {
      chainId: 1,
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      explorerUrl: 'https://etherscan.io',
      gasPrice: 20,
      isMainnet: true
    }

    this.initializeProvider()
    this.initializeMockData()
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private async initializeProvider(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = new ethers.BrowserProvider((window as any).ethereum)
        try {
          this.signer = await (this.provider as ethers.BrowserProvider).getSigner()
        } catch (error) {
          console.warn('Failed to get signer:', error)
        }
      } else {
        // Use public provider for read-only operations
        this.provider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrl)
      }
    } catch (error) {
      console.warn('Could not initialize Web3 provider:', error)
    }
  }

  private initializeMockData(): void {
    // Mock accounts
    this.accounts = [
      {
        id: uuidv4(),
        name: 'Main Wallet',
        address: '0x742d35Cc6327C0532f3C0...9D4C0A8e',
        network: 'ethereum',
        balance: 2.543,
        balanceUSD: 6234.56,
        type: 'software',
        createdAt: new Date(Date.now() - 86400000 * 30),
        isActive: true
      },
      {
        id: uuidv4(),
        name: 'Trading Wallet',
        address: '0x8Ba1f109551bD432803012b...B7C3c91F',
        network: 'polygon',
        balance: 1250.0,
        balanceUSD: 1125.75,
        type: 'smart',
        createdAt: new Date(Date.now() - 86400000 * 15),
        isActive: true
      }
    ]

    // Mock assets
    this.assets = [
      {
        id: uuidv4(),
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 2.543,
        balanceUSD: 6234.56,
        price: 2451.30,
        priceChange24h: 3.45,
        network: 'ethereum',
        decimals: 18
      },
      {
        id: uuidv4(),
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 1500.00,
        balanceUSD: 1500.00,
        price: 1.00,
        priceChange24h: -0.01,
        network: 'ethereum',
        contractAddress: '0xA0b86a33E6...a5b0Ac',
        decimals: 6
      },
      {
        id: uuidv4(),
        symbol: 'MATIC',
        name: 'Polygon',
        balance: 1250.0,
        balanceUSD: 1125.75,
        price: 0.901,
        priceChange24h: -2.15,
        network: 'polygon',
        decimals: 18
      }
    ]

    // Mock transactions
    this.transactions = [
      {
        id: uuidv4(),
        hash: '0xabc123...',
        from: this.accounts[0].address,
        to: '0x456def...',
        amount: 0.5,
        asset: 'ETH',
        network: 'ethereum',
        type: 'send',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000),
        gasUsed: 21000,
        gasFee: 0.002,
        blockNumber: 18500000
      },
      {
        id: uuidv4(),
        hash: '0xdef456...',
        from: '0x789ghi...',
        to: this.accounts[0].address,
        amount: 100.0,
        asset: 'USDC',
        network: 'ethereum',
        type: 'receive',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 7200000),
        gasUsed: 65000,
        gasFee: 0.008,
        blockNumber: 18499850
      }
    ]

    // Mock NFTs
    this.nfts = [
      {
        id: uuidv4(),
        tokenId: '1234',
        contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        name: 'Bored Ape #1234',
        description: 'A unique digital collectible',
        image: '/api/placeholder/300/300',
        collection: 'Bored Ape Yacht Club',
        network: 'ethereum',
        traits: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Fur', value: 'Golden Brown' },
          { trait_type: 'Eyes', value: 'Laser Eyes' }
        ],
        lastSale: {
          price: 45.5,
          currency: 'ETH',
          date: new Date(Date.now() - 86400000 * 7)
        }
      }
    ]

    // Mock DeFi positions
    this.defiPositions = [
      {
        id: uuidv4(),
        protocol: 'Aave',
        type: 'lending',
        asset: 'USDC',
        amount: 5000,
        valueUSD: 5000,
        apy: 4.25,
        rewards: 12.5,
        rewardsUSD: 12.5,
        startDate: new Date(Date.now() - 86400000 * 30),
        network: 'ethereum'
      },
      {
        id: uuidv4(),
        protocol: 'Uniswap V3',
        type: 'liquidity',
        asset: 'ETH/USDC',
        amount: 1.0,
        valueUSD: 2451.30,
        apy: 8.75,
        rewards: 45.2,
        rewardsUSD: 45.2,
        startDate: new Date(Date.now() - 86400000 * 15),
        network: 'ethereum'
      }
    ]
  }

  // Account Management
  async getAccounts(): Promise<WalletAccount[]> {
    return [...this.accounts]
  }

  async createAccount(name: string, network: string): Promise<WalletAccount> {
    const wallet = ethers.Wallet.createRandom()
    const newAccount: WalletAccount = {
      id: uuidv4(),
      name,
      address: wallet.address,
      network: network as any,
      balance: 0,
      balanceUSD: 0,
      type: 'software',
      createdAt: new Date(),
      isActive: true
    }
    this.accounts.push(newAccount)
    return newAccount
  }

  async importAccount(privateKey: string, name: string): Promise<WalletAccount> {
    try {
      const wallet = new ethers.Wallet(privateKey)
      const newAccount: WalletAccount = {
        id: uuidv4(),
        name,
        address: wallet.address,
        network: 'ethereum',
        balance: 0,
        balanceUSD: 0,
        type: 'software',
        createdAt: new Date(),
        isActive: true
      }
      this.accounts.push(newAccount)
      return newAccount
    } catch (error) {
      throw new Error('Invalid private key')
    }
  }

  // Asset Management
  async getAssets(): Promise<CryptoAsset[]> {
    return [...this.assets]
  }

  async getAssetBalance(symbol: string, network: string): Promise<number> {
    const asset = this.assets.find(a => a.symbol === symbol && a.network === network)
    return asset?.balance || 0
  }

  async refreshBalances(): Promise<void> {
    // Simulate balance refresh
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update with random variations
    this.assets.forEach(asset => {
      const variation = (Math.random() - 0.5) * 0.1
      asset.balance *= (1 + variation)
      asset.balanceUSD = asset.balance * asset.price
    })
  }

  // Transaction Management
  async getTransactions(limit?: number): Promise<Transaction[]> {
    const sorted = [...this.transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  async sendTransaction(to: string, amount: number, asset: string): Promise<Transaction> {
    if (!this.signer) {
      throw new Error('No wallet connected')
    }

    const transaction: Transaction = {
      id: uuidv4(),
      hash: '0x' + Math.random().toString(16).substring(2, 66),
      from: this.accounts[0].address,
      to,
      amount,
      asset,
      network: 'ethereum',
      type: 'send',
      status: 'pending',
      timestamp: new Date()
    }

    this.transactions.unshift(transaction)

    // Simulate transaction confirmation
    setTimeout(() => {
      transaction.status = 'confirmed'
      transaction.gasUsed = 21000
      transaction.gasFee = 0.002
      transaction.blockNumber = Math.floor(Math.random() * 1000000) + 18500000
    }, 3000)

    return transaction
  }

  async swapTokens(fromAsset: string, toAsset: string, amount: number): Promise<Transaction> {
    const transaction: Transaction = {
      id: uuidv4(),
      hash: '0x' + Math.random().toString(16).substring(2, 66),
      from: this.accounts[0].address,
      to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Uniswap router
      amount,
      asset: `${fromAsset}->${toAsset}`,
      network: 'ethereum',
      type: 'swap',
      status: 'pending',
      timestamp: new Date()
    }

    this.transactions.unshift(transaction)

    // Simulate swap confirmation
    setTimeout(() => {
      transaction.status = 'confirmed'
      transaction.gasUsed = 150000
      transaction.gasFee = 0.015
      transaction.blockNumber = Math.floor(Math.random() * 1000000) + 18500000
    }, 5000)

    return transaction
  }

  // NFT Management
  async getNFTs(): Promise<NFT[]> {
    return [...this.nfts]
  }

  async transferNFT(nftId: string, to: string): Promise<Transaction> {
    const nft = this.nfts.find(n => n.id === nftId)
    if (!nft) {
      throw new Error('NFT not found')
    }

    const transaction: Transaction = {
      id: uuidv4(),
      hash: '0x' + Math.random().toString(16).substring(2, 66),
      from: this.accounts[0].address,
      to,
      amount: 1,
      asset: `${nft.collection} #${nft.tokenId}`,
      network: nft.network,
      type: 'send',
      status: 'pending',
      timestamp: new Date()
    }

    this.transactions.unshift(transaction)
    return transaction
  }

  // DeFi Management
  async getDeFiPositions(): Promise<DeFiPosition[]> {
    return [...this.defiPositions]
  }

  async stakeTokens(asset: string, amount: number, protocol: string): Promise<DeFiPosition> {
    const position: DeFiPosition = {
      id: uuidv4(),
      protocol,
      type: 'staking',
      asset,
      amount,
      valueUSD: amount * (this.assets.find(a => a.symbol === asset)?.price || 1),
      apy: 5.5 + Math.random() * 5,
      rewards: 0,
      rewardsUSD: 0,
      startDate: new Date(),
      network: 'ethereum'
    }

    this.defiPositions.push(position)
    return position
  }

  // Analytics and Metrics
  async getWalletMetrics(): Promise<WalletMetrics> {
    const totalBalance = this.assets.reduce((sum, asset) => sum + asset.balance, 0)
    const totalBalanceUSD = this.assets.reduce((sum, asset) => sum + asset.balanceUSD, 0)
    const totalDeFiValue = this.defiPositions.reduce((sum, pos) => sum + pos.valueUSD, 0)
    const totalGasFees = this.transactions.reduce((sum, tx) => sum + (tx.gasFee || 0), 0)

    return {
      totalBalance,
      totalBalanceUSD,
      portfolioChange24h: totalBalanceUSD * 0.025, // Mock 2.5% gain
      portfolioChangePercent24h: 2.5,
      totalTransactions: this.transactions.length,
      totalGasFees,
      totalNFTs: this.nfts.length,
      totalDeFiValue,
      activePositions: this.defiPositions.length
    }
  }

  async getPortfolioHistory(days: number): Promise<Array<{ date: Date; value: number }>> {
    const history = []
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const baseValue = await this.getWalletMetrics().then(m => m.totalBalanceUSD)
      const variation = (Math.random() - 0.5) * 0.1
      history.push({
        date,
        value: baseValue * (1 + variation)
      })
    }
    return history
  }

  // Security
  async getSecuritySettings(): Promise<SecuritySettings> {
    return { ...this.securitySettings }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings }
  }

  async validateTransaction(transaction: Partial<Transaction>): Promise<boolean> {
    if (!transaction.amount || transaction.amount <= 0) return false
    if (transaction.amount > this.securitySettings.transactionLimits.single) return false
    if (!transaction.to || !ethers.isAddress(transaction.to)) return false
    return true
  }

  // Network Management
  async switchNetwork(network: NetworkConfig): Promise<void> {
    this.currentNetwork = network
    await this.initializeProvider()
  }

  async getCurrentNetwork(): Promise<NetworkConfig> {
    return { ...this.currentNetwork }
  }

  // Activity Tracking
  async getActivity(limit?: number): Promise<WalletActivity[]> {
    const activities: WalletActivity[] = [
      ...this.transactions.map(tx => ({
        id: tx.id,
        type: 'transaction' as const,
        description: `${tx.type === 'send' ? 'Sent' : 'Received'} ${tx.amount} ${tx.asset}`,
        amount: tx.amount,
        asset: tx.asset,
        timestamp: tx.timestamp,
        status: tx.status as any,
        metadata: { hash: tx.hash, network: tx.network }
      })),
      ...this.defiPositions.map(pos => ({
        id: pos.id,
        type: 'defi_action' as const,
        description: `${pos.type} ${pos.amount} ${pos.asset} on ${pos.protocol}`,
        amount: pos.amount,
        asset: pos.asset,
        timestamp: pos.startDate,
        status: 'success' as const,
        metadata: { protocol: pos.protocol, apy: pos.apy }
      }))
    ]

    const sorted = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Utility Functions
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  formatCrypto(amount: number, decimals: number = 6): string {
    return amount.toFixed(decimals)
  }

  async estimateGas(transaction: Partial<Transaction>): Promise<number> {
    // Simulate gas estimation
    const baseGas = 21000
    const complexityMultiplier = transaction.type === 'swap' ? 7 : 1
    return baseGas * complexityMultiplier
  }
}

export default WalletService.getInstance()
