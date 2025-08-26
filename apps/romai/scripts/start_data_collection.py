#!/usr/bin/env python3
"""
🇷🇴 RomAI Data Collection Automated Starter
Production script to begin Romanian data collection immediately

This script starts the data collection process automatically
with proper error handling and directory setup.
"""

import asyncio
import os
import sys
from pathlib import Path

async def start_automated_collection():
    """Start automated Romanian data collection with proper setup"""
    print("🇷🇴 RomAI Automated Data Collection Starting...")
    print("=" * 50)
    
    try:
        # Ensure we're in the right directory
        script_dir = Path(__file__).parent
        os.chdir(script_dir)
        
        # Import the collector
        sys.path.insert(0, str(script_dir))
        from romanian_data_collector import RomanianDataCollector
        
        # Create data directory
        data_dir = script_dir.parent / "data" / "romanian_corpus"
        data_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Data directory: {data_dir}")
        
        # Initialize collector
        collector = RomanianDataCollector(str(data_dir))
        
        print("🚀 Starting data collection (1000 docs per source for testing)...")
        print("📊 This will collect from 8 high-priority Romanian sources")
        print("⏱️ Estimated time: 30-60 minutes")
        print()
        
        # Run collection
        results = await collector.run_comprehensive_collection(max_documents_per_source=1000)
        
        # Display results
        print("\n🎉 Data collection completed successfully!")
        print("=" * 50)
        
        stats = results['final_stats']
        print(f"📊 COLLECTION SUMMARY:")
        print(f"   📄 Total Documents: {stats['total_documents']:,}")
        print(f"   💾 Total Size: {stats['total_size_gb']:.3f}GB")
        print(f"   ⭐ Average Quality: {stats['average_quality']:.2f}")
        print(f"   ⏱️ Processing Time: {results['processing_time_hours']:.1f} hours")
        
        print(f"\n📈 PROGRESS TOWARD 5TB TARGET:")
        progress = stats['collection_progress']['current_progress_percent']
        print(f"   🎯 Current Progress: {progress:.3f}%")
        print(f"   📊 Size Collected: {stats['total_size_gb']:.3f}GB / 5,000GB target")
        
        print(f"\n📂 CATEGORY BREAKDOWN:")
        for category, cat_stats in stats['category_breakdown'].items():
            print(f"   • {category.upper()}: {cat_stats['documents']} docs, {cat_stats['size_mb']:.1f}MB (Quality: {cat_stats['average_quality']:.2f})")
        
        print(f"\n📁 Data Location: {data_dir}")
        print(f"📋 Collection Log: romanian_data_collection.log")
        
        # Next steps
        print("\n🚀 NEXT STEPS:")
        print("   1. Review collected data quality")
        print("   2. Run full-scale collection (50K+ docs per source)")
        print("   3. Implement data preprocessing pipeline")
        print("   4. Begin neural network training with Romanian corpus")
        
        return True
        
    except Exception as e:
        print(f"❌ Automated collection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🇷🇴 Starting RomAI Romanian Data Collection...")
    success = asyncio.run(start_automated_collection())
    
    if success:
        print("\n✅ Collection process completed successfully!")
    else:
        print("\n❌ Collection process failed. Check logs for details.")
        
    print("\n🎯 Romanian Data Collection Status: Phase 1 Complete")
    print("📈 Ready for scale-up to 5TB+ target corpus")