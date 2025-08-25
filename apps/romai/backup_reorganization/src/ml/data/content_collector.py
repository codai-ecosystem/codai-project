#!/usr/bin/env python3
"""
RomAI Content Collector
Intelligent collection system for Romanian cultural and educational content

This module provides:
- Web scraping for Romanian content
- API integrations for cultural databases
- Content validation and filtering
- Automated content curation
- Real-time content updates
- Quality assessment and scoring
"""

import logging
import asyncio
import json
import sqlite3
import aiohttp
import aiofiles
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import hashlib
import re
import uuid
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import feedparser
from collections import defaultdict
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ContentSource:
    """Content source configuration"""
    source_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    base_url: str = ""
    source_type: str = ""  # web, api, rss, database
    content_types: List[str] = field(default_factory=list)
    extraction_rules: Dict[str, str] = field(default_factory=dict)
    quality_threshold: float = 0.6
    cultural_relevance: float = 0.0
    update_frequency: int = 24  # hours
    is_active: bool = True
    last_updated: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class CollectedContent:
    """Collected content entry"""
    content_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    url: str = ""
    title: str = ""
    content: str = ""
    content_type: str = ""
    source_id: str = ""
    author: Optional[str] = None
    publish_date: Optional[datetime] = None
    language: str = "ro"
    quality_score: float = 0.0
    cultural_relevance: float = 0.0
    educational_value: float = 0.0
    tags: List[str] = field(default_factory=list)
    extraction_metadata: Dict[str, Any] = field(default_factory=dict)
    validation_status: str = "pending"  # pending, approved, rejected
    collected_at: datetime = field(default_factory=datetime.now)

class RomanianContentExtractor:
    """Extract Romanian content from web sources"""
    
    def __init__(self):
        # Cultural content indicators
        self.cultural_indicators = [
            'tradiție', 'tradițional', 'obicei', 'datină', 'folclor',
            'român', 'româna', 'românesc', 'românească', 'România',
            'cultură', 'cultural', 'culturale', 'patrimoniu',
            'istorie', 'istoric', 'istorice', 'moștenire',
            'artă', 'literatură', 'poezie', 'proză', 'dramă'
        ]
        
        # Quality indicators
        self.quality_indicators = {
            'positive': [
                'educativ', 'documentar', 'academic', 'științific',
                'cercetare', 'studiu', 'analiză', 'explicație',
                'detaliat', 'complet', 'fundamentat'
            ],
            'negative': [
                'clickbait', 'senzațional', 'fără bază', 'nefondat',
                'superficial', 'incomplet', 'confuz'
            ]
        }
        
        # Content selectors for common Romanian sites
        self.site_selectors = {
            'wikipedia.org': {
                'title': 'h1.firstHeading',
                'content': 'div.mw-parser-output',
                'author': 'meta[name="author"]',
                'language': 'html[lang]'
            },
            'romania-insider.com': {
                'title': 'h1.entry-title',
                'content': 'div.entry-content',
                'author': 'span.author',
                'date': 'time.entry-date'
            },
            'dexonline.ro': {
                'title': 'h1',
                'content': 'div.definition',
                'language': 'html[lang]'
            },
            'default': {
                'title': ['h1', 'title', '.title', '.headline'],
                'content': ['article', 'main', '.content', '.article-content', '.post-content'],
                'author': ['.author', '.by-author', '.article-author'],
                'date': ['time', '.date', '.publish-date', '.article-date']
            }
        }
        
        logger.info("✅ Romanian content extractor initialized")
    
    async def extract_from_url(self, url: str, source_config: ContentSource) -> Optional[CollectedContent]:
        """Extract content from a URL"""
        try:
            timeout = aiohttp.ClientTimeout(total=30)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                headers = {
                    'User-Agent': 'RomAI Content Collector 1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ro,ro-RO;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate'
                }
                
                async with session.get(url, headers=headers) as response:
                    if response.status != 200:
                        logger.warning(f"HTTP {response.status} for {url}")
                        return None
                    
                    html_content = await response.text()
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    # Extract content using selectors
                    extracted = await self._extract_with_selectors(soup, url, source_config)
                    
                    if extracted and self._validate_content(extracted.content):
                        # Calculate scores
                        extracted.quality_score = self._calculate_quality_score(extracted.content)
                        extracted.cultural_relevance = self._calculate_cultural_relevance(extracted.content)
                        extracted.educational_value = self._calculate_educational_value(extracted.content)
                        
                        # Extract tags
                        extracted.tags = self._extract_tags(extracted.content, extracted.title)
                        
                        return extracted
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Error extracting from {url}: {e}")
            return None
    
    async def _extract_with_selectors(self, soup: BeautifulSoup, url: str, 
                                    source_config: ContentSource) -> Optional[CollectedContent]:
        """Extract content using CSS selectors"""
        domain = urlparse(url).netloc
        selectors = self.site_selectors.get(domain, self.site_selectors['default'])
        
        # Extract title
        title = ""
        title_selectors = selectors.get('title', ['h1'])
        if isinstance(title_selectors, str):
            title_selectors = [title_selectors]
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get_text(strip=True)
                break
        
        # Extract main content
        content = ""
        content_selectors = selectors.get('content', ['article'])
        if isinstance(content_selectors, str):
            content_selectors = [content_selectors]
        
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                # Remove unwanted elements
                for unwanted in element.select('script, style, nav, footer, aside, .advertisement'):
                    unwanted.decompose()
                
                content = element.get_text(separator=' ', strip=True)
                break
        
        # Extract author
        author = None
        author_selectors = selectors.get('author', [])
        if isinstance(author_selectors, str):
            author_selectors = [author_selectors]
        
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element:
                author = element.get_text(strip=True)
                break
        
        # Extract date
        publish_date = None
        date_selectors = selectors.get('date', [])
        if isinstance(date_selectors, str):
            date_selectors = [date_selectors]
        
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                date_text = element.get('datetime') or element.get_text(strip=True)
                # Simple date parsing (could be enhanced)
                try:
                    publish_date = datetime.fromisoformat(date_text.replace('Z', '+00:00'))
                except:
                    pass
                break
        
        if not content or len(content) < 100:  # Minimum content length
            return None
        
        return CollectedContent(
            url=url,
            title=title,
            content=content,
            content_type=source_config.name,
            source_id=source_config.source_id,
            author=author,
            publish_date=publish_date,
            extraction_metadata={
                'extraction_method': 'css_selectors',
                'domain': domain,
                'content_length': len(content),
                'title_length': len(title)
            }
        )
    
    def _validate_content(self, content: str) -> bool:
        """Validate extracted content"""
        if not content or len(content) < 50:
            return False
        
        # Check for Romanian language indicators
        romanian_chars = ['ă', 'â', 'î', 'ș', 'ț']
        has_romanian = any(char in content.lower() for char in romanian_chars)
        
        # Check for common Romanian words
        romanian_words = [
            'și', 'cu', 'de', 'în', 'la', 'pentru', 'care', 'este', 'sunt',
            'acest', 'această', 'acestea', 'român', 'românia'
        ]
        word_count = sum(1 for word in romanian_words if word in content.lower())
        
        return has_romanian or word_count >= 3
    
    def _calculate_quality_score(self, content: str) -> float:
        """Calculate content quality score"""
        score = 0.5  # Base score
        
        # Length factor
        length_bonus = min(0.3, len(content) / 2000 * 0.3)
        score += length_bonus
        
        # Positive quality indicators
        positive_count = sum(1 for indicator in self.quality_indicators['positive'] 
                           if indicator in content.lower())
        score += min(0.2, positive_count * 0.02)
        
        # Negative quality indicators (penalty)
        negative_count = sum(1 for indicator in self.quality_indicators['negative'] 
                           if indicator in content.lower())
        score -= min(0.2, negative_count * 0.03)
        
        # Sentence structure (simple check)
        sentences = content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(1, len(sentences))
        if 10 <= avg_sentence_length <= 25:  # Optimal range
            score += 0.1
        
        return max(0.0, min(1.0, score))
    
    def _calculate_cultural_relevance(self, content: str) -> float:
        """Calculate cultural relevance score"""
        relevance = 0.0
        
        # Count cultural indicators
        indicator_count = sum(1 for indicator in self.cultural_indicators 
                            if indicator.lower() in content.lower())
        
        relevance = min(1.0, indicator_count / 10.0)  # Normalize to 0-1
        
        # Boost for Romanian-specific content
        romanian_specific = ['dacii', 'geto-daci', 'mihai eminescu', 'ion luca caragiale',
                           'lucian blaga', 'constantin noica', 'mircea eliade']
        
        specific_count = sum(1 for term in romanian_specific if term in content.lower())
        relevance += min(0.3, specific_count * 0.1)
        
        return min(1.0, relevance)
    
    def _calculate_educational_value(self, content: str) -> float:
        """Calculate educational value score"""
        educational_terms = [
            'explicație', 'definiție', 'exemplu', 'analiză', 'studiu',
            'cercetare', 'teorie', 'principiu', 'concept', 'metoda'
        ]
        
        educational_count = sum(1 for term in educational_terms 
                              if term in content.lower())
        
        # Questions indicate educational content
        question_count = content.count('?')
        
        # Lists and structured content
        list_indicators = content.count('1.') + content.count('•') + content.count('-')
        
        educational_value = (
            min(0.4, educational_count * 0.05) +
            min(0.3, question_count * 0.02) +
            min(0.3, list_indicators * 0.01)
        )
        
        return min(1.0, educational_value)
    
    def _extract_tags(self, content: str, title: str) -> List[str]:
        """Extract relevant tags from content"""
        tags = []
        
        # Extract tags from cultural indicators found
        for indicator in self.cultural_indicators:
            if indicator.lower() in content.lower():
                tags.append(indicator)
        
        # Extract proper nouns (simplified)
        words = (title + ' ' + content).split()
        proper_nouns = [word.strip('.,;:!?()[]{}""') for word in words 
                       if word and word[0].isupper() and len(word) > 3]
        
        # Add most frequent proper nouns as tags
        noun_counts = {}
        for noun in proper_nouns:
            noun_counts[noun] = noun_counts.get(noun, 0) + 1
        
        # Take top 5 most frequent proper nouns
        frequent_nouns = sorted(noun_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        tags.extend([noun for noun, count in frequent_nouns if count > 1])
        
        return list(set(tags))  # Remove duplicates

class ContentCollectionManager:
    """Manage content collection from multiple sources"""
    
    def __init__(self, database_path: str = "romai_collected_content.db"):
        self.database_path = database_path
        self.content_extractor = RomanianContentExtractor()
        
        # Predefined content sources
        self.default_sources = [
            ContentSource(
                name="Wikipedia România",
                base_url="https://ro.wikipedia.org",
                source_type="web",
                content_types=["educational", "cultural", "historical"],
                quality_threshold=0.8,
                cultural_relevance=0.9
            ),
            ContentSource(
                name="Dexonline",
                base_url="https://dexonline.ro",
                source_type="web",
                content_types=["linguistic", "educational"],
                quality_threshold=0.7,
                cultural_relevance=1.0
            ),
            ContentSource(
                name="Romania Insider",
                base_url="https://www.romania-insider.com",
                source_type="web",
                content_types=["news", "cultural", "contemporary"],
                quality_threshold=0.6,
                cultural_relevance=0.7
            ),
            ContentSource(
                name="Agerpres",
                base_url="https://www.agerpres.ro",
                source_type="web",
                content_types=["news", "official", "cultural"],
                quality_threshold=0.7,
                cultural_relevance=0.8
            ),
            ContentSource(
                name="Ziarule",
                base_url="https://ziarule.ro",
                source_type="web", 
                content_types=["news", "social", "cultural"],
                quality_threshold=0.6,
                cultural_relevance=0.7
            )
        ]
        
        # Collection statistics
        self.collection_stats = {
            'total_collected': 0,
            'successful_extractions': 0,
            'failed_extractions': 0,
            'high_quality_content': 0,
            'culturally_relevant_content': 0
        }
        
        self._initialize_storage()
        logger.info("📡 Content collection manager initialized")
    
    def _initialize_storage(self):
        """Initialize storage for collected content"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_sources (
                source_id TEXT PRIMARY KEY,
                name TEXT,
                base_url TEXT,
                source_type TEXT,
                content_types TEXT,
                extraction_rules TEXT,
                quality_threshold REAL,
                cultural_relevance REAL,
                update_frequency INTEGER,
                is_active BOOLEAN,
                last_updated TIMESTAMP,
                metadata TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collected_content (
                content_id TEXT PRIMARY KEY,
                url TEXT UNIQUE,
                title TEXT,
                content TEXT,
                content_type TEXT,
                source_id TEXT,
                author TEXT,
                publish_date TIMESTAMP,
                language TEXT DEFAULT 'ro',
                quality_score REAL,
                cultural_relevance REAL,
                educational_value REAL,
                tags TEXT,
                extraction_metadata TEXT,
                validation_status TEXT DEFAULT 'pending',
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES content_sources (source_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collection_sessions (
                session_id TEXT PRIMARY KEY,
                source_id TEXT,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                urls_processed INTEGER,
                successful_extractions INTEGER,
                failed_extractions INTEGER,
                session_metadata TEXT
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_quality ON collected_content(quality_score)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_cultural ON collected_content(cultural_relevance)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_date ON collected_content(collected_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_source ON collected_content(source_id)")
        
        conn.commit()
        conn.close()
        logger.info("✅ Collection storage initialized")
    
    async def initialize_default_sources(self):
        """Initialize default content sources"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        for source in self.default_sources:
            cursor.execute("""
                INSERT OR REPLACE INTO content_sources
                (source_id, name, base_url, source_type, content_types,
                 quality_threshold, cultural_relevance, update_frequency, is_active, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                source.source_id,
                source.name,
                source.base_url,
                source.source_type,
                json.dumps(source.content_types),
                source.quality_threshold,
                source.cultural_relevance,
                source.update_frequency,
                source.is_active,
                json.dumps(source.metadata)
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"✅ Initialized {len(self.default_sources)} default content sources")
    
    async def collect_from_urls(self, urls: List[str], source_id: str) -> List[CollectedContent]:
        """Collect content from a list of URLs"""
        source = await self._get_source_by_id(source_id)
        if not source:
            logger.error(f"Source {source_id} not found")
            return []
        
        collected_content = []
        session_id = str(uuid.uuid4())
        
        # Start collection session
        await self._start_collection_session(session_id, source_id, len(urls))
        
        successful = 0
        failed = 0
        
        for url in urls:
            try:
                content = await self.content_extractor.extract_from_url(url, source)
                
                if content and content.quality_score >= source.quality_threshold:
                    # Store content
                    await self._store_collected_content(content)
                    collected_content.append(content)
                    
                    self.collection_stats['successful_extractions'] += 1
                    if content.quality_score > 0.8:
                        self.collection_stats['high_quality_content'] += 1
                    if content.cultural_relevance > 0.7:
                        self.collection_stats['culturally_relevant_content'] += 1
                    
                    successful += 1
                    logger.info(f"✅ Collected: {content.title[:50]}... (Q:{content.quality_score:.2f}, C:{content.cultural_relevance:.2f})")
                else:
                    failed += 1
                    logger.warning(f"❌ Failed to extract quality content from: {url}")
                    self.collection_stats['failed_extractions'] += 1
                
            except Exception as e:
                failed += 1
                self.collection_stats['failed_extractions'] += 1
                logger.error(f"❌ Error processing {url}: {e}")
            
            # Rate limiting - be respectful to servers
            await asyncio.sleep(1)
        
        # End collection session
        await self._end_collection_session(session_id, successful, failed)
        
        self.collection_stats['total_collected'] += len(collected_content)
        logger.info(f"📊 Collection completed: {successful} successful, {failed} failed")
        
        return collected_content
    
    async def collect_sample_content(self) -> List[CollectedContent]:
        """Collect sample content from predefined Romanian sources"""
        logger.info("📡 Collecting sample Romanian content...")
        
        # Sample URLs for different content types
        sample_urls = {
            self.default_sources[0].source_id: [  # Wikipedia
                "https://ro.wikipedia.org/wiki/Mihai_Eminescu",
                "https://ro.wikipedia.org/wiki/Istoria_României", 
                "https://ro.wikipedia.org/wiki/Cultura_României",
                "https://ro.wikipedia.org/wiki/Folclorul_românesc",
                "https://ro.wikipedia.org/wiki/Limba_română"
            ]
        }
        
        all_collected = []
        
        for source_id, urls in sample_urls.items():
            collected = await self.collect_from_urls(urls, source_id)
            all_collected.extend(collected)
        
        return all_collected
    
    async def _get_source_by_id(self, source_id: str) -> Optional[ContentSource]:
        """Get content source by ID"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT source_id, name, base_url, source_type, content_types,
                   quality_threshold, cultural_relevance, update_frequency, is_active, metadata
            FROM content_sources WHERE source_id = ?
        """, (source_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return ContentSource(
                source_id=row[0],
                name=row[1],
                base_url=row[2],
                source_type=row[3],
                content_types=json.loads(row[4]) if row[4] else [],
                quality_threshold=row[5],
                cultural_relevance=row[6],
                update_frequency=row[7],
                is_active=bool(row[8]),
                metadata=json.loads(row[9]) if row[9] else {}
            )
        return None
    
    async def _start_collection_session(self, session_id: str, source_id: str, url_count: int):
        """Start a collection session"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO collection_sessions 
            (session_id, source_id, start_time, urls_processed)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        """, (session_id, source_id, url_count))
        
        conn.commit()
        conn.close()
    
    async def _end_collection_session(self, session_id: str, successful: int, failed: int):
        """End a collection session"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE collection_sessions 
            SET end_time = CURRENT_TIMESTAMP, 
                successful_extractions = ?, 
                failed_extractions = ?
            WHERE session_id = ?
        """, (successful, failed, session_id))
        
        conn.commit()
        conn.close()
    
    async def _store_collected_content(self, content: CollectedContent):
        """Store collected content"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO collected_content
            (content_id, url, title, content, content_type, source_id, author,
             publish_date, language, quality_score, cultural_relevance, 
             educational_value, tags, extraction_metadata, validation_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            content.content_id,
            content.url,
            content.title,
            content.content,
            content.content_type,
            content.source_id,
            content.author,
            content.publish_date,
            content.language,
            content.quality_score,
            content.cultural_relevance,
            content.educational_value,
            json.dumps(content.tags),
            json.dumps(content.extraction_metadata),
            content.validation_status
        ))
        
        conn.commit()
        conn.close()
    
    async def get_collection_insights(self) -> Dict[str, Any]:
        """Get comprehensive collection insights"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Basic statistics
        cursor.execute("SELECT COUNT(*) FROM collected_content")
        total_content = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(quality_score), AVG(cultural_relevance), AVG(educational_value) FROM collected_content")
        avg_quality, avg_cultural, avg_educational = cursor.fetchone()
        
        # Content type distribution
        cursor.execute("SELECT content_type, COUNT(*) FROM collected_content GROUP BY content_type")
        content_type_dist = dict(cursor.fetchall())
        
        # Source distribution
        cursor.execute("""
            SELECT cs.name, COUNT(*) 
            FROM collected_content cc
            JOIN content_sources cs ON cc.source_id = cs.source_id
            GROUP BY cs.name
        """)
        source_dist = dict(cursor.fetchall())
        
        # Quality distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN quality_score > 0.8 THEN 'high'
                    WHEN quality_score > 0.6 THEN 'medium'
                    ELSE 'low'
                END as quality_range,
                COUNT(*) 
            FROM collected_content 
            GROUP BY quality_range
        """)
        quality_dist = dict(cursor.fetchall())
        
        # Recent collections
        cursor.execute("""
            SELECT COUNT(*) FROM collected_content 
            WHERE collected_at > datetime('now', '-24 hours')
        """)
        recent_collections = cursor.fetchone()[0]
        
        conn.close()
        
        insights = {
            "collection_summary": {
                "total_content_pieces": total_content,
                "average_quality_score": avg_quality or 0.0,
                "average_cultural_relevance": avg_cultural or 0.0,
                "average_educational_value": avg_educational or 0.0,
                "recent_collections_24h": recent_collections
            },
            "content_distribution": {
                "by_type": content_type_dist,
                "by_source": source_dist,
                "by_quality": quality_dist
            },
            "collection_statistics": self.collection_stats,
            "source_overview": {
                "total_sources": len(self.default_sources),
                "active_sources": sum(1 for s in self.default_sources if s.is_active)
            }
        }
        
        return insights
    
    async def demonstrate_content_collection(self):
        """Demonstrate content collection capabilities"""
        logger.info("📡 ROMAI CONTENT COLLECTION DEMONSTRATION")
        logger.info("=" * 60)
        
        # Initialize sources
        await self.initialize_default_sources()
        
        # Collect sample content
        collected_content = await self.collect_sample_content()
        
        logger.info(f"\n📊 Collection Results:")
        logger.info(f"   Total content collected: {len(collected_content)}")
        
        if collected_content:
            # Show sample collected content
            logger.info("\n📖 Sample Collected Content:")
            for i, content in enumerate(collected_content[:3]):
                logger.info(f"\n   Sample {i+1}:")
                logger.info(f"     Title: {content.title}")
                logger.info(f"     URL: {content.url}")
                logger.info(f"     Content Length: {len(content.content)} characters")
                logger.info(f"     Quality Score: {content.quality_score:.2f}")
                logger.info(f"     Cultural Relevance: {content.cultural_relevance:.2f}")
                logger.info(f"     Educational Value: {content.educational_value:.2f}")
                logger.info(f"     Tags: {', '.join(content.tags[:5])}")
                logger.info(f"     Content Preview: {content.content[:150]}...")
        
        # Get comprehensive insights
        insights = await self.get_collection_insights()
        
        logger.info("\n🔍 Collection Insights:")
        
        # Collection summary
        summary = insights['collection_summary']
        logger.info(f"   Total content pieces: {summary['total_content_pieces']}")
        logger.info(f"   Average quality score: {summary['average_quality_score']:.3f}")
        logger.info(f"   Average cultural relevance: {summary['average_cultural_relevance']:.3f}")
        logger.info(f"   Average educational value: {summary['average_educational_value']:.3f}")
        logger.info(f"   Recent collections (24h): {summary['recent_collections_24h']}")
        
        # Distribution stats
        distribution = insights['content_distribution']
        logger.info("\n📊 Content Distribution:")
        logger.info(f"   By Type: {distribution['by_type']}")
        logger.info(f"   By Source: {distribution['by_source']}")
        logger.info(f"   By Quality: {distribution['by_quality']}")
        
        # Collection statistics
        stats = insights['collection_statistics']
        logger.info(f"\n📈 Collection Statistics:")
        for key, value in stats.items():
            logger.info(f"   {key.replace('_', ' ').title()}: {value}")
        
        logger.info("\n✅ Content collection demonstration completed successfully!")

async def main():
    """Main execution for content collection"""
    collector = ContentCollectionManager()
    await collector.demonstrate_content_collection()

if __name__ == "__main__":
    asyncio.run(main())