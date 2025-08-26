"""
Debug test logic for Phase 3 Romanian integration
"""

# Sample result that's failing
sample_result = """🇷🇴 **Răspuns în Context Românesc**

**Soluția:** x = ±4.0

**Context Educațional:** În sistemul educațional românesc, algebra este studiată începând din clasa a VII-a, cu accent pe ecuațiile de gradul întâi și al doilea în liceu.

**Terminologie Matematică Românească:**

**Referințe Culturale:**
• Școala Românească de Matematică
• Academia Română - Secția de Științe Matematice
• tradiția algebrică românească

**Explicație:** Această problemă se rezolvă folosind principiile matematice din tradiția educațională românească, cu aplicare practică în sistemul de învățământ național."""

print("🔍 DEBUGGING TEST LOGIC")
print("=" * 50)

result_str = sample_result.lower()
print(f"Result string (lowercase): {result_str[:100]}...")
print()

print("Checking conditions:")
print(f"1. 'error' not in result: {'error' not in result_str}")
print(f"2. 'soluția:' in result: {'soluția:' in result_str}")
print(f"3. '=' in result: {'=' in result_str}")
print(f"4. Has digits: {any(char.isdigit() for char in result_str)}")
print()

# Test the logic
error_check = "error" not in result_str
content_check = "soluția:" in result_str or "=" in result_str or any(char.isdigit() for char in result_str)

print(f"Should pass test: {error_check and content_check}")

# Test with actual confidence check (simulate confidence > 0.3)
confidence = 0.95
confidence_check = confidence > 0.3

print(f"Confidence check: {confidence_check}")
print(f"Final result: {error_check and confidence_check and content_check}")