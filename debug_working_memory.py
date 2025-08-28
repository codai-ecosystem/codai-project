import asyncio
import sys
import os

sys.path.append('apps/romai/src')

from ml.memory.working_memory import WorkingMemorySystem, AttentionType, WorkingMemorySlotType

async def debug_working_memory():
    print("🔍 Debugging Working Memory Retrieval")
    print("=" * 50)
    
    memory_system = WorkingMemorySystem()
    
    # Store test items
    print("\n📝 Storing test items...")
    item1_id = await memory_system.store_active_information(
        content="Solve equation: x^2 + 5x + 6 = 0",
        slot_type=WorkingMemorySlotType.SEMANTIC,
        attention_weight=0.8,
        importance=0.9
    )
    print(f"Item 1 ID: {item1_id}")
    
    item2_id = await memory_system.store_active_information(
        content="Remember to review calculus derivatives",
        slot_type=WorkingMemorySlotType.EPISODIC,
        attention_weight=0.6,
        importance=0.7
    )
    print(f"Item 2 ID: {item2_id}")
    
    # Check attention network
    print(f"\n🧠 Attention network has {len(memory_system.attention_network)} nodes")
    for node_id, node in memory_system.attention_network.items():
        print(f"Node {node_id}: content='{node.content}' weight={node.attention_weight}")
    
    # Test relevance calculation
    print("\n🎯 Testing relevance calculations...")
    for node_id, node in memory_system.attention_network.items():
        relevance = await memory_system._calculate_relevance(node, "equation")
        print(f"Node {node_id}: relevance={relevance:.3f} for query 'equation'")
        print(f"  Content: '{node.content}'")
        print(f"  Weight: {node.attention_weight}, Importance: {node.importance}")
    
    # Test retrieval
    print("\n🔍 Testing retrieval...")
    retrieved_items = await memory_system.retrieve_active_information(
        query="equation",
        attention_type=AttentionType.SELECTIVE,
        max_items=3
    )
    print(f"Retrieved {len(retrieved_items)} items")
    for item in retrieved_items:
        print(f"  - {item}")

if __name__ == "__main__":
    asyncio.run(debug_working_memory())