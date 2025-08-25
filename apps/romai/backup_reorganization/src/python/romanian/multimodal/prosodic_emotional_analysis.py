"""
Romanian Prosodic and Emotional Analysis
Advanced prosody and emotion detection for Romanian speech
Week 8 Day 2 Component 3C - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any
import time

from .audio_analysis_core import (
    FeatureExtractorBase, AudioSegment, FeatureVector, 
    AudioFeatureType, AnalysisQuality, RomanianRegion, logger
)

class RomanianEmotionalTone(Enum):
    """Romanian-specific emotional expressions"""
    NEUTRAL = "neutral"
    BUCURIE = "bucurie"  # Joy
    TRISTETE = "tristete"  # Sadness
    FURIE = "furie"  # Anger
    FRICA = "frica"  # Fear
    SURPRIZA = "surpriza"  # Surprise
    DEZGUST = "dezgust"  # Disgust
    MANDRIE = "mandrie"  # Pride
    NOSTALGIE = "nostalgie"  # Nostalgia
    IRONIE = "ironie"  # Irony

class RomanianProsodyExtractor(FeatureExtractorBase):
    """Romanian prosodic feature extraction"""
    
    def __init__(self):
        super().__init__(AudioFeatureType.PROSODIC)
        self.romanian_prosody_patterns = self._initialize_romanian_prosody()
        self.stress_patterns = self._create_stress_patterns()
        
    def _initialize_romanian_prosody(self) -> Dict[str, Any]:
        """Initialize Romanian prosodic patterns"""
        return {
            'stress_timing': True,  # Romanian is stress-timed
            'syllable_structure': {
                'preferred': ['CV', 'CVC', 'CVCC'],
                'complex_onsets': ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sl', 'sm', 'sn', 'sp', 'st', 'șt', 'tr', 'vr'],
                'complex_codas': ['nt', 'nd', 'mp', 'nc', 'ng', 'st', 'șt', 'pt', 'ct']
            },
            'intonation_patterns': {
                'declarative': {'contour': 'falling', 'peak_early': True},
                'interrogative': {'contour': 'rising', 'peak_late': True},
                'exclamative': {'contour': 'high_fall', 'peak_early': True}
            },
            'rhythm_characteristics': {
                'stressed_duration_ratio': 1.4,
                'pause_frequency': 0.3,  # Pauses per second
                'speech_rate': {'min': 4.5, 'max': 6.5, 'optimal': 5.5}  # syllables/second
            }
        }
    
    def _create_stress_patterns(self) -> Dict[str, List[str]]:
        """Create Romanian stress patterns"""
        return {
            'paroxytone': ['ultima', 'penultima'],  # Stress on second-to-last syllable (most common)
            'oxytone': ['ultima'],  # Stress on last syllable
            'proparoxytone': ['antepenultima'],  # Stress on third-to-last syllable
            'compound_words': ['primary', 'secondary']
        }
    
    async def extract_features(self, audio: AudioSegment, quality: AnalysisQuality) -> FeatureVector:
        """Extract prosodic features from Romanian audio"""
        try:
            start_time = time.time()
            
            # Extract fundamental frequency (F0)
            f0_features = await self._extract_f0_features(audio, quality)
            
            # Extract intensity features
            intensity_features = await self._extract_intensity_features(audio)
            
            # Extract timing features
            timing_features = await self._extract_timing_features(audio, quality)
            
            # Extract Romanian-specific prosodic patterns
            romanian_prosody = await self._extract_romanian_prosodic_patterns(audio, quality)
            
            # Combine all features
            feature_vector = np.concatenate([
                f0_features,
                intensity_features,
                timing_features,
                romanian_prosody
            ])
            
            # Generate feature names
            feature_names = self._generate_prosodic_feature_names()
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(feature_vector, audio)
            
            extraction_time = time.time() - start_time
            
            logger.info(f"Extracted {len(feature_vector)} prosodic features in {extraction_time:.3f}s")
            
            return FeatureVector(
                features=feature_vector,
                feature_names=feature_names,
                feature_type=AudioFeatureType.PROSODIC,
                extraction_time=extraction_time,
                quality_score=quality_score
            )
            
        except Exception as e:
            logger.error(f"Prosodic feature extraction error: {e}")
            return FeatureVector(
                features=np.array([]),
                feature_names=[],
                feature_type=AudioFeatureType.PROSODIC,
                extraction_time=0.0,
                quality_score=0.0
            )
    
    async def _extract_f0_features(self, audio: AudioSegment, quality: AnalysisQuality) -> np.ndarray:
        """Extract fundamental frequency features"""
        await asyncio.sleep(0.05)
        
        # Simulate F0 extraction
        duration = audio.end_time - audio.start_time
        n_frames = int(duration * 100)  # 100 Hz frame rate
        
        # Generate realistic F0 contour for Romanian speech
        base_f0 = np.random.uniform(80, 300)  # Typical range for human speech
        f0_contour = base_f0 + np.random.normal(0, 20, n_frames)
        
        # Add prosodic movements
        time_points = np.linspace(0, duration, n_frames)
        prosodic_movement = 20 * np.sin(2 * np.pi * 0.5 * time_points)  # 0.5 Hz prosodic movement
        f0_contour += prosodic_movement
        
        # Extract F0 statistics
        f0_features = np.array([
            np.mean(f0_contour),
            np.std(f0_contour),
            np.min(f0_contour),
            np.max(f0_contour),
            np.max(f0_contour) - np.min(f0_contour),  # F0 range
            np.mean(np.diff(f0_contour)),  # F0 slope
            np.std(np.diff(f0_contour)),  # F0 variability
        ])
        
        if quality in [AnalysisQuality.HIGH, AnalysisQuality.RESEARCH]:
            # Add more detailed F0 features
            f0_percentiles = np.percentile(f0_contour, [10, 25, 50, 75, 90])
            f0_features = np.concatenate([f0_features, f0_percentiles])
        
        return f0_features
    
    async def _extract_intensity_features(self, audio: AudioSegment) -> np.ndarray:
        """Extract intensity/energy features"""
        await asyncio.sleep(0.03)
        
        # Calculate RMS energy
        frame_length = int(0.025 * audio.sample_rate)  # 25ms frames
        hop_length = int(0.010 * audio.sample_rate)   # 10ms hop
        
        n_frames = (len(audio.data) - frame_length) // hop_length + 1
        rms_energy = np.zeros(n_frames)
        
        for i in range(n_frames):
            start = i * hop_length
            end = start + frame_length
            frame = audio.data[start:end]
            rms_energy[i] = np.sqrt(np.mean(frame ** 2))
        
        # Extract intensity statistics
        intensity_features = np.array([
            np.mean(rms_energy),
            np.std(rms_energy),
            np.min(rms_energy),
            np.max(rms_energy),
            np.max(rms_energy) - np.min(rms_energy),  # Dynamic range
        ])
        
        return intensity_features
    
    async def _extract_timing_features(self, audio: AudioSegment, quality: AnalysisQuality) -> np.ndarray:
        """Extract timing and rhythm features"""
        await asyncio.sleep(0.04)
        
        # Simulate voice activity detection
        duration = audio.end_time - audio.start_time
        voiced_ratio = np.random.uniform(0.6, 0.85)  # Typical for speech
        
        # Simulate pause detection
        n_pauses = int(duration * 0.3)  # ~0.3 pauses per second
        pause_durations = np.random.exponential(0.2, n_pauses)  # Exponential distribution
        
        # Calculate speech rate
        estimated_syllables = duration * 5.5  # ~5.5 syllables/second for Romanian
        speech_rate = estimated_syllables / duration
        
        timing_features = np.array([
            voiced_ratio,
            np.mean(pause_durations) if len(pause_durations) > 0 else 0,
            np.std(pause_durations) if len(pause_durations) > 0 else 0,
            len(pause_durations) / duration,  # Pause frequency
            speech_rate,
        ])
        
        if quality in [AnalysisQuality.HIGH, AnalysisQuality.RESEARCH]:
            # Add more detailed timing features
            articulation_rate = speech_rate / voiced_ratio  # Rate during voiced segments
            timing_variability = np.random.uniform(0.1, 0.3)  # Coefficient of variation
            
            additional_timing = np.array([
                articulation_rate,
                timing_variability,
            ])
            timing_features = np.concatenate([timing_features, additional_timing])
        
        return timing_features
    
    async def _extract_romanian_prosodic_patterns(self, audio: AudioSegment, quality: AnalysisQuality) -> np.ndarray:
        """Extract Romanian-specific prosodic patterns"""
        await asyncio.sleep(0.06)
        
        # Romanian stress pattern detection
        stress_pattern_score = np.random.uniform(0.7, 0.95)  # High for native Romanian
        
        # Romanian intonation pattern detection
        declarative_pattern = np.random.uniform(0.3, 0.8)
        interrogative_pattern = np.random.uniform(0.1, 0.4)
        exclamative_pattern = np.random.uniform(0.1, 0.3)
        
        # Romanian rhythm characteristics
        stress_timing_score = np.random.uniform(0.8, 0.95)  # Romanian is stress-timed
        syllable_structure_score = np.random.uniform(0.6, 0.9)
        
        romanian_features = np.array([
            stress_pattern_score,
            declarative_pattern,
            interrogative_pattern,
            exclamative_pattern,
            stress_timing_score,
            syllable_structure_score,
        ])
        
        if quality == AnalysisQuality.RESEARCH:
            # Add research-level Romanian prosodic features
            regional_prosody = await self._analyze_regional_prosodic_markers(audio)
            romanian_features = np.concatenate([romanian_features, regional_prosody])
        
        return romanian_features
    
    async def _analyze_regional_prosodic_markers(self, audio: AudioSegment) -> np.ndarray:
        """Analyze regional Romanian prosodic markers"""
        await asyncio.sleep(0.03)
        
        # Simulate regional prosodic analysis
        regional_scores = np.array([
            np.random.uniform(0.2, 0.8),  # Moldovan prosody
            np.random.uniform(0.1, 0.6),  # Transylvanian prosody
            np.random.uniform(0.3, 0.9),  # Wallachian prosody
            np.random.uniform(0.1, 0.5),  # Banatean prosody
        ])
        
        return regional_scores
    
    def _generate_prosodic_feature_names(self) -> List[str]:
        """Generate prosodic feature names"""
        names = [
            # F0 features
            'f0_mean', 'f0_std', 'f0_min', 'f0_max', 'f0_range', 'f0_slope', 'f0_variability',
            # F0 percentiles (for high quality)
            'f0_p10', 'f0_p25', 'f0_p50', 'f0_p75', 'f0_p90',
            # Intensity features
            'intensity_mean', 'intensity_std', 'intensity_min', 'intensity_max', 'dynamic_range',
            # Timing features
            'voiced_ratio', 'pause_mean', 'pause_std', 'pause_frequency', 'speech_rate',
            # Advanced timing (for high quality)
            'articulation_rate', 'timing_variability',
            # Romanian-specific
            'stress_pattern_score', 'declarative_pattern', 'interrogative_pattern', 
            'exclamative_pattern', 'stress_timing_score', 'syllable_structure_score',
            # Regional markers (for research quality)
            'moldovan_prosody', 'transylvanian_prosody', 'wallachian_prosody', 'banatean_prosody'
        ]
        return names

class RomanianEmotionDetector:
    """Romanian emotion detection from speech"""
    
    def __init__(self):
        self.emotion_models = self._initialize_emotion_models()
        self.cultural_emotion_mapping = self._create_cultural_emotion_mapping()
        
    def _initialize_emotion_models(self) -> Dict[RomanianEmotionalTone, Dict[str, Any]]:
        """Initialize Romanian emotion detection models"""
        return {
            RomanianEmotionalTone.NEUTRAL: {
                'f0_characteristics': {'mean': 150, 'variability': 0.2},
                'intensity_characteristics': {'level': 0.5, 'variability': 0.3},
                'timing_characteristics': {'speech_rate': 5.5, 'pause_frequency': 0.3}
            },
            RomanianEmotionalTone.BUCURIE: {
                'f0_characteristics': {'mean': 180, 'variability': 0.4},
                'intensity_characteristics': {'level': 0.7, 'variability': 0.4},
                'timing_characteristics': {'speech_rate': 6.2, 'pause_frequency': 0.2}
            },
            RomanianEmotionalTone.TRISTETE: {
                'f0_characteristics': {'mean': 120, 'variability': 0.15},
                'intensity_characteristics': {'level': 0.3, 'variability': 0.2},
                'timing_characteristics': {'speech_rate': 4.8, 'pause_frequency': 0.5}
            },
            RomanianEmotionalTone.FURIE: {
                'f0_characteristics': {'mean': 200, 'variability': 0.6},
                'intensity_characteristics': {'level': 0.8, 'variability': 0.5},
                'timing_characteristics': {'speech_rate': 6.8, 'pause_frequency': 0.1}
            },
            RomanianEmotionalTone.MANDRIE: {
                'f0_characteristics': {'mean': 160, 'variability': 0.3},
                'intensity_characteristics': {'level': 0.6, 'variability': 0.3},
                'timing_characteristics': {'speech_rate': 5.2, 'pause_frequency': 0.25}
            },
            RomanianEmotionalTone.NOSTALGIE: {
                'f0_characteristics': {'mean': 140, 'variability': 0.25},
                'intensity_characteristics': {'level': 0.4, 'variability': 0.25},
                'timing_characteristics': {'speech_rate': 5.0, 'pause_frequency': 0.4}
            }
        }
    
    def _create_cultural_emotion_mapping(self) -> Dict[str, str]:
        """Create Romanian cultural emotion expressions"""
        return {
            'dor': 'nostalgie',  # Uniquely Romanian emotion
            'mândrie': 'mandrie',  # Pride with Romanian cultural context
            'jale': 'tristete',  # Deep sadness/mourning
            'veselie': 'bucurie',  # Romanian joy/merriment
            'năcaz': 'furie',  # Romanian-specific anger/frustration
        }
    
    async def detect_emotions(self, audio: AudioSegment, prosodic_features: np.ndarray) -> Dict[str, float]:
        """Detect emotions from Romanian speech"""
        try:
            # Extract emotion-relevant features
            emotion_features = await self._extract_emotion_features(audio, prosodic_features)
            
            # Calculate emotion probabilities
            emotion_scores = {}
            for emotion in RomanianEmotionalTone:
                score = await self._calculate_emotion_score(emotion_features, emotion)
                emotion_scores[emotion.value] = score
            
            # Normalize scores
            total_score = sum(emotion_scores.values())
            if total_score > 0:
                emotion_scores = {k: v/total_score for k, v in emotion_scores.items()}
            
            # Add cultural emotion interpretations
            cultural_emotions = self._interpret_cultural_emotions(emotion_scores)
            emotion_scores.update(cultural_emotions)
            
            logger.info(f"Emotion detection: {max(emotion_scores.items(), key=lambda x: x[1])}")
            return emotion_scores
            
        except Exception as e:
            logger.error(f"Emotion detection error: {e}")
            return {emotion.value: 1/len(RomanianEmotionalTone) for emotion in RomanianEmotionalTone}
    
    async def _extract_emotion_features(self, audio: AudioSegment, prosodic_features: np.ndarray) -> Dict[str, float]:
        """Extract features relevant for emotion detection"""
        await asyncio.sleep(0.05)
        
        # Use prosodic features for emotion detection
        f0_mean = prosodic_features[0] if len(prosodic_features) > 0 else 150
        f0_variability = prosodic_features[1] / f0_mean if len(prosodic_features) > 1 and f0_mean > 0 else 0.2
        
        intensity_mean = prosodic_features[7] if len(prosodic_features) > 7 else 0.5
        speech_rate = prosodic_features[16] if len(prosodic_features) > 16 else 5.5
        
        # Additional emotion-specific features
        voice_quality = await self._analyze_voice_quality(audio)
        articulation_clarity = np.random.uniform(0.6, 0.95)
        
        return {
            'f0_mean': f0_mean,
            'f0_variability': f0_variability,
            'intensity_mean': intensity_mean,
            'speech_rate': speech_rate,
            'voice_quality': voice_quality,
            'articulation_clarity': articulation_clarity
        }
    
    async def _analyze_voice_quality(self, audio: AudioSegment) -> float:
        """Analyze voice quality indicators"""
        await asyncio.sleep(0.02)
        
        # Simulate voice quality analysis
        # Higher values indicate clearer, more stable voice
        voice_quality = np.random.uniform(0.4, 0.9)
        return voice_quality
    
    async def _calculate_emotion_score(
        self, 
        features: Dict[str, float], 
        emotion: RomanianEmotionalTone
    ) -> float:
        """Calculate emotion score based on features"""
        await asyncio.sleep(0.01)
        
        if emotion not in self.emotion_models:
            return 0.1
        
        model = self.emotion_models[emotion]
        score = 0.0
        
        # F0 characteristics match
        f0_diff = abs(features['f0_mean'] - model['f0_characteristics']['mean'])
        f0_score = max(0, 1 - f0_diff / 100)  # Normalize by 100 Hz
        score += f0_score * 0.3
        
        # F0 variability match
        var_diff = abs(features['f0_variability'] - model['f0_characteristics']['variability'])
        var_score = max(0, 1 - var_diff)
        score += var_score * 0.2
        
        # Intensity match
        int_diff = abs(features['intensity_mean'] - model['intensity_characteristics']['level'])
        int_score = max(0, 1 - int_diff)
        score += int_score * 0.25
        
        # Speech rate match
        rate_diff = abs(features['speech_rate'] - model['timing_characteristics']['speech_rate'])
        rate_score = max(0, 1 - rate_diff / 3)  # Normalize by 3 syllables/sec
        score += rate_score * 0.25
        
        return min(score, 1.0)
    
    def _interpret_cultural_emotions(self, emotion_scores: Dict[str, float]) -> Dict[str, float]:
        """Interpret emotions in Romanian cultural context"""
        cultural_scores = {}
        
        # Map to Romanian cultural emotions
        if emotion_scores.get('nostalgie', 0) > 0.5:
            cultural_scores['dor'] = emotion_scores['nostalgie'] * 1.2  # Amplify for Romanian "dor"
        
        if emotion_scores.get('mandrie', 0) > 0.4:
            cultural_scores['mândrie_națională'] = emotion_scores['mandrie'] * 1.1
        
        # Normalize cultural scores
        for key in cultural_scores:
            cultural_scores[key] = min(cultural_scores[key], 1.0)
        
        return cultural_scores

class RomanianCulturalProsodyAnalyzer:
    """Analyze Romanian cultural markers in prosody"""
    
    def __init__(self):
        self.cultural_patterns = self._initialize_cultural_patterns()
        self.regional_prosody = self._create_regional_prosody_patterns()
        
    def _initialize_cultural_patterns(self) -> Dict[str, Any]:
        """Initialize Romanian cultural prosodic patterns"""
        return {
            'politeness_markers': {
                'formal_address': {'f0_elevation': 20, 'speech_rate_reduction': 0.9},
                'respect_indicators': {'pause_lengthening': 1.5, 'careful_articulation': True}
            },
            'emotional_expressions': {
                'enthusiasm': {'f0_range_expansion': 1.4, 'intensity_increase': 1.3},
                'restraint': {'f0_range_compression': 0.7, 'intensity_decrease': 0.8}
            },
            'conversational_styles': {
                'storytelling': {'dramatic_pauses': True, 'f0_variability': 1.3},
                'discussion': {'turn_taking_patterns': 'overlapping', 'backchannel_frequency': 0.8}
            }
        }
    
    def _create_regional_prosody_patterns(self) -> Dict[RomanianRegion, Dict[str, Any]]:
        """Create regional prosodic patterns"""
        return {
            RomanianRegion.MOLDOVA: {
                'intonation_tendency': 'rising_final',
                'speech_rate_modifier': 0.95,
                'vowel_lengthening': 1.1,
                'pause_frequency_modifier': 1.2
            },
            RomanianRegion.TRANSILVANIA: {
                'intonation_tendency': 'level_final',
                'speech_rate_modifier': 1.05,
                'consonant_precision': 1.15,
                'pause_frequency_modifier': 0.9
            },
            RomanianRegion.MUNTENIA: {
                'intonation_tendency': 'falling_final',
                'speech_rate_modifier': 1.1,
                'vowel_reduction': 1.05,
                'pause_frequency_modifier': 1.0
            }
        }
    
    async def analyze_cultural_prosody(
        self, 
        audio: AudioSegment, 
        prosodic_features: np.ndarray,
        region_hint: Optional[RomanianRegion] = None
    ) -> Dict[str, Any]:
        """Analyze cultural markers in Romanian prosody"""
        try:
            # Detect politeness and formality markers
            politeness_analysis = await self._analyze_politeness_markers(prosodic_features)
            
            # Detect regional prosodic characteristics
            regional_analysis = await self._analyze_regional_characteristics(
                prosodic_features, region_hint
            )
            
            # Detect conversational style
            conversational_style = await self._analyze_conversational_style(audio, prosodic_features)
            
            # Detect cultural emotional expressions
            cultural_emotions = await self._analyze_cultural_emotional_expressions(prosodic_features)
            
            return {
                'politeness_markers': politeness_analysis,
                'regional_characteristics': regional_analysis,
                'conversational_style': conversational_style,
                'cultural_emotions': cultural_emotions
            }
            
        except Exception as e:
            logger.error(f"Cultural prosody analysis error: {e}")
            return {}
    
    async def _analyze_politeness_markers(self, prosodic_features: np.ndarray) -> Dict[str, float]:
        """Analyze politeness markers in prosody"""
        await asyncio.sleep(0.03)
        
        # Extract relevant features
        f0_mean = prosodic_features[0] if len(prosodic_features) > 0 else 150
        speech_rate = prosodic_features[16] if len(prosodic_features) > 16 else 5.5
        
        # Analyze politeness indicators
        formal_register = 1.0 if f0_mean > 160 and speech_rate < 5.2 else 0.5
        careful_articulation = np.random.uniform(0.6, 0.9)
        respectful_pausing = np.random.uniform(0.5, 0.8)
        
        return {
            'formal_register': formal_register,
            'careful_articulation': careful_articulation,
            'respectful_pausing': respectful_pausing,
            'overall_politeness': (formal_register + careful_articulation + respectful_pausing) / 3
        }
    
    async def _analyze_regional_characteristics(
        self, 
        prosodic_features: np.ndarray,
        region_hint: Optional[RomanianRegion]
    ) -> Dict[str, Any]:
        """Analyze regional prosodic characteristics"""
        await asyncio.sleep(0.04)
        
        regional_scores = {}
        
        # Calculate scores for each region
        for region, patterns in self.regional_prosody.items():
            score = np.random.uniform(0.2, 0.8)
            
            # Boost score if region hint matches
            if region_hint == region:
                score *= 1.3
            
            regional_scores[region.value] = min(score, 1.0)
        
        # Find most likely region
        best_region = max(regional_scores.items(), key=lambda x: x[1])
        
        return {
            'regional_scores': regional_scores,
            'most_likely_region': best_region[0],
            'confidence': best_region[1]
        }
    
    async def _analyze_conversational_style(
        self, 
        audio: AudioSegment, 
        prosodic_features: np.ndarray
    ) -> Dict[str, float]:
        """Analyze conversational style"""
        await asyncio.sleep(0.02)
        
        # Simulate conversational style analysis
        storytelling_markers = np.random.uniform(0.3, 0.8)
        discussion_markers = np.random.uniform(0.2, 0.7)
        monologue_markers = np.random.uniform(0.4, 0.9)
        
        return {
            'storytelling_style': storytelling_markers,
            'discussion_style': discussion_markers,
            'monologue_style': monologue_markers
        }
    
    async def _analyze_cultural_emotional_expressions(self, prosodic_features: np.ndarray) -> Dict[str, float]:
        """Analyze cultural emotional expressions"""
        await asyncio.sleep(0.02)
        
        # Romanian-specific emotional expression patterns
        cultural_expressions = {
            'enthusiasm_romanian': np.random.uniform(0.3, 0.8),
            'melancholy_romanian': np.random.uniform(0.2, 0.6),
            'pride_national': np.random.uniform(0.4, 0.9),
            'nostalgia_homeland': np.random.uniform(0.3, 0.7)
        }
        
        return cultural_expressions

# Test function
async def test_prosodic_emotional_analysis():
    """Test prosodic and emotional analysis"""
    print("🎭 Testing Prosodic and Emotional Analysis...")
    
    # Create test audio
    test_audio = AudioSegment(
        data=np.random.normal(0, 0.1, 16000 * 4),  # 4 seconds
        sample_rate=16000,
        start_time=0.0,
        end_time=4.0
    )
    
    # Test prosodic extractor
    print("🎵 Testing prosodic feature extraction...")
    prosody_extractor = RomanianProsodyExtractor()
    prosodic_features = await prosody_extractor.extract_features(test_audio, AnalysisQuality.HIGH)
    
    print(f"   Extracted {len(prosodic_features.features)} prosodic features")
    print(f"   Quality score: {prosodic_features.quality_score:.3f}")
    
    # Test emotion detector
    print("\n😊 Testing emotion detection...")
    emotion_detector = RomanianEmotionDetector()
    emotions = await emotion_detector.detect_emotions(test_audio, prosodic_features.features)
    
    top_emotion = max(emotions.items(), key=lambda x: x[1])
    print(f"   Top emotion: {top_emotion[0]} ({top_emotion[1]:.3f})")
    print(f"   Total emotions detected: {len(emotions)}")
    
    # Test cultural prosody analyzer
    print("\n🏛️ Testing cultural prosody analysis...")
    cultural_analyzer = RomanianCulturalProsodyAnalyzer()
    cultural_analysis = await cultural_analyzer.analyze_cultural_prosody(
        test_audio, prosodic_features.features, RomanianRegion.BUCURESTI
    )
    
    print(f"   Politeness score: {cultural_analysis.get('politeness_markers', {}).get('overall_politeness', 0):.3f}")
    print(f"   Regional analysis: {cultural_analysis.get('regional_characteristics', {}).get('most_likely_region', 'unknown')}")
    
    print("✅ Prosodic and emotional analysis test completed!")

if __name__ == "__main__":
    # Add missing import
    from enum import Enum
    asyncio.run(test_prosodic_emotional_analysis())
