from src.ml.models.romanian_cpu_processor import RomanianLanguageProcessor
import json

def demo_romanian_processor():
    """Demonstrate the Romanian processor capabilities"""
    
    processor = RomanianLanguageProcessor()
    test_query = "Salut! Sunt din Cluj-Napoca și mă interesează istoria lui Ștefan cel Mare."
    
    print("=== RomAI Processor Demo ===")
    print(f"Query: {test_query}")
    print()
    
    result = processor.process_text(test_query)
    print("Cultural Entities Found:")
    print(json.dumps(result['cultural_entities'], indent=2, ensure_ascii=False))
    
    print(f"Dialect Scores: {result['dialect_scores']}")
    
    response = processor.generate_response(test_query)
    print(f"Generated Response: {response}")
    print("=== Demo Complete ===")

if __name__ == "__main__":
    demo_romanian_processor()
