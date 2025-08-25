import sys
import os
import importlib
import inspect

sys.path.append('apps/romai/src')

def comprehensive_reasoning_system_analysis():
    print("🔍 COMPREHENSIVE REASONING SYSTEM ANALYSIS")
    print("=" * 60)
    
    # 1. Check file existence
    file_path = 'apps/romai/src/ml/reasoning/self_supervised_reasoning_system.py'
    print(f"📁 File exists: {os.path.exists(file_path)}")
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"📏 File size: {len(content)} characters")
        print(f"🔍 Contains 'reason_through_problem': {'reason_through_problem' in content}")
        
        # Count method definitions
        method_count = content.count('def reason_through_problem')
        print(f"🔢 Method definition count: {method_count}")
    
    # 2. Test import directly
    print("\n🔄 TESTING IMPORT...")
    try:
        # Import the module directly
        import ml.reasoning.self_supervised_reasoning_system as reasoning_module
        print(f"✅ Module imported: {reasoning_module}")
        print(f"📍 Module file: {reasoning_module.__file__}")
        
        # Check class
        cls = reasoning_module.SelfSupervisedReasoningSystem
        print(f"✅ Class found: {cls}")
        print(f"📍 Class module: {cls.__module__}")
        print(f"📍 Class file: {inspect.getfile(cls)}")
        
        # Check method
        has_method = hasattr(cls, 'reason_through_problem')
        print(f"🎯 Class has method: {has_method}")
        
        if has_method:
            method = getattr(cls, 'reason_through_problem')
            print(f"🔍 Method: {method}")
            print(f"🔍 Method type: {type(method)}")
            
            # Check method source
            try:
                source = inspect.getsource(method)
                print(f"📝 Method source length: {len(source)} characters")
                print(f"📝 First 200 chars: {source[:200]}")
            except Exception as e:
                print(f"❌ Could not get method source: {e}")
        
        # Test instance creation
        print("\n🧪 TESTING INSTANCE CREATION...")
        instance = cls()
        print(f"✅ Instance created: {instance}")
        print(f"🔍 Instance type: {type(instance)}")
        print(f"🔍 Instance has method: {hasattr(instance, 'reason_through_problem')}")
        
        # Test all methods
        methods = [m for m in dir(instance) if not m.startswith('_')]
        print(f"📋 All methods: {methods}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_server_import_pattern():
    print("\n" + "=" * 60)
    print("🖥️  TESTING SERVER IMPORT PATTERN")
    print("=" * 60)
    
    try:
        # Test the exact server import pattern
        from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem as ActualReasoningSystem
        from ml.reasoning.self_supervised_reasoning_system import ReasoningMode, ReasoningResult
        
        print(f"✅ ActualReasoningSystem: {ActualReasoningSystem}")
        print(f"✅ ReasoningMode: {ReasoningMode}")
        print(f"✅ ReasoningResult: {ReasoningResult}")
        
        # Replace as server does
        SelfSupervisedReasoningSystem = ActualReasoningSystem
        print(f"✅ After replacement: {SelfSupervisedReasoningSystem}")
        
        # Test instance
        instance = SelfSupervisedReasoningSystem()
        print(f"✅ Server pattern instance: {instance}")
        print(f"🔍 Has method: {hasattr(instance, 'reason_through_problem')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Server pattern failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_for_conflicts():
    print("\n" + "=" * 60)
    print("🔍 CHECKING FOR NAMING CONFLICTS")
    print("=" * 60)
    
    # Check if there are multiple files with similar names
    search_dirs = ['apps/romai/src']
    found_files = []
    
    for search_dir in search_dirs:
        for root, dirs, files in os.walk(search_dir):
            for file in files:
                if 'reasoning' in file.lower() and 'system' in file.lower():
                    found_files.append(os.path.join(root, file))
    
    print(f"📁 Files with 'reasoning' and 'system': {len(found_files)}")
    for file in found_files:
        print(f"   - {file}")
    
    return found_files

if __name__ == "__main__":
    print("🚀 Starting comprehensive analysis...\n")
    
    # Run all tests
    success1 = comprehensive_reasoning_system_analysis()
    success2 = test_server_import_pattern()
    conflicts = check_for_conflicts()
    
    print("\n" + "=" * 60)
    print("📊 ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"✅ Direct import test: {'PASS' if success1 else 'FAIL'}")
    print(f"✅ Server pattern test: {'PASS' if success2 else 'FAIL'}")
    print(f"📁 Potential conflicts: {len(conflicts)} files found")
    
    if success1 and success2:
        print("\n🎯 CONCLUSION: The class and method work correctly in isolation.")
        print("🤔 The server issue is likely related to runtime object storage or process isolation.")
    else:
        print("\n❌ CONCLUSION: Found fundamental issues with the class or import.")