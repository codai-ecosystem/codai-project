"""
Romanian Text Recognition and Visual Language Processing
OCR and text analysis optimized for Romanian language in images
Week 8 Day 3 Component 3 - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any
from dataclasses import dataclass
import cv2
import re
from enum import Enum
import time

from .visual_analysis_core import (
    ImageSegment, VisualFeatureVector, VisualFeatureType, AnalysisQuality,
    RomanianRegion, FeatureExtractorBase, logger
)

class TextType(Enum):
    """Types of text found in Romanian visual content"""
    HANDWRITTEN = "handwritten"
    PRINTED = "printed"
    DIGITAL = "digital"
    SIGNAGE = "signage"
    DOCUMENT = "document"
    ARTISTIC = "artistic"
    GRAFFITI = "graffiti"

class RomanianTextCategory(Enum):
    """Categories of Romanian text content"""
    FORMAL_DOCUMENT = "formal_document"
    STREET_SIGN = "street_sign"
    SHOP_SIGN = "shop_sign"
    CULTURAL_TEXT = "cultural_text"
    LITERARY_TEXT = "literary_text"
    RELIGIOUS_TEXT = "religious_text"
    HISTORICAL_TEXT = "historical_text"
    MODERN_CONTENT = "modern_content"
    REGIONAL_DIALECT = "regional_dialect"

@dataclass
class TextRegion:
    """Container for detected text region"""
    bounding_box: Tuple[int, int, int, int]  # (x, y, width, height)
    text_content: str
    confidence: float
    language_confidence: float  # Confidence it's Romanian
    text_type: TextType
    category: RomanianTextCategory
    regional_indicators: Dict[RomanianRegion, float]
    linguistic_features: Dict[str, Any]

@dataclass
class RomanianTextAnalysis:
    """Complete Romanian text analysis from image"""
    text_regions: List[TextRegion]
    overall_text: str
    language_detection: Dict[str, float]
    linguistic_analysis: Dict[str, Any]
    cultural_context: Dict[str, Any]
    reading_order: List[int]  # Indices of text regions in reading order
    confidence_score: float

class RomanianOCREngine(FeatureExtractorBase):
    """Romanian-optimized OCR and text recognition"""
    
    def __init__(self):
        self.romanian_patterns = self._initialize_romanian_patterns()
        self.diacritic_variants = self._initialize_diacritic_variants()
        self.regional_vocabularies = self._initialize_regional_vocabularies()
        
    def _initialize_romanian_patterns(self) -> Dict[str, Any]:
        """Initialize Romanian language patterns"""
        return {
            'diacritics': {
                'ă': ['a', 'ã'], 'â': ['a', 'i'], 'î': ['i', 'a'],
                'ș': ['s', 'sh'], 'ț': ['t', 'th']
            },
            'common_words': {
                'articles': ['un', 'o', 'al', 'a', 'ai', 'ale'],
                'pronouns': ['eu', 'tu', 'el', 'ea', 'noi', 'voi', 'ei', 'ele'],
                'prepositions': ['de', 'la', 'în', 'pe', 'cu', 'din', 'pentru'],
                'conjunctions': ['și', 'sau', 'dar', 'că', 'dacă', 'când']
            },
            'endings': {
                'plural': ['i', 'e', 'uri', 'le'],
                'adjective': ['ă', 'e', 'i', 'esc', 'ească'],
                'verb': ['ă', 'e', 'i', 'ești', 'este', 'esc']
            },
            'phonetic_patterns': {
                'ce_ci': ['ce', 'ci', 'che', 'chi'],
                'ge_gi': ['ge', 'gi', 'ghe', 'ghi'],
                'double_consonants': ['ll', 'nn', 'rr', 'ss']
            }
        }
    
    def _initialize_diacritic_variants(self) -> Dict[str, List[str]]:
        """Initialize diacritic correction mapping"""
        return {
            'ă': ['a', 'ã', '@', 'ä'],
            'â': ['a', 'î', 'i', 'ê'],
            'î': ['i', 'â', 'ï', 'ì'],
            'ș': ['s', 'sh', 'ş', '∫'],
            'ț': ['t', 'th', 'ţ', '†']
        }
    
    def _initialize_regional_vocabularies(self) -> Dict[RomanianRegion, Dict[str, Any]]:
        """Initialize region-specific vocabulary patterns"""
        return {
            RomanianRegion.MOLDOVA: {
                'dialect_words': ['noroc', 'ciubuc', 'măcar', 'parcă'],
                'phonetic_variants': {'ce': 'cie', 'ge': 'gie'},
                'characteristic_endings': ['șel', 'șor', 'ișor']
            },
            RomanianRegion.TRANSILVANIA: {
                'dialect_words': ['fain', 'tare', 'așa', 'maică'],
                'influences': ['hungarian', 'german'],
                'characteristic_patterns': ['sz', 'sch', 'tsch']
            },
            RomanianRegion.BANAT: {
                'dialect_words': ['kaș', 'krampf', 'șnițel'],
                'influences': ['serbian', 'hungarian', 'german'],
                'characteristic_patterns': ['ș + consonant', 'j sounds']
            },
            RomanianRegion.MARAMURES: {
                'dialect_words': ['năcăi', 'spuză', 'țurcă'],
                'archaic_forms': ['păre', 'cade', 'vine'],
                'characteristic_endings': ['ăi', 'ej', 'oj']
            }
        }
    
    async def extract_features(self, image: ImageSegment, 
                             quality: AnalysisQuality) -> VisualFeatureVector:
        """Extract OCR and text features from image"""
        start_time = time.time()
        
        # Perform text recognition
        text_analysis = await self.recognize_romanian_text(image, quality)
        
        # Convert to feature vector
        features = self._text_to_features(text_analysis)
        
        extraction_time = time.time() - start_time
        quality_score = text_analysis.confidence_score
        
        return VisualFeatureVector(
            features=features,
            feature_type=VisualFeatureType.TEXT_RECOGNITION,
            quality_score=quality_score,
            extraction_time=extraction_time,
            metadata={
                'text_regions_count': len(text_analysis.text_regions),
                'total_characters': len(text_analysis.overall_text),
                'romanian_confidence': text_analysis.language_detection.get('romanian', 0)
            }
        )
    
    async def recognize_romanian_text(self, image: ImageSegment, 
                                    quality: AnalysisQuality,
                                    region_hint: Optional[RomanianRegion] = None
                                    ) -> RomanianTextAnalysis:
        """Perform Romanian text recognition on image"""
        await asyncio.sleep(0.15)  # Simulate OCR processing
        
        # Preprocess image for OCR
        processed_image = await self._preprocess_for_ocr(image, quality)
        
        # Detect text regions
        text_regions = await self._detect_text_regions(processed_image, quality)
        
        # Recognize text in each region
        recognized_regions = []
        overall_text_parts = []
        
        for region_box in text_regions:
            region_text = await self._recognize_text_in_region(
                processed_image, region_box, quality, region_hint
            )
            if region_text.text_content.strip():
                recognized_regions.append(region_text)
                overall_text_parts.append(region_text.text_content)
        
        # Combine all text
        overall_text = ' '.join(overall_text_parts)
        
        # Analyze language
        language_detection = await self._detect_language(overall_text)
        
        # Linguistic analysis
        linguistic_analysis = await self._analyze_romanian_linguistics(overall_text, region_hint)
        
        # Cultural context analysis
        cultural_context = await self._analyze_cultural_text_context(overall_text, recognized_regions)
        
        # Determine reading order
        reading_order = self._determine_reading_order(recognized_regions)
        
        # Calculate overall confidence
        confidence_score = self._calculate_overall_confidence(
            recognized_regions, language_detection, quality
        )
        
        return RomanianTextAnalysis(
            text_regions=recognized_regions,
            overall_text=overall_text,
            language_detection=language_detection,
            linguistic_analysis=linguistic_analysis,
            cultural_context=cultural_context,
            reading_order=reading_order,
            confidence_score=confidence_score
        )
    
    async def _preprocess_for_ocr(self, image: ImageSegment, 
                                quality: AnalysisQuality) -> np.ndarray:
        """Preprocess image for optimal OCR performance"""
        await asyncio.sleep(0.02)
        
        data = image.data.copy()
        
        # Convert to grayscale for OCR
        if len(data.shape) == 3:
            gray = cv2.cvtColor((data * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
        else:
            gray = (data * 255).astype(np.uint8)
        
        # Apply preprocessing based on quality level
        if quality in [AnalysisQuality.HIGH, AnalysisQuality.MAXIMUM]:
            # Denoise
            gray = cv2.fastNlMeansDenoising(gray)
            
            # Enhance contrast
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)
        
        # Binarization
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations to clean up
        if quality == AnalysisQuality.MAXIMUM:
            kernel = np.ones((2, 2), np.uint8)
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        return binary
    
    async def _detect_text_regions(self, processed_image: np.ndarray, 
                                 quality: AnalysisQuality) -> List[Tuple[int, int, int, int]]:
        """Detect text regions in processed image"""
        await asyncio.sleep(0.05)
        
        # Use MSER (Maximally Stable Extremal Regions) for text detection
        mser = cv2.MSER_create()
        regions, _ = mser.detectRegions(processed_image)
        
        # Convert regions to bounding boxes
        bounding_boxes = []
        for region in regions:
            x, y, w, h = cv2.boundingRect(region.reshape(-1, 1, 2))
            
            # Filter by size and aspect ratio
            if w > 10 and h > 8 and w < processed_image.shape[1] * 0.8:
                aspect_ratio = w / h
                if 0.1 < aspect_ratio < 10:  # Reasonable text aspect ratios
                    bounding_boxes.append((x, y, w, h))
        
        # Remove overlapping boxes
        filtered_boxes = self._remove_overlapping_boxes(bounding_boxes)
        
        # Limit number based on quality
        max_regions = {
            AnalysisQuality.FAST: 5,
            AnalysisQuality.STANDARD: 10,
            AnalysisQuality.HIGH: 15,
            AnalysisQuality.MAXIMUM: 25
        }[quality]
        
        return filtered_boxes[:max_regions]
    
    async def _recognize_text_in_region(self, processed_image: np.ndarray,
                                      region_box: Tuple[int, int, int, int],
                                      quality: AnalysisQuality,
                                      region_hint: Optional[RomanianRegion]
                                      ) -> TextRegion:
        """Recognize text in specific region"""
        await asyncio.sleep(0.03)
        
        x, y, w, h = region_box
        roi = processed_image[y:y+h, x:x+w]
        
        # Simulate OCR - in real implementation would use Tesseract with Romanian
        sample_texts = [
            "Strada Republicii",
            "București, România", 
            "Primăria municipiului",
            "Farmacia centrală",
            "Magazin alimentar",
            "Biserica Ortodoxă",
            "Școala generală",
            "Caffe și restaurante",
            "Bună ziua și bun venit",
            "Mulțumesc frumos"
        ]
        
        # Simulate text recognition with some randomness
        recognized_text = np.random.choice(sample_texts)
        base_confidence = 0.7 + np.random.uniform(0, 0.25)
        
        # Apply Romanian corrections
        corrected_text = await self._apply_romanian_corrections(recognized_text)
        
        # Determine text characteristics
        text_type = self._classify_text_type(corrected_text, region_box)
        text_category = self._classify_text_category(corrected_text)
        
        # Language confidence
        lang_confidence = await self._calculate_romanian_confidence(corrected_text)
        
        # Regional analysis
        regional_indicators = await self._analyze_regional_text_features(
            corrected_text, region_hint
        )
        
        # Linguistic features
        linguistic_features = await self._extract_linguistic_features(corrected_text)
        
        return TextRegion(
            bounding_box=region_box,
            text_content=corrected_text,
            confidence=base_confidence,
            language_confidence=lang_confidence,
            text_type=text_type,
            category=text_category,
            regional_indicators=regional_indicators,
            linguistic_features=linguistic_features
        )
    
    async def _apply_romanian_corrections(self, text: str) -> str:
        """Apply Romanian-specific OCR corrections"""
        await asyncio.sleep(0.01)
        
        corrected = text
        
        # Common OCR errors for Romanian diacritics
        corrections = {
            'â': ['a', 'i', 'à', 'á'],
            'ă': ['a', 'ã', '@'],
            'î': ['i', 'ì', 'í'],
            'ș': ['s', 'ş', 'š'],
            'ț': ['t', 'ţ', 'ť']
        }
        
        # Apply context-aware corrections
        for correct_char, variants in corrections.items():
            for variant in variants:
                # Simple replacement - in practice would use context
                if variant in corrected:
                    corrected = corrected.replace(variant, correct_char)
        
        return corrected
    
    def _classify_text_type(self, text: str, 
                          bbox: Tuple[int, int, int, int]) -> TextType:
        """Classify the type of text based on content and context"""
        x, y, w, h = bbox
        
        # Simple heuristics for text type classification
        if h < 20:
            return TextType.PRINTED
        elif any(word in text.lower() for word in ['strada', 'piața', 'boulevard']):
            return TextType.SIGNAGE
        elif any(word in text.lower() for word in ['primăria', 'ministerul', 'oficiul']):
            return TextType.DOCUMENT
        else:
            return TextType.DIGITAL
    
    def _classify_text_category(self, text: str) -> RomanianTextCategory:
        """Classify Romanian text category"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['strada', 'piața', 'boulevard', 'calea']):
            return RomanianTextCategory.STREET_SIGN
        elif any(word in text_lower for word in ['magazin', 'farmacia', 'restaurant', 'cafe']):
            return RomanianTextCategory.SHOP_SIGN
        elif any(word in text_lower for word in ['primăria', 'ministerul', 'consiliul']):
            return RomanianTextCategory.FORMAL_DOCUMENT
        elif any(word in text_lower for word in ['biserica', 'mănăstirea', 'sfânt']):
            return RomanianTextCategory.RELIGIOUS_TEXT
        elif any(word in text_lower for word in ['școala', 'liceul', 'universitatea']):
            return RomanianTextCategory.FORMAL_DOCUMENT
        else:
            return RomanianTextCategory.MODERN_CONTENT
    
    async def _calculate_romanian_confidence(self, text: str) -> float:
        """Calculate confidence that text is Romanian"""
        await asyncio.sleep(0.01)
        
        if not text:
            return 0.0
        
        score = 0.0
        text_lower = text.lower()
        
        # Check for Romanian diacritics
        diacritic_count = sum(text_lower.count(char) for char in 'ăâîșț')
        score += min(diacritic_count / len(text) * 10, 0.3)
        
        # Check for common Romanian words
        romanian_words = 0
        words = text_lower.split()
        for word in words:
            if word in [item for sublist in self.romanian_patterns['common_words'].values() 
                       for item in sublist]:
                romanian_words += 1
        
        if words:
            score += min(romanian_words / len(words), 0.4)
        
        # Check for Romanian patterns
        if any(pattern in text_lower for pattern in ['escu', 'ărie', 'ție', 'șie']):
            score += 0.2
        
        # Check for characteristic endings
        for ending_list in self.romanian_patterns['endings'].values():
            for ending in ending_list:
                if text_lower.endswith(ending):
                    score += 0.1
                    break
        
        return min(score, 1.0)
    
    async def _analyze_regional_text_features(self, text: str, 
                                            region_hint: Optional[RomanianRegion]
                                            ) -> Dict[RomanianRegion, float]:
        """Analyze regional characteristics in text"""
        await asyncio.sleep(0.01)
        
        regional_scores = {region: 0.0 for region in RomanianRegion}
        text_lower = text.lower()
        
        for region, vocab in self.regional_vocabularies.items():
            score = 0.0
            
            # Check for dialect words
            dialect_words = vocab.get('dialect_words', [])
            for word in dialect_words:
                if word in text_lower:
                    score += 0.3
            
            # Check for phonetic variants
            variants = vocab.get('phonetic_variants', {})
            for standard, variant in variants.items():
                if variant in text_lower:
                    score += 0.2
            
            # Check for characteristic patterns
            patterns = vocab.get('characteristic_patterns', [])
            for pattern in patterns:
                if pattern in text_lower:
                    score += 0.15
            
            regional_scores[region] = min(score, 1.0)
        
        # Boost hinted region
        if region_hint:
            regional_scores[region_hint] *= 1.3
        
        return regional_scores
    
    async def _extract_linguistic_features(self, text: str) -> Dict[str, Any]:
        """Extract linguistic features from Romanian text"""
        await asyncio.sleep(0.01)
        
        features = {
            'character_count': len(text),
            'word_count': len(text.split()),
            'diacritic_density': 0.0,
            'average_word_length': 0.0,
            'sentence_count': 0,
            'complexity_indicators': {}
        }
        
        if text:
            words = text.split()
            
            # Calculate diacritic density
            diacritic_count = sum(text.lower().count(char) for char in 'ăâîșț')
            features['diacritic_density'] = diacritic_count / len(text)
            
            # Average word length
            if words:
                features['average_word_length'] = sum(len(word) for word in words) / len(words)
            
            # Sentence count (approximate)
            features['sentence_count'] = text.count('.') + text.count('!') + text.count('?')
            
            # Complexity indicators
            features['complexity_indicators'] = {
                'long_words': sum(1 for word in words if len(word) > 8),
                'capitalized_words': sum(1 for word in words if word[0].isupper()),
                'punctuation_density': sum(1 for char in text if not char.isalnum()) / len(text)
            }
        
        return features
    
    async def _detect_language(self, text: str) -> Dict[str, float]:
        """Detect language probabilities"""
        await asyncio.sleep(0.02)
        
        if not text:
            return {'unknown': 1.0}
        
        # Calculate Romanian confidence
        romanian_score = await self._calculate_romanian_confidence(text)
        
        # Simple language detection
        scores = {
            'romanian': romanian_score,
            'english': max(0.1, 0.8 - romanian_score),
            'other': max(0.1, 0.2 - romanian_score * 0.5)
        }
        
        # Normalize scores
        total = sum(scores.values())
        for lang in scores:
            scores[lang] /= total
        
        return scores
    
    async def _analyze_romanian_linguistics(self, text: str, 
                                          region_hint: Optional[RomanianRegion]
                                          ) -> Dict[str, Any]:
        """Analyze Romanian linguistic characteristics"""
        await asyncio.sleep(0.03)
        
        analysis = {
            'morphology': await self._analyze_morphology(text),
            'phonetics': await self._analyze_phonetic_patterns(text),
            'lexicon': await self._analyze_lexical_patterns(text),
            'syntax': await self._analyze_syntax_patterns(text),
            'regional_features': await self._analyze_regional_linguistics(text, region_hint)
        }
        
        return analysis
    
    async def _analyze_morphology(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian morphological patterns"""
        await asyncio.sleep(0.01)
        
        words = text.lower().split()
        morphology = {
            'definite_articles': 0,
            'plural_forms': 0,
            'verb_forms': 0,
            'adjective_agreements': 0
        }
        
        for word in words:
            # Count definite articles
            if word.endswith(('ul', 'le', 'lui', 'lor')):
                morphology['definite_articles'] += 1
            
            # Count plural forms
            if word.endswith(('i', 'e', 'uri', 'le')):
                morphology['plural_forms'] += 1
            
            # Count verb forms
            if word.endswith(('ă', 'e', 'ești', 'este', 'em', 'eți', 'esc')):
                morphology['verb_forms'] += 1
        
        return morphology
    
    async def _analyze_phonetic_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian phonetic patterns in text"""
        await asyncio.sleep(0.01)
        
        text_lower = text.lower()
        patterns = {
            'diphthongs': 0,
            'consonant_clusters': 0,
            'ce_ci_sounds': 0,
            'ge_gi_sounds': 0
        }
        
        # Count diphthongs
        diphthongs = ['ea', 'oa', 'ie', 'io', 'iu', 'ai', 'au', 'ei', 'eu', 'ou']
        for diphthong in diphthongs:
            patterns['diphthongs'] += text_lower.count(diphthong)
        
        # Count consonant clusters
        clusters = ['str', 'spr', 'scr', 'ptr', 'ctr', 'ntr']
        for cluster in clusters:
            patterns['consonant_clusters'] += text_lower.count(cluster)
        
        # Count ce/ci and ge/gi patterns
        patterns['ce_ci_sounds'] = text_lower.count('ce') + text_lower.count('ci')
        patterns['ge_gi_sounds'] = text_lower.count('ge') + text_lower.count('gi')
        
        return patterns
    
    async def _analyze_lexical_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian lexical patterns"""
        await asyncio.sleep(0.01)
        
        words = text.lower().split()
        lexical = {
            'latin_roots': 0,
            'slavic_borrowings': 0,
            'neologisms': 0,
            'archaic_forms': 0
        }
        
        # Simple pattern matching for word origins
        latin_indicators = ['tion', 'sion', 'ment', 'ant', 'ent']
        slavic_indicators = ['ov', 'ev', 'ski', 'escu']
        
        for word in words:
            if any(indicator in word for indicator in latin_indicators):
                lexical['latin_roots'] += 1
            if any(indicator in word for indicator in slavic_indicators):
                lexical['slavic_borrowings'] += 1
        
        return lexical
    
    async def _analyze_syntax_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian syntax patterns"""
        await asyncio.sleep(0.01)
        
        syntax = {
            'word_order': 'SVO',  # Romanian typically SVO
            'clitic_placement': 0,
            'compound_sentences': 0,
            'subordinate_clauses': 0
        }
        
        # Count conjunctions indicating complex syntax
        conjunctions = ['că', 'dacă', 'când', 'unde', 'cum', 'care']
        for conj in conjunctions:
            syntax['subordinate_clauses'] += text.lower().count(conj)
        
        return syntax
    
    async def _analyze_regional_linguistics(self, text: str, 
                                          region_hint: Optional[RomanianRegion]
                                          ) -> Dict[str, Any]:
        """Analyze regional linguistic features"""
        await asyncio.sleep(0.01)
        
        regional_features = {
            'dialect_markers': {},
            'phonetic_variations': {},
            'lexical_regionalism': {}
        }
        
        if region_hint and region_hint in self.regional_vocabularies:
            vocab = self.regional_vocabularies[region_hint]
            
            # Check for dialect words
            for word in vocab.get('dialect_words', []):
                if word in text.lower():
                    regional_features['dialect_markers'][word] = True
            
            # Check for phonetic variants
            for standard, variant in vocab.get('phonetic_variants', {}).items():
                if variant in text.lower():
                    regional_features['phonetic_variations'][standard] = variant
        
        return regional_features
    
    async def _analyze_cultural_text_context(self, text: str, 
                                           regions: List[TextRegion]) -> Dict[str, Any]:
        """Analyze cultural context of Romanian text"""
        await asyncio.sleep(0.02)
        
        cultural_context = {
            'historical_references': [],
            'religious_content': False,
            'folk_references': [],
            'modern_context': False,
            'formal_register': False
        }
        
        text_lower = text.lower()
        
        # Check for historical references
        historical_terms = ['stefan', 'mihai', 'vlaicu', 'cuza', 'carol', 'ferdinand']
        for term in historical_terms:
            if term in text_lower:
                cultural_context['historical_references'].append(term)
        
        # Check for religious content
        religious_terms = ['biserica', 'mănăstirea', 'sfânt', 'ortodox', 'dumnezeu']
        cultural_context['religious_content'] = any(term in text_lower for term in religious_terms)
        
        # Check for folk references
        folk_terms = ['hora', 'mărțișor', 'dragobete', 'sânziene', 'colinde']
        for term in folk_terms:
            if term in text_lower:
                cultural_context['folk_references'].append(term)
        
        # Check for formal register
        formal_terms = ['domnul', 'doamna', 'respectuos', 'mulțumesc', 'vă rog']
        cultural_context['formal_register'] = any(term in text_lower for term in formal_terms)
        
        return cultural_context
    
    def _determine_reading_order(self, regions: List[TextRegion]) -> List[int]:
        """Determine reading order of text regions"""
        if not regions:
            return []
        
        # Sort by Y coordinate first (top to bottom), then X coordinate (left to right)
        indexed_regions = [(i, region) for i, region in enumerate(regions)]
        indexed_regions.sort(key=lambda x: (x[1].bounding_box[1], x[1].bounding_box[0]))
        
        return [i for i, _ in indexed_regions]
    
    def _calculate_overall_confidence(self, regions: List[TextRegion], 
                                    language_detection: Dict[str, float],
                                    quality: AnalysisQuality) -> float:
        """Calculate overall OCR confidence score"""
        if not regions:
            return 0.0
        
        # Average region confidence
        avg_confidence = sum(region.confidence for region in regions) / len(regions)
        
        # Language confidence
        romanian_confidence = language_detection.get('romanian', 0.0)
        
        # Quality factor
        quality_factor = {
            AnalysisQuality.FAST: 0.7,
            AnalysisQuality.STANDARD: 0.85,
            AnalysisQuality.HIGH: 0.95,
            AnalysisQuality.MAXIMUM: 1.0
        }[quality]
        
        overall_confidence = (avg_confidence * 0.5 + romanian_confidence * 0.3 + quality_factor * 0.2)
        return min(overall_confidence, 1.0)
    
    def _remove_overlapping_boxes(self, boxes: List[Tuple[int, int, int, int]], 
                                overlap_threshold: float = 0.5) -> List[Tuple[int, int, int, int]]:
        """Remove overlapping bounding boxes"""
        if not boxes:
            return []
        
        # Sort by area (largest first)
        boxes_with_area = [(box, box[2] * box[3]) for box in boxes]
        boxes_with_area.sort(key=lambda x: x[1], reverse=True)
        
        kept_boxes = []
        for box, _ in boxes_with_area:
            overlap = False
            for kept_box in kept_boxes:
                if self._calculate_overlap(box, kept_box) > overlap_threshold:
                    overlap = True
                    break
            if not overlap:
                kept_boxes.append(box)
        
        return kept_boxes
    
    def _calculate_overlap(self, box1: Tuple[int, int, int, int], 
                         box2: Tuple[int, int, int, int]) -> float:
        """Calculate overlap ratio between two bounding boxes"""
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2
        
        # Calculate intersection
        x_overlap = max(0, min(x1 + w1, x2 + w2) - max(x1, x2))
        y_overlap = max(0, min(y1 + h1, y2 + h2) - max(y1, y2))
        intersection = x_overlap * y_overlap
        
        # Calculate union
        area1 = w1 * h1
        area2 = w2 * h2
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0
    
    def _text_to_features(self, analysis: RomanianTextAnalysis) -> np.ndarray:
        """Convert text analysis to feature vector"""
        features = []
        
        # Basic text statistics
        features.extend([
            len(analysis.overall_text),
            len(analysis.text_regions),
            analysis.confidence_score
        ])
        
        # Language scores
        features.extend([
            analysis.language_detection.get('romanian', 0),
            analysis.language_detection.get('english', 0),
            analysis.language_detection.get('other', 0)
        ])
        
        # Text type distribution (one-hot encoding)
        text_types = [region.text_type for region in analysis.text_regions]
        for text_type in TextType:
            features.append(text_types.count(text_type) / max(len(text_types), 1))
        
        # Cultural indicators
        cultural = analysis.cultural_context
        features.extend([
            len(cultural.get('historical_references', [])),
            1.0 if cultural.get('religious_content') else 0.0,
            len(cultural.get('folk_references', [])),
            1.0 if cultural.get('formal_register') else 0.0
        ])
        
        return np.array(features, dtype=np.float32)
    
    def get_feature_dimension(self) -> int:
        """Get feature vector dimension"""
        # 3 basic + 3 language + 7 text types + 4 cultural = 17
        return 17

# Test function
async def test_romanian_text_recognition():
    """Test Romanian OCR and text recognition"""
    print("🎯 Testing Romanian Text Recognition...")
    
    # Create test image with text
    test_image_data = np.random.rand(300, 500, 3).astype(np.float32)
    test_image = ImageSegment(
        data=test_image_data,
        width=500,
        height=300,
        channels=3,
        source="test_text.jpg"
    )
    
    # Test OCR engine
    print("\n📝 Testing OCR recognition...")
    ocr_engine = RomanianOCREngine()
    
    # Test feature extraction
    feature_vector = await ocr_engine.extract_features(test_image, AnalysisQuality.STANDARD)
    print(f"   Feature dimension: {len(feature_vector.features)}")
    print(f"   Quality score: {feature_vector.quality_score:.3f}")
    
    # Test full text recognition
    print("\n🔍 Testing full text analysis...")
    text_analysis = await ocr_engine.recognize_romanian_text(
        test_image, AnalysisQuality.HIGH, RomanianRegion.BUCURESTI
    )
    
    print(f"   Text regions found: {len(text_analysis.text_regions)}")
    print(f"   Overall confidence: {text_analysis.confidence_score:.3f}")
    print(f"   Romanian probability: {text_analysis.language_detection.get('romanian', 0):.3f}")
    
    if text_analysis.text_regions:
        print(f"   Sample text: '{text_analysis.text_regions[0].text_content}'")
        print(f"   Text category: {text_analysis.text_regions[0].category.value}")
    
    # Show linguistic analysis
    ling_analysis = text_analysis.linguistic_analysis
    if 'morphology' in ling_analysis:
        morpho = ling_analysis['morphology']
        print(f"   Morphology - Articles: {morpho.get('definite_articles', 0)}")
    
    print("\n✅ Romanian text recognition test completed!")

if __name__ == "__main__":
    asyncio.run(test_romanian_text_recognition())
