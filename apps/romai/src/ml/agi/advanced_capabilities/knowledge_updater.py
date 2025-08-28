"""
RomAI AGI Evolution Phase 2 - Knowledge Updater

Dynamic knowledge base management system that handles knowledge storage,
conflict resolution, and knowledge base maintenance.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
import sqlite3
import hashlib

# Import knowledge types
from .knowledge_types import (
    KnowledgeType, SourceType, CredibilityLevel, KnowledgeStatus,
    KnowledgeSource, KnowledgeItem, KnowledgeConflict,
    KnowledgeUpdaterInterface, create_knowledge_item
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# KNOWLEDGE UPDATER IMPLEMENTATION
# ============================================================================

class KnowledgeUpdater(KnowledgeUpdaterInterface):
    """
    Advanced knowledge base management system that maintains
    a dynamic, conflict-aware knowledge repository
    """
    
    def __init__(self, db_path: str = "knowledge_base.db"):
        self.db_path = db_path
        self.knowledge_items: Dict[str, KnowledgeItem] = {}
        self.conflicts: Dict[str, KnowledgeConflict] = {}
        
        # Conflict detection strategies
        self.conflict_detectors = {
            "semantic": SemanticConflictDetector(),
            "temporal": TemporalConflictDetector(),
            "numerical": NumericalConflictDetector(),
            "source": SourceConflictDetector()
        }
        
        # Knowledge base statistics
        self.kb_stats = {
            "total_items": 0,
            "verified_items": 0,
            "conflicted_items": 0,
            "outdated_items": 0,
            "conflicts_resolved": 0,
            "last_cleanup": None
        }
        
        # Initialize database
        asyncio.create_task(self._initialize_database())
        
        logger.info("💾 Knowledge Updater initialized")
    
    async def _initialize_database(self):
        """Initialize SQLite database for persistent storage"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create knowledge items table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_items (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    knowledge_type TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    confidence_score REAL DEFAULT 0.0,
                    relevance_score REAL DEFAULT 0.0,
                    recency_score REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP,
                    metadata TEXT,
                    keywords TEXT,
                    entities TEXT
                )
            ''')
            
            # Create conflicts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_conflicts (
                    id TEXT PRIMARY KEY,
                    item1_id TEXT NOT NULL,
                    item2_id TEXT NOT NULL,
                    conflict_type TEXT NOT NULL,
                    description TEXT,
                    severity REAL DEFAULT 0.0,
                    resolved BOOLEAN DEFAULT FALSE,
                    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolution_date TIMESTAMP,
                    resolution_notes TEXT
                )
            ''')
            
            # Create sources table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_sources (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    url TEXT,
                    credibility TEXT DEFAULT 'unknown',
                    reliability_score REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Knowledge base database initialized")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    async def add_knowledge(self, item: KnowledgeItem) -> bool:
        """Add new knowledge item to the knowledge base"""
        try:
            logger.info(f"📝 Adding knowledge item: {item.id}")
            
            # Check for conflicts with existing knowledge
            conflicts = await self.detect_conflicts(item)
            
            if conflicts:
                logger.warning(f"⚠️ {len(conflicts)} conflicts detected for item {item.id}")
                item.status = KnowledgeStatus.CONFLICTING
                
                # Store conflicts
                for conflict in conflicts:
                    self.conflicts[conflict.id] = conflict
                    await self._persist_conflict(conflict)
            else:
                item.status = KnowledgeStatus.VERIFIED
            
            # Store the knowledge item
            self.knowledge_items[item.id] = item
            await self._persist_knowledge_item(item)
            
            # Update statistics
            self.kb_stats["total_items"] += 1
            if item.status == KnowledgeStatus.VERIFIED:
                self.kb_stats["verified_items"] += 1
            elif item.status == KnowledgeStatus.CONFLICTING:
                self.kb_stats["conflicted_items"] += 1
            
            logger.info(f"✅ Knowledge item added: {item.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add knowledge item {item.id}: {e}")
            return False
    
    async def update_knowledge(self, item: KnowledgeItem) -> bool:
        """Update existing knowledge item"""
        try:
            if item.id not in self.knowledge_items:
                logger.warning(f"Knowledge item {item.id} not found for update")
                return False
            
            logger.info(f"📝 Updating knowledge item: {item.id}")
            
            old_item = self.knowledge_items[item.id]
            
            # Update timestamps
            item.updated_at = datetime.now()
            
            # Re-check for conflicts
            conflicts = await self.detect_conflicts(item)
            
            if conflicts and old_item.status != KnowledgeStatus.CONFLICTING:
                item.status = KnowledgeStatus.CONFLICTING
                self.kb_stats["conflicted_items"] += 1
                if old_item.status == KnowledgeStatus.VERIFIED:
                    self.kb_stats["verified_items"] -= 1
            
            # Update storage
            self.knowledge_items[item.id] = item
            await self._persist_knowledge_item(item)
            
            logger.info(f"✅ Knowledge item updated: {item.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update knowledge item {item.id}: {e}")
            return False
    
    async def remove_knowledge(self, item_id: str) -> bool:
        """Remove knowledge item from knowledge base"""
        try:
            if item_id not in self.knowledge_items:
                logger.warning(f"Knowledge item {item_id} not found for removal")
                return False
            
            logger.info(f"🗑️ Removing knowledge item: {item_id}")
            
            item = self.knowledge_items[item_id]
            
            # Update statistics
            self.kb_stats["total_items"] -= 1
            if item.status == KnowledgeStatus.VERIFIED:
                self.kb_stats["verified_items"] -= 1
            elif item.status == KnowledgeStatus.CONFLICTING:
                self.kb_stats["conflicted_items"] -= 1
            
            # Remove from memory and database
            del self.knowledge_items[item_id]
            await self._remove_from_database(item_id)
            
            # Remove associated conflicts
            conflicts_to_remove = [
                conflict_id for conflict_id, conflict in self.conflicts.items()
                if conflict.item1_id == item_id or conflict.item2_id == item_id
            ]
            
            for conflict_id in conflicts_to_remove:
                del self.conflicts[conflict_id]
                await self._remove_conflict_from_database(conflict_id)
            
            logger.info(f"✅ Knowledge item removed: {item_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove knowledge item {item_id}: {e}")
            return False
    
    async def detect_conflicts(self, item: KnowledgeItem) -> List[KnowledgeConflict]:
        """Detect conflicts with existing knowledge"""
        try:
            all_conflicts = []
            
            # Run all conflict detectors
            for detector_name, detector in self.conflict_detectors.items():
                conflicts = await detector.detect_conflicts(item, self.knowledge_items)
                all_conflicts.extend(conflicts)
                logger.debug(f"{detector_name} detector found {len(conflicts)} conflicts")
            
            logger.info(f"🔍 Detected {len(all_conflicts)} total conflicts for item {item.id}")
            return all_conflicts
            
        except Exception as e:
            logger.error(f"Conflict detection failed for item {item.id}: {e}")
            return []
    
    async def resolve_conflict(self, conflict_id: str, resolution_strategy: str, 
                             resolution_notes: str = "") -> bool:
        """Resolve a knowledge conflict"""
        try:
            if conflict_id not in self.conflicts:
                logger.warning(f"Conflict {conflict_id} not found")
                return False
            
            conflict = self.conflicts[conflict_id]
            logger.info(f"🔧 Resolving conflict: {conflict_id} using {resolution_strategy}")
            
            # Apply resolution strategy
            success = await self._apply_resolution_strategy(conflict, resolution_strategy)
            
            if success:
                # Mark conflict as resolved
                conflict.resolved = True
                conflict.resolution_date = datetime.now()
                conflict.resolution_strategy = resolution_strategy
                conflict.resolution_notes = resolution_notes
                
                await self._persist_conflict(conflict)
                
                # Update statistics
                self.kb_stats["conflicts_resolved"] += 1
                
                logger.info(f"✅ Conflict resolved: {conflict_id}")
                return True
            else:
                logger.warning(f"⚠️ Failed to resolve conflict: {conflict_id}")
                return False
            
        except Exception as e:
            logger.error(f"Conflict resolution failed for {conflict_id}: {e}")
            return False
    
    async def _apply_resolution_strategy(self, conflict: KnowledgeConflict, 
                                       strategy: str) -> bool:
        """Apply specific resolution strategy"""
        try:
            item1 = self.knowledge_items.get(conflict.item1_id)
            item2 = self.knowledge_items.get(conflict.item2_id)
            
            if not item1 or not item2:
                return False
            
            if strategy == "prefer_higher_credibility":
                # Keep item from more credible source
                if item1.source.credibility.value > item2.source.credibility.value:
                    await self.remove_knowledge(conflict.item2_id)
                else:
                    await self.remove_knowledge(conflict.item1_id)
                return True
            
            elif strategy == "prefer_more_recent":
                # Keep more recent item
                if item1.created_at > item2.created_at:
                    await self.remove_knowledge(conflict.item2_id)
                else:
                    await self.remove_knowledge(conflict.item1_id)
                return True
            
            elif strategy == "merge_information":
                # Create merged item (simplified)
                merged_content = f"{item1.content} | {item2.content}"
                merged_item = create_knowledge_item(
                    content=merged_content,
                    knowledge_type=item1.type,
                    source=item1.source if item1.source.credibility.value >= item2.source.credibility.value else item2.source,
                    confidence_score=(item1.confidence_score + item2.confidence_score) / 2
                )
                
                # Remove old items and add merged one
                await self.remove_knowledge(conflict.item1_id)
                await self.remove_knowledge(conflict.item2_id)
                await self.add_knowledge(merged_item)
                return True
            
            elif strategy == "mark_disputed":
                # Mark both items as disputed
                item1.status = KnowledgeStatus.CONFLICTING
                item2.status = KnowledgeStatus.CONFLICTING
                item1.metadata["disputed"] = True
                item2.metadata["disputed"] = True
                
                await self.update_knowledge(item1)
                await self.update_knowledge(item2)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Resolution strategy application failed: {e}")
            return False
    
    async def cleanup_outdated_knowledge(self, max_age_days: int = 365) -> int:
        """Remove outdated knowledge items"""
        try:
            logger.info(f"🧹 Cleaning up knowledge older than {max_age_days} days")
            
            cutoff_date = datetime.now() - timedelta(days=max_age_days)
            outdated_items = []
            
            for item_id, item in self.knowledge_items.items():
                if item.created_at < cutoff_date and not item.updated_at:
                    outdated_items.append(item_id)
                elif item.updated_at and item.updated_at < cutoff_date:
                    outdated_items.append(item_id)
            
            # Remove outdated items
            removed_count = 0
            for item_id in outdated_items:
                if await self.remove_knowledge(item_id):
                    removed_count += 1
            
            self.kb_stats["last_cleanup"] = datetime.now()
            self.kb_stats["outdated_items"] = len(outdated_items) - removed_count
            
            logger.info(f"✅ Cleaned up {removed_count} outdated knowledge items")
            return removed_count
            
        except Exception as e:
            logger.error(f"Knowledge cleanup failed: {e}")
            return 0
    
    async def get_knowledge_statistics(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        stats = self.kb_stats.copy()
        stats.update({
            "active_conflicts": len([c for c in self.conflicts.values() if not c.resolved]),
            "resolved_conflicts": len([c for c in self.conflicts.values() if c.resolved]),
            "knowledge_types": self._get_type_distribution(),
            "credibility_distribution": self._get_credibility_distribution()
        })
        return stats
    
    def _get_type_distribution(self) -> Dict[str, int]:
        """Get distribution of knowledge types"""
        distribution = {}
        for item in self.knowledge_items.values():
            item_type = item.type.value
            distribution[item_type] = distribution.get(item_type, 0) + 1
        return distribution
    
    def _get_credibility_distribution(self) -> Dict[str, int]:
        """Get distribution of source credibility levels"""
        distribution = {}
        for item in self.knowledge_items.values():
            credibility = item.source.credibility.value
            distribution[credibility] = distribution.get(credibility, 0) + 1
        return distribution
    
    # Database persistence methods
    async def _persist_knowledge_item(self, item: KnowledgeItem):
        """Persist knowledge item to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO knowledge_items 
                (id, content, knowledge_type, source_id, confidence_score, 
                 relevance_score, recency_score, status, created_at, updated_at,
                 metadata, keywords, entities)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                item.id, item.content, item.type.value, item.source.id,
                item.confidence_score, item.relevance_score, item.recency_score,
                item.status.value, item.created_at.isoformat(),
                item.updated_at.isoformat() if item.updated_at else None,
                json.dumps(item.metadata), json.dumps(list(item.keywords)),
                json.dumps(item.entities)
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to persist knowledge item {item.id}: {e}")
    
    async def _persist_conflict(self, conflict: KnowledgeConflict):
        """Persist conflict to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO knowledge_conflicts
                (id, item1_id, item2_id, conflict_type, description, severity,
                 resolved, detected_at, resolution_date, resolution_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                conflict.id, conflict.item1_id, conflict.item2_id,
                conflict.conflict_type, conflict.description, conflict.severity,
                conflict.resolved, conflict.detected_at.isoformat(),
                conflict.resolution_date.isoformat() if conflict.resolution_date else None,
                conflict.resolution_notes
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to persist conflict {conflict.id}: {e}")
    
    async def _remove_from_database(self, item_id: str):
        """Remove knowledge item from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM knowledge_items WHERE id = ?", (item_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to remove item {item_id} from database: {e}")
    
    async def _remove_conflict_from_database(self, conflict_id: str):
        """Remove conflict from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM knowledge_conflicts WHERE id = ?", (conflict_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to remove conflict {conflict_id} from database: {e}")

# ============================================================================
# CONFLICT DETECTORS
# ============================================================================

class ConflictDetector:
    """Base class for conflict detection"""
    
    async def detect_conflicts(self, item: KnowledgeItem, 
                             existing_items: Dict[str, KnowledgeItem]) -> List[KnowledgeConflict]:
        """Detect conflicts - to be implemented by subclasses"""
        return []

class SemanticConflictDetector(ConflictDetector):
    """Detects semantic conflicts between knowledge items"""
    
    async def detect_conflicts(self, item: KnowledgeItem, 
                             existing_items: Dict[str, KnowledgeItem]) -> List[KnowledgeConflict]:
        conflicts = []
        
        for existing_id, existing_item in existing_items.items():
            if existing_id == item.id:
                continue
            
            # Simple semantic conflict detection based on contradictory keywords
            if self._are_semantically_conflicting(item.content, existing_item.content):
                conflict = KnowledgeConflict(
                    id=f"semantic_{item.id}_{existing_id}",
                    item1_id=item.id,
                    item2_id=existing_id,
                    conflict_type="semantic",
                    description=f"Semantic conflict detected between items",
                    severity=0.7
                )
                conflicts.append(conflict)
        
        return conflicts
    
    def _are_semantically_conflicting(self, content1: str, content2: str) -> bool:
        """Check if two content pieces are semantically conflicting"""
        # Simplified conflict detection based on negation patterns
        content1_lower = content1.lower()
        content2_lower = content2.lower()
        
        # Check for explicit contradictions
        contradictions = [
            ("is", "is not"), ("true", "false"), ("correct", "incorrect"),
            ("exists", "does not exist"), ("possible", "impossible")
        ]
        
        for pos, neg in contradictions:
            if pos in content1_lower and neg in content2_lower:
                return True
            if neg in content1_lower and pos in content2_lower:
                return True
        
        return False

class TemporalConflictDetector(ConflictDetector):
    """Detects temporal conflicts (conflicting dates/times)"""
    
    async def detect_conflicts(self, item: KnowledgeItem, 
                             existing_items: Dict[str, KnowledgeItem]) -> List[KnowledgeConflict]:
        conflicts = []
        
        # Extract dates from content (simplified)
        item_dates = self._extract_dates(item.content)
        
        if not item_dates:
            return conflicts
        
        for existing_id, existing_item in existing_items.items():
            if existing_id == item.id:
                continue
            
            existing_dates = self._extract_dates(existing_item.content)
            
            if existing_dates and self._dates_conflict(item_dates, existing_dates):
                conflict = KnowledgeConflict(
                    id=f"temporal_{item.id}_{existing_id}",
                    item1_id=item.id,
                    item2_id=existing_id,
                    conflict_type="temporal",
                    description="Conflicting temporal information detected",
                    severity=0.6
                )
                conflicts.append(conflict)
        
        return conflicts
    
    def _extract_dates(self, content: str) -> List[str]:
        """Extract dates from content"""
        import re
        # Simple date extraction (years)
        return re.findall(r'\b(19|20)\d{2}\b', content)
    
    def _dates_conflict(self, dates1: List[str], dates2: List[str]) -> bool:
        """Check if date lists conflict"""
        # For now, just check if they're different
        return bool(dates1) and bool(dates2) and set(dates1).isdisjoint(set(dates2))

class NumericalConflictDetector(ConflictDetector):
    """Detects numerical conflicts (conflicting numbers)"""
    
    async def detect_conflicts(self, item: KnowledgeItem, 
                             existing_items: Dict[str, KnowledgeItem]) -> List[KnowledgeConflict]:
        conflicts = []
        
        item_numbers = self._extract_numbers(item.content)
        
        if not item_numbers:
            return conflicts
        
        for existing_id, existing_item in existing_items.items():
            if existing_id == item.id:
                continue
            
            existing_numbers = self._extract_numbers(existing_item.content)
            
            if existing_numbers and self._numbers_conflict(item_numbers, existing_numbers):
                conflict = KnowledgeConflict(
                    id=f"numerical_{item.id}_{existing_id}",
                    item1_id=item.id,
                    item2_id=existing_id,
                    conflict_type="numerical",
                    description="Conflicting numerical information detected",
                    severity=0.8
                )
                conflicts.append(conflict)
        
        return conflicts
    
    def _extract_numbers(self, content: str) -> List[float]:
        """Extract numbers from content"""
        import re
        numbers = re.findall(r'\d+(?:\.\d+)?', content)
        return [float(n) for n in numbers]
    
    def _numbers_conflict(self, numbers1: List[float], numbers2: List[float]) -> bool:
        """Check if number lists conflict significantly"""
        if not numbers1 or not numbers2:
            return False
        
        # Check for significant differences (more than 10%)
        for n1 in numbers1:
            for n2 in numbers2:
                if abs(n1 - n2) / max(n1, n2) > 0.1:  # More than 10% difference
                    return True
        
        return False

class SourceConflictDetector(ConflictDetector):
    """Detects conflicts based on source credibility"""
    
    async def detect_conflicts(self, item: KnowledgeItem, 
                             existing_items: Dict[str, KnowledgeItem]) -> List[KnowledgeConflict]:
        conflicts = []
        
        # Only flag as conflict if sources have very different credibility
        # and content seems to address same topic
        
        for existing_id, existing_item in existing_items.items():
            if existing_id == item.id:
                continue
            
            # Check credibility difference
            cred_diff = abs(
                item.source.credibility.value - existing_item.source.credibility.value
            )
            
            if cred_diff >= 2:  # Significant credibility difference
                # Check if they address similar topics (simplified)
                if self._similar_topics(item.content, existing_item.content):
                    conflict = KnowledgeConflict(
                        id=f"source_{item.id}_{existing_id}",
                        item1_id=item.id,
                        item2_id=existing_id,
                        conflict_type="source_credibility",
                        description="Significant source credibility difference",
                        severity=0.4
                    )
                    conflicts.append(conflict)
        
        return conflicts
    
    def _similar_topics(self, content1: str, content2: str) -> bool:
        """Check if two contents address similar topics"""
        from .knowledge_types import extract_keywords
        
        keywords1 = extract_keywords(content1.lower())
        keywords2 = extract_keywords(content2.lower())
        
        if not keywords1 or not keywords2:
            return False
        
        overlap = keywords1.intersection(keywords2)
        union = keywords1.union(keywords2)
        
        similarity = len(overlap) / len(union) if union else 0.0
        return similarity > 0.3  # 30% keyword overlap

# ============================================================================
# TESTING
# ============================================================================

async def test_knowledge_updater():
    """Test the Knowledge Updater functionality"""
    print("💾 Testing RomAI Knowledge Updater")
    print("=" * 45)
    
    try:
        # Initialize updater
        updater = KnowledgeUpdater(db_path="test_knowledge.db")
        await asyncio.sleep(0.1)  # Allow database initialization
        
        # Test 1: Add knowledge
        print("\n📋 Test 1: Adding Knowledge Items")
        
        from .knowledge_types import create_knowledge_source, create_knowledge_item, KnowledgeType, SourceType, CredibilityLevel
        
        source1 = create_knowledge_source(
            name="Test Source 1",
            source_type=SourceType.WEB_PAGE,
            url="https://test1.com",
            credibility=CredibilityLevel.HIGH
        )
        
        item1 = create_knowledge_item(
            content="The Earth is approximately 4.5 billion years old",
            knowledge_type=KnowledgeType.FACTUAL,
            source=source1,
            confidence_score=0.9
        )
        
        result1 = await updater.add_knowledge(item1)
        print(f"✅ Added knowledge item 1: {result1}")
        
        # Add potentially conflicting item
        source2 = create_knowledge_source(
            name="Test Source 2", 
            source_type=SourceType.WEB_PAGE,
            url="https://test2.com",
            credibility=CredibilityLevel.MEDIUM
        )
        
        item2 = create_knowledge_item(
            content="The Earth is approximately 4.6 billion years old",
            knowledge_type=KnowledgeType.FACTUAL,
            source=source2,
            confidence_score=0.8
        )
        
        result2 = await updater.add_knowledge(item2)
        print(f"✅ Added knowledge item 2: {result2}")
        
        # Test 2: Conflict detection
        print("\n🔍 Test 2: Conflict Detection")
        
        conflicts = await updater.detect_conflicts(item2)
        print(f"✅ Detected {len(conflicts)} conflicts")
        
        if conflicts:
            for conflict in conflicts:
                print(f"  • {conflict.conflict_type}: {conflict.description}")
        
        # Test 3: Statistics
        print("\n📊 Test 3: Knowledge Base Statistics")
        
        stats = await updater.get_knowledge_statistics()
        print(f"✅ Statistics:")
        print(f"  • Total items: {stats['total_items']}")
        print(f"  • Verified items: {stats['verified_items']}")
        print(f"  • Conflicted items: {stats['conflicted_items']}")
        print(f"  • Active conflicts: {stats['active_conflicts']}")
        
        # Test 4: Conflict resolution
        if conflicts:
            print("\n🔧 Test 4: Conflict Resolution")
            
            conflict_id = conflicts[0].id
            resolved = await updater.resolve_conflict(
                conflict_id, 
                "prefer_higher_credibility",
                "Resolved by preferring higher credibility source"
            )
            print(f"✅ Conflict resolution: {resolved}")
        
        print("\n🎉 Knowledge Updater test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Knowledge Updater test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Knowledge Updater module loaded - Dynamic knowledge management ready!")

if __name__ == "__main__":
    asyncio.run(test_knowledge_updater())