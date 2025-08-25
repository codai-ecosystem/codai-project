#!/usr/bin/env python3

"""
Test script for enhanced Romanian cultural intelligence system
Tests the comprehensive cultural dataset integration
"""

import sys
import os
sys.path.append('e:/GitHub/codai-project/apps/romai/src')

import asyncio
from ml.reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

async def test_romanian_cultural_system():
    """Test the enhanced Romanian cultural system"""
    
    print("🇷🇴 Testing Enhanced Romanian Cultural Intelligence System")
    print("=" * 60)
    
    # Initialize engine
    engine = AutonomousRomanianEngine()
    
    # Test 1: Check if comprehensive dataset is available
    print("1. Comprehensive Dataset Status:")
    if engine.is_comprehensive_dataset_available():
        print("   ✅ Comprehensive Romanian cultural dataset loaded")
        summary = engine.get_cultural_knowledge_summary()
        print(f"   📚 Total cultural entries: {summary.get('total_entries', 0)}")
        print(f"   🎭 Available domains: {len(summary.get('available_domains', []))}")
    else:
        print("   ⚠️ Using fallback cultural knowledge")
    
    print()
    
    # Test 2: Search for specific Romanian cultural elements
    print("2. Testing Cultural Search:")
    test_queries = [
        "Mihai Eminescu",
        "sarmale",
        "Carpați", 
        "Crăciun",
        "Brâncuși"
    ]
    
    for query in test_queries:
        print(f"   Search: '{query}'")
        info = engine.get_comprehensive_cultural_info(query, max_results=2)
        if info:
            for item in info:
                print(f"     - {item['domain'].title()}: {item['title']}")
                print(f"       {item['description'][:100]}...")
        else:
            print(f"     No results found")
        print()
    
    # Test 3: Random cultural insights
    print("3. Random Cultural Insights:")
    domains = ['history', 'traditions', 'cuisine', 'arts', 'literature']
    
    for domain in domains:
        insight = engine.get_random_cultural_insight(domain)
        if insight:
            print(f"   {domain.title()}: {insight['title']}")
            print(f"   {insight['description'][:120]}...")
        print()
    
    # Test 4: Process Romanian cultural queries
    print("4. Processing Romanian Cultural Queries:")
    test_texts = [
        "Spune-mi despre tradițiile de Crăciun din România",
        "Ce știi despre Mihai Eminescu și poezia românească?",
        "Explicați istoria Daciei și a dacilor",
        "Care sunt preparatele tradiționale românești?",
        "Describe Romanian cultural heritage"
    ]
    
    for text in test_texts:
        print(f"   Query: '{text}'")
        try:
            response = await engine.process_romanian_query(text)
            print(f"   Response: {response.response[:150]}...")
            print(f"   Cultural Context: {len(response.cultural_context)} elements")
            print(f"   Confidence: {response.confidence:.2f}")
            print(f"   Method: {response.method}")
        except Exception as e:
            print(f"   Error: {e}")
        print()
    
    # Test 5: Cultural knowledge summary
    print("5. Cultural Knowledge Summary:")
    summary = engine.get_cultural_knowledge_summary()
    for key, value in summary.items():
        if isinstance(value, dict) and 'total_items' in value:
            print(f"   {key}: {value['total_items']} items")
        elif isinstance(value, (int, str)):
            print(f"   {key}: {value}")
    
    print("=" * 60)
    print("✅ Romanian Cultural Intelligence System Test Complete")

if __name__ == "__main__":
    asyncio.run(test_romanian_cultural_system())