#!/usr/bin/env python3
"""
🇷🇴 RomAI Romanian Data Collection System
World-Class Data Gathering for Romanian AGI Supremacy

This system implements massive, automated collection of Romanian content
targeting 5TB+ of high-quality data to make RomAI the world's premier
Romanian artificial intelligence system.

Target Data Sources:
- Government documents and official publications (500GB)
- Literature, poetry, and cultural content (1TB) 
- News media and journalism (1TB)
- Academic papers and research (500GB)
- Web content, forums, and social media (2TB)

Author: GitHub Copilot Agent
Date: August 26, 2025
Status: Production Implementation - Data Collection Phase 1
"""

import os
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass
import json
import hashlib
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import feedparser
import requests
from concurrent.futures import ThreadPoolExecutor
import sqlite3
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('romanian_data_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DataSource:
    """Configuration for a Romanian data source"""
    name: str
    url: str
    category: str  # government, literature, news, academic, web
    priority: int  # 1-10, higher = more important
    scraping_rules: Dict
    expected_size_gb: float
    update_frequency: str  # daily, weekly, monthly
    language_filter: bool = True
    quality_threshold: float = 0.8

class RomanianDataCollector:
    """
    Comprehensive Romanian data collection system for world-class AGI training
    """
    
    def __init__(self, data_directory: str = "./romanian_data"):
        self.data_directory = Path(data_directory)
        self.data_directory.mkdir(exist_ok=True)
        
        # Create subdirectories for different data types
        for category in ['government', 'literature', 'news', 'academic', 'web', 'processed']:
            (self.data_directory / category).mkdir(exist_ok=True)
        
        self.db_path = self.data_directory / "collection_metadata.db"
        self.setup_database()
        
        # Statistics tracking
        self.stats = {
            'total_documents': 0,
            'total_size_mb': 0,
            'documents_by_category': {},
            'quality_scores': [],
            'collection_start_time': datetime.now(),
            'last_update': datetime.now()
        }
        
        # Thread-safe components
        self.lock = threading.Lock()
        self.collected_urls = set()
        self.session_timeout = aiohttp.ClientTimeout(total=30)
        
        logger.info("🇷🇴 Romanian Data Collector initialized")
        logger.info(f"📁 Data directory: {self.data_directory}")
        logger.info(f"🎯 Target: 5TB+ Romanian content for world-class AGI")
    
    def setup_database(self):
        """Initialize SQLite database for metadata tracking"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE,
                    title TEXT,
                    content_hash TEXT,
                    category TEXT,
                    file_path TEXT,
                    size_bytes INTEGER,
                    quality_score REAL,
                    language_confidence REAL,
                    collection_date TIMESTAMP,
                    last_updated TIMESTAMP,
                    metadata TEXT
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS collection_stats (
                    category TEXT PRIMARY KEY,
                    document_count INTEGER,
                    total_size_bytes INTEGER,
                    average_quality REAL,
                    last_collection TIMESTAMP
                )
            ''')
            conn.commit()
        logger.info("📊 Database initialized for metadata tracking")
    
    def get_high_priority_sources(self) -> List[DataSource]:
        """Define high-priority Romanian data sources for immediate collection"""
        return [
            # Romanian Government Sources (Highest Priority)
            DataSource(
                name="Romanian Parliament",
                url="http://www.cdep.ro",
                category="government",
                priority=10,
                scraping_rules={"depth": 3, "content_selectors": [".content", ".article-content"]},
                expected_size_gb=50.0,
                update_frequency="daily",
                quality_threshold=0.9
            ),
            DataSource(
                name="Romanian Government Portal", 
                url="https://gov.ro",
                category="government",
                priority=10,
                scraping_rules={"depth": 2, "content_selectors": [".content", "main"]},
                expected_size_gb=30.0,
                update_frequency="daily",
                quality_threshold=0.9
            ),
            DataSource(
                name="Romanian Constitution & Laws",
                url="http://www.constitutiaromaniei.ro",
                category="government", 
                priority=10,
                scraping_rules={"depth": 5, "content_selectors": [".law-text", ".article"]},
                expected_size_gb=10.0,
                update_frequency="weekly",
                quality_threshold=0.95
            ),
            
            # News and Media Sources
            DataSource(
                name="Adevărul News",
                url="https://adevarul.ro",
                category="news",
                priority=9,
                scraping_rules={"depth": 2, "content_selectors": [".article-content", ".story-content"]},
                expected_size_gb=100.0,
                update_frequency="daily",
                quality_threshold=0.8
            ),
            DataSource(
                name="Digi24 News",
                url="https://www.digi24.ro",
                category="news", 
                priority=9,
                scraping_rules={"depth": 2, "content_selectors": [".article-body", ".content"]},
                expected_size_gb=80.0,
                update_frequency="daily",
                quality_threshold=0.8
            ),
            
            # Academic and Cultural Sources
            DataSource(
                name="Romanian Academy",
                url="https://www.acad.ro",
                category="academic",
                priority=9,
                scraping_rules={"depth": 3, "content_selectors": [".content", ".publication"]},
                expected_size_gb=25.0,
                update_frequency="weekly",
                quality_threshold=0.9
            ),
            DataSource(
                name="Romanian Literature Digital Library",
                url="https://www.digibuc.ro",
                category="literature",
                priority=8,
                scraping_rules={"depth": 4, "content_selectors": [".text-content", ".book-content"]},
                expected_size_gb=200.0,
                update_frequency="monthly",
                quality_threshold=0.85
            ),
            
            # Web Content Sources
            DataSource(
                name="Romanian Wikipedia",
                url="https://ro.wikipedia.org",
                category="web",
                priority=8,
                scraping_rules={"depth": 2, "content_selectors": ["#mw-content-text"]},
                expected_size_gb=15.0,
                update_frequency="weekly",
                quality_threshold=0.85
            )
        ]
    
    async def collect_from_source(self, source: DataSource, max_documents: int = 10000) -> Dict:
        """Collect data from a specific Romanian source"""
        logger.info(f"🚀 Starting collection from {source.name} ({source.category})")
        start_time = time.time()
        
        collected_docs = 0
        total_size = 0
        quality_scores = []
        
        async with aiohttp.ClientSession(timeout=self.session_timeout) as session:
            try:
                # Start with main page
                urls_to_process = {source.url}
                processed_urls = set()
                
                for current_depth in range(source.scraping_rules.get('depth', 2)):
                    if not urls_to_process or collected_docs >= max_documents:
                        break
                    
                    batch_urls = list(urls_to_process)[:50]  # Process in batches
                    urls_to_process = set()
                    
                    for url in batch_urls:
                        if url in processed_urls:
                            continue
                            
                        try:
                            doc_result = await self.process_document(session, url, source)
                            if doc_result:
                                collected_docs += 1
                                total_size += doc_result['size_bytes']
                                quality_scores.append(doc_result['quality_score'])
                                
                                # Add discovered links for deeper crawling
                                if current_depth < source.scraping_rules.get('depth', 2) - 1:
                                    urls_to_process.update(doc_result.get('discovered_links', []))
                            
                            processed_urls.add(url)
                            
                            if collected_docs >= max_documents:
                                break
                                
                        except Exception as e:
                            logger.warning(f"⚠️ Error processing {url}: {e}")
                            continue
                    
                    logger.info(f"📊 Depth {current_depth + 1}: {collected_docs} documents, {total_size / (1024*1024):.1f}MB")
            
            except Exception as e:
                logger.error(f"❌ Collection from {source.name} failed: {e}")
        
        # Calculate metrics
        processing_time = time.time() - start_time
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        result = {
            'source_name': source.name,
            'category': source.category,
            'documents_collected': collected_docs,
            'total_size_mb': total_size / (1024 * 1024),
            'average_quality': avg_quality,
            'processing_time_seconds': processing_time,
            'collection_rate_docs_per_minute': (collected_docs / processing_time) * 60 if processing_time > 0 else 0
        }
        
        logger.info(f"✅ {source.name} collection complete:")
        logger.info(f"   📄 Documents: {collected_docs}")
        logger.info(f"   💾 Size: {result['total_size_mb']:.1f}MB") 
        logger.info(f"   ⭐ Quality: {avg_quality:.2f}")
        logger.info(f"   ⏱️ Time: {processing_time:.1f}s")
        
        return result
    
    async def process_document(self, session: aiohttp.ClientSession, url: str, source: DataSource) -> Optional[Dict]:
        """Process and store a single Romanian document"""
        try:
            async with session.get(url, headers={'User-Agent': 'RomAI Data Collector 1.0'}) as response:
                if response.status != 200:
                    return None
                
                content = await response.text()
                if not content:
                    return None
                
                # Parse content
                soup = BeautifulSoup(content, 'html.parser')
                
                # Extract title
                title_elem = soup.find('title')
                title = title_elem.text.strip() if title_elem else urlparse(url).path
                
                # Extract main content using source-specific selectors
                main_content = ""
                for selector in source.scraping_rules.get('content_selectors', ['.content']):
                    content_elem = soup.select_one(selector)
                    if content_elem:
                        main_content = content_elem.get_text(separator=' ', strip=True)
                        break
                
                if not main_content:
                    # Fallback to body content
                    body = soup.find('body')
                    main_content = body.get_text(separator=' ', strip=True) if body else ""
                
                if len(main_content) < 100:  # Skip very short content
                    return None
                
                # Quality and language assessment
                quality_score = self.assess_content_quality(main_content)
                language_confidence = self.assess_romanian_language(main_content)
                
                # Skip if quality/language thresholds not met
                if quality_score < source.quality_threshold or language_confidence < 0.7:
                    return None
                
                # Generate content hash for deduplication
                content_hash = hashlib.sha256(main_content.encode()).hexdigest()
                
                # Check for duplicates
                if content_hash in self.collected_urls:
                    return None
                self.collected_urls.add(content_hash)
                
                # Save to file
                file_path = self.save_document(main_content, title, source.category, url, content_hash)
                
                # Store metadata in database
                self.store_document_metadata(
                    url, title, content_hash, source.category, file_path,
                    len(main_content.encode()), quality_score, language_confidence
                )
                
                # Extract links for further crawling
                discovered_links = []
                for link in soup.find_all('a', href=True):
                    absolute_url = urljoin(url, link['href'])
                    if self.is_valid_romanian_url(absolute_url):
                        discovered_links.append(absolute_url)
                
                return {
                    'url': url,
                    'title': title,
                    'size_bytes': len(main_content.encode()),
                    'quality_score': quality_score,
                    'language_confidence': language_confidence,
                    'discovered_links': discovered_links[:20]  # Limit to 20 links per page
                }
                
        except Exception as e:
            logger.warning(f"⚠️ Failed to process {url}: {e}")
            return None
    
    def assess_content_quality(self, content: str) -> float:
        """Assess the quality of Romanian content for training"""
        score = 0.0
        
        # Length check (prefer substantial content)
        if len(content) > 1000:
            score += 0.3
        elif len(content) > 500:
            score += 0.2
        elif len(content) > 200:
            score += 0.1
        
        # Romanian language indicators
        romanian_indicators = [
            'și', 'în', 'de', 'la', 'cu', 'pe', 'pentru', 'din', 'România', 'român',
            'este', 'sunt', 'fiind', 'avea', 'face', 'într-un', 'într-o'
        ]
        
        indicator_count = sum(1 for indicator in romanian_indicators if indicator in content)
        score += min(indicator_count / len(romanian_indicators), 0.3)
        
        # Structural quality (sentences, paragraphs)
        sentences = content.count('.') + content.count('!') + content.count('?')
        if sentences > 10:
            score += 0.2
        elif sentences > 5:
            score += 0.1
        
        # Avoid low-quality content
        spam_indicators = ['click here', 'advertisement', 'cookies', '404', 'error']
        spam_count = sum(1 for spam in spam_indicators if spam.lower() in content.lower())
        score -= spam_count * 0.1
        
        # Character diversity (avoid repetitive content)
        unique_chars = len(set(content.lower()))
        if unique_chars > 50:
            score += 0.2
        
        return max(0.0, min(1.0, score))
    
    def assess_romanian_language(self, content: str) -> float:
        """Assess how likely content is to be Romanian language"""
        # Simple heuristic-based Romanian language detection
        romanian_words = [
            'și', 'în', 'de', 'la', 'cu', 'pe', 'pentru', 'din', 'că', 'cel', 'unei', 'unui',
            'este', 'sunt', 'fiind', 'avea', 'face', 'către', 'între', 'asupra', 'prin',
            'după', 'înainte', 'fără', 'contra', 'împotriva', 'România', 'român', 'românesc'
        ]
        
        words = content.lower().split()
        if not words:
            return 0.0
        
        romanian_word_count = sum(1 for word in words if word in romanian_words)
        confidence = romanian_word_count / len(words)
        
        # Additional checks for Romanian diacritics
        romanian_chars = 'ăâîșțĂÂÎȘȚ'
        diacritic_count = sum(1 for char in content if char in romanian_chars)
        if diacritic_count > 0:
            confidence += 0.2
        
        return min(1.0, confidence)
    
    def is_valid_romanian_url(self, url: str) -> bool:
        """Check if URL is likely to contain Romanian content"""
        romanian_domains = ['.ro', 'romania', 'roman', 'bucuresti', 'cluj', 'timisoara', 'iasi']
        return any(domain in url.lower() for domain in romanian_domains)
    
    def save_document(self, content: str, title: str, category: str, url: str, content_hash: str) -> str:
        """Save document to appropriate category directory"""
        # Clean title for filename
        clean_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()[:100]
        
        filename = f"{content_hash[:12]}_{clean_title}.txt"
        file_path = self.data_directory / category / filename
        
        # Prepare document with metadata
        document_content = f"""Title: {title}
URL: {url}
Collection Date: {datetime.now().isoformat()}
Category: {category}
Content Hash: {content_hash}

---CONTENT---

{content}
"""
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(document_content)
        
        return str(file_path)
    
    def store_document_metadata(self, url: str, title: str, content_hash: str, category: str, 
                               file_path: str, size_bytes: int, quality_score: float, language_confidence: float):
        """Store document metadata in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO documents 
                (url, title, content_hash, category, file_path, size_bytes, quality_score, 
                 language_confidence, collection_date, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (url, title, content_hash, category, file_path, size_bytes, 
                  quality_score, language_confidence, datetime.now(), datetime.now()))
            conn.commit()
    
    def get_collection_stats(self) -> Dict:
        """Get comprehensive collection statistics"""
        with sqlite3.connect(self.db_path) as conn:
            # Overall stats
            total_docs = conn.execute('SELECT COUNT(*) FROM documents').fetchone()[0]
            total_size = conn.execute('SELECT SUM(size_bytes) FROM documents').fetchone()[0] or 0
            avg_quality = conn.execute('SELECT AVG(quality_score) FROM documents').fetchone()[0] or 0
            
            # Category breakdown
            category_stats = {}
            categories = conn.execute('SELECT category, COUNT(*), SUM(size_bytes), AVG(quality_score) FROM documents GROUP BY category').fetchall()
            
            for category, count, size, quality in categories:
                category_stats[category] = {
                    'documents': count,
                    'size_mb': (size or 0) / (1024 * 1024),
                    'average_quality': quality or 0
                }
        
        return {
            'total_documents': total_docs,
            'total_size_gb': total_size / (1024 * 1024 * 1024),
            'average_quality': avg_quality,
            'category_breakdown': category_stats,
            'collection_progress': {
                'target_size_tb': 5.0,
                'current_progress_percent': (total_size / (5 * 1024 * 1024 * 1024 * 1024)) * 100,
                'estimated_completion': "Based on current collection rate"
            }
        }
    
    async def run_comprehensive_collection(self, max_documents_per_source: int = 50000):
        """Run comprehensive Romanian data collection across all sources"""
        logger.info("🚀 STARTING COMPREHENSIVE ROMANIAN DATA COLLECTION")
        logger.info("🎯 Target: 5TB+ for World-Class Romanian AGI Training")
        
        sources = self.get_high_priority_sources()
        results = []
        
        start_time = time.time()
        
        for source in sorted(sources, key=lambda x: x.priority, reverse=True):
            logger.info(f"📡 Processing Priority {source.priority}: {source.name}")
            try:
                result = await self.collect_from_source(source, max_documents_per_source)
                results.append(result)
                
                # Log progress
                stats = self.get_collection_stats()
                logger.info(f"📊 Progress: {stats['total_documents']} docs, {stats['total_size_gb']:.2f}GB")
                
            except Exception as e:
                logger.error(f"❌ Failed to process {source.name}: {e}")
        
        # Final summary
        total_time = time.time() - start_time
        final_stats = self.get_collection_stats()
        
        logger.info("🎉 ROMANIAN DATA COLLECTION PHASE 1 COMPLETE")
        logger.info(f"📄 Total Documents: {final_stats['total_documents']}")
        logger.info(f"💾 Total Size: {final_stats['total_size_gb']:.2f}GB") 
        logger.info(f"⭐ Average Quality: {final_stats['average_quality']:.2f}")
        logger.info(f"⏱️ Total Time: {total_time / 3600:.1f} hours")
        logger.info(f"🎯 Progress toward 5TB target: {final_stats['collection_progress']['current_progress_percent']:.1f}%")
        
        return {
            'collection_results': results,
            'final_stats': final_stats,
            'processing_time_hours': total_time / 3600
        }

async def main():
    """Main function to start Romanian data collection"""
    print("🇷🇴 RomAI Romanian Data Collection System")
    print("=" * 50)
    print("🎯 Target: 5TB+ Romanian content for world-class AGI")
    print("🚀 Starting comprehensive data collection...")
    print()
    
    collector = RomanianDataCollector("./data/romanian_corpus")
    
    # Run collection with reasonable limits for initial phase
    results = await collector.run_comprehensive_collection(max_documents_per_source=10000)
    
    print("\n✅ Data collection complete!")
    print(f"📊 Check 'romanian_data_collection.log' for detailed logs")
    print(f"📁 Data stored in: {collector.data_directory}")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())