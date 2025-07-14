// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CodaiToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CodaiGovernance
 * @dev Decentralized governance for the Codai ecosystem
 * Features:
 * - Proposal creation and voting
 * - Token-weighted voting power
 * - Execution of approved proposals
 * - Treasury management
 */
contract CodaiGovernance is Ownable, ReentrancyGuard {
    CodaiToken public immutable codaiToken;
    
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant EXECUTION_DELAY = 2 days;
    uint256 public constant PROPOSAL_THRESHOLD = 1000000 * 10**18; // 1M CODAI
    uint256 public constant QUORUM_THRESHOLD = 5000000 * 10**18; // 5M CODAI
    
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Failed,
        Executed,
        Cancelled
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    
    uint256 public nextProposalId = 1;
    uint256 public totalProposals;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support, // 0=against, 1=for, 2=abstain
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    constructor(address _codaiToken, address initialOwner) Ownable(initialOwner) {
        codaiToken = CodaiToken(_codaiToken);
    }
    
    /**
     * @dev Create a new governance proposal
     */
    function propose(
        string calldata title,
        string calldata description,
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas
    ) external returns (uint256) {
        require(
            codaiToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD,
            "Insufficient tokens to propose"
        );
        require(targets.length > 0, "Must provide targets");
        require(
            targets.length == values.length && targets.length == calldatas.length,
            "Array length mismatch"
        );
        
        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        
        totalProposals++;
        
        emit ProposalCreated(proposalId, msg.sender, title, description);
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId The proposal to vote on
     * @param support 0=against, 1=for, 2=abstain
     */
    function castVote(uint256 proposalId, uint8 support) external {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        require(support <= 2, "Invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        require(getProposalState(proposalId) == ProposalState.Active, "Voting not active");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = codaiToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = weight;
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a successful proposal
     */
    function execute(uint256 proposalId) external payable nonReentrant {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Cannot execute");
        
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(
            block.timestamp >= proposal.endTime + EXECUTION_DELAY,
            "Execution delay not met"
        );
        
        proposal.executed = true;
        
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(
                proposal.calldatas[i]
            );
            require(success, "Transaction execution reverted");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     */
    function cancel(uint256 proposalId) external {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        require(!proposal.executed && !proposal.cancelled, "Cannot cancel");
        
        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @dev Get current state of a proposal
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        if (totalVotes < QUORUM_THRESHOLD) {
            return ProposalState.Failed;
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            return ProposalState.Succeeded;
        }
        
        return ProposalState.Failed;
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool cancelled
    ) {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.cancelled
        );
    }
    
    /**
     * @dev Get voting power of an address
     */
    function getVotingPower(address account) external view returns (uint256) {
        return codaiToken.balanceOf(account);
    }
    
    /**
     * @dev Check if user has voted on proposal
     */
    function hasVoted(uint256 proposalId, address account) external view returns (bool) {
        return proposals[proposalId].hasVoted[account];
    }
    
    /**
     * @dev Get governance statistics
     */
    function getGovernanceStats() external view returns (
        uint256 _totalProposals,
        uint256 _activeProposals,
        uint256 _totalVoters
    ) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i < nextProposalId; i++) {
            if (getProposalState(i) == ProposalState.Active) {
                activeCount++;
            }
        }
        
        return (totalProposals, activeCount, totalProposals); // Simplified
    }
}
