#!/usr/bin/env python3
"""
RomAI Dataset Building Test Runner
Comprehensive demonstration of dataset building, preprocessing, and content collection

This script demonstrates:
- Training dataset compilation
- Content preprocessing and augmentation
- Real-time content collection
- Quality validation and scoring
- Dataset export and statistics
"""

import logging
import asyncio
import json
from pathlib import Path
import time
from datetime import datetime

# Import our dataset building modules
from dataset_builder import TrainingDatasetBuilder
from dataset_preprocessor import DatasetPreprocessor
from content_collector import ContentCollectionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatasetBuildingOrchestrator:
    """Orchestrate complete dataset building pipeline"""
    
    def __init__(self):
        self.dataset_builder = TrainingDatasetBuilder()
        self.preprocessor = DatasetPreprocessor()
        self.content_collector = ContentCollectionManager()
        
        self.pipeline_stats = {
            'start_time': None,
            'end_time': None,
            'total_duration': 0,
            'phase_durations': {},
            'total_entries_created': 0,
            'total_entries_processed': 0,
            'total_content_collected': 0,
            'quality_improvements': 0,
            'cultural_relevance_score': 0.0
        }
        
        logger.info("🚀 Dataset Building Orchestrator initialized")
    
    async def run_complete_pipeline(self):
        """Run the complete dataset building pipeline"""
        logger.info("🏗️ STARTING COMPLETE ROMAI DATASET BUILDING PIPELINE")
        logger.info("=" * 80)
        
        self.pipeline_stats['start_time'] = datetime.now()
        
        try:
            # Phase 1: Build Base Dataset
            await self._phase_1_build_base_dataset()
            
            # Phase 2: Collect Real Content
            await self._phase_2_collect_real_content()
            
            # Phase 3: Preprocess Dataset
            await self._phase_3_preprocess_dataset()
            
            # Phase 4: Generate Final Insights
            await self._phase_4_generate_insights()
            
            self.pipeline_stats['end_time'] = datetime.now()
            self.pipeline_stats['total_duration'] = (
                self.pipeline_stats['end_time'] - self.pipeline_stats['start_time']
            ).total_seconds()
            
            await self._display_final_results()
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed: {e}")
            raise
    
    async def _phase_1_build_base_dataset(self):
        """Phase 1: Build base training dataset"""
        logger.info("\n🔨 PHASE 1: BUILDING BASE TRAINING DATASET")
        logger.info("-" * 50)
        
        phase_start = time.time()
        
        # Build comprehensive dataset
        collections = await self.dataset_builder.build_comprehensive_dataset()
        
        # Calculate statistics
        total_entries = sum(len(collection.entries) for collection in collections.values())
        avg_quality = sum(
            collection.quality_stats.get('average_quality', 0.0) 
            for collection in collections.values()
        ) / len(collections)
        avg_cultural_relevance = sum(
            collection.quality_stats.get('average_cultural_relevance', 0.0) 
            for collection in collections.values()
        ) / len(collections)
        
        self.pipeline_stats['total_entries_created'] = total_entries
        self.pipeline_stats['cultural_relevance_score'] = avg_cultural_relevance
        
        phase_duration = time.time() - phase_start
        self.pipeline_stats['phase_durations']['phase_1_base_dataset'] = phase_duration
        
        logger.info(f"✅ Phase 1 completed in {phase_duration:.2f} seconds")
        logger.info(f"   Created {total_entries} training entries")
        logger.info(f"   Average quality score: {avg_quality:.3f}")
        logger.info(f"   Average cultural relevance: {avg_cultural_relevance:.3f}")
        
        # Export base dataset
        output_file = await self.dataset_builder.export_dataset_for_training()
        logger.info(f"   Exported dataset to: {output_file}")
    
    async def _phase_2_collect_real_content(self):
        """Phase 2: Collect real Romanian content"""
        logger.info("\n📡 PHASE 2: COLLECTING REAL ROMANIAN CONTENT")
        logger.info("-" * 50)
        
        phase_start = time.time()
        
        # Initialize content sources
        await self.content_collector.initialize_default_sources()
        
        # Collect sample content
        collected_content = await self.content_collector.collect_sample_content()
        
        self.pipeline_stats['total_content_collected'] = len(collected_content)
        
        phase_duration = time.time() - phase_start
        self.pipeline_stats['phase_durations']['phase_2_content_collection'] = phase_duration
        
        logger.info(f"✅ Phase 2 completed in {phase_duration:.2f} seconds")
        logger.info(f"   Collected {len(collected_content)} content pieces")
        
        if collected_content:
            avg_quality = sum(c.quality_score for c in collected_content) / len(collected_content)
            avg_cultural = sum(c.cultural_relevance for c in collected_content) / len(collected_content)
            logger.info(f"   Average content quality: {avg_quality:.3f}")
            logger.info(f"   Average cultural relevance: {avg_cultural:.3f}")
    
    async def _phase_3_preprocess_dataset(self):
        """Phase 3: Preprocess and augment dataset"""
        logger.info("\n🛠️ PHASE 3: PREPROCESSING AND AUGMENTING DATASET")
        logger.info("-" * 50)
        
        phase_start = time.time()
        
        # Run preprocessing
        preprocessing_stats = await self.preprocessor.preprocess_dataset()
        
        self.pipeline_stats['total_entries_processed'] = preprocessing_stats['total_processed']
        self.pipeline_stats['quality_improvements'] = preprocessing_stats['quality_improvements']
        
        phase_duration = time.time() - phase_start
        self.pipeline_stats['phase_durations']['phase_3_preprocessing'] = phase_duration
        
        logger.info(f"✅ Phase 3 completed in {phase_duration:.2f} seconds")
        logger.info(f"   Processed {preprocessing_stats['total_processed']} entries")
        logger.info(f"   Created {preprocessing_stats['augmented_entries']} augmented variants")
        logger.info(f"   Found {preprocessing_stats['cultural_markers_found']} cultural markers")
        logger.info(f"   Quality improvements: {preprocessing_stats['quality_improvements']}")
    
    async def _phase_4_generate_insights(self):
        """Phase 4: Generate comprehensive insights"""
        logger.info("\n🔍 PHASE 4: GENERATING COMPREHENSIVE INSIGHTS")
        logger.info("-" * 50)
        
        phase_start = time.time()
        
        # Get insights from all systems
        dataset_insights = await self.dataset_builder.get_dataset_insights()
        preprocessing_insights = await self.preprocessor.get_preprocessing_insights()
        collection_insights = await self.content_collector.get_collection_insights()
        
        # Combine insights
        self.comprehensive_insights = {
            'dataset_insights': dataset_insights,
            'preprocessing_insights': preprocessing_insights,
            'collection_insights': collection_insights,
            'pipeline_statistics': self.pipeline_stats
        }
        
        phase_duration = time.time() - phase_start
        self.pipeline_stats['phase_durations']['phase_4_insights'] = phase_duration
        
        logger.info(f"✅ Phase 4 completed in {phase_duration:.2f} seconds")
        logger.info("   Generated comprehensive system insights")
    
    async def _display_final_results(self):
        """Display final pipeline results"""
        logger.info("\n🎯 FINAL PIPELINE RESULTS")
        logger.info("=" * 50)
        
        # Pipeline summary
        logger.info(f"📊 Pipeline Summary:")
        logger.info(f"   Total execution time: {self.pipeline_stats['total_duration']:.2f} seconds")
        logger.info(f"   Entries created: {self.pipeline_stats['total_entries_created']}")
        logger.info(f"   Entries processed: {self.pipeline_stats['total_entries_processed']}")
        logger.info(f"   Content collected: {self.pipeline_stats['total_content_collected']}")
        logger.info(f"   Quality improvements: {self.pipeline_stats['quality_improvements']}")
        logger.info(f"   Cultural relevance score: {self.pipeline_stats['cultural_relevance_score']:.3f}")
        
        # Phase breakdown
        logger.info(f"\n⏱️ Phase Execution Times:")
        for phase, duration in self.pipeline_stats['phase_durations'].items():
            percentage = (duration / self.pipeline_stats['total_duration']) * 100
            logger.info(f"   {phase.replace('_', ' ').title()}: {duration:.2f}s ({percentage:.1f}%)")
        
        # Dataset composition
        dataset_summary = self.comprehensive_insights['dataset_insights']['dataset_summary']
        logger.info(f"\n📚 Final Dataset Composition:")
        logger.info(f"   Total entries: {dataset_summary['total_entries']}")
        logger.info(f"   Total collections: {dataset_summary['total_collections']}")
        logger.info(f"   Average quality: {dataset_summary['average_quality_score']:.3f}")
        logger.info(f"   Average cultural relevance: {dataset_summary['average_cultural_relevance']:.3f}")
        
        # Content distribution
        content_dist = self.comprehensive_insights['dataset_insights']['content_distribution']
        logger.info(f"\n📋 Content Type Distribution:")
        for content_type, count in content_dist.items():
            logger.info(f"   {content_type}: {count} entries")
        
        # Quality distribution
        preprocessing_summary = self.comprehensive_insights['preprocessing_insights']['preprocessing_summary']
        quality_metrics = self.comprehensive_insights['preprocessing_insights']['quality_metrics']
        logger.info(f"\n🏆 Quality Metrics:")
        logger.info(f"   Processed entries: {preprocessing_summary['total_processed_entries']}")
        logger.info(f"   Augmented variants: {preprocessing_summary['total_augmented_variants']}")
        logger.info(f"   Average complexity: {quality_metrics['average_complexity_score']:.3f}")
        logger.info(f"   Average readability: {quality_metrics['average_readability_score']:.3f}")
        
        # Cultural analysis
        cultural_analysis = self.comprehensive_insights['preprocessing_insights']['cultural_analysis']
        logger.info(f"\n🎭 Cultural Analysis:")
        logger.info(f"   Total cultural markers: {cultural_analysis['total_cultural_markers']}")
        logger.info(f"   Unique markers: {cultural_analysis['unique_cultural_markers']}")
        
        logger.info(f"\n🏆 Top Cultural Markers:")
        for marker, count in list(cultural_analysis['top_cultural_markers'].items())[:5]:
            logger.info(f"   {marker}: {count} occurrences")
        
        # Collection insights
        collection_summary = self.comprehensive_insights['collection_insights']['collection_summary']
        logger.info(f"\n📡 Content Collection Summary:")
        logger.info(f"   Content pieces collected: {collection_summary['total_content_pieces']}")
        logger.info(f"   Average quality: {collection_summary['average_quality_score']:.3f}")
        logger.info(f"   Average cultural relevance: {collection_summary['average_cultural_relevance']:.3f}")
        logger.info(f"   Average educational value: {collection_summary['average_educational_value']:.3f}")
        
        # Success metrics
        logger.info(f"\n🎯 Success Metrics:")
        
        total_content = (
            self.pipeline_stats['total_entries_created'] + 
            self.pipeline_stats['total_content_collected']
        )
        
        high_quality_ratio = (
            self.pipeline_stats['quality_improvements'] / 
            max(1, self.pipeline_stats['total_entries_processed'])
        )
        
        efficiency_score = total_content / max(1, self.pipeline_stats['total_duration']) * 60  # per minute
        
        logger.info(f"   Total content generated: {total_content} pieces")
        logger.info(f"   High quality ratio: {high_quality_ratio:.1%}")
        logger.info(f"   Processing efficiency: {efficiency_score:.1f} entries/minute")
        logger.info(f"   Cultural authenticity: {self.pipeline_stats['cultural_relevance_score']:.1%}")
        
        # Export final insights
        insights_file = Path("romai_dataset_insights.json")
        with open(insights_file, 'w', encoding='utf-8') as f:
            json.dump(self.comprehensive_insights, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"\n💾 Comprehensive insights exported to: {insights_file}")
        
        # Determine overall success
        success_criteria = {
            'sufficient_content': total_content >= 50,
            'good_quality': dataset_summary['average_quality_score'] >= 0.7,
            'cultural_authenticity': self.pipeline_stats['cultural_relevance_score'] >= 0.8,
            'processing_efficiency': efficiency_score >= 10.0,
            'pipeline_completion': all(self.pipeline_stats['phase_durations'].values())
        }
        
        success_count = sum(success_criteria.values())
        success_rate = success_count / len(success_criteria)
        
        logger.info(f"\n🎯 SUCCESS CRITERIA EVALUATION:")
        for criterion, passed in success_criteria.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            logger.info(f"   {criterion.replace('_', ' ').title()}: {status}")
        
        logger.info(f"\n🏆 OVERALL SUCCESS RATE: {success_rate:.1%} ({success_count}/{len(success_criteria)})")
        
        if success_rate >= 0.8:
            logger.info("🎉 DATASET BUILDING PIPELINE: EXCELLENT SUCCESS!")
        elif success_rate >= 0.6:
            logger.info("✅ DATASET BUILDING PIPELINE: GOOD SUCCESS!")
        else:
            logger.info("⚠️ DATASET BUILDING PIPELINE: PARTIAL SUCCESS - IMPROVEMENTS NEEDED")

async def main():
    """Main execution function"""
    logger.info("🚀 ROMAI DATASET BUILDING COMPREHENSIVE DEMONSTRATION")
    logger.info("=" * 80)
    
    try:
        # Create and run the orchestrator
        orchestrator = DatasetBuildingOrchestrator()
        await orchestrator.run_complete_pipeline()
        
        logger.info("\n🎊 DEMONSTRATION COMPLETED SUCCESSFULLY!")
        
    except Exception as e:
        logger.error(f"❌ Demonstration failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())