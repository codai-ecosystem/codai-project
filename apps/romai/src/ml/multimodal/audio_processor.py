"""
Audio Processing for Romanian Cultural Content
Advanced audio processing with Romanian speech and music analysis
"""

import torch
import torchaudio
import numpy as np
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
import librosa
import soundfile as sf
from scipy import signal
import whisper
from transformers import Wav2Vec2ForCTC, Wav2Vec2Tokenizer, pipeline
import matplotlib.pyplot as plt
import seaborn as sns

logger = logging.getLogger(__name__)

class AudioTaskType(Enum):
    """Types of audio processing tasks"""
    SPEECH_RECOGNITION = "speech_recognition"
    LANGUAGE_DETECTION = "language_detection"
    MUSIC_ANALYSIS = "music_analysis"
    FOLK_MUSIC_CLASSIFICATION = "folk_music_classification"
    SPEAKER_IDENTIFICATION = "speaker_identification"
    EMOTION_DETECTION = "emotion_detection"
    CULTURAL_AUDIO_ANALYSIS = "cultural_audio_analysis"
    DIALECT_DETECTION = "dialect_detection"

class RomanianAudioCategory(Enum):
    """Romanian audio content categories"""
    FOLK_MUSIC = "folk_music"
    TRADITIONAL_INSTRUMENTS = "traditional_instruments"
    ROMANIAN_SPEECH = "romanian_speech"
    REGIONAL_DIALECTS = "regional_dialects"
    RELIGIOUS_CHANTS = "religious_chants"
    CONTEMPORARY_ROMANIAN = "contemporary_romanian"
    CULTURAL_NARRATION = "cultural_narration"
    HISTORICAL_RECORDINGS = "historical_recordings"

class RomanianRegion(Enum):
    """Romanian regional dialects and styles"""
    MOLDOVIA = "moldavia"
    WALLACHIA = "wallachia"
    TRANSYLVANIA = "transylvania"
    DOBROGEA = "dobrogea"
    BANAT = "banat"
    BUCOVINA = "bucovina"
    MARAMURES = "maramures"
    OLTENIA = "oltenia"

@dataclass
class AudioResult:
    """Result from audio processing"""
    task_type: AudioTaskType
    confidence: float
    transcription: str = ""
    language_detected: str = ""
    
    # Romanian cultural analysis
    audio_category: Optional[RomanianAudioCategory] = None
    regional_style: Optional[RomanianRegion] = None
    cultural_significance: float = 0.0
    romanian_elements: List[str] = field(default_factory=list)
    
    # Music analysis
    tempo: Optional[float] = None
    key: Optional[str] = None
    instruments_detected: List[str] = field(default_factory=list)
    musical_features: Dict[str, float] = field(default_factory=dict)
    
    # Speech analysis
    speaker_characteristics: Dict[str, Any] = field(default_factory=dict)
    emotion_scores: Dict[str, float] = field(default_factory=dict)
    linguistic_features: Dict[str, Any] = field(default_factory=dict)
    
    # Technical metadata
    sample_rate: int = 0
    duration: float = 0.0
    processing_time: float = 0.0
    model_used: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'task_type': self.task_type.value,
            'confidence': self.confidence,
            'transcription': self.transcription,
            'language_detected': self.language_detected,
            'audio_category': self.audio_category.value if self.audio_category else None,
            'regional_style': self.regional_style.value if self.regional_style else None,
            'cultural_significance': self.cultural_significance,
            'romanian_elements': self.romanian_elements,
            'tempo': self.tempo,
            'key': self.key,
            'instruments_detected': self.instruments_detected,
            'musical_features': self.musical_features,
            'speaker_characteristics': self.speaker_characteristics,
            'emotion_scores': self.emotion_scores,
            'linguistic_features': self.linguistic_features,
            'sample_rate': self.sample_rate,
            'duration': self.duration,
            'processing_time': self.processing_time,
            'model_used': self.model_used
        }

class RomanianSpeechRecognizer:
    """Romanian speech recognition and analysis"""
    
    def __init__(self):
        # Romanian phonetic patterns
        self.romanian_phonemes = {
            'ă': {'frequency': 0.12, 'region_variants': {'moldavia': 'ə', 'transylvania': 'a'}},
            'â': {'frequency': 0.08, 'region_variants': {'wallachia': 'ɨ', 'transylvania': 'ɨ'}},
            'î': {'frequency': 0.06, 'region_variants': {'moldavia': 'ɨ', 'banat': 'i'}},
            'ș': {'frequency': 0.04, 'region_variants': {'maramures': 'ʃ', 'dobrogea': 's'}},
            'ț': {'frequency': 0.03, 'region_variants': {'oltenia': 'ts', 'bucovina': 'tʃ'}}
        }
        
        # Regional vocabulary markers
        self.regional_markers = {
            RomanianRegion.MOLDOVIA: ['zău', 'măi', 'păi', 'numa', 'numai'],
            RomanianRegion.TRANSYLVANIA: ['poate', 'zice', 'merge', 'face', 'foarte'],
            RomanianRegion.WALLACHIA: ['mă', 'bă', 'frate', 'să-ți', 'dă-i'],
            RomanianRegion.BANAT: ['bre', 'măi', 'vai', 'haide', 'gata'],
            RomanianRegion.MARAMURES: ['bade', 'măi', 'nu-i', 'să-ți', 'cum'],
            RomanianRegion.OLTENIA: ['măi', 'bă', 'lasă', 'hai', 'gata'],
            RomanianRegion.BUCOVINA: ['apoi', 'măi', 'să', 'nu', 'da'],
            RomanianRegion.DOBROGEA: ['măi', 'bă', 'gata', 'hai', 'să']
        }
        
        # Initialize speech recognition models
        self._init_speech_models()
    
    def _init_speech_models(self):
        """Initialize speech recognition models"""
        
        try:
            # Load Whisper for general speech recognition
            self.whisper_model = whisper.load_model("base")
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.warning(f"Whisper model loading failed: {str(e)}")
            self.whisper_model = None
        
        try:
            # Load Wav2Vec2 for detailed phonetic analysis
            self.wav2vec_model = Wav2Vec2ForCTC.from_pretrained("jonatasgrosman/wav2vec2-large-xlsr-53-english")
            self.wav2vec_tokenizer = Wav2Vec2Tokenizer.from_pretrained("jonatasgrosman/wav2vec2-large-xlsr-53-english")
            logger.info("Wav2Vec2 model loaded successfully")
        except Exception as e:
            logger.warning(f"Wav2Vec2 model loading failed: {str(e)}")
            self.wav2vec_model = None
            self.wav2vec_tokenizer = None
    
    def recognize_speech(self, audio: np.ndarray, sample_rate: int) -> Tuple[str, float]:
        """Recognize Romanian speech from audio"""
        
        if self.whisper_model:
            try:
                # Ensure audio is float32 and normalized
                audio_float = audio.astype(np.float32)
                if np.max(np.abs(audio_float)) > 1.0:
                    audio_float = audio_float / np.max(np.abs(audio_float))
                
                # Whisper expects 16kHz audio
                if sample_rate != 16000:
                    audio_resampled = librosa.resample(audio_float, orig_sr=sample_rate, target_sr=16000)
                else:
                    audio_resampled = audio_float
                
                # Transcribe
                result = self.whisper_model.transcribe(audio_resampled, language='ro')
                transcription = result['text'].strip()
                
                # Calculate confidence (simplified)
                confidence = min(len(transcription) / 100, 1.0)  # Longer text = higher confidence
                
                return transcription, confidence
                
            except Exception as e:
                logger.error(f"Speech recognition error: {str(e)}")
                return "", 0.0
        else:
            return "Speech recognition model not available", 0.0
    
    def detect_dialect(self, transcription: str) -> Tuple[Optional[RomanianRegion], float]:
        """Detect Romanian regional dialect from transcription"""
        
        if not transcription:
            return None, 0.0
        
        text_lower = transcription.lower()
        region_scores = {}
        
        # Score each region based on marker words
        for region, markers in self.regional_markers.items():
            score = 0
            for marker in markers:
                count = text_lower.count(marker)
                score += count
            
            # Normalize by text length
            normalized_score = score / max(len(text_lower.split()), 1)
            region_scores[region] = normalized_score
        
        if not region_scores or max(region_scores.values()) == 0:
            return None, 0.0
        
        best_region = max(region_scores, key=region_scores.get)
        confidence = min(region_scores[best_region] * 10, 1.0)  # Scale confidence
        
        return best_region, confidence
    
    def analyze_phonetic_features(self, audio: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """Analyze Romanian phonetic features"""
        
        # Extract MFCCs for phonetic analysis
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
        
        # Calculate statistical features
        features = {
            'mfcc_mean': np.mean(mfccs),
            'mfcc_std': np.std(mfccs),
            'spectral_centroid': np.mean(librosa.feature.spectral_centroid(y=audio, sr=sample_rate)),
            'spectral_rolloff': np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sample_rate)),
            'zero_crossing_rate': np.mean(librosa.feature.zero_crossing_rate(audio)),
            'tempo': librosa.feature.tempo(y=audio, sr=sample_rate)[0] if len(audio) > sample_rate else 0
        }
        
        return features
    
    def extract_linguistic_features(self, transcription: str) -> Dict[str, Any]:
        """Extract linguistic features from Romanian text"""
        
        if not transcription:
            return {}
        
        words = transcription.lower().split()
        
        # Count Romanian-specific characters
        diacritics_count = sum(transcription.count(char) for char in 'ăâîșț')
        diacritics_ratio = diacritics_count / max(len(transcription), 1)
        
        # Analyze word patterns
        long_words = sum(1 for word in words if len(word) > 7)
        avg_word_length = np.mean([len(word) for word in words]) if words else 0
        
        # Romanian linguistic features
        features = {
            'word_count': len(words),
            'avg_word_length': avg_word_length,
            'long_words_ratio': long_words / max(len(words), 1),
            'diacritics_ratio': diacritics_ratio,
            'sentence_complexity': transcription.count(',') + transcription.count(';'),
            'question_marks': transcription.count('?'),
            'exclamations': transcription.count('!')
        }
        
        return features

class RomanianMusicAnalyzer:
    """Analyze Romanian folk music and traditional instruments"""
    
    def __init__(self):
        # Traditional Romanian instruments and their characteristics
        self.traditional_instruments = {
            'nai': {  # Pan flute
                'frequency_range': (200, 2000),
                'characteristics': ['breathy', 'melodic', 'expressive'],
                'cultural_significance': 0.95
            },
            'cimpoi': {  # Bagpipe
                'frequency_range': (100, 1500),
                'characteristics': ['continuous_drone', 'melodic_overlay', 'rhythmic'],
                'cultural_significance': 0.90
            },
            'cobza': {  # Traditional lute
                'frequency_range': (80, 1000),
                'characteristics': ['plucked', 'resonant', 'harmonic'],
                'cultural_significance': 0.85
            },
            'fluier': {  # Wooden flute
                'frequency_range': (300, 3000),
                'characteristics': ['clear_tone', 'melodic', 'piercing'],
                'cultural_significance': 0.80
            },
            'taragot': {  # Wooden clarinet
                'frequency_range': (150, 2500),
                'characteristics': ['reed', 'expressive', 'dynamic'],
                'cultural_significance': 0.88
            }
        }
        
        # Romanian folk music patterns
        self.folk_patterns = {
            'doina': {
                'tempo_range': (60, 90),
                'characteristics': ['melancholic', 'free_rhythm', 'ornamental'],
                'cultural_context': 'emotional expression'
            },
            'hora': {
                'tempo_range': (120, 150),
                'characteristics': ['circular_dance', 'regular_rhythm', 'communal'],
                'cultural_context': 'social celebration'
            },
            'sarba': {
                'tempo_range': (140, 180),
                'characteristics': ['fast_dance', 'energetic', 'syncopated'],
                'cultural_context': 'festive occasions'
            },
            'brau': {
                'tempo_range': (100, 130),
                'characteristics': ['line_dance', 'steady_rhythm', 'traditional'],
                'cultural_context': 'community gathering'
            }
        }
    
    def analyze_music(self, audio: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """Comprehensive Romanian music analysis"""
        
        # Extract basic musical features
        tempo, beats = librosa.beat.beat_track(y=audio, sr=sample_rate)
        
        # Harmonic and percussive separation
        harmonic, percussive = librosa.effects.hpss(audio)
        
        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sample_rate)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sample_rate)
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=audio, sr=sample_rate)
        
        # Rhythm analysis
        onset_frames = librosa.onset.onset_detect(y=audio, sr=sample_rate)
        rhythm_pattern = self._analyze_rhythm_pattern(onset_frames, sample_rate)
        
        # Key detection (simplified)
        key = self._detect_key(chroma)
        
        analysis = {
            'tempo': float(tempo),
            'key': key,
            'rhythm_pattern': rhythm_pattern,
            'spectral_features': {
                'centroid_mean': np.mean(spectral_centroids),
                'centroid_std': np.std(spectral_centroids),
                'rolloff_mean': np.mean(spectral_rolloff),
                'mfcc_features': np.mean(mfccs, axis=1).tolist()
            },
            'harmonic_content': np.mean(harmonic**2) / np.mean(audio**2),
            'percussive_content': np.mean(percussive**2) / np.mean(audio**2)
        }
        
        return analysis
    
    def classify_folk_style(self, music_analysis: Dict[str, Any]) -> Tuple[str, float]:
        """Classify Romanian folk music style"""
        
        tempo = music_analysis.get('tempo', 120)
        rhythm_pattern = music_analysis.get('rhythm_pattern', {})
        
        style_scores = {}
        
        for style, characteristics in self.folk_patterns.items():
            score = 0.0
            
            # Tempo matching
            tempo_min, tempo_max = characteristics['tempo_range']
            if tempo_min <= tempo <= tempo_max:
                score += 0.4
            else:
                # Penalty for tempo mismatch
                tempo_diff = min(abs(tempo - tempo_min), abs(tempo - tempo_max))
                score += max(0, 0.4 - tempo_diff / 100)
            
            # Rhythm pattern matching (simplified)
            if rhythm_pattern.get('regularity', 0) > 0.7 and style in ['hora', 'brau']:
                score += 0.3
            elif rhythm_pattern.get('irregularity', 0) > 0.6 and style == 'doina':
                score += 0.3
            
            # Additional characteristics (placeholder scoring)
            score += await self._get_neural_scaled_value(context, scale_factor)  # Would be replaced with actual analysis
            
            style_scores[style] = score
        
        if not style_scores:
            return "unknown", 0.0
        
        best_style = max(style_scores, key=style_scores.get)
        confidence = min(style_scores[best_style], 1.0)
        
        return best_style, confidence
    
    def detect_instruments(self, audio: np.ndarray, sample_rate: int) -> List[Tuple[str, float]]:
        """Detect traditional Romanian instruments"""
        
        # Frequency domain analysis
        fft = np.fft.fft(audio)
        frequencies = np.fft.fftfreq(len(fft), 1/sample_rate)
        magnitude = np.abs(fft)
        
        # Find dominant frequency ranges
        dominant_freqs = []
        for i in range(1, len(magnitude)-1):
            if magnitude[i] > magnitude[i-1] and magnitude[i] > magnitude[i+1]:
                if magnitude[i] > np.max(magnitude) * 0.1:  # Significant peak
                    dominant_freqs.append(abs(frequencies[i]))
        
        # Match with instrument frequency ranges
        detected_instruments = []
        
        for instrument, info in self.traditional_instruments.items():
            freq_min, freq_max = info['frequency_range']
            
            # Check if dominant frequencies fall in instrument range
            matches = sum(1 for freq in dominant_freqs if freq_min <= freq <= freq_max)
            
            if matches > 0:
                confidence = min(matches / len(dominant_freqs), 1.0)
                detected_instruments.append((instrument, confidence))
        
        # Sort by confidence
        detected_instruments.sort(key=lambda x: x[1], reverse=True)
        
        return detected_instruments[:3]  # Top 3 matches
    
    def _analyze_rhythm_pattern(self, onset_frames: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """Analyze rhythm patterns in music"""
        
        if len(onset_frames) < 2:
            return {'regularity': 0.0, 'complexity': 0.0}
        
        # Calculate inter-onset intervals
        intervals = np.diff(onset_frames) / sample_rate
        
        # Regularity measure
        interval_std = np.std(intervals)
        regularity = 1.0 / (1.0 + interval_std)  # Lower std = higher regularity
        
        # Complexity measure
        unique_intervals = len(np.unique(np.round(intervals, 1)))
        complexity = min(unique_intervals / len(intervals), 1.0)
        
        return {
            'regularity': regularity,
            'complexity': complexity,
            'avg_interval': np.mean(intervals),
            'rhythm_density': len(onset_frames) / (len(onset_frames) / sample_rate)
        }
    
    def _detect_key(self, chroma: np.ndarray) -> str:
        """Simple key detection from chroma features"""
        
        # Average chroma across time
        avg_chroma = np.mean(chroma, axis=1)
        
        # Major and minor key profiles (simplified)
        major_profile = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])
        minor_profile = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0])
        
        # Note names
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        best_correlation = -1
        best_key = "C major"
        
        # Test all major and minor keys
        for i in range(12):
            # Rotate profiles to test different keys
            major_rotated = np.roll(major_profile, i)
            minor_rotated = np.roll(minor_profile, i)
            
            # Calculate correlations
            major_corr = np.corrcoef(avg_chroma, major_rotated)[0, 1]
            minor_corr = np.corrcoef(avg_chroma, minor_rotated)[0, 1]
            
            if not np.isnan(major_corr) and major_corr > best_correlation:
                best_correlation = major_corr
                best_key = f"{notes[i]} major"
            
            if not np.isnan(minor_corr) and minor_corr > best_correlation:
                best_correlation = minor_corr
                best_key = f"{notes[i]} minor"
        
        return best_key

class RomanianAudioProcessor:
    """Main audio processing system for Romanian cultural content"""
    
    def __init__(self, model_cache_dir: str = "models/audio"):
        self.model_cache_dir = Path(model_cache_dir)
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.speech_recognizer = RomanianSpeechRecognizer()
        self.music_analyzer = RomanianMusicAnalyzer()
        
        # Thread pool for async processing
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        
        logger.info("Romanian audio processor initialized")
    
    def preprocess_audio(self, audio_input: Union[str, np.ndarray, torch.Tensor],
                        target_sample_rate: int = 16000) -> Tuple[np.ndarray, int]:
        """Preprocess audio for processing"""
        
        if isinstance(audio_input, str):
            # Load from file
            audio, sample_rate = librosa.load(audio_input, sr=target_sample_rate)
        elif isinstance(audio_input, torch.Tensor):
            # Convert tensor to numpy
            audio = audio_input.numpy()
            sample_rate = target_sample_rate  # Assume target sample rate
        else:
            # Already numpy array
            audio = audio_input
            sample_rate = target_sample_rate  # Assume target sample rate
        
        # Normalize audio
        if np.max(np.abs(audio)) > 0:
            audio = audio / np.max(np.abs(audio))
        
        # Resample if needed
        if sample_rate != target_sample_rate:
            audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=target_sample_rate)
            sample_rate = target_sample_rate
        
        return audio, sample_rate
    
    async def process_audio_async(self, audio_input: Union[str, np.ndarray, torch.Tensor],
                                 task_type: AudioTaskType) -> AudioResult:
        """Asynchronously process audio for Romanian cultural analysis"""
        
        loop = asyncio.get_event_loop()
        
        # Run processing in thread pool
        result = await loop.run_in_executor(
            self.thread_pool,
            self.process_audio,
            audio_input,
            task_type
        )
        
        return result
    
    def process_audio(self, audio_input: Union[str, np.ndarray, torch.Tensor],
                     task_type: AudioTaskType) -> AudioResult:
        """Process audio for Romanian cultural analysis"""
        
        start_time = time.time()
        
        # Preprocess audio
        audio, sample_rate = self.preprocess_audio(audio_input)
        duration = len(audio) / sample_rate
        
        # Initialize result
        result = AudioResult(
            task_type=task_type,
            confidence=0.0,
            sample_rate=sample_rate,
            duration=duration
        )
        
        try:
            # Process based on task type
            if task_type == AudioTaskType.SPEECH_RECOGNITION:
                result = self._process_speech_recognition(audio, sample_rate, result)
            
            elif task_type == AudioTaskType.LANGUAGE_DETECTION:
                result = self._process_language_detection(audio, sample_rate, result)
            
            elif task_type == AudioTaskType.MUSIC_ANALYSIS:
                result = self._process_music_analysis(audio, sample_rate, result)
            
            elif task_type == AudioTaskType.FOLK_MUSIC_CLASSIFICATION:
                result = self._process_folk_music_classification(audio, sample_rate, result)
            
            elif task_type == AudioTaskType.DIALECT_DETECTION:
                result = self._process_dialect_detection(audio, sample_rate, result)
            
            elif task_type == AudioTaskType.CULTURAL_AUDIO_ANALYSIS:
                result = self._process_cultural_audio_analysis(audio, sample_rate, result)
            
            else:
                result.confidence = 0.5
                result.transcription = "General audio processing"
            
            # Calculate cultural significance
            result.cultural_significance = self._calculate_cultural_significance(result)
            
        except Exception as e:
            logger.error(f"Audio processing error: {str(e)}")
            result.confidence = 0.0
        
        # Record processing time
        result.processing_time = time.time() - start_time
        result.model_used = "RomanianAudioProcessor"
        
        return result
    
    def _process_speech_recognition(self, audio: np.ndarray, sample_rate: int, 
                                   result: AudioResult) -> AudioResult:
        """Process speech recognition"""
        
        transcription, confidence = self.speech_recognizer.recognize_speech(audio, sample_rate)
        
        result.transcription = transcription
        result.confidence = confidence
        result.language_detected = "Romanian" if confidence > 0.5 else "Unknown"
        
        # Extract linguistic features
        if transcription:
            result.linguistic_features = self.speech_recognizer.extract_linguistic_features(transcription)
            result.audio_category = RomanianAudioCategory.ROMANIAN_SPEECH
        
        # Phonetic analysis
        phonetic_features = self.speech_recognizer.analyze_phonetic_features(audio, sample_rate)
        result.speaker_characteristics = phonetic_features
        
        return result
    
    def _process_language_detection(self, audio: np.ndarray, sample_rate: int,
                                   result: AudioResult) -> AudioResult:
        """Process language detection"""
        
        # First get transcription
        transcription, _ = self.speech_recognizer.recognize_speech(audio, sample_rate)
        
        # Simple Romanian language detection based on transcription
        if transcription:
            romanian_indicators = ['și', 'cu', 'de', 'la', 'în', 'pe', 'pentru', 'că', 'dar', 'sau']
            romanian_chars = 'ăâîșț'
            
            indicator_count = sum(transcription.lower().count(word) for word in romanian_indicators)
            diacritic_count = sum(transcription.count(char) for char in romanian_chars)
            
            # Calculate Romanian language probability
            total_words = len(transcription.split())
            romanian_score = (indicator_count + diacritic_count) / max(total_words, 1)
            
            if romanian_score > 0.3:
                result.language_detected = "Romanian"
                result.confidence = min(romanian_score, 1.0)
            else:
                result.language_detected = "Other"
                result.confidence = 1.0 - romanian_score
        else:
            result.language_detected = "Unknown"
            result.confidence = 0.0
        
        result.transcription = transcription
        
        return result
    
    def _process_music_analysis(self, audio: np.ndarray, sample_rate: int,
                               result: AudioResult) -> AudioResult:
        """Process music analysis"""
        
        music_analysis = self.music_analyzer.analyze_music(audio, sample_rate)
        
        result.tempo = music_analysis['tempo']
        result.key = music_analysis['key']
        result.musical_features = music_analysis['spectral_features']
        result.confidence = 0.8  # Music analysis confidence
        
        # Detect instruments
        detected_instruments = self.music_analyzer.detect_instruments(audio, sample_rate)
        result.instruments_detected = [instr for instr, conf in detected_instruments]
        
        # Classify as Romanian music if traditional instruments detected
        traditional_instruments = [instr for instr in result.instruments_detected 
                                 if instr in self.music_analyzer.traditional_instruments]
        
        if traditional_instruments:
            result.audio_category = RomanianAudioCategory.TRADITIONAL_INSTRUMENTS
            result.romanian_elements = traditional_instruments
        
        return result
    
    def _process_folk_music_classification(self, audio: np.ndarray, sample_rate: int,
                                          result: AudioResult) -> AudioResult:
        """Process folk music classification"""
        
        # First analyze music
        music_analysis = self.music_analyzer.analyze_music(audio, sample_rate)
        
        # Classify folk style
        folk_style, confidence = self.music_analyzer.classify_folk_style(music_analysis)
        
        result.confidence = confidence
        result.tempo = music_analysis['tempo']
        result.key = music_analysis['key']
        result.audio_category = RomanianAudioCategory.FOLK_MUSIC
        result.romanian_elements = [folk_style] if folk_style != "unknown" else []
        
        # Additional folk music metadata
        result.musical_features = {
            'folk_style': folk_style,
            'tempo': music_analysis['tempo'],
            'harmonic_content': music_analysis['harmonic_content'],
            'rhythmic_complexity': music_analysis.get('rhythm_pattern', {}).get('complexity', 0)
        }
        
        return result
    
    def _process_dialect_detection(self, audio: np.ndarray, sample_rate: int,
                                  result: AudioResult) -> AudioResult:
        """Process dialect detection"""
        
        # Get transcription
        transcription, transcription_confidence = self.speech_recognizer.recognize_speech(audio, sample_rate)
        
        if transcription:
            # Detect dialect
            dialect, dialect_confidence = self.speech_recognizer.detect_dialect(transcription)
            
            result.transcription = transcription
            result.confidence = min(transcription_confidence * dialect_confidence, 1.0)
            result.regional_style = dialect
            result.audio_category = RomanianAudioCategory.REGIONAL_DIALECTS
            result.language_detected = "Romanian"
            
            if dialect:
                result.romanian_elements = [f"{dialect.value}_dialect"]
        else:
            result.confidence = 0.0
        
        return result
    
    def _process_cultural_audio_analysis(self, audio: np.ndarray, sample_rate: int,
                                        result: AudioResult) -> AudioResult:
        """Process comprehensive cultural audio analysis"""
        
        # Combine speech and music analysis
        transcription, speech_conf = self.speech_recognizer.recognize_speech(audio, sample_rate)
        music_analysis = self.music_analyzer.analyze_music(audio, sample_rate)
        
        # Determine primary content type
        harmonic_content = music_analysis.get('harmonic_content', 0)
        
        if transcription and len(transcription.split()) > 5:
            # Primarily speech
            result.transcription = transcription
            result.confidence = speech_conf
            result.audio_category = RomanianAudioCategory.CULTURAL_NARRATION
            result.language_detected = "Romanian"
            
            # Extract cultural elements from speech
            cultural_keywords = ['istorie', 'tradiție', 'cultură', 'folclor', 'obicei', 
                               'poveste', 'legendă', 'mit', 'credință']
            
            text_lower = transcription.lower()
            cultural_elements = [keyword for keyword in cultural_keywords if keyword in text_lower]
            result.romanian_elements = cultural_elements
            
        elif harmonic_content > 0.3:
            # Primarily music
            result.audio_category = RomanianAudioCategory.FOLK_MUSIC
            result.tempo = music_analysis['tempo']
            result.key = music_analysis['key']
            result.confidence = 0.7
            
            # Detect traditional instruments
            detected_instruments = self.music_analyzer.detect_instruments(audio, sample_rate)
            result.instruments_detected = [instr for instr, conf in detected_instruments]
            result.romanian_elements = result.instruments_detected
        
        else:
            # Mixed or unclear content
            result.confidence = 0.5
            result.audio_category = RomanianAudioCategory.CONTEMPORARY_ROMANIAN
        
        return result
    
    def _calculate_cultural_significance(self, result: AudioResult) -> float:
        """Calculate cultural significance score"""
        
        significance = 0.0
        
        # Base significance from audio category
        if result.audio_category:
            category_weights = {
                RomanianAudioCategory.FOLK_MUSIC: 0.9,
                RomanianAudioCategory.TRADITIONAL_INSTRUMENTS: 0.85,
                RomanianAudioCategory.REGIONAL_DIALECTS: 0.8,
                RomanianAudioCategory.RELIGIOUS_CHANTS: 0.95,
                RomanianAudioCategory.CULTURAL_NARRATION: 0.75,
                RomanianAudioCategory.HISTORICAL_RECORDINGS: 1.0,
                RomanianAudioCategory.ROMANIAN_SPEECH: 0.6,
                RomanianAudioCategory.CONTEMPORARY_ROMANIAN: 0.4
            }
            significance += category_weights.get(result.audio_category, 0.5)
        
        # Boost from Romanian elements
        significance += len(result.romanian_elements) * 0.1
        
        # Boost from regional style
        if result.regional_style:
            significance += 0.2
        
        # Confidence factor
        significance *= result.confidence
        
        return min(significance, 1.0)
    
    def generate_cultural_report(self, result: AudioResult) -> Dict[str, Any]:
        """Generate comprehensive cultural analysis report"""
        
        report = {
            'audio_analysis': {
                'category': result.audio_category.value if result.audio_category else 'unknown',
                'cultural_significance': result.cultural_significance,
                'romanian_elements': result.romanian_elements,
                'regional_style': result.regional_style.value if result.regional_style else None,
                'language_detected': result.language_detected
            },
            'technical_analysis': {
                'duration': result.duration,
                'sample_rate': result.sample_rate,
                'processing_time': result.processing_time,
                'confidence': result.confidence
            },
            'content_analysis': {
                'transcription': result.transcription,
                'linguistic_features': result.linguistic_features,
                'musical_features': result.musical_features,
                'instruments_detected': result.instruments_detected
            },
            'recommendations': self._generate_recommendations(result)
        }
        
        return report
    
    def _generate_recommendations(self, result: AudioResult) -> List[str]:
        """Generate recommendations based on analysis"""
        
        recommendations = []
        
        if result.cultural_significance > 0.8:
            recommendations.append("High cultural value - consider archival preservation")
        
        if result.audio_category == RomanianAudioCategory.FOLK_MUSIC:
            recommendations.append("Folk music detected - suitable for cultural education")
            recommendations.append("Consider musicological analysis and documentation")
        
        if result.regional_style:
            recommendations.append(f"Regional dialect/style detected: {result.regional_style.value}")
            recommendations.append("Consider dialectological study")
        
        if len(result.romanian_elements) > 2:
            recommendations.append("Rich cultural content - suitable for cultural heritage projects")
        
        if result.confidence < 0.6:
            recommendations.append("Consider audio quality enhancement or expert review")
        
        return recommendations


# Testing and demonstration
if __name__ == "__main__":
    import time
from .real_confidence_system import get_confidence_system
    
    print("🎵 Romanian Audio Processing System Test")
    print("="*50)
    
    # Initialize audio processor
    audio_processor = RomanianAudioProcessor()
    
    print("\n🗣️ Testing Speech Recognition:")
    
    # Create test audio (simulated Romanian speech)
    duration = 3.0
    sample_rate = 16000
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Simulate speech-like audio with formants
    test_audio = (np.sin(2 * np.pi * 200 * t) * 0.3 +  # F0
                  np.sin(2 * np.pi * 800 * t) * 0.2 +   # F1
                  np.sin(2 * np.pi * 1200 * t) * 0.15)  # F2
    test_audio += np.random.normal(0, 0.05, len(test_audio))  # Add noise
    
    # Test speech recognition
    speech_result = audio_processor.process_audio(test_audio, AudioTaskType.SPEECH_RECOGNITION)
    
    print(f"   Duration: {speech_result.duration:.2f}s")
    print(f"   Confidence: {speech_result.confidence:.2f}")
    print(f"   Language: {speech_result.language_detected}")
    print(f"   Processing time: {speech_result.processing_time:.2f}s")
    print(f"   Cultural significance: {speech_result.cultural_significance:.2f}")
    
    print("\n🎼 Testing Music Analysis:")
    
    # Create test audio (simulated Romanian folk music)
    # Simulate hora rhythm (moderate tempo)
    tempo = 130  # BPM
    beat_freq = tempo / 60
    
    music_audio = np.zeros_like(t)
    for i, freq in enumerate([200, 300, 400]):  # Harmonic series
        music_audio += np.sin(2 * np.pi * freq * t) * (0.5 / (i + 1))
    
    # Add rhythmic pattern
    beat_pattern = np.sin(2 * np.pi * beat_freq * t) ** 2
    music_audio *= beat_pattern
    
    # Test music analysis
    music_result = audio_processor.process_audio(music_audio, AudioTaskType.MUSIC_ANALYSIS)
    
    print(f"   Tempo: {music_result.tempo:.1f} BPM")
    print(f"   Key: {music_result.key}")
    print(f"   Confidence: {music_result.confidence:.2f}")
    print(f"   Audio category: {music_result.audio_category}")
    print(f"   Instruments detected: {music_result.instruments_detected}")
    print(f"   Cultural significance: {music_result.cultural_significance:.2f}")
    
    print("\n🎭 Testing Folk Music Classification:")
    
    # Test folk music classification
    folk_result = audio_processor.process_audio(music_audio, AudioTaskType.FOLK_MUSIC_CLASSIFICATION)
    
    print(f"   Folk style confidence: {folk_result.confidence:.2f}")
    print(f"   Romanian elements: {folk_result.romanian_elements}")
    print(f"   Musical features: {len(folk_result.musical_features)} detected")
    
    print("\n🗺️ Testing Dialect Detection:")
    
    # Test dialect detection (with simulated speech)
    dialect_result = audio_processor.process_audio(test_audio, AudioTaskType.DIALECT_DETECTION)
    
    print(f"   Regional style: {dialect_result.regional_style}")
    print(f"   Confidence: {dialect_result.confidence:.2f}")
    print(f"   Romanian elements: {dialect_result.romanian_elements}")
    
    print("\n🏛️ Testing Cultural Audio Analysis:")
    
    # Test comprehensive cultural analysis
    cultural_result = audio_processor.process_audio(music_audio, AudioTaskType.CULTURAL_AUDIO_ANALYSIS)
    
    print(f"   Audio category: {cultural_result.audio_category}")
    print(f"   Cultural significance: {cultural_result.cultural_significance:.2f}")
    print(f"   Romanian elements: {len(cultural_result.romanian_elements)}")
    
    print("\n📊 Testing Cultural Report Generation:")
    
    # Generate comprehensive cultural report
    cultural_report = audio_processor.generate_cultural_report(cultural_result)
    
    print(f"   Audio category: {cultural_report['audio_analysis']['category']}")
    print(f"   Cultural significance: {cultural_report['audio_analysis']['cultural_significance']:.2f}")
    print(f"   Processing time: {cultural_report['technical_analysis']['processing_time']:.2f}s")
    print(f"   Recommendations: {len(cultural_report['recommendations'])}")
    
    for i, rec in enumerate(cultural_report['recommendations'][:3], 1):
        print(f"      {i}. {rec}")
    
    print("\n🔄 Testing Async Processing:")
    
    async def test_async_audio_processing():
        """Test async audio processing"""
        
        tasks = []
        task_types = [
            AudioTaskType.SPEECH_RECOGNITION,
            AudioTaskType.MUSIC_ANALYSIS,
            AudioTaskType.CULTURAL_AUDIO_ANALYSIS
        ]
        
        # Create multiple async tasks
        for task_type in task_types:
            task = audio_processor.process_audio_async(test_audio, task_type)
            tasks.append(task)
        
        # Wait for all tasks to complete
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        print(f"   Async processing completed in {total_time:.2f}s")
        print(f"   Tasks processed: {len(results)}")
        
        for i, result in enumerate(results):
            print(f"      Task {i+1}: {result.task_type.value} (confidence: {result.confidence:.2f})")
    
    # Run async test
    asyncio.run(test_async_audio_processing())
    
    print("\n✨ Romanian audio processing system testing completed!")
    print("Ready for multi-modal integration with vision and text processing")