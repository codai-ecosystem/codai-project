import asyncio
import sys
import os

sys.path.append('apps/romai/src')

from ml.memory.working_memory import WorkingMemorySystem, AttentionType, WorkingMemorySlotType

async def debug_relevance():
    print("🔍 Debugging Relevance Calculation")
    print("=" * 50)
    
    memory_system = WorkingMemorySystem()
    
    # Store test item
    item_id = await memory_system.store_active_information(
        content="Solve equation: x^2 + 5x + 6 = 0",
        slot_type=WorkingMemorySlotType.SEMANTIC,
        attention_weight=0.8,
        importance=0.9
    )
    
    # Get the node
    node = memory_system.attention_network[item_id]
    query = "equation"
    
    print(f"Node content: '{node.content}'")
    print(f"Query: '{query}'")
    
    # Step-by-step relevance calculation
    content_text = str(node.content).lower()
    query_text = query.lower()
    
    print(f"Content (lowercase): '{content_text}'")
    print(f"Query (lowercase): '{query_text}'")
    
    content_words = set(content_text.split())
    query_words = set(query_text.split())
    
    print(f"Content words: {content_words}")
    print(f"Query words: {query_words}")
    
    intersection = content_words.intersection(query_words)
    print(f"Intersection: {intersection}")
    
    overlap = len(intersection)
    print(f"Overlap count: {overlap}")
    print(f"Query words count: {len(query_words)}")
    
    if len(query_words) > 0:
        base_relevance = overlap / len(query_words)
        print(f"Base relevance: {base_relevance}")
        
        boost_factor = 0.5 + 0.3 * node.attention_weight + 0.2 * node.importance
        print(f"Boost factor: {boost_factor}")
        
        final_relevance = base_relevance * boost_factor
        print(f"Final relevance: {final_relevance}")
        
        # Call actual method to compare
        actual_relevance = await memory_system._calculate_relevance(node, query)
        print(f"Method result: {actual_relevance}")

if __name__ == "__main__":
    asyncio.run(debug_relevance())