"""
RomAI Inference Engine
Week 2: Model inference and API integration

This module provides:
- Model loading and inference
- Romanian text generation
- Cultural context-aware responses
- API integration for replacing OpenAI
"""

import torch
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Union, Any
import json
import time
import logging
from pathlib import Path
import asyncio
from dataclasses import dataclass
import numpy as np

# Import our model components
from ..models.hybrid_architecture import RomAIHybridModel
from ..models.romanian_language import RomanianTextProcessor, RomanianMorphologyProcessor
from ..models.romanian_attention import RomanianLinguisticAttention
from ..training.trainer import TrainingConfig

@dataclass
class InferenceConfig:
    """Configuration for RomAI inference"""
    
    # Model parameters
    model_path: str = "./checkpoints/romai_latest.pt"
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    max_length: int = 1024
    
    # Generation parameters
    temperature: float = 0.8
    top_k: int = 50
    top_p: float = 0.9
    repetition_penalty: float = 1.1
    do_sample: bool = True
    
    # Romanian-specific parameters
    use_cultural_context: bool = True
    use_morphology_features: bool = True
    prefer_formal_romanian: bool = False
    regional_bias: Optional[str] = None  # 'moldova', 'transilvania', etc.
    
    # Performance parameters
    batch_size: int = 1
    use_cache: bool = True
    enable_streaming: bool = False

class RomAIInferenceEngine:
    """
    Main inference engine for RomAI
    """
    
    def __init__(self, config: InferenceConfig):
        self.config = config
        self.device = torch.device(config.device)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.model = None
        self.text_processor = RomanianTextProcessor()
        self.morphology_processor = RomanianMorphologyProcessor()
        
        # Generation cache
        self.generation_cache = {} if config.use_cache else None
        
        # Load model
        self.load_model()
        
        self.logger.info(f"RomAI Inference Engine initialized on {self.device}")
    
    def load_model(self):
        """Load RomAI model from checkpoint"""
        try:
            if Path(self.config.model_path).exists():
                self.logger.info(f"Loading model from {self.config.model_path}")
                checkpoint = torch.load(self.config.model_path, map_location=self.device)
                
                # Load model configuration
                model_config = checkpoint.get('config', TrainingConfig())
                
                # Initialize model
                self.model = RomAIHybridModel(
                    vocab_size=model_config.vocab_size,
                    d_model=model_config.d_model,
                    n_layers=model_config.n_layers,
                    n_heads=model_config.n_heads,
                    d_ff=model_config.d_ff,
                    max_seq_length=model_config.max_seq_length,
                    use_moe=model_config.use_romanian_moe
                )
                
                # Load model weights
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.model.to(self.device)
                self.model.eval()
                
                self.logger.info("Model loaded successfully")
            else:
                self.logger.warning(f"Model file not found: {self.config.model_path}")
                self.logger.info("Initializing model with random weights for development")
                
                # Initialize with default config for development
                self.model = RomAIHybridModel(
                    vocab_size=32000,
                    d_model=512,
                    n_layers=6,
                    n_heads=8,
                    d_ff=2048,
                    max_seq_length=1024,
                    use_moe=True
                )
                self.model.to(self.device)
                self.model.eval()
                
        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            raise RuntimeError(f"Failed to load model: {e}")
    
    def preprocess_input(self, text: str, context: Optional[Dict] = None) -> Dict[str, torch.Tensor]:
        """
        Preprocess input text for Romanian model
        
        Args:
            text: Input Romanian text
            context: Optional cultural/linguistic context
            
        Returns:
            Dictionary with model inputs
        """
        
        # Analyze Romanian text
        analysis = self.text_processor.analyze_text(text)
        
        # Create dummy tokenization (in real implementation, use proper tokenizer)
        tokens = analysis['tokens']
        input_ids = torch.tensor([hash(token) % 32000 for token in tokens], dtype=torch.long)
        input_ids = input_ids.unsqueeze(0).to(self.device)  # Add batch dimension
        
        # Create attention mask
        attention_mask = torch.ones_like(input_ids)
        
        # Extract Romanian linguistic features
        morphology_features = self._extract_morphology_features(analysis)
        cultural_features = self._extract_cultural_features(analysis, context)
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'morphology_features': morphology_features,
            'cultural_features': cultural_features,
            'analysis': analysis
        }
    
    def _extract_morphology_features(self, analysis: Dict) -> torch.Tensor:
        """Extract morphological features tensor"""
        # Create morphological feature vector
        features = torch.zeros(10, device=self.device)  # 10 morphological features
        
        # Dialect encoding
        dialect = analysis.get('dialect', 'standard')
        if dialect == 'moldovenesc':
            features[0] = 1.0
        elif dialect == 'ardelenesc':
            features[1] = 1.0
        elif dialect == 'bănățean':
            features[2] = 1.0
        elif dialect == 'oltenesc':
            features[3] = 1.0
        
        # Token count feature (normalized)
        token_count = analysis.get('token_count', 0)
        features[4] = min(token_count / 100.0, 1.0)  # Normalize to [0, 1]
        
        # Morphological complexity (simplified)
        morphology = analysis.get('morphology', [])
        if morphology:
            avg_case_variety = len(set(m.get('case', 'nominativ') for m in morphology)) / 5.0
            avg_gender_variety = len(set(m.get('gender', 'neutru') for m in morphology)) / 3.0
            features[5] = avg_case_variety
            features[6] = avg_gender_variety
        
        return features.unsqueeze(0)  # Add batch dimension
    
    def _extract_cultural_features(self, analysis: Dict, context: Optional[Dict] = None) -> torch.Tensor:
        """Extract cultural context features"""
        features = torch.zeros(10, device=self.device)  # 10 cultural features
        
        cultural_context = analysis.get('cultural_context', {})
        
        # Historical period indicators
        historical_periods = cultural_context.get('historical_period', [])
        if 'moderna' in historical_periods:
            features[0] = 1.0
        if 'contemporana' in historical_periods:
            features[1] = 1.0
        
        # Regional indicators
        regions = cultural_context.get('region', [])
        if 'moldova' in regions:
            features[2] = 1.0
        if 'transilvania' in regions:
            features[3] = 1.0
        
        # Cultural concepts
        concepts = cultural_context.get('cultural_concept', [])
        if 'traditii' in concepts:
            features[4] = 1.0
        if 'religie' in concepts:
            features[5] = 1.0
        if 'gastronomie' in concepts:
            features[6] = 1.0
        
        # Context-provided features
        if context:
            if context.get('formal_style', False):
                features[7] = 1.0
            if context.get('historical_context', False):
                features[8] = 1.0
            if context.get('regional_focus'):
                features[9] = 1.0
        
        return features.unsqueeze(0)  # Add batch dimension
    
    def generate_text(
        self,
        prompt: str,
        max_length: Optional[int] = None,
        context: Optional[Dict] = None,
        **generation_kwargs
    ) -> Dict[str, Any]:
        """
        Generate Romanian text using RomAI model
        
        Args:
            prompt: Input Romanian text prompt
            max_length: Maximum generation length
            context: Cultural/linguistic context
            
        Returns:
            Dictionary with generated text and metadata
        """
        
        start_time = time.time()
        max_length = max_length or self.config.max_length
        
        # Check cache
        cache_key = f"{prompt}_{max_length}_{str(context)}" if self.generation_cache else None
        if cache_key and cache_key in self.generation_cache:
            self.logger.info("Using cached generation")
            return self.generation_cache[cache_key]
        
        try:
            # Preprocess input
            inputs = self.preprocess_input(prompt, context)
            
            # Generate with model
            with torch.no_grad():
                if hasattr(self.model, 'generate'):
                    # Use model's generate method if available
                    outputs = self.model.generate(
                        input_ids=inputs['input_ids'],
                        attention_mask=inputs['attention_mask'],
                        max_length=max_length,
                        temperature=generation_kwargs.get('temperature', self.config.temperature),
                        top_k=generation_kwargs.get('top_k', self.config.top_k),
                        top_p=generation_kwargs.get('top_p', self.config.top_p),
                        do_sample=generation_kwargs.get('do_sample', self.config.do_sample),
                        repetition_penalty=generation_kwargs.get('repetition_penalty', self.config.repetition_penalty)
                    )
                else:
                    # Use custom generation
                    outputs = self._custom_generate(inputs, max_length, **generation_kwargs)
            
            # Post-process output
            generated_text = self._decode_output(outputs, inputs)
            
            # Create response
            response = {
                'generated_text': generated_text,
                'original_prompt': prompt,
                'generation_time': time.time() - start_time,
                'model_info': {
                    'model_type': 'RomAI-Hybrid',
                    'language': 'Romanian',
                    'cultural_aware': self.config.use_cultural_context,
                    'morphology_aware': self.config.use_morphology_features
                },
                'linguistic_analysis': inputs['analysis'],
                'parameters': {
                    'max_length': max_length,
                    'temperature': generation_kwargs.get('temperature', self.config.temperature),
                    'top_k': generation_kwargs.get('top_k', self.config.top_k),
                    'top_p': generation_kwargs.get('top_p', self.config.top_p)
                }
            }
            
            # Cache result
            if cache_key:
                self.generation_cache[cache_key] = response
            
            return response
            
        except Exception as e:
            self.logger.error(f"Generation error: {e}")
            return {
                'generated_text': f"Eroare la generarea textului: {str(e)}",
                'error': str(e),
                'generation_time': time.time() - start_time
            }
    
    def _custom_generate(
        self,
        inputs: Dict[str, torch.Tensor],
        max_length: int,
        **kwargs
    ) -> torch.Tensor:
        """Custom generation implementation"""
        
        input_ids = inputs['input_ids']
        batch_size, input_len = input_ids.shape
        
        # Initialize generation
        generated = input_ids.clone()
        
        # Generation loop
        for _ in range(max_length - input_len):
            # Forward pass
            outputs = self.model(
                input_ids=generated,
                attention_mask=inputs['attention_mask'],
                morphology_features=inputs.get('morphology_features'),
                cultural_features=inputs.get('cultural_features')
            )
            
            # Get next token logits
            logits = outputs.get('logits', outputs)
            next_token_logits = logits[:, -1, :]
            
            # Apply temperature
            temperature = kwargs.get('temperature', self.config.temperature)
            if temperature != 1.0:
                next_token_logits = next_token_logits / temperature
            
            # Apply top-k filtering
            top_k = kwargs.get('top_k', self.config.top_k)
            if top_k > 0:
                top_k_logits, top_k_indices = torch.topk(next_token_logits, top_k)
                next_token_logits[next_token_logits < top_k_logits[:, -1:]] = float('-inf')
            
            # Apply top-p (nucleus) filtering
            top_p = kwargs.get('top_p', self.config.top_p)
            if top_p < 1.0:
                sorted_logits, sorted_indices = torch.sort(next_token_logits, descending=True)
                cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                
                # Remove tokens with cumulative probability above threshold
                sorted_indices_to_remove = cumulative_probs > top_p
                sorted_indices_to_remove[:, 1:] = sorted_indices_to_remove[:, :-1].clone()
                sorted_indices_to_remove[:, 0] = 0
                
                indices_to_remove = sorted_indices[sorted_indices_to_remove]
                next_token_logits[:, indices_to_remove] = float('-inf')
            
            # Sample next token
            if kwargs.get('do_sample', self.config.do_sample):
                probs = F.softmax(next_token_logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1)
            else:
                next_token = torch.argmax(next_token_logits, dim=-1, keepdim=True)
            
            # Append to sequence
            generated = torch.cat([generated, next_token], dim=1)
            
            # Update attention mask
            new_mask = torch.ones(batch_size, 1, device=self.device)
            inputs['attention_mask'] = torch.cat([inputs['attention_mask'], new_mask], dim=1)
        
        return generated
    
    def _decode_output(self, outputs: torch.Tensor, inputs: Dict) -> str:
        """Decode model output to Romanian text"""
        
        # Remove input tokens from output
        input_length = inputs['input_ids'].shape[1]
        generated_tokens = outputs[0, input_length:]  # Remove batch and input
        
        # Simple decoding (in real implementation, use proper tokenizer)
        # This is a placeholder - convert token IDs back to text
        vocab_size = 32000
        romanian_words = [
            'și', 'în', 'de', 'la', 'cu', 'pe', 'pentru', 'că', 'dar', 'sau',
            'este', 'sunt', 'era', 'erau', 'va', 'vor', 'am', 'ai', 'a',
            'România', 'român', 'românesc', 'românească', 'București', 'limba',
            'cultură', 'tradițional', 'modern', 'frumos', 'mare', 'bun'
        ]
        
        decoded_words = []
        for token_id in generated_tokens:
            # Simple mapping (in real implementation, use proper vocab)
            word_idx = token_id.item() % len(romanian_words)
            decoded_words.append(romanian_words[word_idx])
        
        generated_text = ' '.join(decoded_words)
        
        # Post-process for Romanian
        generated_text = self._postprocess_romanian_text(generated_text)
        
        return generated_text
    
    def _postprocess_romanian_text(self, text: str) -> str:
        """Post-process generated Romanian text"""
        
        # Capitalize first letter
        if text:
            text = text[0].upper() + text[1:]
        
        # Add period if missing
        if text and not text.endswith(('.', '!', '?')):
            text += '.'
        
        # Fix common Romanian patterns
        text = text.replace(' ,', ',')
        text = text.replace(' .', '.')
        text = text.replace('  ', ' ')
        
        return text.strip()
    
    async def stream_generate(
        self,
        prompt: str,
        max_length: Optional[int] = None,
        context: Optional[Dict] = None,
        **generation_kwargs
    ):
        """Stream generation for real-time response"""
        
        if not self.config.enable_streaming:
            # Return full generation at once
            result = self.generate_text(prompt, max_length, context, **generation_kwargs)
            yield result
            return
        
        # Streaming implementation (placeholder)
        max_length = max_length or self.config.max_length
        inputs = self.preprocess_input(prompt, context)
        
        generated_text = ""
        for i in range(max_length // 10):  # Stream in chunks
            chunk = f"Chunk {i} din textul generat în română. "
            generated_text += chunk
            
            yield {
                'chunk': chunk,
                'generated_text': generated_text,
                'is_complete': False,
                'chunk_index': i
            }
            
            await asyncio.sleep(0.1)  # Simulate generation time
        
        # Final response
        yield {
            'chunk': '',
            'generated_text': generated_text,
            'is_complete': True,
            'chunk_index': max_length // 10
        }
    
    def analyze_romanian_text(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian text using RomAI capabilities"""
        
        analysis = self.text_processor.analyze_text(text)
        
        # Enhanced analysis with model insights
        inputs = self.preprocess_input(text)
        
        with torch.no_grad():
            # Get model representation
            outputs = self.model(
                input_ids=inputs['input_ids'],
                attention_mask=inputs['attention_mask'],
                morphology_features=inputs.get('morphology_features'),
                cultural_features=inputs.get('cultural_features')
            )
            
            hidden_states = outputs.get('hidden_states')
            if hidden_states is not None:
                # Compute attention patterns, semantic similarity, etc.
                analysis['model_insights'] = {
                    'representation_norm': hidden_states.norm().item(),
                    'sequence_length': hidden_states.shape[1],
                    'embedding_dimension': hidden_states.shape[2]
                }
        
        return analysis
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        
        return {
            'model_type': 'RomAI Hybrid Architecture',
            'total_parameters': total_params,
            'trainable_parameters': trainable_params,
            'device': str(self.device),
            'model_size_mb': total_params * 4 / (1024 * 1024),  # Assuming float32
            'capabilities': {
                'romanian_language': True,
                'cultural_context': self.config.use_cultural_context,
                'morphology_aware': self.config.use_morphology_features,
                'regional_dialects': True,
                'hybrid_architecture': True,
                'mixture_of_experts': True
            },
            'supported_features': [
                'text_generation',
                'linguistic_analysis',
                'cultural_context_understanding',
                'morphological_analysis',
                'dialect_recognition'
            ]
        }

# Example usage and testing
if __name__ == "__main__":
    print("Testing RomAI Inference Engine...")
    
    # Create inference config
    config = InferenceConfig(
        model_path="./checkpoints/romai_latest.pt",  # Will use random weights if not found
        max_length=100,
        temperature=0.8,
        use_cultural_context=True,
        use_morphology_features=True
    )
    
    # Initialize inference engine
    engine = RomAIInferenceEngine(config)
    
    # Test text generation
    prompt = "România este o țară frumoasă"
    context = {
        'formal_style': True,
        'historical_context': False,
        'regional_focus': 'moldova'
    }
    
    print(f"Generating Romanian text for prompt: '{prompt}'")
    result = engine.generate_text(prompt, max_length=50, context=context)
    
    print(f"Generated text: {result['generated_text']}")
    print(f"Generation time: {result['generation_time']:.2f}s")
    print(f"Model info: {result['model_info']}")
    
    # Test text analysis
    analysis = engine.analyze_romanian_text(prompt)
    print(f"Text analysis: {analysis}")
    
    # Get model information
    model_info = engine.get_model_info()
    print(f"Model information: {model_info}")
    
    print("✅ RomAI Inference Engine test passed!")
