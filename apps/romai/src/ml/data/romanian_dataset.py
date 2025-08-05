"""
Romanian Dataset Collection and Processing
Week 2: Enhanced Romanian Language Module

This module provides:
- Romanian text corpus collection
- Cultural context dataset creation
- Historical document processing
- Regional dialect data compilation
"""

import os
import json
import requests
try:
    import wikipedia
except ImportError:
    # Fallback to API or skip Wikipedia collection
    wikipedia = None
from typing import Dict, List, Optional, Tuple
import asyncio
import aiohttp
from pathlib import Path
import logging
from dataclasses import dataclass
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import feedparser
import time

@dataclass
class RomanianDataSource:
    """Romanian data source configuration"""
    name: str
    url: str
    data_type: str  # 'wikipedia', 'news', 'literature', 'government', 'social'
    region: str = 'all'  # 'moldova', 'transilvania', 'muntenia', 'oltenia', 'banat'
    priority: int = 1  # 1-5, where 1 is highest priority
    estimated_size_gb: float = 0.0

class RomanianCorpusCollector:
    """
    Collects Romanian language data from multiple sources
    """
    
    def __init__(self, output_dir: str = "./data/romanian_corpus"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Data sources
        self.data_sources = self._initialize_data_sources()
        
        # Statistics
        self.collection_stats = {
            'total_documents': 0,
            'total_size_mb': 0,
            'by_source': {},
            'by_region': {},
            'by_type': {}
        }
    
    def _initialize_data_sources(self) -> List[RomanianDataSource]:
        """Initialize Romanian data sources"""
        sources = [
            # Wikipedia sources
            RomanianDataSource(
                "Wikipedia Romanian",
                "https://ro.wikipedia.org",
                "wikipedia",
                priority=1,
                estimated_size_gb=5.0
            ),
            
            # News sources
            RomanianDataSource(
                "Adevărul",
                "https://adevarul.ro",
                "news",
                priority=2,
                estimated_size_gb=2.0
            ),
            RomanianDataSource(
                "Digi24",
                "https://www.digi24.ro",
                "news",
                priority=2,
                estimated_size_gb=1.5
            ),
            RomanianDataSource(
                "HotNews",
                "https://www.hotnews.ro",
                "news",
                priority=2,
                estimated_size_gb=1.0
            ),
            
            # Literature sources
            RomanianDataSource(
                "Biblioteca Digitală",
                "http://www.bibnat.ro",
                "literature",
                priority=1,
                estimated_size_gb=3.0
            ),
            
            # Government sources
            RomanianDataSource(
                "Guvernul României",
                "https://gov.ro",
                "government",
                priority=3,
                estimated_size_gb=0.5
            ),
            RomanianDataSource(
                "Parlamentul României",
                "http://www.parlament.ro",
                "government",
                priority=3,
                estimated_size_gb=0.5
            ),
            
            # Regional sources
            RomanianDataSource(
                "Monitorul de Cluj",
                "https://monitorulcj.ro",
                "news",
                region="transilvania",
                priority=4,
                estimated_size_gb=0.3
            ),
            RomanianDataSource(
                "Ziarul de Iași",
                "https://www.ziaruldeiasi.ro",
                "news",
                region="moldova",
                priority=4,
                estimated_size_gb=0.3
            )
        ]
        
        return sources
    
    async def collect_wikipedia_data(self) -> Dict[str, List[str]]:
        """Collect Romanian Wikipedia articles"""
        self.logger.info("Starting Romanian Wikipedia collection...")
        
        # Set Romanian Wikipedia
        wikipedia.set_lang("ro")
        
        # Romanian topics of interest
        romanian_topics = [
            "România", "Istorie României", "Cultură română", "Limba română",
            "București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța",
            "Mihai Eminescu", "Ion Creangă", "Mircea Eliade",
            "Vlad Țepeș", "Ștefan cel Mare", "Mihai Viteazul",
            "Carpați", "Dunărea", "Marea Neagră",
            "Dacia", "Imperiul Roman", "Principatele române",
            "Transilvania", "Moldova", "Țara Românească",
            "Gastronomie românească", "Folclor românesc", "Muzică românească"
        ]
        
        articles = {}
        collected_count = 0
        
        for topic in romanian_topics:
            try:
                # Search for related articles
                search_results = wikipedia.search(topic, results=20)
                
                for title in search_results:
                    try:
                        page = wikipedia.page(title)
                        content = page.content
                        
                        # Filter for substantial Romanian content
                        if len(content) > 500 and self._is_quality_romanian_text(content):
                            articles[title] = {
                                'content': content,
                                'url': page.url,
                                'summary': page.summary[:500],
                                'categories': getattr(page, 'categories', []),
                                'topic': topic
                            }
                            collected_count += 1
                            
                            if collected_count % 10 == 0:
                                self.logger.info(f"Collected {collected_count} Wikipedia articles")
                    
                    except wikipedia.exceptions.DisambiguationError as e:
                        # Try the first option
                        try:
                            page = wikipedia.page(e.options[0])
                            content = page.content
                            if len(content) > 500 and self._is_quality_romanian_text(content):
                                articles[e.options[0]] = {
                                    'content': content,
                                    'url': page.url,
                                    'summary': page.summary[:500],
                                    'categories': getattr(page, 'categories', []),
                                    'topic': topic
                                }
                                collected_count += 1
                        except:
                            continue
                    except:
                        continue
                
                # Rate limiting
                await asyncio.sleep(0.1)
                
            except Exception as e:
                self.logger.error(f"Error collecting topic {topic}: {e}")
                continue
        
        self.logger.info(f"Collected {len(articles)} Romanian Wikipedia articles")
        return articles
    
    def _is_quality_romanian_text(self, text: str) -> bool:
        """Check if text is quality Romanian content"""
        
        # Romanian specific characters and words
        romanian_indicators = [
            'ă', 'â', 'î', 'ș', 'ț',  # Diacritics
            'sunt', 'este', 'și', 'în', 'de', 'la', 'cu',  # Common words
            'România', 'român', 'românesc', 'românească'  # Country references
        ]
        
        indicator_count = sum(1 for indicator in romanian_indicators if indicator in text)
        
        # Must have at least 5 Romanian indicators and reasonable length
        return indicator_count >= 5 and len(text.split()) > 50
    
    async def collect_news_data(self) -> Dict[str, List[str]]:
        """Collect Romanian news articles"""
        self.logger.info("Starting Romanian news collection...")
        
        news_data = {}
        
        # RSS feeds for Romanian news
        romanian_news_feeds = [
            "https://www.hotnews.ro/rss",
            "https://www.digi24.ro/rss",
            "https://adevarul.ro/rss",
            "https://www.mediafax.ro/rss",
            "https://stirileprotv.ro/rss",
        ]
        
        for feed_url in romanian_news_feeds:
            try:
                feed = feedparser.parse(feed_url)
                source_name = feed.feed.get('title', 'Unknown')
                
                articles = []
                for entry in feed.entries[:50]:  # Limit per source
                    article_data = {
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', ''),
                        'link': entry.get('link', ''),
                        'published': entry.get('published', ''),
                        'content': entry.get('summary', '') + ' ' + entry.get('title', '')
                    }
                    
                    # Only include if content is substantial Romanian text
                    if self._is_quality_romanian_text(article_data['content']):
                        articles.append(article_data)
                
                news_data[source_name] = articles
                self.logger.info(f"Collected {len(articles)} articles from {source_name}")
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                self.logger.error(f"Error collecting from {feed_url}: {e}")
                continue
        
        return news_data
    
    def create_romanian_cultural_dataset(self) -> Dict[str, any]:
        """Create Romanian cultural context dataset"""
        
        cultural_data = {
            'traditional_celebrations': {
                'Crăciun': {
                    'description': 'Sărbătoarea Nașterii Domnului, celebrată pe 25 decembrie',
                    'traditions': ['colinde', 'steaua', 'plugușorul', 'crama'],
                    'foods': ['cozonac', 'friptură', 'sarmale'],
                    'regions': ['all'],
                    'significance': 'religious'
                },
                'Paște': {
                    'description': 'Învierea Domnului, cea mai importantă sărbătoare ortodoxă',
                    'traditions': ['ouă roșii', 'cozonac', 'miel', 'lumânări'],
                    'foods': ['cozonac', 'miel', 'drob', 'ouă'],
                    'regions': ['all'],
                    'significance': 'religious'
                },
                'Mărțișor': {
                    'description': 'Sărbătoarea primăverii, 1 martie',
                    'traditions': ['mărțișor', 'ghiocel', 'cadouri pentru femei'],
                    'regions': ['all'],
                    'significance': 'traditional'
                }
            },
            
            'regional_dialects': {
                'moldovenesc': {
                    'characteristics': ['palatalizare', 'vocabular arhaic'],
                    'regions': ['Moldova', 'Bucovina'],
                    'examples': ['mîndru în loc de mândru']
                },
                'ardelenesc': {
                    'characteristics': ['influențe maghiare', 'germanisme'],
                    'regions': ['Transilvania', 'Banat'],
                    'examples': ['șură (magazie)', 'țol (inch)']
                }
            },
            
            'historical_figures': {
                'Mihai Eminescu': {
                    'period': '1850-1889',
                    'significance': 'poetul național',
                    'works': ['Luceafărul', 'Odă în metru antic', 'Scrisori'],
                    'cultural_impact': 'definește spiritualitatea românească'
                },
                'Ștefan cel Mare': {
                    'period': '1457-1504',
                    'significance': 'domnitor al Moldovei',
                    'achievements': ['47 de bătălii câștigate din 48'],
                    'cultural_impact': 'simbol al rezistenței românești'
                }
            },
            
            'geographical_features': {
                'Carpații': {
                    'significance': 'lanțul muntos central',
                    'cultural_importance': 'folclor, legende, economie',
                    'regions': ['all']
                },
                'Dunărea': {
                    'significance': 'fluviul major',
                    'cultural_importance': 'transport, comerț, granița naturală',
                    'length_in_romania': '1075 km'
                }
            }
        }
        
        return cultural_data
    
    async def save_collected_data(self, data: Dict[str, any], data_type: str):
        """Save collected data to files"""
        
        output_file = self.output_dir / f"romanian_{data_type}_{int(time.time())}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Update statistics
        data_size_mb = os.path.getsize(output_file) / (1024 * 1024)
        self.collection_stats['total_size_mb'] += data_size_mb
        self.collection_stats['by_type'][data_type] = self.collection_stats['by_type'].get(data_type, 0) + len(data)
        
        self.logger.info(f"Saved {data_type} data to {output_file} ({data_size_mb:.2f} MB)")
    
    async def collect_all_romanian_data(self):
        """Collect all Romanian language data"""
        self.logger.info("Starting comprehensive Romanian data collection...")
        
        # Collect Wikipedia data
        wikipedia_data = await self.collect_wikipedia_data()
        await self.save_collected_data(wikipedia_data, "wikipedia")
        
        # Collect news data
        news_data = await self.collect_news_data()
        await self.save_collected_data(news_data, "news")
        
        # Create cultural dataset
        cultural_data = self.create_romanian_cultural_dataset()
        await self.save_collected_data(cultural_data, "cultural")
        
        # Save final statistics
        stats_file = self.output_dir / "collection_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(self.collection_stats, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Data collection complete! Total size: {self.collection_stats['total_size_mb']:.2f} MB")
        return self.collection_stats

class RomanianDataPreprocessor:
    """
    Preprocess Romanian text data for training
    """
    
    def __init__(self, data_dir: str, output_dir: str):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
    
    def preprocess_for_training(self, data_files: List[str]) -> Dict[str, int]:
        """Preprocess Romanian data for model training"""
        
        processed_texts = []
        stats = {'total_texts': 0, 'total_tokens': 0, 'avg_length': 0}
        
        for data_file in data_files:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract text content based on data type
            if 'wikipedia' in data_file:
                for title, article in data.items():
                    processed_texts.append({
                        'text': article['content'],
                        'source': 'wikipedia',
                        'title': title,
                        'category': 'encyclopedia'
                    })
            
            elif 'news' in data_file:
                for source, articles in data.items():
                    for article in articles:
                        processed_texts.append({
                            'text': article['content'],
                            'source': 'news',
                            'outlet': source,
                            'category': 'current_events'
                        })
            
            elif 'cultural' in data_file:
                # Process cultural data into text format
                cultural_texts = self._extract_cultural_texts(data)
                processed_texts.extend(cultural_texts)
        
        # Save preprocessed data
        output_file = self.output_dir / "romanian_training_data.jsonl"
        with open(output_file, 'w', encoding='utf-8') as f:
            for text_data in processed_texts:
                f.write(json.dumps(text_data, ensure_ascii=False) + '\n')
        
        # Calculate statistics
        stats['total_texts'] = len(processed_texts)
        stats['total_tokens'] = sum(len(text['text'].split()) for text in processed_texts)
        stats['avg_length'] = stats['total_tokens'] / stats['total_texts'] if stats['total_texts'] > 0 else 0
        
        self.logger.info(f"Preprocessed {stats['total_texts']} texts, {stats['total_tokens']} tokens")
        return stats
    
    def _extract_cultural_texts(self, cultural_data: Dict) -> List[Dict]:
        """Extract text from cultural dataset"""
        texts = []
        
        for category, items in cultural_data.items():
            if isinstance(items, dict):
                for name, details in items.items():
                    # Create natural text descriptions
                    if category == 'traditional_celebrations':
                        text = f"{name}: {details['description']}. "
                        if 'traditions' in details:
                            text += f"Tradițiile includ: {', '.join(details['traditions'])}. "
                        if 'foods' in details:
                            text += f"Mâncărurile tradiționale: {', '.join(details['foods'])}."
                    
                    elif category == 'historical_figures':
                        text = f"{name} ({details.get('period', 'necunoscut')}): {details.get('significance', '')}. "
                        if 'cultural_impact' in details:
                            text += f"Impact cultural: {details['cultural_impact']}."
                    
                    else:
                        text = f"{name}: {details.get('description', str(details))}"
                    
                    texts.append({
                        'text': text,
                        'source': 'cultural',
                        'category': category,
                        'name': name
                    })
        
        return texts

# Example usage and data collection script
async def main():
    """Main data collection script"""
    print("🇷🇴 Starting Romanian Data Collection for Week 2...")
    
    # Initialize collector
    collector = RomanianCorpusCollector()
    
    # Collect all data
    stats = await collector.collect_all_romanian_data()
    
    print(f"✅ Data collection complete!")
    print(f"📊 Statistics: {stats}")
    
    # Preprocess for training
    preprocessor = RomanianDataPreprocessor("./data/romanian_corpus", "./data/processed")
    
    # Find all collected files
    data_files = list(Path("./data/romanian_corpus").glob("*.json"))
    data_files = [str(f) for f in data_files if "stats" not in str(f)]
    
    if data_files:
        preprocess_stats = preprocessor.preprocess_for_training(data_files)
        print(f"✅ Preprocessing complete!")
        print(f"📊 Training data: {preprocess_stats}")
    
    print("🚀 Romanian dataset ready for Week 2 training!")

if __name__ == "__main__":
    asyncio.run(main())
