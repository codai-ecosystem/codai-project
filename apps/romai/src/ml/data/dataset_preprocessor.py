#!/usr/bin/env python3
"""
RomAI Training Dataset Preprocessor
Advanced preprocessing and augmentation for Romanian cultural AI training

This module provides:
- Text preprocessing and normalization
- Data augmentation techniques
- Romanian language-specific processing
- Cultural context enhancement
- Training data formatting and batching
- Dataset splitting and validation
"""

import logging
import asyncio
import json
import sqlite3
import re
from typing import Dict, List, Optional, Any, Tuple, Set, Union
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
import hashlib
import random
import numpy as np
from collections import defaultdict, Counter
import unicodedata
from textblob import TextBlob
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PreprocessedEntry:
    """Preprocessed training entry"""
    entry_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    original_content: str = ""
    processed_content: str = ""
    normalized_content: str = ""
    augmented_variants: List[str] = field(default_factory=list)
    tokens: List[str] = field(default_factory=list)
    cultural_markers: List[str] = field(default_factory=list)
    sentiment_score: float = 0.0
    complexity_score: float = 0.0
    readability_score: float = 0.0
    preprocessing_metadata: Dict[str, Any] = field(default_factory=dict)
    split_assignment: str = "train"  # train, validation, test
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class TrainingBatch:
    """Batch of training data"""
    batch_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    entries: List[PreprocessedEntry] = field(default_factory=list)
    batch_size: int = 0
    sequence_length: int = 512
    cultural_weight: float = 1.0
    quality_threshold: float = 0.7
    batch_metadata: Dict[str, Any] = field(default_factory=dict)

class RomanianTextProcessor:
    """Advanced Romanian text processing"""
    
    def __init__(self):
        # Romanian diacritics mapping
        self.diacritics_map = {
            'ā': 'ă', 'Ā': 'Ă',  # Legacy encoding fixes
            'ǎ': 'ă', 'Ǎ': 'Ă',
            'ï': 'î', 'Ï': 'Î',
            'ş': 'ș', 'Ş': 'Ș',  # Cedilla to comma-below
            'ţ': 'ț', 'Ţ': 'Ț'
        }
        
        # Romanian stop words
        self.stop_words = {
            'a', 'al', 'ale', 'acest', 'această', 'acestea', 'acești', 'aceștia',
            'acel', 'acela', 'acelea', 'aceli', 'acelea', 'acelor', 'acestor',
            'și', 'să', 'se', 'sunt', 'este', 'era', 'erau', 'ești', 'sunteți',
            'cu', 'de', 'din', 'în', 'la', 'pe', 'pentru', 'după', 'înaintea',
            'până', 'spre', 'către', 'asupra', 'împotriva', 'printre', 'între',
            'dar', 'însă', 'ci', 'totuși', 'astfel', 'deci', 'prin', 'ca', 'că',
            'cel', 'cea', 'cei', 'cele', 'care', 'cine', 'ce', 'când', 'unde',
            'cum', 'de ce', 'pentru că', 'dacă', 'să nu', 'nu', 'nici', 'nimic'
        }
        
        # Cultural terms that should be preserved
        self.cultural_preservations = {
            'dor', 'jale', 'drag', 'urât', 'frumos', 'înălțător',
            'măreț', 'sublim', 'sfânt', 'binecuvântat', 'osândit',
            'neam', 'țară', 'patrie', 'strămoș', 'moștenire',
            'tradiție', 'obicei', 'datină', 'credință', 'credincioșie'
        }
        
        # Romanian phonetic patterns
        self.phonetic_patterns = {
            'ce': 'che',  # Romanian pronunciation rules
            'ci': 'chi',
            'ge': 'ghe',
            'gi': 'ghi'
        }
        
        logger.info("✅ Romanian text processor initialized")
    
    def normalize_diacritics(self, text: str) -> str:
        """Normalize Romanian diacritics to standard form"""
        normalized = text
        for old, new in self.diacritics_map.items():
            normalized = normalized.replace(old, new)
        return normalized
    
    def remove_extra_whitespace(self, text: str) -> str:
        """Remove extra whitespace and normalize"""
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        # Remove leading/trailing whitespace
        return text.strip()
    
    def fix_punctuation(self, text: str) -> str:
        """Fix common punctuation issues"""
        # Fix spaces before punctuation
        text = re.sub(r'\s+([.,;:!?])', r'\1', text)
        # Fix spaces after punctuation
        text = re.sub(r'([.,;:!?])([^\s])', r'\1 \2', text)
        # Fix quotes
        text = re.sub(r'[""„""]', '"', text)
        text = re.sub(r"[''‚']", "'", text)
        return text
    
    def extract_cultural_markers(self, text: str) -> List[str]:
        """Extract Romanian cultural markers from text"""
        markers = []
        
        # Check for preserved cultural terms
        words = text.lower().split()
        for word in words:
            clean_word = re.sub(r'[^\w]', '', word)
            if clean_word in self.cultural_preservations:
                markers.append(clean_word)
        
        # Check for traditional greetings/expressions
        traditional_expressions = [
            'la mulți ani', 'să trăiți', 'să fiți sănătoși',
            'dumnezeu să te binecuvânteze', 'să ajuți',
            'bună ziua', 'bună seara', 'noapte bună'
        ]
        
        for expr in traditional_expressions:
            if expr in text.lower():
                markers.append(expr.replace(' ', '_'))
        
        # Check for religious expressions
        religious_patterns = [
            r'doamne\s+ajută', r'să\s+ne\s+ajute', r'cu\s+ajutorul\s+lui\s+dumnezeu',
            r'slavă\s+domnului', r'mulțumesc\s+domnului'
        ]
        
        for pattern in religious_patterns:
            if re.search(pattern, text.lower()):
                markers.append(pattern.replace(r'\s+', '_'))
        
        return list(set(markers))  # Remove duplicates
    
    def calculate_complexity_score(self, text: str) -> float:
        """Calculate text complexity score"""
        sentences = text.split('.')
        if not sentences:
            return 0.0
        
        # Average sentence length
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Unique word ratio
        words = text.lower().split()
        unique_words = len(set(words))
        total_words = len(words)
        unique_ratio = unique_words / max(1, total_words)
        
        # Long word ratio (words > 6 characters)
        long_words = sum(1 for word in words if len(word) > 6)
        long_word_ratio = long_words / max(1, total_words)
        
        # Punctuation density
        punctuation_count = len(re.findall(r'[.!?;:,]', text))
        punctuation_density = punctuation_count / max(1, len(text))
        
        # Complexity score (0-1 scale)
        complexity = (
            min(1.0, avg_sentence_length / 20) * 0.3 +
            unique_ratio * 0.3 +
            long_word_ratio * 0.3 +
            min(1.0, punctuation_density * 100) * 0.1
        )
        
        return complexity
    
    def calculate_readability_score(self, text: str) -> float:
        """Calculate readability score for Romanian text"""
        sentences = [s for s in text.split('.') if s.strip()]
        words = text.split()
        
        if not sentences or not words:
            return 0.0
        
        # Basic metrics
        avg_words_per_sentence = len(words) / len(sentences)
        avg_chars_per_word = sum(len(word) for word in words) / len(words)
        
        # Romanian-specific readability (simplified Flesch formula adaptation)
        # Lower scores = easier reading
        readability_score = (
            206.835 - 
            (1.015 * avg_words_per_sentence) - 
            (84.6 * (avg_chars_per_word / 5.0))  # Adjust for Romanian
        )
        
        # Normalize to 0-1 scale (1 = most readable)
        normalized_score = max(0.0, min(1.0, readability_score / 100))
        
        return normalized_score

class TextAugmentationEngine:
    """Advanced text augmentation for Romanian training data"""
    
    def __init__(self):
        # Synonym replacements for common words
        self.romanian_synonyms = {
            'frumos': ['minunat', 'splendid', 'superb', 'magnific'],
            'mare': ['vast', 'imens', 'uriaș', 'colosal'],
            'mic': ['micut', 'minuscul', 'diminutiv', 'redus'],
            'bun': ['excelent', 'măreț', 'perfect', 'admirabil'],
            'rău': ['prost', 'dăunător', 'nociv', 'nedorit'],
            'fericit': ['vesel', 'bucuros', 'înveselit', 'îmbujurat'],
            'trist': ['supărat', 'întristat', 'melancolic', 'abătut']
        }
        
        # Cultural context expansions
        self.cultural_contexts = {
            'tradiție': 'obicei străvechi păstrat din generație în generație',
            'dor': 'sentiment profund de nostalgiem și dragoste specifică culturii românești',
            'neam': 'popor unit prin sânge, limbă și tradiție comună',
            'patrie': 'țara natală, pământul strămoșesc iubit'
        }
        
        logger.info("✅ Text augmentation engine initialized")
    
    def synonym_replacement(self, text: str, replacement_rate: float = 0.1) -> str:
        """Replace words with synonyms"""
        words = text.split()
        num_replacements = int(len(words) * replacement_rate)
        
        if num_replacements == 0:
            return text
        
        # Select random words to replace
        word_indices = random.sample(range(len(words)), 
                                   min(num_replacements, len(words)))
        
        for idx in word_indices:
            word = words[idx].lower().strip('.,;:!?')
            if word in self.romanian_synonyms:
                synonym = random.choice(self.romanian_synonyms[word])
                # Preserve original case
                if words[idx].isupper():
                    words[idx] = synonym.upper()
                elif words[idx].istitle():
                    words[idx] = synonym.capitalize()
                else:
                    words[idx] = synonym
        
        return ' '.join(words)
    
    def cultural_context_expansion(self, text: str) -> str:
        """Expand cultural terms with context"""
        expanded_text = text
        
        for term, expansion in self.cultural_contexts.items():
            # Find term in text (case insensitive)
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            matches = list(pattern.finditer(text))
            
            # Randomly choose to expand some occurrences
            for match in matches:
                if random.random() < 0.3:  # 30% chance to expand
                    start, end = match.span()
                    original_term = text[start:end]
                    expanded_text = expanded_text.replace(
                        original_term, 
                        f"{original_term} ({expansion})", 
                        1
                    )
        
        return expanded_text
    
    def sentence_shuffling(self, text: str) -> str:
        """Shuffle sentences while maintaining meaning"""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if len(sentences) <= 1:
            return text
        
        # Shuffle middle sentences, keep first and last
        if len(sentences) > 3:
            first_sentence = sentences[0]
            last_sentence = sentences[-1]
            middle_sentences = sentences[1:-1]
            random.shuffle(middle_sentences)
            sentences = [first_sentence] + middle_sentences + [last_sentence]
        
        return '. '.join(sentences) + '.'
    
    def generate_paraphrases(self, text: str, num_variants: int = 3) -> List[str]:
        """Generate paraphrased variants of text"""
        variants = []
        
        for _ in range(num_variants):
            variant = text
            
            # Apply different augmentation techniques
            techniques = [
                lambda x: self.synonym_replacement(x, 0.15),
                lambda x: self.cultural_context_expansion(x),
                lambda x: self.sentence_shuffling(x)
            ]
            
            # Randomly select and apply techniques
            selected_techniques = random.sample(techniques, 
                                              random.randint(1, len(techniques)))
            
            for technique in selected_techniques:
                variant = technique(variant)
            
            if variant != text and variant not in variants:
                variants.append(variant)
        
        return variants

class DatasetPreprocessor:
    """Main dataset preprocessing pipeline"""
    
    def __init__(self, database_path: str = "romai_training_dataset.db",
                 processed_database_path: str = "romai_preprocessed_dataset.db"):
        self.database_path = database_path
        self.processed_database_path = processed_database_path
        
        # Initialize processors
        self.text_processor = RomanianTextProcessor()
        self.augmentation_engine = TextAugmentationEngine()
        
        # Preprocessing statistics
        self.processing_stats = {
            'total_processed': 0,
            'augmented_entries': 0,
            'cultural_markers_found': 0,
            'quality_improvements': 0
        }
        
        # Initialize storage
        self._initialize_processed_storage()
        
        logger.info("🛠️ Dataset preprocessor initialized")
    
    def _initialize_processed_storage(self):
        """Initialize storage for preprocessed data"""
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS preprocessed_entries (
                entry_id TEXT PRIMARY KEY,
                original_content TEXT,
                processed_content TEXT,
                normalized_content TEXT,
                tokens TEXT,
                cultural_markers TEXT,
                sentiment_score REAL,
                complexity_score REAL,
                readability_score REAL,
                preprocessing_metadata TEXT,
                split_assignment TEXT DEFAULT 'train',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS augmented_variants (
                variant_id TEXT PRIMARY KEY,
                original_entry_id TEXT,
                variant_content TEXT,
                augmentation_type TEXT,
                quality_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS training_batches (
                batch_id TEXT PRIMARY KEY,
                entry_ids TEXT,
                batch_size INTEGER,
                sequence_length INTEGER,
                cultural_weight REAL,
                quality_threshold REAL,
                split_type TEXT,
                batch_metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Preprocessed dataset storage initialized")
    
    async def preprocess_dataset(self) -> Dict[str, int]:
        """Preprocess entire dataset"""
        logger.info("🛠️ Starting dataset preprocessing...")
        
        # Load raw dataset entries
        raw_entries = await self._load_raw_entries()
        logger.info(f"📥 Loaded {len(raw_entries)} raw entries")
        
        processed_entries = []
        
        for raw_entry in raw_entries:
            processed_entry = await self._preprocess_single_entry(raw_entry)
            processed_entries.append(processed_entry)
            
            # Store processed entry
            await self._store_processed_entry(processed_entry)
            
            # Generate augmented variants
            if processed_entry.complexity_score > 0.3:  # Only augment complex content
                augmented_variants = await self._generate_augmented_variants(
                    processed_entry, num_variants=2
                )
                
                for variant in augmented_variants:
                    await self._store_augmented_variant(processed_entry.entry_id, variant)
                
                self.processing_stats['augmented_entries'] += 1
            
            self.processing_stats['total_processed'] += 1
        
        # Create data splits
        await self._create_data_splits(processed_entries)
        
        # Generate training batches
        await self._generate_training_batches(processed_entries)
        
        logger.info(f"✅ Preprocessing completed: {len(processed_entries)} entries processed")
        return self.processing_stats
    
    async def _load_raw_entries(self) -> List[Dict[str, Any]]:
        """Load raw entries from original dataset"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT entry_id, content, content_type, source, author, title,
                   quality_score, cultural_relevance, educational_value, tags, metadata
            FROM dataset_entries
            WHERE quality_score > 0.5
        """)
        
        entries = []
        for row in cursor.fetchall():
            entry = {
                'entry_id': row[0],
                'content': row[1],
                'content_type': row[2],
                'source': row[3],
                'author': row[4],
                'title': row[5],
                'quality_score': row[6],
                'cultural_relevance': row[7],
                'educational_value': row[8],
                'tags': json.loads(row[9]) if row[9] else [],
                'metadata': json.loads(row[10]) if row[10] else {}
            }
            entries.append(entry)
        
        conn.close()
        return entries
    
    async def _preprocess_single_entry(self, raw_entry: Dict[str, Any]) -> PreprocessedEntry:
        """Preprocess single entry"""
        content = raw_entry['content']
        
        # Text preprocessing
        normalized_content = self.text_processor.normalize_diacritics(content)
        normalized_content = self.text_processor.remove_extra_whitespace(normalized_content)
        normalized_content = self.text_processor.fix_punctuation(normalized_content)
        
        # Extract cultural markers
        cultural_markers = self.text_processor.extract_cultural_markers(content)
        if cultural_markers:
            self.processing_stats['cultural_markers_found'] += len(cultural_markers)
        
        # Calculate scores
        complexity_score = self.text_processor.calculate_complexity_score(normalized_content)
        readability_score = self.text_processor.calculate_readability_score(normalized_content)
        
        # Simple sentiment analysis (placeholder - could be enhanced)
        sentiment_score = 0.5  # Neutral baseline
        
        # Tokenization (simple word-based)
        tokens = [word.strip('.,;:!?()[]{}""') for word in normalized_content.split()
                 if word.strip('.,;:!?()[]{}""')]
        
        # Create preprocessed entry
        processed_entry = PreprocessedEntry(
            entry_id=raw_entry['entry_id'],
            original_content=content,
            processed_content=normalized_content,
            normalized_content=normalized_content,
            tokens=tokens,
            cultural_markers=cultural_markers,
            sentiment_score=sentiment_score,
            complexity_score=complexity_score,
            readability_score=readability_score,
            preprocessing_metadata={
                'original_length': len(content),
                'processed_length': len(normalized_content),
                'token_count': len(tokens),
                'cultural_marker_count': len(cultural_markers),
                'quality_improvement': max(0.0, readability_score - 0.5),
                'source_metadata': raw_entry.get('metadata', {})
            }
        )
        
        # Quality improvement tracking
        if processed_entry.preprocessing_metadata['quality_improvement'] > 0.1:
            self.processing_stats['quality_improvements'] += 1
        
        return processed_entry
    
    async def _generate_augmented_variants(self, entry: PreprocessedEntry, 
                                         num_variants: int = 2) -> List[str]:
        """Generate augmented variants of an entry"""
        variants = self.augmentation_engine.generate_paraphrases(
            entry.processed_content, num_variants
        )
        return variants
    
    async def _store_processed_entry(self, entry: PreprocessedEntry):
        """Store preprocessed entry"""
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO preprocessed_entries
            (entry_id, original_content, processed_content, normalized_content,
             tokens, cultural_markers, sentiment_score, complexity_score, 
             readability_score, preprocessing_metadata, split_assignment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry.entry_id,
            entry.original_content,
            entry.processed_content,
            entry.normalized_content,
            json.dumps(entry.tokens),
            json.dumps(entry.cultural_markers),
            entry.sentiment_score,
            entry.complexity_score,
            entry.readability_score,
            json.dumps(entry.preprocessing_metadata),
            entry.split_assignment
        ))
        
        conn.commit()
        conn.close()
    
    async def _store_augmented_variant(self, original_id: str, variant_content: str):
        """Store augmented variant"""
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO augmented_variants
            (variant_id, original_entry_id, variant_content, augmentation_type, quality_score)
            VALUES (?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            original_id,
            variant_content,
            'paraphrase_generation',
            0.8  # Assume good quality for generated variants
        ))
        
        conn.commit()
        conn.close()
    
    async def _create_data_splits(self, processed_entries: List[PreprocessedEntry]):
        """Create train/validation/test splits"""
        # Shuffle entries
        shuffled_entries = processed_entries.copy()
        random.shuffle(shuffled_entries)
        
        total_entries = len(shuffled_entries)
        train_size = int(0.7 * total_entries)
        val_size = int(0.15 * total_entries)
        
        # Assign splits
        for i, entry in enumerate(shuffled_entries):
            if i < train_size:
                entry.split_assignment = "train"
            elif i < train_size + val_size:
                entry.split_assignment = "validation"
            else:
                entry.split_assignment = "test"
        
        # Update database
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        for entry in shuffled_entries:
            cursor.execute("""
                UPDATE preprocessed_entries 
                SET split_assignment = ? 
                WHERE entry_id = ?
            """, (entry.split_assignment, entry.entry_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"📊 Data splits created: {train_size} train, {val_size} validation, {total_entries - train_size - val_size} test")
    
    async def _generate_training_batches(self, processed_entries: List[PreprocessedEntry]):
        """Generate training batches with optimal sizing"""
        batch_size = 32
        splits = {"train": [], "validation": [], "test": []}
        
        # Group by splits
        for entry in processed_entries:
            splits[entry.split_assignment].append(entry)
        
        # Generate batches for each split
        for split_name, split_entries in splits.items():
            batches = []
            for i in range(0, len(split_entries), batch_size):
                batch_entries = split_entries[i:i + batch_size]
                
                if len(batch_entries) >= batch_size // 2:  # Minimum viable batch size
                    batch = TrainingBatch(
                        entries=batch_entries,
                        batch_size=len(batch_entries),
                        sequence_length=512,
                        cultural_weight=1.0,
                        quality_threshold=0.7,
                        batch_metadata={
                            'split': split_name,
                            'avg_complexity': sum(e.complexity_score for e in batch_entries) / len(batch_entries),
                            'avg_cultural_markers': sum(len(e.cultural_markers) for e in batch_entries) / len(batch_entries),
                            'content_types': list(set(e.preprocessing_metadata.get('source_metadata', {}).get('content_type', 'unknown') 
                                                    for e in batch_entries))
                        }
                    )
                    batches.append(batch)
            
            # Store batches
            await self._store_training_batches(batches, split_name)
            logger.info(f"📦 Generated {len(batches)} batches for {split_name} split")
    
    async def _store_training_batches(self, batches: List[TrainingBatch], split_name: str):
        """Store training batches"""
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        for batch in batches:
            entry_ids = [entry.entry_id for entry in batch.entries]
            
            cursor.execute("""
                INSERT INTO training_batches
                (batch_id, entry_ids, batch_size, sequence_length, cultural_weight,
                 quality_threshold, split_type, batch_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                batch.batch_id,
                json.dumps(entry_ids),
                batch.batch_size,
                batch.sequence_length,
                batch.cultural_weight,
                batch.quality_threshold,
                split_name,
                json.dumps(batch.batch_metadata)
            ))
        
        conn.commit()
        conn.close()
    
    async def get_preprocessing_insights(self) -> Dict[str, Any]:
        """Get comprehensive preprocessing insights"""
        conn = sqlite3.connect(self.processed_database_path)
        cursor = conn.cursor()
        
        # Basic statistics
        cursor.execute("SELECT COUNT(*) FROM preprocessed_entries")
        total_processed = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM augmented_variants")
        total_variants = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(complexity_score), AVG(readability_score) FROM preprocessed_entries")
        avg_complexity, avg_readability = cursor.fetchone()
        
        # Split distribution
        cursor.execute("SELECT split_assignment, COUNT(*) FROM preprocessed_entries GROUP BY split_assignment")
        split_distribution = dict(cursor.fetchall())
        
        # Cultural markers statistics
        cursor.execute("SELECT cultural_markers FROM preprocessed_entries WHERE cultural_markers != '[]'")
        all_markers = []
        for row in cursor.fetchall():
            markers = json.loads(row[0])
            all_markers.extend(markers)
        
        marker_counts = Counter(all_markers)
        
        conn.close()
        
        insights = {
            "preprocessing_summary": {
                "total_processed_entries": total_processed,
                "total_augmented_variants": total_variants,
                "processing_stats": self.processing_stats
            },
            "quality_metrics": {
                "average_complexity_score": avg_complexity or 0.0,
                "average_readability_score": avg_readability or 0.0,
                "quality_improvements": self.processing_stats.get('quality_improvements', 0)
            },
            "data_splits": split_distribution,
            "cultural_analysis": {
                "total_cultural_markers": len(all_markers),
                "unique_cultural_markers": len(marker_counts),
                "top_cultural_markers": dict(marker_counts.most_common(10))
            },
            "augmentation_effectiveness": {
                "augmented_entry_ratio": total_variants / max(1, total_processed),
                "augmented_entries": self.processing_stats.get('augmented_entries', 0)
            }
        }
        
        return insights
    
    async def demonstrate_preprocessing(self):
        """Demonstrate preprocessing capabilities"""
        logger.info("🛠️ ROMAI DATASET PREPROCESSING DEMONSTRATION")
        logger.info("=" * 60)
        
        # Run preprocessing
        stats = await self.preprocess_dataset()
        
        logger.info("\n📊 Preprocessing Statistics:")
        for key, value in stats.items():
            logger.info(f"   {key.replace('_', ' ').title()}: {value}")
        
        # Get comprehensive insights
        insights = await self.get_preprocessing_insights()
        
        logger.info("\n🔍 Preprocessing Insights:")
        
        # Processing summary
        processing_summary = insights['preprocessing_summary']
        logger.info(f"   Total processed entries: {processing_summary['total_processed_entries']}")
        logger.info(f"   Total augmented variants: {processing_summary['total_augmented_variants']}")
        
        # Quality metrics
        quality_metrics = insights['quality_metrics']
        logger.info(f"   Average complexity score: {quality_metrics['average_complexity_score']:.3f}")
        logger.info(f"   Average readability score: {quality_metrics['average_readability_score']:.3f}")
        logger.info(f"   Quality improvements: {quality_metrics['quality_improvements']}")
        
        # Data splits
        logger.info("\n📊 Data Split Distribution:")
        for split, count in insights['data_splits'].items():
            logger.info(f"   {split}: {count} entries")
        
        # Cultural analysis
        cultural_analysis = insights['cultural_analysis']
        logger.info(f"\n🎭 Cultural Analysis:")
        logger.info(f"   Total cultural markers found: {cultural_analysis['total_cultural_markers']}")
        logger.info(f"   Unique cultural markers: {cultural_analysis['unique_cultural_markers']}")
        
        logger.info("\n🏆 Top Cultural Markers:")
        for marker, count in cultural_analysis['top_cultural_markers'].items():
            logger.info(f"   {marker}: {count} occurrences")
        
        # Augmentation effectiveness
        augmentation = insights['augmentation_effectiveness']
        logger.info(f"\n🔄 Augmentation Effectiveness:")
        logger.info(f"   Augmented entry ratio: {augmentation['augmented_entry_ratio']:.2f}")
        logger.info(f"   Total augmented entries: {augmentation['augmented_entries']}")
        
        logger.info("\n✅ Dataset preprocessing demonstration completed successfully!")

async def main():
    """Main execution for dataset preprocessing"""
    preprocessor = DatasetPreprocessor()
    await preprocessor.demonstrate_preprocessing()

if __name__ == "__main__":
    asyncio.run(main())