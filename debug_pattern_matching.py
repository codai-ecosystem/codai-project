#!/usr/bin/env python3
"""Debug conditional reasoning pattern matching"""

import re

def debug_conditional_parsing():
    print("🔍 DEBUGGING CONDITIONAL REASONING PATTERNS")
    print("=" * 60)
    
    # Test case that's failing
    problem = "If it rains, the ground gets wet. The ground is wet. Did it rain?"
    
    print(f"Original problem: {problem}")
    
    # Show sentence splitting
    sentences = [s.strip() for s in problem.split('.') if s.strip()]
    print(f"Sentences after split: {sentences}")
    
    if len(sentences) >= 2:
        premise1 = sentences[0]
        premise2 = sentences[1] if not sentences[1].endswith('?') else sentences[1].rstrip('?')
        question = sentences[2] if len(sentences) > 2 and sentences[2].endswith('?') else None
        
        print(f"Premise1: '{premise1}'")
        print(f"Premise2: '{premise2}'")
        print(f"Question: '{question}'")
        
        # Test the regex pattern - handle comma format
        if "if " in premise1.lower() and (" then " in premise1.lower() or "," in premise1.lower()):
            print("✅ Detected if-then or if-comma pattern")
            # Handle both "if P then Q" and "if P, Q" patterns
            if " then " in premise1.lower():
                match = re.search(r'if (.+?) then (.+)', premise1.lower())
            else:
                match = re.search(r'if (.+?), (.+)', premise1.lower())
                
            if match:
                print("✅ Regex matched!")
                P = match.group(1).strip()
                Q = match.group(2).strip()
                print(f"P (antecedent): '{P}'")
                print(f"Q (consequent): '{Q}'")
                
                # Test consequent matching
                print(f"Checking if Q '{Q}' is in premise2 '{premise2.lower()}'")
                if Q.lower() in premise2.lower() and "not " not in premise2.lower():
                    print("✅ This should be affirming consequent!")
                else:
                    print("❌ Pattern not matching correctly")
            else:
                print("❌ Regex failed to match")
        else:
            print("❌ No if-then/comma pattern detected")

def debug_deduction_parsing():
    print("\n🔍 DEBUGGING DEDUCTION REASONING PATTERNS")  
    print("=" * 60)
    
    problem = "All birds can fly. Penguins are birds. Can penguins fly?"
    
    print(f"Original problem: {problem}")
    
    sentences = [s.strip() for s in problem.split('.') if s.strip()]
    print(f"Sentences after split: {sentences}")
    
    if len(sentences) >= 2:
        premise1 = sentences[0]
        premise2 = sentences[1]
        
        print(f"Premise1: '{premise1}'")
        print(f"Premise2: '{premise2}'")
        
        # Test universal pattern - handle "can" format
        if "all " in premise1.lower() and (" are " in premise1.lower() or " can " in premise1.lower()):
            print("✅ Detected universal pattern")
            if " are " in premise1.lower():
                match1 = re.search(r'all (.+?) are (.+)', premise1.lower())
            else:
                match1 = re.search(r'all (.+?) can (.+)', premise1.lower())
                
            if match1:
                A = match1.group(1).strip()
                B = match1.group(2).strip()
                print(f"A (subject): '{A}'")
                print(f"B (predicate): '{B}'")
                
                # Test second premise patterns
                if " is " in premise2.lower() or " are " in premise2.lower():
                    print("✅ Detected linking verb in premise2")
                    if " are " in premise2.lower():
                        match2 = re.search(r'(.+?) are (?:a |an )?(.+)', premise2.lower())
                        if match2:
                            X = match2.group(1).strip()
                            X_type = match2.group(2).strip()
                            print(f"X (instance): '{X}'")
                            print(f"X_type (category): '{X_type}'")
                            
                            # Test matching logic - enhanced
                            if (X_type == A or X_type in A or A in X_type or 
                                X_type.rstrip('s') == A or A == X_type.rstrip('s')):
                                print(f"✅ Category matching: '{X_type}' matches '{A}'")
                            else:
                                print(f"❌ Category mismatch: '{X_type}' vs '{A}'")
                                # Debug the specific mismatch
                                print(f"X_type == A: {X_type == A}")
                                print(f"X_type in A: {X_type in A}")
                                print(f"A in X_type: {A in X_type}")
                                print(f"X_type.rstrip('s') == A: {X_type.rstrip('s') == A}")
                                print(f"A == X_type.rstrip('s'): {A == X_type.rstrip('s')}")
                        else:
                            print("❌ 'are' pattern failed to match")
                else:
                    print("❌ No linking verb detected")
            else:
                print("❌ Universal regex failed")
        else:
            print("❌ No universal pattern detected")

if __name__ == "__main__":
    debug_conditional_parsing()
    debug_deduction_parsing()