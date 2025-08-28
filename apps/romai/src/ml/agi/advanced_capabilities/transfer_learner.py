"""
RomAI AGI Evolution Phase 2 - Transfer Learner

Advanced transfer learning implementation with domain adaptation,
knowledge transfer, and multi-domain learning capabilities.
"""

import asyncio
import json
import logging
import math
from collections import defaultdict, OrderedDict
from datetime import datetime
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from copy import deepcopy

# Import learning types
from .learning_types import (
    LearningTask, LearningExperience, LearningModel, LearningConfiguration,
    LearningProgress, LearningType, LearningStatus, TransferType,
    TransferLearnerInterface, create_learning_experience,
    create_learning_task, calculate_learning_metrics
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# TRANSFER LEARNING COMPONENTS
# ============================================================================

class DomainAdaptationEngine:
    """Domain adaptation for transfer learning"""
    
    def __init__(self, feature_dim: int = 512, num_domains: int = 2):
        self.feature_dim = feature_dim
        self.num_domains = num_domains
        
        # Domain discriminator for adversarial training
        self.domain_discriminator = nn.Sequential(
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_domains)
        )
        
        # Domain alignment statistics
        self.domain_distances = {}
        self.adaptation_history = []
        
        logger.info(f"🔄 Domain Adaptation Engine initialized ({feature_dim}D, {num_domains} domains)")
    
    def compute_domain_distance(self, source_features: torch.Tensor, 
                               target_features: torch.Tensor) -> float:
        """Compute Maximum Mean Discrepancy (MMD) between domains"""
        try:
            # Gaussian kernel MMD
            def gaussian_kernel(x, y, sigma=1.0):
                return torch.exp(-torch.cdist(x, y).pow(2) / (2 * sigma**2))
            
            # Compute kernels
            k_xx = gaussian_kernel(source_features, source_features).mean()
            k_yy = gaussian_kernel(target_features, target_features).mean()
            k_xy = gaussian_kernel(source_features, target_features).mean()
            
            # MMD distance
            mmd = k_xx + k_yy - 2 * k_xy
            
            return float(mmd.item())
            
        except Exception as e:
            logger.warning(f"Domain distance computation failed: {e}")
            return float('inf')
    
    def adapt_features(self, source_features: torch.Tensor, 
                      target_features: torch.Tensor,
                      adaptation_method: str = "coral") -> torch.Tensor:
        """Adapt source features to target domain"""
        try:
            if adaptation_method == "coral":
                # CORAL (CORrelation ALignment)
                return self._coral_adaptation(source_features, target_features)
            elif adaptation_method == "dann":
                # DANN (Domain-Adversarial Neural Networks)
                return self._dann_adaptation(source_features)
            else:
                return source_features
            
        except Exception as e:
            logger.error(f"Feature adaptation failed: {e}")
            return source_features
    
    def _coral_adaptation(self, source_features: torch.Tensor, 
                         target_features: torch.Tensor) -> torch.Tensor:
        """CORAL domain adaptation"""
        # Compute covariance matrices
        source_cov = torch.cov(source_features.T)
        target_cov = torch.cov(target_features.T)
        
        # Whitening and re-coloring transformation
        source_mean = source_features.mean(0)
        source_centered = source_features - source_mean
        
        # Eigendecomposition for whitening
        U_s, S_s, _ = torch.svd(source_cov)
        U_t, S_t, _ = torch.svd(target_cov)
        
        # Whitening matrix
        W_s = U_s @ torch.diag(1.0 / torch.sqrt(S_s + 1e-8)) @ U_s.T
        
        # Re-coloring matrix
        W_t = U_t @ torch.diag(torch.sqrt(S_t)) @ U_t.T
        
        # Apply transformation
        adapted_features = source_centered @ W_s @ W_t + source_mean
        
        return adapted_features
    
    def _dann_adaptation(self, source_features: torch.Tensor) -> torch.Tensor:
        """DANN domain adaptation using adversarial training"""
        # Apply domain discriminator (gradient reversal would be applied during training)
        domain_predictions = self.domain_discriminator(source_features)
        
        # Return features (adaptation happens through adversarial training)
        return source_features
    
    def evaluate_adaptation_quality(self, adapted_features: torch.Tensor,
                                  target_features: torch.Tensor) -> Dict[str, float]:
        """Evaluate quality of domain adaptation"""
        # Compute various distance metrics
        mmd_distance = self.compute_domain_distance(adapted_features, target_features)
        
        # Feature distribution statistics
        adapted_mean = adapted_features.mean(dim=0)
        target_mean = target_features.mean(dim=0)
        mean_distance = torch.norm(adapted_mean - target_mean).item()
        
        adapted_std = adapted_features.std(dim=0)
        target_std = target_features.std(dim=0)
        std_distance = torch.norm(adapted_std - target_std).item()
        
        return {
            "mmd_distance": mmd_distance,
            "mean_distance": mean_distance,
            "std_distance": std_distance,
            "adaptation_quality": 1.0 / (1.0 + mmd_distance)  # Quality score [0, 1]
        }

class KnowledgeTransferEngine:
    """Engine for knowledge transfer between models"""
    
    def __init__(self):
        self.transfer_strategies = {
            "fine_tuning": self._fine_tuning_transfer,
            "feature_extraction": self._feature_extraction_transfer,
            "layer_freezing": self._layer_freezing_transfer,
            "knowledge_distillation": self._knowledge_distillation_transfer
        }
        
        self.transfer_history = []
        self.knowledge_maps = {}
        
        logger.info("🧠 Knowledge Transfer Engine initialized")
    
    def transfer_knowledge(self, source_model: nn.Module, target_model: nn.Module,
                          transfer_type: TransferType, 
                          transfer_config: Dict[str, Any]) -> Dict[str, Any]:
        """Transfer knowledge from source to target model"""
        try:
            strategy = transfer_config.get("strategy", "fine_tuning")
            
            if strategy not in self.transfer_strategies:
                raise ValueError(f"Unknown transfer strategy: {strategy}")
            
            # Execute transfer strategy
            transfer_result = self.transfer_strategies[strategy](
                source_model, target_model, transfer_type, transfer_config
            )
            
            # Record transfer
            transfer_record = {
                "source_model": str(type(source_model).__name__),
                "target_model": str(type(target_model).__name__),
                "transfer_type": transfer_type.value,
                "strategy": strategy,
                "result": transfer_result,
                "timestamp": datetime.now().isoformat()
            }
            
            self.transfer_history.append(transfer_record)
            
            logger.info(f"✅ Knowledge transfer completed: {strategy} -> {transfer_result['success']}")
            return transfer_result
            
        except Exception as e:
            logger.error(f"❌ Knowledge transfer failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _fine_tuning_transfer(self, source_model: nn.Module, target_model: nn.Module,
                            transfer_type: TransferType, config: Dict[str, Any]) -> Dict[str, Any]:
        """Fine-tuning based transfer"""
        try:
            # Copy compatible layers from source to target
            source_dict = source_model.state_dict()
            target_dict = target_model.state_dict()
            
            transferred_layers = []
            incompatible_layers = []
            
            for name, param in source_dict.items():
                if name in target_dict:
                    if param.shape == target_dict[name].shape:
                        target_dict[name].copy_(param)
                        transferred_layers.append(name)
                    else:
                        incompatible_layers.append(name)
            
            # Load transferred weights
            target_model.load_state_dict(target_dict)
            
            return {
                "success": True,
                "transferred_layers": len(transferred_layers),
                "incompatible_layers": len(incompatible_layers),
                "transfer_ratio": len(transferred_layers) / len(source_dict)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _feature_extraction_transfer(self, source_model: nn.Module, target_model: nn.Module,
                                   transfer_type: TransferType, config: Dict[str, Any]) -> Dict[str, Any]:
        """Feature extraction based transfer"""
        try:
            # Freeze source model layers (feature extractor)
            freeze_layers = config.get("freeze_layers", [])
            
            frozen_params = 0
            for name, param in target_model.named_parameters():
                if any(layer in name for layer in freeze_layers):
                    param.requires_grad = False
                    frozen_params += 1
            
            return {
                "success": True,
                "frozen_parameters": frozen_params,
                "trainable_parameters": sum(p.numel() for p in target_model.parameters() if p.requires_grad)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _layer_freezing_transfer(self, source_model: nn.Module, target_model: nn.Module,
                               transfer_type: TransferType, config: Dict[str, Any]) -> Dict[str, Any]:
        """Layer freezing based transfer"""
        try:
            # Transfer weights and freeze specific layers
            source_dict = source_model.state_dict()
            target_dict = target_model.state_dict()
            
            freeze_ratio = config.get("freeze_ratio", 0.5)
            freeze_layers = config.get("freeze_layers", [])
            
            # Calculate layers to freeze
            if not freeze_layers:
                all_layers = list(target_dict.keys())
                num_freeze = int(len(all_layers) * freeze_ratio)
                freeze_layers = all_layers[:num_freeze]  # Freeze early layers
            
            # Transfer compatible weights
            transferred = 0
            for name, param in source_dict.items():
                if name in target_dict and param.shape == target_dict[name].shape:
                    target_dict[name].copy_(param)
                    transferred += 1
            
            # Freeze specified layers
            frozen = 0
            for name, param in target_model.named_parameters():
                if name in freeze_layers:
                    param.requires_grad = False
                    frozen += 1
            
            return {
                "success": True,
                "transferred_weights": transferred,
                "frozen_layers": frozen,
                "freeze_ratio": frozen / len(list(target_model.parameters()))
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _knowledge_distillation_transfer(self, source_model: nn.Module, target_model: nn.Module,
                                       transfer_type: TransferType, config: Dict[str, Any]) -> Dict[str, Any]:
        """Knowledge distillation based transfer"""
        try:
            # Set up distillation parameters
            temperature = config.get("temperature", 3.0)
            alpha = config.get("alpha", 0.7)  # Weight for distillation loss
            
            # Create knowledge distillation loss function
            def distillation_loss(student_outputs, teacher_outputs, true_labels, temperature, alpha):
                # Soft targets from teacher
                teacher_probs = F.softmax(teacher_outputs / temperature, dim=1)
                student_log_probs = F.log_softmax(student_outputs / temperature, dim=1)
                
                # Distillation loss
                kd_loss = F.kl_div(student_log_probs, teacher_probs, reduction='batchmean')
                
                # Standard cross-entropy loss
                ce_loss = F.cross_entropy(student_outputs, true_labels)
                
                # Combined loss
                total_loss = alpha * kd_loss * (temperature ** 2) + (1 - alpha) * ce_loss
                
                return total_loss, kd_loss, ce_loss
            
            # Store distillation function in target model (would be used during training)
            if hasattr(target_model, 'distillation_config'):
                target_model.distillation_config = {
                    "teacher_model": source_model,
                    "temperature": temperature,
                    "alpha": alpha,
                    "loss_function": distillation_loss
                }
            
            return {
                "success": True,
                "distillation_temperature": temperature,
                "distillation_alpha": alpha,
                "setup_complete": True
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def assess_transferability(self, source_model: nn.Module, target_task: LearningTask) -> Dict[str, float]:
        """Assess transferability from source model to target task"""
        try:
            # Analyze model architecture compatibility
            architecture_score = self._assess_architecture_compatibility(source_model, target_task)
            
            # Analyze domain similarity (placeholder - would need actual domain analysis)
            domain_score = self._assess_domain_similarity(source_model, target_task)
            
            # Analyze task complexity compatibility
            task_score = self._assess_task_compatibility(source_model, target_task)
            
            # Overall transferability score
            transferability = (architecture_score + domain_score + task_score) / 3.0
            
            return {
                "transferability_score": transferability,
                "architecture_compatibility": architecture_score,
                "domain_similarity": domain_score,
                "task_compatibility": task_score,
                "recommendation": "high" if transferability > 0.7 else "medium" if transferability > 0.4 else "low"
            }
            
        except Exception as e:
            logger.error(f"Transferability assessment failed: {e}")
            return {"transferability_score": 0.0, "error": str(e)}
    
    def _assess_architecture_compatibility(self, source_model: nn.Module, target_task: LearningTask) -> float:
        """Assess architecture compatibility"""
        # Simple heuristic based on model size and layer count
        num_params = sum(p.numel() for p in source_model.parameters())
        num_layers = len(list(source_model.modules()))
        
        # Normalize scores (heuristic)
        param_score = min(1.0, num_params / 1e6)  # Assume optimal around 1M params
        layer_score = min(1.0, num_layers / 20)   # Assume optimal around 20 layers
        
        return (param_score + layer_score) / 2.0
    
    def _assess_domain_similarity(self, source_model: nn.Module, target_task: LearningTask) -> float:
        """Assess domain similarity (placeholder)"""
        # This would involve actual domain analysis
        # For now, return a heuristic score
        domain_map = {
            "computer_vision": ["image", "vision", "visual"],
            "natural_language_processing": ["text", "language", "nlp"],
            "audio": ["speech", "sound", "audio"],
            "general": ["general", "multi_modal"]
        }
        
        # Simple keyword matching heuristic
        task_domain = target_task.domain.lower()
        for domain, keywords in domain_map.items():
            if any(keyword in task_domain for keyword in keywords):
                return 0.8  # High similarity if domain matches
        
        return 0.5  # Medium similarity for general domains
    
    def _assess_task_compatibility(self, source_model: nn.Module, target_task: LearningTask) -> float:
        """Assess task compatibility"""
        # Analyze task type compatibility
        task_compatibility_map = {
            LearningType.SUPERVISED: 0.9,
            LearningType.UNSUPERVISED: 0.7,
            LearningType.REINFORCEMENT: 0.6,
            LearningType.SEMI_SUPERVISED: 0.8,
            LearningType.META_LEARNING: 0.5
        }
        
        return task_compatibility_map.get(target_task.task_type, 0.5)

class LayerSelectionEngine:
    """Engine for selecting optimal layers for transfer"""
    
    def __init__(self):
        self.selection_strategies = {
            "similarity_based": self._similarity_based_selection,
            "gradient_based": self._gradient_based_selection,
            "attention_based": self._attention_based_selection,
            "fisher_information": self._fisher_information_selection
        }
        
        self.selection_history = []
        
        logger.info("🎯 Layer Selection Engine initialized")
    
    def select_transfer_layers(self, source_model: nn.Module, target_model: nn.Module,
                             selection_strategy: str = "similarity_based",
                             selection_config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Select optimal layers for transfer"""
        try:
            if selection_strategy not in self.selection_strategies:
                raise ValueError(f"Unknown selection strategy: {selection_strategy}")
            
            config = selection_config or {}
            
            # Execute selection strategy
            selection_result = self.selection_strategies[selection_strategy](
                source_model, target_model, config
            )
            
            # Record selection
            selection_record = {
                "strategy": selection_strategy,
                "result": selection_result,
                "timestamp": datetime.now().isoformat()
            }
            
            self.selection_history.append(selection_record)
            
            logger.info(f"✅ Layer selection completed: {len(selection_result['selected_layers'])} layers")
            return selection_result
            
        except Exception as e:
            logger.error(f"❌ Layer selection failed: {e}")
            return {"selected_layers": [], "error": str(e)}
    
    def _similarity_based_selection(self, source_model: nn.Module, target_model: nn.Module,
                                  config: Dict[str, Any]) -> Dict[str, Any]:
        """Select layers based on similarity metrics"""
        selected_layers = []
        layer_scores = {}
        
        source_dict = source_model.state_dict()
        target_dict = target_model.state_dict()
        
        # Calculate similarity scores for each layer
        for name, source_param in source_dict.items():
            if name in target_dict:
                target_param = target_dict[name]
                
                if source_param.shape == target_param.shape:
                    # Cosine similarity
                    source_flat = source_param.flatten()
                    target_flat = target_param.flatten()
                    
                    similarity = F.cosine_similarity(source_flat.unsqueeze(0), 
                                                   target_flat.unsqueeze(0)).item()
                    
                    layer_scores[name] = similarity
        
        # Select top layers based on similarity
        similarity_threshold = config.get("similarity_threshold", 0.5)
        top_k = config.get("top_k", min(10, len(layer_scores)))
        
        # Sort by similarity and select top layers
        sorted_layers = sorted(layer_scores.items(), key=lambda x: x[1], reverse=True)
        
        for name, score in sorted_layers[:top_k]:
            if score >= similarity_threshold:
                selected_layers.append(name)
        
        return {
            "selected_layers": selected_layers,
            "layer_scores": layer_scores,
            "selection_criteria": f"similarity >= {similarity_threshold}, top {top_k}"
        }
    
    def _gradient_based_selection(self, source_model: nn.Module, target_model: nn.Module,
                                config: Dict[str, Any]) -> Dict[str, Any]:
        """Select layers based on gradient information"""
        # This would require actual gradient computation during training
        # For now, return a heuristic selection
        
        selected_layers = []
        source_dict = source_model.state_dict()
        
        # Select layers with high parameter variance (heuristic for importance)
        for name, param in source_dict.items():
            param_var = torch.var(param).item()
            if param_var > config.get("variance_threshold", 0.1):
                selected_layers.append(name)
        
        return {
            "selected_layers": selected_layers,
            "selection_criteria": "gradient_variance_based"
        }
    
    def _attention_based_selection(self, source_model: nn.Module, target_model: nn.Module,
                                 config: Dict[str, Any]) -> Dict[str, Any]:
        """Select layers based on attention mechanisms"""
        # This would work with attention-based models
        # For now, return a placeholder selection
        
        selected_layers = []
        
        # Look for attention layers
        for name, module in source_model.named_modules():
            if "attention" in name.lower() or "attn" in name.lower():
                selected_layers.append(name)
        
        return {
            "selected_layers": selected_layers,
            "selection_criteria": "attention_based"
        }
    
    def _fisher_information_selection(self, source_model: nn.Module, target_model: nn.Module,
                                    config: Dict[str, Any]) -> Dict[str, Any]:
        """Select layers based on Fisher Information Matrix"""
        # This would require computing Fisher Information
        # For now, return a heuristic selection
        
        selected_layers = []
        source_dict = source_model.state_dict()
        
        # Select layers based on parameter magnitude (proxy for importance)
        for name, param in source_dict.items():
            param_norm = torch.norm(param).item()
            if param_norm > config.get("norm_threshold", 1.0):
                selected_layers.append(name)
        
        return {
            "selected_layers": selected_layers,
            "selection_criteria": "fisher_information_approximation"
        }

# ============================================================================
# TRANSFER LEARNER IMPLEMENTATION
# ============================================================================

class TransferLearner(TransferLearnerInterface):
    """
    Advanced transfer learning system with domain adaptation,
    knowledge transfer, and multi-domain learning capabilities
    """
    
    def __init__(self, config: LearningConfiguration = None):
        self.config = config or LearningConfiguration()
        
        # Core components
        self.source_models: Dict[str, nn.Module] = {}
        self.target_model: Optional[nn.Module] = None
        self.domain_adapter = DomainAdaptationEngine()
        self.knowledge_engine = KnowledgeTransferEngine()
        self.layer_selector = LayerSelectionEngine()
        
        # Transfer learning state
        self.transfer_history = []
        self.domain_mappings = {}
        self.adaptation_cache = {}
        
        # Statistics
        self.total_transfers = 0
        self.successful_transfers = 0
        self.transfer_times = []
        
        # Device management
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        logger.info("🔄 Transfer Learner initialized")
    
    async def initialize(self, config: LearningConfiguration) -> bool:
        """Initialize the transfer learning system"""
        try:
            self.config = config
            
            # Initialize domain adapter with configuration
            if hasattr(config, 'feature_dim'):
                self.domain_adapter = DomainAdaptationEngine(
                    feature_dim=config.feature_dim,
                    num_domains=getattr(config, 'num_domains', 2)
                )
            
            logger.info("✅ Transfer Learner initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Transfer Learner initialization failed: {e}")
            return False
    
    async def transfer_knowledge(self, source_task: LearningTask, target_task: LearningTask,
                               transfer_type: TransferType) -> LearningProgress:
        """Transfer knowledge from source to target task"""
        try:
            logger.info(f"🔄 Transferring knowledge: {source_task.name} -> {target_task.name}")
            start_time = datetime.now()
            
            # Get source model
            source_model = self.source_models.get(source_task.task_id)
            if not source_model:
                raise ValueError(f"Source model not found for task: {source_task.task_id}")
            
            if not self.target_model:
                raise ValueError("Target model not initialized")
            
            # Create learning progress tracker
            progress = LearningProgress(
                task_id=target_task.task_id,
                model_id=f"transfer_{source_task.task_id}_to_{target_task.task_id}",
                total_steps=4,  # Assessment, Selection, Transfer, Validation
                status=LearningStatus.TRAINING
            )
            
            # Step 1: Assess transferability
            logger.info("📊 Assessing transferability...")
            transferability = self.knowledge_engine.assess_transferability(source_model, target_task)
            progress.current_step = 1
            progress.metadata["transferability"] = transferability
            
            if transferability["transferability_score"] < 0.3:
                logger.warning(f"Low transferability score: {transferability['transferability_score']:.3f}")
            
            # Step 2: Select optimal layers for transfer
            logger.info("🎯 Selecting transfer layers...")
            selection_result = self.layer_selector.select_transfer_layers(
                source_model, self.target_model,
                selection_strategy="similarity_based",
                selection_config={"similarity_threshold": 0.4, "top_k": 20}
            )
            progress.current_step = 2
            progress.metadata["selected_layers"] = len(selection_result["selected_layers"])
            
            # Step 3: Perform knowledge transfer
            logger.info("🧠 Performing knowledge transfer...")
            transfer_config = {
                "strategy": self._get_transfer_strategy(transfer_type),
                "selected_layers": selection_result["selected_layers"],
                "freeze_ratio": 0.6 if transfer_type == TransferType.FEATURE_EXTRACTION else 0.3
            }
            
            transfer_result = self.knowledge_engine.transfer_knowledge(
                source_model, self.target_model, transfer_type, transfer_config
            )
            progress.current_step = 3
            progress.metadata["transfer_result"] = transfer_result
            
            # Step 4: Domain adaptation (if needed)
            if source_task.domain != target_task.domain:
                logger.info("🔄 Performing domain adaptation...")
                await self._perform_domain_adaptation(source_task, target_task)
            
            progress.current_step = 4
            
            # Finalize progress
            transfer_time = (datetime.now() - start_time).total_seconds()
            progress.status = LearningStatus.CONVERGED if transfer_result["success"] else LearningStatus.ERROR
            progress.last_update = datetime.now()
            progress.metadata["transfer_time"] = transfer_time
            
            # Update statistics
            self.total_transfers += 1
            if transfer_result["success"]:
                self.successful_transfers += 1
            self.transfer_times.append(transfer_time)
            
            # Store transfer history
            transfer_record = {
                "source_task": source_task.task_id,
                "target_task": target_task.task_id,
                "transfer_type": transfer_type.value,
                "transferability": transferability,
                "transfer_result": transfer_result,
                "transfer_time": transfer_time,
                "timestamp": start_time.isoformat()
            }
            
            self.transfer_history.append(transfer_record)
            
            logger.info(f"✅ Knowledge transfer completed in {transfer_time:.2f}s. "
                       f"Success: {transfer_result['success']}")
            
            return progress
            
        except Exception as e:
            logger.error(f"❌ Knowledge transfer failed: {e}")
            raise
    
    async def adapt_to_domain(self, source_domain: str, target_domain: str,
                            adaptation_data: List[LearningExperience]) -> Dict[str, float]:
        """Adapt model to new domain"""
        try:
            logger.info(f"🔄 Adapting domain: {source_domain} -> {target_domain}")
            
            if not self.target_model:
                raise ValueError("Target model not initialized")
            
            # Check adaptation cache
            cache_key = f"{source_domain}_to_{target_domain}"
            if cache_key in self.adaptation_cache:
                logger.info("📦 Using cached domain adaptation")
                return self.adaptation_cache[cache_key]
            
            # Prepare domain adaptation data
            source_features = []
            target_features = []
            
            for exp in adaptation_data:
                if hasattr(exp, 'domain'):
                    # Extract features using target model (simplified)
                    input_tensor = torch.from_numpy(np.array(exp.input_data)).float().to(self.device)
                    
                    with torch.no_grad():
                        features = self._extract_features(self.target_model, input_tensor)
                    
                    if exp.domain == source_domain:
                        source_features.append(features)
                    elif exp.domain == target_domain:
                        target_features.append(features)
            
            if not source_features or not target_features:
                logger.warning("Insufficient domain data for adaptation")
                return {"adaptation_quality": 0.0}
            
            # Stack features
            source_features = torch.stack(source_features)
            target_features = torch.stack(target_features)
            
            # Perform domain adaptation
            adapted_features = self.domain_adapter.adapt_features(
                source_features, target_features, adaptation_method="coral"
            )
            
            # Evaluate adaptation quality
            adaptation_metrics = self.domain_adapter.evaluate_adaptation_quality(
                adapted_features, target_features
            )
            
            # Cache results
            self.adaptation_cache[cache_key] = adaptation_metrics
            
            # Store domain mapping
            self.domain_mappings[cache_key] = {
                "source_domain": source_domain,
                "target_domain": target_domain,
                "adaptation_metrics": adaptation_metrics,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"✅ Domain adaptation completed. "
                       f"Quality: {adaptation_metrics['adaptation_quality']:.3f}")
            
            return adaptation_metrics
            
        except Exception as e:
            logger.error(f"❌ Domain adaptation failed: {e}")
            return {"adaptation_quality": 0.0, "error": str(e)}
    
    async def evaluate_transfer_performance(self, test_data: List[LearningExperience],
                                          source_task: LearningTask) -> Dict[str, float]:
        """Evaluate transfer learning performance"""
        try:
            if not self.target_model or not test_data:
                return {}
            
            logger.info(f"📊 Evaluating transfer performance on {len(test_data)} examples")
            
            self.target_model.eval()
            
            correct_predictions = 0
            total_predictions = 0
            total_loss = 0.0
            
            with torch.no_grad():
                for exp in test_data:
                    if exp.input_data is None or exp.target_data is None:
                        continue
                    
                    # Convert to tensor
                    input_tensor = torch.from_numpy(np.array(exp.input_data)).float().to(self.device)
                    
                    # Add batch dimension
                    if len(input_tensor.shape) == 1:
                        input_tensor = input_tensor.unsqueeze(0)
                    
                    # Make prediction
                    output = self.target_model(input_tensor)
                    
                    # Calculate accuracy (for classification)
                    if isinstance(exp.target_data, int) and len(output.shape) > 1 and output.shape[1] > 1:
                        predicted = torch.argmax(output, dim=1)
                        if predicted.item() == exp.target_data:
                            correct_predictions += 1
                    
                    # Calculate loss
                    target_tensor = torch.tensor([exp.target_data]).to(self.device)
                    if len(output.shape) > 1 and output.shape[1] > 1:
                        loss = F.cross_entropy(output, target_tensor)
                    else:
                        loss = F.mse_loss(output, target_tensor.float())
                    
                    total_loss += loss.item()
                    total_predictions += 1
            
            # Calculate metrics
            accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0.0
            avg_loss = total_loss / total_predictions if total_predictions > 0 else 0.0
            
            # Compare with source task performance (if available)
            transfer_metrics = {
                "accuracy": accuracy,
                "loss": avg_loss,
                "total_predictions": total_predictions,
                "source_task": source_task.task_id
            }
            
            # Calculate transfer effectiveness
            if hasattr(source_task, 'baseline_accuracy'):
                transfer_gain = accuracy - source_task.baseline_accuracy
                transfer_metrics["transfer_gain"] = transfer_gain
                transfer_metrics["transfer_effectiveness"] = transfer_gain / max(source_task.baseline_accuracy, 0.1)
            
            logger.info(f"✅ Transfer evaluation completed. Accuracy: {accuracy:.3f}")
            return transfer_metrics
            
        except Exception as e:
            logger.error(f"❌ Transfer evaluation failed: {e}")
            return {}
    
    async def learn(self, experiences: List[LearningExperience]) -> LearningProgress:
        """Learn from transfer learning experiences"""
        try:
            # Group experiences by source and target domains
            domain_groups = defaultdict(list)
            for exp in experiences:
                if hasattr(exp, 'source_domain') and hasattr(exp, 'target_domain'):
                    key = f"{exp.source_domain}_to_{exp.target_domain}"
                    domain_groups[key].append(exp)
            
            # Create learning progress
            progress = LearningProgress(
                task_id="transfer_learning",
                model_id="transfer_learner",
                total_steps=len(domain_groups),
                status=LearningStatus.TRAINING
            )
            
            # Process each domain transfer
            for domain_key, domain_exps in domain_groups.items():
                source_domain, target_domain = domain_key.split("_to_")
                
                # Perform domain adaptation
                adaptation_result = await self.adapt_to_domain(
                    source_domain, target_domain, domain_exps
                )
                
                progress.current_step += 1
                progress.metadata[domain_key] = adaptation_result
            
            progress.status = LearningStatus.CONVERGED
            progress.last_update = datetime.now()
            
            return progress
            
        except Exception as e:
            logger.error(f"❌ Transfer learning failed: {e}")
            raise
    
    async def predict(self, input_data: Any) -> Any:
        """Make predictions using the transfer-learned model"""
        try:
            if not self.target_model:
                raise ValueError("Target model not initialized")
            
            self.target_model.eval()
            
            # Convert input to tensor
            if isinstance(input_data, np.ndarray):
                input_tensor = torch.from_numpy(input_data).float().to(self.device)
            elif isinstance(input_data, torch.Tensor):
                input_tensor = input_data.to(self.device)
            else:
                raise ValueError(f"Unsupported input type: {type(input_data)}")
            
            # Add batch dimension if needed
            if len(input_tensor.shape) == 1:
                input_tensor = input_tensor.unsqueeze(0)
            
            with torch.no_grad():
                output = self.target_model(input_tensor)
                
                if isinstance(output, torch.Tensor):
                    output = output.cpu().numpy()
            
            return output
            
        except Exception as e:
            logger.error(f"❌ Transfer prediction failed: {e}")
            raise
    
    async def evaluate(self, test_data: List[LearningExperience]) -> Dict[str, float]:
        """Evaluate transfer learning system"""
        try:
            if not test_data:
                return {}
            
            # Group by transfer type for evaluation
            transfer_groups = defaultdict(list)
            for exp in test_data:
                transfer_type = getattr(exp, 'transfer_type', 'general')
                transfer_groups[transfer_type].append(exp)
            
            overall_results = {}
            total_accuracy = 0.0
            total_loss = 0.0
            valid_groups = 0
            
            for transfer_type, group_data in transfer_groups.items():
                # Create dummy source task for evaluation
                from .learning_types import create_learning_task
                source_task = create_learning_task(
                    name=f"source_{transfer_type}",
                    task_type=LearningType.SUPERVISED,
                    domain=transfer_type
                )
                
                # Evaluate group
                group_results = await self.evaluate_transfer_performance(group_data, source_task)
                
                if group_results:
                    overall_results[transfer_type] = group_results
                    total_accuracy += group_results.get('accuracy', 0.0)
                    total_loss += group_results.get('loss', 0.0)
                    valid_groups += 1
            
            # Overall metrics
            if valid_groups > 0:
                overall_results['overall_accuracy'] = total_accuracy / valid_groups
                overall_results['overall_loss'] = total_loss / valid_groups
                overall_results['transfer_success_rate'] = self.successful_transfers / max(self.total_transfers, 1)
                overall_results['avg_transfer_time'] = np.mean(self.transfer_times) if self.transfer_times else 0.0
            
            return overall_results
            
        except Exception as e:
            logger.error(f"❌ Transfer evaluation failed: {e}")
            return {}
    
    async def save_model(self, path: str) -> bool:
        """Save the transfer learning system"""
        try:
            save_dict = {
                "config": self.config.__dict__,
                "source_models": {k: v.state_dict() for k, v in self.source_models.items()},
                "target_model": self.target_model.state_dict() if self.target_model else None,
                "transfer_history": self.transfer_history,
                "domain_mappings": self.domain_mappings,
                "adaptation_cache": self.adaptation_cache,
                "total_transfers": self.total_transfers,
                "successful_transfers": self.successful_transfers,
                "transfer_times": self.transfer_times,
                "domain_adapter_stats": {
                    "domain_distances": self.domain_adapter.domain_distances,
                    "adaptation_history": self.domain_adapter.adaptation_history
                },
                "timestamp": datetime.now().isoformat()
            }
            
            torch.save(save_dict, path)
            
            logger.info(f"✅ Transfer learner saved to {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Transfer learner saving failed: {e}")
            return False
    
    async def load_model(self, path: str) -> bool:
        """Load a previously saved transfer learning system"""
        try:
            save_dict = torch.load(path, map_location=self.device)
            
            # Restore transfer learning state
            if "transfer_history" in save_dict:
                self.transfer_history = save_dict["transfer_history"]
            
            if "domain_mappings" in save_dict:
                self.domain_mappings = save_dict["domain_mappings"]
            
            if "adaptation_cache" in save_dict:
                self.adaptation_cache = save_dict["adaptation_cache"]
            
            if "total_transfers" in save_dict:
                self.total_transfers = save_dict["total_transfers"]
                self.successful_transfers = save_dict.get("successful_transfers", 0)
                self.transfer_times = save_dict.get("transfer_times", [])
            
            # Restore domain adapter state
            if "domain_adapter_stats" in save_dict:
                stats = save_dict["domain_adapter_stats"]
                self.domain_adapter.domain_distances = stats.get("domain_distances", {})
                self.domain_adapter.adaptation_history = stats.get("adaptation_history", [])
            
            logger.info(f"✅ Transfer learner loaded from {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Transfer learner loading failed: {e}")
            return False
    
    # Helper methods
    def add_source_model(self, task_id: str, model: nn.Module):
        """Add a source model for transfer learning"""
        self.source_models[task_id] = model.to(self.device)
        logger.info(f"✅ Added source model for task: {task_id}")
    
    def set_target_model(self, model: nn.Module):
        """Set the target model for transfer learning"""
        self.target_model = model.to(self.device)
        logger.info("✅ Target model set for transfer learning")
    
    def _get_transfer_strategy(self, transfer_type: TransferType) -> str:
        """Get transfer strategy based on transfer type"""
        strategy_map = {
            TransferType.FINE_TUNING: "fine_tuning",
            TransferType.FEATURE_EXTRACTION: "feature_extraction",
            TransferType.DOMAIN_ADAPTATION: "layer_freezing",
            TransferType.MULTI_TASK: "knowledge_distillation"
        }
        
        return strategy_map.get(transfer_type, "fine_tuning")
    
    async def _perform_domain_adaptation(self, source_task: LearningTask, target_task: LearningTask):
        """Perform domain adaptation between tasks"""
        # This would involve actual domain adaptation using available data
        # For now, just log the adaptation
        logger.info(f"🔄 Domain adaptation: {source_task.domain} -> {target_task.domain}")
    
    def _extract_features(self, model: nn.Module, input_tensor: torch.Tensor) -> torch.Tensor:
        """Extract features from model (simplified)"""
        # This would extract intermediate features
        # For now, just return the final output
        with torch.no_grad():
            output = model(input_tensor.unsqueeze(0) if len(input_tensor.shape) == 1 else input_tensor)
            
            # If output is multi-dimensional, flatten
            if len(output.shape) > 2:
                output = output.view(output.size(0), -1)
            
            return output.squeeze(0)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive transfer learning statistics"""
        return {
            "total_transfers": self.total_transfers,
            "successful_transfers": self.successful_transfers,
            "transfer_success_rate": self.successful_transfers / max(self.total_transfers, 1),
            "avg_transfer_time": np.mean(self.transfer_times) if self.transfer_times else 0.0,
            "num_source_models": len(self.source_models),
            "has_target_model": self.target_model is not None,
            "num_domain_mappings": len(self.domain_mappings),
            "adaptation_cache_size": len(self.adaptation_cache),
            "domain_adapter_stats": {
                "num_domain_distances": len(self.domain_adapter.domain_distances),
                "adaptation_history_size": len(self.domain_adapter.adaptation_history)
            },
            "knowledge_engine_stats": {
                "transfer_history_size": len(self.knowledge_engine.transfer_history),
                "knowledge_maps_size": len(self.knowledge_engine.knowledge_maps)
            },
            "layer_selector_stats": {
                "selection_history_size": len(self.layer_selector.selection_history)
            }
        }
    
    def measure_transferability(self, source_model: nn.Module, target_task: LearningTask) -> Dict[str, float]:
        """
        Measure transferability from source model to target task.
        Required implementation for TransferLearnerInterface.
        """
        try:
            # Delegate to knowledge engine for comprehensive assessment
            transferability = self.knowledge_engine.assess_transferability(source_model, target_task)
            return transferability
        except Exception as e:
            logger.error(f"❌ Transferability measurement failed: {e}")
            return {"transferability_score": 0.0, "error": str(e)}
    
    def select_transfer_layers(self, source_model: nn.Module, target_model: nn.Module,
                             selection_strategy: str = "similarity_based") -> Dict[str, Any]:
        """
        Select optimal layers for transfer learning.
        Required implementation for TransferLearnerInterface.
        """
        try:
            # Use layer selection engine with default configuration
            selection_config = {
                "similarity_threshold": 0.4,
                "top_k": 20,
                "strategy": selection_strategy
            }
            
            result = self.layer_selector.select_transfer_layers(
                source_model, target_model, selection_strategy, selection_config
            )
            
            return result
        except Exception as e:
            logger.error(f"❌ Layer selection failed: {e}")
            return {"selected_layers": [], "error": str(e)}

# ============================================================================
# TESTING
# ============================================================================

async def test_transfer_learner():
    """Test the Transfer Learner functionality"""
    print("🔄 Testing RomAI Transfer Learner")
    print("=" * 36)
    
    try:
        # Initialize transfer learner
        config = LearningConfiguration()
        learner = TransferLearner(config)
        success = await learner.initialize(config)
        print(f"✅ Transfer Learner initialization: {success}")
        
        # Create models for testing
        class SimpleSourceModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.encoder = nn.Sequential(
                    nn.Linear(10, 20),
                    nn.ReLU(),
                    nn.Linear(20, 16)
                )
                self.classifier = nn.Linear(16, 3)
            
            def forward(self, x):
                features = self.encoder(x)
                return self.classifier(features)
        
        class SimpleTargetModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.encoder = nn.Sequential(
                    nn.Linear(10, 20),
                    nn.ReLU(),
                    nn.Linear(20, 16)
                )
                self.classifier = nn.Linear(16, 2)  # Different output size
            
            def forward(self, x):
                features = self.encoder(x)
                return self.classifier(features)
        
        source_model = SimpleSourceModel()
        target_model = SimpleTargetModel()
        
        # Add models to transfer learner
        from .learning_types import create_learning_task
        
        source_task = create_learning_task(
            name="Source Vision Task",
            task_type=LearningType.SUPERVISED,
            domain="computer_vision",
            num_classes=3
        )
        
        target_task = create_learning_task(
            name="Target Vision Task",
            task_type=LearningType.SUPERVISED,
            domain="computer_vision",
            num_classes=2
        )
        
        learner.add_source_model(source_task.task_id, source_model)
        learner.set_target_model(target_model)
        
        print(f"✅ Models added: {len(learner.source_models)} source, target set")
        
        # Test 1: Knowledge transfer
        print("\n🧠 Test 1: Knowledge Transfer")
        
        progress = await learner.transfer_knowledge(
            source_task, target_task, TransferType.FINE_TUNING
        )
        
        print(f"✅ Knowledge transfer completed:")
        print(f"  • Status: {progress.status.value}")
        print(f"  • Steps: {progress.current_step}")
        print(f"  • Transferability: {progress.metadata.get('transferability', {}).get('transferability_score', 'N/A')}")
        print(f"  • Selected layers: {progress.metadata.get('selected_layers', 'N/A')}")
        
        # Test 2: Domain adaptation
        print("\n🔄 Test 2: Domain Adaptation")
        
        # Create domain adaptation data
        from .learning_types import create_learning_experience
        
        adaptation_data = []
        for i in range(20):
            exp = create_learning_experience(
                task_id=f"domain_exp_{i}",
                input_data=np.random.randn(10),
                target_data=random.randint(0, 1)
            )
            # Add domain information (would be part of actual experience)
            exp.domain = "computer_vision" if i < 10 else "medical_imaging"
            adaptation_data.append(exp)
        
        adaptation_result = await learner.adapt_to_domain(
            "computer_vision", "medical_imaging", adaptation_data
        )
        
        print(f"✅ Domain adaptation completed:")
        for metric, value in adaptation_result.items():
            if isinstance(value, float):
                print(f"  • {metric}: {value:.3f}")
            else:
                print(f"  • {metric}: {value}")
        
        # Test 3: Transfer performance evaluation
        print("\n📊 Test 3: Transfer Performance Evaluation")
        
        # Create test data
        test_data = []
        for i in range(15):
            exp = create_learning_experience(
                task_id=target_task.task_id,
                input_data=np.random.randn(10),
                target_data=random.randint(0, 1)
            )
            test_data.append(exp)
        
        eval_results = await learner.evaluate_transfer_performance(test_data, source_task)
        
        print(f"✅ Transfer evaluation completed:")
        for metric, value in eval_results.items():
            if isinstance(value, (int, float)):
                print(f"  • {metric}: {value}")
        
        # Test 4: Predictions
        print("\n🔮 Test 4: Making Predictions")
        
        test_input = np.random.randn(10)
        prediction = await learner.predict(test_input)
        
        print(f"✅ Prediction made:")
        print(f"  • Input shape: {test_input.shape}")
        print(f"  • Output shape: {prediction.shape}")
        print(f"  • Prediction: {prediction}")
        
        # Test 5: Overall evaluation
        print("\n📈 Test 5: Overall System Evaluation")
        
        # Create diverse evaluation data
        eval_data = []
        for i in range(20):
            exp = create_learning_experience(
                task_id=f"eval_{i}",
                input_data=np.random.randn(10),
                target_data=random.randint(0, 2)
            )
            exp.transfer_type = "vision" if i < 10 else "nlp"
            eval_data.append(exp)
        
        system_eval = await learner.evaluate(eval_data)
        
        print(f"✅ System evaluation completed:")
        for metric, value in system_eval.items():
            if isinstance(value, dict):
                print(f"  • {metric}: {len(value)} metrics")
            elif isinstance(value, (int, float)):
                print(f"  • {metric}: {value:.3f}")
        
        # Test 6: Statistics
        print("\n📊 Test 6: Transfer Learning Statistics")
        
        stats = learner.get_statistics()
        
        print(f"✅ Statistics:")
        print(f"  • Total transfers: {stats['total_transfers']}")
        print(f"  • Success rate: {stats['transfer_success_rate']:.3f}")
        print(f"  • Avg transfer time: {stats['avg_transfer_time']:.3f}s")
        print(f"  • Source models: {stats['num_source_models']}")
        print(f"  • Domain mappings: {stats['num_domain_mappings']}")
        print(f"  • Adaptation cache: {stats['adaptation_cache_size']}")
        
        # Test 7: Model persistence
        print("\n💾 Test 7: Model Persistence")
        
        save_path = "test_transfer_learner.pth"
        save_success = await learner.save_model(save_path)
        print(f"✅ Model save: {save_success}")
        
        if save_success:
            load_success = await learner.load_model(save_path)
            print(f"✅ Model load: {load_success}")
            
            # Cleanup
            import os
            try:
                os.remove(save_path)
            except:
                pass
        
        print("\n🎉 Transfer Learner test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Transfer Learner test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Transfer Learner module loaded - Advanced transfer learning ready!")

if __name__ == "__main__":
    import random
    asyncio.run(test_transfer_learner())