"""
Romanian Text-to-Speech Synthesis Engine
Advanced TTS system with Romanian voice profiles and regional accents
Week 8 Day 2 Component 2 - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any
from dataclasses import dataclass
from enum import Enum
import json
from pathlib import Path
import time
import xml.etree.ElementTree as ET

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceProfile(Enum):
    """Romanian voice profiles"""
    MALE_STANDARD = "male_standard"
    FEMALE_STANDARD = "female_standard"
    MALE_YOUNG = "male_young"
    FEMALE_YOUNG = "female_young"
    MALE_ELDERLY = "male_elderly"
    FEMALE_ELDERLY = "female_elderly"
    CHILD = "child"

class RomanianAccent(Enum):
    """Romanian regional accents"""
    BUCURESTI = "bucuresti"
    MOLDOVA = "moldova"
    TRANSILVANIA = "transilvania"
    MUNTENIA = "muntenia"
    BANAT = "banat"
    DOBROGEA = "dobrogea"
    OLTENIA = "oltenia"

class EmotionalTone(Enum):
    """Emotional tones for Romanian speech"""
    NEUTRAL = "neutral"
    HAPPY = "happy"
    SAD = "sad"
    EXCITED = "excited"
    FORMAL = "formal"
    FRIENDLY = "friendly"
    AUTHORITATIVE = "authoritative"
    COMPASSIONATE = "compassionate"

class SpeechRate(Enum):
    """Speech rate options"""
    VERY_SLOW = "very_slow"
    SLOW = "slow"
    NORMAL = "normal" 
    FAST = "fast"
    VERY_FAST = "very_fast"

@dataclass
class VoiceCharacteristics:
    """Voice synthesis characteristics"""
    profile: VoiceProfile
    accent: RomanianAccent
    emotion: EmotionalTone
    pitch: float  # -1.0 to 1.0
    speed: float  # 0.5 to 2.0
    volume: float  # 0.0 to 1.0
    breathing: bool = True
    natural_pauses: bool = True

@dataclass
class AudioOutput:
    """Synthesized audio output"""
    audio_data: np.ndarray
    sample_rate: int
    duration: float
    voice_characteristics: VoiceCharacteristics
    phoneme_timing: List[Tuple[str, float, float]]  # (phoneme, start, end)
    word_timing: List[Tuple[str, float, float]]  # (word, start, end)

@dataclass
class TTSRequest:
    """Text-to-speech synthesis request"""
    text: str
    voice: VoiceCharacteristics
    ssml_enabled: bool = False
    output_format: str = "wav"
    quality: str = "high"
    enable_timing: bool = True

class RomanianPhoneticProcessor:
    """Romanian phonetic processing for TTS"""
    
    def __init__(self):
        self.phonetic_rules = self._initialize_phonetic_rules()
        self.stress_patterns = self._create_stress_patterns()
        self.pronunciation_dict = self._load_pronunciation_dictionary()
        
    def _initialize_phonetic_rules(self) -> Dict[str, str]:
        """Initialize Romanian phonetic transformation rules"""
        return {
            # Vowel rules
            'ă': 'ə',
            'â': 'ɨ',
            'î': 'ɨ',
            'a': 'a',
            'e': 'e',
            'i': 'i',
            'o': 'o',
            'u': 'u',
            
            # Consonant rules
            'ș': 'ʃ',
            'ț': 'ts',
            'j': 'ʒ',
            'ch': 'k',
            'gh': 'g',
            'ce': 'tʃe',
            'ci': 'tʃi',
            'ge': 'dʒe',
            'gi': 'dʒi',
        }
    
    def _create_stress_patterns(self) -> Dict[str, List[int]]:
        """Create Romanian stress patterns"""
        return {
            'monosyllabic': [0],
            'disyllabic': [1, 0],  # Usually stress on first syllable
            'trisyllabic': [1, 0, 0],
            'polysyllabic': [1, 0, 0, 0]  # Flexible stress
        }
    
    def _load_pronunciation_dictionary(self) -> Dict[str, str]:
        """Load Romanian pronunciation dictionary"""
        return {
            'România': 'ro.ˈmɨ.ni.a',
            'București': 'bu.ku.ˈreʃtʲ',
            'Cluj-Napoca': 'ˈkluʒ na.ˈpo.ka',
            'Timișoara': 'ti.mi.ˈʃo.a.ra',
            'Constanța': 'kon.ˈstan.tsa',
            'Iași': 'ˈjaʃʲ',
            'Craiova': 'kra.ˈjo.va',
            'Brașov': 'bra.ˈʃov',
            'Galați': 'ga.ˈlatsʲ',
            'Ploiești': 'plo.ˈjeʃtʲ',
            
            # Common words
            'mulțumesc': 'mul.tsu.ˈmesk',
            'vă rog': 'və ˈrog',
            'bună ziua': 'ˈbu.nə ˈzi.wa',
            'la revedere': 'la re.ve.ˈde.re',
            'cu plăcere': 'ku plə.ˈtʃe.re',
        }
    
    async def text_to_phonemes(self, text: str, accent: RomanianAccent) -> List[str]:
        """Convert Romanian text to phonemes"""
        try:
            # Normalize text
            normalized = self._normalize_text(text)
            
            # Split into words
            words = normalized.split()
            
            # Convert each word to phonemes
            phonemes = []
            for word in words:
                word_phonemes = await self._word_to_phonemes(word, accent)
                phonemes.extend(word_phonemes)
                phonemes.append('_')  # Word boundary
            
            # Apply accent-specific modifications
            phonemes = self._apply_accent_modifications(phonemes, accent)
            
            logger.info(f"Converted '{text}' to {len(phonemes)} phonemes")
            return phonemes
            
        except Exception as e:
            logger.error(f"Phonetic processing error: {e}")
            return []
    
    def _normalize_text(self, text: str) -> str:
        """Normalize Romanian text for processing"""
        # Handle abbreviations
        text = text.replace('str.', 'strada')
        text = text.replace('nr.', 'numărul')
        text = text.replace('etc.', 'etcetera')
        
        # Handle numbers (basic)
        number_map = {
            '1': 'unu', '2': 'doi', '3': 'trei', '4': 'patru', '5': 'cinci',
            '6': 'șase', '7': 'șapte', '8': 'opt', '9': 'nouă', '0': 'zero'
        }
        
        for num, word in number_map.items():
            text = text.replace(num, word)
        
        return text.lower()
    
    async def _word_to_phonemes(self, word: str, accent: RomanianAccent) -> List[str]:
        """Convert single word to phonemes"""
        await asyncio.sleep(0.001)  # Simulate processing time
        
        # Check pronunciation dictionary first
        if word in self.pronunciation_dict:
            return self.pronunciation_dict[word].split('.')
        
        # Apply phonetic rules
        phonetic = word
        for grapheme, phoneme in self.phonetic_rules.items():
            phonetic = phonetic.replace(grapheme, phoneme)
        
        # Split into phonemes (simplified)
        return list(phonetic)
    
    def _apply_accent_modifications(self, phonemes: List[str], accent: RomanianAccent) -> List[str]:
        """Apply regional accent modifications"""
        modified = phonemes.copy()
        
        if accent == RomanianAccent.MOLDOVA:
            # Moldovan accent characteristics
            modified = [p.replace('ɨ', 'i') for p in modified]  # î -> i tendency
            
        elif accent == RomanianAccent.TRANSILVANIA:
            # Transylvanian accent characteristics  
            modified = [p.replace('e', 'ɛ') for p in modified]  # More open e
            
        elif accent == RomanianAccent.BANAT:
            # Banatean accent characteristics
            modified = [p.replace('o', 'ɔ') for p in modified]  # More open o
            
        return modified

class RomanianProsodyEngine:
    """Romanian prosody and intonation engine"""
    
    def __init__(self):
        self.intonation_patterns = self._initialize_intonation_patterns()
        self.rhythm_patterns = self._create_rhythm_patterns()
        
    def _initialize_intonation_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize Romanian intonation patterns"""
        return {
            'declarative': {
                'pattern': 'falling',
                'peak_position': 0.7,
                'final_fall': 0.3
            },
            'interrogative': {
                'pattern': 'rising',
                'peak_position': 0.8,
                'final_rise': 0.4
            },
            'exclamative': {
                'pattern': 'high_fall',
                'peak_position': 0.2,
                'final_fall': 0.6
            },
            'imperative': {
                'pattern': 'level',
                'peak_position': 0.5,
                'final_fall': 0.2
            }
        }
    
    def _create_rhythm_patterns(self) -> Dict[str, Any]:
        """Create Romanian rhythm patterns"""
        return {
            'stress_timing': True,  # Romanian is stress-timed
            'syllable_duration_ratio': 1.5,  # Stressed vs unstressed
            'pause_duration': 0.2,  # Standard pause duration
            'breathing_interval': 8.0  # Breathing every 8 seconds
        }
    
    async def apply_prosody(
        self, 
        phonemes: List[str], 
        text: str, 
        emotion: EmotionalTone,
        voice: VoiceCharacteristics
    ) -> Dict[str, Any]:
        """Apply Romanian prosody to phonemes"""
        try:
            # Detect sentence type
            sentence_type = self._detect_sentence_type(text)
            
            # Generate pitch contour
            pitch_contour = self._generate_pitch_contour(phonemes, sentence_type, emotion)
            
            # Generate timing
            timing = self._generate_timing(phonemes, voice.speed)
            
            # Apply emotional modifications
            prosody = self._apply_emotional_prosody(pitch_contour, timing, emotion)
            
            # Add breathing and pauses
            if voice.breathing:
                prosody = self._add_breathing_pauses(prosody, text)
            
            logger.info(f"Applied prosody for {sentence_type} sentence with {emotion.value} emotion")
            return prosody
            
        except Exception as e:
            logger.error(f"Prosody application error: {e}")
            return {}
    
    def _detect_sentence_type(self, text: str) -> str:
        """Detect Romanian sentence type"""
        text = text.strip()
        
        if text.endswith('?'):
            return 'interrogative'
        elif text.endswith('!'):
            return 'exclamative'
        elif any(word in text.lower() for word in ['să', 'hai', 'fă', 'vino']):
            return 'imperative'
        else:
            return 'declarative'
    
    def _generate_pitch_contour(
        self, 
        phonemes: List[str], 
        sentence_type: str, 
        emotion: EmotionalTone
    ) -> List[float]:
        """Generate pitch contour for phonemes"""
        base_pattern = self.intonation_patterns[sentence_type]
        contour_length = len(phonemes)
        
        # Base pitch contour
        if base_pattern['pattern'] == 'falling':
            contour = np.linspace(1.0, 0.3, contour_length)
        elif base_pattern['pattern'] == 'rising':
            contour = np.linspace(0.5, 1.0, contour_length)
        elif base_pattern['pattern'] == 'high_fall':
            peak_pos = int(base_pattern['peak_position'] * contour_length)
            contour = np.concatenate([
                np.linspace(0.5, 1.2, peak_pos),
                np.linspace(1.2, 0.2, contour_length - peak_pos)
            ])
        else:  # level
            contour = np.full(contour_length, 0.7)
        
        # Apply emotional modifications
        emotion_factor = self._get_emotion_pitch_factor(emotion)
        contour = contour * emotion_factor
        
        return contour.tolist()
    
    def _get_emotion_pitch_factor(self, emotion: EmotionalTone) -> float:
        """Get pitch modification factor for emotions"""
        factors = {
            EmotionalTone.NEUTRAL: 1.0,
            EmotionalTone.HAPPY: 1.2,
            EmotionalTone.SAD: 0.8,
            EmotionalTone.EXCITED: 1.3,
            EmotionalTone.FORMAL: 0.9,
            EmotionalTone.FRIENDLY: 1.1,
            EmotionalTone.AUTHORITATIVE: 0.85,
            EmotionalTone.COMPASSIONATE: 0.95
        }
        return factors.get(emotion, 1.0)
    
    def _generate_timing(self, phonemes: List[str], speed: float) -> List[float]:
        """Generate timing for phonemes"""
        base_duration = 0.08  # 80ms per phoneme
        durations = []
        
        for phoneme in phonemes:
            if phoneme == '_':  # Word boundary
                duration = 0.05
            elif phoneme in ['a', 'e', 'i', 'o', 'u', 'ă', 'â', 'î']:  # Vowels
                duration = base_duration * 1.2
            else:  # Consonants
                duration = base_duration * 0.8
            
            # Apply speed modification
            duration = duration / speed
            durations.append(duration)
        
        return durations
    
    def _apply_emotional_prosody(
        self, 
        pitch_contour: List[float], 
        timing: List[float], 
        emotion: EmotionalTone
    ) -> Dict[str, Any]:
        """Apply emotional modifications to prosody"""
        # Speed modifications
        speed_factors = {
            EmotionalTone.EXCITED: 1.2,
            EmotionalTone.SAD: 0.8,
            EmotionalTone.FORMAL: 0.9,
            EmotionalTone.FRIENDLY: 1.05
        }
        
        speed_factor = speed_factors.get(emotion, 1.0)
        modified_timing = [t / speed_factor for t in timing]
        
        return {
            'pitch_contour': pitch_contour,
            'timing': modified_timing,
            'emotion': emotion.value,
            'speed_factor': speed_factor
        }
    
    def _add_breathing_pauses(self, prosody: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Add natural breathing pauses"""
        # Add pauses at punctuation
        pause_positions = []
        for i, char in enumerate(text):
            if char in ',.;:':
                pause_positions.append(i)
        
        prosody['pause_positions'] = pause_positions
        prosody['breathing_enabled'] = True
        
        return prosody

class RomanianVoiceSynthesizer:
    """Romanian voice synthesis engine"""
    
    def __init__(self):
        self.voice_models = self._initialize_voice_models()
        self.neural_vocoder = self._initialize_neural_vocoder()
        
    def _initialize_voice_models(self) -> Dict[VoiceProfile, Dict[str, Any]]:
        """Initialize voice synthesis models"""
        return {
            VoiceProfile.MALE_STANDARD: {
                'fundamental_frequency': 120,  # Hz
                'formant_frequencies': [730, 1090, 2440],
                'voice_quality': 'modal',
                'age_group': 'adult'
            },
            VoiceProfile.FEMALE_STANDARD: {
                'fundamental_frequency': 200,  # Hz
                'formant_frequencies': [850, 1200, 2800],
                'voice_quality': 'modal',
                'age_group': 'adult'
            },
            VoiceProfile.MALE_YOUNG: {
                'fundamental_frequency': 140,
                'formant_frequencies': [750, 1100, 2500],
                'voice_quality': 'bright',
                'age_group': 'young'
            },
            VoiceProfile.FEMALE_YOUNG: {
                'fundamental_frequency': 220,
                'formant_frequencies': [870, 1250, 2900],
                'voice_quality': 'bright',
                'age_group': 'young'
            },
            VoiceProfile.CHILD: {
                'fundamental_frequency': 280,
                'formant_frequencies': [1000, 1400, 3200],
                'voice_quality': 'breathy',
                'age_group': 'child'
            }
        }
    
    def _initialize_neural_vocoder(self) -> Dict[str, Any]:
        """Initialize neural vocoder for high-quality synthesis"""
        return {
            'model_type': 'WaveRNN',
            'sample_rate': 22050,
            'hop_length': 256,
            'mel_channels': 80
        }
    
    async def synthesize_speech(
        self, 
        phonemes: List[str], 
        prosody: Dict[str, Any],
        voice_chars: VoiceCharacteristics
    ) -> AudioOutput:
        """Synthesize Romanian speech from phonemes and prosody"""
        try:
            start_time = time.time()
            
            # Get voice model parameters
            voice_model = self.voice_models[voice_chars.profile]
            
            # Generate mel-spectrogram
            mel_spec = await self._generate_mel_spectrogram(
                phonemes, prosody, voice_model, voice_chars
            )
            
            # Apply neural vocoder
            audio_data = await self._neural_vocoder_synthesis(mel_spec)
            
            # Apply post-processing
            audio_data = self._apply_post_processing(audio_data, voice_chars)
            
            # Generate timing information
            phoneme_timing = self._generate_phoneme_timing(phonemes, prosody['timing'])
            word_timing = self._generate_word_timing(phonemes, prosody['timing'])
            
            synthesis_time = time.time() - start_time
            duration = len(audio_data) / self.neural_vocoder['sample_rate']
            
            logger.info(f"Synthesized {duration:.2f}s of speech in {synthesis_time:.3f}s")
            
            return AudioOutput(
                audio_data=audio_data,
                sample_rate=self.neural_vocoder['sample_rate'],
                duration=duration,
                voice_characteristics=voice_chars,
                phoneme_timing=phoneme_timing,
                word_timing=word_timing
            )
            
        except Exception as e:
            logger.error(f"Speech synthesis error: {e}")
            return AudioOutput(
                audio_data=np.array([]),
                sample_rate=22050,
                duration=0.0,
                voice_characteristics=voice_chars,
                phoneme_timing=[],
                word_timing=[]
            )
    
    async def _generate_mel_spectrogram(
        self, 
        phonemes: List[str], 
        prosody: Dict[str, Any],
        voice_model: Dict[str, Any],
        voice_chars: VoiceCharacteristics
    ) -> np.ndarray:
        """Generate mel-spectrogram from phonemes and prosody"""
        # Simulate mel-spectrogram generation
        await asyncio.sleep(0.1)
        
        total_frames = int(sum(prosody['timing']) * 100)  # 100 frames per second
        mel_channels = self.neural_vocoder['mel_channels']
        
        # Generate realistic mel-spectrogram
        mel_spec = np.random.rand(mel_channels, total_frames)
        
        # Apply pitch contour
        f0_track = np.interp(
            np.linspace(0, len(prosody['pitch_contour'])-1, total_frames),
            np.arange(len(prosody['pitch_contour'])),
            prosody['pitch_contour']
        )
        
        # Modify fundamental frequency based on voice characteristics
        base_f0 = voice_model['fundamental_frequency']
        f0_track = f0_track * base_f0 * (1 + voice_chars.pitch)
        
        return mel_spec
    
    async def _neural_vocoder_synthesis(self, mel_spec: np.ndarray) -> np.ndarray:
        """Convert mel-spectrogram to audio using neural vocoder"""
        # Simulate neural vocoder processing
        await asyncio.sleep(0.15)
        
        # Generate audio samples
        num_samples = mel_spec.shape[1] * self.neural_vocoder['hop_length']
        audio_data = np.random.normal(0, 0.1, num_samples)
        
        # Apply basic filtering to simulate vocoder output
        audio_data = np.convolve(audio_data, np.ones(10)/10, mode='same')
        
        return audio_data
    
    def _apply_post_processing(
        self, 
        audio_data: np.ndarray, 
        voice_chars: VoiceCharacteristics
    ) -> np.ndarray:
        """Apply post-processing to synthesized audio"""
        # Apply volume
        audio_data = audio_data * voice_chars.volume
        
        # Apply subtle accent-specific filtering
        if voice_chars.accent == RomanianAccent.TRANSILVANIA:
            # Slightly brighter sound
            audio_data = audio_data * 1.05
        elif voice_chars.accent == RomanianAccent.MOLDOVA:
            # Slightly softer sound
            audio_data = audio_data * 0.95
        
        # Normalize
        max_val = np.max(np.abs(audio_data))
        if max_val > 0:
            audio_data = audio_data / max_val * 0.95
        
        return audio_data
    
    def _generate_phoneme_timing(
        self, 
        phonemes: List[str], 
        durations: List[float]
    ) -> List[Tuple[str, float, float]]:
        """Generate phoneme timing information"""
        timing = []
        current_time = 0.0
        
        for phoneme, duration in zip(phonemes, durations):
            start_time = current_time
            end_time = current_time + duration
            timing.append((phoneme, start_time, end_time))
            current_time = end_time
        
        return timing
    
    def _generate_word_timing(
        self, 
        phonemes: List[str], 
        durations: List[float]
    ) -> List[Tuple[str, float, float]]:
        """Generate word timing information"""
        word_timing = []
        current_word = ""
        word_start = 0.0
        current_time = 0.0
        
        for phoneme, duration in zip(phonemes, durations):
            if phoneme == '_':  # Word boundary
                if current_word:
                    word_timing.append((current_word, word_start, current_time))
                    current_word = ""
                    word_start = current_time + duration
            else:
                if not current_word:
                    word_start = current_time
                current_word += phoneme
            
            current_time += duration
        
        # Add final word
        if current_word:
            word_timing.append((current_word, word_start, current_time))
        
        return word_timing

class RomanianTTSEngine:
    """Main Romanian Text-to-Speech Engine"""
    
    def __init__(self):
        self.phonetic_processor = RomanianPhoneticProcessor()
        self.prosody_engine = RomanianProsodyEngine()
        self.voice_synthesizer = RomanianVoiceSynthesizer()
        self.ssml_parser = self._initialize_ssml_parser()
        
    def _initialize_ssml_parser(self):
        """Initialize SSML parser for advanced speech control"""
        return {
            'supported_tags': ['speak', 'voice', 'prosody', 'break', 'emphasis', 'say-as'],
            'voice_attributes': ['name', 'gender', 'age', 'variant'],
            'prosody_attributes': ['rate', 'pitch', 'volume', 'contour']
        }
    
    async def synthesize_text(self, request: TTSRequest) -> AudioOutput:
        """Main text-to-speech synthesis method"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting Romanian TTS synthesis: '{request.text[:50]}...'")
            
            # Parse SSML if enabled
            text = request.text
            if request.ssml_enabled:
                text, voice_modifications = self._parse_ssml(request.text)
                request.voice = self._apply_ssml_modifications(request.voice, voice_modifications)
            
            # Convert text to phonemes
            phonemes = await self.phonetic_processor.text_to_phonemes(
                text, request.voice.accent
            )
            
            # Apply prosody
            prosody = await self.prosody_engine.apply_prosody(
                phonemes, text, request.voice.emotion, request.voice
            )
            
            # Synthesize speech
            audio_output = await self.voice_synthesizer.synthesize_speech(
                phonemes, prosody, request.voice
            )
            
            synthesis_time = time.time() - start_time
            logger.info(f"TTS synthesis completed in {synthesis_time:.3f}s")
            
            return audio_output
            
        except Exception as e:
            logger.error(f"TTS synthesis error: {e}")
            return AudioOutput(
                audio_data=np.array([]),
                sample_rate=22050,
                duration=0.0,
                voice_characteristics=request.voice,
                phoneme_timing=[],
                word_timing=[]
            )
    
    def _parse_ssml(self, ssml_text: str) -> Tuple[str, Dict[str, Any]]:
        """Parse SSML markup for advanced speech control"""
        try:
            # Basic SSML parsing (simplified)
            root = ET.fromstring(f"<root>{ssml_text}</root>")
            plain_text = ''.join(root.itertext())
            
            # Extract voice modifications
            modifications = {}
            for elem in root.iter():
                if elem.tag == 'prosody':
                    if 'rate' in elem.attrib:
                        modifications['speed'] = self._parse_rate(elem.attrib['rate'])
                    if 'pitch' in elem.attrib:
                        modifications['pitch'] = self._parse_pitch(elem.attrib['pitch'])
                    if 'volume' in elem.attrib:
                        modifications['volume'] = self._parse_volume(elem.attrib['volume'])
                
                elif elem.tag == 'voice':
                    if 'name' in elem.attrib:
                        modifications['voice_name'] = elem.attrib['name']
                    if 'gender' in elem.attrib:
                        modifications['gender'] = elem.attrib['gender']
            
            return plain_text, modifications
            
        except Exception as e:
            logger.warning(f"SSML parsing error: {e}")
            return ssml_text, {}
    
    def _parse_rate(self, rate_str: str) -> float:
        """Parse SSML rate attribute"""
        if rate_str.endswith('%'):
            return float(rate_str[:-1]) / 100.0
        elif rate_str in ['x-slow', 'slow', 'medium', 'fast', 'x-fast']:
            rate_map = {'x-slow': 0.5, 'slow': 0.75, 'medium': 1.0, 'fast': 1.25, 'x-fast': 1.5}
            return rate_map[rate_str]
        else:
            return float(rate_str)
    
    def _parse_pitch(self, pitch_str: str) -> float:
        """Parse SSML pitch attribute"""
        if pitch_str.startswith('+'):
            return float(pitch_str[1:].rstrip('Hz%')) / 100.0
        elif pitch_str.startswith('-'):
            return -float(pitch_str[1:].rstrip('Hz%')) / 100.0
        else:
            return float(pitch_str.rstrip('Hz%')) / 100.0
    
    def _parse_volume(self, volume_str: str) -> float:
        """Parse SSML volume attribute"""
        if volume_str in ['silent', 'x-soft', 'soft', 'medium', 'loud', 'x-loud']:
            volume_map = {'silent': 0.0, 'x-soft': 0.3, 'soft': 0.5, 'medium': 0.7, 'loud': 0.85, 'x-loud': 1.0}
            return volume_map[volume_str]
        else:
            return float(volume_str.rstrip('%')) / 100.0
    
    def _apply_ssml_modifications(
        self, 
        voice: VoiceCharacteristics, 
        modifications: Dict[str, Any]
    ) -> VoiceCharacteristics:
        """Apply SSML modifications to voice characteristics"""
        if 'speed' in modifications:
            voice.speed = modifications['speed']
        if 'pitch' in modifications:
            voice.pitch = modifications['pitch']
        if 'volume' in modifications:
            voice.volume = modifications['volume']
        
        return voice

# Test and demonstration functions
async def test_romanian_tts_engine():
    """Test Romanian TTS Engine"""
    print("🇷🇴 Testing Romanian Text-to-Speech Engine...")
    
    # Initialize engine
    engine = RomanianTTSEngine()
    
    # Test different voices and accents
    test_cases = [
        {
            'text': "Bună ziua! Mă numesc Maria și sunt din București.",
            'voice': VoiceCharacteristics(
                profile=VoiceProfile.FEMALE_STANDARD,
                accent=RomanianAccent.BUCURESTI,
                emotion=EmotionalTone.FRIENDLY,
                pitch=0.1,
                speed=1.0,
                volume=0.8
            ),
            'description': "Standard female voice from Bucharest"
        },
        {
            'text': "Salut! Sunt Andrei din Cluj. Cum mai ești?",
            'voice': VoiceCharacteristics(
                profile=VoiceProfile.MALE_YOUNG,
                accent=RomanianAccent.TRANSILVANIA,
                emotion=EmotionalTone.FRIENDLY,
                pitch=-0.1,
                speed=1.1,
                volume=0.9
            ),
            'description': "Young male voice from Transylvania"
        },
        {
            'text': "Mulțumesc frumos pentru ajutor. Vă doresc o zi bună!",
            'voice': VoiceCharacteristics(
                profile=VoiceProfile.FEMALE_ELDERLY,
                accent=RomanianAccent.MOLDOVA,
                emotion=EmotionalTone.FORMAL,
                pitch=0.0,
                speed=0.9,
                volume=0.7
            ),
            'description': "Elderly female voice from Moldova"
        }
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"\n🎤 Test {i+1}: {test_case['description']}")
        
        request = TTSRequest(
            text=test_case['text'],
            voice=test_case['voice'],
            quality="high",
            enable_timing=True
        )
        
        result = await engine.synthesize_text(request)
        
        print(f"   Text: {test_case['text']}")
        print(f"   Duration: {result.duration:.2f}s")
        print(f"   Sample rate: {result.sample_rate}Hz")
        print(f"   Voice: {result.voice_characteristics.profile.value}")
        print(f"   Accent: {result.voice_characteristics.accent.value}")
        print(f"   Phonemes: {len(result.phoneme_timing)} detected")
        print(f"   Words: {len(result.word_timing)} timed")
    
    print("✅ Romanian TTS Engine test completed!")

async def demo_ssml_synthesis():
    """Demonstrate SSML synthesis capabilities"""
    print("\n📝 Romanian SSML Synthesis Demo...")
    
    engine = RomanianTTSEngine()
    
    ssml_examples = [
        '<prosody rate="slow" pitch="+10%">Vorbesc încet și cu o voce mai înaltă.</prosody>',
        '<prosody rate="fast" volume="loud">Vorbesc repede și tare!</prosody>',
        'Salut! <break time="1s"/> Cum <emphasis>te</emphasis> simți astăzi?'
    ]
    
    base_voice = VoiceCharacteristics(
        profile=VoiceProfile.FEMALE_STANDARD,
        accent=RomanianAccent.STANDARD,
        emotion=EmotionalTone.NEUTRAL,
        pitch=0.0,
        speed=1.0,
        volume=0.8
    )
    
    for ssml in ssml_examples:
        print(f"\n🎵 SSML: {ssml}")
        
        request = TTSRequest(
            text=ssml,
            voice=base_voice,
            ssml_enabled=True
        )
        
        result = await engine.synthesize_text(request)
        print(f"   Generated {result.duration:.2f}s of speech")
    
    print("✅ SSML synthesis demo completed!")

if __name__ == "__main__":
    asyncio.run(test_romanian_tts_engine())
    asyncio.run(demo_ssml_synthesis())
