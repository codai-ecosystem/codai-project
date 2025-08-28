# Chapter 7: BLOCKCHAIN - Decentralized Intelligence

## Overview
**Duration:** 55 seconds of scroll  
**Purpose:** Showcase blockchain, DeFi, and Web3 AI applications  
**Emotional Journey:** Innovation → Trust  
**Theme Colors:** Crypto Neon (`--blockchain-*`)  
**Projects:** 6 blockchain-focused projects (NFT platforms, DeFi, Smart contracts, etc.)

---

## Visual Concept

### Blockchain Metaphor
- **Visual Theme:** Distributed networks, blockchain visualizations, cryptocurrency aesthetics, neon cyber punk
- **Color Palette:** Electric blues, neon greens, cyber purples representing digital innovation
- **Iconography:** Blockchain nodes, cryptocurrency symbols, network graphs, digital keys
- **Motion Language:** Network propagation, block mining animations, transaction flows, node connections

### Layout Design
```
┌─────────────────────────────────────┐
│     "Decentralized Intelligence"    │
├─────────────────────────────────────┤
│      [Blockchain Network View]      │ ← 3D network visualization
├─────┬─────┬─────┬─────┬─────┬───────┤
│ NFT │ DeFi│Smart│Token│DAO │       │ ← Blockchain app nodes
│ AI  │ AI  │Cont │ AI  │ AI │ Block │   connected by glowing lines
├─────┼─────┼─────┼─────┼─────┤Mining │
│Meta │Trade│Audit│Yield│Gov. │ Viz   │
│     │     │     │     │     │       │
└─────┴─────┴─────┴─────┴─────┴───────┘
```

### Blockchain Network Animation
- **Node Network:** 3D network of interconnected blockchain nodes
- **Transaction Flow:** Animated data packets traveling between nodes
- **Block Mining:** Real-time block creation and verification visualization
- **Consensus Mechanism:** Visual representation of network agreement

---

## Scroll Choreography

### ScrollTrigger Configuration
```javascript
ScrollTrigger.create({
  trigger: ".blockchain-chapter",
  start: "top bottom",
  end: "bottom top",
  scrub: 1,
  onEnter: () => {
    activateChapterTheme('blockchain');
    startBlockchainNetwork();
  },
  onLeave: () => {
    pauseBlockchainNetwork();
  },
  onUpdate: (self) => updateBlockchainProgress(self.progress)
});
```

### Master Timeline
```javascript
const blockchainTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".blockchain-chapter",
    start: "top center+=100",
    end: "bottom center-=100",
    scrub: 1
  }
});

// Chapter title with electric glow effect (0-0.1)
blockchainTimeline
  .fromTo(".blockchain-title", {
    y: -100,
    opacity: 0,
    filter: "brightness(0)"
  }, {
    y: 0,
    opacity: 1,
    filter: "brightness(1)",
    duration: 0.1,
    ease: "power3.out"
  })
  .fromTo(".blockchain-subtitle", {
    y: -50,
    opacity: 0,
    textShadow: "0 0 0px #00ff88"
  }, {
    y: 0,
    opacity: 1,
    textShadow: "0 0 20px #00ff88",
    duration: 0.08,
    ease: "power2.out"
  }, 0.03);

// Blockchain network initialization (0.1-0.3)
blockchainTimeline
  .fromTo(".blockchain-network", {
    scale: 0,
    opacity: 0,
    rotationY: -180
  }, {
    scale: 1,
    opacity: 1,
    rotationY: 0,
    duration: 0.15,
    ease: "back.out(1.7)"
  }, 0.1)
  .fromTo(".network-nodes", {
    scale: 0,
    opacity: 0
  }, {
    scale: 1,
    opacity: 1,
    duration: 0.1,
    ease: "back.out(2)",
    stagger: {
      each: 0.02,
      from: "center",
      grid: "auto"
    }
  }, 0.15);

// Blockchain applications reveal (0.25-0.7)
const blockchainApps = [
  { selector: '.blockchain-nft-ai', delay: 0, position: { x: -200, y: -150 } },
  { selector: '.blockchain-defi-ai', delay: 0.05, position: { x: 200, y: -100 } },
  { selector: '.blockchain-smart-contracts', delay: 0.1, position: { x: -150, y: 100 } },
  { selector: '.blockchain-token-ai', delay: 0.15, position: { x: 180, y: 150 } },
  { selector: '.blockchain-dao-ai', delay: 0.2, position: { x: -100, y: 0 } },
  { selector: '.blockchain-mining', delay: 0.25, position: { x: 100, y: -50 } }
];

blockchainApps.forEach((app) => {
  blockchainTimeline
    .fromTo(app.selector, {
      x: app.position.x,
      y: app.position.y,
      opacity: 0,
      scale: 0.5,
      rotation: Math.random() * 360
    }, {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.2,
      ease: "power3.out"
    }, 0.25 + app.delay)
    .fromTo(app.selector + " .app-glow", {
      opacity: 0,
      scale: 0
    }, {
      opacity: 1,
      scale: 1,
      duration: 0.1,
      ease: "power2.out"
    }, 0.35 + app.delay);
});

// Network connections animation (0.5-0.8)
blockchainTimeline
  .fromTo(".network-connection", {
    strokeDasharray: function() {
      return this.getTotalLength() + " " + this.getTotalLength();
    },
    strokeDashoffset: function() {
      return this.getTotalLength();
    },
    opacity: 0
  }, {
    strokeDashoffset: 0,
    opacity: 1,
    duration: 0.25,
    ease: "power2.inOut",
    stagger: 0.02
  }, 0.5);

// Transaction flow animation (0.6-0.9)
blockchainTimeline
  .fromTo(".transaction-particle", {
    scale: 0,
    opacity: 0,
    motionPath: {
      path: ".network-connection",
      start: 0
    }
  }, {
    scale: 1,
    opacity: 1,
    motionPath: {
      path: ".network-connection",
      start: 1
    },
    duration: 0.3,
    ease: "none",
    stagger: {
      each: 0.1,
      repeat: -1,
      repeatDelay: 2
    }
  }, 0.6);

// Block mining visualization (0.7-1.0)
blockchainTimeline
  .fromTo(".mining-visualization", {
    scale: 0.8,
    opacity: 0,
    rotationZ: -90
  }, {
    scale: 1,
    opacity: 1,
    rotationZ: 0,
    duration: 0.2,
    ease: "back.out(1.7)"
  }, 0.7)
  .fromTo(".mining-blocks", {
    y: 100,
    opacity: 0,
    scale: 0.8
  }, {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.15,
    ease: "power3.out",
    stagger: 0.05
  }, 0.8);
```

### Real-time Blockchain Simulation
```javascript
// Blockchain network simulation
function startBlockchainNetwork() {
  const nodes = document.querySelectorAll('.network-node');
  const connections = document.querySelectorAll('.network-connection');
  
  // Animate node activity
  nodes.forEach((node, index) => {
    gsap.to(node, {
      scale: 1.2,
      duration: 0.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: index * 0.2
    });
    
    // Add pulsing glow
    gsap.to(node.querySelector('.node-glow'), {
      opacity: 1,
      scale: 1.5,
      duration: 1,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: index * 0.1
    });
  });
  
  // Animate connections
  connections.forEach((connection, index) => {
    const length = connection.getTotalLength();
    
    gsap.fromTo(connection, {
      strokeDasharray: `0 ${length}`,
      opacity: 0.3
    }, {
      strokeDasharray: `${length * 0.3} ${length * 0.7}`,
      opacity: 0.8,
      duration: 2,
      ease: "none",
      repeat: -1,
      delay: index * 0.3
    });
  });
  
  // Start transaction flow
  animateTransactionFlow();
  
  // Start block mining
  animateBlockMining();
}

function animateTransactionFlow() {
  const particles = document.querySelectorAll('.transaction-particle');
  
  particles.forEach((particle, index) => {
    const path = particle.closest('.network-section').querySelector('.network-connection');
    
    gsap.to(particle, {
      motionPath: {
        path: path,
        start: 0,
        end: 1,
        autoRotate: true
      },
      duration: 3 + Math.random() * 2,
      ease: "none",
      repeat: -1,
      delay: index * 0.5,
      onComplete: () => {
        // Simulate transaction confirmation
        showTransactionConfirmation(particle);
      }
    });
  });
}

function animateBlockMining() {
  const miningBlocks = document.querySelectorAll('.mining-block');
  let blockHeight = 847592; // Current block height
  
  setInterval(() => {
    blockHeight++;
    
    // Create new block animation
    const newBlock = createMiningBlock(blockHeight);
    const miningContainer = document.querySelector('.mining-visualization');
    miningContainer.appendChild(newBlock);
    
    gsap.fromTo(newBlock, {
      y: -50,
      opacity: 0,
      scale: 0.8
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      onComplete: () => {
        // Add to blockchain
        updateBlockchainStats(blockHeight);
      }
    });
    
    // Remove old blocks
    const oldBlocks = miningContainer.querySelectorAll('.mining-block');
    if (oldBlocks.length > 10) {
      gsap.to(oldBlocks[0], {
        y: 50,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => oldBlocks[0].remove()
      });
    }
    
  }, 8000 + Math.random() * 4000); // Variable mining time
}

function createMiningBlock(height) {
  const block = document.createElement('div');
  block.className = 'mining-block';
  block.innerHTML = `
    <div class="block-header">
      <div class="block-height">#${height}</div>
      <div class="block-hash">${generateBlockHash()}</div>
    </div>
    <div class="block-transactions">
      <div class="tx-count">${Math.floor(Math.random() * 200) + 50} txns</div>
      <div class="block-reward">6.25 BTC</div>
    </div>
    <div class="block-glow"></div>
  `;
  
  return block;
}

function generateBlockHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 12; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash + '...';
}
```

---

## Content Scripts

### English Version
```json
{
  "blockchain": {
    "title": "Decentralized Intelligence",
    "subtitle": "AI meets blockchain innovation",
    "description": "Revolutionary blockchain applications powered by AI that don't just process transactions – they understand value, predict market movements, and optimize decentralized ecosystems with unprecedented intelligence.",
    "network_status": {
      "status": "Network Active",
      "nodes": "12,847 nodes online",
      "tps": "847,592 transactions/sec",
      "last_block": "Block #847592"
    },
    "applications": {
      "nft_ai": {
        "name": "NFT AI",
        "tagline": "Intelligent Digital Assets",
        "description": "AI-powered NFT creation, analysis, and trading",
        "features": [
          "Generative art AI engine",
          "NFT value prediction",
          "Automated royalty distribution",
          "Marketplace optimization"
        ],
        "metrics": {
          "nfts_created": "2.3M+ NFTs generated",
          "accuracy": "94% value prediction accuracy", 
          "volume": "$150M+ trading volume"
        }
      },
      "defi_ai": {
        "name": "DeFi AI",
        "tagline": "Intelligent Finance Protocol",
        "description": "Automated yield farming and liquidity optimization",
        "features": [
          "Smart yield strategies",
          "Impermanent loss protection",
          "Multi-protocol arbitrage",
          "Risk-adjusted returns"
        ],
        "metrics": {
          "tvl": "$2.1B total value locked",
          "apy": "23.7% average APY",
          "protocols": "150+ DeFi integrations"
        }
      },
      "smart_contracts_ai": {
        "name": "Smart Contracts AI",
        "tagline": "Autonomous Contract Intelligence",
        "description": "AI-audited smart contracts with bug detection",
        "features": [
          "Automated code auditing",
          "Vulnerability detection",
          "Gas optimization",
          "Formal verification"
        ],
        "metrics": {
          "contracts_audited": "45K+ contracts scanned",
          "bugs_found": "2,847 vulnerabilities detected",
          "gas_saved": "35% average gas reduction"
        }
      },
      "token_ai": {
        "name": "Token AI",
        "tagline": "Cryptocurrency Intelligence",
        "description": "AI-powered token analysis and trading strategies",
        "features": [
          "Token sentiment analysis",
          "Price prediction models",
          "Portfolio optimization",
          "Risk assessment"
        ],
        "metrics": {
          "tokens_analyzed": "15K+ tokens tracked",
          "prediction_accuracy": "87% price prediction accuracy",
          "roi": "+247% average portfolio ROI"
        }
      },
      "dao_ai": {
        "name": "DAO AI",
        "tagline": "Decentralized Governance Intelligence",
        "description": "AI-assisted DAO governance and decision making",
        "features": [
          "Proposal impact analysis",
          "Voting pattern prediction",
          "Community sentiment tracking",
          "Governance optimization"
        ],
        "metrics": {
          "daos_managed": "1,200+ DAOs supported",
          "proposals_analyzed": "25K+ proposals processed",
          "participation": "78% voting participation increase"
        }
      },
      "mining_ai": {
        "name": "Mining AI",
        "tagline": "Intelligent Blockchain Mining",
        "description": "AI-optimized mining operations and pool management",
        "features": [
          "Hash rate optimization",
          "Energy efficiency analysis",
          "Pool switching algorithms",
          "Hardware performance tuning"
        ],
        "metrics": {
          "hash_rate": "450 EH/s managed hash rate",
          "efficiency": "25% energy savings",
          "uptime": "99.97% mining uptime"
        }
      }
    },
    "blockchain_metrics": {
      "total_value_locked": "$2.1B+ total value locked",
      "transactions_processed": "847K+ daily transactions",
      "nodes_powered": "12K+ AI-powered nodes",
      "protocols_integrated": "150+ blockchain protocols"
    }
  }
}
```

### Romanian Version
```json
{
  "blockchain": {
    "title": "Inteligența Descentralizată",
    "subtitle": "AI întâlnește inovația blockchain",
    "description": "Aplicații blockchain revoluționare alimentate de AI care nu doar procesează tranzacții – înțeleg valoarea, prevăd mișcările pieței și optimizează ecosistemele descentralizate cu inteligență fără precedent.",
    "network_status": {
      "status": "Rețea Activă",
      "nodes": "12,847 noduri online",
      "tps": "847,592 tranzacții/sec",
      "last_block": "Block #847592"
    }
    // Additional Romanian translations...
  }
}
```

---

## Interactions

### Blockchain Network Interactions
```javascript
// Interactive blockchain network
function initializeBlockchainNetwork() {
  const networkNodes = document.querySelectorAll('.network-node');
  const connections = document.querySelectorAll('.network-connection');
  
  // Node interaction
  networkNodes.forEach(node => {
    node.addEventListener('mouseenter', (e) => {
      const nodeId = e.target.dataset.nodeId;
      const nodeInfo = e.target.dataset.nodeInfo;
      
      // Highlight node and its connections
      highlightNodeConnections(nodeId);
      
      // Show node details
      showNodeDetails(nodeId, nodeInfo);
      
      // Animate node selection
      gsap.to(e.target, {
        scale: 1.5,
        filter: "brightness(1.5)",
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      
      // Pulse connected nodes
      const connectedNodes = getConnectedNodes(nodeId);
      connectedNodes.forEach(connectedNode => {
        gsap.to(connectedNode, {
          scale: 1.2,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    });
    
    node.addEventListener('mouseleave', (e) => {
      // Reset node and connections
      resetNodeHighlights();
      hideNodeDetails();
      
      gsap.to(networkNodes, {
        scale: 1,
        filter: "brightness(1)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    // Click to send transaction
    node.addEventListener('click', (e) => {
      const sourceNodeId = e.target.dataset.nodeId;
      initializeTransaction(sourceNodeId);
    });
  });
  
  // Connection interaction
  connections.forEach(connection => {
    connection.addEventListener('mouseenter', (e) => {
      // Show transaction flow on this connection
      const connectionData = JSON.parse(e.target.dataset.connectionData);
      showTransactionFlow(connectionData);
      
      // Highlight connection
      gsap.to(e.target, {
        strokeWidth: 4,
        opacity: 1,
        duration: 0.2
      });
    });
    
    connection.addEventListener('mouseleave', (e) => {
      hideTransactionFlow();
      
      gsap.to(e.target, {
        strokeWidth: 2,
        opacity: 0.6,
        duration: 0.2
      });
    });
  });
}

// Transaction simulation
function initializeTransaction(sourceNodeId) {
  const targetNodes = document.querySelectorAll('.network-node');
  const availableTargets = Array.from(targetNodes).filter(
    node => node.dataset.nodeId !== sourceNodeId
  );
  
  // Select random target
  const targetNode = availableTargets[Math.floor(Math.random() * availableTargets.length)];
  const targetNodeId = targetNode.dataset.nodeId;
  
  // Create transaction particle
  const particle = createTransactionParticle();
  
  // Find path between nodes
  const path = findShortestPath(sourceNodeId, targetNodeId);
  
  if (path.length > 1) {
    animateTransactionPath(particle, path, () => {
      // Transaction complete
      showTransactionSuccess(sourceNodeId, targetNodeId);
      updateBlockchainMetrics();
    });
  }
}

function createTransactionParticle() {
  const particle = document.createElement('div');
  particle.className = 'transaction-particle active';
  particle.innerHTML = `
    <div class="particle-core"></div>
    <div class="particle-trail"></div>
    <div class="particle-glow"></div>
  `;
  
  document.querySelector('.blockchain-network').appendChild(particle);
  return particle;
}

function animateTransactionPath(particle, path, onComplete) {
  const timeline = gsap.timeline({ onComplete });
  
  path.forEach((nodeId, index) => {
    if (index < path.length - 1) {
      const currentNode = document.querySelector(`[data-node-id="${nodeId}"]`);
      const nextNode = document.querySelector(`[data-node-id="${path[index + 1]}"]`);
      
      const startPos = getNodePosition(currentNode);
      const endPos = getNodePosition(nextNode);
      
      timeline.to(particle, {
        x: endPos.x,
        y: endPos.y,
        duration: 0.5,
        ease: "power2.inOut"
      });
      
      // Add verification step
      if (Math.random() > 0.7) {
        timeline.to(particle, {
          scale: 1.3,
          duration: 0.1,
          ease: "power2.out",
          yoyo: true,
          repeat: 1
        });
      }
    }
  });
  
  timeline.to(particle, {
    scale: 0,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => particle.remove()
  });
}
```

### DeFi Protocol Interactions
```javascript
// DeFi application interactions
function initializeDeFiInteractions() {
  const defiApps = document.querySelectorAll('.blockchain-app[data-type="defi"]');
  
  defiApps.forEach(app => {
    const yieldDisplay = app.querySelector('.yield-display');
    const stakeButton = app.querySelector('.stake-button');
    const unstakeButton = app.querySelector('.unstake-button');
    
    // Simulate yield farming
    if (yieldDisplay) {
      startYieldSimulation(yieldDisplay);
    }
    
    // Staking interaction
    if (stakeButton) {
      stakeButton.addEventListener('click', (e) => {
        const amount = prompt('Enter amount to stake:');
        if (amount && !isNaN(amount)) {
          executeStakeTransaction(parseFloat(amount));
        }
      });
    }
    
    // Unstaking interaction
    if (unstakeButton) {
      unstakeButton.addEventListener('click', (e) => {
        const stakedAmount = parseFloat(app.dataset.stakedAmount || '0');
        if (stakedAmount > 0) {
          executeUnstakeTransaction(stakedAmount);
        } else {
          showNotification('No staked tokens to unstake', 'warning');
        }
      });
    }
  });
}

function startYieldSimulation(yieldDisplay) {
  let currentYield = 23.7; // Starting APY
  
  setInterval(() => {
    // Simulate yield fluctuation
    const fluctuation = (Math.random() - 0.5) * 2; // -1% to +1%
    currentYield = Math.max(0, currentYield + fluctuation);
    
    yieldDisplay.textContent = `${currentYield.toFixed(2)}% APY`;
    
    // Visual feedback for yield changes
    const color = fluctuation > 0 ? '#10b981' : '#ef4444';
    gsap.to(yieldDisplay, {
      color: color,
      scale: 1.1,
      duration: 0.2,
      ease: "back.out(1.7)",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gsap.set(yieldDisplay, { color: '#00ff88' });
      }
    });
    
  }, 5000 + Math.random() * 5000);
}

function executeStakeTransaction(amount) {
  const notification = showNotification(`Staking ${amount} tokens...`, 'info');
  
  // Simulate transaction processing
  setTimeout(() => {
    notification.update(`Transaction confirmed! Staked ${amount} tokens`, 'success');
    
    // Update UI
    updateStakingBalance(amount);
    
    // Visual celebration
    createStakingParticles();
    
  }, 2000 + Math.random() * 3000);
}

function createStakingParticles() {
  const container = document.querySelector('.defi-ai');
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'staking-particle';
    
    gsap.set(particle, {
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      scale: Math.random() * 0.5 + 0.5,
      opacity: 1
    });
    
    container.appendChild(particle);
    
    gsap.to(particle, {
      y: '-=100',
      opacity: 0,
      duration: 2 + Math.random(),
      ease: "power2.out",
      onComplete: () => particle.remove()
    });
  }
}
```

### Keyboard Navigation
```javascript
function handleBlockchainKeyboard(e) {
  const blockchainElements = document.querySelectorAll(
    '.blockchain-chapter [tabindex="0"], .blockchain-chapter button'
  );
  const currentIndex = Array.from(blockchainElements).indexOf(document.activeElement);
  
  switch(e.key) {
    case 'Tab':
      // Default tab behavior
      break;
    case 'Enter':
    case ' ':
      if (document.activeElement.classList.contains('network-node')) {
        // Send transaction from this node
        initializeTransaction(document.activeElement.dataset.nodeId);
      } else if (document.activeElement.classList.contains('blockchain-app')) {
        // Open app details
        showAppDetails(document.activeElement.dataset.appId);
      }
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      // Navigate through blockchain apps
      navigateBlockchainApps(e.key === 'ArrowUp' ? -1 : 1);
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      // Navigate through network nodes
      navigateNetworkNodes(e.key === 'ArrowLeft' ? -1 : 1);
      break;
    case 'Escape':
      closeBlockchainModals();
      break;
  }
}
```

---

## Accessibility Features

### ARIA Structure for Blockchain Network
```html
<section 
  role="main" 
  aria-label="Blockchain and Decentralized Intelligence Applications"
  aria-describedby="blockchain-description"
>
  <h2 id="blockchain-title">Decentralized Intelligence</h2>
  <p id="blockchain-description" class="sr-only">
    Interactive blockchain network visualization showcasing AI-powered 
    decentralized applications. Navigate through nodes using arrow keys 
    or click to simulate transactions.
  </p>
  
  <div 
    role="application"
    aria-label="Blockchain Network Visualization"
    tabindex="0"
    aria-describedby="network-instructions"
  >
    <div id="network-instructions" class="sr-only">
      3D blockchain network with interconnected nodes representing different 
      blockchain applications. Use arrow keys to navigate between nodes, 
      Enter to send transaction, Tab to move between applications.
    </div>
    
    <!-- Network status -->
    <div role="status" aria-live="polite" class="network-status">
      <span id="network-state">Network Active - 12,847 nodes online</span>
      <span id="block-height">Current block: #847592</span>
    </div>
    
    <!-- Network nodes -->
    <div role="group" aria-label="Blockchain network nodes">
      <button 
        class="network-node"
        role="button"
        tabindex="0"
        aria-label="NFT AI node - Click to send transaction"
        data-node-id="nft-ai"
        data-node-info="NFT AI: 2.3M+ NFTs generated"
      >
        <div class="node-icon" aria-hidden="true"></div>
        <span class="sr-only">NFT AI blockchain node</span>
      </button>
      <!-- Additional nodes... -->
    </div>
    
    <!-- Blockchain applications -->
    <div role="group" aria-label="Blockchain AI applications">
      <article 
        class="blockchain-app"
        tabindex="0"
        aria-labelledby="defi-ai-title"
        aria-describedby="defi-ai-description"
        data-app-id="defi-ai"
      >
        <h3 id="defi-ai-title">DeFi AI</h3>
        <p id="defi-ai-description" class="sr-only">
          Intelligent Finance Protocol with $2.1B total value locked, 
          23.7% average APY, and 150+ DeFi integrations
        </p>
        
        <div role="group" aria-label="DeFi actions">
          <button 
            class="stake-button"
            aria-label="Stake tokens in DeFi protocol"
          >
            Stake
          </button>
          <button 
            class="unstake-button"
            aria-label="Unstake tokens from DeFi protocol"
          >
            Unstake
          </button>
        </div>
      </article>
      <!-- Additional apps... -->
    </div>
  </div>
  
  <!-- Live regions for network updates -->
  <div 
    id="blockchain-updates-live-region"
    role="status"
    aria-live="polite"
    class="sr-only"
  >
  </div>
  
  <div 
    id="transaction-alerts-live-region"
    role="alert"
    aria-live="assertive"
    class="sr-only"
  >
  </div>
</section>
```

### Screen Reader Blockchain Updates
```javascript
// Announce blockchain events to screen readers
function announceNetworkUpdate(event, details) {
  const liveRegion = document.getElementById('blockchain-updates-live-region');
  
  switch(event) {
    case 'new_block':
      liveRegion.textContent = `New block mined: Block ${details.height} with ${details.transactions} transactions`;
      break;
    case 'node_activity':
      liveRegion.textContent = `Node ${details.nodeId} processing ${details.activity}`;
      break;
    case 'network_stats':
      liveRegion.textContent = `Network update: ${details.nodes} nodes online, ${details.tps} transactions per second`;
      break;
  }
}

// Announce transactions
function announceTransaction(sourceNode, targetNode, status) {
  const alertRegion = document.getElementById('transaction-alerts-live-region');
  
  switch(status) {
    case 'initiated':
      alertRegion.textContent = `Transaction initiated from ${sourceNode} to ${targetNode}`;
      break;
    case 'confirmed':
      alertRegion.textContent = `Transaction confirmed: ${sourceNode} to ${targetNode} successful`;
      break;
    case 'failed':
      alertRegion.textContent = `Transaction failed: ${sourceNode} to ${targetNode} - please try again`;
      break;
  }
}

// Announce DeFi actions
function announceDeFiAction(action, amount, protocol) {
  const liveRegion = document.getElementById('blockchain-updates-live-region');
  liveRegion.textContent = `${action} ${amount} tokens in ${protocol} protocol`;
}
```

### Reduced Motion Blockchain
```css
@media (prefers-reduced-motion: reduce) {
  .blockchain-chapter {
    .network-node {
      /* Static nodes instead of pulsing */
      animation: none;
      transform: none !important;
    }
    
    .transaction-particle {
      /* Instant transaction visualization */
      animation: none;
      transition: opacity 0.3s ease;
    }
    
    .network-connection {
      /* Static connection lines */
      stroke-dasharray: none !important;
      animation: none;
    }
    
    .mining-blocks {
      /* No mining animation */
      animation: none;
      transform: none;
    }
    
    .blockchain-app {
      /* Subtle hover effects only */
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
  }
}
```

---

## Performance Optimizations

### Efficient Network Rendering
```javascript
// Optimized blockchain network rendering
class BlockchainNetworkRenderer {
  constructor(container) {
    this.container = container;
    this.nodes = new Map();
    this.connections = new Map();
    this.animationQueue = [];
    this.isRendering = false;
    
    this.initializeNetwork();
  }
  
  initializeNetwork() {
    // Use GPU-accelerated transforms
    this.container.style.willChange = 'transform';
    this.container.style.transform = 'translate3d(0, 0, 0)';
    
    // Initialize worker for complex calculations
    if (window.Worker) {
      this.networkWorker = new Worker('/workers/blockchain-network-worker.js');
      this.networkWorker.onmessage = (e) => this.handleWorkerMessage(e.data);
    }
  }
  
  addNode(nodeData) {
    const nodeElement = this.createNodeElement(nodeData);
    this.nodes.set(nodeData.id, nodeElement);
    this.container.appendChild(nodeElement);
    
    // Batch node positioning for next frame
    this.queueAnimation({
      type: 'addNode',
      node: nodeElement,
      position: nodeData.position
    });
  }
  
  updateNodeConnections(nodeId, connections) {
    if (this.networkWorker) {
      // Offload pathfinding to worker
      this.networkWorker.postMessage({
        type: 'calculateConnections',
        nodeId,
        connections
      });
    } else {
      // Fallback to main thread
      this.calculateConnections(nodeId, connections);
    }
  }
  
  queueAnimation(animation) {
    this.animationQueue.push(animation);
    
    if (!this.isRendering) {
      this.processAnimationQueue();
    }
  }
  
  processAnimationQueue() {
    if (this.animationQueue.length === 0) {
      this.isRendering = false;
      return;
    }
    
    this.isRendering = true;
    const batchSize = 5; // Process 5 animations per frame
    const batch = this.animationQueue.splice(0, batchSize);
    
    requestAnimationFrame(() => {
      batch.forEach(animation => this.executeAnimation(animation));
      
      // Process next batch
      setTimeout(() => this.processAnimationQueue(), 16);
    });
  }
  
  executeAnimation(animation) {
    switch(animation.type) {
      case 'addNode':
        gsap.fromTo(animation.node, {
          scale: 0,
          opacity: 0
        }, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
        break;
      case 'updateConnection':
        this.animateConnection(animation.connection, animation.data);
        break;
      case 'transaction':
        this.animateTransaction(animation.particle, animation.path);
        break;
    }
  }
}
```

### Web Worker for Network Calculations
```javascript
// blockchain-network-worker.js
class NetworkCalculator {
  constructor() {
    this.nodes = new Map();
    this.connections = [];
    this.pathfindingCache = new Map();
  }
  
  calculateShortestPath(startNodeId, endNodeId) {
    const cacheKey = `${startNodeId}-${endNodeId}`;
    
    if (this.pathfindingCache.has(cacheKey)) {
      return this.pathfindingCache.get(cacheKey);
    }
    
    // Dijkstra's algorithm implementation
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    // Initialize
    for (const [nodeId] of this.nodes) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }
    distances.set(startNodeId, 0);
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId);
        if (distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      }
      
      if (currentNode === null) break;
      
      unvisited.delete(currentNode);
      
      if (currentNode === endNodeId) break;
      
      // Check neighbors
      const neighbors = this.getNeighbors(currentNode);
      for (const neighborId of neighbors) {
        if (unvisited.has(neighborId)) {
          const alt = distances.get(currentNode) + this.getConnectionWeight(currentNode, neighborId);
          if (alt < distances.get(neighborId)) {
            distances.set(neighborId, alt);
            previous.set(neighborId, currentNode);
          }
        }
      }
    }
    
    // Reconstruct path
    const path = [];
    let current = endNodeId;
    
    while (current !== undefined) {
      path.unshift(current);
      current = previous.get(current);
    }
    
    // Cache result
    this.pathfindingCache.set(cacheKey, path);
    
    return path;
  }
  
  getNeighbors(nodeId) {
    return this.connections
      .filter(conn => conn.from === nodeId || conn.to === nodeId)
      .map(conn => conn.from === nodeId ? conn.to : conn.from);
  }
  
  getConnectionWeight(nodeA, nodeB) {
    const connection = this.connections.find(
      conn => (conn.from === nodeA && conn.to === nodeB) ||
              (conn.from === nodeB && conn.to === nodeA)
    );
    
    return connection ? connection.weight : 1;
  }
}

const calculator = new NetworkCalculator();

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch(type) {
    case 'calculateConnections':
      const path = calculator.calculateShortestPath(data.start, data.end);
      self.postMessage({
        type: 'pathCalculated',
        path: path
      });
      break;
    case 'updateNetwork':
      calculator.nodes = new Map(data.nodes);
      calculator.connections = data.connections;
      break;
  }
};
```

### Memory Management
```javascript
// Cleanup blockchain chapter
function cleanupBlockchainChapter() {
  // Kill main timeline
  blockchainTimeline.kill();
  
  // Terminate network worker
  if (window.networkWorker) {
    window.networkWorker.terminate();
    window.networkWorker = null;
  }
  
  // Clean up network renderer
  if (window.blockchainRenderer) {
    window.blockchainRenderer.cleanup();
    window.blockchainRenderer = null;
  }
  
  // Clear intervals
  if (window.blockMiningInterval) {
    clearInterval(window.blockMiningInterval);
  }
  if (window.networkUpdateInterval) {
    clearInterval(window.networkUpdateInterval);
  }
  
  // Remove event listeners
  document.removeEventListener('keydown', handleBlockchainKeyboard);
  
  // Clear animation queues
  gsap.globalTimeline.clear();
  
  // Clean up DOM
  const particles = document.querySelectorAll('.transaction-particle');
  particles.forEach(particle => particle.remove());
  
  // Reset CSS custom properties
  document.documentElement.style.removeProperty('--blockchain-active');
}
```

---

## Testing Specifications

### Component Tests
```typescript
describe('BlockchainChapter', () => {
  test('renders all blockchain applications', () => {
    const { getAllByRole } = render(<BlockchainChapter />);
    const blockchainApps = getAllByRole('button').filter(
      button => button.classList.contains('blockchain-app')
    );
    expect(blockchainApps).toHaveLength(6);
  });
  
  test('network node interaction works', async () => {
    const { getByLabelText, findByText } = render(<BlockchainChapter />);
    const nftNode = getByLabelText(/NFT AI node/i);
    
    fireEvent.mouseEnter(nftNode);
    
    await findByText(/2.3M\+ NFTs generated/);
    expect(nftNode).toHaveClass('highlighted');
  });
  
  test('transaction simulation works', async () => {
    const mockTransaction = jest.fn();
    const { getByLabelText } = render(
      <BlockchainChapter onTransaction={mockTransaction} />
    );
    
    const sourceNode = getByLabelText(/DeFi AI node/i);
    fireEvent.click(sourceNode);
    
    await waitFor(() => {
      expect(mockTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'defi-ai',
          target: expect.any(String)
        })
      );
    });
  });
  
  test('block mining animation works', async () => {
    render(<BlockchainChapter />);
    
    const miningContainer = document.querySelector('.mining-visualization');
    const initialBlocks = miningContainer.querySelectorAll('.mining-block').length;
    
    // Wait for new block
    await waitFor(() => {
      const currentBlocks = miningContainer.querySelectorAll('.mining-block').length;
      expect(currentBlocks).toBeGreaterThan(initialBlocks);
    }, { timeout: 10000 });
  });
});
```

### Performance Tests
```typescript
describe('Blockchain Performance', () => {
  test('network rendering maintains 60fps', async () => {
    const performanceEntries: PerformanceEntry[] = [];
    
    const observer = new PerformanceObserver((list) => {
      performanceEntries.push(...list.getEntries());
    });
    observer.observe({ entryTypes: ['measure'] });
    
    render(<BlockchainChapter />);
    
    // Simulate heavy network activity
    for (let i = 0; i < 50; i++) {
      fireEvent(window, new CustomEvent('networkUpdate', {
        detail: { nodeId: `node-${i}`, activity: 'transaction' }
      }));
    }
    
    await waitFor(() => {
      const frameEntries = performanceEntries.filter(
        entry => entry.name === 'network-frame'
      );
      
      frameEntries.forEach(entry => {
        expect(entry.duration).toBeLessThan(16.67); // 60fps = 16.67ms per frame
      });
    });
  });
  
  test('transaction animations are GPU accelerated', () => {
    render(<BlockchainChapter />);
    
    const particles = document.querySelectorAll('.transaction-particle');
    particles.forEach(particle => {
      const computedStyle = window.getComputedStyle(particle);
      expect(computedStyle.willChange).toContain('transform');
      expect(computedStyle.transform).toContain('translate3d');
    });
  });
});
```

### E2E Tests
```typescript
test('Blockchain network interaction flow', async ({ page }) => {
  await page.goto('/');
  
  // Scroll to blockchain chapter
  await page.evaluate(() => window.scrollTo(0, 6000));
  
  // Wait for blockchain network to load
  await expect(page.locator('.blockchain-network')).toBeVisible();
  
  // Test node interaction
  await page.hover('.network-node[data-node-id="nft-ai"]');
  await expect(page.locator('.node-details')).toBeVisible();
  
  // Test transaction simulation
  await page.click('.network-node[data-node-id="defi-ai"]');
  await expect(page.locator('.transaction-particle')).toBeVisible();
  
  // Wait for transaction completion
  await expect(page.locator('.transaction-success')).toBeVisible({ timeout: 5000 });
  
  // Test DeFi staking
  await page.click('.blockchain-app[data-app-id="defi-ai"] .stake-button');
  
  // Handle staking modal
  await page.fill('.stake-amount-input', '100');
  await page.click('.confirm-stake-button');
  
  await expect(page.locator('.staking-success')).toBeVisible({ timeout: 3000 });
  
  // Test keyboard navigation
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  
  // Test reduced motion
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  
  const networkNodes = page.locator('.network-node');
  await expect(networkNodes.first()).toHaveCSS('animation', /none/);
});
```

---

## Technical Implementation

### Component Architecture
```typescript
interface BlockchainApplication {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  metrics: Record<string, string>;
  type: 'nft' | 'defi' | 'smart-contracts' | 'token' | 'dao' | 'mining';
}

interface NetworkNode {
  id: string;
  position: { x: number; y: number; z: number };
  connections: string[];
  activity: number;
  status: 'active' | 'syncing' | 'offline';
}

interface BlockchainChapterProps {
  locale: 'en' | 'ro';
  applications: BlockchainApplication[];
  networkNodes: NetworkNode[];
  onTransaction: (source: string, target: string) => void;
  onStake: (protocol: string, amount: number) => void;
  reducedMotion?: boolean;
}

export function BlockchainChapter({
  locale,
  applications,
  networkNodes,
  onTransaction,
  onStake,
  reducedMotion = false
}: BlockchainChapterProps) {
  // Implementation with blockchain network
}
```

### CSS Classes and Custom Properties
```css
.blockchain-chapter {
  --blockchain-neon: #00ff88;
  --blockchain-purple: #8b5cf6;
  --blockchain-blue: #3b82f6;
  --crypto-gold: #f59e0b;
  --network-glow: #00ff8844;
}

/* Main components */
.blockchain-title { /* Chapter heading with electric glow */ }
.blockchain-network { /* 3D blockchain network visualization */ }
.network-node { /* Individual blockchain nodes */ }
.network-connection { /* Connection lines between nodes */ }
.blockchain-app { /* Blockchain application cards */ }
.transaction-particle { /* Animated transaction particles */ }
.mining-visualization { /* Block mining animation */ }
.defi-interface { /* DeFi staking interface */ }
.network-stats { /* Live network statistics */ }
.node-details { /* Node information tooltip */ }
```

This comprehensive Blockchain chapter storyboard creates an immersive and educational cryptocurrency/Web3 experience that demonstrates CODAI's blockchain intelligence while maintaining technical accuracy and engaging interactions.