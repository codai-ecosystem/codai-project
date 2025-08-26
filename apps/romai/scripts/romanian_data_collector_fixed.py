#!/usr/bin/env python3
"""
Romanian Data Collector - Windows Unicode Fixed Version
Simplified logging without emoji characters to avoid cp1252 encoding issues
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

# Configure logging without emoji characters
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('romanian_data_collection.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DataSource:
    name: str
    url: str
    category: str
    priority: int
    max_depth: int = 3
    collection_type: str = "web"  # web, rss, api
    headers: Optional[Dict] = None

@dataclass 
class CollectionResult:
    source_name: str
    documents_collected: int
    total_size_mb: float
    success: bool
    error_message: Optional[str] = None
    collection_time_seconds: float = 0.0

class RomanianDataCollector:
    """Production Romanian Data Collection System"""
    
    def __init__(self, data_directory: str):
        self.data_directory = Path(data_directory)
        self.data_directory.mkdir(parents=True, exist_ok=True)
        
        # Initialize database for metadata tracking
        self.db_path = self.data_directory / "collection_metadata.db"
        self.setup_database()
        
        # Collection stats
        self.total_documents = 0
        self.total_size_bytes = 0
        self.collection_errors = []
        
        # Romanian language patterns for quality filtering
        self.romanian_patterns = [
            r'\b(și|sau|pentru|este|sunt|avea|face|când|cum|unde|care|ce|cu|de|la|în|pe|să)\b',
            r'\b(România|București|Cluj|Timișoara|Constanța|Iași|Craiova|Brașov)\b',
            r'\b(românesc|română|român|românești|româneasca)\b'
        ]
        
        logger.info("Database initialized for metadata tracking")
        logger.info("Romanian Data Collector initialized")
        logger.info(f"Data directory: {self.data_directory}")
        logger.info("Target: 5TB+ Romanian content for world-class AGI")
        
    def setup_database(self):
        """Initialize SQLite database for collection metadata"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS collected_documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE NOT NULL,
                    title TEXT,
                    content_hash TEXT,
                    size_bytes INTEGER,
                    collection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    source_name TEXT,
                    category TEXT,
                    language_score REAL,
                    quality_score REAL
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS collection_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    session_end TIMESTAMP,
                    total_documents INTEGER,
                    total_size_bytes INTEGER,
                    sources_processed INTEGER,
                    success_rate REAL
                )
            ''')
            conn.commit()

    def get_high_priority_sources(self) -> List[DataSource]:
        """Define high-priority Romanian data sources"""
        return [
            DataSource(
                name="Romanian Parliament", 
                url="https://www.cdep.ro",
                category="government",
                priority=10,
                max_depth=2
            ),
            DataSource(
                name="Romanian Government",
                url="https://gov.ro",
                category="government", 
                priority=10,
                max_depth=2
            ),
            DataSource(
                name="Agerpres News",
                url="https://www.agerpres.ro",
                category="news",
                priority=9,
                collection_type="rss"
            ),
            DataSource(
                name="Adevarul News",
                url="https://adevarul.ro", 
                category="news",
                priority=8,
                max_depth=3
            ),
            DataSource(
                name="Romanian Academy",
                url="https://acad.ro",
                category="academic",
                priority=9,
                max_depth=2  
            ),
            DataSource(
                name="Biblioteca Digitala",
                url="https://www.digibuc.ro",
                category="literature", 
                priority=8,
                max_depth=2
            ),
            DataSource(
                name="Romanian Cultural Institute",
                url="https://www.icr.ro",
                category="culture",
                priority=7,
                max_depth=2
            ),
            DataSource(
                name="Ziare.com",
                url="https://www.ziare.com",
                category="news",
                priority=7,
                max_depth=2
            )
        ]
    
    async def collect_from_source(self, source: DataSource, max_documents: int = 1000) -> CollectionResult:
        """Collect data from a single source"""
        start_time = time.time()
        documents_collected = 0
        total_size = 0
        
        logger.info(f"Starting collection from {source.name} ({source.category})")
        
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            ) as session:
                
                if source.collection_type == "rss":
                    result = await self._collect_rss(session, source, max_documents)
                else:
                    result = await self._collect_web(session, source, max_documents)
                
                documents_collected = result.get('documents', 0)
                total_size = result.get('size_mb', 0)
                
                collection_time = time.time() - start_time
                
                logger.info(f"Completed {source.name}: {documents_collected} docs, {total_size:.2f}MB in {collection_time:.1f}s")
                
                return CollectionResult(
                    source_name=source.name,
                    documents_collected=documents_collected,
                    total_size_mb=total_size,
                    success=True,
                    collection_time_seconds=collection_time
                )
                
        except Exception as e:
            collection_time = time.time() - start_time
            error_msg = f"Error collecting from {source.name}: {str(e)}"
            logger.error(error_msg)
            
            return CollectionResult(
                source_name=source.name,
                documents_collected=0,
                total_size_mb=0,
                success=False,
                error_message=error_msg,
                collection_time_seconds=collection_time
            )
    
    async def _collect_web(self, session: aiohttp.ClientSession, source: DataSource, max_documents: int) -> Dict:
        """Collect from web pages"""
        collected_urls = set()
        documents_saved = 0
        total_size = 0
        
        try:
            # Get initial page
            async with session.get(source.url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract and save content
                    content = self._extract_text_content(soup)
                    if self._is_quality_romanian_content(content):
                        file_size = await self._save_document(
                            url=source.url,
                            title=soup.title.string if soup.title else source.name,
                            content=content,
                            source=source
                        )
                        if file_size > 0:
                            documents_saved += 1
                            total_size += file_size / (1024 * 1024)  # Convert to MB
                    
                    # Find additional links (limited for demo)
                    if documents_saved < max_documents:
                        links = soup.find_all('a', href=True)[:20]  # Limit for demo
                        for link in links:
                            href = urljoin(source.url, link['href'])
                            if self._is_valid_url(href, source.url) and href not in collected_urls:
                                collected_urls.add(href)
                                if len(collected_urls) >= min(max_documents, 50):  # Demo limit
                                    break
                    
                    # Collect from found links
                    for url in list(collected_urls)[:min(max_documents - documents_saved, 20)]:
                        try:
                            async with session.get(url) as link_response:
                                if link_response.status == 200:
                                    link_html = await link_response.text()
                                    link_soup = BeautifulSoup(link_html, 'html.parser')
                                    link_content = self._extract_text_content(link_soup)
                                    
                                    if self._is_quality_romanian_content(link_content):
                                        file_size = await self._save_document(
                                            url=url,
                                            title=link_soup.title.string if link_soup.title else "Document",
                                            content=link_content,
                                            source=source
                                        )
                                        if file_size > 0:
                                            documents_saved += 1
                                            total_size += file_size / (1024 * 1024)
                        except:
                            continue
                        
                        if documents_saved >= max_documents:
                            break
                        
                        # Rate limiting
                        await asyncio.sleep(0.5)
                        
        except Exception as e:
            logger.warning(f"Web collection error for {source.name}: {e}")
        
        return {'documents': documents_saved, 'size_mb': total_size}
    
    async def _collect_rss(self, session: aiohttp.ClientSession, source: DataSource, max_documents: int) -> Dict:
        """Collect from RSS feeds"""
        documents_saved = 0
        total_size = 0
        
        try:
            # Parse RSS feed
            feed = feedparser.parse(source.url)
            
            for entry in feed.entries[:max_documents]:
                try:
                    # Get article content
                    article_url = entry.link
                    async with session.get(article_url) as response:
                        if response.status == 200:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')
                            content = self._extract_text_content(soup)
                            
                            if self._is_quality_romanian_content(content):
                                file_size = await self._save_document(
                                    url=article_url,
                                    title=entry.title,
                                    content=content,
                                    source=source
                                )
                                if file_size > 0:
                                    documents_saved += 1
                                    total_size += file_size / (1024 * 1024)
                    
                    # Rate limiting
                    await asyncio.sleep(0.3)
                    
                except Exception as e:
                    continue
                    
        except Exception as e:
            logger.warning(f"RSS collection error for {source.name}: {e}")
        
        return {'documents': documents_saved, 'size_mb': total_size}
    
    def _extract_text_content(self, soup: BeautifulSoup) -> str:
        """Extract clean text content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def _is_quality_romanian_content(self, content: str) -> bool:
        """Check if content is quality Romanian text"""
        if len(content) < 100:  # Minimum length
            return False
        
        # Check for Romanian language patterns
        import re
        romanian_matches = 0
        for pattern in self.romanian_patterns:
            matches = len(re.findall(pattern, content, re.IGNORECASE))
            romanian_matches += matches
        
        # Basic quality threshold
        romanian_density = romanian_matches / len(content.split()) if content.split() else 0
        return romanian_density > 0.02  # At least 2% Romanian keywords
    
    def _is_valid_url(self, url: str, base_url: str) -> bool:
        """Check if URL is valid for collection"""
        try:
            parsed = urlparse(url)
            base_parsed = urlparse(base_url)
            
            # Same domain
            if parsed.netloc != base_parsed.netloc:
                return False
            
            # Skip certain file types
            skip_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'}
            if any(url.lower().endswith(ext) for ext in skip_extensions):
                return False
            
            return True
        except:
            return False
    
    async def _save_document(self, url: str, title: str, content: str, source: DataSource) -> int:
        """Save document to file and database"""
        try:
            # Generate content hash
            content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
            
            # Check if already collected
            with sqlite3.connect(self.db_path) as conn:
                existing = conn.execute(
                    "SELECT id FROM collected_documents WHERE content_hash = ?",
                    (content_hash,)
                ).fetchone()
                
                if existing:
                    return 0  # Already collected
            
            # Save to file
            filename = f"{source.category}_{int(time.time())}_{content_hash[:8]}.txt"
            filepath = self.data_directory / source.category
            filepath.mkdir(exist_ok=True)
            
            document_path = filepath / filename
            
            # Save content
            document_data = {
                "url": url,
                "title": title,
                "content": content,
                "source": source.name,
                "category": source.category,
                "collected_at": datetime.now().isoformat(),
                "content_hash": content_hash
            }
            
            with open(document_path, 'w', encoding='utf-8') as f:
                json.dump(document_data, f, ensure_ascii=False, indent=2)
            
            file_size = document_path.stat().st_size
            
            # Update database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO collected_documents 
                    (url, title, content_hash, size_bytes, source_name, category, language_score, quality_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    url, title, content_hash, file_size, source.name, source.category, 0.9, 0.8
                ))
                conn.commit()
            
            return file_size
            
        except Exception as e:
            logger.error(f"Error saving document from {url}: {e}")
            return 0
    
    async def run_comprehensive_collection(self, max_documents_per_source: int = 1000) -> List[CollectionResult]:
        """Run comprehensive data collection from all sources"""
        logger.info("STARTING COMPREHENSIVE ROMANIAN DATA COLLECTION")
        logger.info("Target: 5TB+ for World-Class Romanian AGI Training")
        
        sources = self.get_high_priority_sources()
        results = []
        
        # Process sources by priority
        for source in sorted(sources, key=lambda x: x.priority, reverse=True):
            logger.info(f"Processing Priority {source.priority}: {source.name}")
            
            result = await self.collect_from_source(source, max_documents_per_source)
            results.append(result)
            
            # Brief pause between sources
            await asyncio.sleep(1)
        
        # Log final statistics
        total_docs = sum(r.documents_collected for r in results)
        total_size = sum(r.total_size_mb for r in results)
        successful_sources = len([r for r in results if r.success])
        
        logger.info("COLLECTION COMPLETED!")
        logger.info(f"Total documents: {total_docs}")
        logger.info(f"Total size: {total_size:.2f} MB")
        logger.info(f"Successful sources: {successful_sources}/{len(sources)}")
        
        return results