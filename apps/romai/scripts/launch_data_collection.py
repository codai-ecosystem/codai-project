#!/usr/bin/env python3
"""
🇷🇴 Romanian Data Collection Launcher Script
Quick launcher for the comprehensive Romanian data collection system

This script provides an easy interface to start collecting Romanian data
for training the world-class RomAI system.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

async def quick_test_collection():
    """Run a quick test collection from high-priority Romanian sources"""
    print("🇷🇴 RomAI Data Collection - Quick Test")
    print("=" * 40)
    
    try:
        from romanian_data_collector import RomanianDataCollector
        
        collector = RomanianDataCollector("./data/test_romanian_corpus")
        
        # Test with just a few documents per source
        print("🚀 Starting test collection (100 docs per source)...")
        results = await collector.run_comprehensive_collection(max_documents_per_source=100)
        
        print("\n✅ Test collection complete!")
        print("📊 Results:")
        for result in results['collection_results']:
            print(f"  • {result['source_name']}: {result['documents_collected']} docs, {result['total_size_mb']:.1f}MB")
        
        stats = results['final_stats']
        print(f"\n📈 Total: {stats['total_documents']} documents, {stats['total_size_gb']:.3f}GB")
        print(f"⭐ Average Quality: {stats['average_quality']:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test collection failed: {e}")
        return False

async def full_collection():
    """Run full-scale Romanian data collection"""
    print("🇷🇴 RomAI Data Collection - Full Scale")
    print("=" * 45)
    print("⚠️ This will collect thousands of documents")
    print("⚠️ Estimated time: 2-6 hours")
    
    confirm = input("\nProceed with full collection? (y/N): ")
    if confirm.lower() != 'y':
        print("Collection cancelled.")
        return
    
    try:
        from romanian_data_collector import RomanianDataCollector
        
        collector = RomanianDataCollector("./data/romanian_corpus_full")
        
        print("🚀 Starting full-scale collection (50K docs per source)...")
        results = await collector.run_comprehensive_collection(max_documents_per_source=50000)
        
        print("\n🎉 Full collection complete!")
        stats = results['final_stats']
        print(f"📊 Final Stats:")
        print(f"   📄 Documents: {stats['total_documents']:,}")
        print(f"   💾 Size: {stats['total_size_gb']:.2f}GB") 
        print(f"   ⭐ Quality: {stats['average_quality']:.2f}")
        print(f"   ⏱️ Time: {results['processing_time_hours']:.1f} hours")
        print(f"   🎯 Progress: {stats['collection_progress']['current_progress_percent']:.1f}% of 5TB target")
        
        return True
        
    except Exception as e:
        print(f"❌ Full collection failed: {e}")
        return False

def main():
    """Main launcher interface"""
    print("🇷🇴 RomAI Romanian Data Collection System")
    print("World-Class Data Gathering for Romanian AGI Supremacy")
    print("=" * 55)
    print()
    print("Options:")
    print("1. Quick Test Collection (100 docs per source)")
    print("2. Full Scale Collection (50K docs per source)")
    print("3. Exit")
    print()
    
    choice = input("Select option (1-3): ").strip()
    
    if choice == "1":
        asyncio.run(quick_test_collection())
    elif choice == "2":
        asyncio.run(full_collection())
    elif choice == "3":
        print("Goodbye!")
    else:
        print("Invalid option. Please try again.")
        main()

if __name__ == "__main__":
    main()