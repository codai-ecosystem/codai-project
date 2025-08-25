"""
Document Processor - Phase 4
Advanced document analysis and understanding capabilities
"""

import asyncio
import time
import json
import re
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
from pathlib import Path
import logging
from enum import Enum

# Import our existing components
from romai_api_client import RomAIAPIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentType(Enum):
    TEXT = "text"
    MARKDOWN = "markdown"
    PDF = "pdf"
    WORD = "word"
    HTML = "html"
    JSON = "json"
    XML = "xml"
    CSV = "csv"
    CODE = "code"
    UNKNOWN = "unknown"

class ProcessingMode(Enum):
    BASIC = "basic"           # Text extraction only
    STRUCTURED = "structured"  # Extract structure and hierarchy
    SEMANTIC = "semantic"     # Understand meaning and context
    COMPREHENSIVE = "comprehensive"  # Full analysis with insights

@dataclass
class DocumentMetadata:
    file_type: DocumentType
    file_size: int
    estimated_pages: int
    language: str
    encoding: str
    creation_date: Optional[str] = None
    modification_date: Optional[str] = None
    word_count: int = 0
    character_count: int = 0
    line_count: int = 0

@dataclass
class DocumentStructure:
    headings: List[Dict[str, Any]]
    paragraphs: List[Dict[str, Any]]
    lists: List[Dict[str, Any]]
    tables: List[Dict[str, Any]]
    code_blocks: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
    hierarchy: Dict[str, Any]

@dataclass
class DocumentContent:
    raw_text: str
    processed_text: str
    key_phrases: List[str]
    entities: List[Dict[str, Any]]
    summary: str
    topics: List[str]
    sentiment: str
    readability_score: float

@dataclass
class DocumentProcessingResult:
    metadata: DocumentMetadata
    structure: DocumentStructure
    content: DocumentContent
    insights: List[str]
    processing_time: float
    confidence_score: float
    processing_mode: ProcessingMode

class DocumentProcessor:
    """Advanced document processing with multi-format support"""
    
    def __init__(self):
        self.romai_client = RomAIAPIClient()
        self.supported_formats = {
            '.txt': DocumentType.TEXT,
            '.md': DocumentType.MARKDOWN,
            '.markdown': DocumentType.MARKDOWN,
            '.pdf': DocumentType.PDF,
            '.doc': DocumentType.WORD,
            '.docx': DocumentType.WORD,
            '.html': DocumentType.HTML,
            '.htm': DocumentType.HTML,
            '.json': DocumentType.JSON,
            '.xml': DocumentType.XML,
            '.csv': DocumentType.CSV,
            '.py': DocumentType.CODE,
            '.js': DocumentType.CODE,
            '.ts': DocumentType.CODE,
            '.java': DocumentType.CODE,
            '.cpp': DocumentType.CODE,
            '.c': DocumentType.CODE
        }
        
        self.language_patterns = {
            'english': re.compile(r'\b(the|and|or|but|in|on|at|to|for|of|with|by)\b', re.I),
            'spanish': re.compile(r'\b(el|la|y|o|pero|en|de|con|por|para)\b', re.I),
            'french': re.compile(r'\b(le|la|et|ou|mais|en|de|avec|par|pour)\b', re.I),
            'german': re.compile(r'\b(der|die|das|und|oder|aber|in|auf|zu|für)\b', re.I),
        }
    
    def detect_document_type(self, file_path: Optional[str] = None, 
                           content: Optional[str] = None) -> DocumentType:
        """Detect document type from file extension or content"""
        try:
            if file_path:
                path = Path(file_path)
                extension = path.suffix.lower()
                return self.supported_formats.get(extension, DocumentType.UNKNOWN)
            
            elif content:
                # Content-based detection
                content_lower = content.lower().strip()
                
                if content_lower.startswith('<!doctype html') or '<html' in content_lower:
                    return DocumentType.HTML
                elif content_lower.startswith('{') and content_lower.endswith('}'):
                    try:
                        json.loads(content)
                        return DocumentType.JSON
                    except:
                        pass
                elif content_lower.startswith('<?xml') or '<root>' in content_lower:
                    return DocumentType.XML
                elif content.count('\t') > content.count(' ') * 0.1:  # Many tabs suggest code
                    return DocumentType.CODE
                elif '```' in content or content.count('#') > len(content.split('\n')) * 0.1:
                    return DocumentType.MARKDOWN
                else:
                    return DocumentType.TEXT
            
            return DocumentType.UNKNOWN
            
        except Exception as e:
            logger.error(f"Error detecting document type: {str(e)}")
            return DocumentType.UNKNOWN
    
    def extract_metadata(self, file_path: Optional[str] = None, 
                        content: Optional[str] = None) -> DocumentMetadata:
        """Extract document metadata"""
        try:
            doc_type = self.detect_document_type(file_path, content)
            
            metadata = DocumentMetadata(
                file_type=doc_type,
                file_size=0,
                estimated_pages=1,
                language="unknown",
                encoding="utf-8",
                word_count=0,
                character_count=0,
                line_count=0
            )
            
            # Get file information if path provided
            if file_path:
                path = Path(file_path)
                if path.exists():
                    metadata.file_size = path.stat().st_size
                    metadata.creation_date = time.ctime(path.stat().st_ctime)
                    metadata.modification_date = time.ctime(path.stat().st_mtime)
                    
                    # Read content for analysis
                    try:
                        content = path.read_text(encoding='utf-8')
                    except UnicodeDecodeError:
                        try:
                            content = path.read_text(encoding='latin-1')
                            metadata.encoding = "latin-1"
                        except Exception:
                            content = "[Binary or unreadable content]"
            
            # Analyze content if available
            if content and isinstance(content, str):
                metadata.character_count = len(content)
                metadata.line_count = len(content.split('\n'))
                metadata.word_count = len(content.split())
                metadata.estimated_pages = max(1, metadata.word_count // 250)  # ~250 words per page
                metadata.language = self.detect_language(content)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return DocumentMetadata(
                file_type=DocumentType.UNKNOWN,
                file_size=0,
                estimated_pages=1,
                language="unknown",
                encoding="utf-8"
            )
    
    def detect_language(self, content: str) -> str:
        """Detect document language using pattern matching"""
        try:
            if len(content) < 50:
                return "unknown"
            
            # Sample first 1000 characters for language detection
            sample = content[:1000].lower()
            
            language_scores = {}
            for language, pattern in self.language_patterns.items():
                matches = len(pattern.findall(sample))
                language_scores[language] = matches
            
            if language_scores:
                detected_language = max(language_scores, key=language_scores.get)
                max_score = language_scores[detected_language]
                
                # Require minimum confidence
                if max_score > 3:
                    return detected_language
            
            return "english"  # Default assumption
            
        except Exception:
            return "unknown"
    
    def extract_structure(self, content: str, doc_type: DocumentType) -> DocumentStructure:
        """Extract document structure based on type"""
        try:
            structure = DocumentStructure(
                headings=[],
                paragraphs=[],
                lists=[],
                tables=[],
                code_blocks=[],
                links=[],
                hierarchy={}
            )
            
            lines = content.split('\n')
            
            if doc_type == DocumentType.MARKDOWN:
                structure = self._extract_markdown_structure(content, lines)
            elif doc_type == DocumentType.HTML:
                structure = self._extract_html_structure(content)
            elif doc_type == DocumentType.CODE:
                structure = self._extract_code_structure(content, lines)
            else:
                structure = self._extract_text_structure(content, lines)
            
            return structure
            
        except Exception as e:
            logger.error(f"Error extracting structure: {str(e)}")
            return DocumentStructure([], [], [], [], [], [], {})
    
    def _extract_markdown_structure(self, content: str, lines: List[str]) -> DocumentStructure:
        """Extract structure from Markdown content"""
        structure = DocumentStructure([], [], [], [], [], [], {})
        
        current_section = None
        paragraph_buffer = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Headings
            if line.startswith('#'):
                if paragraph_buffer:
                    structure.paragraphs.append({
                        "content": '\n'.join(paragraph_buffer),
                        "line_start": i - len(paragraph_buffer),
                        "line_end": i - 1
                    })
                    paragraph_buffer = []
                
                level = len(line.split()[0])  # Count # symbols
                heading_text = line.lstrip('#').strip()
                structure.headings.append({
                    "text": heading_text,
                    "level": level,
                    "line": i
                })
                current_section = heading_text
            
            # Code blocks
            elif line.startswith('```'):
                if paragraph_buffer:
                    structure.paragraphs.append({
                        "content": '\n'.join(paragraph_buffer),
                        "line_start": i - len(paragraph_buffer),
                        "line_end": i - 1
                    })
                    paragraph_buffer = []
                
                # Find end of code block
                language = line[3:].strip()
                code_lines = []
                j = i + 1
                while j < len(lines) and not lines[j].strip().startswith('```'):
                    code_lines.append(lines[j])
                    j += 1
                
                structure.code_blocks.append({
                    "language": language,
                    "content": '\n'.join(code_lines),
                    "line_start": i,
                    "line_end": j
                })
            
            # Lists
            elif line.startswith(('-', '*', '+')):
                list_item = line[1:].strip()
                if structure.lists and structure.lists[-1].get("type") == "unordered":
                    structure.lists[-1]["items"].append(list_item)
                else:
                    structure.lists.append({
                        "type": "unordered",
                        "items": [list_item],
                        "line": i
                    })
            
            elif re.match(r'^\d+\.', line):
                list_item = re.sub(r'^\d+\.\s*', '', line)
                if structure.lists and structure.lists[-1].get("type") == "ordered":
                    structure.lists[-1]["items"].append(list_item)
                else:
                    structure.lists.append({
                        "type": "ordered",
                        "items": [list_item],
                        "line": i
                    })
            
            # Links
            elif '[' in line and '](' in line:
                link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
                links = re.findall(link_pattern, line)
                for link_text, link_url in links:
                    structure.links.append({
                        "text": link_text,
                        "url": link_url,
                        "line": i
                    })
                paragraph_buffer.append(line)
            
            # Regular paragraphs
            elif line:
                paragraph_buffer.append(line)
            else:
                if paragraph_buffer:
                    structure.paragraphs.append({
                        "content": '\n'.join(paragraph_buffer),
                        "line_start": i - len(paragraph_buffer),
                        "line_end": i - 1
                    })
                    paragraph_buffer = []
        
        # Handle remaining paragraph buffer
        if paragraph_buffer:
            structure.paragraphs.append({
                "content": '\n'.join(paragraph_buffer),
                "line_start": len(lines) - len(paragraph_buffer),
                "line_end": len(lines) - 1
            })
        
        # Build hierarchy
        structure.hierarchy = self._build_heading_hierarchy(structure.headings)
        
        return structure
    
    def _extract_html_structure(self, content: str) -> DocumentStructure:
        """Extract structure from HTML content (basic parsing)"""
        structure = DocumentStructure([], [], [], [], [], [], {})
        
        # Basic HTML parsing using regex (simplified)
        
        # Headings
        heading_pattern = r'<h([1-6])[^>]*>([^<]+)</h[1-6]>'
        headings = re.findall(heading_pattern, content, re.IGNORECASE)
        for level, text in headings:
            structure.headings.append({
                "text": text.strip(),
                "level": int(level),
                "line": 0
            })
        
        # Paragraphs
        paragraph_pattern = r'<p[^>]*>([^<]+)</p>'
        paragraphs = re.findall(paragraph_pattern, content, re.IGNORECASE)
        for i, text in enumerate(paragraphs):
            structure.paragraphs.append({
                "content": text.strip(),
                "line_start": 0,
                "line_end": 0
            })
        
        # Links
        link_pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>'
        links = re.findall(link_pattern, content, re.IGNORECASE)
        for url, text in links:
            structure.links.append({
                "text": text.strip(),
                "url": url,
                "line": 0
            })
        
        return structure
    
    def _extract_code_structure(self, content: str, lines: List[str]) -> DocumentStructure:
        """Extract structure from source code"""
        structure = DocumentStructure([], [], [], [], [], [], {})
        
        # Functions and classes (generic patterns)
        function_patterns = [
            r'def\s+(\w+)\s*\(',        # Python functions
            r'function\s+(\w+)\s*\(',   # JavaScript functions
            r'(\w+)\s*\([^)]*\)\s*\{', # C-style functions
            r'class\s+(\w+)',          # Classes
            r'interface\s+(\w+)',      # Interfaces
        ]
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Check for function/class definitions
            for pattern in function_patterns:
                match = re.search(pattern, line_stripped)
                if match:
                    structure.headings.append({
                        "text": match.group(1),
                        "level": 1,
                        "line": i,
                        "type": "code_element"
                    })
            
            # Comments as documentation
            if line_stripped.startswith(('#', '//', '/*', '"""', "'''")):
                structure.paragraphs.append({
                    "content": line_stripped,
                    "line_start": i,
                    "line_end": i,
                    "type": "comment"
                })
        
        return structure
    
    def _extract_text_structure(self, content: str, lines: List[str]) -> DocumentStructure:
        """Extract structure from plain text"""
        structure = DocumentStructure([], [], [], [], [], [], {})
        
        paragraph_buffer = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Potential headings (all caps, or lines followed by ===)
            if line.isupper() and len(line.split()) <= 10:
                if paragraph_buffer:
                    structure.paragraphs.append({
                        "content": '\n'.join(paragraph_buffer),
                        "line_start": i - len(paragraph_buffer),
                        "line_end": i - 1
                    })
                    paragraph_buffer = []
                
                structure.headings.append({
                    "text": line,
                    "level": 1,
                    "line": i
                })
            
            elif line:
                paragraph_buffer.append(line)
            else:
                if paragraph_buffer:
                    structure.paragraphs.append({
                        "content": '\n'.join(paragraph_buffer),
                        "line_start": i - len(paragraph_buffer),
                        "line_end": i - 1
                    })
                    paragraph_buffer = []
        
        # Handle remaining content
        if paragraph_buffer:
            structure.paragraphs.append({
                "content": '\n'.join(paragraph_buffer),
                "line_start": len(lines) - len(paragraph_buffer),
                "line_end": len(lines) - 1
            })
        
        return structure
    
    def _build_heading_hierarchy(self, headings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Build hierarchical structure from headings"""
        try:
            hierarchy = {"sections": []}
            stack = []
            
            for heading in headings:
                level = heading["level"]
                
                # Pop stack until we find appropriate parent level
                while stack and stack[-1]["level"] >= level:
                    stack.pop()
                
                heading_node = {
                    "text": heading["text"],
                    "level": level,
                    "line": heading["line"],
                    "subsections": []
                }
                
                if stack:
                    stack[-1]["subsections"].append(heading_node)
                else:
                    hierarchy["sections"].append(heading_node)
                
                stack.append(heading_node)
            
            return hierarchy
            
        except Exception as e:
            logger.error(f"Error building hierarchy: {str(e)}")
            return {"sections": []}
    
    async def analyze_content_semantics(self, content: str, structure: DocumentStructure) -> DocumentContent:
        """Analyze document content for semantic understanding"""
        try:
            # Process text for analysis
            processed_text = self._preprocess_text(content)
            
            # Extract key phrases using simple techniques
            key_phrases = self._extract_key_phrases(processed_text)
            
            # Generate semantic analysis using RomAI
            semantic_prompt = f"""Analyze this document content for semantic understanding:

Document Content:
{processed_text[:2000]}...

Structure Overview:
- Headings: {len(structure.headings)}
- Paragraphs: {len(structure.paragraphs)}  
- Lists: {len(structure.lists)}
- Code Blocks: {len(structure.code_blocks)}

Provide:
1. Document summary (2-3 sentences)
2. Main topics (list 3-5 key topics)
3. Key entities mentioned (people, places, concepts)
4. Overall sentiment (positive/neutral/negative)
5. Readability assessment (1-10 scale)

Analysis:"""
            
            response = self.romai_client.generate_response_sync(
                semantic_prompt, 
                task_type="document_semantic_analysis"
            )
            
            if response.success:
                # Parse AI response for structured data
                analysis_result = self._parse_semantic_analysis(response.content)
            else:
                analysis_result = {
                    "summary": "Document semantic analysis unavailable",
                    "topics": ["unknown"],
                    "entities": [],
                    "sentiment": "neutral",
                    "readability_score": 5.0
                }
            
            return DocumentContent(
                raw_text=content,
                processed_text=processed_text,
                key_phrases=key_phrases,
                entities=analysis_result.get("entities", []),
                summary=analysis_result.get("summary", "Summary unavailable"),
                topics=analysis_result.get("topics", ["unknown"]),
                sentiment=analysis_result.get("sentiment", "neutral"),
                readability_score=analysis_result.get("readability_score", 5.0)
            )
            
        except Exception as e:
            logger.error(f"Error analyzing content semantics: {str(e)}")
            return DocumentContent(
                raw_text=content,
                processed_text=content[:1000],
                key_phrases=[],
                entities=[],
                summary=f"Content analysis error: {str(e)}",
                topics=["error"],
                sentiment="neutral",
                readability_score=1.0
            )
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for analysis"""
        # Remove excessive whitespace
        processed = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        processed = re.sub(r'[^\w\s.,!?;:()\-"]', ' ', processed)
        
        # Normalize whitespace again
        processed = re.sub(r'\s+', ' ', processed).strip()
        
        return processed
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases using simple NLP techniques"""
        try:
            words = text.lower().split()
            
            # Common English stop words
            stop_words = {
                'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 
                'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 
                'the', 'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they',
                'have', 'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how',
                'their', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so'
            }
            
            # Filter and count word frequencies
            word_freq = {}
            for word in words:
                word = word.strip('.,!?;:"()').lower()
                if len(word) > 2 and word not in stop_words and word.isalpha():
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Get top frequent words as key phrases
            key_phrases = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            return [phrase for phrase, freq in key_phrases[:15] if freq > 1]
            
        except Exception as e:
            logger.error(f"Error extracting key phrases: {str(e)}")
            return []
    
    def _parse_semantic_analysis(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI semantic analysis response"""
        try:
            result = {
                "summary": "",
                "topics": [],
                "entities": [],
                "sentiment": "neutral",
                "readability_score": 5.0
            }
            
            lines = ai_response.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Identify sections
                if 'summary' in line.lower() and ':' in line:
                    current_section = 'summary'
                elif 'topic' in line.lower() and ':' in line:
                    current_section = 'topics'
                elif 'entit' in line.lower() and ':' in line:
                    current_section = 'entities'
                elif 'sentiment' in line.lower() and ':' in line:
                    current_section = 'sentiment'
                elif 'readability' in line.lower() and ':' in line:
                    current_section = 'readability'
                else:
                    # Process content based on current section
                    if current_section == 'summary':
                        if not result["summary"]:
                            result["summary"] = line
                        else:
                            result["summary"] += " " + line
                    
                    elif current_section == 'topics':
                        # Extract topics from lists or comma-separated text
                        if line.startswith(('-', '*', '•')):
                            topic = line[1:].strip()
                            result["topics"].append(topic)
                        elif ',' in line:
                            topics = [t.strip() for t in line.split(',')]
                            result["topics"].extend(topics)
                        else:
                            result["topics"].append(line)
                    
                    elif current_section == 'entities':
                        if line.startswith(('-', '*', '•')):
                            entity = line[1:].strip()
                            result["entities"].append({"name": entity, "type": "unknown"})
                    
                    elif current_section == 'sentiment':
                        sentiment_match = re.search(r'(positive|negative|neutral)', line.lower())
                        if sentiment_match:
                            result["sentiment"] = sentiment_match.group(1)
                    
                    elif current_section == 'readability':
                        readability_match = re.search(r'(\d+(?:\.\d+)?)', line)
                        if readability_match:
                            result["readability_score"] = float(readability_match.group(1))
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing semantic analysis: {str(e)}")
            return {
                "summary": "Analysis parsing failed",
                "topics": ["unknown"],
                "entities": [],
                "sentiment": "neutral",
                "readability_score": 1.0
            }
    
    async def process_document(self, file_path: Optional[str] = None, 
                             content: Optional[str] = None,
                             processing_mode: ProcessingMode = ProcessingMode.COMPREHENSIVE) -> DocumentProcessingResult:
        """Process document with comprehensive analysis"""
        start_time = time.time()
        
        try:
            # Load content if not provided
            if content is None and file_path:
                path = Path(file_path)
                if not path.exists():
                    raise FileNotFoundError(f"File not found: {file_path}")
                
                try:
                    content = path.read_text(encoding='utf-8')
                except UnicodeDecodeError:
                    content = path.read_text(encoding='latin-1')
            
            if not content:
                raise ValueError("No content provided for processing")
            
            # Extract metadata
            metadata = self.extract_metadata(file_path, content)
            
            # Extract structure
            structure = self.extract_structure(content, metadata.file_type)
            
            # Analyze content semantics (if comprehensive mode)
            if processing_mode in [ProcessingMode.SEMANTIC, ProcessingMode.COMPREHENSIVE]:
                content_analysis = await self.analyze_content_semantics(content, structure)
            else:
                # Basic content analysis
                content_analysis = DocumentContent(
                    raw_text=content,
                    processed_text=content[:1000],
                    key_phrases=self._extract_key_phrases(content),
                    entities=[],
                    summary="Basic processing - no semantic analysis",
                    topics=["unknown"],
                    sentiment="neutral",
                    readability_score=5.0
                )
            
            # Generate insights
            insights = await self._generate_document_insights(metadata, structure, content_analysis)
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(metadata, structure, content_analysis)
            
            processing_time = time.time() - start_time
            
            return DocumentProcessingResult(
                metadata=metadata,
                structure=structure,
                content=content_analysis,
                insights=insights,
                processing_time=processing_time,
                confidence_score=confidence_score,
                processing_mode=processing_mode
            )
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            processing_time = time.time() - start_time
            
            return DocumentProcessingResult(
                metadata=DocumentMetadata(DocumentType.UNKNOWN, 0, 1, "unknown", "utf-8"),
                structure=DocumentStructure([], [], [], [], [], [], {}),
                content=DocumentContent("", "", [], [], f"Processing error: {str(e)}", ["error"], "neutral", 0.0),
                insights=[f"Document processing failed: {str(e)}"],
                processing_time=processing_time,
                confidence_score=0.0,
                processing_mode=processing_mode
            )
    
    async def _generate_document_insights(self, metadata: DocumentMetadata, 
                                        structure: DocumentStructure, 
                                        content: DocumentContent) -> List[str]:
        """Generate insights about the document"""
        try:
            insights = []
            
            # Structural insights
            if len(structure.headings) > 0:
                insights.append(f"Well-structured document with {len(structure.headings)} headings")
            
            if len(structure.code_blocks) > 0:
                insights.append(f"Technical document containing {len(structure.code_blocks)} code examples")
            
            if len(structure.links) > 0:
                insights.append(f"Contains {len(structure.links)} external references/links")
            
            # Content insights
            if metadata.word_count > 5000:
                insights.append("Long-form document requiring significant reading time")
            elif metadata.word_count < 500:
                insights.append("Brief document with concise content")
            
            if content.readability_score > 7:
                insights.append("High readability - accessible to general audience")
            elif content.readability_score < 4:
                insights.append("Complex content - may require specialized knowledge")
            
            # Topic insights
            if len(content.topics) > 5:
                insights.append("Multi-topic document covering diverse subjects")
            elif len(content.topics) <= 2:
                insights.append("Focused document with narrow topic scope")
            
            return insights[:7]  # Limit to top insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return [f"Insight generation error: {str(e)}"]
    
    def _calculate_confidence_score(self, metadata: DocumentMetadata, 
                                   structure: DocumentStructure, 
                                   content: DocumentContent) -> float:
        """Calculate confidence score for document processing"""
        try:
            score_factors = []
            
            # Metadata confidence
            if metadata.file_type != DocumentType.UNKNOWN:
                score_factors.append(0.8)
            else:
                score_factors.append(0.3)
            
            # Structure confidence
            structure_elements = (len(structure.headings) + len(structure.paragraphs) + 
                                len(structure.lists) + len(structure.code_blocks))
            if structure_elements > 0:
                structure_score = min(structure_elements / 20, 0.9)
                score_factors.append(structure_score)
            else:
                score_factors.append(0.2)
            
            # Content confidence
            if len(content.key_phrases) > 5:
                score_factors.append(0.8)
            elif len(content.key_phrases) > 0:
                score_factors.append(0.6)
            else:
                score_factors.append(0.3)
            
            # Average confidence
            return round(sum(score_factors) / len(score_factors), 3)
            
        except Exception:
            return 0.5

# Test function
async def test_document_processor():
    """Test the document processor"""
    print("📄 Testing Document Processor")
    print("=" * 50)
    
    processor = DocumentProcessor()
    
    # Test 1: Document type detection
    print("\n🔍 Test 1: Document Type Detection")
    test_cases = [
        ("sample.md", None, DocumentType.MARKDOWN),
        ("script.py", None, DocumentType.CODE),
        (None, "# Heading\nSome content", DocumentType.MARKDOWN),
        (None, '{"key": "value"}', DocumentType.JSON),
        (None, "<html><body>Test</body></html>", DocumentType.HTML),
    ]
    
    detection_results = []
    for file_path, content, expected in test_cases:
        detected = processor.detect_document_type(file_path, content)
        correct = detected == expected
        detection_results.append(correct)
        status = "✅" if correct else "❌"
        print(f"   {file_path or 'content'}: {status} {detected.value}")
    
    # Test 2: Document processing
    print("\n📊 Test 2: Document Processing")
    
    test_content = """# Document Processing Test
    
This is a test document for evaluating document processing capabilities.

## Features
- Text analysis
- Structure extraction
- Semantic understanding

### Code Example
```python
def hello_world():
    print("Hello, World!")
```

## Conclusion
This document tests various processing features.
"""
    
    result = await processor.process_document(content=test_content)
    
    print(f"   Processing Time: {result.processing_time:.3f}s")
    print(f"   Confidence Score: {result.confidence_score:.3f}")
    print(f"   Document Type: {result.metadata.file_type.value}")
    print(f"   Word Count: {result.metadata.word_count}")
    print(f"   Headings Found: {len(result.structure.headings)}")
    print(f"   Code Blocks: {len(result.structure.code_blocks)}")
    print(f"   Key Phrases: {len(result.content.key_phrases)}")
    print(f"   Insights Generated: {len(result.insights)}")
    
    # Test 3: Performance assessment
    print("\n⚡ Test 3: Performance Assessment")
    
    performance_tests = [
        ("Short Text", "Hello world! This is a test."),
        ("Medium Text", test_content),
        ("Long Text", test_content * 5),
    ]
    
    performance_results = []
    for test_name, content in performance_tests:
        start_time = time.time()
        result = await processor.process_document(content=content, processing_mode=ProcessingMode.BASIC)
        processing_time = time.time() - start_time
        
        performance_results.append({
            "name": test_name,
            "time": processing_time,
            "confidence": result.confidence_score,
            "success": result.confidence_score > 0.3
        })
        
        print(f"   {test_name}: {processing_time:.3f}s (confidence: {result.confidence_score:.3f})")
    
    # Summary
    print(f"\n🎯 Summary:")
    detection_accuracy = sum(detection_results) / len(detection_results)
    avg_processing_time = sum(r["time"] for r in performance_results) / len(performance_results)
    avg_confidence = sum(r["confidence"] for r in performance_results) / len(performance_results)
    
    print(f"   Detection Accuracy: {detection_accuracy:.1%}")
    print(f"   Average Processing Time: {avg_processing_time:.3f}s")
    print(f"   Average Confidence: {avg_confidence:.3f}")
    print(f"   Supported Formats: {len(processor.supported_formats)}")
    
    return {
        "detection_accuracy": detection_accuracy,
        "avg_processing_time": avg_processing_time,
        "avg_confidence": avg_confidence,
        "supported_formats": len(processor.supported_formats)
    }

if __name__ == "__main__":
    asyncio.run(test_document_processor())