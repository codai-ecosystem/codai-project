"""Test BitsAndBytesConfig import location"""

# Test different import locations for BitsAndBytesConfig
import sys

def test_imports():
    print("🔍 Testing BitsAndBytesConfig import locations...")
    
    # Try transformers (newer versions)
    try:
        from transformers import BitsAndBytesConfig
        print("✅ BitsAndBytesConfig found in transformers")
        return "transformers"
    except ImportError as e:
        print(f"❌ Not in transformers: {e}")
    
    # Try bitsandbytes directly
    try:
        from bitsandbytes import BitsAndBytesConfig
        print("✅ BitsAndBytesConfig found in bitsandbytes")
        return "bitsandbytes"
    except ImportError as e:
        print(f"❌ Not in bitsandbytes: {e}")
    
    # Check what's in bitsandbytes
    try:
        import bitsandbytes as bnb
        print(f"📋 bitsandbytes contents: {[x for x in dir(bnb) if 'Config' in x]}")
        print(f"📋 bitsandbytes version: {getattr(bnb, '__version__', 'unknown')}")
    except ImportError as e:
        print(f"❌ Cannot import bitsandbytes: {e}")
    
    return None

if __name__ == "__main__":
    result = test_imports()
    print(f"🎯 Result: BitsAndBytesConfig location = {result}")