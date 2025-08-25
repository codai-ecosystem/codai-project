import sys
sys.path.append('apps/romai/src')

from ml.reasoning.self_supervised_reasoning_system import ReasoningMode

print("🔍 Available ReasoningMode values:")
for mode in ReasoningMode:
    print(f"   - {mode.name}: {mode.value}")

print(f"\n🎯 ROMANIAN_CULTURAL exists: {'ROMANIAN_CULTURAL' in [mode.name for mode in ReasoningMode]}")
print(f"🎯 Full enum: {list(ReasoningMode)}")