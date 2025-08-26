#!/usr/bin/env python3
"""
Fixed Romanian Data Collection Launcher
Resolves Unicode encoding issues on Windows systems
"""

import os
import sys
import asyncio
from pathlib import Path

# Fix Windows console encoding issues
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# Add project paths
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root / "apps" / "romai" / "src"))
sys.path.insert(0, str(project_root / "apps" / "romai" / "scripts"))

async def start_collection():
    """Start the Romanian data collection with fixed encoding"""
    
    # Import after path setup
    from romanian_data_collector_fixed import RomanianDataCollector
    
    print("RomAI Romanian Data Collection Starting...")
    print("=========================================")
    
    # Setup data directory
    data_dir = project_root / "apps" / "romai" / "data" / "romanian_corpus"
    data_dir.mkdir(parents=True, exist_ok=True)
    print(f"Data directory: {data_dir}")
    
    try:
        # Initialize collector (this will fix the logging)
        collector = RomanianDataCollector(str(data_dir))
        print("Romanian Data Collector initialized successfully")
        
        # Start collection with reduced logging
        print("Starting data collection (100 docs per source for testing)...")
        print("This will collect from 8 high-priority Romanian sources")
        print("Estimated time: 15-30 minutes")
        print("")
        
        results = await collector.run_comprehensive_collection(max_documents_per_source=100)
        
        print("")
        print("COLLECTION COMPLETED!")
        print("====================")
        
        total_docs = sum(r.documents_collected for r in results)
        total_size = sum(r.total_size_mb for r in results)
        
        print(f"Total documents collected: {total_docs}")
        print(f"Total data size: {total_size:.2f} MB")
        print(f"Success rate: {len([r for r in results if r.success])} / {len(results)} sources")
        
        # Save results summary
        summary_file = data_dir / "collection_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump({
                'collection_date': datetime.now().isoformat(),
                'total_documents': total_docs,
                'total_size_mb': total_size,
                'sources_processed': len(results),
                'successful_sources': len([r for r in results if r.success]),
                'results': [
                    {
                        'source_name': r.source_name,
                        'documents_collected': r.documents_collected,
                        'total_size_mb': r.total_size_mb,
                        'success': r.success,
                        'error_message': r.error_message,
                        'collection_time_seconds': r.collection_time_seconds
                    } for r in results
                ]
            }, f, ensure_ascii=False, indent=2)
            
        print(f"Collection summary saved to: {summary_file}")
        print("Data collection phase successful!")
        
        return True
        
    except Exception as e:
        print(f"ERROR during data collection: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import json
    from datetime import datetime
    
    success = asyncio.run(start_collection())
    
    if success:
        print("")
        print("SUCCESS: Romanian data collection completed!")
        print("Next: Scale up to full 5TB+ collection for world-class AGI")
    else:
        print("")
        print("FAILED: Please check error messages above")